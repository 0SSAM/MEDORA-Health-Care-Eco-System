import { describe, expect, it } from "vitest";
import { classifyScan, createScanPayload, parseKeyboardWedgeSequence, scanLookupCandidates } from "../client/src/lib/barcodeScanner";

describe("universal barcode scanner contract", () => {
  it("preserves the complete Data Matrix payload byte-for-byte", () => {
    const raw = "]d2010950123456789017\u001d10BATCH-α/42\u001d21SERIAL-0007";
    const payload = createScanPayload(raw, { source: "hardware" });
    expect(payload).not.toBeNull();
    expect(payload?.raw).toBe(raw);
    expect(payload?.symbology).toBe("unknown");
    expect(classifyScan(raw)).toBe("data-matrix");
  });

  it("keeps exact raw lookup first and only derives a scanner-prefix candidate", () => {
    const raw = "]d212345";
    const payload = createScanPayload(raw, { symbology: "data-matrix", source: "simulated", capturedAt: "2026-08-16T00:00:00.000Z" });
    expect(payload).toMatchObject({ raw, symbology: "data-matrix", source: "simulated" });
    expect(scanLookupCandidates(payload!)).toEqual([raw, "12345"]);
  });

  it("rejects empty scans without inventing a value", () => {
    expect(createScanPayload("", { source: "manual" })).toBeNull();
  });

  it("accepts a rapid Bluetooth keyboard-wedge sequence without altering its payload", () => {
    const raw = "]d2010950123456789017\u001d10LOT-α/42";
    const events = [...raw].map((key, index) => ({ key, at: index * 12 }));
    expect(parseKeyboardWedgeSequence(events)).toBe(raw);
  });

  it("rejects slow human typing as a Bluetooth scan", () => {
    const events = [..."123456"].map((key, index) => ({ key, at: index * 180 }));
    expect(parseKeyboardWedgeSequence(events)).toBeNull();
  });
});
