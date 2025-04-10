"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const ActivitySchema = new mongoose_1.Schema({
    user: {
        type: mongoose_1.Schema.Types.Mixed,
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
        competitionId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Competition' },
        agentId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Agent' },
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
ActivitySchema.statics.createActivity = async function (data) {
    return this.create(data);
};
// Method to format activity for display
ActivitySchema.methods.toJSON = function () {
    const obj = this.toObject();
    return {
        ...obj,
        createdAt: obj.createdAt.toISOString()
    };
};
exports.default = mongoose_1.default.model('Activity', ActivitySchema);
