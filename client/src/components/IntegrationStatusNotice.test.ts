// MEDORA | ميدورا — Integrated Health Care System
// Copyright (c) 2026 Hossam Naeim Osman | حسام نعيم عثمان. All rights reserved.
// Proprietary and confidential. Unauthorized copying, distribution, or use of this
// software, or of any portion of it, is strictly prohibited.
// Source: https://github.com/0SSAM/MEDORA-Health-Care-Eco-System
import { describe, expect, it } from "vitest";
import { integrationStatusContent } from "./IntegrationStatusNotice";

describe("integration status notices", () => {
  it("keeps government integration explicitly fail-closed", () => {
    expect(integrationStatusContent.government.title).toContain("مغلقة");
    expect(integrationStatusContent.government.details).toContain("لا يتم إرسال");
    expect(integrationStatusContent.government.details).toContain("UPA");
    expect(integrationStatusContent.government.details).toContain("EDA");
  });

  it("explains that insurance requires official credentials and acceptance", () => {
    expect(integrationStatusContent.insurance.title).toContain("مغلق");
    expect(integrationStatusContent.insurance.details).toContain("الاعتمادات");
    expect(integrationStatusContent.insurance.details).toContain("بيئة الاختبار");
  });
});
