import { describe, expect, it } from "vitest";
import { assertIsolatedShowcaseSalePolicy, SHOWCASE_NON_REGULATORY_TAX_PROFILE, SHOWCASE_POLICY_SOURCE_URL, SHOWCASE_POLICY_VERSION } from "./showcase-sale-policy";

const now = new Date("2026-08-17T12:00:00.000Z");
const validInput = {
  organizationEnvironment: "showcase",
  taxProfile: SHOWCASE_NON_REGULATORY_TAX_PROFILE,
  pack: {
    packVersion: SHOWCASE_POLICY_VERSION,
    authorityName: "MEDORA Showcase — Synthetic non-regulatory policy",
    sourceUrl: SHOWCASE_POLICY_SOURCE_URL,
    status: "approved",
    effectiveFrom: new Date("2026-01-01T00:00:00.000Z"),
    reviewDueAt: new Date("2027-01-01T00:00:00.000Z"),
    rules: { sale: true, catalog: true },
  },
  evidence: [
    { operation: "sale", verificationStatus: "verified" },
    { operation: "catalog", verificationStatus: "verified" },
  ],
};

describe("isolated showcase sale policy", () => {
  it("permits only an active, labelled synthetic policy with verified simulated evidence", () => {
    expect(assertIsolatedShowcaseSalePolicy(validInput, now)).toEqual({ simulated: true, packVersion: SHOWCASE_POLICY_VERSION });
  });

  it("rejects production scopes and missing evidence rather than treating the simulation as regulatory approval", () => {
    expect(() => assertIsolatedShowcaseSalePolicy({ ...validInput, organizationEnvironment: "production" }, now)).toThrow("outside the isolated showcase environment");
    expect(() => assertIsolatedShowcaseSalePolicy({ ...validInput, evidence: [{ operation: "sale", verificationStatus: "verified" }] }, now)).toThrow("missing verified simulated evidence");
  });
});
