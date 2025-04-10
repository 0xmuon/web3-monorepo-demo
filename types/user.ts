export interface User {
  _id: string
  walletAddress: string
  username?: string
  profileImage?: string
  bio?: string
  role: 'user' | 'admin'
  stats: {
    totalAgents: number
    competitionsWon: number
    tokensEarned: number
    winRate: number
  }
  totalEarnings: number
  createdAt: string
  competitions: string[]
  submissions: string[]
  agents: string[]
  activities: string[]
} 