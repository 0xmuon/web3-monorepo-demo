import mongoose, { Schema, Document, FilterQuery } from 'mongoose';

export interface IActivity extends Document {
  user: mongoose.Types.ObjectId | string;
  type: 'competition_join' | 'competition_leave' | 'agent_submit' | 'agent_update' | 'profile_update' | 'system';
  title: string;
  description: string;
  metadata: {
    competitionId?: mongoose.Types.ObjectId;
    agentId?: mongoose.Types.ObjectId;
    status?: string;
    points?: number;
    [key: string]: any;
  };
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}

// Define the query interface
export interface IActivityQuery {
  user?: string | mongoose.Types.ObjectId;
  type?: IActivity['type'];
  title?: string;
  description?: string;
  metadata?: {
    competitionId?: mongoose.Types.ObjectId;
    agentId?: mongoose.Types.ObjectId;
    status?: string;
    points?: number;
    [key: string]: any;
  };
  ipAddress?: string;
  userAgent?: string;
  createdAt?: Date;
}

const ActivitySchema: Schema = new Schema({
  user: { 
    type: Schema.Types.Mixed,
    required: true,
    ref: 'User'
  },
  type: { 
    type: String, 
    enum: ['competition_join', 'competition_leave', 'agent_submit', 'agent_update', 'profile_update', 'system'],
    required: true 
  },
  title: { type: String, required: true },
  description: { type: String, required: true },
  metadata: {
    competitionId: { type: Schema.Types.ObjectId, ref: 'Competition' },
    agentId: { type: Schema.Types.ObjectId, ref: 'Agent' },
    status: String,
    points: Number
  },
  ipAddress: String,
  userAgent: String,
  createdAt: { type: Date, default: Date.now }
});

// Index for efficient querying
ActivitySchema.index({ user: 1, createdAt: -1 });
ActivitySchema.index({ type: 1, createdAt: -1 });
ActivitySchema.index({ 'metadata.competitionId': 1, createdAt: -1 });
ActivitySchema.index({ 'metadata.agentId': 1, createdAt: -1 });

// Static method to create activity log
ActivitySchema.statics.createActivity = async function(data: {
  user: mongoose.Types.ObjectId | string;
  type: IActivity['type'];
  title: string;
  description: string;
  metadata?: IActivity['metadata'];
  ipAddress?: string;
  userAgent?: string;
}) {
  return this.create(data);
};

// Method to format activity for display
ActivitySchema.methods.toJSON = function(this: Document) {
  const obj = this.toObject();
  return {
    ...obj,
    createdAt: (obj as IActivity).createdAt.toISOString()
  };
};

export default mongoose.model<IActivity>('Activity', ActivitySchema);
