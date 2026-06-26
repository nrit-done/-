import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type PaginationProps = React.HTMLAttributes<HTMLElement> & {
  page: number;
  totalPages: number;
  onPageChange?: (page: number) => void;
};

export function Pagination({
  page,
  totalPages,
  onPageChange,
  className,
  ...props
}: PaginationProps) {
  const safeTotalPages = Math.max(1, totalPages);
  const pages = Array.from({ length: safeTotalPages }, (_, index) => index + 1);

  return (
    <nav
      aria-label="分页"
      className={cn("flex items-center justify-end gap-1", className)}
      {...props}
    >
      <Button
        aria-label="上一页"
        disabled={page <= 1}
        size="icon"
        type="button"
        variant="outline"
        onClick={() => onPageChange?.(Math.max(1, page - 1))}
      >
        <ChevronLeft />
      </Button>
      {pages.map((item) => (
        <Button
          key={item}
          aria-current={item === page ? "page" : undefined}
          size="icon"
          type="button"
          variant={item === page ? "default" : "outline"}
          onClick={() => onPageChange?.(item)}
        >
          {item}
        </Button>
      ))}
      <Button
        aria-label="下一页"
        disabled={page >= safeTotalPages}
        size="icon"
        type="button"
        variant="outline"
        onClick={() => onPageChange?.(Math.min(safeTotalPages, page + 1))}
      >
        <ChevronRight />
      </Button>
    </nav>
  );
}
