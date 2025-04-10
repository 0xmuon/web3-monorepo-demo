"use client"

import { Agent } from "@/types/dashboard"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export function AgentsList({ agents, showActions = false }: { 
  agents: Agent[]
  showActions?: boolean 
}) {
  if (!agents.length) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No agents found. Create your first agent to get started!
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {agents.map((agent) => (
        <Card key={agent._id}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">{agent.name}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="secondary">{agent.category}</Badge>
                  <Badge variant={agent.status === 'active' ? 'success' : 'secondary'}>
                    {agent.status}
                  </Badge>
                </div>
                {agent.description && (
                  <p className="text-sm text-muted-foreground mt-2">{agent.description}</p>
                )}
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">{agent.winRate}%</div>
                <div className="text-sm text-muted-foreground">
                  {agent.matchesWon} / {agent.matchesPlayed} matches
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
} 