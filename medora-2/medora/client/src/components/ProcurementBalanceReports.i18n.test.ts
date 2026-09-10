import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const source = readFileSync(resolve(process.cwd(), "client/src/components/ProcurementBalanceReports.tsx"), "utf8");

describe("ProcurementBalanceReports bilingual contract", () => {
  it("derives direction and visible labels from the active language", () => {
    expect(source).toContain('const dir = language === "en" ? "ltr" : "rtl";');
    expect(source).toContain('t("تقارير المشتريات والأرصدة", "Purchases and balances reports")');
    expect(source).toContain('t("تصدير Excel", "Export Excel")');
    expect(source).toContain('t("جدولة إرسال التقرير بالبريد", "Schedule email delivery")');
    expect(source).not.toContain('<Card dir="rtl"');
  });

  it("keeps exports, templates, and schedule definitions scope-bound", () => {
    expect(source).toContain("const scope = ready ? { organizationId: organizationId!, branchId: branchId!, jurisdictionId: jurisdictionId! }");
    expect(source).toContain("saveTemplate.mutate({ ...scope");
    expect(source).toContain("organizationId: organizationId!, jurisdictionId: jurisdictionId!");
    expect(source).toContain('"A scope-bound operational summary"');
  });
});
