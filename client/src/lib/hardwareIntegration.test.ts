import { describe, expect, it } from "vitest";
import {
  getBrowserFallbacks,
  resolvePrinterPath,
  resolveScannerPath,
  validateReceiptPrintRequest,
} from "./hardwareIntegration";

describe("production hardware integration contracts", () => {
  it("requires a complete scoped receipt request", () => {
    expect(validateReceiptPrintRequest({
      receiptId: "receipt-1",
      scope: { organizationId: 1, branchId: 2, jurisdictionId: 3 },
      content: "MEDORA receipt",
      media: "receipt-80mm",
    })).toMatchObject({ ok: true });
    expect(validateReceiptPrintRequest({
      receiptId: "",
      scope: { organizationId: 1, branchId: 2, jurisdictionId: 3 },
      content: "receipt",
      media: "receipt-80mm",
    })).toMatchObject({ ok: false, code: "invalid-request" });
  });

  it("blocks unapproved or direct browser printer transports", () => {
    expect(resolvePrinterPath(undefined)).toMatchObject({ ok: false, code: "disabled" });
    expect(resolvePrinterPath({ id: "p1", name: "Bridge", transport: "network-ipps", media: "receipt-80mm", state: "pending-approval" })).toMatchObject({ ok: false, code: "not-approved" });
    expect(resolvePrinterPath({ id: "p2", name: "USB", transport: "usb", media: "receipt-80mm", state: "approved" })).toMatchObject({ ok: false, code: "unsupported" });
    expect(resolvePrinterPath({ id: "p3", name: "Approved IPPS", transport: "network-ipps", media: "office-a4", state: "approved" })).toMatchObject({ ok: true });
  });

  it("requires approval for scanners while preserving browser fallbacks", () => {
    expect(resolveScannerPath({ id: "s1", name: "Scanner", transport: "bluetooth", symbologies: ["barcode", "data-matrix"], state: "pending-approval" })).toMatchObject({ ok: false, code: "not-approved" });
    expect(resolveScannerPath({ id: "s2", name: "Approved bridge", transport: "local-bridge", symbologies: ["barcode", "data-matrix"], state: "approved" })).toMatchObject({ ok: true });
    expect(getBrowserFallbacks()).toEqual(expect.arrayContaining(["window.print / PDF download", "camera BarcodeDetector or manual entry", "keyboard-wedge barcode input"]));
  });
});
