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
  matchKind: "exact" | "prefix" | "contains" | "tolerant";
  queryUsed: string;
};

function boundedEditDistance(left: string, right: string, limit: number): number {
  if (Math.abs(left.length - right.length) > limit) return limit + 1;
  let previous = Array.from({ length: right.length + 1 }, (_, index) => index);
  for (let leftIndex = 1; leftIndex <= left.length; leftIndex += 1) {
    const current = [leftIndex];
    let rowMinimum = current[0];
    for (let rightIndex = 1; rightIndex <= right.length; rightIndex += 1) {
      const cost = left[leftIndex - 1] === right[rightIndex - 1] ? 0 : 1;
      const next = Math.min(
        previous[rightIndex] + 1,
        current[rightIndex - 1] + 1,
        previous[rightIndex - 1] + cost,
      );
      current.push(next);
      rowMinimum = Math.min(rowMinimum, next);
    }
    if (rowMinimum > limit) return limit + 1;
    previous = current;
  }
  return previous[right.length];
}

function maxTypoDistance(value: string): number {
  if (value.length >= 9) return 2;
  if (value.length >= 4) return 1;
  return 0;
}

function findMatch(haystack: string, query: string): Pick<SearchResult<unknown>, "matchKind" | "score"> | null {
  const tokens = haystack.split(" ").filter(Boolean);
  if (haystack === query || tokens.includes(query)) return { matchKind: "exact", score: 400 };
  if (tokens.some(token => token.startsWith(query))) return { matchKind: "prefix", score: 300 };
  if (haystack.includes(query)) return { matchKind: "contains", score: 200 };

  const typoLimit = maxTypoDistance(query);
  if (!typoLimit) return null;
  const closestDistance = tokens.reduce((best, token) => Math.min(best, boundedEditDistance(query, token, typoLimit)), typoLimit + 1);
  return closestDistance <= typoLimit
    ? { matchKind: "tolerant", score: 100 - closestDistance * 10 }
    : null;
}

export function smartSearch<T extends SearchableRecord>(items: T[], query: string, fields: string[]): SearchResult<T>[] {
  const directQuery = normalizeSearchText(query);
  if (!directQuery) return items.map(item => ({ item, score: 0, matchedBy: "direct", matchKind: "contains", queryUsed: "" }));
  const alternatives = keyboardLayoutCandidates(query);
  const queries: Array<{ value: string; matchedBy: "direct" | "keyboard-layout" }> = [
    { value: directQuery, matchedBy: "direct" },
    ...alternatives.map(value => ({ value, matchedBy: "keyboard-layout" as const })),
  ];
  return items.map(item => {
    const haystack = fields.map(field => String(item[field] ?? "")).map(normalizeSearchText).filter(Boolean).join(" ");
    let best: SearchResult<T> | null = null;
    for (const candidate of queries) {
      const match = findMatch(haystack, candidate.value);
      if (!match) continue;
      const score = match.score + Math.min(candidate.value.length, 40) + (candidate.matchedBy === "direct" ? 5 : 0);
      if (!best || score > best.score) best = { item, score, matchedBy: candidate.matchedBy, matchKind: match.matchKind, queryUsed: candidate.value };
    }
    return best;
  }).filter((result): result is SearchResult<T> => Boolean(result)).sort((a, b) => b.score - a.score);
}

export function describeSearchMatch(result: Pick<SearchResult<unknown>, "matchedBy" | "matchKind">): string {
  return result.matchedBy === "keyboard-layout" ? "تم تصحيح تبديل لغة لوحة المفاتيح" : "مطابقة مباشرة";
}
