const mongoose = require('mongoose');
const { createClient } = require('redis');

const flushChats = async () => {
    // Connect to MongoDB
    try {
        const mongoUri = process.env.MONGO_URI || 'mongodb://mongo-chat:27017/chat_messages';
        await mongoose.connect(mongoUri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 5000
        });
        console.log('Connected to MongoDB');

        // Drop the messages collection
        await mongoose.connection.db.collection('messages').deleteMany({});
        console.log('Successfully deleted all messages from MongoDB');

        // Close MongoDB connection
        await mongoose.connection.close();
        console.log('Closed MongoDB connection');

        // Connect to Redis
        const redisClient = createClient({
            url: process.env.REDIS_URL || 'redis://redis:6379'
        });
        
        redisClient.on('error', err => console.error('Redis Client Error:', err));
        await redisClient.connect();
        console.log('Connected to Redis');

        // Delete all keys with pattern 'chat:history:*'
        const keys = await redisClient.keys('chat:history:*');
        if (keys.length > 0) {
            await redisClient.del(keys);
            console.log(`Deleted ${keys.length} keys from Redis`);
        } else {
            console.log('No chat history keys found in Redis');
        }

        console.log('Successfully cleared Redis chat history');
        await redisClient.quit();
        console.log('Closed Redis connection');

    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
    process.exit(0);
};

flushChats();