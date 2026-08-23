export type StocktakeStatus = "draft" | "counting" | "review" | "approved" | "cancelled";

export type StocktakeLine = { productId: number; expectedQuantity: number; countedQuantity?: number; variance?: number; reason?: string };
export type Stocktake = { id: number; organizationId: number; branchId: number; createdByUserId: number; status: StocktakeStatus; demoOnly: boolean; lines: StocktakeLine[] };

export function startStocktake(input: { id: number; organizationId: number; branchId: number; createdByUserId: number; productIds: number[]; expectedQuantities: number[]; demoOnly: boolean }): Stocktake {
  if (![input.id, input.organizationId, input.branchId, input.createdByUserId].every(Number.isInteger) || input.productIds.length === 0 || input.productIds.length !== input.expectedQuantities.length) throw new Error("A valid scoped stocktake with matching products is required");
  if (input.productIds.some(id => !Number.isInteger(id)) || input.expectedQuantities.some(q => !Number.isFinite(q) || q < 0)) throw new Error("Stocktake quantities must be non-negative");
  return { id: input.id, organizationId: input.organizationId, branchId: input.branchId, createdByUserId: input.createdByUserId, status: "counting", demoOnly: input.demoOnly, lines: input.productIds.map((productId, index) => ({ productId, expectedQuantity: input.expectedQuantities[index] })) };
}

export function recordStocktakeCount(stocktake: Stocktake, productId: number, countedQuantity: number, reason?: string): Stocktake {
  if (stocktake.status !== "counting") throw new Error("Counts require an active stocktake");
  if (!Number.isInteger(productId) || !Number.isFinite(countedQuantity) || countedQuantity < 0) throw new Error("A valid counted quantity is required");
  const line = stocktake.lines.find(item => item.productId === productId);
  if (!line) throw new Error("Product is outside this stocktake scope");
  if (countedQuantity !== line.expectedQuantity && !reason?.trim()) throw new Error("A variance reason is required");
  return { ...stocktake, lines: stocktake.lines.map(item => item.productId === productId ? { ...item, countedQuantity, variance: Number((countedQuantity - item.expectedQuantity).toFixed(2)), reason: reason?.trim() } : item) };
}

export function submitStocktakeForReview(stocktake: Stocktake): Stocktake {
  if (stocktake.status !== "counting" || stocktake.lines.some(line => line.countedQuantity === undefined)) throw new Error("Every stocktake line must be counted before review");
  return { ...stocktake, status: "review" };
}

export function approveStocktake(stocktake: Stocktake, approvedByUserId: number): Stocktake {
  if (stocktake.status !== "review") throw new Error("Only a reviewed stocktake can be approved");
  if (!Number.isInteger(approvedByUserId) || approvedByUserId === stocktake.createdByUserId) throw new Error("Stocktake approval requires an independent reviewer");
  return { ...stocktake, status: "approved" };
}

export function assertDemoStocktakeIsolation(stocktake: Stocktake) {
  if (stocktake.demoOnly !== true) throw new Error("Demo stocktake requires an explicit demo-only marker");
  return true as const;
}
