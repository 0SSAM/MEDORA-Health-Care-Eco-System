export type AppRole = "admin" | "pharmacist" | "cashier" | "manager";

export const ROLE_PERMISSIONS: Record<AppRole, string[]> = {
  admin: ["*"],
  manager: ["dashboard.read", "inventory.read", "inventory.write", "insurance.read", "reports.read", "staff.read", "alerts.read"],
  pharmacist: ["dashboard.read", "inventory.read", "pos.sell", "prescription.review", "compounding.write", "customer.read"],
  cashier: ["dashboard.read", "inventory.read", "pos.sell", "customer.read"],
};

export function hasPermission(role: AppRole, permission: string) {
  return ROLE_PERMISSIONS[role]?.includes("*") || ROLE_PERMISSIONS[role]?.includes(permission) || false;
}

export function enforceDiscount(officialPrice: number, discountAmount: number) {
  if (!Number.isFinite(officialPrice) || officialPrice < 0) throw new Error("Invalid official price");
  if (!Number.isFinite(discountAmount) || discountAmount < 0) throw new Error("Invalid discount");
  const maxDiscount = Number((officialPrice * 0.07).toFixed(2));
  if (discountAmount > maxDiscount) {
    return { allowed: false, maxDiscount, reason: "MOH discount cap exceeded" } as const;
  }
  return { allowed: true, maxDiscount, reason: null } as const;
}

export type StockBatch = { id: string; expiryDate: Date; quantityOnHand: number };

export function selectFefoBatches(batches: StockBatch[], requestedQuantity: number) {
  if (!Number.isFinite(requestedQuantity) || requestedQuantity <= 0) throw new Error("Quantity must be positive");
  const eligible = batches
    .filter(batch => batch.quantityOnHand > 0)
    .sort((a, b) => a.expiryDate.getTime() - b.expiryDate.getTime());
  const total = eligible.reduce((sum, batch) => sum + batch.quantityOnHand, 0);
  if (total < requestedQuantity) throw new Error("Insufficient stock");
  let remaining = requestedQuantity;
  return eligible.map(batch => {
    const deducted = Math.min(batch.quantityOnHand, remaining);
    remaining -= deducted;
    return { batchId: batch.id, quantity: deducted };
  }).filter(item => item.quantity > 0);
}

export function getInventoryAlert(quantityOnHand: number, reorderPoint: number, expiryDate: Date, now = new Date()) {
  const daysToExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / 86_400_000);
  return {
    belowReorderPoint: quantityOnHand <= reorderPoint,
    expiringWithin30Days: daysToExpiry >= 0 && daysToExpiry <= 30,
    daysToExpiry,
  };
}

export type ModuleId = "overview" | "pos" | "inventory" | "prescriptions" | "insurance" | "compliance" | "compounding" | "finance" | "people";
const MODULE_ROLES: Record<ModuleId, AppRole[]> = {
  overview: ["admin", "manager", "pharmacist", "cashier"],
  pos: ["admin", "manager", "pharmacist", "cashier"],
  inventory: ["admin", "manager", "pharmacist"],
  prescriptions: ["admin", "manager", "pharmacist"],
  insurance: ["admin", "manager", "pharmacist"],
  compliance: ["admin", "manager", "pharmacist"],
  compounding: ["admin", "manager", "pharmacist"],
  finance: ["admin", "manager"],
  people: ["admin", "manager"],
};
export function canAccessModule(role: AppRole | "user", module: ModuleId) {
  return role !== "user" && MODULE_ROLES[module].includes(role as AppRole);
}
