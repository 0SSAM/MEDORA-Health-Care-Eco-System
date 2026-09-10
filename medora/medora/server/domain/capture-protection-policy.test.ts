import { describe, expect, it } from "vitest";
import { evaluateCaptureProtection, isCaptureShortcut, watermarkPayload } from "./capture-protection-policy";

describe("capture-protection-policy", () => {
  it("electron enables OS-level block", () => {
    const d = evaluateCaptureProtection("electron");
    expect(d.osBlock).toBe(true);
    expect(d.mitigations).toContain("os_setContentProtection_true");
  });
  it("mobile enables platform FLAG_SECURE", () => {
    expect(evaluateCaptureProtection("mobile").mitigations).toContain("platform_flag_secure");
  });
  it("web cannot hard-block and states residual risk", () => {
    const d = evaluateCaptureProtection("web");
    expect(d.osBlock).toBe(false);
    expect(d.residualRisk.length).toBeGreaterThan(10);
  });
  it("shortcut detection covers printscreen & mac capture", () => {
    expect(isCaptureShortcut("PrintScreen", false, false, false)).toBe(true);
    expect(isCaptureShortcut("4", true, false, true)).toBe(true);
    expect(isCaptureShortcut("a", false, false, false)).toBe(false);
  });
  it("watermark payload is attributable", () => {
    const w = watermarkPayload(7, 1, 1724800000000);
    expect(w).toContain("u7");
    expect(w).toContain("o1");
  });
});
