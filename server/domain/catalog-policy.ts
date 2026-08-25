export type CatalogCategory = "medicine" | "cosmetic" | "medical_supply";

export type CatalogEvidenceRecord = {
  catalogField: string | null;
  verificationStatus: "unverified" | "review" | "verified" | "rejected";
};

export function requiredCatalogEvidenceFields(category: CatalogCategory, additionalFields: string[] = []) {
  return Array.from(new Set(["nameAr", "category", "sku", ...(category === "medicine" ? ["registrationNumber"] : []), ...additionalFields]));
}

export function activeCatalogFields(item: Record<string, unknown>, category: CatalogCategory) {
  const fields = ["nameAr", "category", "sku", "barcode", "nameEn", "genericName", "manufacturer", "registrationNumber", "sourceAuthority", "sourceRecordId", "sourceUrl"];
  return fields.filter(field => item[field] !== null && item[field] !== undefined && String(item[field]).trim() !== "");
}

export function missingCatalogEvidence(category: CatalogCategory, evidence: CatalogEvidenceRecord[], additionalFields: string[] = []) {
  const verifiedFields = new Set(evidence.filter(item => item.verificationStatus === "verified" && item.catalogField).map(item => item.catalogField));
  return requiredCatalogEvidenceFields(category, additionalFields).filter(field => !verifiedFields.has(field));
}

export function canApproveCatalogItem(category: CatalogCategory, evidence: CatalogEvidenceRecord[], additionalFields: string[] = []) {
  return missingCatalogEvidence(category, evidence, additionalFields).length === 0;
}

export function assertCatalogEvidence(category: CatalogCategory, evidence: CatalogEvidenceRecord[], additionalFields: string[] = []) {
  const missing = missingCatalogEvidence(category, evidence, additionalFields);
  if (missing.length) throw new Error(`Missing verified catalog evidence: ${missing.join(", ")}`);
  return true as const;
}

export type ConsumableCatalogContext = {
  productCatalogItemId: number | null;
  catalogItemId: number;
  productJurisdictionId: number | null;
  catalogJurisdictionId: number;
  catalogStatus: "pending" | "approved" | "rejected";
  category: CatalogCategory;
  item: Record<string, unknown>;
  evidence: CatalogEvidenceRecord[];
  additionalRequiredFields?: string[];
};

export function assertConsumableCatalogContext(context: ConsumableCatalogContext) {
  if (context.productCatalogItemId === null || context.productCatalogItemId !== context.catalogItemId) {
    throw new Error("Product is not linked to the requested catalog record");
  }
  if (context.productJurisdictionId === null || context.productJurisdictionId !== context.catalogJurisdictionId) {
    throw new Error("Product and catalog jurisdiction mismatch");
  }
  if (context.catalogStatus !== "approved") throw new Error("Catalog item is not approved");
  const activeFields = activeCatalogFields(context.item, context.category);
  assertCatalogEvidence(context.category, context.evidence, [
    ...activeFields.filter(field => !requiredCatalogEvidenceFields(context.category, context.additionalRequiredFields).includes(field)),
    ...(context.additionalRequiredFields ?? []),
  ]);
  return true as const;
}

/**
 * Guard for a future prescription/dispensing product-consumption entry point.
 * The current prescription workflow stores extracted text only; it must call
 * this guard when a product is actually matched before regulated consumption.
 */
export function assertPrescriptionCatalogConsumption(context: ConsumableCatalogContext) {
  return assertConsumableCatalogContext(context);
}
