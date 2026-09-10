import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const source = readFileSync(resolve(process.cwd(), "client/src/components/AiGovernanceWorkspace.tsx"), "utf8");

describe("AI governance workspace bilingual contract", () => {
  it("derives direction and interface copy from the active language", () => {
    expect(source).toContain("const { language, direction } = useLocalization();");
    expect(source).toContain('language === "ar" ? arabic : english');
    expect(source).toContain('dir={direction}');
    expect(source).toContain('"Governed operational AI"');
    expect(source).toContain('"Workplace-monitoring readiness"');
  });

  it("retains the advisory-only and human-review safety boundary", () => {
    expect(source).toContain('humanReviewAcknowledged: true');
    expect(source).toContain('"The result requires human review and cannot execute any action automatically."');
    expect(source).toContain('containsProtectedData: false');
  });
});
