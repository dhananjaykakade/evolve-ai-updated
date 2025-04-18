// sourcery skip: use-braces

import Test from '../models/testModel.js';
import ResponseHandler from "../utils/CustomResponse.js";
import apiHandler from "../utils/ApiHandler.js";
import CodingQuestion from '../models/CodingQuestion.js';
import MCQQuestion from '../models/MCQquestion.js';
import MCQAnswer from '../models/MCQanswer.js';
import Grading from '../models/grading.js';
import CodingAnswer from '../models/codingAnswerModel.js';

import axios from "axios"

export const createTest = apiHandler(async (req, res) => {
    const {
      title,
      type,
      createdBy,
      course,
      scheduledAt,
      expiresAt,
      totalMarks,
      isPublished
    } = req.body;
  
    if (!title || !type || !createdBy || !course || !scheduledAt || !expiresAt || !totalMarks) {
      return ResponseHandler.badRequest(res, 'Please provide all required fields.');
    }

  
    // 2. ✅ Check if a similar test already exists in MongoDB
    const existingTest = await Test.findOne({ title, course });
  
    if (existingTest) {
      return ResponseHandler.conflict(res, 'A test with the same title already exists for this course.');
    }
  
    // 3. ✅ Create the test
    const newTest = await Test.create({
      title,
      type,
      createdBy,
      course,
      scheduledAt,
      expiresAt,
      totalMarks,
      isPublished: isPublished || false,
    });
  
    return ResponseHandler.success(res, 201, 'Test created successfully.', newTest);
  });


export const getAllTests = apiHandler(async (req, res) => {
    const { course, createdBy, isPublished } = req.query;
  
    const filter = {};
  
    if (course) filter.course = course;
    if (createdBy) filter.createdBy = createdBy;
    if (isPublished !== undefined) filter.isPublished = isPublished === 'true';
  
    const tests = await Test.find(filter).sort({ createdAt: -1 });
  
    return ResponseHandler.success(res, 200, 'Tests fetched successfully.', tests);
  });

export const deleteTest = apiHandler(async (req, res) => {
    const { id } = req.params;
  
    const test = await Test.findById(id);
    if (!test) {
      return ResponseHandler.notFound(res, 'Test not found.');
    }
  
    await Test.findByIdAndDelete(id);
    return ResponseHandler.success(res, 200, 'Test deleted successfully.');
  });




export const updateTest = apiHandler(async (req, res) => {
    const { id } = req.params;
    const {
      title,
      type,
      course,
      scheduledAt,
      expiresAt,
      totalMarks,
      isPublished
    } = req.body;
  
    const test = await Test.findById(id);
    if (!test) {
      return ResponseHandler.notFound(res, 'Test not found.');
    }
  
    // Optional: prevent title duplication within the same course
    if (title && course) {
      const duplicate = await Test.findOne({ title, course, _id: { $ne: id } });
      if (duplicate) {
        return ResponseHandler.conflict(res, 'Another test with the same title exists for this course.');
      }
    }
  
    const updatedTest = await Test.findByIdAndUpdate(
      id,
      {
        title: title ?? test.title,
        type: type ?? test.type,
        course: course ?? test.course,
        scheduledAt: scheduledAt ?? test.scheduledAt,
        expiresAt: expiresAt ?? test.expiresAt,
        totalMarks: totalMarks ?? test.totalMarks,
        isPublished: isPublished ?? test.isPublished,
      },
      { new: true }
    );
  
    return ResponseHandler.success(res, 200, 'Test updated successfully.', updatedTest);
  });
  

  export const getTestById = apiHandler(async (req, res) => {
    const { id } = req.params;
  
    const test = await Test.findById(id).lean(); // Use .lean() to get a plain JS object
  
    if (!test) {
      return ResponseHandler.notFound(res, 'Test not found.');
    }
  
    // Attach questions based on test type
    if (test.type === 'CODING') {
      const questions = await CodingQuestion.find({ testId: id });
      console.log(questions)
      test.questions = questions;
    } else if (test.type === 'MCQ') {
      const questions = await MCQQuestion.find({ testId: id });
      test.questions = questions;
    }
  
    return ResponseHandler.success(res, 200, 'Test fetched successfully.', test);
  });

export const reopenTestForStudent = apiHandler(async (req, res) => {
  const { testId, studentId } = req.params;

  const test = await Test.findById(testId);
  if (!test) {
    return ResponseHandler.notFound(res, "Test not found.");
  }

  // Check if student already has access
  if (test.reopenedFor.includes(studentId)) {
    return ResponseHandler.badRequest(res, "Test already reopened for this student.");
  }

  test.reopenedFor.push(studentId);
  await test.save();

  return ResponseHandler.success(res, 200, "Test reopened for student.", test);
});

export const getAvailableTests = apiHandler(async (req, res) => {
  const now = new Date();
  const tests = await Test.find({ isPublished: true });

  const categorizedTests = {
    upcoming: [],
    ongoing: [],
    expired: []
  };

  tests.forEach(test => {
    if (now < new Date(test.scheduledAt)) {
      categorizedTests.upcoming.push(test);
    } else if (now >= new Date(test.scheduledAt) && now <= new Date(test.expiresAt)) {
      categorizedTests.ongoing.push(test);
    } else {
      categorizedTests.expired.push(test);
    }
  });

  return ResponseHandler.success(res, 200, "Available tests fetched.", categorizedTests);
});

