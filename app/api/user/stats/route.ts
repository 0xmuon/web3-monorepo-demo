import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import User from '@/models/User'
import { getWalletAddress } from '@/lib/auth'

export async function GET(request: Request) {
  try {
    const walletAddress = await getWalletAddress()
    if (!walletAddress) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await dbConnect()
    const user = await User.findOne({ walletAddress })
      .select('stats totalEarnings')
      .lean()

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error('Failed to fetch user stats:', error)
    return NextResponse.json({ error: 'Failed to fetch user stats' }, { status: 500 })
  }
} 