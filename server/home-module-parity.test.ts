import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const homeSource = readFileSync(resolve(process.cwd(), "client/src/pages/Home.tsx"), "utf8");
const localizationSource = readFileSync(resolve(process.cwd(), "client/src/contexts/LocalizationContext.tsx"), "utf8");

describe("Home module parity", () => {
  it("routes inventory to the operational supply-chain workspace", () => {
    expect(homeSource).toContain('if (active === "inventory") return <SupplyChainWorkspace');
  });

  it("keeps organization module ids represented in the module catalog", () => {
    const catalogIds = new Set(
      [...homeSource.matchAll(/\{ id: "([A-Za-z0-9]+)", label:/g)].map((match) => match[1]),
    );
    const organizationModulesBlock = homeSource.match(
      /const organizationModules: Record<string, string\[\]> = (.*?);\s*const coreShortcuts/s,
    )?.[1];

    expect(organizationModulesBlock).toBeTruthy();
    const organizationModuleIds = new Set(
      [...(organizationModulesBlock ?? "").matchAll(/"([A-Za-z0-9]+)"/g)].map((match) => match[1]),
    );

    for (const moduleId of organizationModuleIds) {
      expect(catalogIds, `missing module catalog entry for ${moduleId}`).toContain(moduleId);
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

  it("surfaces the isolated Admin Console only from the server-derived showcase-admin session", () => {
    expect(homeSource).toContain('sessionInfoQuery.data.showcaseAdmin === true');
    expect(homeSource).toContain('organization.environment === "showcase"');
    expect(homeSource).toContain('data-testid="showcase-admin-console-entry"');
    expect(homeSource).toContain('href="/admin"');
    expect(homeSource).toContain('Any operational change is simulated and is not saved.');
  });

  it("shows the prominent read-only banner only from the trusted showcase-session signal", () => {
    expect(homeSource).toContain('const isShowcaseSession = sessionInfoQuery.data?.authenticated === true && sessionInfoQuery.data.sessionMode === "showcase"');
    expect(homeSource).toContain('isShowcaseSession && <aside data-testid="showcase-read-only-banner"');
    expect(homeSource).toContain('t("home.readOnlyBannerTitle")');
    expect(homeSource).toContain('t("home.readOnlyBannerDetail")');
  });

  it("routes a showcase user to approved authentication without self-escalating access", () => {
    expect(homeSource).toContain('data-testid="showcase-read-only-access-action"');
    expect(homeSource).toContain('const continueToAccessRequest = async () =>');
    expect(homeSource).toContain('await logout();');
    expect(homeSource).toContain('setLocation("/login");');
    expect(homeSource).toContain('t("home.readOnlyAccessDetail")');
    expect(localizationSource).toContain('"home.readOnlyBannerSignIn": "تسجيل الدخول بصلاحيات التعديل"');
    expect(localizationSource).toContain('"home.readOnlyAccessDetail": "افتح تسجيل الدخول المعتمد لطلب وصول قابل للتعديل؛ لا يمنح هذا الزر أي صلاحيات داخل جلسة العرض."');
    expect(localizationSource).toContain('"home.readOnlyBannerSignIn": "Sign in for edit access"');
    expect(localizationSource).toContain('"home.readOnlyAccessDetail": "Open approved sign-in to request editable access; this button does not grant any authority within the showcase session."');
    expect(homeSource).not.toContain('grantShowcaseEditAccess');
  });

  it("classifies workspace failures locally without exposing raw error text or changing scope", () => {
    expect(homeSource).toContain('import { classifyWorkspaceFailure, type WorkspaceFailureCategory } from "@/lib/workspaceFailureClassification"');
    expect(homeSource).toContain('failureCategory: classifyWorkspaceFailure(error)');
    expect(homeSource).toContain('failureCategory: null, retryVersion: previousState.retryVersion + 1');
    expect(homeSource).not.toContain('errorMessage, organizationId');
  });

  it("avoids duplicating launch cards above complete task-first workspaces", () => {
    expect(homeSource).toContain('const inlineTaskSurfaceModules = new Set(["pos", "inventory", "supplyChain", "prescriptions", "finance"');
    expect(homeSource).toContain('inlineTaskSurfaceModules.has(moduleId) ? [] : actions');
  });
});
