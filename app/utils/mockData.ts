// Mock data for when backend is unavailable
export const mockUserAgent = {
  id: "user-agent-1",
  name: "UserChess",
  owner: "User",
  wins: 5,
  losses: 2,
  draws: 1,
  points: 16,
  rank: 3,
  fileId: "1744215712709-295250193",
  walletAddress: "FpUuXHLEuK2N1fYe1WdLHhrAjnZg5h38s3whNQc8XBhk"
};

export const mockLeaderboard = [
  {
    id: "agent-1",
    name: "ChessMaster",
    owner: "Player1",
    wins: 10,
    losses: 1,
    draws: 0,
    points: 30,
    rank: 1,
    fileId: "file-1",
    walletAddress: "wallet-1"
  },
  {
    id: "agent-2",
    name: "GrandMaster",
    owner: "Player2",
    wins: 8,
    losses: 2,
    draws: 1,
    points: 25,
    rank: 2,
    fileId: "file-2",
    walletAddress: "wallet-2"
  },
  mockUserAgent,
  {
    id: "agent-4",
    name: "ChessBot",
    owner: "Player4",
    wins: 4,
    losses: 3,
    draws: 2,
    points: 14,
    rank: 4,
    fileId: "file-4",
    walletAddress: "wallet-4"
  },
  {
    id: "agent-5",
    name: "ChessPro",
    owner: "Player5",
    wins: 3,
    losses: 4,
    draws: 1,
    points: 10,
    rank: 5,
    fileId: "file-5",
    walletAddress: "wallet-5"
  }
];

export const mockMatchStatus = {
  matchId: "mock-match-1",
  status: "running",
  player1: {
    id: "user-agent-1",
    name: "UserChess",
    owner: "User",
    walletAddress: "FpUuXHLEuK2N1fYe1WdLHhrAjnZg5h38s3whNQc8XBhk"
  },
  player2: {
    id: "opponent-agent-1",
    name: "OpponentChess",
    owner: "Opponent",
    walletAddress: "opponent-wallet-address"
  },
  result: null,
  moves: [],
  startTime: new Date().toISOString(),
  endTime: null
};

// Helper function to check if backend is available
export async function isBackendAvailable(baseUrl: string): Promise<boolean> {
  try {
    // Try to fetch the leaderboard endpoint instead of a health endpoint
    // This is more reliable as it's an actual API endpoint that should exist
    const response = await fetch(`${baseUrl}/api/chess/leaderboard`, { 
      method: 'HEAD',
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    });
    
    // If we get a 404, it means the endpoint doesn't exist
    // If we get a 200, it means the backend is available
    // If we get any other status, we'll assume the backend is available but returning an error
    return response.status !== 404;
  } catch (error) {
    console.log('Backend availability check failed:', error);
    return false;
  }
} 