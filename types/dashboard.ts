export interface Agent {
  _id: string
  name: string
  category: string
  description?: string
  winRate: number
  matchesPlayed: number
  matchesWon: number
  wins: number
  losses: number
  draws: number
  points: number
  rank: number
  status: string
  createdAt: string
}

export interface Activity {
  _id: string
  type: string
  description: string
  timestamp: string
  metadata?: any
}

export interface UserStats {
  totalAgents: number
  competitionsWon: number
  tokensEarned: number
  winRate: number
}

export interface Competition {
  _id: string
  title: string
  description: string
  prize: number
  status: 'upcoming' | 'active' | 'completed'
  startDate?: Date
  endDate?: Date
}

export interface User {
  _id: string
  walletAddress: string
  username: string
  bio?: string
  githubHandle?: string
  discordHandle?: string
  expertise: 'beginner' | 'intermediate' | 'expert'
  createdAt: Date
} 