import { describe, expect, it } from "vitest";
import { createSecurityMiddleware, isTrustedMutationRequest } from "./_core/security";

function request(overrides: Record<string, unknown> = {}) {
  return {
    method: "POST",
    protocol: "https",
    path: "/api/trpc/auth.internalLogin",
    ip: "203.0.113.10",
    headers: { host: "aldo.example", origin: "https://aldo.example" },
    get(name: string) {
      return name.toLowerCase() === "host" ? "aldo.example" : undefined;
    },
    ...overrides,
  } as never;
}

function response() {
  const headers = new Map<string, string>();
  const result: { statusCode?: number; body?: unknown } = {};
  return {
    headers,
    result,
    set(nameOrValues: string | Record<string, string>, value?: string) {
      if (typeof nameOrValues === "string") headers.set(nameOrValues, value ?? "");
      else Object.entries(nameOrValues).forEach(([key, val]) => headers.set(key, val));
      return this;
    },
    status(code: number) { result.statusCode = code; return this; },
    json(body: unknown) { result.body = body; return this; },
  } as never;
}

describe("HTTP security boundaries", () => {
  it("accepts same-origin mutations and rejects cross-site fetches", () => {
    expect(isTrustedMutationRequest(request())).toEqual({ allowed: true });
    expect(isTrustedMutationRequest(request({ headers: { host: "aldo.example", origin: "https://evil.example", "sec-fetch-site": "cross-site" } }))).toMatchObject({ allowed: false, status: 403 });
  });

  it("rejects a mismatched origin even without fetch metadata", () => {
    expect(isTrustedMutationRequest(request({ headers: { host: "aldo.example", origin: "https://evil.example" } }))).toMatchObject({ allowed: false, status: 403 });
  });

  it("adds defensive headers and throttles repeated auth attempts", () => {
    const middleware = createSecurityMiddleware();
    const first = response();
    middleware(request(), first, (() => {}) as never);
    expect(first.headers.get("X-Content-Type-Options")).toBe("nosniff");
    expect(first.headers.get("X-Frame-Options")).toBe("DENY");
    expect(first.headers.get("Origin-Agent-Cluster")).toBe("?1");
    expect(first.headers.get("RateLimit-Limit")).toBe("12");
    expect(first.headers.get("RateLimit-Remaining")).toBe("11");

    let rejected = false;
    let retryAfter: string | undefined;
    for (let i = 0; i < 20; i += 1) {
      const current = response();
      middleware(request(), current, (() => {}) as never);
      if (current.result.statusCode === 429) {
        rejected = true;
        retryAfter = current.headers.get("Retry-After");
      }
    }
    expect(rejected).toBe(true);
    expect(Number(retryAfter)).toBeGreaterThan(0);
  });
});
