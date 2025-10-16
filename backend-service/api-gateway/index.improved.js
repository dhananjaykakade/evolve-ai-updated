import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import { createProxyMiddleware, fixRequestBody } from "http-proxy-middleware";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import compression from "compression";
import { SERVICE_REGISTRY } from "../../shared/service-registry.js";

dotenv.config();

const NODE_ENV = process.env.NODE_ENV || "development";
const PORT = process.env.PORT || 9001;
const SERVICE_NAME = "api-gateway";

const app = express();

// ========================================
// SECURITY & OPTIMIZATION MIDDLEWARE
// ========================================

// Security headers
app.use(helmet({
  contentSecurityPolicy: false, // Disable for API gateway
  crossOriginEmbedderPolicy: false,
}));

// CORS configuration
app.use(
  cors({
    origin: process.env.ALLOWED_ORIGINS?.split(",") || "*",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "X-Session-ID", "x-session-id", "X-Correlation-ID"],
    credentials: true,
    exposedHeaders: ["Content-Type", "Authorization", "X-Request-Id", "X-Session-ID", "x-session-id", "X-Correlation-ID", "X-Response-Time"],
  })
);

// Trust proxy for rate limiting
app.set('trust proxy', 1);

// Response compression
app.use(compression({
  threshold: 1024,
  level: 6,
}));

// Rate limiting with better configuration
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.RATE_LIMIT_MAX || 1000,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests from this IP, please try again later',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for health checks
    return req.path === '/health' || req.path === '/';
  },
});
app.use(limiter);

// Body parsing with size limits
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// HTTP request logging
app.use(morgan(NODE_ENV === 'development' ? 'dev' : 'combined'));

// ========================================
// CUSTOM MIDDLEWARE
// ========================================

