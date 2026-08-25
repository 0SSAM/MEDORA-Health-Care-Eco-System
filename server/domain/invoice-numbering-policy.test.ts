import { describe, expect, it } from "vitest";
import { assertInvoiceNumberingReady, invoiceNumberingReadiness, type InvoiceNumberingContext } from "./invoice-numbering-policy";

const complete: InvoiceNumberingContext = {
  jurisdictionSequenceBound: true,
  fiscalPeriodValid: true,
  sequenceUnique: true,
  gapHandlingConfigured: true,
  auditMetadataConfigured: true,
};

describe("invoice numbering readiness", () => {
  it("blocks missing jurisdiction sequence, fiscal period, uniqueness, gap handling, or audit metadata", () => {
    expect(invoiceNumberingReadiness(null)).toBe("BLOCKED");
    expect(invoiceNumberingReadiness({ ...complete, jurisdictionSequenceBound: false })).toBe("BLOCKED");
    expect(invoiceNumberingReadiness({ ...complete, fiscalPeriodValid: false })).toBe("BLOCKED");
    expect(() => assertInvoiceNumberingReady({ ...complete, sequenceUnique: false })).toThrow(/not ready/);
  });

  it("allows numbering only when every persistence gate is ready", () => {
    expect(invoiceNumberingReadiness(complete)).toBe("READY");
    expect(assertInvoiceNumberingReady(complete)).toBe(true);
  });
});
