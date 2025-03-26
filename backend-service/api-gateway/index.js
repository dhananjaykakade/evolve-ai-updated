import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import { createProxyMiddleware } from "http-proxy-middleware"; // Import proxy middleware
import { execSync } from "child_process";

dotenv.config();

const app = express();
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
    exposedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());
app.use(morgan("dev"));

const services = {
  auth: process.env.AUTH_SERVICE_URL || "http://localhost:8001",
  teacher: process.env.TEACHER_SERVICE_URL || "http://localhost:8005",
  student: process.env.STUDENT_SERVICE_URL || "http://localhost:8090",
  grading: process.env.GRADING_SERVICE_URL || "http://localhost:8002",
  notification: process.env.NOTIFICATION_SERVICE_URL || "http://localhost:8003",
};

// Function to check if Docker is running
const isDockerRunning = () => {
  try {
    const output = execSync("docker ps").toString();
    return output.includes("CONTAINER ID");
  } catch (error) {
    return false;
  }
};

// Start Docker if not running
const startDocker = () => {
  console.log("🔍 Checking Docker status...");
  if (!isDockerRunning()) {
    console.log("🚀 Starting Docker services...");
    try {
      execSync("docker-compose up -d", { stdio: "inherit" });
      console.log("✅ Docker containers are running!");
    } catch (error) {
      console.error("❌ Failed to start Docker:", error);
      process.exit(1);
    }
  } else {
    console.log("✅ Docker is already running.");
  }
};

// Start Docker before launching the server
startDocker();

// Define proxy for each microservice
app.use(
  "/auth",
  createProxyMiddleware({
    target: services.auth,
    changeOrigin: true,
    pathRewrite: { "^/auth": "" }, // Remove "/auth" prefix when forwarding
  })
);

app.use(
  "/teacher",
  createProxyMiddleware({
    target: services.teacher,
    changeOrigin: true,
    pathRewrite: { "^/teacher": "" },
  })
);

app.use(
  "/student",
  createProxyMiddleware({
    target: services.student,
    changeOrigin: true,
    pathRewrite: { "^/student": "" },
  })
);

app.use(
  "/grading",
  createProxyMiddleware({
    target: services.grading,
    changeOrigin: true,
    pathRewrite: { "^/grading": "" },
  })
);

app.use(
  "/notification",
  createProxyMiddleware({
    target: services.notification,
    changeOrigin: true,
    pathRewrite: { "^/notification": "" },
  })
);

app.get("/", (req, res) => {
  res.send("✅ API Gateway is running...");
});

const PORT = process.env.PORT || 9000;
app.listen(PORT, () => console.log(`🚀 API Gateway running on port ${PORT}`));
