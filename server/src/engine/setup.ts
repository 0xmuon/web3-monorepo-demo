import fs from 'fs';
import path from 'path';

const STOCKFISH_PATH = path.join(
  process.cwd(),
  'src',
  'engine',
  'stockfish',
  'stockfish-windows-x86-64-avx2.exe'
);

const RANDOM_AGENT_PATH = path.join(
  process.cwd(),
  'src',
  'engine',
  'agents',
  'random-agent.ts'
);

const AGGRESSIVE_AGENT_PATH = path.join(
  process.cwd(),
  'src',
  'engine',
  'agents',
  'aggressive-agent.ts'
);

const TYPES_DIR = path.join(
  process.cwd(),
  'src',
  'engine',
  'types'
);

function checkEnvironment() {
  console.log('Checking chess engine environment...');

  // Create types directory and file
  if (!fs.existsSync(TYPES_DIR)) {
    fs.mkdirSync(TYPES_DIR, { recursive: true });
    fs.writeFileSync(
      path.join(TYPES_DIR, 'chess.ts'),
      `export interface ChessMove {
  from: string;
  to: string;
}

export interface GameResult {
  winner: number;
  reason: string;
  moves: string[];
}

export interface EngineInfo {
  version: string;
  ready: boolean;
  cores: number;
}
`
    );
  }

  // Check Stockfish
  if (!fs.existsSync(STOCKFISH_PATH)) {
    console.error(`
ERROR: Stockfish engine not found at ${STOCKFISH_PATH}

Please:
1. Download Stockfish from https://stockfishchess.org/download/
2. Extract stockfish-windows-x86-64-avx2.exe
3. Place it in server/src/engine/stockfish/
`);
    process.exit(1);
  }

  // Check agents directory
  const agentsDir = path.dirname(RANDOM_AGENT_PATH);
  if (!fs.existsSync(agentsDir)) {
    fs.mkdirSync(agentsDir, { recursive: true });
    console.log('Created agents directory');
  }

  // Check random agent
  if (!fs.existsSync(RANDOM_AGENT_PATH)) {
    console.log('Creating random agent...');
    fs.writeFileSync(RANDOM_AGENT_PATH, `import { ChessMove } from '../types/chess';

// Simple agent that makes random legal moves
export async function getMove(fen: string): Promise<string> {
  try {
    // Basic pawn moves for white and black
    const basicMoves: string[] = [
      // White pawn moves
      'e2e4', 'd2d4', 'c2c4', 'b2b3', 'g2g3', 'a2a3', 'h2h3', 'f2f3',
      // Black pawn moves
      'e7e5', 'd7d5', 'c7c5', 'b7b6', 'g7g6', 'a7a6', 'h7h6', 'f7f6'
    ];

    // Random selection
    const moveIndex: number = Math.floor(Math.random() * basicMoves.length);
    return basicMoves[moveIndex];
  } catch (error) {
    throw new Error(\`Random agent error: \${error instanceof Error ? error.message : 'Unknown error'}\`);
  }
}
`);
  }

  // Check aggressive agent
  if (!fs.existsSync(AGGRESSIVE_AGENT_PATH)) {
    console.log('Creating aggressive agent...');
    fs.writeFileSync(AGGRESSIVE_AGENT_PATH, `import { ChessMove } from '../types/chess';

// Agent that prefers aggressive center pawn moves
export async function getMove(fen: string): Promise<string> {
  try {
    // Prioritize center control moves for both white and black
    const centerMoves: string[] = [
      // White center moves
      'e2e4', 'd2d4',
      // Black center moves
      'e7e5', 'd7d5'
    ];

    // Random selection between center moves
    const moveIndex: number = Math.floor(Math.random() * centerMoves.length);
    return centerMoves[moveIndex];
  } catch (error) {
    throw new Error(\`Aggressive agent error: \${error instanceof Error ? error.message : 'Unknown error'}\`);
  }
}
`);
  }

  console.log('Environment check complete!');
}

checkEnvironment(); 