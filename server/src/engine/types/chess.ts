export interface ChessMove {
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