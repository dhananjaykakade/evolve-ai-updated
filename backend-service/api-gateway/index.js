import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";

dotenv.config(); // Load environment variables

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
app.use(morgan("dev")); // Logging HTTP requests

const services = {
  auth: process.env.AUTH_SERVICE_URL || "http://localhost:8001",
  teacher: process.env.TEACHER_SERVICE_URL || "http://localhost:8005",
  student: process.env.STUDENT_SERVICE_URL || "http://localhost:8090",
  grading: process.env.GRADING_SERVICE_URL || "http://localhost:8002",
  notification: process.env.NOTIFICATION_SERVICE_URL || "http://localhost:8003",
};

app.get("/", (req, res) => {
  res.send("✅ API Gateway is running...");
});

// Function to forward requests dynamically
const forwardRequest = (serviceUrl) => async (req, res) => {
  try {
    const url = serviceUrl + req.url;
    console.log(`🔄 Forwarding request: ${req.method} ${url}`);

    res.redirect(url);
  } catch (error) {
    console.error(`❌ Error forwarding request to ${serviceUrl}:`, error);
    res.status(500).json({ message: "Service unavailable" });
  }
};

// Define routes for each microservice
app.use("/auth", forwardRequest(services.auth));
app.use("/teacher", forwardRequest(services.teacher));
app.use("/student", forwardRequest(services.student));
app.use("/grading", forwardRequest(services.grading));
app.use("/notification", forwardRequest(services.notification));

const PORT = process.env.PORT || 9000;
app.listen(PORT, () => console.log(`🚀 API Gateway running on port ${PORT}`));
