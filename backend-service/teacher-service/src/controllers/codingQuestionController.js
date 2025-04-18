import Test from '../models/testModel.js';
import ResponseHandler from "../utils/CustomResponse.js";
import apiHandler from "../utils/ApiHandler.js";
import CodingQuestion from '../models/CodingQuestion.js';
import axios from "axios"


export const addCodingQuestion = apiHandler(async (req, res) => {
    const { testId, title, description, difficulty, starterCode, testCases, marks ,language} = req.body;
  
    // Validate input
    if (!testId || !title || !description || !difficulty || !starterCode || !testCases || !marks || !language) {
      return ResponseHandler.badRequest(res, "Please provide all required fields.");
    }
  
    // Check if test exists
    const testExists = await Test.findById(testId);
    if (!testExists) {
      return ResponseHandler.notFound(res, "Coding Test not found.");
    }

    if (testExists.type !== 'CODING') {
        return ResponseHandler.badRequest(res, 'This test is not a coding test.');
      }


  
    // Create new coding question
    const newCodingQuestion = await CodingQuestion.create({
      testId,
      title,
      description,
      difficulty,
      starterCode,
      testCases,
      marks,
    language,
    });
  
    return ResponseHandler.success(res, 201, "Coding question added successfully.", newCodingQuestion);
  });

  export const getAllCodingQuestions = apiHandler(async (req, res) => {
    const { testId } = req.params;
  
    const questions = await CodingQuestion.find({ testId });
  
    return ResponseHandler.success(res, 200, "Coding questions fetched successfully.", questions);
  });


  export const getCodingQuestionById = apiHandler(async (req, res) => {
    const { questionId } = req.params;
  
    const question = await CodingQuestion.findById(questionId);
    if (!question) {
      return ResponseHandler.notFound(res, "Coding question not found.");
    }
  
    return ResponseHandler.success(res, 200, "Coding question fetched successfully.", question);
  });

  export const updateCodingQuestion = apiHandler(async (req, res) => {
    const { questionId } = req.params;
    const updates = req.body;
  
    const updatedQuestion = await CodingQuestion.findByIdAndUpdate(questionId, updates, { new: true });
    if (!updatedQuestion) {
      return ResponseHandler.notFound(res, "Coding question not found.");
    }
  
    return ResponseHandler.success(res, 200, "Coding question updated successfully.", updatedQuestion);
  });

  export const deleteCodingQuestion = apiHandler(async (req, res) => {
    const { questionId } = req.params;
  
    const deleted = await CodingQuestion.findByIdAndDelete(questionId);
    if (!deleted) {
      return ResponseHandler.notFound(res, "Coding question not found.");
    }
  
    return ResponseHandler.success(res, 200, "Coding question deleted successfully.");
  });