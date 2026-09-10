export type LocalInvoiceExportState = { invoiceId?: number | null; status?: string | null } | null;

export function canExportLocalInvoice(invoice: LocalInvoiceExportState) {
  const invoiceId = invoice?.invoiceId;
  return Boolean(typeof invoiceId === "number" && Number.isInteger(invoiceId) && invoiceId > 0 && invoice?.status === "ISSUED_LOCAL");
}

export function sanitizeTaxInvoiceFileName(invoiceNumber: string) {
  const normalized = invoiceNumber.trim().replace(/[^a-zA-Z0-9._-]+/g, "-").replace(/^-+|-+$/g, "");
  return (normalized || "medora-tax-invoice").slice(0, 120);
}

export function formatTaxInvoiceAmount(value: number, currencyCode: string) {
  return `${value.toFixed(2)} ${currencyCode}`;
}
