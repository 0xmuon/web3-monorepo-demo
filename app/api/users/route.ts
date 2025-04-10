import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NODE_ENV === 'production'
  ? 'https://co3pe.onrender.com'
  : 'http://localhost:5000';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const wallet = searchParams.get('wallet');
    
    console.log('Next.js API Route: Fetching user with wallet:', wallet);
    console.log('Backend URL:', BACKEND_URL);
    
    const response = await fetch(`${BACKEND_URL}/api/users${wallet ? `?wallet=${wallet}` : ''}`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    console.log('Backend response status:', response.status);
    
    if (!response.ok) {
      const error = await response.json();
      console.error('Backend error:', error);
      return NextResponse.json(
        { error: error.error || 'Failed to fetch user data' },
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('Proxying POST request to Express server:', `${BACKEND_URL}/api/users`);
    
    const response = await fetch(`${BACKEND_URL}/api/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      console.error('Error response from Express server:', data);
      return NextResponse.json(data, { status: response.status });
    }
    
    console.log('Successfully proxied request to Express server');
    return NextResponse.json(data);
  } catch (error) {
    console.error('Failed to proxy request to Express server:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to create user',
        details: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
} 