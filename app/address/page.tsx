"use client"

import { useConnection, useWallet } from "@solana/wallet-adapter-react"
import { LAMPORTS_PER_SOL } from "@solana/web3.js"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"

export default function Address() {
  const { connection } = useConnection()
  const { publicKey } = useWallet()
  const [balance, setBalance] = useState<number>(0)
  const [isAirdropping, setIsAirdropping] = useState(false)

  const getAirdropOnClick = async () => {
    try {
      if (!publicKey) {
        throw new Error("Wallet is not Connected")
      }
      setIsAirdropping(true)
      const [latestBlockhash, signature] = await Promise.all([
        connection.getLatestBlockhash(),
        connection.requestAirdrop(publicKey, 1 * LAMPORTS_PER_SOL),
      ])
      const sigResult = await connection.confirmTransaction(
        { signature, ...latestBlockhash },
        "confirmed"
      )
      if (sigResult) {
        alert("Airdrop was confirmed!")
        // Refresh balance
        const newBalance = await connection.getBalance(publicKey)
        setBalance(newBalance / LAMPORTS_PER_SOL)
      }
    } catch (err) {
      alert("You are Rate limited for Airdrop")
    } finally {
      setIsAirdropping(false)
    }
  }

  useEffect(() => {
    let timeoutId: NodeJS.Timeout

    const getBalanceEvery10Seconds = async () => {
      if (publicKey) {
        try {
          const newBalance = await connection.getBalance(publicKey)
          setBalance(newBalance / LAMPORTS_PER_SOL)
        } catch (error) {
          console.error("Error fetching balance:", error)
        }
        timeoutId = setTimeout(getBalanceEvery10Seconds, 10000)
      }
    }

    getBalanceEvery10Seconds()

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
    }
  }, [publicKey, connection])

  return (
    <main className="flex min-h-screen flex-col items-center justify-evenly p-24">
      {publicKey ? (
        <div className="flex flex-col gap-4">
          <h1 className="text-xl font-bold">Your Public key is: {publicKey?.toString()}</h1>
          <h2 className="text-lg">Your Balance is: {balance} SOL</h2>
          <div>
            <Button
              onClick={getAirdropOnClick}
              disabled={isAirdropping}
              className="w-full"
            >
              {isAirdropping ? "Airdropping..." : "Get Airdrop"}
            </Button>
          </div>
        </div>
      ) : (
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Wallet is not connected</h1>
          <p className="text-muted-foreground">
            Connect your wallet using the button in the navbar to view your balance and get airdrops.
          </p>
        </div>
      )}
    </main>
  )
} 