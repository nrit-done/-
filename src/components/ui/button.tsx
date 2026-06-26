import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-[8px] text-sm font-medium outline-none transition-all focus-visible:ring-3 focus-visible:ring-ring/60 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-[0_8px_20px_rgba(15,107,255,0.22)] hover:bg-[#075ce5]",
        secondary:
          "bg-muted text-foreground hover:bg-[#eaf0f8]",
        outline:
          "border border-border bg-card text-foreground hover:border-[#c9d4e5] hover:bg-muted",
        ghost:
          "text-muted-foreground hover:bg-muted hover:text-foreground",
        destructive:
          "bg-danger text-white shadow-[0_8px_20px_rgba(239,68,68,0.18)] hover:bg-[#dc2626]",
        success:
          "bg-success text-white shadow-[0_8px_20px_rgba(22,163,74,0.18)] hover:bg-[#15803d]",
      },
      size: {
        sm: "h-8 px-3 text-xs",
        md: "h-9 px-4",
        lg: "h-11 px-5",
        icon: "size-9 p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  },
);

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
    loading?: boolean;
  };

export function Button({
  className,
  variant,
  size,
  asChild = false,
  loading = false,
  children,
  disabled,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : "button";
  const isDisabled = disabled || loading;

  const content = (
    <>
      {loading ? <Loader2 className="animate-spin" aria-hidden="true" /> : null}
      {children}
    </>
  );

  return (
    <Comp
      aria-disabled={asChild && isDisabled ? true : undefined}
      className={cn(buttonVariants({ variant, size, className }))}
      disabled={asChild ? undefined : isDisabled}
      {...props}
    >
      {asChild ? children : content}
    </Comp>
  );
}

export { buttonVariants };
