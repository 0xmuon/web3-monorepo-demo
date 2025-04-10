"use client"

import { createContext, useContext, useEffect, useState } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import type { User } from '@/types/user'

interface UserContextType {
  user: User | null
  loading: boolean
  refreshUser: () => Promise<void>
}

const UserContext = createContext<UserContextType>({
  user: null,
  loading: true,
  refreshUser: async () => {},
})

export function UserProvider({ children }: { children: React.ReactNode }) {
  const { publicKey } = useWallet()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchUser = async (walletAddress: string) => {
    try {
      const res = await fetch('/api/user/stats', {
        headers: {
          'x-wallet-address': walletAddress
        }
      })
      if (res.ok) {
        const userData = await res.json()
        setUser(userData)
      }
    } catch (error) {
      console.error('Error fetching user:', error)
    } finally {
      setLoading(false)
    }
  }

  const refreshUser = async () => {
    if (publicKey) {
      await fetchUser(publicKey.toString())
    }
  }

  useEffect(() => {
    if (publicKey) {
      fetchUser(publicKey.toString())
    } else {
      setUser(null)
      setLoading(false)
    }
  }, [publicKey])

  return (
    <UserContext.Provider value={{ user, loading, refreshUser }}>
      {children}
    </UserContext.Provider>
  )
}

export const useUser = () => useContext(UserContext) 