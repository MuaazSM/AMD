import type { AdditiveRisk } from "@/lib/types";
import { cn } from "@/lib/utils";

const STYLES: Record<AdditiveRisk, string> = {
  high: "bg-[#2e1065] text-[#d8b4fe] border-purple-900",
  medium: "bg-amber-950 text-amber-300 border-amber-900",
  low: "bg-surface-2 text-text-dim border-border",
};

export function AdditiveBadge({
  name,
  risk,
}: {
  name: string;
  risk: AdditiveRisk;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] uppercase tracking-[0.18em]",
        STYLES[risk],
      )}
    >
      <span>{name}</span>
      <span className="opacity-70">· {risk}</span>
    </span>
  );
}
