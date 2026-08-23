import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { buildWorkspaceResetKey } from "./Home";

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
    expect(buildWorkspaceResetKey("overview", null, null, null)).toBe("overview:none:none:none");
  });

  it("recovers only the failed subtree without reloading the document or changing scope", () => {
    expect(source).toContain("fallback: (onRetry: () => void) => ReactNode");
    expect(source).toContain("componentDidCatch(error: Error, info: ErrorInfo)");
    expect(source).toContain("retryVersion: previousState.retryVersion + 1");
    expect(source).toContain("<div key={this.state.retryVersion} className=\"min-w-0\">");
    expect(source).not.toContain("window.location.reload()");
  });
});
