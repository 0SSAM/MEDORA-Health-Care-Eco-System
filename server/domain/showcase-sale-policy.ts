export const SHOWCASE_NON_REGULATORY_TAX_PROFILE = "SHOWCASE_NOT_REGULATORY";
export const SHOWCASE_POLICY_VERSION = "MEDORA-SHOWCASE-DEMO-V1";
export const SHOWCASE_POLICY_SOURCE_URL = "https://medora.invalid/showcase-policy";

export type ShowcaseSalePolicyInput = {
  organizationEnvironment: string | null | undefined;
  taxProfile: string;
  pack: {
    packVersion: string;
    authorityName: string;
    sourceUrl: string;
    status: string;
    effectiveFrom: Date;
    reviewDueAt: Date | null;
    rules: Record<string, boolean>;
  } | null | undefined;
  evidence: Array<{ operation: string; verificationStatus: string }>;
};

/**
 * Permits only labelled synthetic showcase sales. This is deliberately separate
 * from regulated compliance validation and cannot be used by production scopes.
 */
export function assertIsolatedShowcaseSalePolicy(input: ShowcaseSalePolicyInput, now = new Date()) {
  if (input.organizationEnvironment !== "showcase") throw new Error("Synthetic showcase policy is unavailable outside the isolated showcase environment");
  if (input.taxProfile !== SHOWCASE_NON_REGULATORY_TAX_PROFILE) throw new Error("Synthetic showcase policy requires the non-regulatory tax profile");
  const pack = input.pack;
  if (!pack) throw new Error("Synthetic showcase policy is missing");
  if (pack.packVersion !== SHOWCASE_POLICY_VERSION || pack.authorityName !== "MEDORA Showcase — Synthetic non-regulatory policy" || pack.sourceUrl !== SHOWCASE_POLICY_SOURCE_URL) throw new Error("Synthetic showcase policy identity is invalid");
  if (pack.status !== "approved" || pack.effectiveFrom.getTime() > now.getTime() || (pack.reviewDueAt && pack.reviewDueAt.getTime() < now.getTime())) throw new Error("Synthetic showcase policy is not currently usable");
  if (pack.rules.sale !== true || pack.rules.catalog !== true) throw new Error("Synthetic showcase policy does not enable the required simulated operations");
  const verifiedOperations = new Set(input.evidence.filter((evidence) => evidence.verificationStatus === "verified").map((evidence) => evidence.operation));
  if (!verifiedOperations.has("sale") || !verifiedOperations.has("catalog")) throw new Error("Synthetic showcase policy is missing verified simulated evidence");
  return { simulated: true as const, packVersion: pack.packVersion };
}
