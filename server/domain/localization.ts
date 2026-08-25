export type CountryLocalization = {
  countryCode: string;
  locale: string;
  language: string;
  direction: "rtl" | "ltr";
  currencyCode: string;
  calendar: string;
  numberingSystem: string;
  terminology: Record<string, string>;
};

const DEFAULT_TERMINOLOGY: Record<string, string> = {
  pharmacy: "الصيدلية",
  prescription: "الوصفة الطبية",
  invoice: "الفاتورة",
  branch: "الفرع",
};

export function buildCountryLocalization(input: Partial<CountryLocalization> & Pick<CountryLocalization, "countryCode" | "locale" | "currencyCode">): CountryLocalization {
  const language = input.language?.trim() || "ar";
  const locale = input.locale.trim() || "ar";
  return {
    countryCode: input.countryCode.trim().toUpperCase(),
    locale,
    language,
    direction: language.startsWith("ar") ? "rtl" : input.direction ?? "ltr",
    currencyCode: input.currencyCode.trim().toUpperCase(),
    calendar: input.calendar?.trim() || "gregory",
    numberingSystem: input.numberingSystem?.trim() || "latn",
    terminology: { ...DEFAULT_TERMINOLOGY, ...(input.terminology ?? {}) },
  };
}

export function formatLocalizedCurrency(amount: number, localization: CountryLocalization) {
  if (!Number.isFinite(amount)) throw new Error("Amount must be finite");
  const locale = `${localization.locale}-u-ca-${localization.calendar}-nu-${localization.numberingSystem}`;
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: localization.currencyCode,
  }).format(amount);
}

export function localizedLabel(key: string, localization: CountryLocalization) {
  return localization.terminology[key] ?? DEFAULT_TERMINOLOGY[key] ?? key;
}
