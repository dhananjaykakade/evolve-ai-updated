import express from "express";
import { createTest,getAllTests,getTestById,deleteTest,updateTest,getAvailableTests,evaluateMCQTest,getMCQAnswersWithCorrectness ,evaluateCodingTest} from "../controllers/testController.js";
const router = express.Router();

router.get("/", getAllTests);
router.get("/available", getAvailableTests);
router.post("/", createTest);
router.get("/:id", getTestById);
router.put("/:id", updateTest);
router.delete("/:id", deleteTest);
router.post("/evaluate", evaluateMCQTest); // Evaluate MCQ test
router.get("/answers/:testId/:studentId", getMCQAnswersWithCorrectness); // Get answers with correctness for a test
router.post("/evaluateCoding", evaluateCodingTest); // Evaluate coding test



export default router;