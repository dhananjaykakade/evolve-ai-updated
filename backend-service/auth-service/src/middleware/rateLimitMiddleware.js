import { redisClient } from './cacheMiddleware.js';
import ResponseHandlerV2 from '../utils/ResponseHandlerV2.js';
import { logger } from '../utils/logger.js';

/**
 * Rate limiter using Redis
 */
class RateLimiter {
  /**
   * Check if request should be rate limited
   * @param {string} identifier - Unique identifier (IP, user ID, etc.)
   * @param {number} maxRequests - Maximum requests allowed
   * @param {number} windowSeconds - Time window in seconds
   * @returns {Promise<{allowed: boolean, remaining: number, resetTime: number}>}
   */
  static async checkLimit(identifier, maxRequests, windowSeconds) {
    try {
      if (!redisClient.isOpen) {
        logger.warn('Redis not connected, allowing request');
        return { allowed: true, remaining: maxRequests - 1, resetTime: Date.now() + windowSeconds * 1000 };
      }

      const key = `ratelimit:${identifier}`;
      const current = await redisClient.get(key);
      const now = Date.now();

      if (!current) {
        // First request in window
        await redisClient.setEx(key, windowSeconds, JSON.stringify({
          count: 1,
          resetTime: now + windowSeconds * 1000
        }));

        return {
          allowed: true,
          remaining: maxRequests - 1,
          resetTime: now + windowSeconds * 1000
        };
      }

      const data = JSON.parse(current);

      if (data.count >= maxRequests) {
        return {
          allowed: false,
          remaining: 0,
          resetTime: data.resetTime
        };
      }

      // Increment counter
      data.count += 1;
      const ttl = Math.ceil((data.resetTime - now) / 1000);
      await redisClient.setEx(key, ttl, JSON.stringify(data));

      return {
        allowed: true,
        remaining: maxRequests - data.count,
        resetTime: data.resetTime
      };
    } catch (error) {
      logger.error('Rate limiter error:', error);
      // On error, allow the request
      return { allowed: true, remaining: maxRequests - 1, resetTime: Date.now() + windowSeconds * 1000 };
    }
  }

  /**
   * Reset rate limit for identifier
   * @param {string} identifier - Unique identifier
   */
  static async reset(identifier) {
    try {
      if (!redisClient.isOpen) return;
      await redisClient.del(`ratelimit:${identifier}`);
    } catch (error) {
      logger.error('Rate limit reset error:', error);
    }
  }
}

/**
 * Rate limiting middleware factory
 * @param {Object} options - Rate limit options
 * @param {number} options.maxRequests - Maximum requests allowed
 * @param {number} options.windowSeconds - Time window in seconds
 * @param {Function} options.keyGenerator - Function to generate identifier from request
 * @param {string} options.message - Custom error message
 */
export const rateLimitMiddleware = (options = {}) => {
  const {
    maxRequests = 100,
    windowSeconds = 60,
    keyGenerator = (req) => req.ip || req.connection.remoteAddress,
    message = 'Too many requests, please try again later'
  } = options;

  return async (req, res, next) => {
    try {
      const identifier = keyGenerator(req);
      const result = await RateLimiter.checkLimit(identifier, maxRequests, windowSeconds);

      // Add rate limit headers
      res.setHeader('X-RateLimit-Limit', maxRequests);
      res.setHeader('X-RateLimit-Remaining', result.remaining);
      res.setHeader('X-RateLimit-Reset', new Date(result.resetTime).toISOString());

      if (!result.allowed) {
        const retryAfter = Math.ceil((result.resetTime - Date.now()) / 1000);
        res.setHeader('Retry-After', retryAfter);

        return ResponseHandlerV2.tooManyRequests(res, {
          message,
          metadata: {
            retryAfter,
            resetTime: new Date(result.resetTime).toISOString()
          }
        });
      }

      next();
    } catch (error) {
      logger.error('Rate limit middleware error:', error);
      // On error, allow the request
      next();
    }
  };
};

/**
 * IP-based rate limiting
 */
export const ipRateLimit = (maxRequests = 100, windowSeconds = 60) => {
  return rateLimitMiddleware({
    maxRequests,
    windowSeconds,
    keyGenerator: (req) => `ip:${req.ip || req.connection.remoteAddress}`,
    message: `Rate limit exceeded. Maximum ${maxRequests} requests per ${windowSeconds} seconds`
  });
};

/**
 * User-based rate limiting (requires authentication)
 */
export const userRateLimit = (maxRequests = 100, windowSeconds = 60) => {
  return rateLimitMiddleware({
    maxRequests,
    windowSeconds,
    keyGenerator: (req) => {
      const userId = req.user?.id || req.userId;
      return userId ? `user:${userId}` : `ip:${req.ip}`;
    },
    message: `Rate limit exceeded. Maximum ${maxRequests} requests per ${windowSeconds} seconds`
  });
};

/**
 * Endpoint-specific rate limiting
 */
export const endpointRateLimit = (maxRequests = 50, windowSeconds = 60) => {
  return rateLimitMiddleware({
    maxRequests,
    windowSeconds,
    keyGenerator: (req) => {
      const identifier = req.user?.id || req.ip;
      return `endpoint:${req.method}:${req.path}:${identifier}`;
    },
    message: `Rate limit exceeded for this endpoint. Maximum ${maxRequests} requests per ${windowSeconds} seconds`
  });
};

/**
 * Strict rate limiting for sensitive operations (login, registration, etc.)
 */
export const strictRateLimit = (maxRequests = 5, windowSeconds = 300) => {
  return rateLimitMiddleware({
    maxRequests,
    windowSeconds,
    keyGenerator: (req) => `strict:${req.path}:${req.ip}`,
    message: `Too many attempts. Please try again after ${Math.ceil(windowSeconds / 60)} minutes`
  });
};

export { RateLimiter };
