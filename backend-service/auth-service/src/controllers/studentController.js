import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import ResponseHandler from "../utils/CustomResponse.js";
import apiHandler from "../utils/ApiHandler.js";

const prisma = new PrismaClient();

// Generate JWT Token
const generateToken = (user) => {
  return jwt.sign({ id: user.id, email: user.email, role: "student" }, process.env.JWT_SECRET, { expiresIn: "1h" });
};

/**
 * 🔹 Student Login (Direct JWT)
 */
export const studentLogin = apiHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email){
    return ResponseHandler.error(res,400, "please enter email.");
  }
  const student = await prisma.student.findUnique({ where: { email } });
  if (!student) {
    return ResponseHandler.notFound(res, "Student not found.");
  }

  const isValidPassword = await bcrypt.compare(password, student.password);
  if (!isValidPassword) {
    return ResponseHandler.unauthorized(res, "Invalid credentials.");
  }

  const token = generateToken(student);

  return ResponseHandler.success(res, 200, "Login successful", { student, token });
});

// get all students

export const getStudents = apiHandler(async (req, res) => {
  const students = await prisma.student.findMany();
  return ResponseHandler.success(res, 200, "Students fetched successfully", { students });
});



export const getSingleStudent = apiHandler(async (req, res) => {
  const { id } = req.params;
  const student = await prisma.student.findUnique({ where: { id } });
  if (!student) {
    return ResponseHandler.notFound(res, "Student not found.");
  }
  return ResponseHandler.success(res, 200, "Student fetched successfully", { student });
})