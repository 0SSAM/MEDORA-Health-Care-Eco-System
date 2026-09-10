import { describe, expect, it } from "vitest";
import { assertAuditEventReady, auditEventReadiness, type AuditEventContext } from "./audit-event-policy";

const complete: AuditEventContext = {
  actorIdentityVerified: true,
  organizationScopeVerified: true,
  branchJurisdictionScopeVerified: true,
  eventClassificationVerified: true,
  utcTimestampVerified: true,
  tamperEvidenceConfigured: true,
};

describe("audit event readiness", () => {
  it("blocks incomplete regulated audit events", () => {
    expect(auditEventReadiness(null)).toBe("BLOCKED");
    expect(auditEventReadiness({ ...complete, actorIdentityVerified: false })).toBe("BLOCKED");
    expect(auditEventReadiness({ ...complete, utcTimestampVerified: false })).toBe("BLOCKED");
    expect(() => assertAuditEventReady({ ...complete, tamperEvidenceConfigured: false })).toThrow(/not ready/);
  });

  it("allows an audit event only when every integrity gate is verified", () => {
    expect(auditEventReadiness(complete)).toBe("READY");
    expect(assertAuditEventReady(complete)).toBe(true);
  });
});
