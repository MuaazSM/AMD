"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

const TAGLINES = [
  "Reading ingredients…",
  "Checking additives…",
  "Calculating score…",
  "Personalizing verdict…",
];

export function LoadingState() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(
      () => setI((v) => Math.min(v + 1, TAGLINES.length - 1)),
      1500,
    );
    return () => clearInterval(t);
  }, []);

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-8 bg-bg">
      <div className="relative h-40 w-40">
        <motion.svg
          viewBox="0 0 54 54"
          className="h-full w-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <circle
            cx={27}
            cy={27}
            r={22}
            fill="none"
            stroke="var(--color-surface-2)"
            strokeWidth={3.5}
          />
          <circle
            cx={27}
            cy={27}
            r={22}
            fill="none"
            stroke="var(--color-text-dim)"
            strokeWidth={3.5}
            strokeLinecap="round"
            strokeDasharray="30 108"
          />
        </motion.svg>
      </div>
      <div className="flex flex-col items-center gap-3">
        <span className="eyebrow">Analyzing</span>
        <AnimatePresence mode="wait">
          <motion.span
            key={i}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.4 }}
            className="font-serif text-2xl italic text-text"
          >
            {TAGLINES[i]}
          </motion.span>
        </AnimatePresence>
      </div>
    </div>
  );
}
