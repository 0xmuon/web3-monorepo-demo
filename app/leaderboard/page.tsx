"use client"

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Navbar } from "@/components/navbar"
import Footer from "@/components/footer"

interface Agent {
  id: string;
  name: string;
  owner: string;
  wins: number;
  losses: number;
  draws: number;
  points: number;
  rank: number;
}

export default function LeaderboardPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await fetch('/api/competitions/leaderboard');
        if (!response.ok) throw new Error('Failed to fetch leaderboard');
        const data = await response.json();
        // Ensure all agents have a name, defaulting to 'Anonymous' if missing
        const processedData = data.map((agent: Agent) => ({
          ...agent,
          name: agent.name || 'Anonymous'
        }));
        setAgents(processedData);
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
    const interval = setInterval(fetchLeaderboard, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <div className="container mx-auto py-8">
          <Card>
            <CardHeader>
              <CardTitle>Global Leaderboard</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Rank</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Owner</TableHead>
                    <TableHead className="text-right">Points</TableHead>
                    <TableHead className="text-right">Wins</TableHead>
                    <TableHead className="text-right">Draws</TableHead>
                    <TableHead className="text-right">Losses</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center">Loading...</TableCell>
                    </TableRow>
                  ) : agents.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center">No agents found</TableCell>
                    </TableRow>
                  ) : (
                    agents.map((agent) => (
                      <TableRow key={agent.id}>
                        <TableCell>#{agent.rank}</TableCell>
                        <TableCell>{agent.name}</TableCell>
                        <TableCell>{agent.owner}</TableCell>
                        <TableCell className="text-right font-bold text-blue-600">{agent.points || 0}</TableCell>
                        <TableCell className="text-right text-green-600">{agent.wins || 0}</TableCell>
                        <TableCell className="text-right text-yellow-600">{agent.draws || 0}</TableCell>
                        <TableCell className="text-right text-red-600">{agent.losses || 0}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  )
} 