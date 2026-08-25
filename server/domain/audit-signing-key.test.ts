import { describe, expect, it } from "vitest";
import { hashAuditRecord } from "./internal-auth";

describe("audit signing key", () => {
  it("signs audit records with the configured server key", () => {
    const key = process.env.AUDIT_SIGNING_KEY;
    expect(key, "AUDIT_SIGNING_KEY must be supplied").toBeTruthy();
    expect(key!.length).toBeGreaterThanOrEqual(32);

    const input = {
      eventType: "test_audit_key_validation",
      username: "test",
      createdAt: new Date(0).toISOString(),
    };
    const signature = hashAuditRecord(input);
    expect(signature).toMatch(/^[a-f0-9]{64}$/);
  });
});
