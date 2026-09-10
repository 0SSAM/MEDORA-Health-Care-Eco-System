import { describe, expect, it } from "vitest";
import {
  ARAB_COUNTRY_REGISTRY,
  assertCompliancePackUsable,
  assertJurisdictionProfileReady,
  assertSameJurisdiction,
  normalizeCountryCode,
  selectCurrentCompliancePack,
} from "./regional-engine";

const profile = {
  countryCode: "EG",
  active: true,
  legalAuthorityProfile: "EDA_ETA_MOH",
  language: "ar",
  defaultLocale: "ar-EG",
  currencyCode: "EGP",
  timezone: "Africa/Cairo",
  taxProfile: "ETA_EINVOICE",
  dateFormat: "DD/MM/YYYY",
  numberSystem: "arab",
};

const approvedPack = {
  jurisdictionId: 1,
  packVersion: "EG-2026.1",
  status: "approved" as const,
  effectiveFrom: new Date("2026-01-01T00:00:00.000Z"),
  reviewDueAt: new Date("2027-01-01T00:00:00.000Z"),
  rules: { catalog: true, sale: true, prescription: true, dispensing: true, invoice: true },
  evidenceCount: 2,
};

describe("regional engine", () => {
  it("registers all Arab League country codes without enabling unverified rules", () => {
    expect(ARAB_COUNTRY_REGISTRY).toHaveLength(22);
    expect(normalizeCountryCode(" sa ")).toBe("SA");
    expect(() => normalizeCountryCode("US")).toThrow("Unsupported country code");
  });

  it("requires an active, complete jurisdiction profile", () => {
    expect(assertJurisdictionProfileReady(profile)).toBe(true);
    expect(() => assertJurisdictionProfileReady({ ...profile, active: false })).toThrow("not approved");
    expect(() => assertJurisdictionProfileReady({ ...profile, timezone: "" })).toThrow("incomplete");
  });

  it("blocks missing, unapproved, stale, future, and evidence-free packs", () => {
    expect(assertCompliancePackUsable(profile, approvedPack, "sale", new Date("2026-06-01"))).toMatchObject({ countryCode: "EG" });
    expect(() => assertCompliancePackUsable(profile, null, "sale")).toThrow("No compliance pack");
    expect(() => assertCompliancePackUsable(profile, { ...approvedPack, status: "review" }, "sale")).toThrow("human approval");
    expect(() => assertCompliancePackUsable(profile, { ...approvedPack, reviewDueAt: new Date("2026-01-01") }, "sale", new Date("2026-06-01"))).toThrow("stale");
    expect(() => assertCompliancePackUsable(profile, { ...approvedPack, evidenceCount: 0 }, "sale")).toThrow("source evidence");
    expect(() => assertCompliancePackUsable(profile, approvedPack, "insurance")).toThrow("not enabled");
  });

  it("selects the newest effective approved rule version and excludes stale or rolled-back versions", () => {
    const current = selectCurrentCompliancePack([
      { ...approvedPack, packVersion: "EG-2025.4", effectiveFrom: new Date("2025-01-01"), reviewDueAt: new Date("2026-01-01"), createdAt: new Date("2025-01-02") },
      { ...approvedPack, packVersion: "EG-2026.1", createdAt: new Date("2026-01-02") },
      { ...approvedPack, packVersion: "EG-2026.2", status: "rolled_back", effectiveFrom: new Date("2026-05-01"), createdAt: new Date("2026-05-02") },
    ], new Date("2026-06-01"));
    expect(current?.packVersion).toBe("EG-2026.1");
  });

  it("blocks cross-country record access", () => {
    expect(assertSameJurisdiction("EG", "EG")).toBe(true);
    expect(() => assertSameJurisdiction("EG", "SA")).toThrow("Cross-country");
  });
});
