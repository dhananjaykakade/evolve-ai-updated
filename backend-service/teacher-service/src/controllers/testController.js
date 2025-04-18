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

  // find grading by testId and studentId if exist then simply return it
  const existingGrading = await Grading.findOne({ testId, studentId });
  if (existingGrading) {
    return ResponseHandler.success(res, 200, "Test already evaluated.", existingGrading);
  }

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
  // check if user attempted the test or not 
  

  // find grading by testId and studentId if exist then simply return it
  const existingGrading = await Grading.findOne({ testId, studentId });
  if (existingGrading) {
    return ResponseHandler.success(res, 200, "Test already evaluated.", existingGrading);
  }

  if (!testId || !studentId) {
    return ResponseHandler.badRequest(res, "testId and studentId are required.");
  }

  const test = await Test.findById(testId);
  const codingRecord = await CodingAnswer.findOne({ testId, studentId });
  const questions = await CodingQuestion.find({ testId });

  if (!test || !codingRecord || questions.length === 0) {
    return ResponseHandler.notFound(res, "Test or answers not found.");
  }

  let totalQuestionMarks = 0;
  const evalPayload = [];

  for (const question of questions) {
    totalQuestionMarks += question.marks;

    const studentAnswer = codingRecord.answers.find(
      ans => ans.questionId.toString() === question._id.toString()
    );
    if (!studentAnswer) continue;

    const expectedOutput = question.testCases?.[0]?.expectedOutput || "";
    const hasCorrectOutput = studentAnswer.output?.trim() === expectedOutput.trim();

    evalPayload.push({
      question: question.description,
      expectedOutput,
      studentCode: studentAnswer.code,
      studentOutput: studentAnswer.output,
      logicWeight: parseFloat((question.marks * 0.7).toFixed(2)),
      outputWeight: parseFloat((question.marks * 0.3).toFixed(2)),
      hasCorrectOutput
    });
  }

  const geminiResponse = await axios.post("http://localhost:9001/student/eval/gemini", {
    questions: evalPayload
  });

  const feedbackData = geminiResponse.data;

  let rawObtainedMarks = 0;
  for (const item of feedbackData.evaluatedQuestions) {
    rawObtainedMarks += item.logicMarks + item.outputMarks;
  }

  // 🎯 Scale marks: finalObtained = (raw / totalQuestionsMarks) * test.totalMarks
  const scaledObtainedMarks = (rawObtainedMarks / totalQuestionMarks) * test.totalMarks;
  const percentage = parseFloat(((scaledObtainedMarks / test.totalMarks) * 100).toFixed(2));

  const grade =
    percentage >= 90 ? "A+" :
    percentage >= 80 ? "A" :
    percentage >= 70 ? "B" :
    percentage >= 60 ? "C" : "F";

  const grading = await Grading.create({
    studentId,
    testId,
    totalMarks: test.totalMarks,
    obtainedMarks: parseFloat(scaledObtainedMarks.toFixed(2)),
    percentage,
    grade,
    aiFeedback: feedbackData.overallFeedback,
    submittedAt: codingRecord.submittedAt,
    evaluatedBy: "AI"
  });

  return ResponseHandler.success(res, 201, "Coding test evaluated", grading);
});


// create new api to get coding anwser by testId and studentId

export const getCodingAnswerByTestIdAndStudentId = apiHandler(async (req, res) => {
  const { testId, studentId } = req.params;

  if (!testId || !studentId) {
    return ResponseHandler.badRequest(res, "testId and studentId are required.");
  }

  const codingRecord = await CodingAnswer.findOne({ testId, studentId });
  if (!codingRecord) {
    return ResponseHandler.notFound(res, "Coding answers not found.");
  }

  return ResponseHandler.success(res, 200, "Coding answers fetched successfully.", codingRecord);
}
);


