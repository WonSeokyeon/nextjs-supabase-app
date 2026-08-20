"use client";

import { InboxIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { EmptyStateProps } from "@/lib/types/component-props";

export function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
      <InboxIcon className="size-10 text-muted-foreground" />
      <p className="text-sm font-medium">{title}</p>
      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
      {actionLabel && onAction && (
        <Button className="mt-2" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
