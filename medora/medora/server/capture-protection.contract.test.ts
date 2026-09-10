import { describe, expect, it } from "vitest";
import { buildCaptureWatermark, isCaptureSensitiveReason, shouldRedactDocument } from "../client/src/lib/screenCaptureProtection";

describe("screen capture protection contract", () => {
  it("builds a bounded session watermark without exposing raw business data", () => {
    expect(buildCaptureWatermark("مريم", "فرع العرض · عرض معزول")).toBe("MEDORA · مريم · فرع العرض · عرض معزول");
    expect(buildCaptureWatermark("", "")).toContain("مستخدم مصرح");
  });

  it("redacts when the document is hidden and restores when visible", () => {
    expect(shouldRedactDocument("hidden")).toBe(true);
    expect(shouldRedactDocument("visible")).toBe(false);
  });

  it("recognizes only supported capture-risk signals", () => {
    expect(isCaptureSensitiveReason("visibility-change")).toBe(true);
    expect(isCaptureSensitiveReason("window-blur")).toBe(true);
    expect(isCaptureSensitiveReason("print")).toBe(true);
  });
});
