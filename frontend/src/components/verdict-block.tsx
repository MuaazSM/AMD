"use client";

import { motion } from "framer-motion";
import { ease, fadeUp } from "@/lib/motion";

export function VerdictBlock({
  verdict,
  delay = 0.9,
}: {
  verdict: string;
  delay?: number;
}) {
  return (
    <motion.blockquote
      variants={fadeUp}
      initial="initial"
      animate="animate"
      transition={{ duration: 0.6, ease, delay }}
      className="my-12 max-w-2xl border-l-2 border-accent py-2 pl-6 font-serif text-2xl italic leading-snug text-text md:text-3xl"
    >
      &ldquo;{verdict}&rdquo;
    </motion.blockquote>
  );
}
