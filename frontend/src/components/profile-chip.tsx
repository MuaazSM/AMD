"use client";

import { cn, formatChipLabel } from "@/lib/utils";

export function ProfileChip({
  value,
  active,
  onToggle,
}: {
  value: string;
  active: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={cn(
        "rounded-full border px-4 py-2 text-sm transition-all duration-200",
        active
          ? "border-accent bg-accent text-bg"
          : "border-border bg-transparent text-text-dim hover:border-text-dim hover:text-text",
      )}
    >
      {formatChipLabel(value)}
    </button>
  );
}
