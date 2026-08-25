export type PromotionInput = {
  status: "draft" | "active" | "paused" | "expired" | "archived";
  discountType: "percent" | "fixed";
  discountValue: number;
  startsAt: Date;
  endsAt: Date;
  usageLimit: number | null;
  usageCount: number;
  now: Date;
  subtotal: number;
};

export function evaluatePromotion(input: PromotionInput) {
  if (input.status !== "active") throw new Error("Promotion is not active");
  if (input.endsAt <= input.startsAt) throw new Error("Promotion period is invalid");
  if (input.now < input.startsAt || input.now >= input.endsAt) throw new Error("Promotion is outside its active period");
  if (!Number.isFinite(input.subtotal) || input.subtotal <= 0) throw new Error("Subtotal must be positive");
  if (!Number.isFinite(input.discountValue) || input.discountValue < 0) throw new Error("Promotion discount is invalid");
  if (input.usageLimit !== null && (input.usageLimit < 1 || input.usageCount >= input.usageLimit)) throw new Error("Promotion usage limit reached");
  const rawDiscount = input.discountType === "percent" ? input.subtotal * input.discountValue / 100 : input.discountValue;
  const discountAmount = Number(Math.min(input.subtotal, rawDiscount).toFixed(2));
  if (input.discountType === "percent" && input.discountValue > 7) throw new Error("Promotion exceeds the statutory discount cap");
  return { eligible: true as const, discountAmount, total: Number((input.subtotal - discountAmount).toFixed(2)) };
}
