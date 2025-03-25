import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import ResponseHandler from "../utils/CustomResponse.js";
import apiHandler from "../utils/ApiHandler.js";

const prisma = new PrismaClient();

// Generate JWT Token
const generateToken = (user) => {
  return jwt.sign({ id: user.id, email: user.email, role: "teacher" }, process.env.JWT_SECRET, { expiresIn: "1h" });
};

/**
 * 🔹 Teacher Login (Direct JWT)
 */
export const teacherLogin = apiHandler(async (req, res) => {
  const { email, password } = req.body;
  const teacher = await prisma.teacher.findUnique({ where: { email } });
  if (!teacher) return ResponseHandler.notFound(res, "Teacher not found.");

  const isValidPassword = await bcrypt.compare(password, teacher.password);
  if (!isValidPassword) return ResponseHandler.unauthorized(res, "Invalid credentials.");

  const token = generateToken(teacher);

  return ResponseHandler.success(res, 200, "Login successful", { teacher, token });
});
