"use client"

import { useState, useEffect } from "react"
import { Navbar } from "@/components/navbar"
import Footer from "@/components/footer"
import { useWallet } from "@solana/wallet-adapter-react"
import { toast } from "react-hot-toast"
import { LoadingState } from "@/components/ui/loading-state"

interface Agent {
  id: string;
  name: string;
  owner: string;
  wins: number;
  losses: number;
  draws: number;
  points: number;
  rank: number;
  walletAddress?: string;
}

export default function LeaderboardPage() {
  const { publicKey } = useWallet()
  const [agents, setAgents] = useState<Agent[]>([])
  const [loading, setLoading] = useState(true)

  const fetchLeaderboard = async () => {
    try {
      setLoading(true)
      const response = await fetch('https://fightscript.onrender.com/api/chess/leaderboard')
      if (!response.ok) {
        throw new Error('Failed to fetch leaderboard')
      }
      const data = await response.json()
      // Ensure all agents have required fields with default values
      const processedData = data.map((agent: Agent) => ({
        ...agent,
        name: agent.name || 'Anonymous',
        owner: agent.owner || 'Unknown',
        wins: agent.wins || 0,
        losses: agent.losses || 0,
        draws: agent.draws || 0,
        points: agent.points || 0
      }))
      setAgents(processedData)
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error)
      toast.error('Failed to fetch leaderboard')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLeaderboard()
  }, []) // Only fetch once when component mounts

  const formatWalletAddress = (address: string) => {
    if (!address || address === 'Unknown') return 'Unknown'
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <div className="container mx-auto py-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Global Leaderboard</h2>
              <button
                onClick={fetchLeaderboard}
                className="px-3 py-1 text-sm bg-blue-100 text-blue-600 rounded-md hover:bg-blue-200 transition-colors"
              >
                Refresh
              </button>
            </div>
            <div className="overflow-x-auto">
              {loading ? (
                <div className="flex justify-center items-center py-8">
                  <LoadingState />
                </div>
              ) : agents.length > 0 ? (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Rank</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Agent</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Owner</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Points</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Wins</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Draws</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Losses</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {agents.map((agent, index) => (
                      <tr 
                        key={agent.id} 
                        className={publicKey && agent.owner === publicKey.toString() ? 'bg-blue-50' : ''}
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-black">{index + 1}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                          {agent.name}
                          {publicKey && agent.owner === publicKey.toString() && (
                            <span className="ml-2 px-2 py-0.5 text-xs bg-blue-100 text-blue-600 rounded-full">You</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-black">
                          {formatWalletAddress(agent.owner)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-black">{agent.points}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">{agent.wins}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-yellow-600 font-medium">{agent.draws}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-medium">{agent.losses}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No agents found in the leaderboard
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
} 