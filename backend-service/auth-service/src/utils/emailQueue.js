import { Queue, Worker } from "bullmq";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

// Redis connection options
const connection = {
  host: process.env.REDIS_HOST || "127.0.0.1",
  port: process.env.REDIS_PORT || 6379
};

// Create BullMQ Queue
const emailQueue = new Queue("emailQueue", { connection });

// Email Transporter
const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Create a Worker to process emails
const worker = new Worker(
  "emailQueue",
  async (job) => {
    const { email, otp } = job.data;
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your OTP for Admin Login",
      text: `Your OTP is ${otp}. It will expire in 5 minutes.`
    });
    console.log(`✅ Email sent to ${email}`);
  },
  { connection }
);

worker.on("failed", (job, err) => {
  console.error(`❌ Email job failed for ${job.id}: ${err.message}`);
});

export default emailQueue;
