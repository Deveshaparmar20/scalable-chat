const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const Message = require('./models/Message');
const { client: redisClient, CACHE_TTL, HISTORY_PREFIX } = require('./config/redis');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
connectDB();

// --- Routes ---

// @route   GET /history/:roomId
// @desc    Get chat history for a specific room
app.get('/history/:roomId', async (req, res) => {
    try {
        const { roomId } = req.params;
        const cacheKey = `${HISTORY_PREFIX}${roomId}`;

        // Try to get from cache first
        const cachedHistory = await redisClient.get(cacheKey);
        if (cachedHistory) {
            console.log(`Cache hit for room ${roomId}`);
            return res.json(JSON.parse(cachedHistory));
        }

        console.log(`Cache miss for room ${roomId}, fetching from DB`);
        // If not in cache, get from DB
        const messages = await Message.find({ roomId })
            .sort({ timestamp: 1 })
            .limit(50);

        // Store in cache with TTL
        await redisClient.set(cacheKey, JSON.stringify(messages), {
            EX: CACHE_TTL
        });

        res.json(messages);
    } catch (error) {
        console.error('Error fetching history:', error);
        res.status(500).json({ message: 'Error fetching chat history' });
    }
});

// @route   GET /health
// @desc    Health check
app.get('/health', (req, res) => {
    const status = {
        service: 'healthy',
        redis: redisClient.isOpen ? 'connected' : 'disconnected'
    };
    res.json(status);
});

const PORT = process.env.PORT || 3002; // Use port 3002
app.listen(PORT, () => console.log(`Message Service running on port ${PORT}`));

// RabbitMQ Consumer Logic - persist messages published by chat-service
const amqp = require('amqplib');

async function startConsumerWithRetry(retries = 20, delayMs = 3000) {
    const url = process.env.RABBITMQ_URL || 'amqp://rabbitmq';
    for (let i = 0; i < retries; i++) {
        try {
            const conn = await amqp.connect(url);
            const channel = await conn.createChannel();

            await channel.assertExchange('chat_exchange', 'topic', { durable: true });

            // Create a durable queue for message persistence
            const q = await channel.assertQueue('message_persist_queue', { durable: true });
            console.log('Message Service consumer waiting for messages in %s', q.queue);

            // Bind to all 'messages.*' topics
            await channel.bindQueue(q.queue, 'chat_exchange', 'messages.*');

            channel.consume(q.queue, async (msg) => {
                if (msg && msg.content) {
                    try {
                        const message = JSON.parse(msg.content.toString());
                        console.log(' [x] Received message to store:', message);

                        // Save to DB
                        const newMessage = new Message(message);
                        await newMessage.save();

                        // Invalidate cache for this room
                        const cacheKey = `${HISTORY_PREFIX}${message.roomId}`;
                        await redisClient.del(cacheKey);
                        console.log(` [x] Invalidated cache for room ${message.roomId}`);

                        channel.ack(msg);
                    } catch (err) {
                        console.error('Error processing message from queue:', err);
                        // Do not ack so it can be retried or move to DLQ in more advanced setup
                    }
                }
            }, { noAck: false });

            return; // consumer started successfully
        } catch (err) {
            console.error(`Message Service consumer error (attempt ${i+1}/${retries}):`, err.message);
            await new Promise((r) => setTimeout(r, delayMs));
        }
    }
    console.error('Message Service: exceeded RabbitMQ connection retries, not consuming messages.');
}

console.log('Message Service: starting RabbitMQ consumer (with retry)');
startConsumerWithRetry();
