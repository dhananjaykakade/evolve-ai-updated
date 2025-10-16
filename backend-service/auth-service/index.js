import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import errorMiddleware from "./src/middlewares/errorMiddleware.js"
import adminRoutes from "./src/routes/adminRoutes.js";
import teacherRoutes from "./src/routes/teacherRoutes.js";
import studentRoutes from "./src/routes/studentRoutes.js";
import ResponseHandler from "./src/utils/CustomResponse.js";
import { httpLogger } from "./src/utils/logger.js";
import prisma from "./src/utils/prisma.js";

// V2 Routes
import adminRoutesV2 from "./src/routes/v2/adminRoutes.js";
import teacherRoutesV2 from "./src/routes/v2/teacherRoutes.js";
import studentRoutesV2 from "./src/routes/v2/studentRoutes.js";

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

// Health and readiness endpoints
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

app.get("/ready", async (req, res) => {
  // TODO: Optionally verify DB connection here (e.g., Prisma query)
  res.status(200).json({ ready: true });
});

// Subjects listing for cross-service consumption (e.g., Mongo seeders)
app.get("/subjects", async (req, res, next) => {
  try {
    const subjects = await prisma.subject.findMany({
      select: { id: true, name: true, code: true }
    });
    res.status(200).json(subjects);
  } catch (err) {
    next(err);
  }
});

app.use("/admin", adminRoutes);
app.use("/teacher", teacherRoutes);
app.use("/students", studentRoutes);

// V2 API Routes with improved features
app.use("/v2/admin", adminRoutesV2);
app.use("/v2/teacher", teacherRoutesV2);
app.use("/v2/student", studentRoutesV2);

app.use(httpLogger);
// Handle 404 Not Found
app.use((req, res, next) => {
  ResponseHandler.notFound(res);
});

// Global error handler middleware
app.use(errorMiddleware);

const PORT = process.env.PORT || 9001;
const server = app.listen(PORT, () => console.log(`🚀 Auth Service running on port ${PORT}`));

// Graceful shutdown
const shutdown = () => {
  console.log("\nShutting down Auth Service...");
  server.close(() => {
    console.log("HTTP server closed");
    process.exit(0);
  });
  // Force exit if not closed in time
  setTimeout(() => process.exit(1), 10000).unref();
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
