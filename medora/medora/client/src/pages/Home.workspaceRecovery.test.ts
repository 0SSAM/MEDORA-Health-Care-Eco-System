import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { buildWorkspaceResetKey, reconcileAuthorizedOrganizationId } from "./Home";

const source = readFileSync(resolve(import.meta.dirname, "Home.tsx"), "utf8");

describe("workspace recovery boundary", () => {
  it("changes when the active module changes", () => {
    expect(buildWorkspaceResetKey("overview", 1, 1, 1)).not.toBe(buildWorkspaceResetKey("pos", 1, 1, 1));
  });

  it("changes when the organization, branch, or jurisdiction changes", () => {
    const base = buildWorkspaceResetKey("operations", 1, 1, 1);
    expect(buildWorkspaceResetKey("operations", 2, 1, 1)).not.toBe(base);
    expect(buildWorkspaceResetKey("operations", 1, 2, 1)).not.toBe(base);
    expect(buildWorkspaceResetKey("operations", 1, 1, 2)).not.toBe(base);
  });

  it("uses explicit stable markers for an unavailable scope", () => {
    expect(buildWorkspaceResetKey("overview", null, null, null)).toBe("overview:none:none:none:0");
  });

  it("changes after an explicit local retry without changing the authorized scope", () => {
    expect(buildWorkspaceResetKey("operations", 1, 2, 3, 1)).not.toBe(buildWorkspaceResetKey("operations", 1, 2, 3, 2));
  });

  it("does not retain a stale organization across an authorized registry transition", () => {
    expect(reconcileAuthorizedOrganizationId(undefined, 9)).toBe(9);
    expect(reconcileAuthorizedOrganizationId([{ id: 1 }, { id: 2 }], 2)).toBe(2);
    expect(reconcileAuthorizedOrganizationId([{ id: 1 }, { id: 2 }], 9)).toBe(1);
    expect(reconcileAuthorizedOrganizationId([], 1)).toBeNull();
  });

  it("recovers only the failed subtree without reloading the document or changing scope", () => {
    expect(source).toContain("fallback: (onRetry: () => void) => ReactNode");
    expect(source).toContain("componentDidCatch(error: Error, info: ErrorInfo)");
    expect(source).toContain("retryVersion: previousState.retryVersion + 1");
    expect(source).toContain("<div key={this.state.retryVersion} className=\"min-w-0\">");
    expect(source).not.toContain("window.location.reload()");
  });

  it("does not mount non-overview operational modules until the authorized scope is ready", () => {
    expect(source).toContain("type WorkspaceScopeStatus =");
    for (const status of [
      "organization_loading",
      "organization_error",
      "nda_loading",
      "nda_error",
      "nda_required",
      "branch_loading",
      "branch_error",
      "branch_missing",
      "missing",
      "ready",
    ]) expect(source).toContain(`| \"${status}\"`);
    expect(source).toContain("const workspaceScopeStatus: WorkspaceScopeStatus =");
    expect(source).toContain("organizationsQuery.isLoading");
    expect(source).toContain("organizationsQuery.isError");
    expect(source).toContain('localization.workspaceBootstrapStatus !== "ready"');
    expect(source).toContain("hasCompleteOperationalScope");
    expect(source).toContain("const retryWorkspaceScope = () => {");
    expect(source).toContain("setWorkspaceRetryEpoch(version => version + 1);");
    expect(source).toContain('if (workspaceScopeStatus === "organization_error")');
    expect(source).toContain("void organizationsQuery.refetch();");
    expect(source).toContain("void localization.retryWorkspaceBootstrap();");
    expect(source).toContain("<WorkspaceScopeGuard");
    expect(source).toContain("status={workspaceScopeStatus}");
    expect(source).toContain("onRetry={retryWorkspaceScope}");
    expect(source).toContain("workspaceRetryEpoch");
    expect(source).toContain('status === "nda_required"');
    expect(source).toContain('status === "branch_missing"');
    expect(source).toContain("if (status === \"ready\") return <>{children}</>;");
  });
});
