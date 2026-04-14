"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Header } from "@/components/header";
import { ScoreRing } from "@/components/score-ring";
import { ease, fadeUp } from "@/lib/motion";
import { loadHistory } from "@/lib/storage";
import type { ScanEntry } from "@/lib/types";
import { relativeTime, scoreColor } from "@/lib/utils";

export default function HistoryPage() {
  const [entries, setEntries] = useState<ScanEntry[]>([]);

  useEffect(() => {
    const list = loadHistory()
      .filter((e) => e.health_score >= 0)
      .sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
      );
    setEntries(list);
  }, []);

  const avg =
    entries.length === 0
      ? 0
      : Math.round(
          entries.reduce((s, e) => s + e.health_score, 0) / entries.length,
        );

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="mx-auto w-full max-w-3xl px-6 pb-32 pt-16">
        <motion.div
          variants={fadeUp}
          initial="initial"
          animate="animate"
          transition={{ duration: 0.6, ease }}
        >
          <span className="eyebrow">
            Avg across {entries.length} scan{entries.length === 1 ? "" : "s"}
          </span>
          <div
            className="mt-2 font-serif text-7xl tabular md:text-8xl"
            style={{ color: entries.length ? scoreColor(avg) : undefined }}
          >
            {entries.length ? avg : "—"}
          </div>
        </motion.div>

        <div className="mt-16 border-t border-border">
          {entries.length === 0 ? (
            <div className="flex flex-col items-center gap-4 py-24 text-center">
              <span className="font-serif text-3xl italic text-text-dim">
                No scans yet.
              </span>
              <Link
                href="/"
                className="text-sm text-accent underline-offset-4 hover:underline"
              >
                Take your first scan →
              </Link>
            </div>
          ) : (
            <ul>
              {entries.map((e, i) => (
                <motion.li
                  key={e.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.5,
                    ease,
                    delay: 0.05 * Math.min(i, 8),
                  }}
                  className="flex items-center gap-4 border-b border-border py-4"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={e.image_data_url}
                    alt={e.food_name}
                    className="h-16 w-16 flex-none rounded-lg object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-base font-medium text-text">
                      {e.food_name}
                    </div>
                    <div className="text-sm text-text-dim">
                      {relativeTime(e.timestamp)} · {e.category}
                    </div>
                  </div>
                  <div className="flex-none">
                    <ScoreRing
                      score={e.health_score}
                      size={52}
                      animated={false}
                      showNumber={false}
                    />
                  </div>
                  <div
                    className="w-10 text-right font-serif text-xl tabular"
                    style={{ color: scoreColor(e.health_score) }}
                  >
                    {e.health_score}
                  </div>
                </motion.li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </div>
  );
}
