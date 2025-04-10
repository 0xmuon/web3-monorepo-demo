import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST(request: Request) {
  try {
    const { wallet } = await request.json()
    
    if (!wallet) {
      return NextResponse.json({ error: 'No wallet provided' }, { status: 400 })
    }

    // Create response with cookie
    const response = NextResponse.json({ success: true })
    
    // Set the wallet cookie
    response.cookies.set('wallet', wallet, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/'
    })

    return response
  } catch (error) {
    console.error('Auth error:', error)
    return NextResponse.json({ error: 'Auth failed' }, { status: 500 })
  }
} 