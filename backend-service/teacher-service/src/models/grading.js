import mongoose from 'mongoose';

const gradingSchema = new mongoose.Schema({
  studentId: { type:String, required: true },
  testId: { type: mongoose.Schema.Types.ObjectId, ref: 'Test', required: true },
  totalMarks: { type: Number, required: true },
  obtainedMarks: { type: Number, required: true },
  percentage: { type: Number, required: true },
  grade: { type: String, required: true },
  aiFeedback: { type: String },
  submittedAt: { type: Date, required: true },
  evaluatedBy: { type: String, enum: ['AI', 'Teacher'], default: 'AI' },
  evaluatedAt: { type: Date, default: Date.now },
}, { timestamps: true });

export default mongoose.model('Grading', gradingSchema);