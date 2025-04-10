"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Trophy, ArrowUpDown } from "lucide-react"
import React from "react"

interface LeaderboardEntry {
  rank: number
  name: string
  score: number
  wins: number
  losses: number
  winRate: number
}

// Define the props for the LeaderboardEntry component
interface LeaderboardEntryProps {
  entry: LeaderboardEntry; // Entry should be of type LeaderboardEntry
}

// Update the LeaderboardEntry component to accept props
const LeaderboardEntry: React.FC<LeaderboardEntryProps> = React.memo(({ entry }) => (
  <TableRow key={entry.rank} className={entry.rank <= 3 ? "bg-accent/50" : ""}>
    <TableCell className="font-medium">
      {entry.rank <= 3 ? (
        <span className="flex items-center gap-2">
          {entry.rank}
          <Trophy className={`h-4 w-4 ${
            entry.rank === 1 ? "text-yellow-500" :
            entry.rank === 2 ? "text-gray-400" :
            "text-amber-600"
          }`} />
        </span>
      ) : (
        entry.rank
      )}
    </TableCell>
    <TableCell>{entry.name}</TableCell>
    <TableCell>{entry.score}</TableCell>
    <TableCell>{entry.wins}</TableCell>
    <TableCell>{entry.losses}</TableCell>
    <TableCell>{entry.winRate}%</TableCell>
  </TableRow>
));

const LeaderboardComponent = () => {
  const [sortConfig, setSortConfig] = useState<{
    key: keyof LeaderboardEntry
    direction: 'asc' | 'desc'
  }>({ key: 'rank', direction: 'asc' })
  
  const [searchQuery, setSearchQuery] = useState("")

  // Sample data - replace with actual data from your backend
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([
    { rank: 1, name: "AlphaBot", score: 2800, wins: 150, losses: 20, winRate: 88.2 },
    { rank: 2, name: "QuantumAI", score: 2750, wins: 140, losses: 25, winRate: 84.8 },
    { rank: 3, name: "NeuralMaster", score: 2700, wins: 130, losses: 30, winRate: 81.3 },
    { rank: 4, name: "DeepMind Jr", score: 2650, wins: 120, losses: 35, winRate: 77.4 },
    { rank: 5, name: "AIChampion", score: 2600, wins: 110, losses: 40, winRate: 73.3 },
  ])

  const handleSort = (key: keyof LeaderboardEntry) => {
    const direction = sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc'
    setSortConfig({ key, direction })
    
    const sortedData = [...leaderboardData].sort((a, b) => {
      if (direction === 'asc') {
        return a[key] > b[key] ? 1 : -1
      }
      return a[key] < b[key] ? 1 : -1
    })
    
    setLeaderboardData(sortedData)
  }

  const filteredData = leaderboardData.filter(entry =>
    entry.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Trophy className="h-8 w-8 text-yellow-500" />
          Leaderboard
        </h1>
        <div className="relative w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search players..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">
                <Button variant="ghost" size="sm" onClick={() => handleSort('rank')}>
                  Rank
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" size="sm" onClick={() => handleSort('name')}>
                  Name
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" size="sm" onClick={() => handleSort('score')}>
                  Score
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" size="sm" onClick={() => handleSort('wins')}>
                  Wins
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" size="sm" onClick={() => handleSort('losses')}>
                  Losses
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" size="sm" onClick={() => handleSort('winRate')}>
                  Win Rate
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.map((entry) => (
              <LeaderboardEntry key={entry.rank} entry={entry} />
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

LeaderboardComponent.displayName = 'Leaderboard'
export default LeaderboardComponent 