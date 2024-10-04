import redis from 'redis';
import { promisify } from 'util';

class RedisClient {
  constructor() {
    // Creating the Redis client
    this.client = redis.createClient();

    // Handling error events from Redis
    this.client.on('error', (err) => {
        console.error('Redis client not connected to the server:', err);
     });

    // To Promisify the get, set, and del methods for asynchronous use
    this.getAsync = promisify(this.client.get).bind(this.client);
    this.setAsync = promisify(this.client.set).bind(this.client);
    this.delAsync = promisify(this.client.del).bind(this.client);
  }

  // Checking if the Redis client is alive
  isAlive() {
    return this.client.connected;
  }

  // Getting a value from Redis based on a key
  async get(key) {
    const value = await this.getAsync(key);
    return value;
    }

  // Setting a value in Redis with an expiration time
  async set(key, value, duration) {
    await this.setAsync(key, value, 'EX', duration);
  }

  // Deleting a value in Redis based on a key
  async del(key) {
    await this.delAsync(key);
  }
}

// Exporting an instance of RedisClient
const redisClient = new RedisClient();
export default redisClient;
