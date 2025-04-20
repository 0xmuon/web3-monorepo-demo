import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import User from '@/models/User'

export const revalidate = 60 // Revalidate every minute

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ wallet: string }> }
) {
  try {
    await dbConnect()
    
    const { wallet } = await context.params
    const user = await User.findOne({ walletAddress: wallet })
      .select('username walletAddress points')
      .lean()
      .exec()

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json(user, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
      },
    })
  } catch (error) {
    console.error('Failed to fetch user:', error)
    return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 })
  }
} 