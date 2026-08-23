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

  it("rejects empty payloads safely", () => {
    expect(createScanPayload("", { source: "manual" })).toBeNull();
  });
});
