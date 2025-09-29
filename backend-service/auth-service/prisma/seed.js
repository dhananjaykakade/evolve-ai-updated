import bcrypt from "bcryptjs";

import pkg from "@prisma/client";
const { PrismaClient } = pkg;
const prisma = new PrismaClient();

async function seed() {
  try {
    console.log("🚀 Seeding data...");

    // 🔹 Hash passwords
    const hashedAdminPassword = await bcrypt.hash("admin123", 10);
    const hashedTeacherPassword = await bcrypt.hash("teacher123", 10);
    const hashedStudentPassword = await bcrypt.hash("student123", 10);

    // 🔹 Seed Admin (Use upsert to prevent duplicate errors)
    const admin = await prisma.admin.upsert({
      where: { email: "admin@example.com" },
      update: {}, // No updates needed
      create: {
        name: "Super Admin",
        instituteName: "EvolveAI Institute",
        email: "admin@example.com",
        password: hashedAdminPassword,
        isVerified: true,
      },
    });

    console.log("✅ Admin added:", admin.email);

    // 🔹 Seed Teachers (Check if exists before inserting)
    const existingTeachers = await prisma.teacher.findMany();
    if (existingTeachers.length === 0) {
      await prisma.teacher.createMany({
        data: [
          { name: "John Doe", email: "john@example.com", password: hashedTeacherPassword, adminId: admin.id },
          { name: "Jane Smith", email: "jane@example.com", password: hashedTeacherPassword, adminId: admin.id },
          { name: "Robert Brown", email: "robert@example.com", password: hashedTeacherPassword, adminId: admin.id }
        ]
      });
      console.log("✅ Teachers added.");
    } else {
      console.log("⚠️ Teachers already exist, skipping.");
    }

    // Fetch teacher IDs
    const teacher1 = await prisma.teacher.findFirst({ where: { email: "john@example.com" } });
    const teacher2 = await prisma.teacher.findFirst({ where: { email: "jane@example.com" } });
    const teacher3 = await prisma.teacher.findFirst({ where: { email: "robert@example.com" } });

    // 🔹 Seed Subjects (normalized)
    const existingSubjects = await prisma.subject.findMany();
    if (existingSubjects.length === 0) {
      await prisma.subject.createMany({
        data: [
          { name: "Python", code: "PYTH" },
          { name: "JavaScript", code: "JS" },
          { name: "Java", code: "JAVA" }
        ]
      });
      console.log("✅ Subjects added.");
    } else {
      console.log("⚠️ Subjects already exist, skipping.");
    }

    // Fetch subjects
    const pythonSubject = await prisma.subject.findFirst({ where: { code: "PYTH" } });
    const jsSubject = await prisma.subject.findFirst({ where: { code: "JS" } });
    const javaSubject = await prisma.subject.findFirst({ where: { code: "JAVA" } });

    // 🔹 Seed CS Courses linked to Subjects
    const existingCourses = await prisma.course.findMany();
    if (existingCourses.length === 0) {
      const subjects = [pythonSubject, jsSubject, javaSubject];
      const teachers = [teacher1, teacher2, teacher3];
      const coursesData = Array.from({ length: 15 }).map((_, i) => ({
        name: `${subjects[i % subjects.length].name} Course #${i + 1}`,
        subjectId: subjects[i % subjects.length].id,
        teacherId: teachers[i % teachers.length].id,
      }));
      await prisma.course.createMany({ data: coursesData });
      console.log(`✅ ${coursesData.length} Courses added.`);
    } else {
      console.log("⚠️ Courses already exist, skipping.");
    }

    // Fetch courses
    const courses = await prisma.course.findMany();

    // 🔹 Seed 15 Students
    const existingStudents = await prisma.student.findMany();
    if (existingStudents.length === 0) {
      const studentsData = Array.from({ length: 15 }).map((_, i) => ({
        name: `Student ${i + 1}`,
        email: `student${i + 1}@example.com`,
        password: hashedStudentPassword,
        adminId: admin.id,
      }));
      await prisma.student.createMany({ data: studentsData });
      console.log(`✅ ${studentsData.length} Students added.`);
    } else {
      console.log("⚠️ Students already exist, skipping.");
    }

    // Fetch student IDs
    const students = await prisma.student.findMany();

    // 🔹 Seed Course Enrollments (Assign students randomly to courses) with subjectId
    const existingEnrollments = await prisma.courseEnrollment.findMany();
    if (existingEnrollments.length === 0) {
      const enrollments = students.slice(0, 15).map((student, index) => {
        const course = courses[index % courses.length];
        return { studentId: student.id, courseId: course.id, subjectId: course.subjectId };
      });

      await prisma.courseEnrollment.createMany({ data: enrollments });
      console.log(`✅ ${enrollments.length} Students enrolled in Courses.`);
    } else {
      console.log("⚠️ Students already enrolled, skipping.");
    }

    console.log("🎉 Seeding completed!");
  } catch (error) {
    console.error("❌ Error seeding data:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seed function
seed();
