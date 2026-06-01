import { createClient, RedisClientType } from 'redis';

const redisClient: RedisClientType = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
});

redisClient.on('error', (err) => console.error('Redis Client Error:', err));
redisClient.on('connect', () => console.log('✅ Redis connected successfully'));
redisClient.on('ready', () => console.log('✅ Redis is ready to use'));

// Не вызываем connect() здесь, пусть main.ts вызывает
export default redisClient;
