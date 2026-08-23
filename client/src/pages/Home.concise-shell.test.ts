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
    expect(source).toContain('active !== "overview" && workflowActions[activeModule.id]');
    expect(source).toContain('active !== "overview" && canSeeManagementSurfaces && <IntegrationStatusStrip />');
    expect(source).toContain('active !== "overview" && <LazyWorkspace');
  });

  it("uses localized module labels and logical edge gesture handlers", () => {
    expect(source).toContain('label: t(`home.module.${module.id}`)');
    expect(source).toContain('onTouchStart={handleEdgeSwipeStart} onTouchEnd={handleEdgeSwipeEnd}');
    expect(source).toContain('if (previousActiveModule.current !== active) setMobileOpen(false)');
  });

  it("opens the desktop drawer from the logical edge instead of pinning it permanently", () => {
    expect(source).toContain('onMouseEnter={openDesktopDrawer} onMouseLeave={closeDesktopDrawer}');
    expect(source).toContain('hidden w-4 lg:block", isRtl ? "right-0" : "left-0"');
    expect(source).toContain('desktopDrawerOpen ? "lg:translate-x-0"');
    expect(source).toContain('desktopDrawerOpen && (isRtl ? "lg:mr-[286px]" : "lg:ml-[286px]")');
    expect(source).not.toContain('motion-reduce:transition-none lg:translate-x-0');
  });

  it("uses the resolved branch label in the screen-protection scope indicator", () => {
    expect(source).toContain('scopeLabel={`${scopeBranchName} · ${localization.sessionMode');
    expect(source).not.toContain('scopeLabel={`${localization.branches.find');
  });
});
