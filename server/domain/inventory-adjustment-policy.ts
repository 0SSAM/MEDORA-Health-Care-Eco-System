// MEDORA | ميدورا — Integrated Health Care System
// Inventory Adjustment Domain Policy

export type AdjustmentType = "expired" | "damaged" | "lost" | "found" | "correction";
export type AdjustmentStatus = "pending" | "approved" | "rejected";

export function canApproveAdjustment(currentStatus: AdjustmentStatus, role: string): boolean {
  return currentStatus === "pending" && (role === "admin" || role === "manager");
}

export function calculateNewStock(currentStock: number, adjustmentQty: number, type: AdjustmentType): number {
  if (type === "found" || (type === "correction" && adjustmentQty > 0)) {
    return currentStock + Math.abs(adjustmentQty);
  }
  return Math.max(0, currentStock - Math.abs(adjustmentQty));
}

export function validateAdjustmentReason(type: AdjustmentType, reason: string | undefined): boolean {
  if ((type === "damaged" || type === "lost" || type === "expired") && (!reason || reason.length < 5)) {
    return false;
  }
  return true;
}
