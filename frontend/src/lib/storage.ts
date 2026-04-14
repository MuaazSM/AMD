import type { PendingScan, ScanEntry, UserProfile } from "./types";

const PROFILE_KEY = "foodlens_profile";
const HISTORY_KEY = "foodlens_history";
const PENDING_KEY = "pending_scan";

function hasWindow() {
  return typeof window !== "undefined";
}

export function loadProfile(): UserProfile | null {
  if (!hasWindow()) return null;
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    return raw ? (JSON.parse(raw) as UserProfile) : null;
  } catch {
    return null;
  }
}

export function saveProfile(p: UserProfile) {
  if (!hasWindow()) return;
  try {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(p));
  } catch {}
}

export function loadHistory(): ScanEntry[] {
  if (!hasWindow()) return [];
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? (JSON.parse(raw) as ScanEntry[]) : [];
  } catch {
    return [];
  }
}

export function appendHistory(entry: ScanEntry) {
  if (!hasWindow()) return;
  try {
    const list = loadHistory();
    list.push(entry);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(list));
  } catch {}
}

export function clearHistory() {
  if (!hasWindow()) return;
  try {
    localStorage.removeItem(HISTORY_KEY);
  } catch {}
}

export function savePendingScan(p: PendingScan) {
  if (!hasWindow()) return;
  try {
    sessionStorage.setItem(PENDING_KEY, JSON.stringify(p));
  } catch {}
}

export function loadPendingScan(): PendingScan | null {
  if (!hasWindow()) return null;
  try {
    const raw = sessionStorage.getItem(PENDING_KEY);
    return raw ? (JSON.parse(raw) as PendingScan) : null;
  } catch {
    return null;
  }
}

export function clearPendingScan() {
  if (!hasWindow()) return;
  try {
    sessionStorage.removeItem(PENDING_KEY);
  } catch {}
}
