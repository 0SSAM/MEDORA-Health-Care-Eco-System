import { EL_BAZ_PHARMACY } from "./elBazPharmacy";

type ReceiptLine = { name: string; qty: number; unitPrice: number; total: number };
type LabelInput = { productNameAr: string; productNameEn?: string; sku: string; batchNumber: string; expiryDate: string; barcode: string; };

const escapeHtml = (value: string) => value.replace(/[&<>\"']/g, ch => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '\"': "&quot;", "'": "&#39;" })[ch] ?? ch);

const baseCss = `@page{margin:7mm}body{font-family:Arial,sans-serif;color:#0d1b2a;margin:0}.brand{border-bottom:2px solid #0f766e;padding-bottom:6px;margin-bottom:10px}.ar{direction:rtl}.muted{color:#64748b}.row{display:flex;justify-content:space-between;gap:12px}.total{font-size:16px;font-weight:700;border-top:1px dashed #94a3b8;margin-top:10px;padding-top:8px}.footer{border-top:1px solid #e2e8f0;margin-top:12px;padding-top:8px;text-align:center;font-size:10px}`;

export function buildElBazReceiptHtml(input: { invoiceNumber: string; date: string; cashier: string; lines: ReceiptLine[]; total: number }) {
  const lines = input.lines.map(line => `<div class="row"><span>${escapeHtml(line.name)} × ${line.qty}</span><span>${line.total.toFixed(2)}</span></div>`).join("");
  return `<!doctype html><html><head><meta charset="utf-8"><title>${escapeHtml(EL_BAZ_PHARMACY.receipt.title)}</title><style>${baseCss}</style></head><body><header class="brand"><strong>${escapeHtml(EL_BAZ_PHARMACY.nameEn)}</strong><br><strong class="ar">${escapeHtml(EL_BAZ_PHARMACY.nameAr)}</strong><div class="muted">${escapeHtml(EL_BAZ_PHARMACY.addressAr)}</div><div class="muted">${EL_BAZ_PHARMACY.landline} · WhatsApp ${EL_BAZ_PHARMACY.whatsapp}</div></header><div class="row muted"><span>Invoice ${escapeHtml(input.invoiceNumber)}</span><span>${escapeHtml(input.date)}</span></div><p>Cashier: ${escapeHtml(input.cashier)}</p>${lines}<div class="row total"><span>TOTAL</span><span>${input.total.toFixed(2)} EGP</span></div><footer class="footer">${escapeHtml(EL_BAZ_PHARMACY.receipt.footer)}<br>${escapeHtml(EL_BAZ_PHARMACY.manager)}</footer></body></html>`;
}

export function buildElBazLabelHtml(input: LabelInput) {
  return `<!doctype html><html><head><meta charset="utf-8"><title>${escapeHtml(input.productNameAr)} — El-Baz Pharmacy</title><style>@page{size:58mm 35mm;margin:2mm}body{font-family:Arial,sans-serif;color:#0d1b2a;margin:0;font-size:8px}.head{font-weight:700;color:#0f766e;border-bottom:1px solid #0f766e;padding-bottom:2px}.name{font-size:10px;font-weight:700;margin-top:3px}.grid{display:grid;grid-template-columns:1fr 1fr;gap:2px;margin-top:3px}.barcode{font-family:monospace;letter-spacing:1px;font-size:9px;margin-top:4px;text-align:center}.muted{color:#64748b}</style></head><body><div class="head">${escapeHtml(EL_BAZ_PHARMACY.nameEn)} · ${escapeHtml(EL_BAZ_PHARMACY.nameAr)}</div><div class="name">${escapeHtml(input.productNameAr)}</div>${input.productNameEn ? `<div class="muted">${escapeHtml(input.productNameEn)}</div>` : ""}<div class="grid"><span>SKU: ${escapeHtml(input.sku)}</span><span>Batch: ${escapeHtml(input.batchNumber)}</span><span>EXP: ${escapeHtml(input.expiryDate)}</span><span>Barcode: ${escapeHtml(input.barcode)}</span></div><div class="barcode">||||| ${escapeHtml(input.barcode)} |||||</div></body></html>`;
}
