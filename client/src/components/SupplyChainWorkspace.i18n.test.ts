import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const source = readFileSync(resolve(process.cwd(), "client/src/components/SupplyChainWorkspace.tsx"), "utf8");

describe("Supply-chain workspace localization contract", () => {
  it("derives both content and geometry from the active language", () => {
    expect(source).toContain("const { language } = useLocalization()");
    expect(source).toContain('const dir = language === "en" ? "ltr" : "rtl"');
    expect(source).toContain('<div className="space-y-5" dir={dir}>');
    expect(source).not.toContain('dir="rtl"');
  });

  it("keeps English primary labels and advisory-only reorder copy", () => {
    expect(source).toContain('"Demand forecast & reorder"');
    expect(source).toContain('"Search by item ID"');
    expect(source).toContain('"Supply follow-up"');
    expect(source).toContain("This screen never creates purchase orders automatically");
    expect(source).toContain("It is decision support only and requires review");
  });
});
