interface ChessMove {
  from: string;
  to: string;
  promotion?: string;
}

export async function getMove(fen: string): Promise<ChessMove> {
  // Simple example that always moves a pawn from e2 to e4
  return {
    from: 'e2',
    to: 'e4'
  };
}

// Alternative if you prefer returning UCI format string:
export async function getMoveUCI(fen: string): Promise<string> {
  // Simple example that always moves a pawn from e2 to e4
  return 'e2e4';
} 