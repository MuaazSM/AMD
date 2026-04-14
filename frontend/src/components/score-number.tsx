"use client";

import { animate, useMotionValue, useTransform, motion } from "framer-motion";
import { useEffect } from "react";

export function ScoreNumber({
  score,
  className = "",
  duration = 1.2,
  delay = 0.2,
}: {
  score: number;
  className?: string;
  duration?: number;
  delay?: number;
}) {
  const mv = useMotionValue(0);
  const rounded = useTransform(mv, (v) => Math.round(v));

  useEffect(() => {
    const controls = animate(mv, score < 0 ? 0 : score, {
      duration,
      delay,
      ease: [0.22, 1, 0.36, 1],
    });
    return () => controls.stop();
  }, [mv, score, duration, delay]);

  if (score < 0) {
    return <span className={className}>—</span>;
  }
  return <motion.span className={`${className} tabular`}>{rounded}</motion.span>;
}
