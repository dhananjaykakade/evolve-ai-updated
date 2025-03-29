import express from "express";
import connectDB from "./src/config/connection.js";
import {logger} from "./src/config/logger.js";
import dotenv from "dotenv";
import cors from "cors";
import assignmentRoutes from "./src/routes/assignmentRoutes.js";
import errorMiddleware from "./src/middleware/errorMiddleware.js";


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

app.get("/", (req, res) => {
  res.send("📚 Teacher Service is Running...");
});

app.use(errorMiddleware);
// Start Server
const PORT = process.env.PORT || 8005;
app.listen(PORT, () => {
  connectDB();
  logger.info(`🚀 Teacher Service running on port ${PORT}`);
});
