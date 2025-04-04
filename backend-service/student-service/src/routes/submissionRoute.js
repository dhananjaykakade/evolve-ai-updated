import express from "express";
import { submitAssignment ,editSubmission,deleteSubmission,getSubmissions,getSubmissionsForSingleAssignment,getSubmissionsForSingleStudent,getAllSubmissions,createFeedbackByTeacherToSubmission} from "../controllers/assignmentController.js";
import multer from "multer";

const router = express.Router();
const upload = multer({ dest: "uploads/" }); // Temporary storage

router.post("/submit", upload.single("file"), submitAssignment);
router.put("/:submissionId", upload.single("file"), editSubmission);
router.delete("/:submissionId", deleteSubmission);
router.get("/:studentId", getSubmissionsForSingleStudent);
router.get("/:assignmentId", getSubmissionsForSingleAssignment);
router.get("/", getSubmissions);

// Get all submissions for a specific student and assignment

router.get("/all/assignments", getAllSubmissions);

router.put("/feedback/:submissionId", createFeedbackByTeacherToSubmission);


export default router;
