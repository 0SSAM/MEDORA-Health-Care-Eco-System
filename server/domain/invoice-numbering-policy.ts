export type InvoiceNumberingContext = {
  jurisdictionSequenceBound: boolean;
  fiscalPeriodValid: boolean;
  sequenceUnique: boolean;
  gapHandlingConfigured: boolean;
  auditMetadataConfigured: boolean;
};

export function invoiceNumberingReadiness(context: InvoiceNumberingContext | null) {
  if (!context) return "BLOCKED" as const;
  return Object.values(context).every(Boolean) ? "READY" as const : "BLOCKED" as const;
}

export function assertInvoiceNumberingReady(context: InvoiceNumberingContext | null) {
  if (invoiceNumberingReadiness(context) !== "READY") throw new Error("Invoice numbering is not ready");
  return true as const;
}
