import { describe, expect, it } from "vitest";
import { activeCatalogFields, assertCatalogEvidence, assertConsumableCatalogContext, assertPrescriptionCatalogConsumption, canApproveCatalogItem, missingCatalogEvidence } from "./catalog-policy";

describe("catalog evidence policy", () => {
  it("requires registration evidence for medicines", () => {
    const evidence = ["nameAr", "category", "sku"].map(catalogField => ({ catalogField, verificationStatus: "verified" as const }));
    expect(missingCatalogEvidence("medicine", evidence)).toEqual(["registrationNumber"]);
    expect(canApproveCatalogItem("medicine", evidence)).toBe(false);
  });

  it("accepts a fully evidenced cosmetic item", () => {
    const evidence = ["nameAr", "category", "sku"].map(catalogField => ({ catalogField, verificationStatus: "verified" as const }));
    expect(canApproveCatalogItem("cosmetic", evidence)).toBe(true);
    expect(assertCatalogEvidence("cosmetic", evidence)).toBe(true);
  });

  it("requires every active catalog field and pack-specific field to have evidence", () => {
    const item = { nameAr: "دواء", category: "medicine", sku: "SKU-1", manufacturer: "Manufacturer", sourceAuthority: "Official Authority" };
    const fields = activeCatalogFields(item, "medicine");
    expect(fields).toContain("manufacturer");
    expect(missingCatalogEvidence("medicine", [{ catalogField: "nameAr", verificationStatus: "verified" }], ["manufacturer"])).toContain("manufacturer");
    expect(() => assertCatalogEvidence("medicine", fields.map(catalogField => ({ catalogField, verificationStatus: "verified" as const })), ["countrySpecificRegistrationField"])).toThrow("countrySpecificRegistrationField");
  });

  it("does not count review evidence as verified", () => {
    const evidence = ["nameAr", "category", "sku"].map(catalogField => ({ catalogField, verificationStatus: "review" as const }));
    expect(() => assertCatalogEvidence("medical_supply", evidence)).toThrow("Missing verified catalog evidence");
  });

  it("accepts a linked approved product only with same-jurisdiction verified evidence", () => {
    const item = { nameAr: "دواء", category: "cosmetic", sku: "SKU-1", manufacturer: "Manufacturer" };
    const evidence = activeCatalogFields(item, "cosmetic").map(catalogField => ({ catalogField, verificationStatus: "verified" as const }));
    expect(assertConsumableCatalogContext({
      productCatalogItemId: 11,
      catalogItemId: 11,
      productJurisdictionId: 2,
      catalogJurisdictionId: 2,
      catalogStatus: "approved",
      category: "cosmetic",
      item,
      evidence,
    })).toBe(true);
  });

  it("rejects consumption when an active optional field lacks verified evidence", () => {
    const item = { nameAr: "مستلزم", category: "medical_supply", sku: "SKU-2", manufacturer: "مصنع موثق" };
    const evidence = ["nameAr", "category", "sku"].map(catalogField => ({ catalogField, verificationStatus: "verified" as const }));
    expect(() => assertConsumableCatalogContext({ productCatalogItemId: 12, catalogItemId: 12, productJurisdictionId: 2, catalogJurisdictionId: 2, catalogStatus: "approved", category: "medical_supply", item, evidence })).toThrow("manufacturer");
  });

  it("rejects unlinked, unapproved, and cross-jurisdiction catalog consumption", () => {
    const base = {
      productCatalogItemId: 11,
      catalogItemId: 11,
      productJurisdictionId: 2,
      catalogJurisdictionId: 2,
      catalogStatus: "approved" as const,
      category: "medical_supply" as const,
      item: { nameAr: "مستلزم", category: "medical_supply", sku: "SKU-1" },
      evidence: ["nameAr", "category", "sku"].map(catalogField => ({ catalogField, verificationStatus: "verified" as const })),
    };
    expect(() => assertConsumableCatalogContext({ ...base, productCatalogItemId: null })).toThrow("not linked");
    expect(() => assertConsumableCatalogContext({ ...base, catalogStatus: "pending" })).toThrow("not approved");
    expect(() => assertConsumableCatalogContext({ ...base, catalogJurisdictionId: 3 })).toThrow("jurisdiction mismatch");
  });

  it("revalidates prescription and dispensing consumption through the dedicated guard", () => {
    const context = {
      productCatalogItemId: 21,
      catalogItemId: 21,
      productJurisdictionId: 4,
      catalogJurisdictionId: 4,
      catalogStatus: "approved" as const,
      category: "medicine" as const,
      item: { nameAr: "دواء", category: "medicine", sku: "RX-1", registrationNumber: "REG-1" },
      evidence: ["nameAr", "category", "sku", "registrationNumber"].map(catalogField => ({ catalogField, verificationStatus: "verified" as const })),
    };
    expect(assertPrescriptionCatalogConsumption(context)).toBe(true);
    expect(() => assertPrescriptionCatalogConsumption({ ...context, catalogStatus: "rejected" })).toThrow("not approved");
    expect(() => assertPrescriptionCatalogConsumption({ ...context, productJurisdictionId: 9 })).toThrow("jurisdiction mismatch");
    expect(() => assertPrescriptionCatalogConsumption({ ...context, evidence: context.evidence.filter(item => item.catalogField !== "registrationNumber") })).toThrow("registrationNumber");
  });
});
