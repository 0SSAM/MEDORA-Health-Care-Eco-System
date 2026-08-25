export type RegionalRuleArea = "tax" | "invoicing" | "pricing" | "prescription" | "controlled_medicine" | "labeling" | "insurance" | "payroll" | "reporting";

export type RegionalRuleSet = Partial<Record<RegionalRuleArea, Record<string, unknown>>>;

export function parseRegionalRuleSet(rulesJson: string): RegionalRuleSet {
  try {
    const parsed = JSON.parse(rulesJson) as unknown;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error("Rules must be an object");
    return parsed as RegionalRuleSet;
  } catch {
    throw new Error("Invalid regional rules JSON");
  }
}

export function requireRegionalRule(rules: RegionalRuleSet, area: RegionalRuleArea, key: string) {
  const value = rules[area]?.[key];
  if (value === undefined || value === null) throw new Error(`Missing regional rule: ${area}.${key}`);
  return value;
}

export function isRegionalOperationConfigured(rules: RegionalRuleSet, area: RegionalRuleArea) {
  return Boolean(rules[area] && Object.keys(rules[area]!).length > 0);
}

export function formatRegionalAmount(amount: number, currencyCode: string, locale: string) {
  if (!Number.isFinite(amount)) throw new Error("Amount must be finite");
  return new Intl.NumberFormat(locale, { style: "currency", currency: currencyCode }).format(amount);
}
