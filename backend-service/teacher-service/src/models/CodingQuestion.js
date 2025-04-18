import mongoose from 'mongoose';

const CodingQuestionSchema = new mongoose.Schema({
    title: { type: String, required: true },
    testId: { type: mongoose.Schema.Types.ObjectId, ref: 'Test', required: true }, // 🆕 added testId field
    description: { type: String, required: true },
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
    language: { type: String, enum: ['javascript', 'python', 'cpp','java'], required: true },
    starterCode: { type: String, required: true },
    testCases: [
      {
        input: { type: String, required: true },
        expectedOutput: { type: String, required: true }
      }
    ],
    marks: { type: Number, required: true }, // 🆕 added marks field

    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
  });
  

export default mongoose.model('CodingQuestion', CodingQuestionSchema);
