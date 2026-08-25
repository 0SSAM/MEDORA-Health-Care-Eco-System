// MEDORA | ميدورا — Integrated Health Care System
// Copyright (c) 2026 Hossam Naeim Osman | حسام نعيم عثمان. All rights reserved.
// Proprietary and confidential. Unauthorized copying, distribution, or use of this
// software, or of any portion of it, is strictly prohibited.
// Source: https://github.com/0SSAM/MEDORA-Health-Care-Eco-System
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

  it("finds a record when the user typed English keys while Arabic layout was active", () => {
    expect(keyboardLayoutCandidates("fhvhsdjhl,g").length).toBeGreaterThan(0);
    const results = smartSearch([{ nameAr: "باراسيتامول", nameEn: "Paracetamol" }], "fhvhsdjhl,g", ["nameAr", "nameEn"]);
    expect(results.length).toBe(1);
    expect(results[0].matchedBy).toBe("keyboard-layout");
  });

  it("returns no false positive for unrelated input", () => {
    expect(smartSearch(records, "xyz-unknown", ["nameAr", "nameEn", "ingredient"])).toEqual([]);
  });

  it("returns all records without a query", () => {
    expect(smartSearch(records, "", ["nameAr"]).map(result => result.item.id)).toEqual(["1", "2"]);
  });
});
