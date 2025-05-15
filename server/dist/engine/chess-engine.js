"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChessEngine = void 0;
const child_process_1 = require("child_process");
const fs_1 = __importDefault(require("fs"));
const axios_1 = __importDefault(require("axios"));
class ChessEngine {
    constructor() {
        this.apiUrl = 'https://stockfish-api-65pi.onrender.com:10000';
        // No need for local engine path anymore
    }
    async initialize() {
        try {
            // Check if the API is available
            const response = await axios_1.default.get(`${this.apiUrl}/`);
            if (response.data.status !== 'ok') {
                throw new Error('Stockfish API is not available');
            }
            console.log('Stockfish API initialized successfully');
        }
        catch (error) {
            console.error('Failed to initialize chess engine:', error);
            throw error;
        }
    }
    async getEngineInfo() {
        try {
            const response = await axios_1.default.get(`${this.apiUrl}/`);
            return {
                version: 'Stockfish 15.1',
                ready: response.data.status === 'ok',
                cores: 1
            };
        }
        catch (error) {
            console.error('Failed to get engine info:', error);
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
                '-march=native'
            ]);
            let errorOutput = '';
            compileProcess.stderr.on('data', (data) => {
                const error = data.toString();
                errorOutput += error;
                console.error(`Compilation error: ${error}`);
            });
            compileProcess.on('close', (code) => {
                if (code === 0) {
                    if (!fs_1.default.existsSync(outputPath)) {
                        reject(new Error(`Compilation succeeded but executable was not created at ${outputPath}`));
                        return;
                    }
                    if (process.platform !== 'win32') {
                        fs_1.default.chmodSync(outputPath, 0o755);
                    }
                    resolve(outputPath);
                }
                else {
                    reject(new Error(`Compilation failed with code ${code}\n${errorOutput}`));
                }
            });
            setTimeout(() => {
                if (compileProcess.killed)
                    return;
                compileProcess.kill();
                reject(new Error('Compilation timed out after 30 seconds'));
            }, 30000);
        });
    }
    async initializeBot(executablePath) {
        const bot = (0, child_process_1.spawn)(executablePath);
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
    async getBotMove(bot, position) {
        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                reject(new Error('Bot move timeout'));
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
                        reject(new Error('Bot returned invalid move'));
                    }
                }
            };
            try {
                bot.stdout.on('data', moveHandler);
                bot.stdin.write(`position fen ${position}\n`);
                bot.stdin.write('go movetime 1000\n');
            }
            catch (error) {
                clearTimeout(timeout);
                reject(error);
            }
        });
    }
    async runMatch(bot1Path, bot2Path) {
        let bot1 = null;
        let bot2 = null;
        try {
            // Compile both bots if they are C++ files
            const bot1Executable = bot1Path.endsWith('.cpp') ? await this.compileCppBot(bot1Path) : bot1Path;
            const bot2Executable = bot2Path.endsWith('.cpp') ? await this.compileCppBot(bot2Path) : bot2Path;
            // Initialize both bots
            bot1 = await this.initializeBot(bot1Executable);
            bot2 = await this.initializeBot(bot2Executable);
            let currentFen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
            const moves = [];
            let currentPlayer = 1;
            let moveCount = 0;
            while (moveCount < 50) {
                const currentBot = currentPlayer === 1 ? bot1 : bot2;
                try {
                    // Get move from current bot
                    const move = await this.getBotMove(currentBot, currentFen);
                    moves.push(move);
                    // Get best move from Stockfish API
                    const response = await axios_1.default.post(`${this.apiUrl}/api/bestmove`, {
                        moves: moves
                    });
                    if (response.data.bestMove === 'none') {
                        return {
                            winner: currentPlayer === 1 ? 2 : 1,
                            reason: 'No legal moves available',
                            moves,
                            engineOutput: response.data.bestMove
                        };
                    }
                    // Update position
                    currentFen = response.data.newFen || currentFen;
                    moveCount++;
                    currentPlayer = currentPlayer === 1 ? 2 : 1;
                }
                catch (error) {
                    return {
                        winner: currentPlayer === 1 ? 2 : 1,
                        reason: `Bot error: ${error instanceof Error ? error.message : 'Unknown error'}`,
                        moves
                    };
                }
            }
            return {
                winner: 0,
                reason: 'Draw by move limit',
                moves
            };
        }
        finally {
            // Cleanup bots
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
    async startMatch(userAgentPath, opponentPath) {
        return this.runMatch(userAgentPath, opponentPath);
    }
    async evaluatePosition(fen, timeLimit = 1000) {
        try {
            const response = await axios_1.default.post(`${this.apiUrl}/evaluate`, {
                fen,
                timeLimit
            });
            return {
                isGameOver: response.data.isGameOver,
                winner: response.data.winner,
                reason: response.data.reason,
                bestMove: response.data.bestMove
            };
        }
        catch (error) {
            console.error('Failed to evaluate position:', error);
            throw error;
        }
    }
    cleanup() {
        // No cleanup needed for online API
    }
}
exports.ChessEngine = ChessEngine;
