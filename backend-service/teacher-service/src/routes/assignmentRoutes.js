import express from "express";
import { createAssignment, getAssignments, updateAssignment,changeAssignmentStatus, deleteAssignment,getSingleAssignment,getAssignmentsWithSubmissions,getStudentAssignmentsWithSubmissions } from "../controllers/assignmentRoute.js";

const router = express.Router();

router.post("/", createAssignment);

router.get("/:id", getSingleAssignment);
router.get("/", getAssignments);
router.put("/:id", updateAssignment);

router.delete("/:id", deleteAssignment);
router.patch("/:id/status", changeAssignmentStatus);
router.get("/:teacherId/submissions", getAssignmentsWithSubmissions);

router.get("/get/students", getStudentAssignmentsWithSubmissions);

export default router;
