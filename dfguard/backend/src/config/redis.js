const Redis = require('ioredis');

let redisClient = null;

const connectRedis = async () => {
    try {
        redisClient = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
            maxRetriesPerRequest:    3,
            enableReadyCheck:        true,
            lazyConnect:             true,
            retryStrategy(times) {
                // Stop retrying after 3 attempts
                if (times > 3) return null;
                return Math.min(times * 200, 1000);
            }
        });

        await redisClient.connect();
        console.log('✅ Redis connected');

        redisClient.on('error', (err) => {
            // Non-fatal — app works without Redis (rate limiting falls back)
            console.warn('⚠️  Redis error:', err.message);
        });

    } catch (error) {
        // Redis is optional for dev — don't crash the server
        console.warn('⚠️  Redis unavailable. Rate limiting will use memory store.');
        redisClient = null;
    }
};

const getRedis = () => redisClient;

module.exports = { connectRedis, getRedis };
