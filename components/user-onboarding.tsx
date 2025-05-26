"use client"

import { useState } from "react"
import { useWallet } from "@solana/wallet-adapter-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { LoadingState } from "@/components/ui/loading-state"
import { proxyRequest } from "@/lib/api"

export function UserOnboarding() {
  const { publicKey } = useWallet()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    username: "",
    bio: "",
    githubHandle: "",
    discordHandle: "",
    expertise: "beginner",
    stats: {
      totalAgents: 0,
      competitionsWon: 0,
      tokensEarned: 0,
      winRate: 0
    },
    totalEarnings: 0
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!publicKey) {
      setError("Wallet not connected")
      return
    }

    setLoading(true)
    setError(null)

    try {
      const requestData = {
        ...formData,
        walletAddress: publicKey.toString()
      }
      console.log('Submitting user data:', requestData)

      const data = await proxyRequest('/users', {
        method: 'POST',
        body: JSON.stringify(requestData)
      })

      console.log('User created successfully:', data)
      window.location.href = '/'
    } catch (err) {
      console.error('Error creating user:', err)
      setError(err instanceof Error ? err.message : 'Failed to create user')
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <LoadingState />

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-card rounded-lg shadow-lg p-6">
        <h1 className="text-3xl font-bold text-center mb-8">Welcome to CO3PE!</h1>
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Username*</label>
            <Input
              value={formData.username}
              onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
              required
              placeholder="Choose a username"
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Bio</label>
            <Textarea
              value={formData.bio}
              onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
              placeholder="Tell us about yourself"
              className="h-24 w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">GitHub Handle</label>
            <Input
              value={formData.githubHandle}
              onChange={(e) => setFormData(prev => ({ ...prev, githubHandle: e.target.value }))}
              placeholder="Your GitHub username"
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Discord Handle</label>
            <Input
              value={formData.discordHandle}
              onChange={(e) => setFormData(prev => ({ ...prev, discordHandle: e.target.value }))}
              placeholder="Your Discord username"
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Experience Level</label>
            <select
              value={formData.expertise}
              onChange={(e) => setFormData(prev => ({ ...prev, expertise: e.target.value }))}
              className="w-full p-2 border rounded"
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="expert">Expert</option>
            </select>
          </div>

          <Button type="submit" className="w-full">
            Create Profile
          </Button>
        </form>
      </div>
    </div>
  )
} 