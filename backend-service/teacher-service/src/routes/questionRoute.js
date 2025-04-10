import express from "express";
const router = express.Router();

import { addQuestion, getQuestionsByTestId, deleteQuestion, updateQuestion } from "../controllers/questionController.js";



router.post("/", addQuestion);
router.get("/:testId", getQuestionsByTestId);
router.put("/:id", updateQuestion);
router.delete("/:id", deleteQuestion);

export default router;