import { describe, expect, it } from "vitest";
import { assertInvoiceCatalogScope, generateInvoiceDocument, requireInvoiceIntegration, validateInvoiceDocument, type InvoiceAdapter } from "./invoicing-policy";

const readiness = {
  specificationsVerified: true,
  credentialsConfigured: true,
  organizationRegistered: true,
  humanAccepted: true,
  endpointContractVerified: true,
  acknowledgementContractVerified: true,
  retrySafetyVerified: true,
  auditMetadataVerified: true,
};
const adapter: InvoiceAdapter = { countryCode: "SA", readiness, submit: async () => ({ externalId: "x", status: "submitted" }) };
const rules = { invoicing: { integration: true, endpoint: "https://official.example/invoice" } } as const;

describe("invoicing policy", () => {
  it("rejects a missing verified country adapter", () => {
    expect(() => requireInvoiceIntegration(rules, "SA")).toThrow(/adapter/);
    expect(() => requireInvoiceIntegration(rules, "EG", adapter)).toThrow(/adapter/);
  });

  it("accepts only a country-matched adapter and a fully ready adapter", () => {
    expect(requireInvoiceIntegration(rules, "SA", adapter).endpoint).toContain("official");
    expect(() => requireInvoiceIntegration(rules, "SA", { ...adapter, readiness: { ...readiness, auditMetadataVerified: false } })).toThrow(/readiness/);
    expect(validateInvoiceDocument({ invoiceNumber: "INV-1", currencyCode: "SAR", subtotal: 100, discountAmount: 7, totalAmount: 93, items: [{ sku: "A", quantity: 1, unitPrice: 100 }] }).totalAmount).toBe(93);
  });

  it("rejects an unreconciled invoice", () => {
    expect(() => validateInvoiceDocument({ invoiceNumber: "INV-1", currencyCode: "SAR", subtotal: 100, discountAmount: 7, totalAmount: 94, items: [{ sku: "A", quantity: 1, unitPrice: 100 }] })).toThrow(/reconcile/);
  });

  it("requires matching jurisdiction, organization, approval, and evidence for invoice catalog use", () => {
    const valid = { jurisdictionId: 1, organizationId: 7, catalogJurisdictionId: 1, catalogOrganizationId: 7, catalogVerificationStatus: "approved" as const, verifiedEvidenceCount: 1 };
    expect(assertInvoiceCatalogScope(valid)).toBe(true);
    expect(() => assertInvoiceCatalogScope({ ...valid, catalogOrganizationId: 8 })).toThrow(/outside/);
    expect(() => assertInvoiceCatalogScope({ ...valid, catalogVerificationStatus: "pending" })).toThrow(/approved/);
    expect(() => assertInvoiceCatalogScope({ ...valid, verifiedEvidenceCount: 0 })).toThrow(/evidence/);
  });

  it("rejects invoice catalog scope without tenant or jurisdiction", () => {
    expect(() => assertInvoiceCatalogScope({ jurisdictionId: null, organizationId: 7, catalogJurisdictionId: null, catalogOrganizationId: 7, catalogVerificationStatus: "approved", verifiedEvidenceCount: 1 })).toThrow(/scope/);
  });

  it("generates only a reconciled invoice with approved same-scope catalog evidence", () => {
    const input = {
      document: { invoiceNumber: "INV-2", currencyCode: "EGP", subtotal: 250, discountAmount: 10, totalAmount: 240, items: [{ sku: "EG-1", quantity: 2, unitPrice: 125 }] },
      catalogScope: { jurisdictionId: 4, organizationId: 12, catalogJurisdictionId: 4, catalogOrganizationId: 12, catalogVerificationStatus: "approved" as const, verifiedEvidenceCount: 3 },
    };
    expect(generateInvoiceDocument(input).invoiceNumber).toBe("INV-2");
    expect(() => generateInvoiceDocument({ ...input, catalogScope: { ...input.catalogScope, catalogJurisdictionId: 5 } })).toThrow(/outside/);
    expect(() => generateInvoiceDocument({ ...input, catalogScope: { ...input.catalogScope, verifiedEvidenceCount: 0 } })).toThrow(/evidence/);
    expect(() => generateInvoiceDocument({ ...input, document: { ...input.document, totalAmount: 241 } })).toThrow(/reconcile/);
  });
});
