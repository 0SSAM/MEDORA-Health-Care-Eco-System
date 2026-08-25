export type VatRule = {
  code: string;
  rate: number;
  exempt: boolean;
  verified: boolean;
};

export type VatInvoiceContext = {
  countryCode: string;
  currencyCode: string;
  rulesVerified: boolean;
  ratesVerified: boolean;
  roundingRulesVerified: boolean;
  invoiceIdentityVerified: boolean;
  taxRegistrationReference: string | null;
};

export type VatInvoiceLine = {
  sku: string;
  quantity: number;
  unitPrice: number;
  discountAmount?: number;
  vatRule: VatRule;
};

export function assertVatInvoiceReady(context: VatInvoiceContext | null) {
  if (!context || !context.rulesVerified || !context.ratesVerified || !context.roundingRulesVerified || !context.invoiceIdentityVerified || !context.taxRegistrationReference) {
    throw new Error("VAT invoice readiness is incomplete for this jurisdiction");
  }
  return true as const;
}

export function calculateVatInvoice(context: VatInvoiceContext, lines: VatInvoiceLine[]) {
  assertVatInvoiceReady(context);
  if (!lines.length) throw new Error("VAT invoice requires at least one line");
  const calculated = lines.map(line => {
    if (!line.sku.trim() || !Number.isFinite(line.quantity) || line.quantity <= 0 || !Number.isFinite(line.unitPrice) || line.unitPrice < 0) throw new Error("VAT invoice line is invalid");
    if (!line.vatRule.verified || !Number.isFinite(line.vatRule.rate) || line.vatRule.rate < 0 || line.vatRule.rate > 100) throw new Error("VAT rule is not verified");
    const gross = Number((line.quantity * line.unitPrice).toFixed(2));
    const discount = Number((line.discountAmount ?? 0).toFixed(2));
    if (discount < 0 || discount > gross) throw new Error("VAT line discount is invalid");
    const taxable = Number((gross - discount).toFixed(2));
    const tax = line.vatRule.exempt ? 0 : Number((taxable * line.vatRule.rate / 100).toFixed(2));
    return { ...line, gross, discount, taxable, tax, total: Number((taxable + tax).toFixed(2)) };
  });
  const subtotal = Number(calculated.reduce((sum, line) => sum + line.taxable, 0).toFixed(2));
  const vatAmount = Number(calculated.reduce((sum, line) => sum + line.tax, 0).toFixed(2));
  return { countryCode: context.countryCode, currencyCode: context.currencyCode, lines: calculated, subtotal, vatAmount, total: Number((subtotal + vatAmount).toFixed(2)) };
}
