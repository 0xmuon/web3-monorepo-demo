"use client"
import { RefreshCcwIcon, MedalIcon, Trophy, TrophyIcon } from "lucide-react"
import { useState, useEffect } from "react"
import { Navbar } from "@/components/navbar"
import Footer from "@/components/footer"
import { useWallet } from "@solana/wallet-adapter-react"
import { toast } from "react-hot-toast"
import { LoadingState } from "@/components/ui/loading-state"
import { IntegerType } from "mongodb"

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
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/chess/leaderboard`)
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

  const getIcon = (index: IntegerType) => {
    switch (index) {
      case 1:
        return <MedalIcon className="text-yellow-500 ml-3"></MedalIcon>
      case 2:
        return <MedalIcon className="text-gray-700 ml-3"></MedalIcon>
      case 2:
        return <MedalIcon className="text-yellow-800 ml-3"></MedalIcon>
    }
  }
  type SortColumn = 'rank' | 'agent' | 'owner' | 'points' | 'wins' | 'draws' | 'losses';

const [sortColumn, setSortColumn] = useState<SortColumn>('rank');
const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

const sortedAgents = [...agents].sort((a, b) => {
  let aVal, bVal;

  switch (sortColumn) {
    case 'rank':
      aVal = agents.indexOf(a);
      bVal = agents.indexOf(b);
      break;
    case 'agent':
      aVal = a.name.toLowerCase();
      bVal = b.name.toLowerCase();
      break;
    case 'owner':
      aVal = a.owner.toLowerCase();
      bVal = b.owner.toLowerCase();
      break;
    case 'points':
      aVal = a.points;
      bVal = b.points;
      break;
    case 'wins':
      aVal = a.wins;
      bVal = b.wins;
      break;
    case 'draws':
      aVal = a.draws;
      bVal = b.draws;
      break;
    case 'losses':
      aVal = a.losses;
      bVal = b.losses;
      break;
    default:
      aVal = bVal = 0;
  }

  if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
  if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
  return 0;
});
const handleSort = (column: SortColumn) => {
  if (sortColumn === column) {
    setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
  } else {
    setSortColumn(column);
    setSortDirection('asc');
  }
};

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Background gradients */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/90 to-background" />
        <div className="absolute right-0 top-0 h-[500px] w-[500px] bg-blue-500/10 blur-[100px]" />
        <div className="absolute bottom-0 left-0 h-[500px] w-[500px] bg-purple-500/10 blur-[100px]" />
      </div>
      <div className="flex flex-col flex-grow relative z-10">
      <Navbar />
      <main className="flex-grow">
        <div className="container mx-auto py-8">
          <div className="bg-[#1E1F2F] border border-[#2E2F40] rounded-2xl shadow-lg p-6 flex flex-col transition duration-300">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="flex items-center text-2xl font-bold text-[#E0E0FF] mx-auto sm:mx-0 sm:text-left gap-2"><TrophyIcon></TrophyIcon>Global Leaderboard</h2>
              <button
                onClick={fetchLeaderboard}
                className="px-1 py-1 text-sm bg-blue-0 text-teal-600 rounded-md hover:bg-blue-100 transition-colors"
              >
                <RefreshCcwIcon></RefreshCcwIcon>
              </button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto rounded-xl bg-white">
              {loading ? (
                <div className="flex justify-center items-center py-8">
                  <LoadingState />
                </div>
              ) : agents.length > 0 ? (
                <table className="min-w-full divide-y divide-gray-200 rounded-xl overflow-hidden">
                  <thead className="bg-gray-50">
  <tr>
    {[
      { key: 'rank', label: 'Rank' },
      { key: 'agent', label: 'Agent' },
      { key: 'owner', label: 'Owner' },
      { key: 'points', label: 'Points' },
      { key: 'wins', label: 'Wins' },
      { key: 'draws', label: 'Draws' },
      { key: 'losses', label: 'Losses' }
    ].map(({ key, label }) => (
      <th
        key={key}
        onClick={() => handleSort(key as SortColumn)}
        className="px-6 py-3 text-center text-xs font-medium text-black uppercase tracking-wider cursor-pointer hover:underline"
      >
        {label}
        {sortColumn === key && (
          <span className="ml-1">{sortDirection === 'asc' ? '▲' : '▼'}</span>
        )}
      </th>
    ))}
  </tr>
</thead>

                  <tbody className="bg-white divide-y divide-gray-200">
                    {sortedAgents.map((agent, index) => (
                      <tr
                        key={agent.id}
                        className={publicKey && agent.owner === publicKey.toString() ? 'bg-blue-50' : ''}
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-black relative">
                          {index <= 2 && (
                            <div className="absolute left-2 top-1/2 transform -translate-y-1/2">
                              {getIcon(index + 1)}
                            </div>
                          )}
                          <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
                            {index + 1}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-black">
                          {agent.name}
                          {publicKey && agent.owner === publicKey.toString() && (
                            <span className="ml-2 px-2 py-0.5 text-xs text-center bg-blue-100 text-blue-600 rounded-full">You</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-center font-mono text-black">
                          {formatWalletAddress(agent.owner)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-center font-medium text-black">{agent.points}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-green-600 font-medium">{agent.wins}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-yellow-600 font-medium">{agent.draws}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-red-600 font-medium">{agent.losses}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="text-center py-8 text-gray-500">No agents found in the leaderboard</div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
      </div>
    </div>
  )
} 