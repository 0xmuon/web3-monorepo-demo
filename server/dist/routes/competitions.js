"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/competitions.ts
const express_1 = __importDefault(require("express"));
const mongodb_1 = __importDefault(require("../lib/mongodb")); // Correct path
const Competition_1 = __importDefault(require("../models/Competition")); // Correct path
const chess_engine_1 = require("../engine/chess-engine");
const path_1 = __importDefault(require("path"));
const Agent_1 = __importDefault(require("../models/Agent"));
const router = express_1.default.Router();
const engine = new chess_engine_1.ChessEngine();
// Create a Map to store active matches
const matches = new Map();
router.get("/", async (req, res) => {
    try {
        await (0, mongodb_1.default)();
        const competitions = await Competition_1.default.find({})
            .populate("participants", "username walletAddress")
            .populate("winner", "username walletAddress")
            .populate("createdBy", "username walletAddress")
            .populate({
            path: "submissions",
            populate: {
                path: "agent",
                select: "name category winRate",
            },
        })
            .lean()
            .exec();
        return res.json(competitions);
    }
    catch (error) {
        console.error("Failed to fetch competitions:", error);
        return res.status(500).json({ error: "Failed to fetch competitions" });
    }
});
// Get engine status and info
router.get('/chess/status', async (req, res) => {
    try {
        const status = await engine.getEngineInfo();
        res.json(status);
    }
    catch (error) {
        console.error('Engine status error:', error);
        res.status(500).json({
            error: 'Failed to get engine status',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
    finally {
        engine.cleanup();
    }
});
// Get available agents for a user
router.get('/chess/agents/:wallet', async (req, res) => {
    try {
        const agents = await Agent_1.default.find({
            walletAddress: req.params.wallet,
            status: 'active'
        });
        res.json(agents);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch agents' });
    }
});
// Get leaderboard
router.get('/leaderboard', async (req, res) => {
    try {
        // Get all active agents with their current stats
        const agents = await Agent_1.default.find({ status: 'active' })
            .sort({ points: -1, wins: -1 }) // Sort by points first, then wins
            .limit(100) // Limit to top 100 agents
            .select('name walletAddress wins losses draws points');
        // Add rank to each agent
        const leaderboard = agents.map((agent, index) => ({
            id: agent._id,
            name: agent.name || 'Anonymous',
            owner: agent.walletAddress,
            wins: agent.wins || 0,
            losses: agent.losses || 0,
            draws: agent.draws || 0,
            points: agent.points || 0,
            rank: index + 1
        }));
        res.json(leaderboard);
    }
    catch (error) {
        console.error('Failed to get leaderboard:', error);
        res.status(500).json({
            error: 'Failed to get leaderboard',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
// Start a match between two agents
router.post('/match', async (req, res) => {
    try {
        const { walletAddress1, walletAddress2 } = req.body;
        if (!walletAddress1 || !walletAddress2) {
            return res.status(400).json({
                status: 'error',
                message: 'Missing wallet addresses'
            });
        }
        // Initialize match state
        const matchId = Date.now().toString();
        matches.set(matchId, {
            status: 'initializing',
            message: 'Initializing chess engine...',
            moves: []
        });
        // Return the matchId immediately
        res.json({
            status: 'initializing',
            matchId,
            message: 'Match initialization started'
        });
        // Initialize the engine
        try {
            console.log('Initializing chess engine...');
            await engine.initialize();
            console.log('Chess engine initialized successfully');
            // Update match status to running
            const match = matches.get(matchId);
            match.status = 'running';
            match.message = 'Match in progress...';
            console.log('Match status updated to running');
            // Run the match asynchronously
            console.log('Starting match between agents...');
            const result = await engine.runMatch(path_1.default.join(process.cwd(), 'uploads', 'agents', `${walletAddress1}.cpp`), path_1.default.join(process.cwd(), 'uploads', 'agents', `${walletAddress2}.cpp`));
            console.log('Match completed with result:', result);
            // Update match status based on result
            if (result.winner === 1) {
                match.status = 'completed';
                match.winner = 'agent1';
                match.message = 'Match completed. Agent 1 won!';
            }
            else if (result.winner === 2) {
                match.status = 'completed';
                match.winner = 'agent2';
                match.message = 'Match completed. Agent 2 won!';
            }
            else {
                match.status = 'completed';
                match.winner = 'draw';
                match.message = 'Match completed. The game ended in a draw.';
            }
            match.moves = result.moves;
            console.log('Match completed successfully');
        }
        catch (error) {
            console.error('Match failed:', error);
            const match = matches.get(matchId);
            match.status = 'error';
            match.message = error instanceof Error ? error.message : 'Internal server error';
        }
    }
    catch (error) {
        console.error('Failed to start match:', error);
        return res.status(500).json({
            status: 'error',
            message: error instanceof Error ? error.message : 'Internal server error'
        });
    }
});
// Get match status
router.get('/match/:matchId/status', async (req, res) => {
    try {
        const { matchId } = req.params;
        const match = matches.get(matchId);
        if (!match) {
            return res.status(404).json({
                status: 'error',
                message: 'Match not found'
            });
        }
        res.json({
            status: match.status,
            message: match.message,
            winner: match.winner,
            moves: match.moves
        });
    }
    catch (error) {
        console.error('Failed to get match status:', error);
        res.status(500).json({
            error: 'Failed to get match status',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
exports.default = router; // Ensure this line is present
