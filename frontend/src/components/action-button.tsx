"use client";

import { motion } from "framer-motion";
import { forwardRef } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "outline";

interface Props extends React.ComponentProps<typeof motion.button> {
  variant?: Variant;
}

const VARIANTS: Record<Variant, string> = {
  primary:
    "bg-accent text-bg shadow-[0_10px_40px_-12px_rgba(132,204,22,0.45)] hover:shadow-[0_14px_50px_-10px_rgba(132,204,22,0.6)]",
  outline:
    "border border-border text-text hover:border-text-dim hover:bg-surface/60",
};

export const ActionButton = forwardRef<HTMLButtonElement, Props>(
  function ActionButton(
    { variant = "primary", className, children, disabled, ...rest },
    ref,
  ) {
    return (
      <motion.button
        ref={ref}
        type="button"
        whileHover={disabled ? undefined : { scale: 1.03, y: -1 }}
        whileTap={disabled ? undefined : { scale: 0.96 }}
        transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
        disabled={disabled}
        className={cn(
          "inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60",
          VARIANTS[variant],
          className,
        )}
        {...rest}
      >
        {children}
      </motion.button>
    );
  },
);