// Correlation ID middleware
app.use((req, res, next) => {
  const correlationId = req.headers['x-correlation-id'] || 
                       req.headers['x-request-id'] || 
                       `gw-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  req.correlationId = correlationId;
  req.startTime = Date.now();
  
  res.setHeader('X-Correlation-ID', correlationId);
  res.setHeader('X-Gateway-Version', '2.0.0');
  
  next();
});

// Request logger with correlation ID
app.use((req, res, next) => {
  console.log(`📥 [${req.correlationId}] ${req.method} ${req.originalUrl} from ${req.ip}`);
  
  res.on('finish', () => {
    const duration = Date.now() - req.startTime;
    console.log(`📤 [${req.correlationId}] ${req.method} ${req.originalUrl} - ${res.statusCode} (${duration}ms)`);
  });
  
  next();
});

// ========================================
// SERVICE PROXY CONFIGURATION
// ========================================

// Service routes mapping
const serviceRoutes = {
  auth: {
    ...SERVICE_REGISTRY.AUTH,
    pathRewrite: { "^/auth": "" },
    priority: 1,
  },
  teacher: {
    ...SERVICE_REGISTRY.TEACHER,
    pathRewrite: { "^/teacher": "" },
    priority: 2,
  },
  student: {
    ...SERVICE_REGISTRY.STUDENT,
    pathRewrite: { "^/student": "" },
    priority: 2,
  },
  notification: {
    ...SERVICE_REGISTRY.NOTIFICATION,
    pathRewrite: { "^/notification": "" },
    priority: 3,
  },
  grading: {
    ...SERVICE_REGISTRY.GRADING,
    pathRewrite: { "^/grading": "" },
    priority: 2,
  },
  exam: {
    ...SERVICE_REGISTRY.EXAM,
    pathRewrite: { "^/exam": "" },
    priority: 2,
  },
};

// Create proxy middleware for each service
Object.entries(serviceRoutes).forEach(([route, config]) => {
  const proxyOptions = {
    target: config.url,
    changeOrigin: true,
    pathRewrite: config.pathRewrite,
    timeout: config.timeout,
    proxyTimeout: config.timeout,
    
    // Forward correlation ID and service metadata
    onProxyReq: (proxyReq, req) => {
      proxyReq.setHeader('X-Correlation-ID', req.correlationId);
      proxyReq.setHeader('X-Gateway-Service', SERVICE_NAME);
      proxyReq.setHeader('X-Forwarded-By', SERVICE_NAME);
      proxyReq.setHeader('Connection', 'keep-alive');
      
      // Log proxy request
      console.log(`🔀 [${req.correlationId}] Proxying to ${config.name}: ${req.method} ${req.url}`);
    },
    
    // Handle proxy response
    onProxyRes: (proxyRes, req) => {
      const duration = Date.now() - req.startTime;
      console.log(`✅ [${req.correlationId}] Response from ${config.name}: ${proxyRes.statusCode} (${duration}ms)`);
      
      // Add timing header
      proxyRes.headers['X-Response-Time'] = `${duration}ms`;
      proxyRes.headers['X-Service-Name'] = config.name;
    },
    
    // Error handling
    onError: (err, req, res) => {
      const duration = Date.now() - req.startTime;
      console.error(`❌ [${req.correlationId}] Proxy Error for ${config.name}:`, err.message);
      
      // Return standardized error response
      if (!res.headersSent) {
        res.status(502).json({
          success: false,
          error: {
            code: 'SERVICE_UNAVAILABLE',
            message: `Failed to connect to ${config.name}`,
            service: route,
            details: NODE_ENV === 'development' ? err.message : undefined,
          },
          meta: {
            timestamp: new Date().toISOString(),
            correlationId: req.correlationId,
            duration: `${duration}ms`,
          },
        });
      }
    },
    
    on: {
      proxyReq: fixRequestBody,
    },
    
    logger: console,
    followRedirects: true,
  };

  app.use(`/${route}`, createProxyMiddleware(proxyOptions));
  console.log(`🔌 Registered route /${route} → ${config.url} (${config.name})`);
});

// ========================================
// HEALTH & MONITORING ENDPOINTS
// ========================================

// Main health check
app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    service: SERVICE_NAME,
    version: "2.0.0",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Detailed health check with service status
app.get("/health/detailed", async (req, res) => {
  const serviceHealth = {};
  
  // Check each service (simplified - you can enhance with actual health checks)
  Object.entries(serviceRoutes).forEach(([name, config]) => {
    serviceHealth[name] = {
      url: config.url,
      status: 'unknown', // In production, ping the service
    };
  });

  res.json({
    status: "healthy",
    service: SERVICE_NAME,
    version: "2.0.0",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    services: serviceHealth,
    environment: NODE_ENV,
  });
});

// Readiness probe
app.get("/ready", (req, res) => {
  res.json({
    ready: true,
    service: SERVICE_NAME,
    timestamp: new Date().toISOString(),
  });
});

// Liveness probe
app.get("/live", (req, res) => {
  res.json({
    alive: true,
    service: SERVICE_NAME,
    timestamp: new Date().toISOString(),
  });
});

// Root endpoint
app.get("/", (req, res) => {
  res.json({
    message: "🚀 Evolve AI API Gateway v2.0",
    environment: NODE_ENV,
    availableRoutes: Object.keys(serviceRoutes).map(route => `/${route}`),
    documentation: "/api-docs",
    health: "/health",
    meta: {
      timestamp: new Date().toISOString(),
      correlationId: req.correlationId,
    },
  });
});

// ========================================
// ERROR HANDLING
// ========================================

// 404 handler
app.use((req, res) => {
  console.warn(`⚠️ [${req.correlationId}] 404 Not Found: ${req.method} ${req.originalUrl}`);
  
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: 'The requested resource was not found',
      path: req.originalUrl,
    },
    meta: {
      timestamp: new Date().toISOString(),
      correlationId: req.correlationId,
    },
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(`🚨 [${req.correlationId || 'NO-ID'}] Gateway Error:`, err);
  
  res.status(err.status || 500).json({
    success: false,
    error: {
      code: err.code || 'INTERNAL_SERVER_ERROR',
      message: err.message || 'An unexpected error occurred',
      details: NODE_ENV === 'development' ? err.stack : undefined,
    },
    meta: {
      timestamp: new Date().toISOString(),
      correlationId: req.correlationId,
    },
  });
});

// ========================================
// SERVER STARTUP
// ========================================

const server = app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   🚀 Evolve AI API Gateway v2.0                          ║
║                                                           ║
║   Port:        ${PORT}                                        ║
║   Environment: ${NODE_ENV}                          ║
║   Node:        ${process.version}                               ║
║                                                           ║
║   Available Routes:                                       ║
${Object.entries(serviceRoutes).map(([route, config]) => 
  `║     /${route.padEnd(12)} → ${config.url.padEnd(30)} ║`
).join('\n')}
║                                                           ║
║   Health:      http://localhost:${PORT}/health              ║
║   Status:      http://localhost:${PORT}/                    ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
  `);
});

// ========================================
// GRACEFUL SHUTDOWN
// ========================================

const shutdown = (signal) => {
  console.log(`\n⚠️ ${signal} received. Starting graceful shutdown...`);
  
  server.close(() => {
    console.log('✅ HTTP server closed');
    console.log('👋 API Gateway shutdown complete');
    process.exit(0);
  });

  // Force exit after 30 seconds
  setTimeout(() => {
    console.error('❌ Forced shutdown after timeout');
    process.exit(1);
  }, 30000);
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

// Handle uncaught errors
process.on('uncaughtException', (err) => {
  console.error('💥 Uncaught Exception:', err);
  shutdown('UNCAUGHT_EXCEPTION');
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
});

export default app;
