import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("OperationsManagementWorkspace focus contract", () => {
  const source = readFileSync(resolve(process.cwd(), "client/src/components/OperationsManagementWorkspace.tsx"), "utf8");

  it("accepts the current scoped focus values and preserves the selected stream", () => {
    expect(source).toContain('type OperationsFocus = "people" | "procurement" | "crm"');
    expect(source).toContain("focus?: OperationsFocus");
    expect(source).toContain('useState<OperationsFocus>(focus ?? "people")');
    expect(source).toContain("if (focus) setFocusedSection(focus)");
    expect(source).toContain('focusedSection === "people"');
    expect(source).toContain('focusedSection === "procurement"');
    expect(source).toContain('focusedSection === "crm"');
  });

  it("retains bilingual scoped workspace titles without an always-on metrics dashboard", () => {
    expect(source).toContain('employeeTitle: "ملفات الموظفين"');
    expect(source).toContain('crmTitle: "إدارة علاقات العملاء والموافقات"');
    expect(source).toContain('procurementTitle: "طلبات الشراء الداخلية"');
    expect(source).not.toContain("unifiedDashboard");
    expect(source).not.toContain("ProcurementBalanceReports");
  });
});
