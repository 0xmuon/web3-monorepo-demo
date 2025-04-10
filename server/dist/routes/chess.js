"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const chess_engine_1 = require("../engine/chess-engine");
const multer_1 = __importDefault(require("multer"));
const googleapis_1 = require("googleapis");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const Agent_1 = __importDefault(require("../models/Agent"));
const chess_engine_2 = require("../engine/chess-engine");
const router = express_1.default.Router();
const engine = new chess_engine_1.ChessEngine();
// Create a Map to store active matches
const matches = new Map();
// Configure Google Drive
const auth = new googleapis_1.google.auth.GoogleAuth({
    keyFile: path_1.default.join(__dirname, '../../credentials.json'),
    scopes: ['https://www.googleapis.com/auth/drive.file'],
});
const drive = googleapis_1.google.drive({ version: 'v3', auth });
// Configure multer for file uploads
const storage = multer_1.default.diskStorage({
    destination: './uploads/agents',
    filename: function (req, file, cb) {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});
const upload = (0, multer_1.default)({
    storage,
    fileFilter: function (req, file, cb) {
        if (file.originalname.endsWith('.cpp')) {
            cb(null, true);
        }
        else {
            cb(null, false);
        }
    },
    limits: {
        fileSize: 1024 * 1024 // 1MB limit
    }
});
// Add path to Stockfish executable - adjust this path based on your system
const STOCKFISH_PATH = process.platform === 'win32'
    ? path_1.default.join(process.cwd(), 'src/engine/stockfish/stockfish.exe') // Windows
    : path_1.default.join(process.cwd(), 'src/engine/stockfish/stockfish'); // Linux/Mac
// Get engine status
router.get('/status', async (req, res) => {
    try {
        const status = await engine.getEngineInfo();
        res.json(status);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to get engine status' });
    }
});
// Upload agent
router.post('/upload', upload.single('file'), async (req, res) => {
    try {
        const file = req.file;
        const wallet = req.body.wallet;
        if (!file || !wallet) {
            return res.status(400).json({ error: 'Missing file or wallet address' });
        }
        // Upload to Google Drive
        const response = await drive.files.create({
            requestBody: {
                name: file.filename,
                mimeType: 'text/x-c++src',
            },
            media: {
                mimeType: 'text/x-c++src',
                body: fs_1.default.createReadStream(file.path),
            },
        });
        // Save agent info to database
        // ... implement database logic here ...
        res.json({
            message: 'Agent uploaded successfully',
            fileId: response.data.id
        });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to upload agent' });
    }
});
// Get user's agent
router.get('/agent/:wallet', async (req, res) => {
    try {
        const wallet = req.params.wallet;
        // Get agent from database
        // ... implement database logic here ...
        res.json({
            id: 'agent_id',
            name: 'Agent Name',
            owner: wallet,
            wins: 0,
            losses: 0,
            rank: 1
        });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to get agent' });
    }
});
// Get leaderboard
router.get('/leaderboard', async (req, res) => {
    try {
        const agents = await Agent_1.default.find({ status: 'active' })
            .sort({ points: -1, wins: -1 }) // Sort by points first, then wins
            .limit(100) // Limit to top 100 agents
            .select('name walletAddress wins losses draws points');
        // Add rank to each agent
        const leaderboard = agents.map((agent, index) => ({
            id: agent._id,
            name: agent.name,
            owner: agent.walletAddress,
            wins: agent.wins,
            losses: agent.losses,
            draws: agent.draws,
            points: agent.points,
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
// GET match status
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
        // Return a properly formatted JSON response
        return res.json({
            status: match.status,
            message: match.message,
            winner: match.winner,
            moves: match.moves || []
        });
    }
    catch (error) {
        console.error('Error getting match status:', error);
        return res.status(500).json({
            status: 'error',
            message: error instanceof Error ? error.message : 'Internal server error'
        });
    }
});
// Update the match endpoint to handle errors properly
router.post('/match', async (req, res) => {
    try {
        const { fileId, walletAddress } = req.body;
        console.log('Starting match with walletAddress:', walletAddress);
        if (!walletAddress) {
            return res.status(400).json({
                status: 'error',
                message: 'Missing walletAddress in request'
            });
        }
        // Initialize match state
        const matchId = Date.now().toString();
        matches.set(matchId, {
            status: 'initializing',
            message: 'Initializing chess engine...',
            moves: []
        });
        // Get the full paths for the agents
        const userAgentPath = path_1.default.join(process.cwd(), 'uploads', 'agents', `${fileId}.cpp`);
        const aggressiveBotPath = path_1.default.join(process.cwd(), 'src', 'engine', 'agents', 'aggressive_bot.cpp');
        console.log('Checking file paths:');
        console.log('User agent path:', userAgentPath);
        console.log('Aggressive bot path:', aggressiveBotPath);
        // Verify files exist
        if (!fs_1.default.existsSync(userAgentPath)) {
            throw new Error(`User agent not found at path: ${userAgentPath}`);
        }
        if (!fs_1.default.existsSync(aggressiveBotPath)) {
            throw new Error(`Aggressive bot not found at path: ${aggressiveBotPath}`);
        }
        // Return the matchId immediately
        res.json({
            status: 'initializing',
            matchId,
            message: 'Match initialization started'
        });
        // Initialize the engine
        try {
            console.log('Initializing chess engine...');
            await chess_engine_2.chessEngine.initialize();
            console.log('Chess engine initialized successfully');
            // Update match status to running
            const match = matches.get(matchId);
            match.status = 'running';
            match.message = 'Match in progress...';
            console.log('Match status updated to running');
            // Run the match asynchronously
            console.log('Starting match between agents...');
            const result = await chess_engine_2.chessEngine.runMatch(userAgentPath, aggressiveBotPath);
            console.log('Match completed with result:', result);
            // Update match status and database based on result
            let points = 0;
            if (result.winner === 1) {
                match.status = 'completed';
                match.winner = 'user';
                match.message = 'Match completed. Your agent won! (+2 points)';
                points = 2;
            }
            else if (result.winner === 2) {
                match.status = 'completed';
                match.winner = 'bot';
                match.message = 'Match completed. The aggressive bot won. (+0 points)';
                points = 0;
            }
            else {
                match.status = 'completed';
                match.winner = 'draw';
                match.message = 'Match completed. The game ended in a draw. (+1 point)';
                points = 1;
            }
            match.moves = result.moves;
            console.log('Match completed successfully:', {
                winner: match.winner,
                reason: result.reason,
                moves: result.moves.length
            });
            // Update or create agent in database
            try {
                const agent = await Agent_1.default.findOneAndUpdate({ walletAddress }, {
                    $inc: {
                        wins: result.winner === 1 ? 1 : 0,
                        losses: result.winner === 2 ? 1 : 0,
                        draws: result.winner === 0 ? 1 : 0,
                        points: points
                    },
                    $setOnInsert: {
                        name: 'Anonymous',
                        status: 'active',
                        createdAt: new Date()
                    }
                }, { upsert: true, new: true });
                console.log('Agent stats updated in database:', {
                    walletAddress,
                    wins: agent.wins,
                    losses: agent.losses,
                    draws: agent.draws,
                    points: agent.points
                });
            }
            catch (dbError) {
                console.error('Failed to update agent stats:', dbError);
                // Continue even if database update fails
            }
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
// Helper function to download file from Google Drive
async function downloadFromDrive(fileId, dest) {
    try {
        const response = await drive.files.get({ fileId, alt: 'media' }, { responseType: 'stream' });
        await new Promise((resolve, reject) => {
            const dest_stream = fs_1.default.createWriteStream(dest);
            response.data
                .pipe(dest_stream)
                .on('finish', () => resolve())
                .on('error', (error) => reject(error));
        });
    }
    catch (error) {
        throw new Error(`Failed to download file from Drive: ${error}`);
    }
}
// GET /api/chess/match/:id/status
router.get('/match/:id/status', async (req, res) => {
    try {
        const { id } = req.params;
        const match = matches.get(id);
        if (!match) {
            return res.status(404).json({
                error: 'Match not found'
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
// Get user's agents
router.get('/agents/:wallet', async (req, res) => {
    try {
        const agents = await Agent_1.default.find({
            walletAddress: req.params.wallet,
            status: 'active'
        });
        res.json(agents);
    }
    catch (error) {
        console.error('Fetch agents error:', error);
        res.status(500).json({
            error: 'Failed to fetch agents',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
// Clean up completed matches periodically
setInterval(() => {
    for (const [id, match] of matches.entries()) {
        if (match.status === 'completed' || match.status === 'error') {
            // Keep matches for 1 hour before cleaning up
            setTimeout(() => {
                matches.delete(id);
            }, 3600000); // 1 hour
        }
    }
}, 300000); // Check every 5 minutes
exports.default = router;
