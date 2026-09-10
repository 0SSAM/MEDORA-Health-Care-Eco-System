import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("task-oriented workspace navigation", () => {
  const homeSource = readFileSync(resolve(process.cwd(), "client/src/pages/Home.tsx"), "utf8");

  it("exposes direct POS actions in Arabic RTL navigation", () => {
    expect(homeSource).toContain('id: "pos"');
    expect(homeSource).toContain("فتح بيع جديد");
    expect(homeSource).toContain("البحث عن صنف");
    expect(homeSource).toContain("الفواتير المعلقة");
    expect(homeSource).toContain("المرتجعات وتقفيل الفترة");
  });

  it("exposes an actionable Operations Center with staff, procurement, and CRM paths", () => {
    expect(homeSource).toContain('id: "operations"');
    expect(homeSource).toContain("مهام الموظفين");
    expect(homeSource).toContain("التوريد والمشتريات");
    expect(homeSource).toContain("متابعة العملاء");
    expect(homeSource).toContain('active === "operations"');
    expect(homeSource).toContain("OperationsManagementWorkspace");
  });

  it("keeps the workflow menu behind the existing permitted-module filter", () => {
    expect(homeSource).toContain("allowedModules.some(item => item.id === module)");
    expect(homeSource).toContain("const access: Record<string, string[]> =");
    expect(homeSource).toContain("setMobileOpen(false)");
  });

  it("defines task entry points across high-frequency and administrative modules", () => {
    for (const label of ["المخزون و FEFO", "التأمين والمطالبات", "الذكاء الاصطناعي والمراقبة", "إعدادات الحماية والمصادقة", "حالة التكاملات"]) {
      expect(homeSource).toContain(label);
    }
    expect(homeSource).toContain('t("home.whatNext")');
    expect(homeSource).toContain("englishWorkflowActions");
    expect(homeSource).toContain("englishCoreShortcuts");
    expect(homeSource).toContain('aria-label={`${t("home.actionsFor")} ${item.label}`}');
    expect(homeSource).toContain('isRtl ? "text-right" : "text-left"');
  });
});
