"use client";

import { motion } from "framer-motion";
import { scoreColor } from "@/lib/utils";
import { ScoreNumber } from "./score-number";

const R = 22;
const CIRC = 2 * Math.PI * R;

export function ScoreRing({
  score,
  size = 320,
  animated = true,
  showNumber = true,
}: {
  score: number;
  size?: number;
  animated?: boolean;
  showNumber?: boolean;
}) {
  const color = scoreColor(score);
  const pct = Math.max(0, Math.min(100, score)) / 100;

  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      {animated && (
        <div
          aria-hidden
          className="absolute inset-0 rounded-full blur-3xl opacity-40"
          style={{
            background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
          }}
        />
      )}
      <svg
        viewBox="0 0 54 54"
        width={size}
        height={size}
        className="relative"
      >
        <circle
          cx={27}
          cy={27}
          r={R}
          fill="none"
          stroke="var(--color-surface-2)"
          strokeWidth={3.5}
        />
        <motion.circle
          cx={27}
          cy={27}
          r={R}
          fill="none"
          stroke={color}
          strokeWidth={3.5}
          strokeLinecap="round"
          strokeDasharray={CIRC}
          initial={animated ? { pathLength: 0 } : { pathLength: pct }}
          animate={{ pathLength: pct }}
          transition={{
            duration: animated ? 1.2 : 0,
            ease: [0.22, 1, 0.36, 1],
            delay: animated ? 0.2 : 0,
          }}
          transform="rotate(-90 27 27)"
        />
      </svg>
      {showNumber && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <ScoreNumber
            score={score}
            className="font-serif leading-none tabular"
            duration={animated ? 1.2 : 0}
            delay={animated ? 0.2 : 0}
          />
        </div>
      )}
    </div>
  );
}
