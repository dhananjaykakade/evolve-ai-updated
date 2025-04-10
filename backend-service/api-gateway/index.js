import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import { createProxyMiddleware, fixRequestBody } from "http-proxy-middleware";
import { execSync } from "child_process";
import helmet from "helmet";
import rateLimit from "express-rate-limit";


dotenv.config();

const NODE_ENV = process.env.NODE_ENV || "development";
const PORT = process.env.PORT || 9001;

const app = express();

// Security Middleware
app.use(helmet());
app.use(
  cors({
    origin: process.env.ALLOWED_ORIGINS?.split(",") || "*",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With","X-Session-ID","x-session-id"],
    credentials: true,
    exposedHeaders: ["Content-Type", "Authorization", "X-Request-Id","X-Session-ID","x-session-id"],
  })
);
app.set('trust proxy', 1); 
// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000000, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later',
  validate: {
    trustProxy: false // Explicitly disable trust proxy for rate limiting
  }
});
app.use(limiter);

// Body parsing
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(morgan("dev"));
// app.set("trust proxy", true);

// Docker management functions
const isDockerRunning = () => {
  try {
    execSync("docker info");
    return true;
  } catch (error) {
    console.error("❌ Docker is not running:", error.message);
    return false;
  }
};

const startDocker = () => {
  if (!isDockerRunning()) {
    console.log("🚀 Starting Docker services...");
    try {
      execSync("docker-compose up -d", { stdio: "inherit" });
      console.log("✅ Docker containers are running!");
    } catch (error) {
      console.error("❌ Failed to start Docker:", error);
      process.exit(1);
    }
  }
};

// Start Docker if needed
if (NODE_ENV === "development") {
  startDocker();
}

// Service configuration
const services = {
  auth: {
    target: process.env.AUTH_SERVICE_URL || "http://localhost:8001",
    pathRewrite: { "^/auth": "" },
  },
  teacher: {
    target: process.env.TEACHER_SERVICE_URL || "http://localhost:8005",
    pathRewrite: { "^/teacher": "" },
  },
  student: {
    target: process.env.STUDENT_SERVICE_URL || "http://localhost:8090",
    pathRewrite: { "^/student": "" },
  },
  grading: {
    target: process.env.GRADING_SERVICE_URL || "http://localhost:5003",
    pathRewrite: { "^/grading": "" },
  },
  notification: {
    target: process.env.NOTIFICATION_SERVICE_URL || "http://localhost:5004",
    pathRewrite: { "^/notification": "" },
  },
  exam: {
    target: process.env.NOTIFICATION_SERVICE_URL || "http://localhost:9005",
    pathRewrite: { "^/exam": "" },
  },
};

// Create proxy middleware for each service
Object.entries(services).forEach(([route, config]) => {
  app.use(
    `/${route}`,
    createProxyMiddleware({
      ...config,
      changeOrigin: true,
      onProxyReq: (proxyReq) => {
        proxyReq.setHeader('Connection', 'keep-alive');
      },
      on: {
        proxyReq: fixRequestBody,
        error: (err, req, res) => {
          console.error(`❌ Proxy Error for ${req.method} ${req.originalUrl}:`, err);
          res.status(502).json({
            error: "Bad Gateway",
            message: `Failed to connect to ${route} service`,
          });
        },
      },
      logger: console,
      followRedirects: true,
      timeout: 10000, // 10 seconds timeout
    })
  );
  console.log(`🔌 Registered route /${route} → ${config.target}`);
});

// Health check endpoint





app.get("/", (req, res) => {
  res.json({
    message: "API Gateway is running",
    environment: NODE_ENV,
    availableServices: Object.keys(services),
  });
});

// Error handling middleware
app.use((err, req ,res, next) => {
  console.error("🚨 Gateway Error:", err);
  res.status(500).json({ error: "Internal Server Error", message: err.message });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 API Gateway running on port ${PORT}`);
  console.log(`🌐 Environment: ${NODE_ENV}`);
  console.log("🔗 Available routes:");
  Object.entries(services).forEach(([route, config]) => {
    console.log(`   /${route} → ${config.target}`);
  });
});