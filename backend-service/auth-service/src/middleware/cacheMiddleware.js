import redis from 'redis';
import { logger } from '../utils/logger.js';

// Create Redis client
const redisClient = redis.createClient({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
  socket: {
    reconnectStrategy: (retries) => {
      if (retries > 10) {
        logger.error('Redis: Max reconnection attempts reached');
        return new Error('Redis max reconnection attempts');
      }
      return Math.min(retries * 100, 3000);
    }
  }
});

// Redis connection handlers
redisClient.on('connect', () => {
  logger.info('Redis: Connected successfully');
});

redisClient.on('error', (err) => {
  logger.error('Redis: Connection error', err);
});

redisClient.on('ready', () => {
  logger.info('Redis: Ready to accept commands');
});

// Connect to Redis
(async () => {
  try {
    await redisClient.connect();
  } catch (error) {
    logger.error('Redis: Failed to connect', error);
  }
})();

/**
 * Cache Service Class
 */
class CacheService {
  /**
   * Get value from cache
   * @param {string} key - Cache key
   * @returns {Promise<any>} - Cached value or null
   */
  static async get(key) {
    try {
      if (!redisClient.isOpen) {
        logger.warn('Redis: Client not connected');
        return null;
      }

      const value = await redisClient.get(key);
      if (value) {
        logger.debug(`Cache HIT: ${key}`);
        return JSON.parse(value);
      }
      
      logger.debug(`Cache MISS: ${key}`);
      return null;
    } catch (error) {
      logger.error(`Cache GET error for key ${key}:`, error);
      return null;
    }
  }

  /**
   * Set value in cache
   * @param {string} key - Cache key
   * @param {any} value - Value to cache
   * @param {number} ttl - Time to live in seconds (default: 300)
   */
  static async set(key, value, ttl = 300) {
    try {
      if (!redisClient.isOpen) {
        logger.warn('Redis: Client not connected, skipping cache set');
        return false;
      }

      await redisClient.setEx(key, ttl, JSON.stringify(value));
      logger.debug(`Cache SET: ${key} (TTL: ${ttl}s)`);
      return true;
    } catch (error) {
      logger.error(`Cache SET error for key ${key}:`, error);
      return false;
    }
  }

  /**
   * Delete value from cache
   * @param {string} key - Cache key
   */
  static async del(key) {
    try {
      if (!redisClient.isOpen) {
        logger.warn('Redis: Client not connected');
        return false;
      }

      await redisClient.del(key);
      logger.debug(`Cache DEL: ${key}`);
      return true;
    } catch (error) {
      logger.error(`Cache DEL error for key ${key}:`, error);
      return false;
    }
  }

  /**
   * Delete multiple keys matching pattern
   * @param {string} pattern - Pattern to match (e.g., 'user:*')
   */
  static async delPattern(pattern) {
    try {
      if (!redisClient.isOpen) {
        logger.warn('Redis: Client not connected');
        return false;
      }

      const keys = await redisClient.keys(pattern);
      if (keys.length > 0) {
        await redisClient.del(keys);
        logger.debug(`Cache DEL PATTERN: ${pattern} (${keys.length} keys)`);
      }
      return true;
    } catch (error) {
      logger.error(`Cache DEL PATTERN error for pattern ${pattern}:`, error);
      return false;
    }
  }

  /**
   * Check if key exists in cache
   * @param {string} key - Cache key
   */
  static async exists(key) {
    try {
      if (!redisClient.isOpen) {
        return false;
      }

      const exists = await redisClient.exists(key);
      return exists === 1;
    } catch (error) {
      logger.error(`Cache EXISTS error for key ${key}:`, error);
      return false;
    }
  }

  /**
   * Get remaining TTL for a key
   * @param {string} key - Cache key
   */
  static async ttl(key) {
    try {
      if (!redisClient.isOpen) {
        return -1;
      }

      return await redisClient.ttl(key);
    } catch (error) {
      logger.error(`Cache TTL error for key ${key}:`, error);
      return -1;
    }
  }

  /**
   * Flush all cache
   */
  static async flush() {
    try {
      if (!redisClient.isOpen) {
        logger.warn('Redis: Client not connected');
        return false;
      }

      await redisClient.flushAll();
      logger.info('Cache: Flushed all keys');
      return true;
    } catch (error) {
      logger.error('Cache FLUSH error:', error);
      return false;
    }
  }
}

/**
 * Cache middleware factory
 * @param {Object} options - Cache options
 * @param {number} options.ttl - Time to live in seconds
 * @param {Function} options.keyGenerator - Function to generate cache key from request
 */
export const cacheMiddleware = (options = {}) => {
  const {
    ttl = 300,
    keyGenerator = (req) => `cache:${req.method}:${req.originalUrl}`
  } = options;

  return async (req, res, next) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    const cacheKey = keyGenerator(req);
    
    try {
      // Try to get from cache
      const cachedData = await CacheService.get(cacheKey);
      
      if (cachedData) {
        // Add cache metadata
        const metadata = {
          cached: true,
          cacheKey,
          cacheTtl: await CacheService.ttl(cacheKey)
        };

        // Return cached response
        return res.status(200).json({
          ...cachedData,
          metadata: {
            ...cachedData.metadata,
            ...metadata
          }
        });
      }

      // Store original json method
      const originalJson = res.json.bind(res);

      // Override json method to cache response
      res.json = function(body) {
        // Only cache successful responses
        if (res.statusCode >= 200 && res.statusCode < 300) {
          CacheService.set(cacheKey, body, ttl).catch(err => {
            logger.error('Failed to cache response:', err);
          });
        }

        return originalJson(body);
      };

      next();
    } catch (error) {
      logger.error('Cache middleware error:', error);
      next();
    }
  };
};

/**
 * Cache invalidation middleware
 * Invalidates cache for specific patterns after write operations
 */
export const invalidateCacheMiddleware = (patterns = []) => {
  return async (req, res, next) => {
    // Store original json method
    const originalJson = res.json.bind(res);

    // Override json method to invalidate cache after response
    res.json = function(body) {
      // Only invalidate on successful write operations
      if (
        res.statusCode >= 200 && 
        res.statusCode < 300 && 
        ['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)
      ) {
        // Invalidate cache patterns asynchronously
        Promise.all(
          patterns.map(pattern => CacheService.delPattern(pattern))
        ).catch(err => {
          logger.error('Failed to invalidate cache:', err);
        });
      }

      return originalJson(body);
    };

    next();
  };
};

export { CacheService, redisClient };
