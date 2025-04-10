import mongoose from 'mongoose';

const testSchema = new mongoose.Schema({
  title: { type: String, required: true },
  type: { type: String, enum: ['MCQ', 'CODING'], required: true },
  createdBy: { type: String, required: true }, // teacherId from PostgreSQL
  course: { type: String, required: true },    // ✅ New field added
  scheduledAt: { type: Date, required: true },
  expiresAt: { type: Date, required: true },
  totalMarks: { type: Number, required: true },
  isPublished: { type: Boolean, default: false },
  reopenedFor: [
    {
      studentId: { type: String, required: true }, // UUID from Postgres
      reopenedAt: { type: Date, default: Date.now },
      expiresAt: { type: Date, required: true }, // Custom expiry for this student
    }
  ],
}, { timestamps: true });

export default mongoose.model('Test', testSchema);
