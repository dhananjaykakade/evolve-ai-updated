import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import redis from "../utils/redisClient.js";
import emailQueue from "../utils/emailQueue.js";
import ResponseHandler from "../utils/CustomResponse.js";
import apiHandler from "../utils/ApiHandler.js";

const prisma = new PrismaClient();

// Generate OTP
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// Generate JWT Token
const generateToken = (user) => {
  return jwt.sign({ id: user.id, email: user.email, role: "admin" }, process.env.JWT_SECRET, { expiresIn: "1h" });
};

/**
 * 🔹 Register Admin
 */
export const registerAdmin = apiHandler(async (req, res) => {
  const { name, instituteName, email, password } = req.body;

  const existingAdmin = await prisma.admin.findUnique({ where: { email } });
  if (existingAdmin) return ResponseHandler.conflict(res, "Admin already exists.");

  const hashedPassword = await bcrypt.hash(password, 10);

  const admin = await prisma.admin.create({
    data: { name, instituteName, email, password: hashedPassword, isVerified: false }
  });

  return ResponseHandler.success(res, 201, "Admin registered successfully.", { admin });
});

/**
 * 🔹 Admin Login (Requires OTP)
 */
export const adminLogin = apiHandler(async (req, res) => {
  const { email, password } = req.body;
  const admin = await prisma.admin.findUnique({ where: { email } });
  if (!admin) return ResponseHandler.notFound(res, "Admin not found.");

  const isValidPassword = await bcrypt.compare(password, admin.password);
  if (!isValidPassword) return ResponseHandler.unauthorized(res, "Invalid credentials.");

  const otp = generateOTP();
  await redis.set(`otp:${email}`, otp, "EX", 300);

  await emailQueue.add("sendOTP", { email, otp });

  return ResponseHandler.success(res, 200, "OTP sent to email.");
});

/**
 * 🔹 OTP Verification (Admin Only)
 */
export const verifyAdminOtp = apiHandler(async (req, res) => {
  const { email, otp } = req.body;
  const storedOtp = await redis.get(`otp:${email}`);

  if (!storedOtp || storedOtp !== otp) return ResponseHandler.unauthorized(res, "Invalid OTP.");

  await redis.del(`otp:${email}`);

  const admin = await prisma.admin.findUnique({ where: { email } });
  const token = generateToken(admin);

  return ResponseHandler.success(res, 200, "OTP verified successfully", { admin, token });
});
