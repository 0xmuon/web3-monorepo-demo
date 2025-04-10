import mongoose from 'mongoose'

const UserSchema = new mongoose.Schema({
  walletAddress: {
    type: String,
    required: true,
    unique: true,
  },
  username: {
    type: String,
    unique: true,
    sparse: true,
  },
  profileImage: {
    type: String,
    default: "", // URL to default avatar
  },
  bio: {
    type: String,
    maxLength: 500,
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  stats: {
    totalAgents: {
      type: Number,
      default: 0
    },
    competitionsWon: {
      type: Number,
      default: 0
    },
    tokensEarned: {
      type: Number,
      default: 0
    },
    winRate: {
      type: Number,
      default: 0
    }
  },
  totalEarnings: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  competitions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Competition'
  }],
  submissions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Submission'
  }],
  agents: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Agent'
  }],
  activities: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Activity'
  }]
})

export default mongoose.models.User || mongoose.model('User', UserSchema) 