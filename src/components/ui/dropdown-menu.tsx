import * as React from "react";
import { MoreHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type DropdownMenuProps = React.HTMLAttributes<HTMLDetailsElement> & {
  label?: string;
};

export function DropdownMenu({
  label = "更多操作",
  className,
  children,
  ...props
}: DropdownMenuProps) {
  return (
    <details className={cn("group relative inline-block", className)} {...props}>
      <summary className="list-none">
        <Button variant="ghost" size="icon" aria-label={label}>
          <MoreHorizontal />
        </Button>
      </summary>
      <div className="absolute right-0 z-20 mt-2 min-w-32 rounded-[8px] border border-border bg-card p-1 shadow-[var(--shadow-soft)]">
        {children}
      </div>
    </details>
  );
}

export function DropdownMenuItem({
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      className={cn(
        "flex h-8 w-full items-center rounded-md px-3 text-left text-sm text-foreground transition hover:bg-muted",
        className,
      )}
      {...props}
    />
  );
}
