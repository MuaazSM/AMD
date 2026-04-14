"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ActionButton } from "@/components/action-button";
import { AdditiveBadge } from "@/components/additive-badge";
import { Header } from "@/components/header";
import { LoadingState } from "@/components/loading-state";
import { ScoreRing } from "@/components/score-ring";
import { SwapCard } from "@/components/swap-card";
import { VerdictBlock } from "@/components/verdict-block";
import { analyzeFood } from "@/lib/api";
import { ease, fadeUp } from "@/lib/motion";
import {
  appendHistory,
  clearPendingScan,
  loadPendingScan,
  loadProfile,
} from "@/lib/storage";
import type { AnalysisResult, PendingScan, ScanEntry } from "@/lib/types";
import { scoreColor, scoreLabel } from "@/lib/utils";

type State =
  | { kind: "loading" }
  | { kind: "ready"; result: AnalysisResult; pending: PendingScan; provider: string | null }
  | { kind: "error" };

export default function ResultPage() {
  const router = useRouter();
  const [state, setState] = useState<State>({ kind: "loading" });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const pending = loadPendingScan();
    if (!pending) {
      router.replace("/");
      return;
    }
    const profile = loadProfile();
    let active = true;
    analyzeFood(pending.base64, pending.mimeType, profile)
      .then(({ result, provider }) => {
        if (!active) return;
        setState({ kind: "ready", result, pending, provider });
      })
      .catch((err) => {
        if (!active) return;
        console.error(err);
        toast.error("Analysis failed. Try another photo.");
        setState({ kind: "error" });
        setTimeout(() => router.replace("/"), 1200);
      });
    return () => {
      active = false;
    };
  }, [router]);

  if (state.kind === "loading" || state.kind === "error") {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <LoadingState />
      </div>
    );
  }

  const { result, pending, provider } = state;
  const color = scoreColor(result.health_score);

  function onSave() {
    if (saved) return;
    const entry: ScanEntry = {
      ...result,
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      image_data_url: pending.dataUrl,
      provider,
    };
    appendHistory(entry);
    setSaved(true);
    toast.success("Saved to history.");
  }

  function onScanAnother() {
    clearPendingScan();
    router.push("/");
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="mx-auto w-full max-w-6xl px-6 pb-32 pt-12">
        <motion.div
          variants={fadeUp}
          initial="initial"
          animate="animate"
          transition={{ duration: 0.6, ease }}
          className="eyebrow"
        >
          Category · {result.category}
        </motion.div>

        <motion.h1
          variants={fadeUp}
          initial="initial"
          animate="animate"
          transition={{ duration: 0.6, ease, delay: 0.1 }}
          className="mt-3 font-serif text-5xl italic leading-[1.05] md:text-7xl"
        >
          {result.food_name}
        </motion.h1>

        <div className="relative mt-12 grid grid-cols-1 gap-8 md:grid-cols-2">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, ease, delay: 0.2 }}
            className="relative aspect-4/5 overflow-hidden rounded-2xl border border-border bg-surface"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={pending.dataUrl}
              alt={result.food_name}
              className="h-full w-full object-cover"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease, delay: 0.3 }}
            className="relative z-10 flex flex-col items-center justify-center md:-translate-x-20"
          >
            <ScoreRing score={result.health_score} size={320} />
            <span
              className="mt-6 text-[11px] tracking-[0.22em]"
              style={{ color }}
            >
              {scoreLabel(result.health_score)}
            </span>
          </motion.div>
        </div>

        <VerdictBlock verdict={result.verdict} delay={0.9} />

        <div className="grid grid-cols-1 gap-12 md:grid-cols-2">
          <Section title="Ingredients" delay={1.1}>
            <ul className="space-y-2 text-sm text-text-dim">
              {result.ingredients.map((it) => (
                <li key={it} className="flex gap-3">
                  <span className="text-text-faint">·</span>
                  <span>{it}</span>
                </li>
              ))}
            </ul>
          </Section>

          <Section title="Concerns" delay={1.2}>
            <ul className="space-y-2 text-sm text-text-dim">
              {result.concerns.length === 0 ? (
                <li className="text-text-faint">None flagged.</li>
              ) : (
                result.concerns.map((it) => (
                  <li key={it} className="flex gap-3">
                    <span className="text-text-faint">·</span>
                    <span>{it}</span>
                  </li>
                ))
              )}
            </ul>
          </Section>
        </div>

        {result.positives.length > 0 && (
          <Section title="Positives" delay={1.3} className="mt-12">
            <ul className="flex flex-wrap gap-2 text-sm text-text-dim">
              {result.positives.map((p) => (
                <li
                  key={p}
                  className="rounded-full border border-border px-3 py-1.5"
                >
                  {p}
                </li>
              ))}
            </ul>
          </Section>
        )}

        {result.harmful_additives.length > 0 && (
          <Section title="Additives" delay={1.4} className="mt-12">
            <div className="flex flex-wrap gap-2">
              {result.harmful_additives.map((a) => (
                <AdditiveBadge key={a.name} name={a.name} risk={a.risk} />
              ))}
            </div>
          </Section>
        )}

        {result.swaps.length > 0 && (
          <Section title="Try Instead" delay={1.5} className="mt-12">
            <div className="grid gap-4 md:grid-cols-2">
              {result.swaps.map((s) => (
                <SwapCard key={s.original + s.suggestion} swap={s} />
              ))}
            </div>
          </Section>
        )}

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease, delay: 1.7 }}
          className="mt-16 flex flex-wrap gap-3"
        >
          <ActionButton onClick={onScanAnother}>Scan another</ActionButton>
          <ActionButton variant="outline" onClick={onSave} disabled={saved}>
            {saved ? "Saved" : "Save to history"}
          </ActionButton>
          {provider && (
            <span className="ml-auto self-center text-[11px] tracking-[0.18em] text-text-faint uppercase">
              Analyzed via {provider}
            </span>
          )}
        </motion.div>
      </main>
    </div>
  );
}

function Section({
  title,
  children,
  delay,
  className = "",
}: {
  title: string;
  children: React.ReactNode;
  delay: number;
  className?: string;
}) {
  return (
    <motion.section
      variants={fadeUp}
      initial="initial"
      animate="animate"
      transition={{ duration: 0.6, ease, delay }}
      className={className}
    >
      <h2 className="eyebrow mb-4">{title}</h2>
      {children}
    </motion.section>
  );
}
