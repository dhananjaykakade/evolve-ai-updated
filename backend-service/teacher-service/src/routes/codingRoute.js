import express from 'express';
import {
  addCodingQuestion,
  getAllCodingQuestions,
  getCodingQuestionById,
  updateCodingQuestion,
  deleteCodingQuestion
} from '../controllers/codingQuestionController.js';

const router = express.Router();

router.post('/', addCodingQuestion); // Add coding question
router.get('/:testId', getAllCodingQuestions); // Get all questions for a test
router.get('/question/:questionId', getCodingQuestionById); // Get question by ID
router.put('/question/:questionId', updateCodingQuestion); // Update question
router.delete('/question/:questionId', deleteCodingQuestion); // Delete question

export default router;
