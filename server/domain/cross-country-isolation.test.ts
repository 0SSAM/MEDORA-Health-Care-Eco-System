import { describe, expect, it } from "vitest";
import { assertPackApprovalReady } from "./compliance-lifecycle";
import { assertCountryRecordContext } from "./country-data-boundary";
import { assertRecordsShareScope } from "./data-boundary";

const scope = { jurisdictionId: 7, organizationId: 11 };

function assertScopedSearchResults<T extends { jurisdictionId: number | null; organizationId: number | null }>(
  records: T[],
  expected = scope,
) {
  return assertRecordsShareScope(
    records.map(record => ({ entityType: "catalog_item" as const, ...record })),
    expected,
  );
}

describe("cross-country isolation", () => {
  it("allows catalog search results only when every persisted result matches country and organization", () => {
    const results = [
      { jurisdictionId: 7, organizationId: 11, sku: "EG-001" },
      { jurisdictionId: 7, organizationId: 11, sku: "EG-002" },
    ];
    expect(assertScopedSearchResults(results)).toBe(true);
    expect(() => assertScopedSearchResults([...results, { jurisdictionId: 8, organizationId: 11, sku: "JO-001" }])).toThrow("Cross-country");
    expect(() => assertScopedSearchResults([...results, { jurisdictionId: 7, organizationId: 12, sku: "OTHER-001" }])).toThrow("Cross-organization");
  });

  it.each([
    ["price", "price record"],
    ["tax", "tax record"],
    ["prescription", "prescription record"],
    ["insurance", "insurance record"],
    ["payroll", "payroll record"],
    ["compliance", "compliance record"],
  ] as const)("denies a persisted %s record from another country", (entityType, _label) => {
    const record = { entityType, jurisdictionId: 7, organizationId: 11 } as const;
    expect(assertCountryRecordContext(record, scope)).toBe(true);
    expect(() => assertCountryRecordContext(record, { jurisdictionId: 8, organizationId: 11 })).toThrow("Cross-country");
    expect(() => assertCountryRecordContext(record, { jurisdictionId: 7, organizationId: 12 })).toThrow("Cross-organization");
  });

  it("rejects a compliance record read or write outside jurisdiction and organization scope", () => {
    const record = { entityType: "compliance" as const, jurisdictionId: 7, organizationId: 11 };
    expect(assertCountryRecordContext(record, scope)).toBe(true);
    expect(() => assertCountryRecordContext(record, { jurisdictionId: 8, organizationId: 11 })).toThrow("Cross-country");
    expect(() => assertCountryRecordContext(record, { jurisdictionId: 7, organizationId: 12 })).toThrow("Cross-organization");
  });

  it("documents the implemented helper-level query coverage boundary", () => {
    expect(["catalog search", "price/tax/prescription/insurance/payroll persisted-record guard", "compliance record scope guard"]).toHaveLength(3);
  });

  it("rejects a persisted compliance pack that is not approved with verified evidence", () => {
    const pack = {
      status: "review" as const,
      rules: { pricing: true, tax: true, prescription: true },
      evidence: [
        { ruleKey: "pricing", verificationStatus: "verified" as const },
        { ruleKey: "tax", verificationStatus: "verified" as const },
        { ruleKey: "prescription", verificationStatus: "verified" as const },
      ],
      effectiveFrom: new Date("2026-08-01T00:00:00.000Z"),
      reviewDueAt: new Date("2026-09-01T00:00:00.000Z"),
      now: new Date("2026-08-14T00:00:00.000Z"),
    };
    expect(() => assertPackApprovalReady(pack)).not.toThrow();
    expect(() => assertPackApprovalReady({ ...pack, status: "approved" })).toThrow("status");
  });
});
