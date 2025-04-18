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
// export const adminLogin = apiHandler(async (req, res) => {
//   const { email, password } = req.body;
//   const admin = await prisma.admin.findUnique({ where: { email } });
//   if (!admin) return ResponseHandler.notFound(res, "Admin not found.");

//   const isValidPassword = await bcrypt.compare(password, admin.password);
//   if (!isValidPassword) return ResponseHandler.unauthorized(res, "Invalid credentials.");

//   const otp = generateOTP();
//   await redis.set(`otp:${email}`, otp, "EX", 300);

//   await emailQueue.add("sendOTP", { email, otp });

//   return ResponseHandler.success(res, 200, "OTP sent to email.");
// });

/**
 * 🔹 OTP Verification (Admin Only)
 */
// export const verifyAdminOtp = apiHandler(async (req, res) => {
//   const { email, otp } = req.body;
//   const storedOtp = await redis.get(`otp:${email}`);

//   if (!storedOtp || storedOtp !== otp) return ResponseHandler.unauthorized(res, "Invalid OTP.");

//   await redis.del(`otp:${email}`);

//   const admin = await prisma.admin.findUnique({ where: { email } });
//   const token = generateToken(admin);

//   return ResponseHandler.success(res, 200, "OTP verified successfully", { admin, token });
// });

// create

export const adminLogin = async (req, res) => {
  const { email, password } = req.body;
  try {
    const admin = await prisma.admin.findUnique({ where: { email } });
    if (!admin) return res.status(404).json({ message: "Admin not found" });

    const match = await bcrypt.compare(password, admin.password);
    if (!match) return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: admin.id, email: admin.email }, "secret", { expiresIn: "1d" });
    res.json({ token, admin });
  } catch (err) {
    res.status(500).json({ message: "Login failed", error: err.message });
  }
};

const sendFakeEmail = (email, password) => {
  // Simulate sending an email with credentials
  console.log(`Sending email to ${email} with password: ${password}`);
  // In a real application, you would use a service like SendGrid or Nodemailer here
}

export const createTeacher = async (req, res) => {
  const { name, email, password, adminId } = req.body;
  try {
    const hashed = await bcrypt.hash(password, 10);
    const teacher = await prisma.teacher.create({
      data: { name, email, password: hashed, adminId }
    });

    sendFakeEmail(email, password); // simulate sending credentials
    res.status(201).json(teacher);
  } catch (error) {
    res.status(500).json({ message: "Failed to create teacher", error: error.message });
  }
};

export const updateTeacher = async (req, res) => {
  const { id } = req.params;
  const { name, email, password ,isActive} = req.body;

  try {
    const updateData = { name, email ,isActive};
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const updatedTeacher = await prisma.teacher.update({
      where: { id },
      data: updateData,
    });

    res.status(200).json(updatedTeacher);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Failed to update teacher', error: error.message });
  }
};


export const deleteTeacher = async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.teacher.delete({
      where: { id },
    });

    res.status(200).json({ message: 'Teacher deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete teacher', error: error.message });
  }
};

// Create Student


// Get Teachers & Students by spefifc admin 
export const getTeachers = async (req, res) => {
  const { adminId } = req.params;
  try {
    const teachers = await prisma.teacher.findMany({ where: { adminId } });
    res.status(200).json(teachers);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch teachers", error: error.message });
  }
};
export const getStudents = async (req, res) => {
  const { adminId } = req.params;
  try {
    const students = await prisma.student.findMany({ where: { adminId } });
    res.status(200).json(students);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch students", error: error.message });
  }
};

// Create student API
export const createStudent = async (req, res) => {
  const { name, email, adminId,course,password } = req.body;
  try {
    const student = await prisma.student.create({
      data: { name, email, adminId,password, course,createdAt: new Date().toISOString() }
    });

    sendFakeEmail(email); // simulate sending credentials (You can customize this as needed)
    res.status(201).json(student);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Failed to create student", error: error.message });
  }
};


// Update student API
export const updateStudent = async (req, res) => {
  const { id } = req.params;
  const { name, email, course,isActive } = req.body;
  
  try {
    const student = await prisma.student.update({
      where: { id },
      data: { name, email, course, isActive }
    });

    res.status(200).json(student);
  } catch (error) {
    res.status(500).json({ message: "Failed to update student", error: error.message });
  }
};

// Delete student API
export const deleteStudent = async (req, res) => {
  const { id } = req.params;
  
  try {
    await prisma.student.delete({
      where: { id }
    });
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete student", error: error.message });
  }
};
