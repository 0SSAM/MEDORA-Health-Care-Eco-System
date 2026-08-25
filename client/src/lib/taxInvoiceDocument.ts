// MEDORA | ميدورا — Integrated Health Care System
// Copyright (c) 2026 Hossam Naeim Osman | حسام نعيم عثمان. All rights reserved.
// Proprietary and confidential. Unauthorized copying, distribution, or use of this
// software, or of any portion of it, is strictly prohibited.
// Source: https://github.com/0SSAM/MEDORA-Health-Care-Eco-System
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
