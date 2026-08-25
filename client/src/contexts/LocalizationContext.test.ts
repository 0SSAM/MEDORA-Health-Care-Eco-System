// MEDORA | ميدورا — Integrated Health Care System
// Copyright (c) 2026 Hossam Naeim Osman | حسام نعيم عثمان. All rights reserved.
// Proprietary and confidential. Unauthorized copying, distribution, or use of this
// software, or of any portion of it, is strictly prohibited.
// Source: https://github.com/0SSAM/MEDORA-Health-Care-Eco-System
import { describe, expect, it } from "vitest";
import { normalizeLanguage } from "./LocalizationContext";

describe("language preference", () => {
  it("accepts English and safely falls back to Arabic", () => {
    expect(normalizeLanguage("en")).toBe("en");
    expect(normalizeLanguage("ar")).toBe("ar");
    expect(normalizeLanguage("fr")).toBe("ar");
    expect(normalizeLanguage(null)).toBe("ar");
  });
});
