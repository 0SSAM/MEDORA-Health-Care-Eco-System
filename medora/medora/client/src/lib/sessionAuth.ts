import { COOKIE_NAME } from "@shared/const";

type StorageLike = Pick<Storage, "getItem">;
type MutableStorageLike = StorageLike & Pick<Storage, "removeItem">;

type CachedHeader = {
  expiresAt: number;
  header: Record<string, string>;
};

const CACHE_WINDOW_MS = 10_000;
let cached: CachedHeader | null = null;

export function getSessionAuthHeader(
  storage: StorageLike | undefined = typeof window !== "undefined" ? window.sessionStorage : undefined,
  now = Date.now(),
): Record<string, string> {
  if (cached && cached.expiresAt > now) return cached.header;

  let header: Record<string, string> = {};
  try {
    const raw = storage?.getItem("manus-cookie");
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

/**
 * Removes the browser-side mirror of an OAuth credential. Internal employee
 * login uses an HttpOnly internal-session cookie instead; retaining an older
 * mirror would otherwise cause the shared tRPC transport to send a competing
 * bearer identity on subsequent requests.
 */
export function clearStoredSessionAuth(
  storage: MutableStorageLike | undefined = typeof window !== "undefined" ? window.sessionStorage : undefined,
) {
  clearSessionAuthHeaderCache();
  try {
    storage?.removeItem("manus-cookie");
  } catch {
    // Storage can be unavailable in private or embedded browsing contexts.
  }
}
