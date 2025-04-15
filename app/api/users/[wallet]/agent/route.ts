import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import dbConnect from '@/lib/mongodb';
import Agent from '@/models/agent';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

export const revalidate = 60; // Revalidate every minute

type RouteParams = {
  wallet: string;
};

type RouteContext = {
  params: Promise<RouteParams>;
};

export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  try {
    await dbConnect();
    
    const params = await context.params;
    const wallet = params.wallet;
    const agent = await Agent.findOne({ owner: wallet })
      .select('name owner wins losses draws points')
      .lean()
      .exec();

    if (!agent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
    }

    // Cache the response
    const headersList = headers();
    return NextResponse.json(agent, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
      },
    });
  } catch (error) {
    console.error('Failed to fetch agent:', error);
    return NextResponse.json({ error: 'Failed to fetch agent' }, { status: 500 });
  }
} 