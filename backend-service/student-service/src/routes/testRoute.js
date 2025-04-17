import express from "express";
import {getAllTestsForStudents,getTestById,startTestForStudent,submitTest,saveMCQAnswer,saveCodingAnswer,checkAllTestStatuses } from "../controllers/testController.js";
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
// Route to save MCQ answer for a test
router.post("/mcq/:testId/save", saveMCQAnswer);
// Route to save coding answer for a test
router.post("/coding/:testId/save", saveCodingAnswer);
// Route to check all test statuses for a student
router.get("/status/:studentId", checkAllTestStatuses);


export default router;
