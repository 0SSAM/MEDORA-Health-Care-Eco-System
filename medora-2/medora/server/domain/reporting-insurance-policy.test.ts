import { describe, expect, it } from "vitest";
import { assertReportJurisdictionAccess, authorizeReportRecipient, buildIdempotencyKey, validateReportDefinition } from "./reporting-policy";
import { assertInsuranceRequestScope, assertInsuranceTransition, insuranceIntegrationReadiness, validateInsuranceRequest, type InsuranceRequest } from "./insurance-policy";

const report = {
  code: "inventory.expiry",
  title: "Expiry report",
  organizationId: 10,
  jurisdictionId: 20,
  recipientRoles: ["manager" as const],
  scheduleCron: "0 0 9 * * *",
  deliveryChannel: "in_app" as const,
  queryKey: "inventoryExpirySummary",
  active: true,
  containsSensitiveData: false,
};

const insurance: InsuranceRequest = {
  requestType: "PREAUTHORIZATION",
  organizationId: 10,
  jurisdictionId: 20,
  payerCode: "UHIA",
  memberReference: "member-token",
  serviceCode: "RX-001",
  status: "DRAFT",
  credentialGate: "NOT_CONFIGURED",
};

describe("reporting policy", () => {
  it("accepts assigned jurisdictions and rejects cross-jurisdiction reads", () => {
    expect(() => assertReportJurisdictionAccess(20, [20, 21])).not.toThrow();
    expect(() => assertReportJurisdictionAccess(22, [20, 21])).toThrow("Cross-country report access denied");
    expect(() => assertReportJurisdictionAccess(22, null)).not.toThrow();
  });
  it("accepts a server-owned scoped report and creates a stable idempotency key", () => {
    expect(validateReportDefinition(report)).toBe(true);
    const first = buildIdempotencyKey({ reportCode: report.code, organizationId: 10, jurisdictionId: 20, scheduledForUtc: "2026-08-14T09:00:00Z" });
    const second = buildIdempotencyKey({ reportCode: report.code, organizationId: 10, jurisdictionId: 20, scheduledForUtc: "2026-08-14T09:00:00Z" });
    expect(first).toBe(second);
  });

  it("rejects raw SQL-like query keys and cross-scope recipients", () => {
    expect(() => validateReportDefinition({ ...report, queryKey: "select * from sales" })).toThrow(/server-owned/);
    expect(() => authorizeReportRecipient({ role: "manager", organizationId: 99, jurisdictionId: 20, definition: report, context: { organizationId: 10, jurisdictionId: 20 } })).toThrow(/scope/);
  });
});

describe("insurance policy", () => {
  it("blocks preauthorization submission without configured credentials", () => {
    expect(() => validateInsuranceRequest({ ...insurance, status: "READY_FOR_SUBMISSION" })).toThrow(/credentials/);
  });

  it("requires external reference after submission and enforces scope", () => {
    expect(() => validateInsuranceRequest({ ...insurance, status: "SUBMITTED" })).toThrow(/external reference/);
    expect(() => assertInsuranceRequestScope(insurance, { organizationId: 99, jurisdictionId: 20 })).toThrow(/organization/);
    expect(assertInsuranceRequestScope(insurance, { organizationId: 10, jurisdictionId: 20 })).toBe(true);
  });

  it("allows only explicit lifecycle transitions and reports readiness gates", () => {
    expect(assertInsuranceTransition("DRAFT", "READY_FOR_SUBMISSION")).toBe(true);
    expect(() => assertInsuranceTransition("APPROVED", "SUBMITTED")).toThrow(/transition/);
    expect(insuranceIntegrationReadiness({ credentialsConfigured: false, endpointConfigured: true, organizationRegistered: true, humanApproved: true })).toBe("BLOCKED");
    expect(insuranceIntegrationReadiness({ credentialsConfigured: true, endpointConfigured: true, organizationRegistered: true, humanApproved: true })).toBe("PRODUCTION_READY");
  });
});

import { assertInsuranceTransitionAuthorized, assertPersistedInsuranceTransition, buildInsuranceRequestPayload, hashInsuranceMemberReference } from "./insurance-persistence-policy";

describe("persisted insurance policy", () => {
  it("hashes member references deterministically and stores only a sanitized service payload", () => {
    const hash = hashInsuranceMemberReference(" member-token ");
    expect(hash).toHaveLength(64);
    expect(hash).not.toContain("member-token");
    expect(buildInsuranceRequestPayload(" RX-001 ")).toBe(JSON.stringify({ serviceCode: "RX-001" }));
  });

  it("blocks persisted live submission until production credentials are ready", () => {
    expect(assertPersistedInsuranceTransition("DRAFT", "READY_FOR_SUBMISSION", "NOT_CONFIGURED")).toBe(true);
    expect(() => assertPersistedInsuranceTransition("READY_FOR_SUBMISSION", "SUBMITTED", "TEST_READY")).toThrow(/production credentials/);
    expect(assertPersistedInsuranceTransition("READY_FOR_SUBMISSION", "SUBMITTED", "PRODUCTION_READY")).toBe(true);
  });

  it("requires elevated organization access for lifecycle transitions", () => {
    expect(() => assertInsuranceTransitionAuthorized("staff", "CANCELLED")).toThrow(/elevated organization access/);
    expect(assertInsuranceTransitionAuthorized("operations_manager", "CANCELLED")).toBe(true);
  });

  it("restricts external references to payer submission or decision states", () => {
    expect(() => assertInsuranceTransitionAuthorized("org_admin", "READY_FOR_SUBMISSION", "payer-ref-1")).toThrow(/External reference/);
    expect(assertInsuranceTransitionAuthorized("org_admin", "APPROVED", "payer-ref-1")).toBe(true);
  });
});
