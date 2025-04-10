// sourcery skip: use-braces

import Test from '../models/testModel.js';
import ResponseHandler from "../utils/CustomResponse.js";
import apiHandler from "../utils/ApiHandler.js";
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
    const test = await Test.findById(id);
    if (!test) {
      return ResponseHandler.notFound(res, 'Test not found.');
    }
    return ResponseHandler.success(res, 200, 'Test fetched successfully.', test);
    
})


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