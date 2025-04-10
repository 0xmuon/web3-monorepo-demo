import { Agent } from "@/types/dashboard"
import { Trophy } from "lucide-react"

export function AgentsList({ 
  agents,
  showActions = false 
}: { 
  agents: Agent[]
  showActions?: boolean 
}) {
  return (
    <div className="space-y-4">
      {agents.map((agent) => (
        <div key={agent._id} className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium">{agent.name}</p>
            <p className="text-xs text-muted-foreground">
              {agent.category} - Win Rate: {agent.winRate}%
            </p>
          </div>
          <Trophy className="h-4 w-4 text-yellow-500" />
        </div>
      ))}
    </div>
  )
} 