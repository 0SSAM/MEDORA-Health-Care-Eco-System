export const allowedReportSortKeys = ["date", "amount", "status"] as const;
export type ReportSortKey = (typeof allowedReportSortKeys)[number];

export function escapeSpreadsheetCell(value: unknown): string {
  return String(value ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\"/g, "&quot;");
}

export function isDateInRange(value: Date | null | undefined, fromDate?: string, toDate?: string): boolean {
  if (!value || Number.isNaN(value.getTime())) return !fromDate && !toDate;
  if (fromDate && value < new Date(`${fromDate}T00:00:00`)) return false;
  if (toDate && value > new Date(`${toDate}T23:59:59`)) return false;
  return true;
}

export function compareReportValues(left: string | number, right: string | number, direction: "asc" | "desc"): number {
  const result = left < right ? -1 : left > right ? 1 : 0;
  return direction === "asc" ? result : -result;
}
