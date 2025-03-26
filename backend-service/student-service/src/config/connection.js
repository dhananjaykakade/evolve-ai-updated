
import mongoose from "mongoose";
import dotenv from "dotenv";
import {logger} from "./logger.js";

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    logger.info("✅ MongoDB Connected Successfully");
  } catch (error) {
    logger.error("❌ MongoDB Connection Failed:", error);
    process.exit(1);
  }
};

export default connectDB;
