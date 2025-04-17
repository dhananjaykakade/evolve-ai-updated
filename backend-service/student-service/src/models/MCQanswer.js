import mongoose from 'mongoose';

const mcqAnswerSchema = new mongoose.Schema({
  studentId: {type:String , required: true}, // Store student UUID from PostgreSQL,
  testId: { type: mongoose.Schema.Types.ObjectId, ref: 'Test', required: true },
  answers: [
    {
      questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'MCQQuestion', required: true },
      selectedOptionId: { type: String, default: null },
      status: { type: String, enum: ['answered', 'skipped', 'reviewed', 'unanswered'], default: 'unanswered' }
    }
  ],
  submittedAt: { type: Date },
  warningCount: { type: Number, default: 0 },
  isAutoSubmitted: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.model('MCQAnswer', mcqAnswerSchema);