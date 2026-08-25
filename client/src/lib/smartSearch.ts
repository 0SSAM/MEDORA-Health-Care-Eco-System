// MEDORA | ميدورا — Integrated Health Care System
// Copyright (c) 2026 Hossam Naeim Osman | حسام نعيم عثمان. All rights reserved.
// Proprietary and confidential. Unauthorized copying, distribution, or use of this
// software, or of any portion of it, is strictly prohibited.
// Source: https://github.com/0SSAM/MEDORA-Health-Care-Eco-System
export type SearchableRecord = Record<string, unknown>;

const arabicDiacritics = /[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED]/g;
const arabicToEnglish: Record<string, string> = {
  ض: "q", ص: "w", ث: "e", ق: "r", ف: "t", غ: "y", ع: "u", ه: "i", خ: "o", ح: "p", ج: "[", د: "]",
  ش: "a", س: "s", ي: "d", ب: "f", ل: "g", ا: "h", ت: "j", ن: "k", م: "l", ك: ";", ط: "'",
  ئ: "z", ء: "x", ؤ: "c", ر: "v", لا: "b", ى: "n", ة: "m", و: ",", ز: ".", ظ: "/",
};
const englishToArabic = Object.fromEntries(Object.entries(arabicToEnglish).map(([key, value]) => [value, key]));

export function normalizeSearchText(value: string): string {
  return value
    .normalize("NFKC")
    .replace(arabicDiacritics, "")
    .replace(/[إأآٱ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ؤ/g, "و")
    .replace(/ئ/g, "ي")
    .replace(/ة/g, "ه")
    .toLocaleLowerCase("ar-EG")
    .replace(/[^A-Za-z0-9\u0600-\u06FF]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function mapKeyboard(value: string, mapping: Record<string, string>): string {
  return Array.from(value).map(character => mapping[character] ?? mapping[character.toLocaleLowerCase()] ?? character).join("");
}

export function keyboardLayoutCandidates(value: string): string[] {
  const trimmed = value.trim();
  if (!trimmed) return [];
  const candidates = [mapKeyboard(trimmed, arabicToEnglish), mapKeyboard(trimmed, englishToArabic)]
    .map(normalizeSearchText)
    .filter(candidate => candidate && candidate !== normalizeSearchText(trimmed));
  return Array.from(new Set(candidates));
}

export type SearchResult<T> = {
  item: T;
  score: number;
  matchedBy: "direct" | "keyboard-layout";
  queryUsed: string;
};

export function smartSearch<T extends SearchableRecord>(items: T[], query: string, fields: string[]): SearchResult<T>[] {
  const directQuery = normalizeSearchText(query);
  if (!directQuery) return items.map(item => ({ item, score: 0, matchedBy: "direct", queryUsed: "" }));
  const alternatives = keyboardLayoutCandidates(query);
  const queries: Array<{ value: string; matchedBy: "direct" | "keyboard-layout" }> = [
    { value: directQuery, matchedBy: "direct" },
    ...alternatives.map(value => ({ value, matchedBy: "keyboard-layout" as const })),
  ];
  return items.map(item => {
    const haystack = fields.map(field => String(item[field] ?? "")).map(normalizeSearchText).filter(Boolean).join(" ");
    let best: SearchResult<T> | null = null;
    for (const candidate of queries) {
      if (!haystack.includes(candidate.value)) continue;
      const exact = haystack === candidate.value ? 100 : 0;
      const tokenBonus = haystack.split(" ").some(token => token.startsWith(candidate.value)) ? 20 : 0;
      const score = exact + tokenBonus + Math.min(candidate.value.length, 40);
      if (!best || score > best.score) best = { item, score, matchedBy: candidate.matchedBy, queryUsed: candidate.value };
    }
    return best;
  }).filter((result): result is SearchResult<T> => Boolean(result)).sort((a, b) => b.score - a.score);
}

export function describeSearchMatch(result: Pick<SearchResult<unknown>, "matchedBy">): string {
  return result.matchedBy === "keyboard-layout" ? "تم تصحيح تبديل لغة لوحة المفاتيح" : "مطابقة مباشرة";
}
