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
const UserSchema = new mongoose_1.Schema({
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
            type: mongoose_1.default.Schema.Types.ObjectId,
            ref: 'Competition'
        }],
    submissions: [{
            type: mongoose_1.default.Schema.Types.ObjectId,
            ref: 'Submission'
        }],
    agents: [{
            type: mongoose_1.default.Schema.Types.ObjectId,
            ref: 'Agent'
        }],
    activities: [{
            type: mongoose_1.default.Schema.Types.ObjectId,
            ref: 'Activity'
        }]
});
exports.default = mongoose_1.default.model('User', UserSchema);
