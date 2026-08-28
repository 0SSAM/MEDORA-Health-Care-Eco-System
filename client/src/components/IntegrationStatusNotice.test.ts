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
