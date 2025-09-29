
import mongoose from "mongoose";
import dotenv from "dotenv";
import {logger} from "./logger.js";

dotenv.config();
// Prefer docker network hostnames by default in containers, and correct db name for student service
const  MONGO_URI = process.env.MONGO_URI || "mongodb://mongodb:27017/evolveai_student";

const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI);

    logger.info("✅ MongoDB Connected Successfully for student");
  } catch (error) {
    logger.error("❌ MongoDB Connection Failed: student", error);
    process.exit(1);
  }
};

export default connectDB;
