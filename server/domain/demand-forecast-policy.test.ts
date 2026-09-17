import { describe, expect, it } from "vitest";
import { calculateDemandRecommendation, canReadDemandForecast } from "./demand-forecast-policy";

const base = { scope: { organizationId: 1, branchId: 10, jurisdictionId: 20 }, productId: "MED-1", dailyUnits: [10, 12, 8, 11, 9, 10, 12, 10], onHand: 20, openOrderUnits: 5, leadTimeDays: 3, reviewPeriodDays: 2, serviceLevel: "high" as const, shelfLifeDays: 120 };

describe("demand forecast policy", () => {
  it("returns a fail-closed no-data state for insufficient history", () => {
    const result = calculateDemandRecommendation({ ...base, dailyUnits: [10, 12, 8] });
    expect(result.dataQuality).toBe("insufficient");
    expect(result.suggestedOrderUnits).toBeNull();
    expect(result.requiresReview).toBe(true);
  });

  it("calculates an explainable reorder recommendation using open orders", () => {
    const result = calculateDemandRecommendation(base);
    expect(result.dataQuality).toBe("limited");
    expect(result.forecastDailyUnits).toBe(10.25);
    expect(result.reorderPointUnits).toBeGreaterThan(0);
    expect(result.suggestedOrderUnits).toBeLessThanOrEqual(result.reorderPointUnits!);
    expect(result.explanation.join(" ")).toContain("المتوسط اليومي");
  });

  it("flags short shelf life against the supply cycle", () => {
    const result = calculateDemandRecommendation({ ...base, shelfLifeDays: 2 });
    expect(result.explanation.join(" ")).toContain("FEFO");
  });

  it("requires exact organization, branch, and jurisdiction scope", () => {
    expect(canReadDemandForecast(base.scope, base.scope)).toBe(true);
    expect(canReadDemandForecast(base.scope, { ...base.scope, branchId: 11 })).toBe(false);
    expect(canReadDemandForecast(base.scope, { ...base.scope, organizationId: 2 })).toBe(false);
  });

  it("rejects negative stock inputs", () => {
    expect(() => calculateDemandRecommendation({ ...base, onHand: -1 })).toThrow("FORECAST_INVALID_ON_HAND");
  });

  it("rejects every mismatched organization, branch, or jurisdiction scope", () => {
    expect(canReadDemandForecast(base.scope, { ...base.scope, organizationId: 2 })).toBe(false);
    expect(canReadDemandForecast(base.scope, { ...base.scope, branchId: 11 })).toBe(false);
    expect(canReadDemandForecast(base.scope, { ...base.scope, jurisdictionId: 21 })).toBe(false);
  });

  it("keeps an empty real history fail-closed", () => {
    const result = calculateDemandRecommendation({ ...base, dailyUnits: [0, 0, 0, 0, 0, 0] });
    expect(result.dataQuality).toBe("insufficient");
    expect(result.suggestedOrderUnits).toBeNull();
    expect(result.requiresReview).toBe(true);
  });
});
