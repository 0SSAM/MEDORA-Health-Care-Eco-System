import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();
const read = (path: string) => readFileSync(resolve(root, path), "utf8");

describe("MEDORA intellectual-property protection contract", () => {
  it("keeps proprietary licensing and ownership notices at the repository root", () => {
    expect(existsSync(resolve(root, "LICENSE"))).toBe(true);
    expect(existsSync(resolve(root, "NOTICE"))).toBe(true);
    expect(read("LICENSE")).toContain("MEDORA Health Care Eco System");
    expect(read("LICENSE")).toContain("All rights reserved");
    expect(read("NOTICE")).toContain("Intellectual Property Notice");
    expect(read("NOTICE")).toContain("does not transfer ownership");
  });

  it("preserves ownership headers on the sensitive protection and audit implementation", () => {
    for (const path of [
      "server/routers/operations.ts",
      "server/_core/security.ts",
      "client/src/components/ScreenCaptureProtection.tsx",
      "client/src/lib/screenCaptureProtection.ts",
    ]) {
      expect(read(path).startsWith("// © 2024-2026 MEDORA Health Care Eco System.")).toBe(true);
    }
  });

  it("keeps the native plan platform-specific, privacy-minimized, and honest about web limitations", () => {
    const plan = read("docs/security/native-device-protection-research.md");
    expect(plan).toContain("FLAG_SECURE");
    expect(plan).toContain("scene-capture state");
    expect(plan).toContain("ohos.permission.PRIVACY_WINDOW");
    expect(plan).toContain("operations.logCaptureRisk");
    expect(plan).toContain("including legal ID `0`");
    expect(plan).toContain("cannot guarantee prevention");
    expect(plan).toContain("## References");
  });
});
