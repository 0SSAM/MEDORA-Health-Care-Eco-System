import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const homeSource = readFileSync(resolve(process.cwd(), "client/src/pages/Home.tsx"), "utf8");
const localizationSource = readFileSync(resolve(process.cwd(), "client/src/contexts/LocalizationContext.tsx"), "utf8");

describe("Home module parity", () => {
  it("routes inventory to the operational supply-chain workspace", () => {
    expect(homeSource).toContain('if (active === "inventory")');
    expect(homeSource).toContain("<SupplyChainWorkspace");
  });

  it("keeps organization module ids represented in the module catalog", () => {
    const catalogIds = new Set([...homeSource.matchAll(/id: "([A-Za-z0-9]+)"/g)].map((match) => match[1]));
    const representedModuleIds = new Set(["overview", ...catalogIds]);
    const organizationModulesBlock = homeSource.match(
      /const organizationModules: Record<string, string\[\]> = (.*?);\s*const coreShortcuts/s,
    )?.[1];

    expect(organizationModulesBlock).toBeTruthy();
    const organizationModuleIds = new Set(
      [...(organizationModulesBlock ?? "").matchAll(/"([A-Za-z0-9]+)"/g)].map((match) => match[1]),
    );

    for (const moduleId of organizationModuleIds) {
      expect(representedModuleIds, `missing module catalog entry for ${moduleId}`).toContain(moduleId);
    }
  });

  it("keeps the command center limited to already-authorized modules", () => {
    expect(homeSource).toContain("const overviewQuickActions = useMemo(");
    expect(homeSource).toContain("allowedModules.some(module => module.id === shortcut.module)");
    expect(homeSource).toContain("const primaryOverviewAction = overviewQuickActions[0]");
  });

  it("keeps secondary home actions behind progressive disclosure", () => {
    expect(homeSource).toContain("overviewQuickActions.slice(0, 3)");
    expect(homeSource).toContain("overviewQuickActions.length > 3");
    expect(homeSource).toContain("overviewQuickActions.slice(3)");
  });

  it("keeps secondary monitoring and governance collapsed until requested", () => {
    expect(homeSource).toContain('<details className="group">');
    expect(homeSource).toContain('onClick={() => setActive("integrity")}');
    expect(homeSource).not.toContain('<CardTitle className="text-lg">{t("home.operationsCenter")}</CardTitle>');
  });

  it("does not expose an isolated showcase workspace, read-only banner, or access escalation path", () => {
    for (const source of [homeSource, localizationSource]) {
      expect(source).not.toMatch(/showcase|DemoExperienceWorkspace|sessionMode/iu);
    }
    expect(homeSource).not.toContain('grantShowcaseEditAccess');
  });

  it("classifies workspace failures locally without exposing raw error text or changing scope", () => {
    expect(homeSource).toContain("classifyWorkspaceFailure,");
    expect(homeSource).toContain("type WorkspaceFailureCategory,");
    expect(homeSource).toContain('failureCategory: classifyWorkspaceFailure(error)');
    expect(homeSource).toContain("failureCategory: null,");
    expect(homeSource).toContain("retryVersion: previousState.retryVersion + 1");
    expect(homeSource).not.toContain('errorMessage, organizationId');
  });

  it("avoids duplicating launch cards above complete task-first workspaces", () => {
    expect(homeSource).toContain("const inlineTaskSurfaceModules = new Set([");
    expect(homeSource).toContain('"pos",');
    expect(homeSource).toContain('"inventory",');
    expect(homeSource).toContain('"supplyChain",');
    expect(homeSource).toContain('"prescriptions",');
    expect(homeSource).toContain('"finance",');
    expect(homeSource).toContain('inlineTaskSurfaceModules.has(moduleId) ? [] : actions');
  });
});
