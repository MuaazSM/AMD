"use client";

import { motion } from "framer-motion";
import { Header } from "@/components/header";
import { ScanButton } from "@/components/scan-button";
import { ease, fadeUp, stagger } from "@/lib/motion";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="relative flex flex-1 flex-col items-center justify-center px-6 py-24">
        <motion.div
          variants={stagger}
          initial="initial"
          animate="animate"
          className="flex w-full max-w-3xl flex-col items-center gap-10 text-center"
        >
          <motion.span
            variants={fadeUp}
            transition={{ duration: 0.6, ease }}
            className="eyebrow"
          >
            Scan · Analyze · Decide
          </motion.span>

          <motion.h1
            variants={fadeUp}
            transition={{ duration: 0.6, ease }}
            className="text-balance text-5xl font-medium leading-[1.05] tracking-tight md:text-7xl"
          >
            Know what you&rsquo;re
            <br />
            <span className="font-serif italic text-text">
              actually eating.
            </span>
          </motion.h1>

          <motion.p
            variants={fadeUp}
            transition={{ duration: 0.6, ease }}
            className="max-w-md text-base text-text-dim md:text-lg"
          >
            One photo. A score out of 100. Personalized to your body.
          </motion.p>

          <motion.div
            variants={fadeUp}
            transition={{ duration: 0.6, ease }}
            className="mt-6"
          >
            <ScanButton />
          </motion.div>
        </motion.div>

        <div className="pointer-events-none absolute inset-x-0 bottom-6 text-center">
          <span className="eyebrow text-text-faint">
            FoodLens · Built for AMD Slingshot × Google, 2026
          </span>
        </div>
      </main>
    </div>
  );
}
