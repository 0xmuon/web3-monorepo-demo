import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import dbConnect from '@/lib/mongodb'
import Competition from '@/models/Competition'
import { getWalletAddress } from '@/lib/auth'

export const revalidate = 300 // Revalidate every 5 minutes

export async function GET() {
  try {
    await dbConnect()
    const competitions = await Competition.find({})
      .populate('participants', 'username walletAddress')
      .populate('winner', 'username walletAddress')
      .populate('createdBy', 'username walletAddress')
      .populate({
        path: 'submissions',
        populate: {
          path: 'agent',
          select: 'name category winRate'
        }
      })
      .lean()
      .exec()

    // Cache the response
    const headersList = headers()
    return NextResponse.json(competitions, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    })
  } catch (error) {
    console.error('Failed to fetch competitions:', error)
    return NextResponse.json({ error: 'Failed to fetch competitions' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const walletAddress = await getWalletAddress()
    if (!walletAddress) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    await dbConnect()
    
    const competition = await Competition.create({
      ...body,
      createdBy: walletAddress
    })

    return NextResponse.json(competition)
  } catch (error) {
    console.error('Failed to create competition:', error)
    return NextResponse.json({ error: 'Failed to create competition' }, { status: 500 })
  }
} 