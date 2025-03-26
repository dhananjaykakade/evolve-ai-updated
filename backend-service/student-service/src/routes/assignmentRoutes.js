import express from "express";
import upload from "../middleware/upload.js"; 
import { createAssignment, getAssignments, updateAssignment, deleteAssignment } from "../controllers/assignmentRoute.js";

const router = express.Router();

router.post("/", upload.single("file"), createAssignment);
router.get("/", getAssignments);
router.put("/:id", updateAssignment);
router.delete("/:id", deleteAssignment);

export default router;
