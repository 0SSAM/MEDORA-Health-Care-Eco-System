import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const source = readFileSync(resolve(process.cwd(), "client/src/components/HardwareWorkspace.tsx"), "utf8");

describe("hardware workspace bilingual contract", () => {
  it("uses language-selected interface copy and logical direction", () => {
    expect(source).toContain('const interfaceLanguage = language === "en" ? "en" : "ar"');
    expect(source).toContain('dir={interfaceLanguage === "ar" ? "rtl" : "ltr"}');
    expect(source).toContain('notEnabled: "Production hardware integration is not enabled"');
  });

  it("keeps hardware operation safely gated rather than simulated", () => {
    expect(source).toContain("Production hardware integration is not enabled");
    expect(source).toContain("approved connector");
    expect(source).not.toContain("onClick");
  });
});
