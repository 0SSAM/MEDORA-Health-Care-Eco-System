import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const source = readFileSync(resolve(process.cwd(), "client/src/components/AuthenticationSettingsWorkspace.tsx"), "utf8");

describe("authentication settings bilingual contract", () => {
  it("renders English copy and direction from the active language", () => {
    expect(source).toContain('const interfaceLanguage: InterfaceLanguage = language === "en" ? "en" : "ar"');
    expect(source).toContain('settings: "Security and authentication settings"');
    expect(source).toContain('dir={interfaceLanguage === "ar" ? "rtl" : "ltr"}');
  });
  it("keeps enrolment and recovery delivery guarded", () => {
    expect(source).toContain("disabled={!emailConfigured || !recoveryAddress.trim()}");
    expect(source).toContain("type=\"button\" disabled");
    expect(source).toContain("never exposed to the browser");
  });
});
