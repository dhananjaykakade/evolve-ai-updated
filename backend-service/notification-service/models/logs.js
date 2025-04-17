import mongoose from 'mongoose';

const logSchema = new mongoose.Schema({
  studentId: String,
  studentName: String,
  testId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Test',
  },
  message: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});
logSchema.index({ testId: 1, timestamp: 1 });

export default mongoose.model('Log', logSchema);