export const evaluateMCQTest = apiHandler(async (req, res) => {
  const { testId, studentId } = req.body;

  if (!testId || !studentId) {
    return ResponseHandler.badRequest(res, "testId and studentId are required.");
  }

  // ✅ Fetch test & answers
  const test = await Test.findById(testId);
  const answerRecord = await MCQAnswer.findOne({ testId, studentId });
  const questions = await MCQQuestion.find({ testId });

  if (!test || !answerRecord || questions.length === 0) {
    return ResponseHandler.notFound(res, "Test or answers not found.");
  }

  // ✅ Calculate total and obtained marks
  let totalMarks = test.totalMarks;;
  let obtainedMarks = 0;
  const perQuestionMark = totalMarks / questions.length;

  for (const question of questions) {
    const studentAnswer = answerRecord.answers.find(
      ans => ans.questionId.toString() === question._id.toString()
    );
  
    if (
      studentAnswer &&
      studentAnswer.selectedOptionId &&
      studentAnswer.selectedOptionId === question.correctOptionId
    ) {
      obtainedMarks += perQuestionMark;
    }
  }
  const obtainedMarksRounded = Number(obtainedMarks.toFixed(2));
  const percentage = ((obtainedMarks / totalMarks) * 100).toFixed(2);

  // ✅ Assign grade
  let grade = '';
  if (percentage >= 90) grade = 'A+';
  else if (percentage >= 80) grade = 'A';
  else if (percentage >= 70) grade = 'B';
  else if (percentage >= 60) grade = 'C';
  else grade = 'F';

  // ✅ Store grading result
  const grading = await Grading.create({
    studentId,
    testId,
    totalMarks,
    obtainedMarks,
    percentage,
    grade,
    aiFeedback: `Auto-evaluated: Student scored ${obtainedMarks}/${totalMarks}.`,
    submittedAt: answerRecord.submittedAt,
    evaluatedBy: 'AI',
  });

  return ResponseHandler.success(res, 201, "Test evaluated and graded.", grading);
});

export const getMCQAnswersWithCorrectness = apiHandler(async (req, res) => {
  const { testId, studentId } = req.params;

  if (!testId || !studentId) {
    return ResponseHandler.badRequest(res, "testId and studentId are required.");
  }

  // Fetch all questions and student answers
  const questions = await MCQQuestion.find({ testId });
  const studentRecord = await MCQAnswer.findOne({ testId, studentId });

  if (!questions || !studentRecord) {
    return ResponseHandler.notFound(res, "Questions or student answers not found.");
  }

  const responseData = questions.map((question) => {
    const studentAnswer = studentRecord.answers.find(
      (ans) => ans.questionId.toString() === question._id.toString()
    );

    return {
      questionId: question._id,
      questionText: question.questionText,
      options: question.options,
      correctOptionId: question.correctOptionId,
      studentSelectedOptionId: studentAnswer?.selectedOptionId || null,
      isCorrect: studentAnswer?.selectedOptionId === question.correctOptionId,
    };
  });

  return ResponseHandler.success(res, 200, "Answer review data fetched successfully", responseData);
});

export const evaluateCodingTest = apiHandler(async (req, res) => {
  const { testId, studentId } = req.body;

  if (!testId || !studentId) {
    return ResponseHandler.badRequest(res, "testId and studentId are required.");
  }

  // Fetch test and coding answers
  const test = await Test.findById(testId);
  const codingRecord = await CodingAnswer.findOne({ testId, studentId });
  const questions = await CodingQuestion.find({ testId });

  if (!test || !codingRecord || questions.length === 0) {
    return ResponseHandler.notFound(res, "Test or answers not found.");
  }

  let totalMarks = 0;
  let obtainedMarks = 0;

  const evalPayload = [];

  for (const question of questions) {
    totalMarks += question.marks;

    const studentAnswer = codingRecord.answers.find(ans => ans.questionId.toString() === question._id.toString());
    if (!studentAnswer) continue;

    // Match expected output manually
    const expectedOutput = question.testCases?.[0]?.expectedOutput || "";
    const hasCorrectOutput = studentAnswer.output?.trim() === expectedOutput.trim();

    evalPayload.push({
      question: question.description,
      expectedOutput,
      studentCode: studentAnswer.code,
      studentOutput: studentAnswer.output,
      logicWeight: question.marks * 0.7,
      outputWeight: question.marks * 0.3,
      hasCorrectOutput
    });
  }

  // 🔥 Call Gemini AI (use a proxy or secure server to hit Gemini API)
  const geminiResponse = await axios.post("http://localhost:9001/student/eval/gemini", {
    questions: evalPayload,
  });

  const feedbackData = geminiResponse.data;

  console.log("Feedback Data:", feedbackData);
  // Calculate marks
  for (const item of feedbackData.evaluatedQuestions) {
    obtainedMarks += item.logicMarks + item.outputMarks;
  }

  const percentage = parseFloat(((obtainedMarks / totalMarks) * 100).toFixed(2));
  const grade =
    percentage >= 90 ? "A+" :
    percentage >= 80 ? "A" :
    percentage >= 70 ? "B" :
    percentage >= 60 ? "C" : "F";

  // Save grading
  const grading = await Grading.create({
    studentId,
    testId,
    totalMarks,
    obtainedMarks: parseFloat(obtainedMarks.toFixed(2)),
    percentage,
    grade,
    aiFeedback: feedbackData.overallFeedback,
    submittedAt: codingRecord.submittedAt,
    evaluatedBy: 'AI'
  });

  return ResponseHandler.success(res, 201, "Coding test evaluated", grading);
});