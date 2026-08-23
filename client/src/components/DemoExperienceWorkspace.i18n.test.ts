import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const source = readFileSync(resolve(process.cwd(), "client/src/components/DemoExperienceWorkspace.tsx"), "utf8");

describe("Demo experience bilingual and isolation contract", () => {
  it("uses the active language for visible copy, direction, dates, and display names", () => {
    expect(source).toContain('const interfaceLanguage: InterfaceLanguage = language === "en" ? "en" : "ar"');
    expect(source).toContain('const dir = interfaceLanguage === "ar" ? "rtl" : "ltr"');
    expect(source).toContain('title: "Demo experience manager"');
    expect(source).toContain('toLocaleString(locale)');
    expect(source).toContain('item.nameEn || item.nameAr');
    expect(source).toContain('<div className="space-y-5" dir={dir}>');
  });

  it("keeps catalogue and trial invoices behind the showcase-only gate", () => {
    expect(source).toContain('sessionMode !== "showcase"');
    expect(source).toContain('enabled: Boolean(scope && sessionMode === "showcase")');
    expect(source).toContain('The investor showcase is available in Demo mode only');
  });
});
