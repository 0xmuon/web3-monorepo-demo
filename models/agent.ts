import mongoose from 'mongoose'

const agentSchema = new mongoose.Schema({
  user: {
    type: String,
    required: true,
    index: true
  },
  name: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['chess', 'strategy', 'trading', 'other'],
    default: 'other'
  },
  description: {
    type: String,
    maxLength: 500
  },
  status: {
    type: String,
    enum: ['active', 'under_review', 'rejected', 'archived'],
    default: 'under_review'
  },
  winRate: {
    type: Number,
    default: 0
  },
  matchesPlayed: {
    type: Number,
    default: 0
  },
  matchesWon: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  sourceCode: {
    type: String, // URL to source code or IPFS hash
    required: true
  },
  competitions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Competition'
  }]
})

const Agent = mongoose.models.Agent || mongoose.model('Agent', agentSchema)
export default Agent 