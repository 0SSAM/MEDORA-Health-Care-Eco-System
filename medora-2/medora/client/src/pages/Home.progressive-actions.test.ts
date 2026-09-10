import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("MEDORA home progressive actions", () => {
  const source = readFileSync(resolve(process.cwd(), "client/src/pages/Home.tsx"), "utf8");

  it("keeps three role-authorized shortcuts primary and exposes remaining shortcuts progressively", () => {
    expect(source).toContain('overviewQuickActions.slice(0, 3)');
    expect(source).toContain('overviewQuickActions.slice(3)');
    expect(source).toContain('overviewQuickActions.length > 3');
  });

  it("uses localized and keyboard-accessible disclosure affordances", () => {
    expect(source).toContain('t("home.moreQuickActions")');
    expect(source).toContain("<details");
    expect(source).toContain('className="group rounded-2xl border');
    expect(source).toContain('onClick={() => activateShortcut(shortcut.module)}');
  });

  it("keeps workflow actions beyond the initial three reachable without changing their target index", () => {
    expect(source).toContain("workflowActions[activeModule.id]");
    expect(source).toContain(".slice(0, 3)");
    expect(source).toContain(".slice(3)");
    expect(source).toContain('workflowActions[activeModule.id].length > 3');
    expect(source).toContain("activateWorkflow(activeModule.id, index + 3)");
    expect(source).toContain('t("home.moreWorkflowActions")');
  });
});
