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
const AgentSchema = new mongoose_1.Schema({
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
AgentSchema.methods.updateStats = async function (winner) {
    if (winner === 1) {
        this.wins += 1;
        this.points += 2;
    }
    else if (winner === 2) {
        this.losses += 1;
    }
    else {
        this.draws += 1;
        this.points += 1;
    }
    return this.save();
};
exports.default = mongoose_1.default.model('Agent', AgentSchema);
