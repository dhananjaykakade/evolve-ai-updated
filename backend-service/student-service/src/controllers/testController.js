// sourcery skip: use-braces

import apiHandler from '../utils/ApiHandler.js';
import ResponseHandler from '../utils/CustomResponse.js';
import CodingAnswer from "../models/codingAnswerModel.js";
import MCQAnswer from "../models/MCQanswer.js";
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
try {
  const { testId } = req.params;
  const { studentId } = req.body;

  if (!studentId || !testId) {
    return ResponseHandler.badRequest(res, "studentId and testId are required.");
  }

  // 1️⃣ Fetch test metadata from Teacher Service
  const testResponse = await axios.get(`http://localhost:9001/teacher/tests/${testId}`);
  const test = testResponse.data.data;

  if (!test) {
    return ResponseHandler.notFound(res, "Test not found.");
  }
  console.log("Test metadata:", test);

  // 2️⃣ Check if already started
  if (test.type === "MCQ") {
    const existing = await MCQAnswer.findOne({ testId, studentId });
    if (existing) {
      return ResponseHandler.conflict(res, "MCQ test already started for this student.");
    }

    // 3️⃣ Fetch MCQ questions
    const questionResponse = await axios.get(`http://localhost:9001/teacher/questions/${testId}`);
    console.log("MCQ questions:", questionResponse.data.data);
    const questions = questionResponse.data.data;

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
    const questionResponse = await axios.get(`http://localhost:9001/teacher/coding/${testId}`);
    console.log("Coding questions:", questionResponse.data.data);
    const questions = questionResponse.data.data;

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
} catch (error) {
  console.log("Error starting test:", error.message);
}
  });


  export const submitTest = apiHandler(async (req, res) => {
    const { testId } = req.params;
    const { studentId, warningCount = 0,isAutoSubmitted= false } = req.body;
  
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
      mcqRecord.warningCount = warningCount;
      mcqRecord.isAutoSubmitted = isAutoSubmitted; // Mark as auto-submitted
      await mcqRecord.save();
  
      return ResponseHandler.success(res, 200, "MCQ Test submitted successfully.");
  
    } else if (test.type === "CODING") {
      const codingRecord = await CodingAnswer.findOne({ testId, studentId });
      if (!codingRecord) return ResponseHandler.notFound(res, "Test record not found.");
      if (codingRecord.submittedAt) return ResponseHandler.conflict(res, "Test already submitted.");
  
      codingRecord.submittedAt = new Date();
      codingRecord.warningCount = warningCount;
      codingRecord.isAutoSubmitted = isAutoSubmitted; // Mark as auto-submitted
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

// create a api for checking already submitted test or autosubmitted tests find both mcq and coding 

export const checkAllTestStatuses = apiHandler(async (req, res) => {
  const { studentId } = req.params;

  if (!studentId) {
    return ResponseHandler.badRequest(res, "studentId is required.");
  }


    const mcqRecords = await MCQAnswer.find({ studentId });
    const codingRecords = await CodingAnswer.find({ studentId });

    const testStatusMap = {};

    // Process MCQ records
    mcqRecords.forEach((record) => {
      const testId = record.testId.toString();
      if (!testStatusMap[testId]) testStatusMap[testId] = {};

      if (record.submittedAt) {
        testStatusMap[testId].mcq = record.isAutoSubmitted ? "terminated" : "submitted";
      } else {
        testStatusMap[testId].mcq = "not submitted";
      }

      testStatusMap[testId].mcqAutoSubmitted = record.isAutoSubmitted || false;
    });

    // Process Coding records
    codingRecords.forEach((record) => {
      const testId = record.testId.toString();
      if (!testStatusMap[testId]) testStatusMap[testId] = {};

      if (record.submittedAt) {
        testStatusMap[testId].coding = record.isAutoSubmitted ? "terminated" : "submitted";
      } else {
        testStatusMap[testId].coding = "not submitted";
      }

      testStatusMap[testId].codingAutoSubmitted = record.isAutoSubmitted || false;
    });

    // Fill missing records as "not started"
    Object.keys(testStatusMap).forEach((testId) => {
      const status = testStatusMap[testId];

      if (!status.mcq) {
        status.mcq = "not started";
        status.mcqAutoSubmitted = false;
      }

      if (!status.coding) {
        status.coding = "not started";
        status.codingAutoSubmitted = false;
      }
    });

    return ResponseHandler.success(
      res,
      200,
      "All test statuses fetched successfully.",
      testStatusMap
    );
});

// new code