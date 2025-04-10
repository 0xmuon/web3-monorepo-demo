import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

export async function POST(request: NextRequest) {
  try {
    console.log('Next.js API Route: Uploading agent file');
    console.log('Backend URL:', BACKEND_URL);

    // Get the form data from the request
    const formData = await request.formData();
    
    // Forward the request to the backend
    const response = await fetch(`${BACKEND_URL}/api/upload/agent`, {
      method: 'POST',
      body: formData,
    });

    console.log('Backend response status:', response.status);

    if (!response.ok) {
      const error = await response.json();
      console.error('Backend error:', error);
      return NextResponse.json(
        { error: error.error || 'Failed to upload agent' },
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