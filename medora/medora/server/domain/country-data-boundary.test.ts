import { describe, expect, it } from "vitest";
import { assertCountryBoundRecord, assertCountryRecordContext } from "./country-data-boundary";

describe("country data boundary", () => {
  it("requires both jurisdiction and organization scope", () => {
    expect(assertCountryBoundRecord({ entityType: "medicine", jurisdictionId: 1, organizationId: 4 })).toBe(true);
    expect(() => assertCountryBoundRecord({ entityType: "prescription", jurisdictionId: null, organizationId: 4 })).toThrow("jurisdiction profile");
    expect(() => assertCountryBoundRecord({ entityType: "invoice", jurisdictionId: 1, organizationId: null })).toThrow("organization scope");
  });

  it("rejects cross-country and cross-organization context", () => {
    const record = { entityType: "insurance" as const, jurisdictionId: 1, organizationId: 4 };
    expect(assertCountryRecordContext(record, { jurisdictionId: 1, organizationId: 4 })).toBe(true);
    expect(() => assertCountryRecordContext(record, { jurisdictionId: 2, organizationId: 4 })).toThrow("Cross-country");
    expect(() => assertCountryRecordContext(record, { jurisdictionId: 1, organizationId: 9 })).toThrow("Cross-organization");
  });

  it.each(["medicine", "cosmetic", "medicalSupply", "authority", "tax", "invoice", "price", "prescription", "insurance", "payroll", "label"] as const)("requires compound scope for %s", entityType => {
    const record = { entityType, jurisdictionId: 3, organizationId: 8 };
    expect(assertCountryRecordContext(record, { jurisdictionId: 3, organizationId: 8 })).toBe(true);
    expect(() => assertCountryRecordContext(record, { jurisdictionId: 4, organizationId: 8 })).toThrow("Cross-country");
    expect(() => assertCountryRecordContext(record, { jurisdictionId: 3, organizationId: 12 })).toThrow("Cross-organization");
  });
});
