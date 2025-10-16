import { v4 as uuidv4 } from 'uuid';

/**
 * Correlation ID Middleware
 * 
 * Automatically adds or forwards correlation IDs for request tracing
 * across distributed services.
 * 
 * @example
 * app.use(correlationMiddleware);
 */
export const correlationMiddleware = (req, res, next) => {
  // Get correlation ID from header or generate new one
  const correlationId = req.headers['x-correlation-id'] || 
                       req.headers['x-request-id'] || 
                       uuidv4();
  
  // Attach to request object
  req.correlationId = correlationId;
  
  // Add to response headers
  res.setHeader('X-Correlation-ID', correlationId);
  
  // Track request timing
  req.startTime = Date.now();
  
  // Override res.json to log response details
  const originalJson = res.json.bind(res);
  res.json = (body) => {
    const duration = Date.now() - req.startTime;
    console.log(
      `[${correlationId}] ${req.method} ${req.originalUrl} - ${res.statusCode} (${duration}ms)`
    );
    return originalJson(body);
  };
  
  // Override res.send for non-JSON responses
  const originalSend = res.send.bind(res);
  res.send = (body) => {
    const duration = Date.now() - req.startTime;
    console.log(
      `[${correlationId}] ${req.method} ${req.originalUrl} - ${res.statusCode} (${duration}ms)`
    );
    return originalSend(body);
  };
  
  next();
};

/**
 * Request Logger Middleware
 * 
 * Logs incoming requests with correlation ID
 */
export const requestLoggerMiddleware = (req, res, next) => {
  console.log(
    `📥 [${req.correlationId || 'NO-ID'}] ${req.method} ${req.originalUrl}`,
    {
      ip: req.ip,
      userAgent: req.get('user-agent'),
      body: req.method !== 'GET' ? req.body : undefined,
    }
  );
  next();
};

/**
 * Service Name Middleware
 * 
 * Adds service name to response headers
 */
export const serviceNameMiddleware = (serviceName) => {
  return (req, res, next) => {
    res.setHeader('X-Service-Name', serviceName);
    req.serviceName = serviceName;
    next();
  };
};

/**
 * Timing Middleware
 * 
 * Adds detailed timing information to response headers
 */
export const timingMiddleware = (req, res, next) => {
  const start = process.hrtime();
  
  res.on('finish', () => {
    const [seconds, nanoseconds] = process.hrtime(start);
    const duration = seconds * 1000 + nanoseconds / 1000000;
    
    res.setHeader('X-Response-Time', `${duration.toFixed(2)}ms`);
  });
  
  next();
};

export default {
  correlationMiddleware,
  requestLoggerMiddleware,
  serviceNameMiddleware,
  timingMiddleware,
};
