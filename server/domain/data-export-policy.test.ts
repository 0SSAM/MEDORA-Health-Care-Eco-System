import { describe, expect, it } from "vitest";
import { assertDataExportReady, dataExportReadiness, type DataExportContext } from "./data-export-policy";

const complete: DataExportContext = {
  subjectVerified: true,
  organizationScopeVerified: true,
  branchJurisdictionScopeVerified: true,
  legalBasisVerified: true,
  minimizationAndRedactionVerified: true,
  auditMetadataConfigured: true,
};

describe("data export readiness", () => {
  it("blocks export when subject, scope, legal basis, redaction, or audit gates are missing", () => {
    expect(dataExportReadiness(null)).toBe("BLOCKED");
    expect(dataExportReadiness({ ...complete, subjectVerified: false })).toBe("BLOCKED");
    expect(dataExportReadiness({ ...complete, legalBasisVerified: false })).toBe("BLOCKED");
    expect(() => assertDataExportReady({ ...complete, minimizationAndRedactionVerified: false })).toThrow(/not ready/);
  });

  it("allows export only when every data-export gate is verified", () => {
    expect(dataExportReadiness(complete)).toBe("READY");
    expect(assertDataExportReady(complete)).toBe(true);
  });
});
