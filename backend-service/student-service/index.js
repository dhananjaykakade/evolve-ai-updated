import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import errorMiddleware from "./src/middleware/errorMiddleware.js"
import submissionRoute from "./src/routes/submissionRoute.js"
import connectDB from "./src/config/connection.js"; // Ensure you import the database connection


import ResponseHandler from "./src/utils/CustomResponse.js";
import { httpLogger } from "./src/config/logger.js";
dotenv.config();
connectDB()
const app = express();
app.use(cors(
  {
    origin: "*", // Allow requests from any origin
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true, // Enable cookies for cross-origin requests
    // exposedHeaders: ["Content-Type", "Authorization"], // Expose required headers for CORS
  }
));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));



app.use(httpLogger);

app.post('/', function(req, res) {
  const { name } = req.body
  res.json({
    message: "Hello, World!",
    timestamp: new Date().toISOString(),
    name
  });
})

// Routes

app.use("/submissions", submissionRoute);
// Handle 404 Not Found
app.use((req, res, next) => {
  ResponseHandler.notFound(res);
});


// Global error handler middleware
app.use(errorMiddleware);

const PORT = process.env.PORT || 8090;
app.listen(PORT, () => console.log(`🚀 student Service running on port ${PORT}`));
