"use client";

import { motion } from "framer-motion";
import { Camera } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { savePendingScan } from "@/lib/storage";
import { compressImage } from "@/lib/utils";

export function ScanButton() {
  const router = useRouter();
  const ref = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  async function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    try {
      const { base64, mimeType, dataUrl } = await compressImage(file);
      savePendingScan({
        base64,
        mimeType,
        dataUrl,
        createdAt: new Date().toISOString(),
      });
      router.push("/result");
    } catch (err) {
      toast.error("Could not read that image.");
      console.error(err);
      setBusy(false);
    }
  }

  return (
    <div className="relative">
      <motion.span
        aria-hidden
        className="pointer-events-none absolute inset-[-14px] rounded-full border border-accent/30"
        animate={{ scale: [1, 1.06, 1], opacity: [0.4, 0.15, 0.4] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.button
        type="button"
        onClick={() => ref.current?.click()}
        disabled={busy}
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.97 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="relative flex h-60 w-60 flex-col items-center justify-center gap-3 rounded-full bg-accent text-bg shadow-[0_20px_80px_-20px_rgba(132,204,22,0.6)] disabled:opacity-70"
      >
        <Camera className="h-10 w-10" strokeWidth={1.5} />
        <span className="text-[11px] font-medium uppercase tracking-[0.2em]">
          {busy ? "Preparing…" : "Scan Food"}
        </span>
      </motion.button>
      <input
        ref={ref}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={onPick}
        className="hidden"
      />
    </div>
  );
}
