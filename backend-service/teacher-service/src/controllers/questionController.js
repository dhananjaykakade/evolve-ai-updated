import MCQQuestion from "../models/MCQquestion.js";
import Test from "../models/testModel.js";
import apiHandler from "../utils/ApiHandler.js";
import ResponseHandler from "../utils/CustomResponse.js";
import axios from "axios"


export const addQuestion = apiHandler(async (req, res) => {
    const { testId, questionText, options, correctOptionId, marks } = req.body;
  
    if (!testId || !questionText || !options || !correctOptionId || !marks) {
      return ResponseHandler.badRequest(res, "Please provide all required fields.");
    }
  
    const testExists = await Test.findById(testId);
    if (!testExists) {
      return ResponseHandler.notFound(res, "Test not found.");
    }
  
    const newQuestion = await MCQQuestion.create({
      testId,
      questionText,
      options,
      correctOptionId,
      marks
    });
  
    return ResponseHandler.success(res, 201, "Question added successfully.", newQuestion);
  });
  

export const getQuestionsByTestId = apiHandler(async (req, res) => {
    const { testId } = req.params;
  
    const questions = await MCQQuestion.find({ testId });
  
    return ResponseHandler.success(res, 200, "Questions fetched successfully.", questions);
  });
  

export const updateQuestion = apiHandler(async (req, res) => {
    const { id } = req.params;
    const updates = req.body;
  
    const question = await MCQQuestion.findByIdAndUpdate(id, updates, { new: true });
  
    if (!question) {
      return ResponseHandler.notFound(res, "Question not found.");
    }
  
    return ResponseHandler.success(res, 200, "Question updated successfully.", question);
  });


export const deleteQuestion = apiHandler(async (req, res) => {
    const { id } = req.params;
  
    const deleted = await MCQQuestion.findByIdAndDelete(id);
  
    if (!deleted) {
      return ResponseHandler.notFound(res, "Question not found.");
    }
  
    return ResponseHandler.success(res, 200, "Question deleted successfully.", deleted);
  });

// get all questions for a test by id 

export const getAllQuestions = apiHandler(async (req, res) => {

   const { testId } = req.params;
  
    const questions = await MCQQuestion.find({ testId });
  
    return ResponseHandler.success(res, 200, "MCQ questions fetched successfully.", questions);
})