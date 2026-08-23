import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const source = readFileSync(new URL("./IntegratedOperationsWorkspaces.tsx", import.meta.url), "utf8");

describe("integrated operations workspace contracts", () => {
  it("uses scoped server procedures for insurance, reports, promotions, and organization membership", () => {
    expect(source).toContain("trpc.insurance.list.useQuery");
    expect(source).toContain("trpc.insurance.create.useMutation");
    expect(source).toContain("trpc.reports.definitions.useQuery");
    expect(source).toContain("trpc.reports.runs.useQuery");
    expect(source).toContain("trpc.promotions.list.useQuery");
    expect(source).toContain("trpc.promotions.approve.useMutation");
    expect(source).toContain("trpc.organizations.employeeDirectory.useQuery");
    expect(source).toContain("trpc.organizations.createEmployee.useMutation");
    expect(source).toContain("trpc.organizations.updateEmployee.useMutation");
    expect(source).toContain("trpc.organizations.resetEmployeePassword.useMutation");
  });

  it("does not invent an organization, branch, or jurisdiction scope", () => {
    expect(source).toContain("لا يمكن تشغيل هذه الوحدة قبل اختيار مؤسسة وفرع مرتبط باختصاص مؤكد");
    expect(source).toContain("enabled ? { organizationId: organizationId!, jurisdictionId: jurisdictionId! } : skipToken");
    expect(source).not.toContain("organizationId: 1");
    expect(source).not.toContain("jurisdictionId: 1");
  });

  it("communicates fail-closed external integration boundaries", () => {
    expect(source).toContain("الإرسال الشبكي معطل حتى اعتماد الموصل الرسمي");
    expect(source).toContain("لا تُرسل إشعارات تلقائياً قبل الجدولة الصريحة");
    expect(source).toContain("الحد القانوني للخصم النسبي يطبقه الخادم");
  });
});
