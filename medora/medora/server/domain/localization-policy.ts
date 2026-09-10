export type LocalizationContext = {
  localeVerified: boolean;
  rtlDirectionVerified: boolean;
  timezoneVerified: boolean;
  currencyVerified: boolean;
  calendarDateFormatsVerified: boolean;
  effectiveSourceVerified: boolean;
};

export function localizationReadiness(context: LocalizationContext | null) {
  if (!context) return "BLOCKED" as const;
  return Object.values(context).every(Boolean) ? "READY" as const : "BLOCKED" as const;
}

export function assertLocalizationReady(context: LocalizationContext | null) {
  if (localizationReadiness(context) !== "READY") throw new Error("Localization is not ready");
  return true as const;
}
