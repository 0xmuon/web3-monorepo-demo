"use client"

import { useEffect } from "react"
import { useWallet } from "@solana/wallet-adapter-react"

export function AppWalletProvider({ children }: { children: React.ReactNode }) {
  const { publicKey } = useWallet()

  useEffect(() => {
    async function updateWalletCookie() {
      if (publicKey) {
        // Set wallet cookie when connected
        await fetch('/api/auth', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ wallet: publicKey.toString() })
        })
      }
    }
    updateWalletCookie()
  }, [publicKey])

  return <>{children}</>
} 