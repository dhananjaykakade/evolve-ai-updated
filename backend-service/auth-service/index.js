import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import errorMiddleware from "./src/middlewares/errorMiddleware.js"
import adminRoutes from "./src/routes/adminRoutes.js";
import teacherRoutes from "./src/routes/teacherRoutes.js";
import studentRoutes from "./src/routes/studentRoutes.js";
import ResponseHandler from "./src/utils/CustomResponse.js";
import { httpLogger } from "./src/utils/logger.js";
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

// Admin routes
app.get('/',(req,res) => {
  res.send("default auth route")
})


app.use("/auth/admin", adminRoutes);
app.use("/auth/teacher", teacherRoutes);
app.use("/students", studentRoutes);

app.use(httpLogger);
// Handle 404 Not Found
app.use((req, res, next) => {
  ResponseHandler.notFound(res);
});

// Global error handler middleware
app.use(errorMiddleware);

const PORT = process.env.PORT || 8001;
app.listen(PORT, () => console.log(`🚀 Auth Service running on port ${PORT}`));
