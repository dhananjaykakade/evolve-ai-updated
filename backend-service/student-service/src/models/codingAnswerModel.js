import mongoose from 'mongoose';

const codingAnswerSchema = new mongoose.Schema({
  studentId: { type:String, required: true },
  testId: { type: mongoose.Schema.Types.ObjectId, ref: 'Test', required: true },

  answers: [
    {
      questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'CodingQuestion', required: true },
      code: { type: String, default: '' },
      status: {
        type: String,
        enum: ['answered', 'skipped', 'reviewed', 'unanswered'],
        default: 'unanswered'
      }
    }
  ],

  submittedAt: { type: Date },
  warningCount: { type: Number, default: 0 },
  isAutoSubmitted: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.model('CodingAnswer', codingAnswerSchema);
