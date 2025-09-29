import express from "express";
import connectDB from "./src/config/connection.js";
import {logger} from "./src/config/logger.js";
import dotenv from "dotenv";
import cors from "cors";
import assignmentRoutes from "./src/routes/assignmentRoutes.js";
import errorMiddleware from "./src/middleware/errorMiddleware.js";
import testRoutes from "./src/routes/testRoute.js";
import questionRoute from "./src/routes/questionRoute.js";
import codingRoute from "./src/routes/codingRoute.js";

dotenv.config();

// Initialize Express App
const app = express();

// Connect to MongoDB

app.use(cors(
  {
    origin: "*", // Allow requests from any origin
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true, // Enable cookies for cross-origin requests
    exposedHeaders: ["Content-Type", "Authorization"], // Expose required headers for CORS
  }
));

app.use(express.json());

// Routes

app.use("/assignments", assignmentRoutes);

app.use("/tests", testRoutes);
app.use("/questions", questionRoute);
app.use("/coding", codingRoute);

app.get("/", (req, res) => {
  res.send("📚 Teacher Service is Running...");
});

// Health and readiness endpoints
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

app.get("/ready", async (req, res) => {
  // TODO: Optionally verify Mongo connection here
  res.status(200).json({ ready: true });
});

app.use(errorMiddleware);
// Start Server
const PORT = process.env.PORT || 9003;
const server = app.listen(PORT, () => {
  connectDB();
  logger.info(`🚀 Teacher Service running on port ${PORT}`);
});

// Graceful shutdown
const shutdown = () => {
  logger.info("Shutting down Teacher Service...");
  server.close(() => {
    logger.info("HTTP server closed");
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 10000).unref();
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
