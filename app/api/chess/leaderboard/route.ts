import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = 'https://co3pe.onrender.com';

export const dynamic = 'force-dynamic'; // Disable static generation
export const revalidate = 0; // Disable cache

export async function GET(request: NextRequest) {
  try {
    console.log('Attempting to fetch leaderboard from:', `${BACKEND_URL}/api/chess/leaderboard`);
    
    const response = await fetch(`${BACKEND_URL}/api/chess/leaderboard`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store' // Disable cache at fetch level
    });

    console.log('Leaderboard response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Backend error response:', errorText);
      
      let errorJson;
      try {
        errorJson = JSON.parse(errorText);
      } catch (e) {
        console.error('Failed to parse error response as JSON:', e);
      }

      return NextResponse.json(
        { 
          error: errorJson?.error || 'Failed to fetch leaderboard',
          status: response.status,
          details: errorText
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('Successfully fetched leaderboard data');
    
    // Return with CORS headers
    return new NextResponse(JSON.stringify(data), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
      },
    });
  } catch (error) {
    console.error('Error in leaderboard API:', error);
    return NextResponse.json(
      { 
        error: 'Internal Server Error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 