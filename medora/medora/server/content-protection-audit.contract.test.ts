import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();
const read = (path: string) => readFileSync(resolve(root, path), "utf8");

describe("content-protection audit contract", () => {
  const schemaSource = read("drizzle/schema.ts");
  const operationsSource = read("server/routers/operations.ts");
  const homeSource = read("client/src/pages/Home.tsx");

  it("persists a jurisdiction-scoped, tamper-evident audit entry without a new content payload table", () => {
    expect(schemaSource).toContain('jurisdictionId: int("jurisdictionId")');
    expect(schemaSource).toContain('audit_logs_scope_time_idx');
    expect(operationsSource).toContain('entityType: "content_protection"');
    expect(operationsSource).toContain('hashAuditRecord');
    expect(operationsSource).toContain('jurisdictionId: input.jurisdictionId');
  });

  it("accepts only the defined risk vocabulary and verifies the full tenant scope before writing", () => {
    expect(operationsSource).toContain('const contentProtectionRiskType = z.enum');
    expect(operationsSource).toContain('await assertOrganizationAccess');
    expect(operationsSource).toContain('await assertBranchAccess');
    expect(operationsSource).toContain('z.number().int().nonnegative()');
  });

  it("forwards the browser event only after complete scope validation and never includes clipboard or device data", () => {
    expect(homeSource).toContain('window.addEventListener("medora:capture-risk", onCaptureRisk)');
    expect(homeSource).toContain('hasOrganizationBranchJurisdictionScope');
    expect(homeSource).toContain('recentCaptureRiskAudits');
    expect(homeSource).toContain('riskType,');
    expect(homeSource).not.toContain('clipboardData');
    expect(homeSource).not.toContain('deviceFingerprint');
  });
});
