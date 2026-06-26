import type { LucideIcon } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export type StatCardProps = {
  label: string;
  value: number;
  change: string;
  trend: string;
  tone: "success" | "danger";
  icon: LucideIcon;
};

export function StatCard({
  label,
  value,
  change,
  trend,
  tone,
  icon: Icon,
}: StatCardProps) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="relative p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm text-muted-foreground">{label}</p>
            <div className="mt-3 flex items-end gap-2">
              <strong className="text-3xl font-semibold tracking-tight">
                {value}
              </strong>
              <span
                className={cn(
                  "pb-1 text-xs font-semibold",
                  tone === "success" ? "text-success" : "text-danger",
                )}
              >
                {trend} {change}
              </span>
            </div>
          </div>
          <div className="grid size-9 shrink-0 place-items-center rounded-[8px] bg-info-soft text-primary">
            <Icon className="size-4" aria-hidden="true" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
