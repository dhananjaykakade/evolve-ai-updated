import Assignment from "../models/assignmentModel.js";
import apiHandler from "../utils/ApiHandler.js";
import ResponseHandler from "../utils/CustomResponse.js";
import axios from "axios"

/**
 * 🟢 Create a new assignment
 */
export const createAssignment = apiHandler(async (req, res) => {
    const { title, description, dueDate, teacherId, course, useAI, submissionType, status } = req.body;
    
    // Check if a file is uploaded
    const materials = req.file ? req.file.path : null; // Get Cloudinary URL
    
    if (!title || !description || !dueDate || !teacherId || !course) {
      return ResponseHandler.badRequest(res, "Please provide all required fields.");
    }
  
    const newAssignment = await Assignment.create({
      title,
      description,
      dueDate,
      teacherId,
      course,
      useAI: useAI || false,
      submissionType: submissionType || "file",
      status: status || "PUBLISHED",
      materials, // Store uploaded file URL
    });
  
    return ResponseHandler.success(res, 201, "Assignment created successfully.", newAssignment);
  });

/**
 * 🟡 Get all assignments (Optional filters: teacherId, status, course)
 */
export const getAssignments = apiHandler(async (req, res) => {
  const { teacherId, status, course } = req.query;
  let filter = {};

  if (teacherId) filter.teacherId = teacherId;
  if (status) filter.status = status;
  if (course) filter.course = course;

  const assignments = await Assignment.find(filter);
  return ResponseHandler.success(res, 200, "Assignments fetched successfully.", assignments);
});

/**
 * 🟠 Update an assignment (Change status or modify details)
 */
export const updateAssignment = apiHandler(async (req, res) => {
  const { id } = req.params;
  const updatedData = req.body;

  const assignment = await Assignment.findByIdAndUpdate(id, updatedData, { new: true });

  if (!assignment) return ResponseHandler.notFound(res, "Assignment not found.");

  return ResponseHandler.success(res, 200, "Assignment updated successfully.", assignment);
});

/**
 * 🔴 Delete an assignment
 */
export const deleteAssignment = apiHandler(async (req, res) => {
  const { id } = req.params;
  const assignment = await Assignment.findByIdAndDelete(id);

  if (!assignment) return ResponseHandler.notFound(res, "Assignment not found.");

  return ResponseHandler.success(res, 200, "Assignment deleted successfully.");
});

export const  getSingleAssignment = apiHandler(async (req, res) => {
  const { id } = req.params;
  const assignment = await Assignment.findById(id);
  if (!assignment) return ResponseHandler.notFound(res, "Assignment not found.");
  return ResponseHandler.success(res, 200, "Assignment fetched successfully.", assignment);
})


export const getAssignmentsWithSubmissions = apiHandler(async (req, res) => {
  const { teacherId } = req.query;

  // ✅ Step 1: Fetch Assignments from Teacher Service
  const assignments = await Assignment.find(teacherId ? { teacherId } : {});

  // ✅ Step 2: Fetch Submissions from Student Service
  const assignmentIds = assignments.map((assignment) => assignment._id);
  const submissionsResponse = await axios.get(
    `http://localhost:9001/student/submissions`,
    { params: { assignmentIds } }
  );

  const submissions = submissionsResponse.data.data.submissions || [];

  // ✅ Step 3: Merge Submissions with Assignments
  const assignmentsWithSubmissions = assignments.map((assignment) => {
    const assignmentSubmissions = submissions.filter(
      (sub) => sub.assignmentId === assignment._id.toString()
    );

    return {
      ...assignment.toObject(),
      submissions: assignmentSubmissions,
    };
  });

  return ResponseHandler.success(
    res,
    200,
    "Assignments with submissions fetched successfully",
    { assignments: assignmentsWithSubmissions }
  );
});


// create route with get all the assignments with current student submmisions

export const getStudentAssignmentsWithSubmissions = apiHandler(async (req, res, next) => {
  



    const { studentId } = req.query;


    if (!studentId) {
      return ResponseHandler.error(res, 400, "studentId is required");
    }

    // Fetch Assignments from Teacher Service
    const assignments = await Assignment.find();


    const assignmentIds = assignments.map((assignment) => assignment._id.toString());

    let submissions = [];

      // Fetch Student's Submissions from Student Service
      const submissionsResponse = await axios.get(`http://localhost:9001/student/submissions/all/assignments`, {
        params: { studentId, assignmentIds: JSON.stringify(assignmentIds) }, // Ensure array is serialized
        timeout: 10000, // Set timeout to avoid long waits
      });

      submissions = submissionsResponse.data.data.Submission || [];
      // console.log("Student submissions:", submissions);


    // Merge Assignments with Submissions
    const assignmentsWithSubmissions = assignments.map((assignment) => {
      const studentSubmission = submissions.find(
        (sub) => sub.assignmentId === assignment._id.toString()
      );

      return {
        ...assignment.toObject(),
        studentSubmission: studentSubmission || null, // If no submission, return null
      };
    });

    return ResponseHandler.success(
      res,
      200,
      "Assignments with student's submissions fetched successfully",
      { assignments: assignmentsWithSubmissions }
    );

});

