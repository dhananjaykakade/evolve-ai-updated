// sourcery skip: use-braces

import apiHandler from '../utils/ApiHandler.js';
import ResponseHandler from '../utils/CustomResponse.js';
import CodingAnswer from "../models/codingAnswerModel.js";
import axios from "axios";


export const getAllTestsForStudents = apiHandler(async (req, res) => {
    try {
      const response = await axios.get("http://localhost:9001/teacher/tests/available"); 
      const categorizedTests = response.data.data;
  
      return ResponseHandler.success(
        res,
        200,
        "Fetched test list successfully.",
        categorizedTests
      );
    } catch (error) {
      console.error("Error fetching tests from Teacher Service:", error.message);
      return ResponseHandler.error(res, 500, "Failed to fetch test list.");
    }
  });


export const getTestById = apiHandler(async (req, res) => {
    const { testId } = req.params;
  
    if (!testId) {
      return ResponseHandler.badRequest(res, "Test ID is required.");
    }
  
    try {
      const response = await axios.get(`http://localhost:9001/teacher/tests/${testId}`);
      const testDetails = response.data.data;
  
      return ResponseHandler.success(
        res,
        200,
        "Fetched test details successfully.",
        testDetails
      );
    } catch (error) {
      console.error("Error fetching test details:", error.message);
      return ResponseHandler.error(res, 500, "Failed to fetch test details.");
    }
  }
);

export const startTestForStudent = apiHandler(async (req, res) => {
    const { testId } = req.params;
    const { studentId } = req.body;
  
    if (!studentId || !testId) {
      return ResponseHandler.badRequest(res, "studentId and testId are required.");
    }
  
    // 1️⃣ Fetch test metadata from Teacher Service
    const testResponse = await axios.get(`http://localhost:9000/teacher/tests/${testId}`);
    const test = testResponse.data.data;
  
    if (!test) {
      return ResponseHandler.notFound(res, "Test not found.");
    }
  
    // 2️⃣ Check if already started
    if (test.type === "MCQ") {
      const existing = await MCQAnswer.findOne({ testId, studentId });
      if (existing) {
        return ResponseHandler.conflict(res, "MCQ test already started for this student.");
      }
  
      // 3️⃣ Fetch MCQ questions
      const questionResponse = await axios.get(`http://localhost:9000/teacher/questions/${testId}`);
      const questions = questionResponse.data.data.questions;
  
      const answers = questions.map(q => ({
        questionId: q._id,
        selectedOptionId: null,
        status: 'unanswered',
      }));
  
      const mcqStart = await MCQAnswer.create({
        testId,
        studentId,
        answers,
        submittedAt: null,
        warningCount: 0,
        isAutoSubmitted: false,
      });
  
      return ResponseHandler.success(res, 201, "MCQ Test started successfully.", mcqStart);
    }
  
    else if (test.type === "CODING") {
      const existing = await CodingAnswer.findOne({ testId, studentId });
      if (existing) {
        return ResponseHandler.conflict(res, "Coding test already started for this student.");
      }
  
      // 3️⃣ Fetch Coding questions
      const questionResponse = await axios.get(`http://localhost:9000/teacher/coding-questions/${testId}`);
      const questions = questionResponse.data.data.questions;
  
      const answers = questions.map(q => ({
        questionId: q._id,
        code: q.starterCode || '',
        status: 'unanswered',
      }));
  
      const codingStart = await CodingAnswer.create({
        testId,
        studentId,
        answers,
        submittedAt: null,
        warningCount: 0,
        isAutoSubmitted: false,
      });
  
      return ResponseHandler.success(res, 201, "Coding Test started successfully.", codingStart);
    }
  
    else {
      return ResponseHandler.badRequest(res, "Unsupported test type.");
    }
  });


  export const submitTest = apiHandler(async (req, res) => {
    const { testId } = req.params;
    const { studentId } = req.body;
  
    if (!studentId || !testId) {
      return ResponseHandler.badRequest(res, "studentId and testId are required.");
    }
  
    // 1️⃣ Fetch test type from Teacher Service
    const testResponse = await axios.get(`http://localhost:9001/teacher/tests/${testId}`);
    const test = testResponse.data.data;
  
    if (!test) {
      return ResponseHandler.notFound(res, "Test not found.");
    }
  
    if (test.type === "MCQ") {
      const mcqRecord = await MCQAnswer.findOne({ testId, studentId });
      if (!mcqRecord) return ResponseHandler.notFound(res, "Test record not found.");
      if (mcqRecord.submittedAt) return ResponseHandler.conflict(res, "Test already submitted.");
      
      mcqRecord.submittedAt = new Date();
      await mcqRecord.save();
  
      return ResponseHandler.success(res, 200, "MCQ Test submitted successfully.");
  
    } else if (test.type === "CODING") {
      const codingRecord = await CodingAnswer.findOne({ testId, studentId });
      if (!codingRecord) return ResponseHandler.notFound(res, "Test record not found.");
      if (codingRecord.submittedAt) return ResponseHandler.conflict(res, "Test already submitted.");
  
      codingRecord.submittedAt = new Date();
      await codingRecord.save();
  
      return ResponseHandler.success(res, 200, "Coding Test submitted successfully.");
  
    } else {
      return ResponseHandler.badRequest(res, "Invalid test type.");
    }
  });


  export const saveMCQAnswer = apiHandler(async (req, res) => {
    const { testId } = req.params;
    const { studentId, questionId, selectedOptionId, status } = req.body;
  
    if (!studentId || !questionId || !testId) {
      return ResponseHandler.badRequest(res, "Missing required fields.");
    }
  
    const mcqRecord = await MCQAnswer.findOne({ testId, studentId });
    if (!mcqRecord) {
      return ResponseHandler.notFound(res, "MCQ Test record not found.");
    }
  
    const answer = mcqRecord.answers.find(ans => ans.questionId.toString() === questionId);
    if (!answer) {
      return ResponseHandler.notFound(res, "Question not found in student record.");
    }
  
    answer.selectedOptionId = selectedOptionId;
    answer.status = status || 'answered';
  
    await mcqRecord.save();
  
    return ResponseHandler.success(res, 200, "Answer saved successfully.");
  });


  export const saveCodingAnswer = apiHandler(async (req, res) => {
    const { testId } = req.params;
    const { studentId, questionId, code, status } = req.body;
  
    if (!studentId || !questionId || !code || !testId) {
      return ResponseHandler.badRequest(res, "Missing required fields.");
    }
  
    const codingRecord = await CodingAnswer.findOne({ testId, studentId });
    if (!codingRecord) {
      return ResponseHandler.notFound(res, "Coding test record not found.");
    }
  
    const answer = codingRecord.answers.find(ans => ans.questionId.toString() === questionId);
    if (!answer) {
      return ResponseHandler.notFound(res, "Question not found in student's coding answers.");
    }
  
    answer.code = code;
    answer.status = status || 'answered';
  
    await codingRecord.save();
  
    return ResponseHandler.success(res, 200, "Code saved successfully.");
  });