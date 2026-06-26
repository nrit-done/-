"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

export type TabItem = {
  value: string;
  label: string;
  content: React.ReactNode;
};

export type TabsProps = React.HTMLAttributes<HTMLDivElement> & {
  items: TabItem[];
  defaultValue?: string;
};

export function Tabs({ items, defaultValue, className, ...props }: TabsProps) {
  const [active, setActive] = React.useState(defaultValue ?? items[0]?.value);
  const activeItem = items.find((item) => item.value === active) ?? items[0];

  return (
    <div className={cn("w-full", className)} {...props}>
      <div className="flex gap-1 border-b border-border" role="tablist">
        {items.map((item) => (
          <button
            key={item.value}
            type="button"
            role="tab"
            aria-selected={item.value === active}
            className={cn(
              "relative h-10 px-4 text-sm font-medium text-muted-foreground transition hover:text-foreground",
              item.value === active &&
                "text-primary after:absolute after:right-3 after:bottom-[-1px] after:left-3 after:h-0.5 after:rounded-full after:bg-primary",
            )}
            onClick={() => setActive(item.value)}
          >
            {item.label}
          </button>
        ))}
      </div>
      <div className="pt-4" role="tabpanel">
        {activeItem?.content}
      </div>
    </div>
  );
}
