import { describe, expect, it } from "vitest";
import { keyboardLayoutCandidates, normalizeSearchText, smartSearch } from "./smartSearch";

describe("smartSearch", () => {
  const records = [
    { id: "1", nameAr: "باراسيتامول", nameEn: "Paracetamol", ingredient: "Acetaminophen" },
    { id: "2", nameAr: "أموكسيسيلين", nameEn: "Amoxicillin", ingredient: "Amoxicillin" },
  ];

  it("normalizes Arabic hamza, diacritics, and spacing", () => {
    expect(normalizeSearchText("  أَمُوكسيسيلين  ")).toBe("اموكسيسيلين");
  });

  it("finds an Arabic record using its English name", () => {
    expect(smartSearch(records, "paracetamol", ["nameAr", "nameEn", "ingredient"])[0]?.item.id).toBe("1");
  });

  it("ranks exact, prefix, then contains matches by default", () => {
    const ranked = smartSearch([
      { id: "exact", name: "para" },
      { id: "prefix", name: "paracetamol" },
      { id: "contains", name: "xpara" },
    ], "para", ["name"]);
    expect(ranked.map(result => result.item.id)).toEqual(["exact", "prefix", "contains"]);
    expect(ranked.map(result => result.matchKind)).toEqual(["exact", "prefix", "contains"]);
  });

  it("finds incomplete Arabic and English terms through prefix matching", () => {
    expect(smartSearch(records, "اموكس", ["nameAr", "nameEn", "ingredient"])[0]?.item.id).toBe("2");
    expect(smartSearch(records, "amoxi", ["nameAr", "nameEn", "ingredient"])[0]?.item.id).toBe("2");
  });

  it("finds a bounded minor typing error without matching unrelated short input", () => {
    const result = smartSearch(records, "amoxcillin", ["nameAr", "nameEn", "ingredient"])[0];
    expect(result?.item.id).toBe("2");
    expect(result?.matchKind).toBe("tolerant");
    expect(smartSearch(records, "pae", ["nameAr", "nameEn", "ingredient"])).toEqual([]);
  });

  it("finds a record when the user typed English keys while Arabic layout was active", () => {
    expect(keyboardLayoutCandidates("fhvhsdjhl,g").length).toBeGreaterThan(0);
    const results = smartSearch([{ nameAr: "باراسيتامول", nameEn: "Paracetamol" }], "fhvhsdjhl,g", ["nameAr", "nameEn"]);
    expect(results.length).toBe(1);
    expect(results[0].matchedBy).toBe("keyboard-layout");
  });

  it("finds only the authorized operations route through the Arabic customer-follow-up alias", () => {
    const routes = [
      { id: "operations", label: "مركز العمليات", searchText: "operations crm workflows متابعة العملاء ادارة علاقات العملاء" },
      { id: "inventory", label: "المخزون", searchText: "inventory stock batches" },
    ];
    const results = smartSearch(routes, "متابعة العملاء", ["label", "searchText"]);
    expect(results.map(result => result.item.id)).toEqual(["operations"]);
    expect(results[0]?.matchedBy).toBe("direct");
  });

  it("does not infer a route that was excluded before the search catalogue", () => {
    const permittedRoutes = [{ id: "operations", label: "مركز العمليات", searchText: "operations crm متابعة العملاء" }];
    expect(smartSearch(permittedRoutes, "inventory", ["label", "searchText"])).toEqual([]);
  });

  it("returns no false positive for unrelated input", () => {
    expect(smartSearch(records, "xyz-unknown", ["nameAr", "nameEn", "ingredient"])).toEqual([]);
  });

  it("returns all records without a query", () => {
    expect(smartSearch(records, "", ["nameAr"]).map(result => result.item.id)).toEqual(["1", "2"]);
  });
});
