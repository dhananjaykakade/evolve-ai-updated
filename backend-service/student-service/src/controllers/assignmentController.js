import apiHandler from "../utils/ApiHandler.js";
import ResponseHandler from "../utils/CustomResponse.js";
import axios from "axios";
import Submission from "../models/submission.js";
import cloudinary from "../config/cloudinary.js";
import assignments from "../models/assignmentModel.js"

const { AUTH_SERVICE_URL } = process.env;


export const submitAssignment = apiHandler(async (req, res) => {
  const { assignmentId, studentId, content ,fileUrl} = req.body;
  console.log(req.body)

  if (!assignmentId || !studentId || !fileUrl) {
    return ResponseHandler.badRequest(res, "Assignment ID, Student ID, and file are required");
  }

    // ✅ Step 1: Validate student & assignment
    const [studentResponse] = await Promise.allSettled([
      axios.get(`${AUTH_SERVICE_URL}/students/${studentId}`),
    ]);
    const assignment = await assignments.findById(assignmentId);

    if (!assignment) {
      console.log("Assignment not found");
      return ResponseHandler.notFound(res, "Assignment not found");
    }


    if (studentResponse.status === "rejected" || !studentResponse.value?.data?.success) {
      return ResponseHandler.notFound(res, "Student not found");
    }

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
      existingSubmission.submissionType = req.body.submissionType || existingSubmission.submissionType;
      existingSubmission.fileUrl = fileUrl || existingSubmission.fileUrl;


      await existingSubmission.save();
      return ResponseHandler.success(res, 200, "Assignment updated successfully", { submission: existingSubmission, isEdited: true });
    
    }
    // ✅ Step 5: Create new submission
    const submission = await Submission.create({
      assignmentId,
      studentId,
      content: content || "",
      fileUrl: fileUrl || "",
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
    const assignment = await assignments.findById(submission.assignmentId);
    if (!assignment) {
      return ResponseHandler.notFound(res, "Assignment not found");
    }

    const { dueDate } = assignment;
    if (new Date() > new Date(dueDate)) {
      return ResponseHandler.badRequest(res, "Cannot edit submission after the deadline");
    }
  
    // ✅ Step 3: Handle File Upload (if provided)
    if (req.file) {
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
    const assignment = await assignments.findById(submission.assignmentId);
    if (!assignment) {
      return ResponseHandler.notFound(res, "Assignment not found");
    }
    const { dueDate } = assignment;

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

export const getAllSubmissions = apiHandler(async (req, res) => {
  const submissions = await Submission.find();
  return ResponseHandler.success(res, 200, "All submissions fetched successfully", { submissions });
});


export const createFeedbackByTeacherToSubmission = apiHandler(async (req, res) => {
  const { feedback,gradeStatus,marks } = req.body;
  const {submissionId} = req.params;
  const sub = await Submission.findByIdAndUpdate({ _id: submissionId }, { gradeStatus,feedback,  marks }, { new: true });
 
  if (!sub) {
    return ResponseHandler.notFound(res, "Submission not found");
  }
  return ResponseHandler.success(res, 200, "Feedback created successfully", { sub });
})


export const getStudentNameById = apiHandler(async (req, res) => {
  const { studentId } = req.params;
  if (!studentId) {
    return ResponseHandler.badRequest(res, "Student ID is required");
  }
  // Fetch student details from the auth service
  const studentResponse = await axios.get(`${AUTH_SERVICE_URL}/students/${studentId}`);

  if (!studentResponse.data.success) {
    return ResponseHandler.notFound(res, "Student not found");
  }
  
  const student = studentResponse.data.data;
  return ResponseHandler.success(res, 200, "Student fetched successfully", { student });
}
)

// 

export const getSubmissionsForSingleAssignmentBystudent = apiHandler(async (req, res) => {
  const { assignmentId,studentId } = req.params;
// share assignmnet file with assignment 

  if (!assignmentId || !studentId) {
    return ResponseHandler.badRequest(res, "Assignment ID and Student ID are required");
  }
  const assignment = await assignments.findById(assignmentId);
  if (!assignment) {
    return ResponseHandler.notFound(res, "Assignment not found");
  }

  const submissions = await Submission.find({ assignmentId, studentId });

  submissions.material = assignment.materials;
  return ResponseHandler.success(res, 200, "Submissions fetched successfully", {
    submissions,
    materials: assignment.materials,
  });
});