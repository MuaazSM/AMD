import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function scoreColor(s: number): string {
  if (s < 0) return "var(--color-text-faint)";
  if (s >= 70) return "var(--color-accent)";
  if (s >= 40) return "var(--color-warn)";
  return "var(--color-danger)";
}

export function scoreLabel(s: number): string {
  if (s < 0) return "NOT FOOD";
  if (s >= 70) return "LOOKING GOOD";
  if (s >= 40) return "PROCEED WITH CARE";
  return "RED FLAG";
}

export function formatChipLabel(v: string): string {
  return v
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function relativeTime(iso: string): string {
  const now = Date.now();
  const then = new Date(iso).getTime();
  const diff = Math.floor((now - then) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export async function compressImage(
  file: File,
  maxDim = 1280,
  quality = 0.82,
): Promise<{ base64: string; mimeType: string; dataUrl: string }> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxDim / Math.max(bitmap.width, bitmap.height));
  const w = Math.round(bitmap.width * scale);
  const h = Math.round(bitmap.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D not supported");
  ctx.drawImage(bitmap, 0, 0, w, h);

  const dataUrl = canvas.toDataURL("image/jpeg", quality);
  const base64 = dataUrl.split(",")[1];
  return { base64, mimeType: "image/jpeg", dataUrl };
}
