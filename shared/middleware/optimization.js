import compression from 'compression';

/**
 * Compression Middleware Configuration
 * 
 * Compresses responses using gzip/deflate for better performance
 */
export const compressionMiddleware = compression({
  // Only compress responses larger than 1KB
  threshold: 1024,
  
  // Compression level (0-9, where 6 is a good balance)
  level: 6,
  
  // Filter function to determine what to compress
  filter: (req, res) => {
    // Don't compress if explicitly disabled
    if (req.headers['x-no-compression']) {
      return false;
    }
    
    // Don't compress responses with this header
    if (res.getHeader('Content-Encoding')) {
      return false;
    }
    
    // Compress everything else using default filter
    return compression.filter(req, res);
  },
  
  // Compression strategy
  strategy: 0, // Default strategy
});

/**
 * Response Time Middleware
 * 
 * Adds X-Response-Time header to all responses
 */
export const responseTimeMiddleware = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    res.setHeader('X-Response-Time', `${duration}ms`);
  });
  
  next();
};

/**
 * Security Headers Middleware
 * 
 * Adds security-related headers to responses
 */
export const securityHeadersMiddleware = (req, res, next) => {
  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'DENY');
  
  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // Enable XSS protection
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Referrer policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  next();
};

/**
 * Request Size Limit Middleware
 * 
 * Validates request body size before processing
 */
export const requestSizeLimitMiddleware = (maxSizeBytes = 10485760) => { // 10MB default
  return (req, res, next) => {
    const contentLength = parseInt(req.headers['content-length'] || '0');
    
    if (contentLength > maxSizeBytes) {
      return res.status(413).json({
        success: false,
        error: {
          code: 'PAYLOAD_TOO_LARGE',
          message: `Request body too large. Maximum size is ${maxSizeBytes} bytes`,
        },
      });
    }
    
    next();
  };
};

export default {
  compressionMiddleware,
  responseTimeMiddleware,
  securityHeadersMiddleware,
  requestSizeLimitMiddleware,
};
