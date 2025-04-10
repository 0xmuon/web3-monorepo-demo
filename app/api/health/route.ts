import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Use the hardcoded API URL for production
    const apiUrl = process.env.NODE_ENV === 'production'
      ? 'https://co3pe.onrender.com/api/health'
      : 'http://localhost:5000/api/health';

    console.log(`Proxying GET /api/health to ${apiUrl}`);

    const response = await fetch(apiUrl, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Error from Express server:', data);
      return NextResponse.json(
        { error: data.error || 'Failed to check backend health' },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error proxying /api/health:', error);
    return NextResponse.json(
      { error: 'Failed to connect to backend' },
      { status: 500 }
    );
  }
} 