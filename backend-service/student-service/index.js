import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import errorMiddleware from "./src/middleware/errorMiddleware.js"

import ResponseHandler from "./src/utils/CustomResponse.js";
import { httpLogger } from "./src/config/logger.js";
dotenv.config();
const app = express();
app.use(cors(
  {
    origin: "*", // Allow requests from any origin
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true, // Enable cookies for cross-origin requests
    exposedHeaders: ["Content-Type", "Authorization"], // Expose required headers for CORS
  }
));
app.use(express.json());



app.use(httpLogger);
// Handle 404 Not Found
app.use((req, res, next) => {
  ResponseHandler.notFound(res);
});

// Global error handler middleware
app.use(errorMiddleware);

const PORT = process.env.PORT || 8090;
app.listen(PORT, () => console.log(`🚀 Auth Service running on port ${PORT}`));
