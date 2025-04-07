import mongoose from "mongoose";

const assignmentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  dueDate: { type: Date, required: true },
  teacherId: { type: String, required: true },
  course: { type: String, required: true },
  materials: { type: String, default: "" }, 

  // Flags
  status: { type: String, enum: ["DRAFT", "PUBLISHED", "CLOSED"], default: "PUBLISHED" },
  useAI: { type: Boolean, default: true },
  submissionType: { type: String, enum: ["TEXT", "FILE", "CODE"], default: "TEXT" },
  
  submissions: [{ type: mongoose.Schema.Types.ObjectId, ref: "Submission" }],
}, { timestamps: true });

export default mongoose.model("Assignment", assignmentSchema);
