"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/stats.ts
const express_1 = __importDefault(require("express"));
const mongodb_1 = __importDefault(require("../lib/mongodb")); // Correct path
const User_1 = __importDefault(require("../models/User")); // Correct path
const Agent_1 = __importDefault(require("../models/Agent"));
const Activity_1 = __importDefault(require("../models/Activity"));
const router = express_1.default.Router();
router.get("/", async (req, res) => {
    console.log("Received stats request");
    console.log("Query parameters:", req.query);
    try {
        const { wallet } = req.query;
        console.log("Fetching stats for wallet:", wallet);
        if (!wallet) {
            console.log("No wallet provided in request");
            return res.status(400).json({ error: "No wallet provided" });
        }
        try {
            console.log("Attempting to connect to MongoDB...");
            await (0, mongodb_1.default)();
            console.log("Successfully connected to MongoDB");
        }
        catch (dbError) {
            console.error("MongoDB connection error:", dbError);
            return res.status(500).json({
                error: "Database connection failed",
                details: dbError.message
            });
        }
        // Get user data
        let user;
        try {
            console.log("Fetching user data for wallet:", wallet);
            user = await User_1.default.findOne({ walletAddress: wallet })
                .select("username walletAddress stats totalEarnings profileImage bio")
                .lean();
            console.log("Found user:", user);
        }
        catch (userError) {
            console.error("Error fetching user:", userError);
            return res.status(500).json({
                error: "Failed to fetch user data",
                details: userError.message
            });
        }
        if (!user) {
            console.log("User not found for wallet:", wallet);
            return res.status(404).json({ error: "User not found" });
        }
        // Get user's agents
        let agents;
        try {
            console.log("Fetching agents for wallet:", wallet);
            agents = await Agent_1.default.find({ walletAddress: wallet })
                .select("name wins losses status createdAt")
                .sort({ createdAt: -1 })
                .lean();
            console.log("Found agents:", agents);
        }
        catch (agentError) {
            console.error("Error fetching agents:", agentError);
            return res.status(500).json({
                error: "Failed to fetch agents",
                details: agentError.message
            });
        }
        // Get recent activities
        let activities;
        try {
            console.log("Fetching activities for wallet:", wallet);
            activities = await Activity_1.default.find({ user: wallet })
                .select("type title description metadata createdAt")
                .sort({ createdAt: -1 })
                .limit(10)
                .lean();
            console.log("Found activities:", activities);
        }
        catch (activityError) {
            console.error("Error fetching activities:", activityError);
            return res.status(500).json({
                error: "Failed to fetch activities",
                details: activityError.message
            });
        }
        // Calculate total games and win rate
        const totalGames = agents.reduce((sum, agent) => sum + agent.wins + agent.losses, 0);
        const totalWins = agents.reduce((sum, agent) => sum + agent.wins, 0);
        const winRate = totalGames > 0 ? (totalWins / totalGames) * 100 : 0;
        const response = {
            username: user.username,
            walletAddress: user.walletAddress,
            profileImage: user.profileImage,
            bio: user.bio,
            stats: {
                ...user.stats,
                totalGames,
                winRate: winRate.toFixed(2)
            },
            totalEarnings: user.totalEarnings,
            agents,
            activities
        };
        console.log("Sending response:", response);
        return res.json(response);
    }
    catch (error) {
        console.error("Failed to fetch user stats:", error);
        return res.status(500).json({
            error: "Failed to fetch user stats",
            details: error.message,
            stack: error.stack
        });
    }
});
exports.default = router; // Ensure this line is present
