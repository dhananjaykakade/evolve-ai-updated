
import mongoose from "mongoose";
import dotenv from "dotenv";
import {logger} from "./logger.js";

dotenv.config();

const { MONGO_URI } = process.env;
const mongoUri =  MONGO_URI || "mongodb://127.0.0.1:27017/evolveai_teacher";
const connectDB = async () => {
  try {
    await mongoose.connect(mongoUri);

    logger.info("✅ MongoDB Connected Successfully for teacher");
  } catch (error) {
    logger.error("❌ MongoDB Connection Failed: for teacher", error);
    process.exit(1);
  }
};

export default connectDB;
