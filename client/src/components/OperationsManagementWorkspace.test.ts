import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { resolve } from "path";

describe("OperationsManagementWorkspace Contract Test", () => {
  const sourcePath = resolve(__dirname, "OperationsManagementWorkspace.tsx");
  const source = readFileSync(sourcePath, "utf8");

  it("should support section-based rendering for HR, CRM, and Procurement", () => {
    // Check for section prop definition
    expect(source).toContain('section?: "hr" | "crm" | "procurement"');
    
    // Check for rendering branches
    expect(source).toContain('if (section === "hr")');
    expect(source).toContain('if (section === "crm")');
    expect(source).toContain('if (section === "procurement")');
    
    // Check for render helper functions
    expect(source).toContain("const renderHr = () =>");
    expect(source).toContain("const renderCrm = () =>");
    expect(source).toContain("const renderProcurement = () =>");
  });

  it("should contain Arabic titles for the workspace sections", () => {
    expect(source).toContain("ملفات الموظفين");
    expect(source).toContain("إدارة علاقات العملاء والموافقات");
    expect(source).toContain("طلبات الشراء الداخلية");
  });
});
