import { headers } from 'next/headers'
import { User } from '@/types/user'
import dbConnect from './mongodb'
import UserModel from '@/models/User'
import { fetchUser } from '@/app/lib/api'

export async function getWalletAddress(): Promise<string | null> {
  const headersList = await headers()
  const walletAddress = headersList.get('x-wallet-address')
  return walletAddress
}

export async function getUser(): Promise<any | null> {
  const walletAddress = await getWalletAddress()
  if (!walletAddress) return null

  try {
    return await fetchUser(walletAddress)
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