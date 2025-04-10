"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/agents.ts
const express_1 = __importDefault(require("express"));
const mongodb_1 = __importDefault(require("../lib/mongodb")); // Correct path
const Agent_1 = __importDefault(require("../models/Agent")); // Correct path
const User_1 = __importDefault(require("../models/User"));
const router = express_1.default.Router();
router.get("/", async (req, res) => {
    try {
        const { wallet } = req.query; // Use query parameters
        if (!wallet) {
            return res.status(400).json({ error: "No wallet provided" });
        }
        await (0, mongodb_1.default)();
        // First find the user by wallet address
        const user = await User_1.default.findOne({ walletAddress: wallet });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        // Then find agents created by this user
        const agents = await Agent_1.default.find({ createdBy: user._id })
            .select("name category description winRate totalGames totalWins status metadata")
            .sort({ createdAt: -1 })
            .lean();
        return res.json(agents);
    }
    catch (error) {
        console.error("Failed to fetch agents:", error);
        return res.status(500).json({ error: "Failed to fetch agents" });
    }
});
router.post('/', async (req, res) => {
    try {
        const { name, fileId, walletAddress } = req.body;
        // Find the user by wallet address
        const user = await User_1.default.findOne({ walletAddress });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        // Create new agent with user reference
        const agent = await Agent_1.default.create({
            name,
            fileId,
            walletAddress,
            userId: user._id, // Link agent to user
        });
        // Update user's stats
        await User_1.default.findByIdAndUpdate(user._id, {
            $inc: { 'stats.totalAgents': 1 }
        });
        return res.json(agent);
    }
    catch (error) {
        console.error('Failed to create agent:', error);
        return res.status(500).json({
            error: 'Failed to create agent',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
router.get('/user/:walletAddress', async (req, res) => {
    try {
        const { walletAddress } = req.params;
        // Find user's agents
        const agents = await Agent_1.default.find({ walletAddress })
            .sort({ createdAt: -1 }); // Most recent first
        return res.json(agents);
    }
    catch (error) {
        console.error('Failed to fetch user agents:', error);
        return res.status(500).json({
            error: 'Failed to fetch agents',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
exports.default = router; // Ensure this line is present
