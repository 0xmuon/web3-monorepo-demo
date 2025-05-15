"use client"

import { useEffect, useState } from "react"
import { useWallet } from "@solana/wallet-adapter-react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Bot, Trophy, Coins, History } from "lucide-react"
import type { Agent } from "@/types/dashboard"
import type { Activity } from "@/types/dashboard"
import { AgentsList } from "@/app/components/agents-list"
import { ActivityFeed } from "@/app/components/activity-feed"
import { LoadingState } from "@/app/components/ui/loading-state"
import { Navbar } from "@/components/navbar"
import { fetchUserStats, fetchUser } from "../lib/api"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { UserOnboardingModal } from "@/app/components/user-onboarding-modal"
import Footer from "@/components/footer"

interface UserStats {
  username: string;
  walletAddress: string;
  profileImage: string;
  bio: string;
  stats: {
    totalAgents: number;
    competitionsWon: number;
    tokensEarned: number;
    winRate: number;
    totalGames: number;
  };
  totalEarnings: number;
  agents: Agent[];
  activities: Activity[];
}

export default function DashboardPage() {
  const { publicKey } = useWallet()
  const [userStats, setUserStats] = useState<UserStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [agent, setAgent] = useState<Agent | null>(null)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [isNewUser, setIsNewUser] = useState(false)

  useEffect(() => {
    async function checkUser() {
      if (!publicKey) return;

      try {
        const walletAddress = publicKey.toString();
        console.log("Checking user with wallet:", walletAddress);

        const userData = await fetchUser(walletAddress);
        console.log("User data:", userData);

        if (!userData) {
          setIsNewUser(true);
          setShowOnboarding(true);
          return;
        }

        // Fetch user stats after confirming user exists
        const statsData = await fetchUserStats(walletAddress);
        console.log("User stats:", statsData);

        setUserStats({
          ...userData,
          stats: statsData || {
            totalAgents: 0,
            competitionsWon: 0,
            tokensEarned: 0,
            winRate: 0,
            totalGames: 0
          }
        });
      } catch (error) {
        console.error("Error checking user:", error);
        if (error instanceof Error && error.message.includes('404')) {
          setIsNewUser(true);
          setShowOnboarding(true);
        } else {
          setError(error instanceof Error ? error.message : 'Failed to load user data');
        }
      } finally {
        setLoading(false);
      }
    }

    checkUser();
  }, [publicKey]);

  useEffect(() => {
    const fetchAgentStats = async () => {
      if (!publicKey) return;

      try {
        const response = await fetch(`/api/users/${publicKey.toString()}`);
        if (!response.ok) throw new Error('Failed to fetch agent stats');
        const data = await response.json();

        if (data.agent) {
          setAgent({
            ...data.agent,
            name: data.agent.name || 'Unnamed Agent',
            wins: data.agent.wins || 0,
            losses: data.agent.losses || 0,
            draws: data.agent.draws || 0,
            points: data.agent.points || 0,
            rank: data.agent.rank || 0
          });
        }
      } catch (error) {
        console.error('Error fetching agent stats:', error);
      }
    };

    if (userStats) {
      fetchAgentStats();
      const interval = setInterval(fetchAgentStats, 5000);
      return () => clearInterval(interval);
    }
  }, [publicKey, userStats]);

  if (!publicKey) {
    return (
      <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">Please connect your wallet</h2>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return <LoadingState />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-red-600">{error}</h2>
            <p className="mt-4 text-gray-600">Please try refreshing the page or connecting your wallet again.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Background gradients */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/90 to-background" />
        <div className="absolute right-0 top-0 h-[500px] w-[500px] bg-blue-500/10 blur-[100px]" />
        <div className="absolute bottom-0 left-0 h-[500px] w-[500px] bg-purple-500/10 blur-[100px]" />
      </div>
      <div className="relative z-10">
        <div className="max-w-auto mx-auto">
          <Navbar />
          <div className="container mx-auto px-4 py-8">
            <div className="flex items-center space-x-4 mb-8">
              <div className="w-16 h-16 rounded-full bg-blue-500 flex items-center justify-center text-white text-2xl font-bold">
                {userStats?.username ? userStats.username.charAt(0).toUpperCase() : '?'}
              </div>
              <div>
                <h1 className="text-3xl font-bold">{userStats?.username || 'Anonymous'}</h1>
                <p className="text-gray-600">{userStats?.walletAddress || 'No wallet connected'}</p>
                {userStats?.bio && (
                  <p className="text-gray-500 mt-2">{userStats.bio}</p>
                )}
              </div>
            </div>

            <Tabs defaultValue="overview" className="space-y-6">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="agents">My Agents</TabsTrigger>
                <TabsTrigger value="activities">Activities</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Total Agents</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{userStats?.stats?.totalAgents ?? 0}</div>
                      <Bot className="h-4 w-4 text-muted-foreground" />
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Competitions Won</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{userStats?.stats?.competitionsWon ?? 0}</div>
                      <Trophy className="h-4 w-4 text-muted-foreground" />
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Tokens Earned</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{userStats?.stats?.tokensEarned ?? 0}</div>
                      <Coins className="h-4 w-4 text-muted-foreground" />
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Win Rate</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{userStats?.stats?.winRate ?? 0}%</div>
                      <History className="h-4 w-4 text-muted-foreground" />
                    </CardContent>
                  </Card>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Recent Activities</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ActivityFeed activities={userStats?.activities || []} />
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Top Performing Agents</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <AgentsList
                        agents={userStats?.agents
                          ? [...userStats.agents].sort((a, b) => (b.matchesWon || 0) - (a.matchesWon || 0)).slice(0, 3)
                          : []}
                      />
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="agents">
                <Card>
                  <CardHeader>
                    <CardTitle>Your Agent Stats</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {!publicKey ? (
                      <p className="text-center">Please connect your wallet to view your stats</p>
                    ) : loading ? (
                      <p className="text-center">Loading...</p>
                    ) : !agent ? (
                      <p className="text-center">No agent found. Upload an agent to start competing!</p>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead className="text-right">Rank</TableHead>
                            <TableHead className="text-right">Points</TableHead>
                            <TableHead className="text-right">Wins</TableHead>
                            <TableHead className="text-right">Draws</TableHead>
                            <TableHead className="text-right">Losses</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          <TableRow>
                            <TableCell>{agent.name}</TableCell>
                            <TableCell className="text-right">#{agent.rank || '-'}</TableCell>
                            <TableCell className="text-right font-bold text-blue-600">{agent.points || 0}</TableCell>
                            <TableCell className="text-right text-green-600">{agent.wins || 0}</TableCell>
                            <TableCell className="text-right text-yellow-600">{agent.draws || 0}</TableCell>
                            <TableCell className="text-right text-red-600">{agent.losses || 0}</TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="activities">
                <ActivityFeed activities={userStats?.activities || []} />
              </TabsContent>
            </Tabs>
          </div>
        </div>
        {showOnboarding && isNewUser && (
          <UserOnboardingModal
            isOpen={showOnboarding && isNewUser}
            onClose={() => setShowOnboarding(false)}
          />
        )}
        <Footer />
      </div>
    </div>
  );
}