import { Agent, User } from '@/types/dashboard';

export async function proxyRequest(url: string, options: RequestInit = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
}

export async function fetchUser(walletAddress: string): Promise<User> {
  const response = await fetch(`/api/users/${walletAddress}`);
  if (!response.ok) {
    throw new Error('Failed to fetch user');
  }
  return response.json();
}

export async function fetchUserStats(walletAddress: string) {
  const response = await fetch(`/api/users/${walletAddress}/stats`);
  if (!response.ok) {
    throw new Error('Failed to fetch user stats');
  }
  return response.json();
}

export async function startMatch(agentId: string, opponentId: string) {
  const response = await fetch('/api/chess/match', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ agentId, opponentId }),
  });

  if (!response.ok) {
    throw new Error('Failed to start match');
  }

  return response.json();
}

export async function fetchLeaderboard() {
  const response = await fetch('/api/chess/leaderboard');
  if (!response.ok) {
    throw new Error('Failed to fetch leaderboard');
  }
  return response.json();
}

export async function uploadAgent(file: File, walletAddress: string): Promise<Agent> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('walletAddress', walletAddress);

  const response = await fetch('/api/upload', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Failed to upload agent');
  }

  return response.json();
} 