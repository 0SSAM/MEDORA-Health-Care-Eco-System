// MEDORA | ميدورا — Integrated Health Care System
// Copyright (c) 2026 Hossam Naeim Osman | حسام نعيم عثمان. All rights reserved.
// Proprietary and confidential. Unauthorized copying, distribution, or use of this
// software, or of any portion of it, is strictly prohibited.
// Source: https://github.com/0SSAM/MEDORA-Health-Care-Eco-System
import { describe, expect, it } from "vitest";
import { canExportLocalInvoice, formatTaxInvoiceAmount, sanitizeTaxInvoiceFileName } from "./taxInvoiceDocument";

describe("local tax invoice document contract", () => {
  it("allows export only for a server-issued local invoice", () => {
    expect(canExportLocalInvoice(null)).toBe(false);
    expect(canExportLocalInvoice({ invoiceId: 44, status: "PREVIEW" })).toBe(false);
    expect(canExportLocalInvoice({ invoiceId: 44, status: "ISSUED_LOCAL" })).toBe(true);
    expect(canExportLocalInvoice({ invoiceId: 0, status: "ISSUED_LOCAL" })).toBe(false);
  });

  it("sanitizes invoice numbers before they become download names", () => {
    expect(sanitizeTaxInvoiceFileName("INV/2026 <script>")) .toBe("INV-2026-script");
    expect(sanitizeTaxInvoiceFileName("   ")).toBe("medora-tax-invoice");
    expect(sanitizeTaxInvoiceFileName("فاتورة ١٢٣")).toBe("medora-tax-invoice");
  });

  it("keeps currency formatting deterministic and presentation-only", () => {
    expect(formatTaxInvoiceAmount(123.456, "EGP")).toBe("123.46 EGP");
  });
});
