import mongoose from 'mongoose'

const SubmissionSchema = new mongoose.Schema({
  competition: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Competition',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  submittedAt: {
    type: Date,
    default: Date.now
  },
  score: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending'
  },
  fileUrl: {
    type: String,
    required: true
  },
  notes: {
    type: String
  }
})

export default mongoose.models.Submission || mongoose.model('Submission', SubmissionSchema) 