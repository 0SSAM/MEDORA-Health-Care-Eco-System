import { describe, expect, it } from "vitest";
import { assertPrivacyRetentionReady, privacyRetentionReadiness, type PrivacyRetentionContext } from "./privacy-retention-policy";

const complete: PrivacyRetentionContext = {
  legalBasis: "documented-local-basis",
  retentionDays: 365,
  rightsHandlingConfigured: true,
  deletionControlConfigured: true,
  exportControlConfigured: true,
  sourceUrl: "https://example.invalid/verified-source",
  effectiveFrom: new Date("2026-01-01T00:00:00.000Z"),
  now: new Date("2026-08-15T00:00:00.000Z"),
};

describe("privacy and retention readiness", () => {
  it("blocks incomplete or not-yet-effective policies", () => {
    expect(privacyRetentionReadiness(null)).toBe("BLOCKED");
    expect(privacyRetentionReadiness({ ...complete, legalBasis: "" })).toBe("BLOCKED");
    expect(privacyRetentionReadiness({ ...complete, retentionDays: 0 })).toBe("BLOCKED");
    expect(privacyRetentionReadiness({ ...complete, effectiveFrom: new Date("2027-01-01T00:00:00.000Z") })).toBe("BLOCKED");
    expect(() => assertPrivacyRetentionReady({ ...complete, deletionControlConfigured: false })).toThrow(/not ready/);
  });

  it("allows a policy when evidence and operational controls are complete", () => {
    expect(privacyRetentionReadiness(complete)).toBe("READY");
    expect(assertPrivacyRetentionReady(complete)).toBe(true);
  });
});
