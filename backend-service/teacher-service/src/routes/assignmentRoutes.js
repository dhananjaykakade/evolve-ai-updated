import express from "express";
import upload from "../middleware/upload.js"; 
import { createAssignment, getAssignments, updateAssignment, deleteAssignment,getSingleAssignment,getAssignmentsWithSubmissions } from "../controllers/assignmentRoute.js";

const router = express.Router();

router.post("/", upload.single("file"), createAssignment);

router.get("/:id", getSingleAssignment);
router.get("/", getAssignments);
router.put("/:id", updateAssignment);
router.delete("/:id", deleteAssignment);

router.get("/:teacherId/submissions", getAssignmentsWithSubmissions);

export default router;
