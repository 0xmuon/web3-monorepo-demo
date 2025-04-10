import { Activity } from "@/types/dashboard"
import { formatDistanceToNow } from "date-fns"

export function ActivityFeed({ activities }: { activities: Activity[] }) {
  return (
    <div className="space-y-4">
      {activities.map((activity) => (
        <div key={activity._id} className="flex items-center">
          <div className="ml-4 space-y-1">
            <p className="text-sm font-medium">{activity.description}</p>
            <p className="text-sm text-muted-foreground">
              {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
} 