import { TRPCError } from "@trpc/server";

export const NLM_ICD10CM_ENDPOINT = "https://clinicaltables.nlm.nih.gov/api/icd10cm/v3/search";
export const NLM_ICD10CM_SOURCE = "NLM Clinical Table Search Service – ICD-10-CM";
export const NLM_ICD10CM_VERSION = "2026";
export const NLM_ICD10CM_JURISDICTION = "US";
export const NLM_CACHE_TTL_MS = 5 * 60 * 1000;
const NLM_CACHE_MAX_ENTRIES = 100;

type CacheEntry = {
  results: NlmIcd10Result[];
  retrievedAt: string;
  expiresAt: number;
};

const resultCache = new Map<string, CacheEntry>();
const inFlight = new Map<string, Promise<CacheEntry>>();
const manualRefreshAt = new Map<string, number>();
export const NLM_MANUAL_REFRESH_INTERVAL_MS = 60 * 1000;

export type NlmIcd10Result = {
  code: string;
  description: string;
  source: typeof NLM_ICD10CM_SOURCE;
  version: typeof NLM_ICD10CM_VERSION;
  jurisdiction: typeof NLM_ICD10CM_JURISDICTION;
  sourceUrl: string;
  retrievedAt: string;
  cacheStatus: "MISS" | "HIT";
  expiresAt: string;
};

function assertSearchTerms(terms: string) {
  const normalized = terms.trim().replace(/[\u0000-\u001f\u007f]/g, "");
  if (normalized.length < 2 || normalized.length > 120) {
    throw new TRPCError({ code: "BAD_REQUEST", message: "أدخل كلمتين على الأقل للبحث المرجعي." });
  }
  return normalized;
}

function cacheKey(terms: string, count: number) {
  return `${NLM_ICD10CM_VERSION}:${NLM_ICD10CM_JURISDICTION}:${terms.toLocaleLowerCase("en-US")}:${count}`;
}

function cloneWithStatus(entry: CacheEntry, cacheStatus: NlmIcd10Result["cacheStatus"]): NlmIcd10Result[] {
  return entry.results.map(result => ({ ...result, cacheStatus }));
}

function storeEntry(key: string, entry: CacheEntry) {
  resultCache.delete(key);
  resultCache.set(key, entry);
  while (resultCache.size > NLM_CACHE_MAX_ENTRIES) {
    const oldest = resultCache.keys().next().value;
    if (oldest) resultCache.delete(oldest);
    else break;
  }
}

async function fetchNlmEntry(url: URL, count: number, signal?: AbortSignal): Promise<CacheEntry> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);
  const onAbort = () => controller.abort();
  signal?.addEventListener("abort", onAbort, { once: true });
  try {
    const response = await fetch(url, { signal: controller.signal, headers: { Accept: "application/json" } });
    if (!response.ok) throw new TRPCError({ code: "SERVICE_UNAVAILABLE", message: "خدمة البحث المرجعي غير متاحة حالياً." });
    const payload: unknown = await response.json();
    if (!Array.isArray(payload) || !Array.isArray(payload[3])) {
      throw new TRPCError({ code: "SERVICE_UNAVAILABLE", message: "تعذر التحقق من استجابة المصدر المرجعي." });
    }
    const retrievedAt = new Date().toISOString();
    const expiresAt = Date.now() + NLM_CACHE_TTL_MS;
    const results: NlmIcd10Result[] = payload[3].slice(0, count).flatMap((row: unknown) => {
      if (!Array.isArray(row) || typeof row[0] !== "string" || typeof row[1] !== "string") return [];
      return [{
        code: row[0],
        description: row[1],
        source: NLM_ICD10CM_SOURCE,
        version: NLM_ICD10CM_VERSION,
        jurisdiction: NLM_ICD10CM_JURISDICTION,
        sourceUrl: NLM_ICD10CM_ENDPOINT,
        retrievedAt,
        cacheStatus: "MISS" as const,
        expiresAt: new Date(expiresAt).toISOString(),
      }];
    });
    return { results, retrievedAt, expiresAt };
  } catch (error) {
    if (error instanceof TRPCError) throw error;
    throw new TRPCError({ code: "SERVICE_UNAVAILABLE", message: "تعذر الوصول إلى خدمة البحث المرجعي؛ حاول لاحقاً." });
  } finally {
    clearTimeout(timeout);
    signal?.removeEventListener("abort", onAbort);
  }
}

export async function searchNlmIcd10Cm(terms: string, options: { count?: number; signal?: AbortSignal } = {}): Promise<NlmIcd10Result[]> {
  const normalized = assertSearchTerms(terms);
  const count = Math.max(1, Math.min(options.count ?? 20, 50));
  const key = cacheKey(normalized, count);
  const cached = resultCache.get(key);
  if (cached && cached.expiresAt > Date.now()) return cloneWithStatus(cached, "HIT");
  if (cached) resultCache.delete(key);

  const existing = inFlight.get(key);
  if (existing) return cloneWithStatus(await existing, "HIT");

  const url = new URL(NLM_ICD10CM_ENDPOINT);
  url.searchParams.set("terms", normalized);
  url.searchParams.set("count", String(count));
  url.searchParams.set("offset", "0");
  url.searchParams.set("df", "code,name");
  url.searchParams.set("sf", "code,name");
  url.searchParams.set("ef", "code,name");

  const request = fetchNlmEntry(url, count, options.signal);
  inFlight.set(key, request);
  try {
    const entry = await request;
    storeEntry(key, entry);
    return cloneWithStatus(entry, "MISS");
  } finally {
    inFlight.delete(key);
  }
}

export function clearNlmIcd10Cache() {
  resultCache.clear();
  inFlight.clear();
}

export function allowNlmManualRefresh(actorKey: string, now = Date.now()) {
  const key = actorKey.trim().slice(0, 120);
  if (!key) return false;
  const previous = manualRefreshAt.get(key);
  if (previous && now - previous < NLM_MANUAL_REFRESH_INTERVAL_MS) return false;
  manualRefreshAt.set(key, now);
  if (manualRefreshAt.size > 1000) {
    const oldest = manualRefreshAt.keys().next().value;
    if (oldest) manualRefreshAt.delete(oldest);
  }
  return true;
}

export function getNlmIcd10CacheStats() {
  let latest: CacheEntry | undefined;
  for (const entry of Array.from(resultCache.values())) {
    if (!latest || entry.retrievedAt > latest.retrievedAt) latest = entry;
  }
  return {
    entries: resultCache.size,
    maxEntries: NLM_CACHE_MAX_ENTRIES,
    ttlMs: NLM_CACHE_TTL_MS,
    source: NLM_ICD10CM_SOURCE,
    version: NLM_ICD10CM_VERSION,
    jurisdiction: NLM_ICD10CM_JURISDICTION,
    latestRetrievedAt: latest?.retrievedAt ?? null,
    latestExpiresAt: latest ? new Date(latest.expiresAt).toISOString() : null,
  };
}
