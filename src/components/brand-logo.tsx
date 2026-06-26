import { BriefcaseBusiness } from "lucide-react";

import { cn } from "@/lib/utils";

export function BrandLogo({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2 font-semibold text-foreground", className)}>
      <span className="grid size-8 place-items-center rounded-[8px] bg-primary text-primary-foreground shadow-[0_8px_20px_rgba(15,107,255,0.22)]">
        <BriefcaseBusiness className="size-4" aria-hidden="true" />
      </span>
      <span>JobPilot</span>
    </div>
  );
}
