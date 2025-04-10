import mongoose from 'mongoose'

const activitySchema = new mongoose.Schema({
  user: {
    type: String,
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: ['agent_created', 'competition_joined', 'competition_won', 'agent_updated', 'reward_earned'],
    required: true
  },
  description: {
    type: String,
    required: true
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
})

const Activity = mongoose.models.Activity || mongoose.model('Activity', activitySchema)
export default Activity 