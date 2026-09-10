import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();
const read = (path: string) => readFileSync(resolve(root, path), "utf8");

describe("native-wrapper protection reference contract", () => {
  it("provides framework-neutral Android, iOS, and HarmonyOS reference controls without treating them as web activation", () => {
    const android = read("native-wrapper-reference/android/MedoraSecureWindowController.kt");
    const ios = read("native-wrapper-reference/ios/MedoraCapturePrivacyController.swift");
    const harmony = read("native-wrapper-reference/harmony/MedoraPrivacyWindowController.ets");
    const gate = read("docs/security/native-wrapper-release-gate.md");

    expect(android).toContain("WindowManager.LayoutParams.FLAG_SECURE");
    expect(android).toContain("registerScreenCaptureCallback");
    expect(ios).toContain("UIScreen.capturedDidChangeNotification");
    expect(ios).toContain("UIApplication.userDidTakeScreenshotNotification");
    expect(harmony).toContain("setWindowPrivacyMode(true)");
    expect(gate).toContain("not active in the web-only release");
    expect(gate).toContain("reference adapter is not activation evidence");
  });

  it("requires minimized scoped audit data and physical-device evidence", () => {
    const gate = read("docs/security/native-wrapper-release-gate.md");
    expect(gate).toContain("operations.logCaptureRisk");
    expect(gate).toContain("jurisdiction ID `0`");
    expect(gate).toContain("never submit pixels, clipboard values, typed content");
    expect(gate).toContain("No physical device or signed wrapper is available");
  });
});
