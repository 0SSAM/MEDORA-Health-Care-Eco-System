import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const source = readFileSync(resolve(import.meta.dirname, "TaxInvoiceWorkspace.tsx"), "utf8");

describe("TaxInvoiceWorkspace localization contract", () => {
  it("switches visible invoice and print copy with the active language and direction", () => {
    expect(source).toContain('const { language, direction } = useLocalization()');
    expect(source).toContain('const isEnglish = language === "en"');
    expect(source).toContain('<div dir={direction} className="space-y-5">');
    expect(source).toContain('openSafePrintWindow({');
    expect(source).toContain('direction,');
    expect(source).not.toContain('dir="rtl"');
    expect(source).toContain('Returns and tax invoices');
    expect(source).toContain('Issue local tax invoice');
    expect(source).toContain('Preview tax invoice before download');
  });

  it("retains guarded local issuance, ETA blocking, and export controls", () => {
    expect(source).toContain('externalSubmission: "BLOCKED_UNTIL_ETA_CREDENTIALS"');
    expect(source).toContain('canExportLocalInvoice(invoiceResult)');
    expect(source).toContain('trpc.erp.pos.issueLocalTaxInvoice.useMutation');
    expect(source).toContain('trpc.erp.pos.previewReturn.useMutation');
  });
});
