import { afterEach, describe, expect, it, vi } from "vitest";
import { allowNlmManualRefresh, clearNlmIcd10Cache, getNlmIcd10CacheStats, NLM_MANUAL_REFRESH_INTERVAL_MS, searchNlmIcd10Cm } from "./nlm-icd10";

describe("NLM ICD-10-CM reference adapter", () => {
  afterEach(() => {
    clearNlmIcd10Cache();
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it("bounds results and records source provenance and retrieval metadata", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify([12, ["code", "name"], null, [["J10", "Influenza due to other identified influenza virus"]]]), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);
    const results = await searchNlmIcd10Cm("influenza", { count: 500 });
    expect(results).toHaveLength(1);
    expect(results[0]).toMatchObject({ code: "J10", jurisdiction: "US", version: "2026", cacheStatus: "MISS", sourceUrl: expect.stringContaining("clinicaltables.nlm.nih.gov") });
    expect(results[0].retrievedAt).toEqual(expect.any(String));
    expect(results[0].expiresAt).toEqual(expect.any(String));
    const requestUrl = new URL(fetchMock.mock.calls[0][0] as string);
    expect(requestUrl.searchParams.get("count")).toBe("50");
    expect(requestUrl.searchParams.get("terms")).toBe("influenza");
  });

  it("serves repeated lookups from cache with one upstream request", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify([1, [], null, [["E11", "Type 2 diabetes mellitus"]]]), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);
    const first = await searchNlmIcd10Cm("diabetes");
    const second = await searchNlmIcd10Cm(" diabetes ");
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(first[0].cacheStatus).toBe("MISS");
    expect(second[0].cacheStatus).toBe("HIT");
    expect(second[0].retrievedAt).toBe(first[0].retrievedAt);
    expect(getNlmIcd10CacheStats().entries).toBe(1);
  });

  it("deduplicates concurrent requests", async () => {
    let resolveResponse!: (response: Response) => void;
    const fetchMock = vi.fn().mockReturnValue(new Promise<Response>(resolve => { resolveResponse = resolve; }));
    vi.stubGlobal("fetch", fetchMock);
    const firstPromise = searchNlmIcd10Cm("asthma");
    const secondPromise = searchNlmIcd10Cm("asthma");
    resolveResponse(new Response(JSON.stringify([1, [], null, [["J45", "Asthma"]]]), { status: 200 }));
    const [first, second] = await Promise.all([firstPromise, secondPromise]);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(first[0].code).toBe("J45");
    expect(second[0].cacheStatus).toBe("HIT");
  });

  it("expires entries and refreshes the source", async () => {
    vi.useFakeTimers();
    const fetchMock = vi.fn().mockImplementation(() => Promise.resolve(new Response(JSON.stringify([1, [], null, [["R50", "Fever"]]]), { status: 200 })));
    vi.stubGlobal("fetch", fetchMock);
    const first = await searchNlmIcd10Cm("fever");
    vi.advanceTimersByTime(5 * 60 * 1000 + 1);
    const second = await searchNlmIcd10Cm("fever");
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(first[0].cacheStatus).toBe("MISS");
    expect(second[0].cacheStatus).toBe("MISS");
    expect(second[0].retrievedAt).not.toBe(first[0].retrievedAt);
  });

  it("rejects short terms before making a remote request", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    await expect(searchNlmIcd10Cm("x")).rejects.toMatchObject({ code: "BAD_REQUEST" });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("fails closed on malformed or unavailable source responses", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({ invalid: true }), { status: 200 })));
    await expect(searchNlmIcd10Cm("diabetes")).rejects.toMatchObject({ code: "SERVICE_UNAVAILABLE" });
    clearNlmIcd10Cache();
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("", { status: 503 })));
    await expect(searchNlmIcd10Cm("diabetes")).rejects.toMatchObject({ code: "SERVICE_UNAVAILABLE" });
  });

  it("limits manual refresh per admin actor and exposes safe cache provenance", async () => {
    const firstAt = 1_000_000;
    expect(allowNlmManualRefresh("user:admin-1", firstAt)).toBe(true);
    expect(allowNlmManualRefresh("user:admin-1", firstAt + NLM_MANUAL_REFRESH_INTERVAL_MS - 1)).toBe(false);
    expect(allowNlmManualRefresh("user:admin-1", firstAt + NLM_MANUAL_REFRESH_INTERVAL_MS)).toBe(true);
    expect(allowNlmManualRefresh("", firstAt)).toBe(false);
    expect(getNlmIcd10CacheStats()).toMatchObject({ source: expect.stringContaining("NLM"), version: "2026", jurisdiction: "US", latestRetrievedAt: null, latestExpiresAt: null });
  });
});
