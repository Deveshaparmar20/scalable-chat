const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const { createClient } = require('redis');
const { createAdapter } = require('@socket.io/redis-adapter');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => res.json({ status: 'healthy' }));

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });
const amqp = require('amqplib');
let amqpChannel = null;

async function connectRabbitMQWithRetry(retries = 10, delayMs = 3000) {
  const url = process.env.RABBITMQ_URL || 'amqp://rabbitmq';
  for (let i = 0; i < retries; i++) {
    try {
      const conn = await amqp.connect(url);
      amqpChannel = await conn.createChannel();
      await amqpChannel.assertExchange('chat_exchange', 'topic', { durable: true });
      console.log('RabbitMQ connected and exchange asserted');
      return;
    } catch (err) {
      console.error(`Failed to connect to RabbitMQ (attempt ${i + 1}/${retries}):`, err.message);
      await new Promise((r) => setTimeout(r, delayMs));
    }
  }
  console.error('Exceeded RabbitMQ connection retries, continuing without RabbitMQ.');
}

connectRabbitMQWithRetry(20, 3000);

const redisUrl = process.env.REDIS_URL || 'redis://redis:6379';
const pubClient = createClient({ url: redisUrl });
const subClient = pubClient.duplicate();

pubClient.on('error', (err) => console.error('Redis Pub Client Error', err));
subClient.on('error', (err) => console.error('Redis Sub Client Error', err));

(async () => {
  try {
    await pubClient.connect();
    await subClient.connect();
    io.adapter(createAdapter(pubClient, subClient));
    console.log('Socket.IO Redis Adapter connected');
  } catch (err) {
    console.error('Redis adapter connection error', err);
  }
})();

io.on('connection', (socket) => {
  console.log('Socket connected:', socket.id);

  socket.on('joinRoom', (roomId) => {
    socket.join(roomId);
    console.log(`${socket.id} joined room ${roomId}`);
  });

  socket.on('sendMessage', (message) => {
    if (message && message.roomId) {
      io.to(message.roomId).emit('receiveMessage', message);
      if (amqpChannel) {
        const routingKey = `messages.${message.roomId}`;
        try {
          amqpChannel.publish('chat_exchange', routingKey, Buffer.from(JSON.stringify(message)), { persistent: true });
        } catch (err) {
          console.error('Failed to publish message to RabbitMQ', err);
        }
      }
    }
  });

  socket.on('disconnect', () => {
    console.log('Socket disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 3003;
server.listen(PORT, () => console.log(`Chat Service (Socket.IO) running on port ${PORT}`));
