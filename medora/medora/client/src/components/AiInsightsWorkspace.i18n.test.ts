import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { getReviewValidation } from "./AiInsightsWorkspace";

const source = readFileSync(resolve(process.cwd(), "client/src/components/AiInsightsWorkspace.tsx"), "utf8");

describe("AI insights bilingual contract", () => {
  it("selects visible interface copy and logical direction from the active language", () => {
    expect(source).toContain('const interfaceLanguage: InterfaceLanguage = language === "en" ? "en" : "ar"');
    expect(source).toContain('const dir = interfaceLanguage === "ar" ? "rtl" : "ltr"');
    expect(source).toContain('title: "Operational AI Centre"');
    expect(source).toContain('humanReview: "Human review required"');
    expect(source).toContain('<div className="space-y-5" dir={dir}>');
  });

  it("keeps the review decision non-autonomous and localises mandatory-note errors", () => {
    expect(getReviewValidation("accepted", "", "en")).toContain("brief note");
    expect(getReviewValidation("rejected", "", "en")).toContain("decision reason");
    expect(getReviewValidation("accepted", "evidence reviewed", "en")).toBeNull();
    expect(source).toContain("recordOnly:");
    expect(source).toContain('onReview("accepted", reviewNote.trim())');
  });
});
