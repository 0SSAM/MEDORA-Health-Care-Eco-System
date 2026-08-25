import { describe, expect, it } from "vitest";
import {
  INTERNAL_MAX_FAILED_ATTEMPTS,
  createInternalSessionToken,
  hashInternalPassword,
  hashSessionToken,
  hashAuditRecord,
  isLocked,
  isSessionEnvironmentConsistent,
  normalizeInternalUsername,
  verifyInternalPassword,
} from "./internal-auth";

describe("internal employee authentication contract", () => {
  it("normalizes usernames without changing their identity semantics", () => {
    expect(normalizeInternalUsername("  Cashier.Branch1 ")).toBe("cashier.branch1");
  });

  it("hashes passwords and verifies only the original password", () => {
    const password = "StrongEmployeePassword9";
    const hash = hashInternalPassword(password);
    expect(hash).not.toContain(password);
    expect(verifyInternalPassword(password, hash)).toBe(true);
    expect(verifyInternalPassword("wrong password", hash)).toBe(false);
  });

  it("fails closed for malformed password records", () => {
    expect(verifyInternalPassword("StrongEmployeePassword9", "scrypt$not-a-number$8$1$bad$bad")).toBe(false);
    expect(verifyInternalPassword("StrongEmployeePassword9", "scrypt$16384$8$1$bad$bad")).toBe(false);
  });

  it("requires a configured audit signing key", () => {
    const previous = process.env.AUDIT_SIGNING_KEY;
    delete process.env.AUDIT_SIGNING_KEY;
    expect(() => hashAuditRecord({ eventType: "test", createdAt: new Date().toISOString() })).toThrow(/Audit signing key/);
    if (previous === undefined) delete process.env.AUDIT_SIGNING_KEY;
    else process.env.AUDIT_SIGNING_KEY = previous;
  });

  it("rejects cross-environment session elevation", () => {
    expect(isSessionEnvironmentConsistent("showcase", "showcase")).toBe(true);
    expect(isSessionEnvironmentConsistent("production", "production")).toBe(true);
    expect(isSessionEnvironmentConsistent("showcase", "production")).toBe(false);
    expect(isSessionEnvironmentConsistent("production", "showcase")).toBe(false);
  });

  it("uses a bounded lockout threshold", () => {
    expect(INTERNAL_MAX_FAILED_ATTEMPTS).toBeGreaterThanOrEqual(5);
    expect(isLocked(new Date(Date.now() + 60_000), new Date())).toBe(true);
    expect(isLocked(new Date(Date.now() - 1), new Date())).toBe(false);
    expect(isLocked(null, new Date())).toBe(false);
  });

  it("creates high-entropy opaque session and recovery tokens", () => {
    const first = createInternalSessionToken();
    const second = createInternalSessionToken();
    expect(first).not.toBe(second);
    expect(first.length).toBeGreaterThanOrEqual(40);
    expect(hashSessionToken(first)).not.toContain(first);
    expect(hashSessionToken(first)).not.toBe(hashSessionToken(second));
  });

  it("rejects weak reset passwords through the shared policy", () => {
    expect(() => hashInternalPassword("short")).toThrow();
    expect(() => hashInternalPassword("no-uppercase-password9")).toThrow();
    expect(() => hashInternalPassword("NoNumberPassword")).toThrow();
  });
});
