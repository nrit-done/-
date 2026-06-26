import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex w-fit items-center gap-1 rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset",
  {
    variants: {
      tone: {
        default: "bg-muted text-foreground ring-border",
        blue: "bg-info-soft text-info ring-blue-100",
        green: "bg-success-soft text-success ring-green-100",
        orange: "bg-warning-soft text-[#b45309] ring-orange-100",
        red: "bg-danger-soft text-danger ring-red-100",
        gray: "bg-slate-100 text-slate-600 ring-slate-200",
      },
    },
    defaultVariants: {
      tone: "default",
    },
  },
);

export type BadgeProps = React.HTMLAttributes<HTMLSpanElement> &
  VariantProps<typeof badgeVariants>;

export function Badge({ className, tone, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ tone, className }))} {...props} />;
}
