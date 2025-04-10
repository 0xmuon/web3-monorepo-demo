import mongoose, { Schema, Document } from 'mongoose';

export interface IAgent extends Document {
  name: string;
  walletAddress: string;
  wins: number;
  losses: number;
  draws: number;
  points: number;
  rank: number;
  status: 'active' | 'inactive';
  createdAt: Date;
}

interface IAgentMethods {
  updateStats(winner: number): Promise<IAgent>;
}

type AgentModel = mongoose.Model<IAgent, {}, IAgentMethods>;

const AgentSchema = new Schema({
  name: { type: String, required: true },
  walletAddress: { type: String, required: true, index: true },
  wins: { type: Number, default: 0 },
  losses: { type: Number, default: 0 },
  draws: { type: Number, default: 0 },
  points: { type: Number, default: 0 },
  rank: { type: Number, default: 0 },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  createdAt: { type: Date, default: Date.now }
});

// Add index for faster queries
AgentSchema.index({ walletAddress: 1 }, { unique: true });
AgentSchema.index({ points: -1 }); // For leaderboard sorting
AgentSchema.index({ status: 1 }); // For filtering active agents

// Add method to update agent stats
AgentSchema.methods.updateStats = async function(winner: number): Promise<IAgent> {
  if (winner === 1) {
    this.wins += 1;
    this.points += 2;
  } else if (winner === 2) {
    this.losses += 1;
  } else {
    this.draws += 1;
    this.points += 1;
  }
  return this.save();
};

export default mongoose.model<IAgent, AgentModel>('Agent', AgentSchema);
