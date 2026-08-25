// MEDORA | ميدورا — Integrated Health Care System
// Copyright (c) 2026 Hossam Naeim Osman | حسام نعيم عثمان. All rights reserved.
// Proprietary and confidential. Unauthorized copying, distribution, or use of this
// software, or of any portion of it, is strictly prohibited.
// Source: https://github.com/0SSAM/MEDORA-Health-Care-Eco-System
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

type ClientLocalization = {
  countryCode: string;
  locale: string;
  language: string;
  direction: "rtl" | "ltr";
  currencyCode: string;
  calendar: string;
  numberingSystem: string;
  t: (key: string) => string;
  formatCurrency: (amount: number) => string;
  setCountry: (countryCode: string) => void;
  setLanguage: (language: "ar" | "en") => void;
  branchId: number | null;
  jurisdictionId: number | null;
  branches: Array<{ id: number; nameAr: string; countryCode: string }>;
  setBranchId: (branchId: number) => void;
};

const dictionaries: Record<string, Record<string, string>> = {
  ar: {
    pharmacy: "الصيدلية",
    prescription: "الوصفة الطبية",
    invoice: "الفاتورة",
    branch: "الفرع",
    country: "الدولة",
  },
  en: {
    pharmacy: "Pharmacy",
    prescription: "Prescription",
    invoice: "Invoice",
    branch: "Branch",
    country: "Country",
  },
};

const countryDefaults: Record<string, { locale: string; currencyCode: string }> = {
  UNSET: { locale: "ar", currencyCode: "XXX" },
  EG: { locale: "ar-EG", currencyCode: "EGP" },
  SA: { locale: "ar-SA", currencyCode: "SAR" },
  AE: { locale: "ar-AE", currencyCode: "AED" },
};

export function normalizeLanguage(value: string | null): "ar" | "en" {
  return value === "en" ? "en" : "ar";
}

const LocalizationContext = createContext<ClientLocalization | null>(null);

export function LocalizationProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [languageOverride, setLanguageOverride] = useState<"ar" | "en">(() => {
    if (typeof window === "undefined") return "ar";
    return normalizeLanguage(window.localStorage.getItem("medora-language"));
  });
  const branchRegistry = trpc.regional.myBranchJurisdictions.useQuery(undefined, { enabled: Boolean(user), retry: false, refetchOnWindowFocus: false });
  const [selectedBranchId, setSelectedBranchId] = useState<number | null>(null);
  const branches = useMemo(() => (branchRegistry.data ?? []).filter(item => item.branch && item.profile).map(item => ({ id: item.branch!.id, nameAr: item.branch!.nameAr, countryCode: item.profile!.countryCode })), [branchRegistry.data]);
  const confirmedBranch = branches.length ? (branchRegistry.data?.find(item => item.branch?.id === selectedBranchId && item.assignment?.jurisdictionId && item.profile?.active === 1) ?? branchRegistry.data?.find(item => item.assignment?.jurisdictionId && item.profile?.active === 1) ?? null) : null;
  const countryCode = confirmedBranch?.profile?.countryCode ?? "UNSET";
  const defaults = countryDefaults[countryCode] ?? { locale: "ar", currencyCode: "XXX" };
  const language = languageOverride;
  const setLanguage = (nextLanguage: "ar" | "en") => {
    setLanguageOverride(nextLanguage);
    try { window.localStorage.setItem("medora-language", nextLanguage); } catch {}
  };
  const dictionary = dictionaries[language] ?? dictionaries.ar;
  const value = useMemo<ClientLocalization>(() => ({
    countryCode,
    locale: defaults.locale,
    language,
    direction: language === "ar" ? "rtl" : "ltr",
    currencyCode: defaults.currencyCode,
    calendar: "gregory",
    numberingSystem: "latn",
    t: (key) => dictionary[key] ?? dictionaries.ar[key] ?? key,
    formatCurrency: (amount) => new Intl.NumberFormat(`${defaults.locale}-u-ca-gregory-nu-latn`, { style: "currency", currency: defaults.currencyCode }).format(amount),
    setCountry: () => {
      // Legal jurisdiction is controlled by the authenticated branch registry;
      // a client-side country toggle must never change regulated behavior.
    },
    setLanguage,
    branchId: confirmedBranch?.branch?.id ?? null,
    jurisdictionId: confirmedBranch?.assignment?.jurisdictionId ?? null,
    branches,
    setBranchId: (branchId) => {
      if (branches.some(branch => branch.id === branchId)) setSelectedBranchId(branchId);
    },
  }), [countryCode, defaults.currencyCode, defaults.locale, dictionary, language, languageOverride, confirmedBranch, branches]);

  useEffect(() => {
    document.documentElement.lang = value.language;
    document.documentElement.dir = value.direction;
    document.documentElement.dataset.country = value.countryCode;
  }, [value]);

  return <LocalizationContext.Provider value={value}>{children}</LocalizationContext.Provider>;
}

export function useLocalization() {
  const value = useContext(LocalizationContext);
  if (!value) throw new Error("useLocalization must be used inside LocalizationProvider");
  return value;
}
