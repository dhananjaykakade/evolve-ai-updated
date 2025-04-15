import express from "express";
import {getAllTestsForStudents,getTestById,startTestForStudent,submitTest } from "../controllers/testController.js";
import { executeCode } from "../controllers/testSubmisstionController.js";

const router = express.Router();

// Route to get all tests for students
router.get("/available", getAllTestsForStudents);
// Route to get test by ID
router.get("/:testId", getTestById);
// Route to start a test for a student
router.post("/:testId/start", startTestForStudent);
// Route to submit a test for a student
router.post("/:testId/submit", submitTest);
// Route to execute code for a test submission
router.post("/execute", executeCode);


export default router;
