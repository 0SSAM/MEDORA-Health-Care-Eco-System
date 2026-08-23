import { describe, expect, it } from "vitest";
import { securityInternals } from "./security";

describe("security middleware boundaries", () => {
  it("uses the Express-resolved client IP instead of trusting a raw forwarded header", () => {
    const request = {
      ip: "10.0.0.7",
      headers: { "x-forwarded-for": "198.51.100.9" },
    } as never;
    const key = securityInternals.clientKey(request);
    expect(key).toBe("10.0.0.7");
  });

  it("rejects cross-site cookie-authenticated mutations", () => {
    const request = {
      method: "POST",
      headers: { "sec-fetch-site": "cross-site" },
    } as never;
    expect(securityInternals.isTrustedMutationRequest(request)).toEqual({
      allowed: false,
      status: 403,
      reason: "cross-site request blocked",
    });
  });

  it("uses Express-resolved origin data rather than raw forwarded headers", () => {
    const request = {
      ip: "203.0.113.8",
      protocol: "http",
      hostname: "aldora.example",
      headers: {
        "x-forwarded-host": "attacker.example",
        "x-forwarded-proto": "https",
      },
      get: (name: string) => name === "host" ? "aldora.example" : undefined,
    } as never;
    expect(securityInternals.requestOrigin(request)).toBe("http://aldora.example");
  });

  it("uses HTTPS and hostname already resolved by the trusted proxy", () => {
    const request = {
      ip: "203.0.113.8",
      protocol: "https",
      hostname: "aldorapharm.example",
      headers: {
        "x-forwarded-host": "attacker.example",
        "x-forwarded-proto": "https",
      },
      get: (name: string) => name === "host" ? "127.0.0.1:3000" : undefined,
    } as never;
    expect(securityInternals.requestOrigin(request)).toBe("https://aldorapharm.example");
  });

  it("applies stricter limits to authentication and upload routes", () => {
    expect(securityInternals.rateLimitFor("/api/trpc/auth.internalLogin", true)).toEqual({ category: "auth", limit: 12 });
    expect(securityInternals.rateLimitFor("/api/trpc/erp.prescription.upload", true)).toEqual({ category: "upload", limit: 20 });
    expect(securityInternals.rateLimitFor("/api/trpc/erp.sales.commit", true)).toEqual({ category: "mutation", limit: 120 });
    expect(securityInternals.rateLimitFor("/api/trpc/erp.catalog", false)).toBeNull();
  });
});
