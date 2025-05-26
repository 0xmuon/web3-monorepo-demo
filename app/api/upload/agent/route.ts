import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = 'https://co3pe.onrender.com';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    console.log('Forwarding file upload to backend');
    
    const response = await fetch(`${BACKEND_URL}/api/upload/agent`, {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      const error = await response.json();
      console.error('Backend error:', error);
      return NextResponse.json(
        { error: error.error || 'Failed to upload file' },
        { status: response.status }
      );
    }
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in file upload API route:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 