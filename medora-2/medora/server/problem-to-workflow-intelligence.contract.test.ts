import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const homeSource = readFileSync(resolve(process.cwd(), "client/src/pages/Home.tsx"), "utf8");
const guideSource = readFileSync(resolve(process.cwd(), "client/src/components/OperationalWorkflowGuide.tsx"), "utf8");

describe("problem-to-workflow intelligence contract", () => {
  it("keeps the guidance loop attached only to the authorized management overview and approved primary action", () => {
    expect(homeSource).toContain('user && active === "overview" && canSeeManagementSurfaces && (');
    expect(homeSource).toContain("<OperationalWorkflowGuide");
    expect(homeSource).toContain("const canSeeManagementSurfaces =");
    expect(homeSource).toContain("isManagementRole && hasCompleteOperationalScope;");
    expect(homeSource).toContain("primaryActionLabel={primaryOverviewAction?.label}");
    expect(homeSource).toContain("onOpenPrimaryAction={() => {");
    expect(homeSource).toContain("if (primaryOverviewAction)");
    expect(homeSource).toContain("activateShortcut(primaryOverviewAction.module);");
    expect(homeSource).toContain('onOpenAssistant={() => activateShortcut("assistant")}');
  });

  it("makes the signal-context-review-authorized-action sequence explicit", () => {
    expect(guideSource).toContain('title: "Signal"');
    expect(guideSource).toContain('title: "Context"');
    expect(guideSource).toContain('title: "Human review"');
    expect(guideSource).toContain('title: "Authorized action"');
    expect(guideSource).toContain('title: "إشارة"');
    expect(guideSource).toContain('title: "مراجعة بشرية"');
    expect(guideSource).toContain('title: "إجراء مصرح"');
  });

  it("remains an advisory-only UI with no direct execution or outbound transport", () => {
    expect(guideSource).toContain("does not execute clinical, financial, or sensitive actions automatically");
    expect(guideSource).toContain("من دون تنفيذ تلقائي لإجراء سريري أو مالي أو حساس");
    expect(guideSource).not.toContain("useMutation");
    expect(guideSource).not.toContain("trpc.");
    expect(guideSource).not.toContain("fetch(");
  });
});
