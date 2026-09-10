import { describe, expect, it } from "vitest";
import { assertVatInvoiceReady, calculateVatInvoice } from "./vat-invoice-policy";

const context = {
  countryCode: "EG",
  currencyCode: "EGP",
  rulesVerified: true,
  ratesVerified: true,
  roundingRulesVerified: true,
  invoiceIdentityVerified: true,
  taxRegistrationReference: "EG-TAX-PENDING-CONFIG",
} as const;

describe("VAT invoice policy", () => {
  it("fails closed until all jurisdiction readiness gates are verified", () => {
    expect(() => assertVatInvoiceReady({ ...context, ratesVerified: false })).toThrow(/readiness/);
    expect(() => assertVatInvoiceReady({ ...context, taxRegistrationReference: null })).toThrow(/readiness/);
  });

  it("calculates verified taxable and exempt lines with reconciled totals", () => {
    const result = calculateVatInvoice(context, [
      { sku: "MED-1", quantity: 2, unitPrice: 100, vatRule: { code: "STANDARD", rate: 14, exempt: false, verified: true } },
      { sku: "MED-2", quantity: 1, unitPrice: 50, vatRule: { code: "EXEMPT", rate: 0, exempt: true, verified: true } },
    ]);
    expect(result.subtotal).toBe(250);
    expect(result.vatAmount).toBe(28);
    expect(result.total).toBe(278);
  });

  it("rejects unverified rates and invalid discounts", () => {
    expect(() => calculateVatInvoice(context, [{ sku: "X", quantity: 1, unitPrice: 10, vatRule: { code: "X", rate: 14, exempt: false, verified: false } }])).toThrow(/VAT rule/);
    expect(() => calculateVatInvoice(context, [{ sku: "X", quantity: 1, unitPrice: 10, discountAmount: 11, vatRule: { code: "X", rate: 14, exempt: false, verified: true } }])).toThrow(/discount/);
  });
});
