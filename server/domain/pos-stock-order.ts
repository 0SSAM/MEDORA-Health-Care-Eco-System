export type ExpiringStock = { expiryDate: Date | string };

function expiryTimestamp(value: Date | string): number {
  const timestamp = new Date(value).getTime();
  return Number.isFinite(timestamp) ? timestamp : Number.MAX_SAFE_INTEGER;
}

/** Sorts already-scoped POS rows by FEFO without relying on a driver-specific date shape. */
export function sortAvailableStockByExpiry<T extends ExpiringStock>(rows: readonly T[]): T[] {
  return [...rows].sort((left, right) => expiryTimestamp(left.expiryDate) - expiryTimestamp(right.expiryDate));
}
