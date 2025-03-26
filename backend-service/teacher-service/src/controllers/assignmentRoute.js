import Assignment from "../models/assignmentModel.js";
import apiHandler from "../utils/ApiHandler.js";
import ResponseHandler from "../utils/CustomResponse.js";

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
