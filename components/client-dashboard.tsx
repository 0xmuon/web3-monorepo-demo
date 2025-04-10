"use client"

import { useState, useEffect } from "react"
import { useWallet } from "@solana/wallet-adapter-react"
import { LoadingState } from "@/components/ui/loading-state"
import { ClientCompetitions } from "@/components/client-competitions"
import type { Agent, Activity, User } from "@/types/dashboard"
import { UserOnboarding } from "@/components/user-onboarding"
import { fetchUser } from "@/app/lib/api"

export function ClientDashboard() {
  const { publicKey } = useWallet()
  const [loading, setLoading] = useState(true)
  const [agents, setAgents] = useState<Agent[]>([])
  const [activities, setActivities] = useState<Activity[]>([])
  const [error, setError] = useState<string | null>(null)
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    async function checkUser() {
      if (!publicKey) {
        setLoading(false)
        return
      }

      try {
        const walletAddress = publicKey.toString()
        try {
          const userData = await fetchUser(walletAddress)
          setUser(userData)
        } catch (err) {
          // If the error is a 404, the user doesn't exist
          if (err instanceof Error && err.message.includes('404')) {
            setUser(null)
          } else {
            throw err
          }
        }
      } catch (err) {
        console.error('Error checking user:', err)
        setError(err instanceof Error ? err.message : 'Something went wrong')
      } finally {
        setLoading(false)
      }
    }

    checkUser()
  }, [publicKey])

  if (!publicKey) {
    return (
      <div className="text-center py-10">
        <h2 className="text-2xl font-bold">Please connect your wallet</h2>
      </div>
    )
  }

  if (loading) return <LoadingState />
  if (error) return <div className="text-red-500">{error}</div>

  // Show onboarding for new users
  if (!user) {
    return <UserOnboarding />
  }

  // Show dashboard for existing users
  return (
    <div className="space-y-8">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Stats cards */}
      </div>
      <div>
        <h2 className="text-2xl font-bold mb-4">Your Agents</h2>
        {agents.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {agents.map(agent => (
              <div key={agent._id} className="p-4 border rounded">
                <h3>{agent.name}</h3>
                <p>Win Rate: {agent.winRate}%</p>
              </div>
            ))}
          </div>
        ) : (
          <p>No agents found</p>
        )}
      </div>
      <div>
        <h2 className="text-2xl font-bold mb-4">Recent Activity</h2>
        {activities.length > 0 ? (
          <div className="space-y-4">
            {activities.map(activity => (
              <div key={activity._id} className="p-4 border rounded">
                <p>{activity.description}</p>
                <small>{new Date(activity.timestamp).toLocaleDateString()}</small>
              </div>
            ))}
          </div>
        ) : (
          <p>No recent activity</p>
        )}
      </div>
      <ClientCompetitions />
    </div>
  )
} 