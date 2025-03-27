import apiHandler from "../utils/ApiHandler.js";
import ResponseHandler from "../utils/CustomResponse.js";
import axios from "axios";
import Submission from "../models/submission.js";
import cloudinary from "../config/cloudinary.js";

export const submitAssignment = apiHandler(async (req, res) => {
  const { assignmentId, studentId, submissionType, content } = req.body;
  let fileUrl = "";

  // ✅ Step 1: Validate student & assignment in parallel to reduce response time
  const [studentResponse, assignmentResponse] = await Promise.all([
    axios.get(`http://localhost:8001/students/${studentId}`),
    axios.get(`http://localhost:9000/teacher/assignments/${assignmentId}`)
  ]);

  if (!studentResponse.data.success) {
    return ResponseHandler.notFound(res, "Student not found");
  }

  if (!assignmentResponse.data.success) {
    return ResponseHandler.notFound(res, "Assignment not found");
  }

  const assignment = assignmentResponse.data.data;

  // ✅ Step 2: Check assignment deadline
  const currentDate = new Date();
  const dueDate = new Date(assignment.dueDate);

  if (currentDate > dueDate) {
    return ResponseHandler.badRequest(res, "Assignment deadline has passed.");
  }

  // ✅ Step 3: Check if the student has already submitted
  const existingSubmission = await Submission.findOne({ assignmentId, studentId });

  if (existingSubmission) {
    existingSubmission.isEdited = true;
    existingSubmission.content = content;
    existingSubmission.submissionType = submissionType;

    if (req.file) {
      console.log("Uploading new file to Cloudinary...");
      const result = await cloudinary.uploader.upload(req.file.path, { folder: "submissions" });
      existingSubmission.fileUrl = result.secure_url;
    }

    await existingSubmission.save();
    return ResponseHandler.success(res, 200, "Assignment updated successfully", { submission: existingSubmission, isEdited: true });
  }

  // ✅ Step 4: Upload file to Cloudinary if exists
  if (req.file) {
    console.log("Uploading file to Cloudinary...");
    const result = await cloudinary.uploader.upload(req.file.path, { folder: "submissions" });
    fileUrl = result.secure_url;
  }

  // ✅ Step 5: Create new submission
  const submission = await Submission.create({
    assignmentId,
    studentId, // UUID stored as String
    submissionType,
    content,
    fileUrl,
  });

  return ResponseHandler.success(res, 201, "Assignment successfully submitted", { submission, isEdited: false });
});





export const editSubmission = apiHandler(async (req, res) => {
    const { submissionId } = req.params;
    const { content, submissionType } = req.body;
    let fileUrl = "";
  
    // ✅ Step 1: Find Submission
    const submission = await Submission.findById(submissionId);
    if (!submission) {
      return ResponseHandler.notFound(res, "Submission not found");
    }
  
    // ✅ Step 2: Check if the submission is past the deadline
    const assignmentResponse = await axios.get(
      `http://localhost:9000/teacher/assignments/${submission.assignmentId}`
    );
    if (!assignmentResponse.data.success) {
      return ResponseHandler.notFound(res, "Assignment not found");
    }
  
    const { dueDate } = assignmentResponse.data.data;
    if (new Date() > new Date(dueDate)) {
      return ResponseHandler.badRequest(res, "Cannot edit submission after the deadline");
    }
  
    // ✅ Step 3: Handle File Upload (if provided)
    if (req.file) {
      console.log("Uploading file to Cloudinary...");
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "submissions",
      });
      fileUrl = result.secure_url;
    }
  
    // ✅ Step 4: Update Submission
    submission.content = content || submission.content;
    submission.submissionType = submissionType || submission.submissionType;
    submission.fileUrl = fileUrl || submission.fileUrl;
    submission.isEdited = true;
  
    await submission.save();
  
    return ResponseHandler.success(res, 200, "Submission updated successfully", {
      submission,
    });
  });






  export const deleteSubmission = apiHandler(async (req, res) => {
    const { submissionId } = req.params;
  
    // ✅ Step 1: Find Submission
    const submission = await Submission.findById(submissionId);
    if (!submission) {
      return ResponseHandler.notFound(res, "Submission not found");
    }
  
    // ✅ Step 2: Check if the submission is past the deadline
    const assignmentResponse = await axios.get(
      `http://localhost:9000/teacher/assignments/${submission.assignmentId}`
    );
    if (!assignmentResponse.data.success) {
      return ResponseHandler.notFound(res, "Assignment not found");
    }
  
    const { dueDate } = assignmentResponse.data.data;
    if (new Date() > new Date(dueDate)) {
      return ResponseHandler.badRequest(res, "Cannot delete submission after the deadline");
    }
  
    // ✅ Step 3: Delete Submission
    await Submission.findByIdAndDelete(submissionId);
  
    return ResponseHandler.success(res, 200, "Submission deleted successfully");
  });

  



  export const getSubmissions = apiHandler(async (req, res) => {
    const { assignmentId, studentId } = req.query;
  
    let filter = {};
    if (assignmentId) filter.assignmentId = assignmentId;
    if (studentId) filter.studentId = studentId;
  
    const submissions = await Submission.find(filter);
  
    return ResponseHandler.success(res, 200, "Submissions fetched successfully", {
      submissions,
    });
  });
  

export const getSubmissionsForSingleAssignment = apiHandler(async (req, res) => {
    const { assignmentId } = req.params;
    const submissions = await Submission.find({ assignmentId });
    return ResponseHandler.success(res, 200, "Submissions fetched successfully", {
      submissions,
    });
});

export const getSubmissionsForSingleStudent = apiHandler(async (req, res) => {
    const { studentId } = req.params;
    const submissions = await Submission.find({ studentId });
    return ResponseHandler.success(res, 200, "Submissions fetched successfully", {
      submissions,
    });
});