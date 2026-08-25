import { describe, expect, it } from "vitest";
import { operationsHubBundles } from "../shared/operations-hub";

describe("operations hub bundles", () => {
  it("covers the priority healthcare sectors without claiming unsupported integrations", () => {
    expect(operationsHubBundles).toHaveLength(6);
    expect(operationsHubBundles.map(bundle => bundle.title)).toEqual([
      "الصيدليات وسلاسل الصيدليات",
      "المستشفيات والجهات الصحية",
      "التوزيع وسلاسل الإمداد",
      "المعامل ومراكز الأشعة",
      "التأمين والجهات الدافعة",
      "التأهيل والرعاية الممتدة",
    ]);
    expect(operationsHubBundles.some(bundle => bundle.state === "اعتماد مطلوب")).toBe(true);
    expect(operationsHubBundles.every(bundle => bundle.summary.length > 20)).toBe(true);
  });
});