export const getTestAnswersWithCorrectness = apiHandler(async (req, res) => {
  const { testId, studentId } = req.params;
  const { testType } = req.query;

  if (!testId || !studentId) {
    return ResponseHandler.badRequest(res, "testId and studentId are required.");
  }

  if (!testType || !['MCQ', 'CODING'].includes(testType.toUpperCase())) {
    return ResponseHandler.badRequest(res, "Valid testType (MCQ or CODING) is required.");
  }

  const normalizedTestType = testType.toUpperCase();
  
  try {
    // First, verify the test exists and is of the correct type
    const test = await Test.findById(testId);
    
    if (!test) {
      return ResponseHandler.notFound(res, "Test not found.");
    }
    
    // Validate that the test type matches what was requested
    if (test.type !== normalizedTestType) {
      return ResponseHandler.badRequest(res, `Test with ID ${testId} is not a ${normalizedTestType} test.`);
    }

    let responseData = [];

    if (normalizedTestType === 'MCQ') {
      // Get MCQ answers and questions
      const answerRecord = await MCQAnswer.findOne({ testId, studentId });
      const questions = await MCQQuestion.find({ testId }).populate('options');
      
      if (!answerRecord || questions.length === 0) {
        return ResponseHandler.notFound(res, "MCQ answers or questions not found.");
      }
      
      responseData = questions.map(question => {
        const studentAnswer = answerRecord.answers.find(
          ans => ans.questionId.toString() === question._id.toString()
        );
        
        const selectedOptionId = studentAnswer ? studentAnswer.selectedOptionId : null;
        return {
          questionId: question._id.toString(),
          questionText: question.questionText,
          options: question.options.map(option => ({
            id: option.id,
            text: option.text
          })),
          correctOptionId: question.correctOptionId,
          studentSelectedOptionId: selectedOptionId,
          isCorrect: selectedOptionId && (selectedOptionId === question.correctOptionId)
        };
      });
    } else if (normalizedTestType === 'CODING') {
      // Get coding answers and questions
      const codingRecord = await CodingAnswer.findOne({ testId, studentId });
      const questions = await CodingQuestion.find({ testId });
      
      if (!codingRecord || questions.length === 0) {
        return ResponseHandler.notFound(res, "Coding answers or questions not found.");
      }
      
      responseData = questions.map(question => {
        const studentAnswer = codingRecord.answers.find(
          ans => ans.questionId.toString() === question._id.toString()
        );
        
        return {
          questionId: question._id.toString(),
          questionText: question.description,
          studentCode: studentAnswer ? studentAnswer.code : null,
          expectedOutput: question.testCases?.[0]?.expectedOutput || "",
        };
      });
    }

    return ResponseHandler.success(res, 200, "Answer review data fetched successfully", responseData);
  } catch (error) {
    console.error("Error fetching test answers:", error);
    return ResponseHandler.error(res, 500, "Failed to fetch test answers", error.message);
  }
});

// Route definition - add this to your routes file
// router.get('/tests/answers/:testId/:studentId', getTestAnswersWithCorrectness);

// create this route to get all grading results for all tests

export const getAllGradingResults = apiHandler(async (req, res) => {
  // Fetch all grading results and populate the testId (test details)
  const gradingResults = await Grading.find().populate('testId');

  // Fetch all students from the external service (API)
  const studentResponse = await axios.get('http://localhost:9001/auth/students/get');
  const students = studentResponse.data.data.students || [];

  // Create a map for fast lookup of students by their ID
  const studentMap = {};
  students.forEach(s => {
    studentMap[s.id] = s;
  });

  // Refine grading results to only include necessary data
  const finalResults = gradingResults.map(result => {
    const student = studentMap[result.studentId];

    return {
      id: result._id, // Grading ID
      studentId: result.studentId, // Student ID
      testId: result.testId._id, // Test ID
      studentEmail: student ? student.email : 'Unknown', // Student email
      studentName: student ? student.name : 'Unknown', // Student name
      testName: result.testId ? result.testId.title : 'No test', // Test name
      testType: result.testId ? result.testId.type : 'No type', // Test type
      totalMarks: result.totalMarks, // Total marks
      obtainedMarks: result.obtainedMarks, // Obtained marks
      percentage: result.percentage, // Percentage
      grade: result.grade, // Grade
      aiFeedback: result.aiFeedback, // AI Feedback
      // pass submitted date
      submittedAt: result.submittedAt, // Submission date
      evaluatedAt: result.createdAt, // Evaluation date
      evaluatedBy: result.evaluatedBy, // Evaluated by

    };
  });

  // Return the refined data in the response
  return ResponseHandler.success(res, 200, "Grading results fetched successfully.", finalResults);
});


