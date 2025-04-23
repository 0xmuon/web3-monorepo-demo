"use client"

import { useState } from "react"
import { useWallet } from "@solana/wallet-adapter-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export type UserOnboardingModalProps = {
  isOpen: boolean;
  onClose: () => void;
}

export const UserOnboardingModal: React.FC<UserOnboardingModalProps> = ({ isOpen, onClose }) => {
  const { publicKey } = useWallet()
  const [username, setUsername] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!publicKey) return

    setLoading(true)
    setError(null)

    try {
      const response = await fetch("https://fightscript.onrender.com/api/users/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          walletAddress: publicKey.toString(),
          username,
          profileImage: "", // Default empty profile image
          bio: "", // Default empty bio
          role: "user",
          stats: {
            totalAgents: 0,
            competitionsWon: 0,
            tokensEarned: 0,
            winRate: 0,
          },
          totalEarnings: 0,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create user')
      }

      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Welcome to CO3PE!</DialogTitle>
          <DialogDescription>
            Please create your account to get started.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              required
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <Button type="submit" disabled={loading}>
            {loading ? "Creating..." : "Create Account"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
} 