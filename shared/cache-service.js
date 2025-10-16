import Redis from 'ioredis';

/**
 * CacheService - Redis-based caching layer for microservices
 * 
 * Features:
 * - Key-value caching with TTL
 * - Pattern-based cache invalidation
 * - Automatic JSON serialization
 * - Cache statistics tracking
 * - Graceful error handling
 * 
 * @example
 * const cache = new CacheService();
 * await cache.set('user:123', userData, 300);
 * const user = await cache.get('user:123');
 */
class CacheService {
  constructor(config = {}) {
    this.config = {
      host: config.host || process.env.REDIS_HOST || 'localhost',
      port: config.port || process.env.REDIS_PORT || 6379,
      password: config.password || process.env.REDIS_PASSWORD,
      db: config.db || 0,
      keyPrefix: config.keyPrefix || 'evolve:',
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
      maxRetriesPerRequest: 3,
      enableReadyCheck: true,
      ...config,
    };

    this.client = new Redis(this.config);
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
      errors: 0,
    };

    this._setupEventHandlers();
  }

  /**
   * Set up Redis event handlers
   * @private
   */
  _setupEventHandlers() {
    this.client.on('connect', () => {
      console.log('✅ Redis Cache Connected');
    });

    this.client.on('ready', () => {
      console.log('✅ Redis Cache Ready');
    });

    this.client.on('error', (err) => {
      console.error('❌ Redis Cache Error:', err.message);
      this.stats.errors++;
    });

    this.client.on('close', () => {
      console.warn('⚠️ Redis Cache Connection Closed');
    });

    this.client.on('reconnecting', () => {
      console.log('🔄 Redis Cache Reconnecting...');
    });
  }

  /**
   * Get value from cache
   * @param {string} key - Cache key
   * @returns {Promise<any|null>} Cached value or null
   */
  async get(key) {
    try {
      const value = await this.client.get(key);
      
      if (value) {
        this.stats.hits++;
        console.log(`💾 Cache HIT: ${key}`);
        return JSON.parse(value);
      }
      
      this.stats.misses++;
      console.log(`🔍 Cache MISS: ${key}`);
      return null;
    } catch (error) {
      console.error(`❌ Cache get error for key '${key}':`, error.message);
      this.stats.errors++;
      return null;
    }
  }

  /**
   * Set value in cache
   * @param {string} key - Cache key
   * @param {any} value - Value to cache
   * @param {number} ttlSeconds - Time to live in seconds (default: 300)
   * @returns {Promise<boolean>} Success status
   */
  async set(key, value, ttlSeconds = 300) {
    try {
      const serialized = JSON.stringify(value);
      await this.client.setex(key, ttlSeconds, serialized);
      this.stats.sets++;
      console.log(`💾 Cache SET: ${key} (TTL: ${ttlSeconds}s)`);
      return true;
    } catch (error) {
      console.error(`❌ Cache set error for key '${key}':`, error.message);
      this.stats.errors++;
      return false;
    }
  }

  /**
   * Delete key from cache
   * @param {string} key - Cache key
   * @returns {Promise<boolean>} Success status
   */
  async del(key) {
    try {
      const result = await this.client.del(key);
      this.stats.deletes++;
      console.log(`🗑️ Cache DELETE: ${key}`);
      return result > 0;
    } catch (error) {
      console.error(`❌ Cache delete error for key '${key}':`, error.message);
      this.stats.errors++;
      return false;
    }
  }

  /**
   * Check if key exists
   * @param {string} key - Cache key
   * @returns {Promise<boolean>} True if key exists
   */
  async exists(key) {
    try {
      const result = await this.client.exists(key);
      return result === 1;
    } catch (error) {
      console.error(`❌ Cache exists error for key '${key}':`, error.message);
      return false;
    }
  }

  /**
   * Get remaining TTL for a key
   * @param {string} key - Cache key
   * @returns {Promise<number>} TTL in seconds (-1 if no expiry, -2 if key doesn't exist)
   */
  async ttl(key) {
    try {
      return await this.client.ttl(key);
    } catch (error) {
      console.error(`❌ Cache TTL error for key '${key}':`, error.message);
      return -2;
    }
  }

  /**
   * Invalidate cache by pattern
   * @param {string} pattern - Redis key pattern (e.g., 'user:*')
   * @returns {Promise<number>} Number of keys deleted
   */
  async invalidatePattern(pattern) {
    try {
      const keys = await this.client.keys(pattern);
      
      if (keys.length === 0) {
        console.log(`🔍 No keys found for pattern: ${pattern}`);
        return 0;
      }

      const result = await this.client.del(...keys);
      this.stats.deletes += result;
      console.log(`🗑️ Cache INVALIDATE: ${pattern} (${result} keys deleted)`);
      return result;
    } catch (error) {
      console.error(`❌ Cache invalidate error for pattern '${pattern}':`, error.message);
      this.stats.errors++;
      return 0;
    }
  }

  /**
   * Set multiple key-value pairs
   * @param {object} entries - Object with key-value pairs
   * @param {number} ttlSeconds - TTL for all keys
   * @returns {Promise<boolean>} Success status
   */
  async setMultiple(entries, ttlSeconds = 300) {
    try {
      const pipeline = this.client.pipeline();
      
      Object.entries(entries).forEach(([key, value]) => {
        const serialized = JSON.stringify(value);
        pipeline.setex(key, ttlSeconds, serialized);
      });

      await pipeline.exec();
      this.stats.sets += Object.keys(entries).length;
      console.log(`💾 Cache SET MULTIPLE: ${Object.keys(entries).length} keys`);
      return true;
    } catch (error) {
      console.error('❌ Cache set multiple error:', error.message);
      this.stats.errors++;
      return false;
    }
  }

  /**
   * Get multiple keys
   * @param {string[]} keys - Array of cache keys
   * @returns {Promise<object>} Object with key-value pairs
   */
  async getMultiple(keys) {
    try {
      const values = await this.client.mget(...keys);
      const result = {};
      
      keys.forEach((key, index) => {
        if (values[index]) {
          result[key] = JSON.parse(values[index]);
          this.stats.hits++;
        } else {
          this.stats.misses++;
        }
      });

      return result;
    } catch (error) {
      console.error('❌ Cache get multiple error:', error.message);
      this.stats.errors++;
      return {};
    }
  }

  /**
   * Increment a numeric value
   * @param {string} key - Cache key
   * @param {number} increment - Amount to increment (default: 1)
   * @returns {Promise<number|null>} New value or null on error
   */
  async increment(key, increment = 1) {
    try {
      return await this.client.incrby(key, increment);
    } catch (error) {
      console.error(`❌ Cache increment error for key '${key}':`, error.message);
      return null;
    }
  }

  /**
   * Get cache statistics
   * @returns {object} Cache statistics
   */
  getStats() {
    const total = this.stats.hits + this.stats.misses;
    const hitRate = total > 0 ? ((this.stats.hits / total) * 100).toFixed(2) : 0;

    return {
      ...this.stats,
      total,
      hitRate: `${hitRate}%`,
    };
  }

  /**
   * Reset cache statistics
   */
  resetStats() {
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
      errors: 0,
    };
  }

  /**
   * Flush all cache
   * WARNING: This will delete all keys in the current database
   * @returns {Promise<boolean>} Success status
   */
  async flush() {
    try {
      await this.client.flushdb();
      console.log('🗑️ Cache FLUSHED');
      return true;
    } catch (error) {
      console.error('❌ Cache flush error:', error.message);
      return false;
    }
  }

  /**
   * Close Redis connection
   */
  async close() {
    await this.client.quit();
    console.log('👋 Redis Cache Connection Closed');
  }

  /**
   * Decorator for caching function results
   * @param {string} keyPrefix - Cache key prefix
   * @param {number} ttl - TTL in seconds
   * @returns {Function} Decorator function
   */
  static cacheable(keyPrefix, ttl = 300) {
    return function (target, propertyKey, descriptor) {
      const originalMethod = descriptor.value;

      descriptor.value = async function (...args) {
        const cache = this.cache || new CacheService();
        const cacheKey = `${keyPrefix}:${JSON.stringify(args)}`;
        
        // Try to get from cache
        const cached = await cache.get(cacheKey);
        if (cached !== null) {
          return cached;
        }

        // Execute original method
        const result = await originalMethod.apply(this, args);
        
        // Store in cache
        await cache.set(cacheKey, result, ttl);
        
        return result;
      };

      return descriptor;
    };
  }
}

export default CacheService;
