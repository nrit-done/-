import * as React from "react";
import { BriefcaseBusiness } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type EmptyStateProps = React.HTMLAttributes<HTMLDivElement> & {
  title: string;
  description: string;
  actionLabel?: string;
};

export function EmptyState({
  title,
  description,
  actionLabel,
  className,
  ...props
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-[8px] border border-dashed border-border bg-muted/50 px-6 py-10 text-center",
        className,
      )}
      {...props}
    >
      <div className="grid size-11 place-items-center rounded-full bg-info-soft text-info">
        <BriefcaseBusiness className="size-5" aria-hidden="true" />
      </div>
      <h3 className="mt-4 text-sm font-semibold">{title}</h3>
      <p className="mt-1 max-w-sm text-sm leading-6 text-muted-foreground">
        {description}
      </p>
      {actionLabel ? (
        <Button className="mt-5" size="sm">
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}
