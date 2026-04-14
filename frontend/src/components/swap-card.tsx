import { ArrowRight } from "lucide-react";
import type { SwapSuggestion } from "@/lib/types";

export function SwapCard({ swap }: { swap: SwapSuggestion }) {
  return (
    <div className="group rounded-xl border border-border bg-surface p-6 transition-colors hover:border-text-faint">
      <div className="flex items-center gap-3 text-sm text-text-dim">
        <span className="line-through">{swap.original}</span>
        <ArrowRight className="h-3.5 w-3.5 text-text-faint" />
      </div>
      <div className="mt-3 text-xl font-medium text-text">
        {swap.suggestion}
      </div>
      <div className="mt-3 text-sm text-text-dim">{swap.benefit}</div>
    </div>
  );
}
