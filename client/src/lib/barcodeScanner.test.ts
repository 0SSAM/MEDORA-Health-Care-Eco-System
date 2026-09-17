import { describe, expect, it } from "vitest";
import { classifyScan, createScanPayload, scanLookupCandidates } from "./barcodeScanner";

describe("barcode and Data Matrix scan contracts", () => {
  it("preserves GS1/Data Matrix payloads losslessly", () => {
    const raw = "010123456789012817250101\u001d102LOT-42";
    const payload = createScanPayload(raw, { source: "camera", symbology: classifyScan(raw) });

    expect(payload?.raw).toBe(raw);
    expect(payload?.symbology).toBe("data-matrix");
    expect(payload?.source).toBe("camera");
    expect(scanLookupCandidates(payload!)[0]).toBe(raw);
  });

  it("retains scanner prefixes only as secondary lookup candidates", () => {
    const raw = "]d20101234567890128";
    const payload = createScanPayload(raw, { source: "hardware", symbology: classifyScan(raw) });

    expect(classifyScan(raw)).toBe("data-matrix");
    expect(scanLookupCandidates(payload!)).toEqual([raw, "0101234567890128"]);
  });

  it("adds only secondary framing and case candidates for ordinary barcode lookup", () => {
    const raw = "  ab-c 123\r\n";
    const payload = createScanPayload(raw, { source: "hardware", symbology: "barcode" });

    expect(scanLookupCandidates(payload!)).toEqual([raw, "ab-c 123", "ab-c123", "AB-C123"]);
    expect(payload?.raw).toBe(raw);
  });

  it("does not structurally normalize Data Matrix lookup candidates", () => {
    const raw = "]d20101234567890128\u001d10LOT-a";
    const payload = createScanPayload(raw, { source: "hardware", symbology: classifyScan(raw) });

    expect(scanLookupCandidates(payload!)).toEqual([raw, "0101234567890128\u001d10LOT-a"]);
  });

  it("rejects empty payloads safely", () => {
    expect(createScanPayload("", { source: "manual" })).toBeNull();
  });
});
