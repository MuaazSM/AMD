"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AvatarIcon } from "./avatar-icon";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/history", label: "Scans" },
  { href: "/profile", label: "Profile" },
];

export function Header() {
  const pathname = usePathname();
  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-bg/60 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
        <Link
          href="/"
          className="text-sm font-medium uppercase tracking-[0.2em] text-text transition-opacity hover:opacity-80"
        >
          FoodLens
        </Link>
        <nav className="flex items-center gap-1">
          {LINKS.map((l) => {
            const active = pathname === l.href;
            return (
              <motion.div
                key={l.href}
                whileTap={{ scale: 0.94 }}
                transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              >
                <Link
                  href={l.href}
                  className={cn(
                    "rounded-full px-4 py-1.5 text-sm transition-colors",
                    active
                      ? "bg-surface text-text"
                      : "text-text-dim hover:text-text",
                  )}
                >
                  {l.label}
                </Link>
              </motion.div>
            );
          })}
          <motion.button
            type="button"
            aria-label="Profile"
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.92 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="ml-2 flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border border-border bg-surface-2 text-[#b5a3a3]"
          >
            <AvatarIcon size={22} />
          </motion.button>
        </nav>
      </div>
    </header>
  );
}
