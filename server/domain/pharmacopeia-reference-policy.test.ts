import { describe, expect, it } from "vitest";
import {
  EGYPTIAN_PHARMACOPEIA_AUTHORITY_REFERENCE,
  REGIONAL_ARAB_PHARMACOPEIA_PENDING,
  assertPharmacopeiaReference,
  canReferenceApproveCommercialProduct,
  canUsePharmacopeiaReference,
  type PharmacopeiaReference,
} from "./pharmacopeia-reference-policy";

const egyptianReference: PharmacopeiaReference = {
  ...EGYPTIAN_PHARMACOPEIA_AUTHORITY_REFERENCE,
  edition: "verified-edition-placeholder",
  effectiveDate: "2025-01-01",
  accessStatus: "verified_open",
  monographId: "monograph-001",
  verifiedAt: "2026-08-15",
  purposes: ["quality_specification", "identity_and_assay", "pharmacist_reference", "regulatory_evidence_review"],
};

describe("pharmacopeia reference policy", () => {
  it("accepts an Egyptian authority reference for a scoped Egyptian quality review", () => {
    expect(canUsePharmacopeiaReference(egyptianReference, {
      jurisdiction: "EG",
      purpose: "quality_specification",
      requestedMonographId: "monograph-001",
      now: "2026-08-15",
    })).toBe(true);
  });

  it("rejects a pending regional reference because it is not authoritative or licensed", () => {
    expect(canUsePharmacopeiaReference({
      ...REGIONAL_ARAB_PHARMACOPEIA_PENDING,
      edition: null,
      effectiveDate: null,
      sourceUrl: null,
      verifiedAt: null,
      purposes: [],
      monographId: null,
    }, {
      jurisdiction: "EG",
      purpose: "quality_specification",
      now: "2026-08-15",
    })).toBe(false);
  });

  it("rejects a reference whose jurisdiction is not the requested country", () => {
    expect(canUsePharmacopeiaReference({ ...egyptianReference, jurisdiction: "JO" }, {
      jurisdiction: "EG",
      purpose: "identity_and_assay",
      now: "2026-08-15",
    })).toBe(false);
  });

  it("fails closed for a future effective date and reports the missing reason", () => {
    expect(() => assertPharmacopeiaReference({ ...egyptianReference, effectiveDate: "2027-01-01" }, {
      jurisdiction: "EG",
      purpose: "quality_specification",
      now: "2026-08-15",
    })).toThrow(/effectiveDateValidity/);
  });

  it("never treats a pharmacopeia reference as commercial product registration", () => {
    expect(canReferenceApproveCommercialProduct()).toBe(false);
  });
});
