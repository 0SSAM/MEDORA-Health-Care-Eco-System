import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const source = readFileSync(resolve(process.cwd(), "client/src/pages/Home.tsx"), "utf8");

describe("Home capture-protection audit bridge contract", () => {
  it("subscribes to the local risk event and routes it through the typed operations mutation", () => {
    expect(source).toContain("trpc.operations.logCaptureRisk.useMutation().mutate");
    expect(source).toContain('window.addEventListener("medora:capture-risk", onCaptureRisk)');
    expect(source).toContain('window.removeEventListener("medora:capture-risk", onCaptureRisk)');
  });

  it("fails closed until a complete scope exists and accepts legal jurisdiction zero", () => {
    expect(source).toContain("hasOrganizationBranchJurisdictionScope(selectedOrganizationId, activeBranchId, activeJurisdictionId)");
    expect(source).toContain("activeJurisdictionId === null");
    expect(source).not.toContain("!activeJurisdictionId");
  });

  it("allowlists the risk type and forwards only the minimized scoped payload", () => {
    expect(source).toContain("CAPTURE_RISK_REASONS.includes(candidate.reason as CaptureRiskReason)");
    expect(source).toContain("organizationId: selectedOrganizationId");
    expect(source).toContain("branchId: activeBranchId");
    expect(source).toContain("jurisdictionId: activeJurisdictionId");
    expect(source).toContain("riskType,");
    expect(source).toContain("occurredAt: candidate.occurredAt");
    expect(source).not.toContain("clipboardContent");
    expect(source).not.toContain("deviceFingerprint");
  });
});
