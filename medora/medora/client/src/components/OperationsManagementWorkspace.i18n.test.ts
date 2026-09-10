import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("Operations management localization and simplicity", () => {
  const source = readFileSync(resolve(process.cwd(), "client/src/components/OperationsManagementWorkspace.tsx"), "utf8");

  it("derives the language, layout direction, and operational copy from the active localization", () => {
    expect(source).toContain('const { language, direction } = useLocalization()');
    expect(source).toContain('const isEnglish = language === "en"');
    expect(source).toContain('<div dir={direction} className="space-y-4">');
    expect(source).toContain('people: "People tasks"');
    expect(source).toContain('procurement: "Procurement"');
    expect(source).toContain('crm: "Customer follow-up"');
  });

  it("keeps only one selected operational stream visible rather than an always-on metrics dashboard", () => {
    expect(source).toContain('focusedSection === "people"');
    expect(source).toContain('focusedSection === "procurement"');
    expect(source).toContain('focusedSection === "crm"');
    expect(source).not.toContain('unifiedDashboard');
    expect(source).not.toContain('ProcurementBalanceReports');
    expect(source).toContain('trpc.operations.reviewInbox.list.useQuery');
    expect(source).toContain('limit: 3');
    expect(source).not.toContain('reviewInbox.approve');
  });
});
