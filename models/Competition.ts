import mongoose from 'mongoose'

const CompetitionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  shortDescription: {
    type: String,
    required: true,
    maxLength: 200
  },
  prize: {
    type: Number,
    required: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: ['upcoming', 'active', 'completed'],
    default: 'upcoming'
  },
  category: {
    type: String,
    enum: ['computer-vision', 'nlp', 'reinforcement-learning', 'other'],
    required: true
  },
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    required: true
  },
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  submissions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Submission'
  }],
  winner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rules: [{
    type: String
  }],
  resources: [{
    title: String,
    url: String
  }]
})

export default mongoose.models.Competition || mongoose.model('Competition', CompetitionSchema) 