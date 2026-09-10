import { describe, expect, it } from "vitest";
import { validateGovernedInsight } from "./routers/ai-insights";

describe("governed AI insight contract", () => {
  it("accepts a complete advisory result with bounded confidence", () => {
    const result = validateGovernedInsight({
      title: "أولوية مراجعة المخزون",
      summary: "توجد أصناف تحتاج مراجعة تشغيلية.",
      evidence: [
        {
          metric: "متوسط الطلب اليومي",
          value: "4.2",
          source: "مبيعات الفرع خلال 56 يومًا",
        },
      ],
      recommendations: [
        {
          action: "مراجعة نقطة إعادة الطلب",
          rationale: "الفجوة بين المخزون والحد أعلى من المعتاد.",
          priority: "high",
        },
      ],
      confidence: 0.82,
      limitations: ["لا يوجد تنفيذ تلقائي للشراء"],
    });
    expect(result.confidence).toBe(0.82);
    expect(result.recommendations).toHaveLength(1);
  });

  it("rejects missing summaries and out-of-range confidence", () => {
    expect(() =>
      validateGovernedInsight({
        title: "x",
        summary: "",
        evidence: [],
        recommendations: [],
        confidence: 0.4,
        limitations: [],
      })
    ).toThrow();
    expect(() =>
      validateGovernedInsight({
        title: "x",
        summary: "ok",
        evidence: [],
        recommendations: [],
        confidence: 1.1,
        limitations: [],
      })
    ).toThrow();
  });

  it("rejects non-object model output", () => {
    expect(() => validateGovernedInsight(null)).toThrow();
    expect(() => validateGovernedInsight("not-json")).toThrow();
  });
});
