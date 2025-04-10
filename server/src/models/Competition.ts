import mongoose, { Schema, Document } from 'mongoose';

export interface ICompetition extends Document {
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  prize: string;
  status: 'active' | 'completed' | 'upcoming';
  participants: mongoose.Types.ObjectId[];
  winner?: mongoose.Types.ObjectId;
  createdBy: mongoose.Types.ObjectId;
  submissions: {
    agent: mongoose.Types.ObjectId;
    submittedAt: Date;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const CompetitionSchema: Schema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  prize: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['active', 'completed', 'upcoming'],
    default: 'upcoming'
  },
  participants: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  winner: { type: Schema.Types.ObjectId, ref: 'User' },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  submissions: [{
    agent: { type: Schema.Types.ObjectId, ref: 'Agent' },
    submittedAt: { type: Date, default: Date.now }
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Update the updatedAt timestamp before saving
CompetitionSchema.pre('save', function(this: ICompetition, next) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.model<ICompetition>('Competition', CompetitionSchema); 