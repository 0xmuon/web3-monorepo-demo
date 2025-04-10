"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chess_engine_1 = require("./chess-engine");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
async function runTestMatch() {
    const engine = new chess_engine_1.ChessEngine();
    try {
        console.log('Starting match between C++ bots...');
        const bot1Path = path_1.default.join(__dirname, 'agents', 'random_bot.exe');
        const bot2Path = path_1.default.join(__dirname, 'agents', 'aggressive_bot.exe');
        if (!fs_1.default.existsSync(bot1Path) || !fs_1.default.existsSync(bot2Path)) {
            throw new Error('Bot executables not found. Please run npm run compile-bots first.');
        }
        const result = await engine.runMatch(bot1Path, bot2Path);
        console.log('\nMatch Result:');
        console.log('Winner:', result.winner === 1 ? 'Random Bot' : result.winner === 2 ? 'Aggressive Bot' : 'Draw');
        console.log('Reason:', result.reason);
        console.log('\nMoves played:');
        result.moves.forEach((move, index) => {
            if (index % 2 === 0) {
                process.stdout.write(`${Math.floor(index / 2) + 1}. ${move} `);
            }
            else {
                console.log(move);
            }
        });
    }
    catch (error) {
        console.error('Test match failed:', error);
    }
    finally {
        engine.cleanup();
    }
}
runTestMatch().catch(console.error);
