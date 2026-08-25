import { requireRegionalRule, type RegionalRuleSet } from "./regional-rules";
import { externalAdapterReadiness, type ExternalAdapterReadinessInput } from "./external-adapter-policy";

export type InvoiceDocument = {
  invoiceNumber: string;
  currencyCode: string;
  subtotal: number;
  discountAmount: number;
  totalAmount: number;
  items: Array<{ sku: string; quantity: number; unitPrice: number }>;
};

export type InvoiceAdapter = {
  countryCode: string;
  readiness: ExternalAdapterReadinessInput;
  submit: (document: InvoiceDocument) => Promise<{ externalId: string; status: "submitted" | "accepted" | "rejected" }>;
};

export function requireInvoiceIntegration(rules: RegionalRuleSet, countryCode: string, adapter?: InvoiceAdapter) {
  const configured = requireRegionalRule(rules, "invoicing", "integration");
  if (configured !== true) throw new Error("Regional e-invoicing integration is not enabled by the approved pack");
  const endpoint = requireRegionalRule(rules, "invoicing", "endpoint");
  if (typeof endpoint !== "string" || endpoint.length < 1) throw new Error("Regional e-invoicing endpoint is missing");
  if (!adapter || adapter.countryCode !== countryCode) throw new Error("No verified e-invoicing adapter is registered for this country");
  if (externalAdapterReadiness(adapter.readiness) !== "READY") {
    throw new Error("E-invoicing adapter readiness is incomplete");
  }
  return { endpoint, adapter };
}

export function validateInvoiceDocument(document: InvoiceDocument) {
  if (!document.invoiceNumber.trim() || !document.currencyCode.trim()) throw new Error("Invoice identity is incomplete");
  if (![document.subtotal, document.discountAmount, document.totalAmount].every(value => Number.isFinite(value) && value >= 0)) throw new Error("Invoice amounts must be finite and non-negative");
  if (document.totalAmount !== Number((document.subtotal - document.discountAmount).toFixed(2))) throw new Error("Invoice total does not reconcile");
  if (!document.items.length || document.items.some(item => !item.sku.trim() || !Number.isFinite(item.quantity) || item.quantity <= 0 || !Number.isFinite(item.unitPrice) || item.unitPrice < 0)) throw new Error("Invoice items are invalid");
  return document;
}

export type InvoiceCatalogScope = {
  jurisdictionId: number | null | undefined;
  organizationId: number | null | undefined;
  catalogJurisdictionId: number | null | undefined;
  catalogOrganizationId: number | null | undefined;
  catalogVerificationStatus: "approved" | "pending" | "rejected";
  verifiedEvidenceCount: number;
};

/**
 * Invoice adapters must call this at regulated invoice creation time. It is
 * deliberately pure so a future persistence procedure cannot bypass the
 * jurisdiction/tenant/evidence boundary while remaining easy to test.
 */
export function assertInvoiceCatalogScope(scope: InvoiceCatalogScope) {
  if (!Number.isInteger(scope.jurisdictionId) || !Number.isInteger(scope.organizationId)) {
    throw new Error("Invoice jurisdiction and organization scope are required");
  }
  if (scope.catalogJurisdictionId !== scope.jurisdictionId || scope.catalogOrganizationId !== scope.organizationId) {
    throw new Error("Invoice catalog record is outside the active jurisdiction and organization");
  }
  if (scope.catalogVerificationStatus !== "approved") throw new Error("Invoice catalog record is not approved");
  if (!Number.isInteger(scope.verifiedEvidenceCount) || scope.verifiedEvidenceCount < 1) {
    throw new Error("Invoice catalog evidence is missing");
  }
  return true as const;
}


export type InvoiceGenerationInput = {
  document: InvoiceDocument;
  catalogScope: InvoiceCatalogScope;
};

/**
 * Validates the complete local invoice boundary before persistence or external submission.
 * No government endpoint is contacted here; adapters remain credential- and pack-gated.
 */
export function generateInvoiceDocument(input: InvoiceGenerationInput) {
  assertInvoiceCatalogScope(input.catalogScope);
  return validateInvoiceDocument(input.document);
}
