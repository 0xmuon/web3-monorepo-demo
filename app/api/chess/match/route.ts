import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('Received match request:', body);
    
    // Forward the request to the backend
    const response = await fetch(`${BACKEND_URL}/api/chess/match`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'http://localhost:3000',
      },
      body: JSON.stringify(body),
    });
    
    // Handle non-JSON responses
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      console.error('Received non-JSON response:', await response.text());
      return NextResponse.json(
        { error: 'Received non-JSON response from backend' },
        { status: 500 }
      );
    }
    
    const data = await response.json();
    console.log('Backend response:', data);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get the latest match status from the backend
    const response = await fetch(`${BACKEND_URL}/api/chess/match/status`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'http://localhost:3000',
      },
    });
    
    // Handle non-JSON responses
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      console.error('Received non-JSON response:', await response.text());
      return NextResponse.json(
        { error: 'Received non-JSON response from backend' },
        { status: 500 }
      );
    }
    
    const data = await response.json();
    console.log('Backend match status:', data);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 