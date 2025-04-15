import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Agent from '@/models/agent'
import { headers } from 'next/headers'

export const revalidate = 60 // Revalidate every minute

export async function GET() {
  try {
    await dbConnect()
    
    // Get all agents and sort by points, wins, and losses
    const agents = await Agent.find({})
      .sort({ 
        points: -1,
        wins: -1,
        losses: 1
      })
      .select('name owner wins losses draws points')
      .lean()
      .exec()

    // Add rank to each agent
    const rankedAgents = agents.map((agent, index) => ({
      ...agent,
      rank: index + 1
    }))

    // Cache the response
    const headersList = headers()
    return NextResponse.json(rankedAgents, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
      },
    })
  } catch (error) {
    console.error('Failed to fetch leaderboard:', error)
    return NextResponse.json({ error: 'Failed to fetch leaderboard' }, { status: 500 })
  }
} 