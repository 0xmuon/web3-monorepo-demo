import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import User from '@/models/User'

export const revalidate = 60 // Revalidate every minute

interface UserStats {
  totalAgents: number;
  competitionsWon: number;
  tokensEarned: number;
  winRate: number;
}

interface UserDocument {
  stats: UserStats;
}

export async function GET(
  request: NextRequest,
  context: any // Override type check
) {
  try {
    const { wallet } = context.params as { wallet: string } // Force cast

    await dbConnect()
    
    const user = (await User.findOne({ walletAddress: wallet })
      .select('stats')
      .lean()
      .exec()) as UserDocument | null

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json(user.stats, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
      },
    })
  } catch (error) {
    console.error('Failed to fetch user stats:', error)
    return NextResponse.json({ error: 'Failed to fetch user stats' }, { status: 500 })
  }
} 