"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.chessEngine = exports.ChessEngine = void 0;
const child_process_1 = require("child_process");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
class ChessEngine {
    constructor() {
        this.process = null;
        this.isReady = false;
        // Update the Stockfish path to use the correct filename
        this.enginePath = process.platform === 'win32'
            ? path_1.default.join(process.cwd(), 'src/engine/stockfish/stockfish-windows-x86-64-avx2.exe')
            : path_1.default.join(process.cwd(), 'src/engine/stockfish/stockfish');
    }
    async initialize() {
        return new Promise((resolve, reject) => {
            // Check if engine is already initialized
            if (this.isReady && this.process) {
                console.log('Engine already initialized');
                resolve();
                return;
            }
            // Check if Stockfish exists
            if (!fs_1.default.existsSync(this.enginePath)) {
                console.error(`Stockfish not found at path: ${this.enginePath}`);
                reject(new Error(`Stockfish not found at path: ${this.enginePath}`));
                return;
            }
            try {
                console.log('Starting Stockfish engine from:', this.enginePath);
                // Spawn the Stockfish process
                this.process = (0, child_process_1.spawn)(this.enginePath, [], {
                    stdio: ['pipe', 'pipe', 'pipe']
                });
                // Handle process errors
                this.process.on('error', (error) => {
                    console.error('Stockfish process error:', error);
                    this.isReady = false;
                    reject(error);
                });
                // Handle unexpected exit
                this.process.on('exit', (code) => {
                    this.isReady = false;
                    if (code !== 0) {
                        console.error(`Stockfish process exited with code ${code}`);
                        reject(new Error(`Stockfish process exited with code ${code}`));
                    }
                });
                let initOutput = '';
                // Listen for "uciok" response
                this.process.stdout?.on('data', (data) => {
                    const output = data.toString();
                    initOutput += output;
                    console.log('Stockfish output:', output);
                    if (output.includes('uciok')) {
                        console.log('Stockfish engine initialized successfully');
                        this.isReady = true;
                        resolve();
                    }
                });
                // Send UCI initialization command
                console.log('Sending UCI initialization commands...');
                this.sendCommand('uci');
                this.sendCommand('isready');
                // Set initialization timeout
                setTimeout(() => {
                    if (!this.isReady) {
                        console.error('Engine initialization timeout. Last output:', initOutput);
                        this.process?.kill();
                        this.isReady = false;
                        reject(new Error('Engine initialization timeout - ensure Stockfish is properly installed'));
                    }
                }, 10000); // Increased timeout to 10 seconds
            }
            catch (error) {
                console.error('Failed to initialize chess engine:', error);
                this.isReady = false;
                reject(error);
            }
        });
    }
    sendCommand(command) {
        if (!this.process?.stdin?.write(`${command}\n`)) {
            throw new Error('Failed to send command to engine');
        }
    }
    async loadAgent(agentPath) {
        return new Promise((resolve, reject) => {
            if (!fs_1.default.existsSync(agentPath)) {
                reject(new Error(`Agent not found at path: ${agentPath}`));
                return;
            }
            // Add timeout for agent loading
            const timeout = setTimeout(() => {
                reject(new Error('Agent loading timeout'));
            }, 3000);
            // Load agent logic here
            // This will depend on how your agents are implemented
            resolve();
            clearTimeout(timeout);
        });
    }
    cleanup() {
        if (this.process) {
            this.process.kill();
            this.process = null;
            this.isReady = false;
        }
    }
    async getEngineInfo() {
        return new Promise((resolve) => {
            let version = '';
            let cores = 1;
            let ready = false;
            const handler = (data) => {
                const output = data.toString();
                // Get version info
                if (output.includes('Stockfish')) {
                    version = output.split('\n')[0].trim();
                }
                // Get CPU cores
                if (output.includes('threads')) {
                    cores = parseInt(output.match(/threads\s+(\d+)/)?.[1] || '1');
                }
                // Check if engine is ready
                if (output.includes('readyok')) {
                    ready = true;
                    this.process?.stdout?.removeListener('data', handler);
                    resolve({ version, ready, cores });
                }
            };
            this.process?.stdout?.on('data', handler);
            // Send commands to get info
            this.process?.stdin?.write('uci\n');
            this.process?.stdin?.write('setoption name Threads value 4\n');
            this.process?.stdin?.write('isready\n');
        });
    }
    async evaluatePosition(fen, timeLimit = 1000) {
        if (!this.process?.stdin || !this.process?.stdout) {
            throw new Error('Chess engine not properly initialized');
        }
        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                reject(new Error('Evaluation timeout'));
            }, timeLimit + 1000);
            let bestMove = '';
            let isGameOver = false;
            let winner = 0;
            let reason = '';
            const handler = (data) => {
                const output = data.toString();
                if (output.includes('mate 0')) {
                    isGameOver = true;
                    winner = output.includes('White') ? 1 : 2;
                    reason = 'Checkmate';
                }
                else if (output.includes('stalemate')) {
                    isGameOver = true;
                    winner = 0;
                    reason = 'Stalemate';
                }
                else if (output.includes('bestmove')) {
                    clearTimeout(timeout);
                    this.process.stdout.removeListener('data', handler);
                    bestMove = output.split('bestmove ')[1].split(' ')[0];
                    resolve({
                        isGameOver,
                        winner,
                        reason,
                        bestMove
                    });
                }
            };
            try {
                this.process.stdout.on('data', handler);
                this.process.stdin.write(`position fen ${fen}\n`);
                this.process.stdin.write(`go movetime ${timeLimit}\n`);
            }
            catch (error) {
                clearTimeout(timeout);
                reject(error);
            }
        });
    }
    async downloadAgent(fileId) {
        const tempPath = path_1.default.join(process.cwd(), 'temp', `${fileId}.js`);
        // Ensure temp directory exists
        if (!fs_1.default.existsSync(path_1.default.dirname(tempPath))) {
            fs_1.default.mkdirSync(path_1.default.dirname(tempPath), { recursive: true });
        }
        // Download file from Google Drive
        const dest = fs_1.default.createWriteStream(tempPath);
        const response = await this.drive.files.get({ fileId, alt: 'media' }, { responseType: 'stream' });
        await new Promise((resolve, reject) => {
            response.data
                .on('end', resolve)
                .on('error', reject)
                .pipe(dest);
        });
        return tempPath;
    }
    async runMatch(bot1Path, bot2Path) {
        console.log('Starting match between:', bot1Path, 'and', bot2Path);
        let bot1 = null;
        let bot2 = null;
        try {
            // Ensure the uploads directory exists
            const uploadsDir = path_1.default.join(process.cwd(), 'uploads', 'agents');
            if (!fs_1.default.existsSync(uploadsDir)) {
                fs_1.default.mkdirSync(uploadsDir, { recursive: true });
            }
            // Get absolute paths for the bots
            const bot1AbsolutePath = path_1.default.isAbsolute(bot1Path) ? bot1Path : path_1.default.join(process.cwd(), bot1Path);
            const bot2AbsolutePath = path_1.default.isAbsolute(bot2Path) ? bot2Path : path_1.default.join(process.cwd(), bot2Path);
            console.log('Bot paths:', {
                bot1: bot1AbsolutePath,
                bot2: bot2AbsolutePath
            });
            // Verify files exist before compilation
            if (!fs_1.default.existsSync(bot1AbsolutePath)) {
                throw new Error(`Bot 1 file not found at path: ${bot1AbsolutePath}`);
            }
            if (!fs_1.default.existsSync(bot2AbsolutePath)) {
                throw new Error(`Bot 2 file not found at path: ${bot2AbsolutePath}`);
            }
            // Compile bots if they're C++ files
            let bot1Executable = bot1AbsolutePath;
            let bot2Executable = bot2AbsolutePath;
            if (bot1AbsolutePath.endsWith('.cpp')) {
                console.log('Compiling Bot 1...');
                bot1Executable = await this.compileCppBot(bot1AbsolutePath);
                console.log('Bot 1 compiled successfully to:', bot1Executable);
            }
            if (bot2AbsolutePath.endsWith('.cpp')) {
                console.log('Compiling Bot 2...');
                bot2Executable = await this.compileCppBot(bot2AbsolutePath);
                console.log('Bot 2 compiled successfully to:', bot2Executable);
            }
            // Verify executables exist
            if (!fs_1.default.existsSync(bot1Executable)) {
                throw new Error(`Bot 1 executable not found at path: ${bot1Executable}`);
            }
            if (!fs_1.default.existsSync(bot2Executable)) {
                throw new Error(`Bot 2 executable not found at path: ${bot2Executable}`);
            }
            console.log('Starting bots...');
            bot1 = (0, child_process_1.spawn)(bot1Executable, [], { stdio: ['pipe', 'pipe', 'pipe'] });
            bot2 = (0, child_process_1.spawn)(bot2Executable, [], { stdio: ['pipe', 'pipe', 'pipe'] });
            // Initialize UCI mode for both bots
            console.log('Initializing bots...');
            bot1.stdin.write('uci\n');
            bot2.stdin.write('uci\n');
            bot1.stdin.write('isready\n');
            bot2.stdin.write('isready\n');
            let currentFen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
            let moves = [];
            let currentPlayer = 1;
            let moveCount = 0;
            // Wait for both bots to be ready
            console.log('Waiting for bots to be ready...');
            await Promise.all([
                this.waitForBotReady(bot1, "Bot 1"),
                this.waitForBotReady(bot2, "Bot 2")
            ]);
            console.log('Both bots are ready!');
            while (moveCount < 50) {
                const currentBot = currentPlayer === 1 ? bot1 : bot2;
                const botName = currentPlayer === 1 ? "Bot 1" : "Bot 2";
                console.log(`\nTurn ${moveCount + 1}, ${botName}'s move`);
                console.log('Position:', currentFen);
                try {
                    // Get move from current bot
                    currentBot.stdin.write(`position fen ${currentFen}\n`);
                    currentBot.stdin.write('go movetime 1000\n');
                    const move = await this.getBotMove(currentBot, botName);
                    console.log(`${botName} plays: ${move}`);
                    // Validate move format
                    if (!this.isValidMove(move)) {
                        console.log(`Invalid move format from ${botName}: ${move}`);
                        return {
                            winner: currentPlayer === 1 ? 2 : 1,
                            reason: 'Invalid move format',
                            moves
                        };
                    }
                    // Update game state
                    moves.push(move);
                    // Update FEN using Stockfish
                    this.process?.stdin?.write(`position fen ${currentFen} moves ${move}\n`);
                    this.process?.stdin?.write('d\n');
                    // Get new position
                    currentFen = await this.getNewPosition();
                    // Check game state
                    const gameState = await this.evaluatePosition(currentFen);
                    if (gameState.isGameOver) {
                        console.log('Game over!', {
                            winner: gameState.winner,
                            reason: gameState.reason
                        });
                        return {
                            winner: gameState.winner,
                            reason: gameState.reason,
                            moves
                        };
                    }
                    moveCount++;
                    currentPlayer = currentPlayer === 1 ? 2 : 1;
                }
                catch (error) {
                    console.error(`Error during ${botName}'s turn:`, error);
                    return {
                        winner: currentPlayer === 1 ? 2 : 1,
                        reason: `Bot error: ${error instanceof Error ? error.message : 'Unknown error'}`,
                        moves
                    };
                }
            }
            console.log('Game ended in draw by move limit');
            return {
                winner: 0,
                reason: 'Draw by move limit',
                moves
            };
        }
        catch (error) {
            console.error('Match failed:', error);
            throw error;
        }
        finally {
            // Cleanup bots
            if (bot1) {
                try {
                    bot1.stdin.write('quit\n');
                    bot1.kill();
                }
                catch (error) {
                    console.error('Error cleaning up bot1:', error);
                }
            }
            if (bot2) {
                try {
                    bot2.stdin.write('quit\n');
                    bot2.kill();
                }
                catch (error) {
                    console.error('Error cleaning up bot2:', error);
                }
            }
        }
    }
    waitForBotReady(bot, name) {
        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                reject(new Error(`${name} initialization timeout`));
            }, 5000);
            const handler = (data) => {
                const output = data.toString();
                if (output.includes('uciok')) {
                    bot.stdout.removeListener('data', handler);
                    clearTimeout(timeout);
                    resolve();
                }
            };
            bot.stdout.on('data', handler);
        });
    }
    getBotMove(bot, botName) {
        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                reject(new Error(`${botName} move timeout`));
            }, 5000);
            const moveHandler = (data) => {
                const output = data.toString();
                if (output.includes('bestmove')) {
                    clearTimeout(timeout);
                    bot.stdout.removeListener('data', moveHandler);
                    const move = output.split('bestmove ')[1].split(' ')[0].trim();
                    if (move && move !== '(none)') {
                        resolve(move);
                    }
                    else {
                        reject(new Error(`${botName} returned invalid move`));
                    }
                }
            };
            bot.stdout.on('data', moveHandler);
        });
    }
    getNewPosition() {
        if (!this.process?.stdin || !this.process?.stdout) {
            throw new Error('Chess engine not properly initialized');
        }
        return new Promise((resolve) => {
            const handler = (data) => {
                const output = data.toString();
                if (output.includes('Fen: ')) {
                    this.process.stdout.removeListener('data', handler);
                    const newFen = output.split('Fen: ')[1].split('\n')[0].trim();
                    resolve(newFen);
                }
            };
            this.process.stdout.on('data', handler);
        });
    }
    isValidMove(move) {
        // Validate move format (e.g., "e2e4")
        return /^[a-h][1-8][a-h][1-8]$/.test(move);
    }
    updatePosition(fen, move) {
        // Simple position update (in real implementation, use Stockfish for this)
        return fen; // Placeholder
    }
    cleanupBot(bot) {
        try {
            bot.stdin.write('quit\n');
            bot.kill();
        }
        catch (error) {
            console.error('Error cleaning up bot:', error);
        }
    }
    async runGame(agent1FileId, agent2FileId) {
        let bot1 = null;
        let bot2 = null;
        try {
            bot1 = await this.initializeBot(agent1FileId);
            bot2 = await this.initializeBot(agent2FileId);
            let currentPosition = 'startpos';
            const moves = [];
            let currentPlayer = 1;
            let moveCount = 0;
            while (moveCount < 100) {
                const currentBot = currentPlayer === 1 ? bot1 : bot2;
                if (!currentBot) {
                    throw new Error(`Bot ${currentPlayer} not initialized`);
                }
                try {
                    const move = await this.getMoveWithTimeout(currentBot, currentPosition);
                    if (!this.isValidMove(move)) {
                        return {
                            winner: currentPlayer === 1 ? 2 : 1,
                            reason: `Invalid move by player ${currentPlayer}`,
                            moves
                        };
                    }
                    moves.push(move);
                    if (!this.process?.stdin) {
                        throw new Error('Chess engine not initialized');
                    }
                    this.process.stdin.write(`position fen ${currentPosition} moves ${move}\n`);
                    this.process.stdin.write('d\n');
                    currentPosition = await this.getNewPosition();
                    const gameState = await this.evaluatePosition(currentPosition);
                    if (gameState.isGameOver) {
                        return {
                            winner: gameState.winner || 0,
                            reason: gameState.reason || 'Game Over',
                            moves
                        };
                    }
                    currentPlayer = currentPlayer === 1 ? 2 : 1;
                    moveCount++;
                }
                catch (err) {
                    const error = err;
                    return {
                        winner: currentPlayer === 1 ? 2 : 1,
                        reason: `Player ${currentPlayer} failed to make a move: ${error.message}`,
                        moves
                    };
                }
            }
            return {
                winner: 0,
                reason: 'Game exceeded maximum moves',
                moves
            };
        }
        catch (err) {
            const error = err;
            throw new Error(`Failed to run game: ${error.message}`);
        }
        finally {
            if (bot1?.stdin)
                bot1.stdin.write('quit\n');
            if (bot2?.stdin)
                bot2.stdin.write('quit\n');
            if (bot1)
                bot1.kill();
            if (bot2)
                bot2.kill();
        }
    }
    async getMoveWithTimeout(bot, position) {
        if (!bot.stdin || !bot.stdout) {
            throw new Error('Bot process not properly initialized');
        }
        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                reject(new Error('Move timeout'));
            }, 5000);
            const moveHandler = (data) => {
                const move = data.toString().trim();
                if (this.isValidMove(move)) {
                    clearTimeout(timeout);
                    bot.stdout.removeListener('data', moveHandler);
                    resolve(move);
                }
            };
            try {
                bot.stdout.on('data', moveHandler);
                bot.stdin.write(`position ${position}\n`);
                bot.stdin.write('go movetime 1000\n');
            }
            catch (error) {
                clearTimeout(timeout);
                reject(error);
            }
        });
    }
    async initializeBot(agentPath) {
        const bot = (0, child_process_1.spawn)(agentPath);
        if (!bot.stdin || !bot.stdout) {
            throw new Error('Failed to initialize bot process');
        }
        try {
            bot.stdin.write('uci\n');
            bot.stdin.write('isready\n');
        }
        catch (error) {
            bot.kill();
            throw error;
        }
        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                bot.kill();
                reject(new Error('Bot initialization timeout'));
            }, 5000);
            const handler = (data) => {
                if (data.toString().includes('readyok')) {
                    clearTimeout(timeout);
                    bot.stdout?.removeListener('data', handler);
                    resolve(bot);
                }
            };
            try {
                bot.stdout.on('data', handler);
                bot.on('error', (error) => {
                    clearTimeout(timeout);
                    reject(error);
                });
            }
            catch (error) {
                clearTimeout(timeout);
                bot.kill();
                reject(error);
            }
        });
    }
    async startMatch(userAgentPath, opponentPath) {
        if (!this.isReady) {
            await this.initialize();
        }
        try {
            // Verify files exist
            if (!fs_1.default.existsSync(userAgentPath)) {
                throw new Error(`User agent not found at path: ${userAgentPath}`);
            }
            if (!fs_1.default.existsSync(opponentPath)) {
                throw new Error(`Opponent agent not found at path: ${opponentPath}`);
            }
            // Run the match
            return await this.runMatch(userAgentPath, opponentPath);
        }
        catch (error) {
            console.error('Match failed:', error);
            throw error;
        }
    }
    async compileCppBot(sourcePath) {
        const outputPath = sourcePath.replace('.cpp', process.platform === 'win32' ? '.exe' : '');
        return new Promise((resolve, reject) => {
            const compiler = process.platform === 'win32' ? 'g++' : 'g++';
            const compileProcess = (0, child_process_1.spawn)(compiler, [
                sourcePath,
                '-o', outputPath,
                '-std=c++11',
                '-Wall',
                '-Wextra',
                '-O2',
                '-march=native' // Optimize for current CPU
            ]);
            let errorOutput = '';
            compileProcess.stderr.on('data', (data) => {
                const error = data.toString();
                errorOutput += error;
                console.error(`Compilation error: ${error}`);
            });
            compileProcess.on('close', (code) => {
                if (code === 0) {
                    // Verify the executable was created
                    if (!fs_1.default.existsSync(outputPath)) {
                        reject(new Error(`Compilation succeeded but executable was not created at ${outputPath}`));
                        return;
                    }
                    // Make the executable executable (Unix-like systems)
                    if (process.platform !== 'win32') {
                        fs_1.default.chmodSync(outputPath, 0o755);
                    }
                    resolve(outputPath);
                }
                else {
                    reject(new Error(`Compilation failed with code ${code}\n${errorOutput}`));
                }
            });
            // Add timeout for compilation
            setTimeout(() => {
                if (compileProcess.killed)
                    return;
                compileProcess.kill();
                reject(new Error('Compilation timed out after 30 seconds'));
            }, 30000);
        });
    }
}
exports.ChessEngine = ChessEngine;
// Export a singleton instance
exports.chessEngine = new ChessEngine();
