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
app.use(cors());
app.use(express.json());


app.use("/auth/admin", adminRoutes);
app.use("/auth/teacher", teacherRoutes);
app.use("/auth/student", studentRoutes);

app.use(httpLogger);
// Handle 404 Not Found
app.use((req, res, next) => {
  ResponseHandler.notFound(res);
});

// Global error handler middleware
app.use(errorMiddleware);

const PORT = process.env.PORT || 8001;
app.listen(PORT, () => console.log(`🚀 Auth Service running on port ${PORT}`));
