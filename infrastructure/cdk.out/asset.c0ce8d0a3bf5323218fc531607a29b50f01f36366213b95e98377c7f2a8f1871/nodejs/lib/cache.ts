import { createClient } from 'redis';

export class Cache {
  private static instance: Cache;
  private client: ReturnType<typeof createClient>;
  private isConnected = false;

  private constructor() {
    this.client = createClient({
      url: `redis://${process.env.REDIS_ENDPOINT}`
    });

    this.client.on('error', (err) => {
      console.error('Redis Client Error:', err);
    });
  }

  static async getInstance(): Promise<Cache> {
    if (!Cache.instance) {
      Cache.instance = new Cache();
    }
    if (!Cache.instance.isConnected) {
      await Cache.instance.connect();
    }
    return Cache.instance;
  }

  private async connect(): Promise<void> {
    if (!this.isConnected) {
      await this.client.connect();
      this.isConnected = true;
    }
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await this.client.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  async set<T>(key: string, value: T, ttlSeconds: number = 3600): Promise<void> {
    try {
      await this.client.set(key, JSON.stringify(value), {
        EX: ttlSeconds
      });
    } catch (error) {
      console.error('Cache set error:', error);
    }
  }

  async delete(key: string): Promise<void> {
    try {
      await this.client.del(key);
    } catch (error) {
      console.error('Cache delete error:', error);
    }
  }

  async disconnect(): Promise<void> {
    if (this.isConnected) {
      await this.client.quit();
      this.isConnected = false;
    }
  }
} 