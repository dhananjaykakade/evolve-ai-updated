import mongoose from "mongoose";
import dotenv from "dotenv";
import Assignment from "../models/assignmentModel.js"; // Adjust if needed

dotenv.config();
const MONGO_URI="mongodb+srv://nodejs:DYgiTCC37m61MrUz@cluster0.hsqy5h8.mongodb.net/evolveai_teacher"

// ✅ Sample Assignments
const assignments = [
  {
    title: "Machine Learning Basics",
    description: "Introduction to ML concepts.",
    dueDate: new Date("2025-06-30"),
    teacherId: "660b123456789abcd0123456",
    course: "cs301",
    useAI: true,
    submissionType: "FILE",
    status: "PUBLISHED",
    materials: "https://res.cloudinary.com/demo/image/upload/v1710000000/assignments/ml_basics.pdf"
  },
  {
    title: "Data Structures and Algorithms",
    description: "Understanding data structures and algorithms.",
    dueDate: new Date("2025-06-30"),
    teacherId: "660b123456789abcd0123456",
    course: "cs201",
    useAI: false,
    submissionType: "CODE",
    status: "PUBLISHED",
    materials: "https://res.cloudinary.com/demo/image/upload/v1710000000/assignments/dsa_notes.pdf"
  },
  {
    title: "Web Development Fundamentals",
    description: "HTML, CSS, and JavaScript basics.",
    dueDate: new Date("2024-04-25"),
    teacherId: "660b123456789abcd0123456",
    course: "cs501",
    useAI: true,
    submissionType: "TEXT",
    status: "PUBLISHED",
    materials: "https://res.cloudinary.com/demo/image/upload/v1710000000/assignments/web_dev.pdf"
  },
  {
    title: "Advanced Python Programming",
    description: "Diving deep into Python.",
    dueDate: new Date("2024-04-28"),
    teacherId: "660b123456789abcd0123458",
    course: "cs101",
    useAI: false,
    submissionType: "CODE",
    status: "CLOSED",
    materials: "https://res.cloudinary.com/demo/image/upload/v1710000000/assignments/python.pdf"
  },
  {
    title: "Database Management Systems",
    description: "SQL and NoSQL database fundamentals.",
    dueDate: new Date("2025-05-10"),
    teacherId: "660b123456789abcd0123456",
    course: "cs401",
    useAI: true,
    submissionType: "FILE",
    status: "DRAFT",
    materials: "https://res.cloudinary.com/demo/image/upload/v1710000000/assignments/dbms.pdf"
  },
  {
    title: "Cybersecurity Basics",
    description: "Understanding the fundamentals of cybersecurity.",
    dueDate: new Date("2024-05-15"),
    teacherId: "660b123456789abcd0123456",
    course: "cs601",
    useAI: false,
    submissionType: "TEXT",
    status: "PUBLISHED",
    materials: "https://res.cloudinary.com/demo/image/upload/v1710000000/assignments/cybersecurity.pdf"
  },
  {
    title: "Operating Systems Concepts",
    description: "Process scheduling, memory management, and more.",
    dueDate: new Date("2024-05-20"),
    teacherId: "660b123456789abcd0123456",
    course: "cs701",
    useAI: true,
    submissionType: "FILE",
    status: "CLOSED",
    materials: "https://res.cloudinary.com/demo/image/upload/v1710000000/assignments/os_concepts.pdf"
  },
  {
    title: "Artificial Intelligence Fundamentals",
    description: "Basics of AI, machine learning, and deep learning.",
    dueDate: new Date("2024-05-25"),
    teacherId: "660b123456789abcd0123456",
    course: "cs801",
    useAI: true,
    submissionType: "TEXT",
    status: "DRAFT",
    materials: "https://res.cloudinary.com/demo/image/upload/v1710000000/assignments/ai_fundamentals.pdf"
  },
  {
    title: "Blockchain and Cryptocurrency",
    description: "Understanding blockchain technology.",
    dueDate: new Date("2024-06-01"),
    teacherId: "660b123456789abcd0123456",
    course: "cs901",
    useAI: false,
    submissionType: "FILE",
    status: "CLOSED",
    materials: "https://res.cloudinary.com/demo/image/upload/v1710000000/assignments/blockchain.pdf"
  },
  {
    title: "Cloud Computing Essentials",
    description: "Introduction to cloud computing and AWS services.",
    dueDate: new Date("2024-06-05"),
    teacherId: "660b123456789abcd0123456",
    course: "cs1001",
    useAI: true,
    submissionType: "CODE",
    status: "CLOSED",
    materials: "https://res.cloudinary.com/demo/image/upload/v1710000000/assignments/cloud_computing.pdf"
  }
];

const seedDB = async () => {
  try {
    await mongoose.connect(MONGO_URI);

    console.log("🚀 Connected to MongoDB...");

    // Clear existing assignments
    await Assignment.deleteMany();
    console.log("🗑️ Removed old assignments.");

    // Insert new assignments
    await Assignment.insertMany(assignments);
    console.log("✅ 10 Assignments added successfully.");

    mongoose.connection.close();
  } catch (error) {
    console.error("❌ Error seeding data:", error);
    mongoose.connection.close();
  }
};

seedDB();
