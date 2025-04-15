import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('Received match request:', body);
    
    if (!body.walletAddress) {
      return NextResponse.json({
        status: 'error',
        message: 'Missing wallet address'
      }, { status: 400 });
    }

    // Forward the request to the backend
    const response = await fetch(`${BACKEND_URL}/api/chess/match`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json({
        status: 'error',
        message: errorData.message || 'Failed to start match'
      }, { status: response.status });
    }

    const data = await response.json();
    console.log('Backend response:', data);

    // Format the response to match what the frontend expects
    const formattedResponse = {
      status: 'running',
      message: 'Match started successfully',
      matchId: data.matchId
    };

    return NextResponse.json(formattedResponse);

  } catch (error) {
    console.error('Error in start match API:', error);
    return NextResponse.json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Internal server error'
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get the match ID from the query parameters
    const url = new URL(request.url);
    const matchId = url.searchParams.get('matchId');

    if (!matchId) {
      return NextResponse.json({
        status: 'error',
        message: 'No match ID provided'
      }, { status: 400 });
    }

    // Call the backend API with the match ID
    const endpoint = `${BACKEND_URL}/api/chess/match/${matchId}/status`;
    console.log(`Fetching match status from: ${endpoint}`);

    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json({
        status: 'error',
        message: errorData.message || 'Failed to fetch match status'
      }, { status: response.status });
    }

    const data = await response.json();
    console.log('Backend match status:', data);

    // Format the response to match what the frontend expects
    const formattedResponse = {
      status: data.status || 'running',
      message: data.message || 'Match in progress...',
      result: data.winner ? {
        winner: data.winner === 'user' ? 1 : data.winner === 'bot' ? 2 : 0,
        reason: data.reason || '',
        moves: data.moves || []
      } : undefined,
      engineOutput: data.engineOutput || ''
    };

    return NextResponse.json(formattedResponse);

  } catch (error) {
    console.error('Error in match status API:', error);
    return NextResponse.json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Internal server error'
    }, { status: 500 });
  }
} 