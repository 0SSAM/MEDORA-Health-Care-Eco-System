export const ARAB_COUNTRY_REGISTRY = [
  { countryCode: "DZ", countryNameAr: "الجزائر" },
  { countryCode: "BH", countryNameAr: "البحرين" },
  { countryCode: "KM", countryNameAr: "جزر القمر" },
  { countryCode: "DJ", countryNameAr: "جيبوتي" },
  { countryCode: "EG", countryNameAr: "مصر" },
  { countryCode: "IQ", countryNameAr: "العراق" },
  { countryCode: "JO", countryNameAr: "الأردن" },
  { countryCode: "KW", countryNameAr: "الكويت" },
  { countryCode: "LB", countryNameAr: "لبنان" },
  { countryCode: "LY", countryNameAr: "ليبيا" },
  { countryCode: "MR", countryNameAr: "موريتانيا" },
  { countryCode: "MA", countryNameAr: "المغرب" },
  { countryCode: "OM", countryNameAr: "عُمان" },
  { countryCode: "PS", countryNameAr: "فلسطين" },
  { countryCode: "QA", countryNameAr: "قطر" },
  { countryCode: "SA", countryNameAr: "السعودية" },
  { countryCode: "SO", countryNameAr: "الصومال" },
  { countryCode: "SD", countryNameAr: "السودان" },
  { countryCode: "SY", countryNameAr: "سوريا" },
  { countryCode: "TN", countryNameAr: "تونس" },
  { countryCode: "AE", countryNameAr: "الإمارات العربية المتحدة" },
  { countryCode: "YE", countryNameAr: "اليمن" },
] as const;

export type CountryCode = (typeof ARAB_COUNTRY_REGISTRY)[number]["countryCode"];
export type CompliancePackStatus = "draft" | "review" | "approved" | "expired" | "rolled_back";
export type RegulatedOperation = "catalog" | "sale" | "prescription" | "dispensing" | "invoice" | "insurance" | "payroll" | "report";

export type JurisdictionContext = {
  countryCode: string;
  active: boolean;
  legalAuthorityProfile: string;
  language: string;
  defaultLocale: string;
  currencyCode: string;
  timezone: string;
  taxProfile: string;
  dateFormat: string;
  numberSystem: string;
};

export type CompliancePackContext = {
  jurisdictionId: number;
  packVersion: string;
  status: CompliancePackStatus;
  effectiveFrom: Date;
  reviewDueAt: Date | null;
  rules: Partial<Record<RegulatedOperation, boolean>>;
  evidenceCount: number;
};

export type VersionedCompliancePack = CompliancePackContext & { createdAt: Date };

export function selectCurrentCompliancePack(packs: VersionedCompliancePack[], now = new Date()) {
  return packs
    .filter(pack => pack.status === "approved" && pack.effectiveFrom.getTime() <= now.getTime() && (!pack.reviewDueAt || pack.reviewDueAt.getTime() >= now.getTime()))
    .sort((a, b) => b.effectiveFrom.getTime() - a.effectiveFrom.getTime() || b.createdAt.getTime() - a.createdAt.getTime())[0] ?? null;
}

export function isArabCountryCode(value: string): value is CountryCode {
  return ARAB_COUNTRY_REGISTRY.some(country => country.countryCode === value);
}

export function assertJurisdictionProfileReady(profile: JurisdictionContext, now = new Date()) {
  if (!isArabCountryCode(profile.countryCode)) throw new Error("Unsupported country code");
  if (!profile.active) throw new Error("Jurisdiction is not approved for use");
  for (const value of [profile.legalAuthorityProfile, profile.language, profile.defaultLocale, profile.currencyCode, profile.timezone, profile.taxProfile, profile.dateFormat]) {
    if (!value.trim()) throw new Error("Jurisdiction profile is incomplete");
  }
  void now;
  return true as const;
}

export function assertCompliancePackUsable(
  profile: JurisdictionContext,
  pack: CompliancePackContext | null | undefined,
  operation: RegulatedOperation,
  now = new Date(),
) {
  assertJurisdictionProfileReady(profile, now);
  if (!pack) throw new Error("No compliance pack is configured for this jurisdiction");
  if (pack.status !== "approved") throw new Error("Compliance pack requires human approval");
  if (pack.jurisdictionId <= 0) throw new Error("Compliance pack jurisdiction is invalid");
  if (pack.effectiveFrom.getTime() > now.getTime()) throw new Error("Compliance pack is not effective yet");
  if (pack.reviewDueAt && pack.reviewDueAt.getTime() < now.getTime()) throw new Error("Compliance pack is stale and regulated work is blocked");
  if (pack.evidenceCount < 1) throw new Error("Compliance pack has no source evidence");
  if (pack.rules[operation] !== true) throw new Error(`Operation is not enabled for ${profile.countryCode}`);
  return { countryCode: profile.countryCode, packVersion: pack.packVersion, operation } as const;
}

export function assertSameJurisdiction(expectedCountryCode: string, recordCountryCode: string) {
  if (expectedCountryCode !== recordCountryCode) throw new Error("Cross-country data access is blocked");
  return true as const;
}

export function normalizeCountryCode(value: string): CountryCode {
  const normalized = value.trim().toUpperCase();
  if (!isArabCountryCode(normalized)) throw new Error("Unsupported country code");
  return normalized;
}
