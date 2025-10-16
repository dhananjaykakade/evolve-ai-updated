import axios from 'axios';
import axiosRetry from 'axios-retry';
import CircuitBreaker from 'opossum';
import { v4 as uuidv4 } from 'uuid';

/**
 * ServiceClient - Resilient HTTP client for inter-service communication
 * 
 * Features:
 * - Automatic retry with exponential backoff
 * - Circuit breaker pattern
 * - Request correlation IDs
 * - Request/response logging
 * - Timeout handling
 * 
 * @example
 * const client = new ServiceClient({ timeout: 5000 });
 * const response = await client.get('http://teacher-service:9003/assignments');
 */
class ServiceClient {
  constructor(config = {}) {
    this.serviceName = config.serviceName || 'unknown-service';
    this.client = axios.create({
      timeout: config.timeout || 5000,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': `ServiceClient/${this.serviceName}`,
      },
    });

    // Configure retry logic
    axiosRetry(this.client, {
      retries: config.retries || 3,
      retryDelay: (retryCount) => {
        const delay = axiosRetry.exponentialDelay(retryCount);
        console.log(`🔄 Retry attempt ${retryCount} in ${delay}ms`);
        return delay;
      },
      retryCondition: (error) => {
        // Retry on network errors and 5xx server errors
        return axiosRetry.isNetworkOrIdempotentRequestError(error) ||
               (error.response?.status >= 500 && error.response?.status < 600);
      },
      onRetry: (retryCount, error, requestConfig) => {
        console.warn(`⚠️ Retrying ${requestConfig.method.toUpperCase()} ${requestConfig.url} (attempt ${retryCount})`);
      },
    });

    // Request interceptor - Add correlation ID and timing
    this.client.interceptors.request.use((config) => {
      // Preserve existing correlation ID or create new one
      config.headers['X-Correlation-ID'] = config.headers['X-Correlation-ID'] || uuidv4();
      config.headers['X-Request-Start'] = Date.now();
      config.headers['X-Service-Name'] = this.serviceName;
      
      console.log(`📤 ${config.method.toUpperCase()} ${config.url} [${config.headers['X-Correlation-ID']}]`);
      return config;
    }, (error) => {
      console.error('❌ Request interceptor error:', error);
      return Promise.reject(error);
    });

    // Response interceptor - Log timing and handle errors
    this.client.interceptors.response.use(
      (response) => {
        const duration = Date.now() - response.config.headers['X-Request-Start'];
        const correlationId = response.config.headers['X-Correlation-ID'];
        console.log(`✅ ${response.config.method.toUpperCase()} ${response.config.url} - ${response.status} (${duration}ms) [${correlationId}]`);
        
        // Add timing to response
        response.timing = duration;
        return response;
      },
      (error) => {
        if (error.config) {
          const duration = Date.now() - (error.config.headers?.['X-Request-Start'] || Date.now());
          const correlationId = error.config.headers?.['X-Correlation-ID'] || 'unknown';
          const status = error.response?.status || 'TIMEOUT';
          console.error(`❌ ${error.config.method?.toUpperCase()} ${error.config.url} - ${status} (${duration}ms) [${correlationId}]`);
        }
        return Promise.reject(error);
      }
    );

    // Circuit breakers for different services
    this.circuitBreakers = new Map();
  }

  /**
   * Create or get a circuit breaker for a service
   * @param {string} serviceKey - Unique identifier for the service
   * @param {object} options - Circuit breaker options
   * @returns {CircuitBreaker}
   */
  getCircuitBreaker(serviceKey, options = {}) {
    if (!this.circuitBreakers.has(serviceKey)) {
      const breaker = new CircuitBreaker(
        async (fn) => await fn(),
        {
          timeout: options.timeout || 3000,
          errorThresholdPercentage: options.errorThreshold || 50,
          resetTimeout: options.resetTimeout || 30000,
          name: serviceKey,
          ...options,
        }
      );

      breaker.on('open', () => {
        console.warn(`⚠️ Circuit breaker OPENED for ${serviceKey}`);
      });

      breaker.on('halfOpen', () => {
        console.info(`🔄 Circuit breaker HALF-OPEN for ${serviceKey}`);
      });

      breaker.on('close', () => {
        console.info(`✅ Circuit breaker CLOSED for ${serviceKey}`);
      });

      breaker.fallback(() => {
        console.error(`💥 Circuit breaker FALLBACK for ${serviceKey}`);
        throw new Error(`Service ${serviceKey} is currently unavailable`);
      });

      this.circuitBreakers.set(serviceKey, breaker);
    }

    return this.circuitBreakers.get(serviceKey);
  }

  /**
   * Make a GET request with circuit breaker
   */
  async get(url, config = {}) {
    const serviceKey = this._extractServiceKey(url);
    const breaker = this.getCircuitBreaker(serviceKey);
    
    return breaker.fire(async () => {
      return this.client.get(url, config);
    });
  }

  /**
   * Make a POST request with circuit breaker
   */
  async post(url, data, config = {}) {
    const serviceKey = this._extractServiceKey(url);
    const breaker = this.getCircuitBreaker(serviceKey);
    
    return breaker.fire(async () => {
      return this.client.post(url, data, config);
    });
  }

  /**
   * Make a PUT request with circuit breaker
   */
  async put(url, data, config = {}) {
    const serviceKey = this._extractServiceKey(url);
    const breaker = this.getCircuitBreaker(serviceKey);
    
    return breaker.fire(async () => {
      return this.client.put(url, data, config);
    });
  }

  /**
   * Make a PATCH request with circuit breaker
   */
  async patch(url, data, config = {}) {
    const serviceKey = this._extractServiceKey(url);
    const breaker = this.getCircuitBreaker(serviceKey);
    
    return breaker.fire(async () => {
      return this.client.patch(url, data, config);
    });
  }

  /**
   * Make a DELETE request with circuit breaker
   */
  async delete(url, config = {}) {
    const serviceKey = this._extractServiceKey(url);
    const breaker = this.getCircuitBreaker(serviceKey);
    
    return breaker.fire(async () => {
      return this.client.delete(url, config);
    });
  }

  /**
   * Make a request without circuit breaker (for external APIs)
   */
  async request(config) {
    return this.client.request(config);
  }

  /**
   * Extract service key from URL for circuit breaker identification
   * @private
   */
  _extractServiceKey(url) {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname;
    } catch {
      // If URL is relative or invalid, use the full URL as key
      return url.split('/')[0] || 'default';
    }
  }

  /**
   * Get circuit breaker stats for monitoring
   */
  getStats() {
    const stats = {};
    this.circuitBreakers.forEach((breaker, key) => {
      stats[key] = breaker.stats;
    });
    return stats;
  }

  /**
   * Reset all circuit breakers
   */
  resetCircuitBreakers() {
    this.circuitBreakers.forEach((breaker) => {
      breaker.close();
    });
  }
}

export default ServiceClient;
