import express from "express";
import { registerAdmin, adminLogin,   createTeacher,
    createStudent,
    getTeachers,
    getStudents,
    deleteTeacher,
    updateTeacher,
    updateStudent,
    deleteStudent,
    
} from "../controllers/adminController.js";

const router = express.Router();

router.post("/register", registerAdmin);
router.post("/login", adminLogin);
// router.post("/verify-otp", verifyAdminOtp);
router.post("/teachers", createTeacher);
router.put("/teachers/:id", updateTeacher);
router.delete("/teachers/:id", deleteTeacher);
router.get("/teachers/:adminId", getTeachers);

router.post("/students", createStudent);
router.put("/students/:id", updateStudent);
router.delete("/students/:id", deleteStudent);
router.get("/students/:adminId", getStudents);

export default router;
