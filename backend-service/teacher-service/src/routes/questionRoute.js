import express from "express";
const router = express.Router();

import { addQuestion, getQuestionsByTestId, deleteQuestion, updateQuestion,getAllQuestions } from "../controllers/questionController.js";



router.post("/", addQuestion);
router.get("/:testId", getQuestionsByTestId);
router.put("/:id", updateQuestion);
router.get("/:testId", getAllQuestions); // Get all questions for a test
router.delete("/:id", deleteQuestion);

export default router;