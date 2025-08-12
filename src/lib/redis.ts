import Redis from 'ioredis';

// Create a mock Redis client if credentials are not properly configured
const isValidRedisConfig = (
  process.env.REDIS_HOST && 
  !process.env.REDIS_HOST.includes('your-') &&
  process.env.REDIS_PORT && 
  !process.env.REDIS_PORT.includes('your-') &&
  process.env.REDIS_PASSWORD && 
  !process.env.REDIS_PASSWORD.includes('your-')
);

// Mock Redis client implementation
class MockRedis {
  async set() { return 'OK'; }
  async get() { return null; }
  async del() { return 1; }
  async exists() { return 0; }
  async expire() { return 1; }
  async hset() { return 1; }
  async hget() { return null; }
  async hgetall() { return {}; }
  async hdel() { return 1; }
  async lpush() { return 1; }
  async rpush() { return 1; }
  async lpop() { return null; }
  async rpop() { return null; }
  async lrange() { return []; }
}

export const redis = isValidRedisConfig 
  ? new Redis({
      host: process.env.REDIS_HOST,
      port: Number(process.env.REDIS_PORT),
      username: process.env.REDIS_USERNAME,
      password: process.env.REDIS_PASSWORD,
      tls: undefined,
    })
  : new MockRedis() as unknown as Redis;
