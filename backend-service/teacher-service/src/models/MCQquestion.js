import mongoose from 'mongoose';

const mcqQuestionSchema = new mongoose.Schema({
  testId: { type: mongoose.Schema.Types.ObjectId, ref: 'Test', required: true },
  questionText: { type: String, required: true },
  options: [
    {
    _id: false,
      id: { type: String, required: true },
      text: { type: String, required: true },
    }
  ],
  correctOptionId: { type: String, required: true },
  marks: { type: Number, required: true },
}, { timestamps: true });

export default mongoose.model('MCQQuestion', mcqQuestionSchema);