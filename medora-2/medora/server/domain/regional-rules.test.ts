import { describe, expect, it } from "vitest";
import { formatRegionalAmount, isRegionalOperationConfigured, parseRegionalRuleSet, requireRegionalRule } from "./regional-rules";

describe("regional rule interfaces", () => {
  const json = JSON.stringify({ tax: { rate: 0.14 }, invoicing: { profile: "ETA" }, labeling: { language: "ar" } });

  it("parses and exposes country-supplied rules without hardcoded values", () => {
    const rules = parseRegionalRuleSet(json);
    expect(requireRegionalRule(rules, "tax", "rate")).toBe(0.14);
    expect(isRegionalOperationConfigured(rules, "invoicing")).toBe(true);
  });

  it("blocks missing rules", () => {
    const rules = parseRegionalRuleSet(json);
    expect(() => requireRegionalRule(rules, "payroll", "overtime")).toThrow("Missing regional rule");
    expect(isRegionalOperationConfigured(rules, "payroll")).toBe(false);
  });

  it("does not expose the raw JSON parser error", () => {
    expect(() => parseRegionalRuleSet("{invalid")).toThrow("Invalid regional rules JSON");
    expect(() => parseRegionalRuleSet("{invalid")).not.toThrow("Unexpected token");
  });

  it("formats amounts using the jurisdiction locale and currency", () => {
    expect(formatRegionalAmount(1250, "EGP", "ar-EG")).toContain("١٬٢٥٠");
  });
});
