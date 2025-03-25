import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

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

    // 🔹 Seed CS Courses
    const existingCourses = await prisma.course.findMany();
    if (existingCourses.length === 0) {
      await prisma.course.createMany({
        data: [
          { name: "Python Programming", subject: "Python", teacherId: teacher1.id },
          { name: "JavaScript Development", subject: "JavaScript", teacherId: teacher2.id },
          { name: "Java Fundamentals", subject: "Java", teacherId: teacher3.id }
        ]
      });
      console.log("✅ CS Courses added.");
    } else {
      console.log("⚠️ Courses already exist, skipping.");
    }

    // Fetch course IDs
    const course1 = await prisma.course.findFirst({ where: { name: "Python Programming" } });
    const course2 = await prisma.course.findFirst({ where: { name: "JavaScript Development" } });
    const course3 = await prisma.course.findFirst({ where: { name: "Java Fundamentals" } });

    // 🔹 Seed 10 Students
    const existingStudents = await prisma.student.findMany();
    if (existingStudents.length === 0) {
      await prisma.student.createMany({
        data: [
          { name: "Alice Johnson", email: "alice@example.com", password: hashedStudentPassword, adminId: admin.id },
          { name: "Bob Smith", email: "bob@example.com", password: hashedStudentPassword, adminId: admin.id },
          { name: "Charlie Brown", email: "charlie@example.com", password: hashedStudentPassword, adminId: admin.id },
          { name: "David Wilson", email: "david@example.com", password: hashedStudentPassword, adminId: admin.id },
          { name: "Emma Garcia", email: "emma@example.com", password: hashedStudentPassword, adminId: admin.id },
          { name: "Frank Miller", email: "frank@example.com", password: hashedStudentPassword, adminId: admin.id },
          { name: "Grace Lee", email: "grace@example.com", password: hashedStudentPassword, adminId: admin.id },
          { name: "Hannah Walker", email: "hannah@example.com", password: hashedStudentPassword, adminId: admin.id },
          { name: "Isaac Adams", email: "isaac@example.com", password: hashedStudentPassword, adminId: admin.id },
          { name: "Jack Carter", email: "jack@example.com", password: hashedStudentPassword, adminId: admin.id }
        ]
      });
      console.log("✅ 10 Students added.");
    } else {
      console.log("⚠️ Students already exist, skipping.");
    }

    // Fetch student IDs
    const students = await prisma.student.findMany();

    // 🔹 Seed Course Enrollments (Assign students randomly to courses)
    const existingEnrollments = await prisma.courseEnrollment.findMany();
    if (existingEnrollments.length === 0) {
      const enrollments = students.flatMap((student, index) => [
        { studentId: student.id, courseId: index % 3 === 0 ? course1.id : index % 3 === 1 ? course2.id : course3.id }
      ]);

      await prisma.courseEnrollment.createMany({ data: enrollments });

      console.log("✅ Students enrolled in CS Courses.");
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
