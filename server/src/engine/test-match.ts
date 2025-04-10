import { ChessEngine } from './chess-engine';
import path from 'path';
import fs from 'fs';

async function runTestMatch() {
  const engine = new ChessEngine();
  
  try {
    console.log('Starting match between C++ bots...');
    
    const bot1Path = path.join(__dirname, 'agents', 'random_bot.exe');
    const bot2Path = path.join(__dirname, 'agents', 'aggressive_bot.exe');

    if (!fs.existsSync(bot1Path) || !fs.existsSync(bot2Path)) {
      throw new Error('Bot executables not found. Please run npm run compile-bots first.');
    }

    const result = await engine.runMatch(bot1Path, bot2Path);

    console.log('\nMatch Result:');
    console.log('Winner:', result.winner === 1 ? 'Random Bot' : result.winner === 2 ? 'Aggressive Bot' : 'Draw');
    console.log('Reason:', result.reason);
    console.log('\nMoves played:');
    result.moves.forEach((move, index) => {
      if (index % 2 === 0) {
        process.stdout.write(`${Math.floor(index/2) + 1}. ${move} `);
      } else {
        console.log(move);
      }
    });

  } catch (error) {
    console.error('Test match failed:', error);
  } finally {
    engine.cleanup();
  }
}

runTestMatch().catch(console.error); 