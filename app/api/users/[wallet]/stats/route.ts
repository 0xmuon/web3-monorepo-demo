import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export async function GET(
  request: Request,
  context: { params: { wallet: string } }
) {
  try {
    // Await the entire params object first
    const params = await Promise.resolve(context.params);
    const wallet = params.wallet;
    
    console.log('Next.js API Route: Fetching stats for wallet:', wallet);
    console.log('Backend URL:', BACKEND_URL);

    // Forward the request to the backend using query parameter format
    const response = await fetch(`${BACKEND_URL}/stats?wallet=${wallet}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log('Backend response status:', response.status);

    if (!response.ok) {
      const error = await response.json();
      console.error('Backend error:', error);
      return NextResponse.json(
        { error: error.error || 'Failed to fetch user stats' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in Next.js API route:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 