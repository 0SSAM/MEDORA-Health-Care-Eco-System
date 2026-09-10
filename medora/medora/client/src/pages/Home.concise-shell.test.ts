import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("MEDORA concise home shell", () => {
  const source = readFileSync(resolve(process.cwd(), "client/src/pages/Home.tsx"), "utf8");

  it("derives a compact command center from role-authorized actions and keeps human review visible", () => {
    expect(source).toContain('const overviewQuickActions = useMemo(');
    expect(source).toContain('allowedModules.some(module => module.id === shortcut.module)');
    expect(source).toContain('const primaryOverviewAction = overviewQuickActions[0]');
    expect(source).toContain('overviewQuickActions.slice(0, 3)');
    expect(source).toContain('commandCenterCopy.safety');
  });

  it("keeps detailed workspaces and analytics out of the overview by default", () => {
    expect(source).toContain('active !== "overview" &&');
    expect(source).toContain("workflowActions[activeModule.id]");
    expect(source).toContain("canSeeManagementSurfaces && (");
    expect(source).toContain("<IntegrationStatusStrip />");
    expect(source).toContain("<WorkspaceScopeGuard");
    expect(source).toContain("status={workspaceScopeStatus}");
    expect(source).toContain("<LazyWorkspace");
    expect(source).toContain("resetKey={buildWorkspaceResetKey(");
    expect(source).toContain("workspaceRetryEpoch");
  });

  it("uses localized module labels and logical edge gesture handlers", () => {
    expect(source).toContain('label: t(`home.module.${module.id}`)');
    expect(source).toContain("onTouchStart={handleEdgeSwipeStart}");
    expect(source).toContain("onTouchEnd={handleEdgeSwipeEnd}");
    expect(source).toContain('if (previousActiveModule.current !== active) setMobileOpen(false)');
  });

  it("opens the desktop drawer from the logical edge instead of pinning it permanently", () => {
    expect(source).toContain("onMouseEnter={openDesktopDrawer}");
    expect(source).toContain("onMouseLeave={closeDesktopDrawer}");
    expect(source).toContain('"fixed inset-y-0 z-40 hidden w-4 lg:block"');
    expect(source).toContain('isRtl ? "right-0" : "left-0"');
    expect(source).toContain("desktopDrawerOpen");
    expect(source).toContain('? "lg:translate-x-0"');
    expect(source).toContain('desktopDrawerOpen && (isRtl ? "lg:mr-[286px]" : "lg:ml-[286px]")');
    expect(source).not.toContain('motion-reduce:transition-none lg:translate-x-0');
  });

  it("uses the resolved branch label in the screen-protection scope indicator without a session environment", () => {
    expect(source).toContain("scopeLabel={scopeBranchName}");
    expect(source).not.toContain('scopeLabel={`${localization.branches.find');
    expect(source).not.toMatch(/showcase|sessionMode|switchSessionMode/iu);
  });
});
