import { describe, expect, it } from "vitest";
import { buildElBazLabelHtml, buildElBazReceiptHtml } from "./elBazPrintTemplates";

describe("El-Baz print contracts", () => {
  it("renders the supplied pharmacy identity and both contact channels", () => {
    const html = buildElBazReceiptHtml({
      invoiceNumber: "INV-TEST-001",
      date: "2026-09-07",
      cashier: "Cashier",
      lines: [{ name: "Test item", qty: 1, unitPrice: 100, total: 100 }],
      total: 100,
    });
    expect(html).toContain("El-Baz Pharmacy");
    expect(html).toContain("صيدلية الباز");
    expect(html).toContain("0502243574");
    expect(html).toContain("WhatsApp 01040716080");
    expect(html).toContain("Dr. Nouran Tarek");
  });

  it("escapes user-controlled printable fields", () => {
    const html = buildElBazLabelHtml({
      productNameAr: "<script>alert(1)</script>",
      productNameEn: "A & B",
      sku: "SKU<&",
      batchNumber: "BATCH\"1",
      expiryDate: "2028-09-01",
      barcode: "6220000000001",
    });
    expect(html).not.toContain("<script>");
    expect(html).toContain("&lt;script&gt;alert(1)&lt;/script&gt;");
    expect(html).toContain("A &amp; B");
    expect(html).toContain("SKU&lt;&amp;");
    expect(html).toContain("BATCH&quot;1");
  });
});
