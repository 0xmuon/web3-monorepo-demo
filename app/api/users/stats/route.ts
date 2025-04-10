import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NODE_ENV === 'production'
  ? 'https://co3pe.onrender.com'
  : 'http://localhost:5000';

export async function GET(request: NextRequest) {
  try {
    // Get the URL search params
    const { searchParams } = new URL(request.url);
    const wallet = searchParams.get('wallet');

    console.log('Next.js API Route: Fetching user stats with wallet:', wallet);
    console.log('Backend URL:', BACKEND_URL);

    if (!wallet) {
      return NextResponse.json(
        { error: 'Wallet address is required' },
        { status: 400 }
      );
    }

    // Forward the request to the backend using path parameter format
    const response = await fetch(`${BACKEND_URL}/api/users/${wallet}/stats`, {
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