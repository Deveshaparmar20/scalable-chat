const { createClient } = require('redis');

// Create Redis client with auto-reconnect
const client = createClient({
    url: process.env.REDIS_URL || 'redis://redis:6379',
    retry_strategy: function(options) {
        if (options.error && options.error.code === 'ECONNREFUSED') {
            // End reconnecting on a specific error
            console.error('Redis connection refused. Retrying...');
            return Math.min(options.attempt * 100, 3000);
        }
        if (options.total_retry_time > 1000 * 60 * 60) {
            // End reconnecting after a specific timeout
            console.error('Redis retry time exhausted');
            return undefined;
        }
        if (options.attempt > 10) {
            // End reconnecting with built in error
            return undefined;
        }
        // Reconnect after
        return Math.min(options.attempt * 100, 3000);
    }
});

client.on('error', (err) => console.error('Redis Client Error:', err));
client.on('connect', () => console.log('Connected to Redis'));
client.on('ready', () => console.log('Redis Client Ready'));
client.on('reconnecting', () => console.log('Redis Client Reconnecting'));

// Connect to Redis
(async () => {
    await client.connect();
})().catch(console.error);

// Cache TTL (24 hours)
const CACHE_TTL = 24 * 60 * 60;

// Cache key prefix for chat history
const HISTORY_PREFIX = 'chat:history:';

module.exports = {
    client,
    CACHE_TTL,
    HISTORY_PREFIX
};