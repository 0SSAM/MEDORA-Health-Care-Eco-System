import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("MEDORA role-scoped personal home summary", () => {
  const source = readFileSync(resolve(process.cwd(), "client/src/pages/Home.tsx"), "utf8");

  it("defines every generic metric with explicit role and work-module eligibility", () => {
    expect(source).toContain('type HomeMetric =');
    expect(source).toContain('roles: readonly HomeRole[];');
    expect(source).toContain('modules: readonly string[];');
    expect(source).toContain('modules: ["pos", "finance"]');
    expect(source).toContain('modules: ["inventory", "supplyChain"]');
  });

  it("renders only the metrics applicable to the active role and module", () => {
    expect(source).toContain('const visibleMetrics = useMemo(');
    expect(source).toContain("metric.roles.includes(role) && metric.modules.includes(active)");
    expect(source).toContain('user && active !== "overview" && visibleMetrics.length > 0');
    expect(source).toContain('visibleMetrics.map(metric =>');
  });

  it("does not mount managerial, organization, integration, or system surfaces for unrelated roles", () => {
    expect(source).toContain("const canSeeManagementSurfaces =");
    expect(source).toContain("isManagementRole && hasCompleteOperationalScope;");
    expect(source).toContain('user && active === "overview" && canSeeManagementSurfaces && (');
    expect(source).toContain("<ManagerOperationalIntelligence");
    expect(source).toContain('user && active !== "overview" && canSeeManagementSurfaces && (');
    expect(source).toContain("<IntegrationStatusStrip />");
    expect(source).toContain('<Card className="border-cyan-100');
    expect(source).toContain("user && canSeeManagementSurfaces && (");
    expect(source).toContain("<section");
  });

  it("keeps service-draft information inside the matching customer-care and call-centre work", () => {
    expect(source).toContain("const canSeeServiceDrafts =");
    expect(source).toContain('active === "customerCare" || active === "callCentre";');
    expect(source).toContain("user && canSeeServiceDrafts && (");
    expect(source).toContain("<OfflineStatusIndicator");
    expect(source).toContain("(serverDrafts.data?.length ?? 0) > 0 && (");
  });
});
