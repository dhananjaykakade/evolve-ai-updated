import mongoose from "mongoose";

const submissionSchema = new mongoose.Schema(
  {
    assignmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Assignment", required: true },
    studentId: { type: String, required: true }, // Store student UUID from PostgreSQL
    submissionType: { type: String, enum: ["TEXT", "FILE", "CODE"], required: true },
    content: { type: String, default: "" }, // For TEXT or CODE submissions
    fileUrl: { type: String, default: "" }, // For FILE submissions (Stored in Cloudinary)
    status: { type: String, enum: ["SUBMITTED", "GRADED", "PENDING_REVIEW"], default: "SUBMITTED" },
    isEdited: { type: Boolean, default: false },
    gradeStatus: {
      type: String,
      enum: ["PASS", "FAIL", "EXCELLENT", "NEEDS_IMPROVEMENT", "PENDING_REVIEW"],
      default: "PENDING_REVIEW",
    },
    feedback: { type: String, default: "" },
  },
  { timestamps: true }
  
);

export default mongoose.model("Submission", submissionSchema);
