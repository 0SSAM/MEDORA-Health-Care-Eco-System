export type ForecastDataQuality = "sufficient" | "limited" | "insufficient";

export interface DemandForecastScope {
  organizationId: number;
  branchId: number;
  jurisdictionId: number;
}

export interface DemandHistory {
  scope: DemandForecastScope;
  productId: string;
  dailyUnits: number[];
  onHand: number;
  openOrderUnits: number;
  leadTimeDays: number;
  reviewPeriodDays: number;
  serviceLevel: "standard" | "high" | "critical";
  shelfLifeDays: number | null;
}

export interface DemandRecommendation {
  productId: string;
  scope: DemandForecastScope;
  dataQuality: ForecastDataQuality;
  forecastDailyUnits: number | null;
  safetyStockUnits: number | null;
  reorderPointUnits: number | null;
  suggestedOrderUnits: number | null;
  explanation: string[];
  requiresReview: boolean;
}

const zByServiceLevel = { standard: 1.28, high: 1.65, critical: 2.05 } as const;

function assertNonNegative(value: number, field: string) {
  if (!Number.isFinite(value) || value < 0) throw new Error(`FORECAST_INVALID_${field.toUpperCase()}`);
}

export function canReadDemandForecast(scope: DemandForecastScope, requested: DemandForecastScope): boolean {
  return scope.organizationId === requested.organizationId && scope.branchId === requested.branchId && scope.jurisdictionId === requested.jurisdictionId;
}

export function calculateDemandRecommendation(input: DemandHistory): DemandRecommendation {
  assertNonNegative(input.onHand, "on_hand");
  assertNonNegative(input.openOrderUnits, "open_order_units");
  assertNonNegative(input.leadTimeDays, "lead_time_days");
  assertNonNegative(input.reviewPeriodDays, "review_period_days");
  if (!input.productId.trim() || input.dailyUnits.some(unit => !Number.isFinite(unit) || unit < 0)) throw new Error("FORECAST_INVALID_HISTORY");

  const history = input.dailyUnits;
  const quality: ForecastDataQuality = history.length >= 28 ? "sufficient" : history.length >= 7 ? "limited" : "insufficient";
  if (quality === "insufficient") {
    return { productId: input.productId, scope: input.scope, dataQuality: quality, forecastDailyUnits: null, safetyStockUnits: null, reorderPointUnits: null, suggestedOrderUnits: null, requiresReview: true, explanation: ["لا توجد بيانات تاريخية كافية لإصدار توصية آلية.", "يلزم اعتماد مسؤول المخزون وإدخال سجل موثوق لا يقل عن 7 أيام."] };
  }

  const mean = history.reduce((sum, unit) => sum + unit, 0) / history.length;
  const variance = history.reduce((sum, unit) => sum + (unit - mean) ** 2, 0) / history.length;
  const standardDeviation = Math.sqrt(variance);
  const safetyStock = Math.ceil(zByServiceLevel[input.serviceLevel] * standardDeviation * Math.sqrt(Math.max(1, input.leadTimeDays)));
  const reorderPoint = Math.ceil(mean * (input.leadTimeDays + input.reviewPeriodDays) + safetyStock);
  const available = input.onHand + input.openOrderUnits;
  const suggestedOrder = Math.max(0, reorderPoint - available);
  const explanation = [
    `المتوسط اليومي المحسوب: ${mean.toFixed(2)} وحدة من ${history.length} قراءة.`,
    `مخزون الأمان: ${safetyStock} وحدة وفق مستوى الخدمة ${input.serviceLevel}.`,
    `نقطة إعادة الطلب: ${reorderPoint} وحدة = الطلب المتوقع خلال المهلة وفترة المراجعة + مخزون الأمان.`,
    `المتاح المحتسب: ${available} وحدة (الرصيد الحالي + الطلبات المفتوحة).`,
  ];
  if (input.shelfLifeDays !== null && input.shelfLifeDays < input.leadTimeDays + input.reviewPeriodDays) explanation.push("تنبيه: مدة الصلاحية المتاحة أقصر من دورة التوريد والمراجعة؛ يجب فحص FEFO قبل أي طلب.");
  if (quality === "limited") explanation.push("جودة البيانات محدودة؛ التوصية مساعدة للقرار وليست أمراً بالشراء.");
  return { productId: input.productId, scope: input.scope, dataQuality: quality, forecastDailyUnits: Number(mean.toFixed(2)), safetyStockUnits: safetyStock, reorderPointUnits: reorderPoint, suggestedOrderUnits: suggestedOrder, explanation, requiresReview: true };
}
