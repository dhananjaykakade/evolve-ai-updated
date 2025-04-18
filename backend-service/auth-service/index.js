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
app.use(express.urlencoded({ extended: true }));

// Admin routes
app.get('/',(req,res) => {
  res.send("default auth route")
})
app.post("/", (req, res) => {
  console.log("Received body:", req.body); // Debugging log
  if (!req.body || Object.keys(req.body).length === 0) {
    return res.status(400).json({ error: "No data received in request body" });
  }

  const { name } = req.body;
  res.json({ name });
});

app.use("/admin", adminRoutes);
app.use("/teacher", teacherRoutes);
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
