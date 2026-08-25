// MEDORA | ميدورا — Integrated Health Care System
// Copyright (c) 2026 Hossam Naeim Osman | حسام نعيم عثمان. All rights reserved.
// Proprietary and confidential. Unauthorized copying, distribution, or use of this
// software, or of any portion of it, is strictly prohibited.
// Source: https://github.com/0SSAM/MEDORA-Health-Care-Eco-System
import { describe, expect, it } from "vitest";
import { getReviewValidation } from "./AiInsightsWorkspace";

describe("AI purchasing review validation", () => {
  it("allows keeping an insight under review without a note", () => {
    expect(getReviewValidation("under_review", "")).toBeNull();
  });

  it("requires a note before advisory acceptance", () => {
    expect(getReviewValidation("accepted", "   ")).toContain("اعتماد");
    expect(getReviewValidation("accepted", "تم التحقق من المخزون")).toBeNull();
  });

  it("requires a reason before rejection or dismissal", () => {
    expect(getReviewValidation("rejected", "")).toContain("سبب");
    expect(getReviewValidation("dismissed", "")).toContain("سبب");
    expect(getReviewValidation("rejected", "لا تنطبق على هذا الفرع")).toBeNull();
  });
});
