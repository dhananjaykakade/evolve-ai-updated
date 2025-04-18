import express from "express";
import { createTest,getAllTests,getTestById,deleteTest,updateTest,getAvailableTests,evaluateMCQTest,getTestAnswersWithCorrectness,getAllGradingResults ,evaluateCodingTest,getCodingAnswerByTestIdAndStudentId} from "../controllers/testController.js";
const router = express.Router();

router.get("/", getAllTests);
router.get("/available", getAvailableTests);
router.post("/", createTest);
router.get("/:id", getTestById);
router.put("/:id", updateTest);
router.delete("/:id", deleteTest);
router.post("/evaluate", evaluateMCQTest); // Evaluate MCQ test
// router.get("/answers/:testId/:studentId", getMCQAnswersWithCorrectness); // Get answers with correctness for a test
router.post("/evaluateCoding", evaluateCodingTest); // Evaluate coding test4
router.get("/codingAnswers/:testId/:studentId", getCodingAnswerByTestIdAndStudentId); // Get coding answers for a test
router.get('/answers/:testId/:studentId', getTestAnswersWithCorrectness);
router.get('/get/gradingResults', getAllGradingResults); // Get all grading results for a test

export default router;