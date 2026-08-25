// MEDORA | ميدورا — Integrated Health Care System
// Copyright (c) 2026 Hossam Naeim Osman | حسام نعيم عثمان. All rights reserved.
// Proprietary and confidential. Unauthorized copying, distribution, or use of this
// software, or of any portion of it, is strictly prohibited.
// Source: https://github.com/0SSAM/MEDORA-Health-Care-Eco-System
import { COOKIE_NAME } from "@shared/const";

type StorageLike = Pick<Storage, "getItem">;

type CachedHeader = {
  expiresAt: number;
  header: Record<string, string>;
};

const CACHE_WINDOW_MS = 10_000;
const PREVIEW_FALLBACK_ENABLED =
  import.meta.env.DEV || import.meta.env.VITE_MEDORA_AUTH_FALLBACK === "true";
let cached: CachedHeader | null = null;

export function getSessionAuthHeader(
  storage: StorageLike | undefined = typeof window !== "undefined" ? window.sessionStorage : undefined,
  now = Date.now(),
): Record<string, string> {
  if (cached && cached.expiresAt > now) return cached.header;

  let header: Record<string, string> = {};
  if (!PREVIEW_FALLBACK_ENABLED) {
    cached = { expiresAt: now + CACHE_WINDOW_MS, header };
    return header;
  }
  try {
    const raw = storage?.getItem("medora-session-token");
    if (raw) {
      const prefix = `${COOKIE_NAME}=`;
      const pair = raw.split(";").find(value => value.trim().startsWith(prefix));
      const token = pair?.trim().slice(prefix.length);
      if (token) header = { Authorization: `Bearer ${token}` };
    }
  } catch {
    // Storage may be unavailable in private browsing or embedded WebViews.
  }

  cached = { expiresAt: now + CACHE_WINDOW_MS, header };
  return header;
}

export function clearSessionAuthHeaderCache() {
  cached = null;
}
