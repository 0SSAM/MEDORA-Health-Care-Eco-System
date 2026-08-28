import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const source = readFileSync(resolve(process.cwd(), "client/src/components/AccountingLoyaltyWorkspace.tsx"), "utf8");

describe("AccountingLoyaltyWorkspace bilingual contract", () => {
  it("uses a direction-aware Arabic and English copy pair for the financial workspace", () => {
    expect(source).toContain('const dir = language === "en" ? "ltr" : "rtl";');
    expect(source).toContain('t("الحسابات والولاء", "Accounting & loyalty")');
    expect(source).toContain('t("قيد مزدوج وإقفال", "Journal entry & period close")');
    expect(source).toContain('t("مصروف مبرر", "Justified expense")');
    expect(source).not.toContain('<Card dir="rtl"');
  });

  it("retains human-review and organization-scope safeguards in translated UI", () => {
    expect(source).toContain('"Expense was added to the review queue."');
    expect(source).toContain("organizationId, branchId, jurisdictionId");
    expect(source).toContain("createInterBranchTransfer.mutate");
    expect(source).toContain('"A request starts in review; its creator cannot approve it."');
  });
});
