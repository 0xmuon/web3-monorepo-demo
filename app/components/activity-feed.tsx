import { Activity } from "@/types/dashboard"
import { formatDistanceToNow } from "date-fns"

export function ActivityFeed({ activities }: { activities: Activity[] }) {
  if (!activities.length) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No activities yet. Start participating to see your activity!
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {activities.map((activity) => (
        <div key={activity._id} className="flex items-start gap-4">
          <div className="flex-1">
            <p className="text-sm">{activity.description}</p>
            <p className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
} 