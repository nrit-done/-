import { Circle } from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { DashboardActivity } from "@/types/dashboard";

const activityToneClass = {
  blue: "text-primary",
  green: "text-success",
  orange: "text-warning",
  red: "text-danger",
};

export function RecentActivity({
  activities,
}: {
  activities: DashboardActivity[];
}) {
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between pb-2">
        <CardTitle>最近动态</CardTitle>
        <a href="#" className="text-sm font-medium text-primary hover:underline">
          查看更多
        </a>
      </CardHeader>
      <CardContent>
        <div className="divide-y divide-border">
          {activities.map((activity) => (
            <div
              key={activity.id}
              className="grid grid-cols-[auto_1fr_auto] items-center gap-3 py-3"
            >
              <Circle
                className={cn("size-3 fill-current", activityToneClass[activity.tone])}
                aria-hidden="true"
              />
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">
                  {activity.company} · {activity.title}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {activity.action}
                </p>
              </div>
              <time className="text-xs text-muted-foreground">{activity.time}</time>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
