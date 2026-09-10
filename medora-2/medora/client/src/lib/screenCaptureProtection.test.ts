import { describe, expect, it } from "vitest";
import { CAPTURE_RISK_REASONS, buildCaptureWatermark, isCaptureSensitiveReason, shouldBlockProtectedShortcut, shouldRedactDocument } from "./screenCaptureProtection";

describe("screenCaptureProtection", () => {
  it("builds a scoped deterrent watermark without leaking an empty identity", () => {
    expect(buildCaptureWatermark("مستخدم", "فرع القاهرة")).toBe("MEDORA · مستخدم · فرع القاهرة");
    expect(buildCaptureWatermark("", "")).toContain("مستخدم مصرح");
  });

  it("recognizes every defined capture or exfiltration risk reason", () => {
    expect(CAPTURE_RISK_REASONS).toContain("page-lifecycle");
    expect(CAPTURE_RISK_REASONS).toContain("capture-shortcut");
    expect(CAPTURE_RISK_REASONS).toContain("copy");
    expect(CAPTURE_RISK_REASONS.every(isCaptureSensitiveReason)).toBe(true);
  });

  it("redacts a hidden document and blocks protected print, copy, and system capture shortcuts", () => {
    expect(shouldRedactDocument("hidden")).toBe(true);
    expect(shouldRedactDocument("visible")).toBe(false);
    expect(shouldBlockProtectedShortcut("p", true, false)).toBe(true);
    expect(shouldBlockProtectedShortcut("c", false, true)).toBe(true);
    expect(shouldBlockProtectedShortcut("PrintScreen", false, false)).toBe(true);
    expect(shouldBlockProtectedShortcut("v", true, false)).toBe(false);
  });
});
