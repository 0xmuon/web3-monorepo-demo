import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { PublicKey } from '@solana/web3.js'
import { User } from '@/types/user'
import dbConnect from './mongodb'
import UserModel from '@/models/User'

export async function getWalletFromCookie(): Promise<string | null> {
  try {
    const cookieStore = await cookies()
    const wallet = cookieStore.get('wallet')?.value

    if (!wallet) return null

    return wallet
  } catch (error) {
    console.error('Error getting wallet from cookie:', error)
    return null
  }
}

export async function clearWalletCookie() {
  try {
    const response = NextResponse.json({ success: true })
    response.cookies.delete('wallet')
    return response
  } catch (error) {
    console.error('Error clearing wallet cookie:', error)
    return NextResponse.json({ error: 'Failed to clear cookie' }, { status: 500 })
  }
}

export async function getUser(): Promise<User | null> {
  const walletAddress = await getWalletFromCookie()
  if (!walletAddress) return null

  try {
    const user = await UserModel.findOne({ walletAddress })
    return user
  } catch (error) {
    console.error('Error getting user:', error)
    return null
  }
}

export async function createUserIfNotExists(walletAddress: string): Promise<User> {
  await dbConnect()
  
  let user = await UserModel.findOne({ walletAddress })
  if (!user) {
    user = await UserModel.create({
      walletAddress,
      stats: {
        totalAgents: 0,
        competitionsWon: 0,
        tokensEarned: 0,
        winRate: 0
      }
    })
  }
  
  return user
} 