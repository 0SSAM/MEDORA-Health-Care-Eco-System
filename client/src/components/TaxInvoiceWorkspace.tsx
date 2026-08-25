// MEDORA | ميدورا — Integrated Health Care System
// Copyright (c) 2026 Hossam Naeim Osman | حسام نعيم عثمان. All rights reserved.
// Proprietary and confidential. Unauthorized copying, distribution, or use of this
// software, or of any portion of it, is strictly prohibited.
// Source: https://github.com/0SSAM/MEDORA-Health-Care-Eco-System
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { skipToken } from "@tanstack/react-query";
import { jsPDF } from "jspdf";
import { ArrowLeftRight, Download, Palette, Printer, Receipt, Save, ShieldCheck } from "lucide-react";
import { canExportLocalInvoice, formatTaxInvoiceAmount, sanitizeTaxInvoiceFileName } from "@/lib/taxInvoiceDocument";
import { useEffect, useMemo, useState } from "react";

type ReturnReason = "defect" | "wrong_item" | "change_of_mind" | "expired_or_damaged" | "recall" | "other";
type InvoiceType = "sales" | "credit_note" | "debit_note";
type InvoiceLine = { sku: string; quantity: number; unitPrice: number; discountAmount: number; vatRate: number; exempt: boolean };
type InvoiceResultLine = { sku: string; quantity: number; unitPrice: number; discountAmount?: number; vatRule: { code: string; rate: number; exempt: boolean; verified: boolean }; gross: number; discount: number; taxable: number; tax: number; total: number };
type InvoiceResult = { invoiceId: number; status: "ISSUED_LOCAL"; externalSubmission: "BLOCKED_UNTIL_ETA_CREDENTIALS"; countryCode: string; currencyCode: string; lines: InvoiceResultLine[]; subtotal: number; vatAmount: number; total: number };
type TemplateValues = { nameAr: string; nameEn: string; addressAr: string; addressEn: string; taxRegistrationNumber: string; phone: string; email: string; logoUrl: string; accentColor: string; footerAr: string; footerEn: string };
type PaperSize = "a4" | "a5" | "receipt80";
const PAPER_FORMATS: Record<PaperSize, string | number[]> = { a4: "a4", a5: "a5", receipt80: [80, 200] };
const ARABIC_FONT_URL = "/assets/NotoSansArabic-Regular_86cf5a4e.ttf";
let arabicFontDataPromise: Promise<string | null> | null = null;

const emptyTemplate: TemplateValues = { nameAr: "قالب الفاتورة الضريبية", nameEn: "Tax Invoice Template", addressAr: "", addressEn: "", taxRegistrationNumber: "", phone: "", email: "", logoUrl: "", accentColor: "#0f766e", footerAr: "فاتورة ضريبية محلية - الإرسال الرسمي غير مفعّل", footerEn: "Local tax invoice - official submission is not enabled" };

function numberText(value: number, currency: string) { return formatTaxInvoiceAmount(value, currency); }
function arText(value: string) { return value ? new jsPDF().processArabic(value) : ""; }
function escapeHtml(value: string) { return value.replace(/[&<>\"']/g, character => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#039;" })[character] ?? character); }

async function fontDataFromUrl(url: string) {
  if (!arabicFontDataPromise) {
    arabicFontDataPromise = fetch(url, { mode: "cors" }).then(response => response.ok ? response.arrayBuffer() : null).then(buffer => {
      if (!buffer) return null;
      const bytes = new Uint8Array(buffer);
      let binary = "";
      for (let index = 0; index < bytes.length; index += 0x8000) { const chunk = bytes.subarray(index, index + 0x8000); binary += String.fromCharCode.apply(null, Array.from(chunk)); }
      return btoa(binary);
    }).catch(() => null);
  }
  return arabicFontDataPromise;
}

async function imageDataFromUrl(url: string) {
  if (!url) return null;
  try {
    const response = await fetch(url, { mode: "cors" });
    if (!response.ok) return null;
    const blob = await response.blob();
    return await new Promise<string | null>(resolve => { const reader = new FileReader(); reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : null); reader.onerror = () => resolve(null); reader.readAsDataURL(blob); });
  } catch { return null; }
}

export function TaxInvoiceWorkspace({ branchId, jurisdictionId }: { branchId: number | null; jurisdictionId: number | null }) {
  const [saleId, setSaleId] = useState("");
  const [returnQuantity, setReturnQuantity] = useState("1");
  const [returnAmount, setReturnAmount] = useState("0");
  const [returnTax, setReturnTax] = useState("0");
  const [returnReason, setReturnReason] = useState<ReturnReason>("defect");
  const [daysSinceSale, setDaysSinceSale] = useState("0");
  const [itemSealed, setItemSealed] = useState(true);
  const [itemDispensed, setItemDispensed] = useState(false);
  const [invoiceReferencePresent, setInvoiceReferencePresent] = useState(true);
  const [evidencePresent, setEvidencePresent] = useState(false);
  const [notes, setNotes] = useState("");
  const [returnResult, setReturnResult] = useState<string | null>(null);
  const [returnId, setReturnId] = useState<number | null>(null);
  const [invoiceNumber, setInvoiceNumber] = useState(() => `MED-TAX-${Date.now()}`);
  const [invoiceType, setInvoiceType] = useState<InvoiceType>("sales");
  const [currencyCode, setCurrencyCode] = useState("EGP");
  const [sku, setSku] = useState("");
  const [invoiceQuantity, setInvoiceQuantity] = useState("1");
  const [unitPrice, setUnitPrice] = useState("0");
  const [discountAmount, setDiscountAmount] = useState("0");
  const [vatRate, setVatRate] = useState("14");
  const [exempt, setExempt] = useState(false);
  const [invoiceResult, setInvoiceResult] = useState<InvoiceResult | null>(null);
  const [templateValues, setTemplateValues] = useState<TemplateValues>(emptyTemplate);
  const [templateStatus, setTemplateStatus] = useState<string | null>(null);
  const [paperSize, setPaperSize] = useState<PaperSize>("a4");
  const [selectedPrinter, setSelectedPrinter] = useState("system-dialog");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const selectedBranchId = branchId;
  const scopeReady = Boolean(selectedBranchId && jurisdictionId);
  const templateQuery = trpc.erp.pos.getTaxInvoiceTemplate.useQuery(selectedBranchId ? { branchId: selectedBranchId } : skipToken, { retry: false });
  const saveTemplate = trpc.erp.pos.saveTaxInvoiceTemplate.useMutation({ onSuccess: () => { setTemplateStatus("تم حفظ قالب المؤسسة ضمن نطاق الفرع والاختصاص"); void templateQuery.refetch(); } });
  const previewReturn = trpc.erp.pos.previewReturn.useMutation({ onSuccess: result => { setReturnId(result.returnId); setReturnResult(`رقم طلب المرتجع ${result.returnId} · ${result.decision === "ELIGIBLE_FOR_REVIEW" ? "مؤهل للمراجعة" : "يحتاج مراجعة مسؤول"}`); } });
  const issueInvoice = trpc.erp.pos.issueLocalTaxInvoice.useMutation({ onSuccess: result => { setInvoiceResult(result as InvoiceResult); } });
  const parsedLine = useMemo<InvoiceLine>(() => ({ sku: sku.trim(), quantity: Number(invoiceQuantity), unitPrice: Number(unitPrice), discountAmount: Number(discountAmount) || 0, vatRate: Number(vatRate), exempt }), [sku, invoiceQuantity, unitPrice, discountAmount, vatRate, exempt]);

  useEffect(() => { const data = templateQuery.data; if (data) setTemplateValues({ nameAr: data.nameAr ?? emptyTemplate.nameAr, nameEn: data.nameEn ?? emptyTemplate.nameEn, addressAr: data.addressAr ?? "", addressEn: data.addressEn ?? "", taxRegistrationNumber: data.taxRegistrationNumber ?? "", phone: data.phone ?? "", email: data.email ?? "", logoUrl: data.logoUrl ?? "", accentColor: data.accentColor ?? emptyTemplate.accentColor, footerAr: data.footerAr ?? emptyTemplate.footerAr, footerEn: data.footerEn ?? emptyTemplate.footerEn }); }, [templateQuery.data]);
  useEffect(() => () => { if (previewUrl) URL.revokeObjectURL(previewUrl); }, [previewUrl]);
  const setTemplate = (key: keyof TemplateValues, value: string) => setTemplateValues(current => ({ ...current, [key]: value }));
  const parsePositive = (value: string) => Number(value) > 0 && Number.isFinite(Number(value));
  const handleReturnPreview = () => { if (!selectedBranchId || !parsePositive(saleId) || !parsePositive(returnQuantity) || !Number.isFinite(Number(returnAmount))) return; previewReturn.mutate({ branchId: selectedBranchId, saleId: Number(saleId), quantity: Number(returnQuantity), amount: Number(returnAmount), taxAmount: Number(returnTax) || 0, reason: returnReason, daysSinceSale: Number(daysSinceSale) || 0, itemSealed, itemDispensed, invoiceReferencePresent, evidencePresent, notes: notes.trim() || undefined }); };
  const handleIssueInvoice = () => { if (!selectedBranchId || invoiceNumber.trim().length < 3 || !parsedLine.sku || !parsePositive(invoiceQuantity) || !Number.isFinite(parsedLine.unitPrice)) return; issueInvoice.mutate({ branchId: selectedBranchId, saleId: parsePositive(saleId) ? Number(saleId) : undefined, returnId: invoiceType === "credit_note" ? returnId ?? undefined : undefined, invoiceNumber: invoiceNumber.trim(), invoiceType, currencyCode: currencyCode.trim().toUpperCase(), lines: [parsedLine] }); };
  const saveCurrentTemplate = () => { if (!selectedBranchId) return; saveTemplate.mutate({ branchId: selectedBranchId, ...templateValues }); };

  const buildInvoicePdf = async (requestedPaperSize: PaperSize) => {
    if (!invoiceResult || !canExportLocalInvoice(invoiceResult)) return null;
    const doc = new jsPDF({ format: PAPER_FORMATS[requestedPaperSize], unit: "mm" });
    const arabicFont = await fontDataFromUrl(ARABIC_FONT_URL);
    if (arabicFont) {
      doc.addFileToVFS("NotoSansArabic-Regular.ttf", arabicFont);
      doc.addFont("NotoSansArabic-Regular.ttf", "NotoSansArabic", "normal");
      doc.setFont("NotoSansArabic", "normal");
    } else doc.setFont("helvetica", "normal");
    const accent = templateValues.accentColor || "#0f766e";
    const rgb = accent.match(/[\da-f]{2}/gi)?.map(value => parseInt(value, 16)) ?? [15, 118, 110];
    const pageWidth = doc.internal.pageSize.getWidth();
    const right = pageWidth - 20;
    doc.setDrawColor(rgb[0], rgb[1], rgb[2]); doc.setFillColor(rgb[0], rgb[1], rgb[2]); doc.setTextColor(31, 41, 55);
    const logoData = await imageDataFromUrl(templateValues.logoUrl);
    if (logoData) { try { doc.addImage(logoData, "AUTO", Math.max(20, pageWidth - 55), 12, 35, 20, undefined, "FAST"); } catch { /* Text branding remains available when a logo format is unsupported. */ } }
    doc.setFontSize(18); doc.setTextColor(rgb[0], rgb[1], rgb[2]); doc.text(arText(templateValues.nameAr || templateValues.nameEn), right, 20, { align: "right" });
    doc.setFontSize(9); doc.setTextColor(71, 85, 105); doc.text(templateValues.nameEn || "Tax Invoice Template", 20, 26); doc.text(templateValues.addressEn || templateValues.addressAr || "", 20, 32); doc.text(`Tax registration: ${templateValues.taxRegistrationNumber || "Not provided"}`, 20, 38);
    doc.setDrawColor(rgb[0], rgb[1], rgb[2]); doc.line(20, 44, pageWidth - 20, 44); doc.setFontSize(11); doc.setTextColor(31, 41, 55); doc.text("LOCAL TAX INVOICE", 20, 53); doc.text(`${invoiceType.toUpperCase()} · ${invoiceNumber}`, 20, 60); doc.text(new Date().toISOString().slice(0, 10), pageWidth - 65, 60);
    let y = 72; doc.setFillColor(241, 245, 249); doc.rect(20, y - 6, pageWidth - 40, 9, "F"); doc.setFontSize(9); doc.text("SKU", 22, y); doc.text("Qty", Math.min(72, pageWidth * 0.37), y); doc.text("Unit", Math.min(94, pageWidth * 0.48), y); doc.text("VAT", Math.min(127, pageWidth * 0.65), y); doc.text("Total", Math.min(158, pageWidth * 0.8), y); y += 8;
    invoiceResult.lines.forEach(line => { if (y > doc.internal.pageSize.getHeight() - 35) { doc.addPage(); y = 20; } doc.setTextColor(31, 41, 55); doc.text(line.sku, 22, y); doc.text(String(line.quantity), Math.min(72, pageWidth * 0.37), y); doc.text(numberText(line.unitPrice, invoiceResult.currencyCode), Math.min(94, pageWidth * 0.48), y); doc.text(numberText(line.tax, invoiceResult.currencyCode), Math.min(127, pageWidth * 0.65), y); doc.text(numberText(line.total, invoiceResult.currencyCode), Math.min(158, pageWidth * 0.8), y); y += 7; });
    y += 7; doc.line(Math.max(80, pageWidth - 75), y, pageWidth - 20, y); y += 8; doc.text(`Subtotal: ${numberText(invoiceResult.subtotal, invoiceResult.currencyCode)}`, Math.max(80, pageWidth - 75), y); y += 7; doc.text(`VAT: ${numberText(invoiceResult.vatAmount, invoiceResult.currencyCode)}`, Math.max(80, pageWidth - 75), y); y += 7; doc.setFontSize(12); doc.text(`TOTAL: ${numberText(invoiceResult.total, invoiceResult.currencyCode)}`, Math.max(80, pageWidth - 75), y); doc.setFontSize(9); y += 14; doc.text(templateValues.footerEn || "Local tax invoice - official submission is not enabled", 20, y); doc.text(arText(templateValues.footerAr || "فاتورة ضريبية محلية - الإرسال الرسمي غير مفعّل"), right, y + 6, { align: "right" }); doc.text("ETA submission: BLOCKED UNTIL CREDENTIALS", 20, y + 12);
    return doc;
  };

  const previewPdf = async () => {
    const doc = await buildInvoicePdf(paperSize);
    if (!doc) return;
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(URL.createObjectURL(doc.output("blob")));
    setPreviewOpen(true);
  };

  const exportPdf = async () => {
    const doc = await buildInvoicePdf(paperSize);
    if (doc) doc.save(`${sanitizeTaxInvoiceFileName(invoiceNumber)}.pdf`);
  };

  const printInvoice = () => {
    if (!invoiceResult || !canExportLocalInvoice(invoiceResult)) return;
    const popup = window.open("", "medora-tax-invoice-print", "width=900,height=900");
    if (!popup) return;
    const lineRows = invoiceResult.lines.map(line => `<tr><td>${escapeHtml(line.sku)}</td><td>${line.quantity}</td><td>${numberText(line.unitPrice, invoiceResult.currencyCode)}</td><td>${numberText(line.tax, invoiceResult.currencyCode)}</td><td>${numberText(line.total, invoiceResult.currencyCode)}</td></tr>`).join("");
    const paperCss = paperSize === "receipt80" ? "80mm auto" : paperSize;
    const printerLabel = selectedPrinter === "system-dialog" ? "حوار الطباعة بالنظام" : selectedPrinter === "thermal-80" ? "طابعة حرارية 80mm" : "طابعة مكتبية";
    popup.document.write(`<!doctype html><html dir="rtl"><head><title>${escapeHtml(invoiceNumber)}</title><style>@page{size:${paperCss};margin:10mm}body{font-family:'Noto Sans Arabic',Arial,sans-serif;margin:20px;color:#172033}header{border-bottom:4px solid ${templateValues.accentColor};padding-bottom:18px;display:flex;justify-content:space-between}h1{margin:0;color:${templateValues.accentColor}}table{width:100%;border-collapse:collapse;margin-top:30px}th,td{border:1px solid #dbe2ea;padding:10px;text-align:right}th{background:#f1f5f9}.totals{margin-top:24px;margin-right:auto;width:280px;line-height:2}.footer{margin-top:48px;border-top:1px solid #dbe2ea;padding-top:16px;color:#475569}</style></head><body><header><div><h1>${escapeHtml(templateValues.nameAr || templateValues.nameEn)}</h1><div>${escapeHtml(templateValues.addressAr || templateValues.addressEn)}</div><div>${escapeHtml(templateValues.taxRegistrationNumber)}</div><div>${escapeHtml(templateValues.phone)} ${escapeHtml(templateValues.email)}</div></div><div><strong>فاتورة ضريبية محلية</strong><br/>${escapeHtml(invoiceNumber)}<br/>${new Date().toLocaleString("ar-EG")}</div></header><table><thead><tr><th>الصنف / SKU</th><th>الكمية</th><th>سعر الوحدة</th><th>الضريبة</th><th>الإجمالي</th></tr></thead><tbody>${lineRows}</tbody></table><div class="totals"><div>الإجمالي قبل الضريبة: ${numberText(invoiceResult.subtotal, invoiceResult.currencyCode)}</div><div>ضريبة القيمة المضافة: ${numberText(invoiceResult.vatAmount, invoiceResult.currencyCode)}</div><strong>الإجمالي: ${numberText(invoiceResult.total, invoiceResult.currencyCode)}</strong></div><div class="footer">${escapeHtml(templateValues.footerAr || templateValues.footerEn)}<br/>ETA: الإرسال الرسمي مغلق حتى استكمال الاعتمادات.<br/>الطابعة المحددة: ${escapeHtml(printerLabel)}</div></body></html>`);
    popup.document.close(); popup.focus(); popup.print();
  };

  return <div className="space-y-5"><div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-xs font-semibold uppercase tracking-[0.14em] text-cyan-700">دورة المبيعات المالية</p><h2 className="mt-1 text-2xl font-bold text-slate-900">المرتجعات والفاتورة الضريبية</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">أنشئ معاينة مرتجع مرتبطة ببيع سابق، ثم أصدر فاتورة محلية قابلة للطباعة والتصدير. لا يتم إرسال أي بيانات إلى ETA تلقائياً.</p></div><Badge variant="outline" className="w-fit bg-amber-50 text-amber-800">ETA: مغلق بأمان</Badge></div>{!scopeReady && <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">اختر فرعاً واختصاصاً صالحين أولاً. لن تُنفذ أي عملية مالية خارج نطاق مؤسسة وفرع معتمدين.</div>}<div className="grid gap-5 xl:grid-cols-2"><Card className="border-0 shadow-sm"><CardHeader><CardTitle className="flex items-center gap-2 text-lg"><ArrowLeftRight className="h-5 w-5 text-cyan-700" /> معاينة طلب مرتجع</CardTitle></CardHeader><CardContent className="space-y-3"><div className="grid gap-3 sm:grid-cols-2"><Input type="number" min="1" value={saleId} onChange={event => setSaleId(event.target.value)} placeholder="رقم البيع الأصلي" aria-label="رقم البيع الأصلي" /><Input type="number" min="0.001" step="0.001" value={returnQuantity} onChange={event => setReturnQuantity(event.target.value)} placeholder="الكمية" aria-label="كمية المرتجع" /><Input type="number" min="0" step="0.01" value={returnAmount} onChange={event => setReturnAmount(event.target.value)} placeholder="قيمة المرتجع" aria-label="قيمة المرتجع" /><Input type="number" min="0" step="0.01" value={returnTax} onChange={event => setReturnTax(event.target.value)} placeholder="ضريبة المرتجع" aria-label="ضريبة المرتجع" /></div><div className="grid gap-3 sm:grid-cols-2"><select value={returnReason} onChange={event => setReturnReason(event.target.value as ReturnReason)} className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm" aria-label="سبب المرتجع"><option value="defect">عيب أو خلل</option><option value="wrong_item">صنف غير صحيح</option><option value="change_of_mind">تغيير رأي</option><option value="expired_or_damaged">منتهي أو تالف</option><option value="recall">سحب تشغيلي</option><option value="other">أخرى</option></select><Input type="number" min="0" value={daysSinceSale} onChange={event => setDaysSinceSale(event.target.value)} placeholder="أيام منذ البيع" aria-label="أيام منذ البيع" /></div><div className="grid gap-2 text-xs text-slate-600 sm:grid-cols-2"><label className="flex items-center gap-2"><input type="checkbox" checked={itemSealed} onChange={event => setItemSealed(event.target.checked)} /> العبوة سليمة</label><label className="flex items-center gap-2"><input type="checkbox" checked={itemDispensed} onChange={event => setItemDispensed(event.target.checked)} /> الصنف مصروف/مستخدم</label><label className="flex items-center gap-2"><input type="checkbox" checked={invoiceReferencePresent} onChange={event => setInvoiceReferencePresent(event.target.checked)} /> مرجع الفاتورة متاح</label><label className="flex items-center gap-2"><input type="checkbox" checked={evidencePresent} onChange={event => setEvidencePresent(event.target.checked)} /> الدليل مرفق</label></div><Input value={notes} onChange={event => setNotes(event.target.value)} placeholder="ملاحظات المراجعة (اختياري)" aria-label="ملاحظات المرتجع" /><Button className="w-full" disabled={!scopeReady || previewReturn.isPending} onClick={handleReturnPreview}>{previewReturn.isPending ? "جارٍ التحقق…" : "تشغيل معاينة سياسة المرتجع"}</Button>{returnResult && <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900">{returnResult}</div>}{previewReturn.error && <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-900">تعذر قبول المرتجع: {previewReturn.error.message}</div>}</CardContent></Card><Card className="border-0 shadow-sm"><CardHeader><CardTitle className="flex items-center gap-2 text-lg"><Receipt className="h-5 w-5 text-cyan-700" /> إصدار فاتورة ضريبية محلية</CardTitle></CardHeader><CardContent className="space-y-3"><div className="grid gap-3 sm:grid-cols-2"><Input value={invoiceNumber} onChange={event => setInvoiceNumber(event.target.value)} placeholder="رقم الفاتورة" aria-label="رقم الفاتورة" /><select value={invoiceType} onChange={event => setInvoiceType(event.target.value as InvoiceType)} className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm" aria-label="نوع الفاتورة"><option value="sales">فاتورة بيع</option><option value="credit_note">إشعار دائن / مرتجع</option><option value="debit_note">إشعار مدين</option></select><Input value={currencyCode} onChange={event => setCurrencyCode(event.target.value)} placeholder="العملة" aria-label="العملة" /><Input value={sku} onChange={event => setSku(event.target.value)} placeholder="SKU أو مرجع الصنف" aria-label="رمز الصنف" /></div><div className="grid gap-3 sm:grid-cols-2"><Input type="number" min="0.001" step="0.001" value={invoiceQuantity} onChange={event => setInvoiceQuantity(event.target.value)} placeholder="الكمية" aria-label="كمية الفاتورة" /><Input type="number" min="0" step="0.01" value={unitPrice} onChange={event => setUnitPrice(event.target.value)} placeholder="سعر الوحدة" aria-label="سعر الوحدة" /><Input type="number" min="0" step="0.01" value={discountAmount} onChange={event => setDiscountAmount(event.target.value)} placeholder="الخصم" aria-label="خصم الفاتورة" /><Input type="number" min="0" max="100" step="0.01" value={vatRate} onChange={event => setVatRate(event.target.value)} placeholder="VAT %" aria-label="نسبة ضريبة القيمة المضافة" /></div><label className="flex items-center gap-2 text-xs text-slate-600"><input type="checkbox" checked={exempt} onChange={event => setExempt(event.target.checked)} /> الصنف معفى وفق قاعدة موثقة</label><Button className="w-full" disabled={!scopeReady || issueInvoice.isPending} onClick={handleIssueInvoice}>{issueInvoice.isPending ? "جارٍ الحساب والإصدار…" : "إصدار محلي قابل للتدقيق"}</Button>{invoiceResult && <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900">الفاتورة {invoiceResult.invoiceId} أُصدرت محلياً · الإجمالي {numberText(invoiceResult.total, invoiceResult.currencyCode)}<div className="mt-3 grid gap-3 sm:grid-cols-2"><label className="text-xs text-slate-600">حجم الورق<select value={paperSize} onChange={event => setPaperSize(event.target.value as PaperSize)} className="mt-1 h-9 w-full rounded-md border border-slate-200 bg-white px-2 text-sm" aria-label="حجم ورق PDF"><option value="a4">A4</option><option value="a5">A5</option><option value="receipt80">إيصال حراري 80mm</option></select></label><label className="text-xs text-slate-600">الطابعة<select value={selectedPrinter} onChange={event => setSelectedPrinter(event.target.value)} className="mt-1 h-9 w-full rounded-md border border-slate-200 bg-white px-2 text-sm" aria-label="الطابعة"><option value="system-dialog">اختيار من حوار النظام</option><option value="thermal-80">طابعة حرارية 80mm</option><option value="office">طابعة مكتبية</option></select></label><div className="flex flex-wrap gap-2 sm:col-span-2"><Button size="sm" onClick={() => void previewPdf()}><Download className="ml-1 h-4 w-4" /> معاينة PDF</Button><Button size="sm" variant="outline" onClick={() => void exportPdf()}><Download className="ml-1 h-4 w-4" /> تنزيل PDF</Button><Button size="sm" variant="outline" onClick={printInvoice}><Printer className="ml-1 h-4 w-4" /> طباعة</Button></div></div></div>}{issueInvoice.error && <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-900">تعذر إصدار الفاتورة: {issueInvoice.error.message}</div>}</CardContent></Card></div><Card className="border-0 shadow-sm"><CardHeader><CardTitle className="flex items-center gap-2 text-lg"><Palette className="h-5 w-5 text-cyan-700" /> قالب المؤسسة للفواتير</CardTitle></CardHeader><CardContent className="space-y-4"><div className="flex items-start gap-3 rounded-xl border border-cyan-100 bg-cyan-50 p-3 text-sm text-cyan-950"><ShieldCheck className="mt-0.5 h-5 w-5 shrink-0" /><p>القالب يُقرأ ويُحفظ خادمياً ضمن المؤسسة والفرع والاختصاص الحالي. لا يمكن للمتصفح اختيار قالب مؤسسة أخرى، والحفظ متاح للمسؤول أو المدير فقط.</p></div><div className="grid gap-3 md:grid-cols-2"><Input value={templateValues.nameAr} onChange={event => setTemplate("nameAr", event.target.value)} placeholder="اسم المؤسسة بالعربية" aria-label="اسم المؤسسة بالعربية" /><Input value={templateValues.nameEn} onChange={event => setTemplate("nameEn", event.target.value)} placeholder="Organization name in English" aria-label="اسم المؤسسة بالإنجليزية" /><Input value={templateValues.addressAr} onChange={event => setTemplate("addressAr", event.target.value)} placeholder="العنوان بالعربية" aria-label="العنوان بالعربية" /><Input value={templateValues.addressEn} onChange={event => setTemplate("addressEn", event.target.value)} placeholder="Address in English" aria-label="العنوان بالإنجليزية" /><Input value={templateValues.taxRegistrationNumber} onChange={event => setTemplate("taxRegistrationNumber", event.target.value)} placeholder="رقم التسجيل الضريبي" aria-label="رقم التسجيل الضريبي" /><Input value={templateValues.phone} onChange={event => setTemplate("phone", event.target.value)} placeholder="هاتف المؤسسة" aria-label="هاتف المؤسسة" /><Input value={templateValues.email} onChange={event => setTemplate("email", event.target.value)} placeholder="البريد المؤسسي" aria-label="البريد المؤسسي" /><Input value={templateValues.logoUrl} onChange={event => setTemplate("logoUrl", event.target.value)} placeholder="رابط شعار مؤسسي معتمد" aria-label="رابط الشعار" /><label className="flex items-center gap-2 rounded-md border border-slate-200 px-3 text-sm"><span>لون القالب</span><input type="color" value={templateValues.accentColor} onChange={event => setTemplate("accentColor", event.target.value)} aria-label="لون قالب الفاتورة" /></label></div><div className="grid gap-3 md:grid-cols-2"><textarea className="min-h-24 rounded-md border border-slate-200 p-3 text-sm" value={templateValues.footerAr} onChange={event => setTemplate("footerAr", event.target.value)} placeholder="تذييل عربي" aria-label="تذييل عربي" /><textarea className="min-h-24 rounded-md border border-slate-200 p-3 text-sm" value={templateValues.footerEn} onChange={event => setTemplate("footerEn", event.target.value)} placeholder="English footer" aria-label="تذييل إنجليزي" /></div><div className="flex flex-wrap items-center gap-3"><Button disabled={!scopeReady || saveTemplate.isPending} onClick={saveCurrentTemplate}><Save className="ml-1 h-4 w-4" />{saveTemplate.isPending ? "جارٍ الحفظ…" : "حفظ قالب المؤسسة"}</Button>{templateStatus && <Badge variant="outline" className="bg-emerald-50 text-emerald-800">{templateStatus}</Badge>}{templateQuery.error && <span className="text-sm text-rose-700">تعذر تحميل القالب: {templateQuery.error.message}</span>}</div><div className="rounded-xl border-2 p-4" style={{ borderColor: templateValues.accentColor }} dir="rtl"><div className="flex items-start justify-between gap-3"><div><h3 className="text-lg font-bold" style={{ color: templateValues.accentColor }}>{templateValues.nameAr || templateValues.nameEn}</h3><p className="text-xs text-slate-500">{templateValues.addressAr || templateValues.addressEn}</p><p className="text-xs text-slate-500">{templateValues.taxRegistrationNumber}</p></div><Receipt className="h-7 w-7" style={{ color: templateValues.accentColor }} /></div><div className="my-4 border-t" /><p className="text-sm font-semibold">فاتورة ضريبية محلية · {invoiceNumber}</p><p className="mt-3 text-xs text-slate-500">تظهر هنا معاينة القالب. بعد إصدار فاتورة محلية ستظهر أزرار الطباعة والتصدير PDF.</p><p className="mt-4 text-xs text-slate-500">{templateValues.footerAr || templateValues.footerEn}</p></div></CardContent></Card><Dialog open={previewOpen} onOpenChange={open => { setPreviewOpen(open); if (!open && previewUrl) { URL.revokeObjectURL(previewUrl); setPreviewUrl(null); } }}><DialogContent className="max-w-5xl"><DialogHeader><DialogTitle>معاينة الفاتورة الضريبية قبل التنزيل</DialogTitle><DialogDescription>تم تضمين الخط العربي عند توفره. اختر الحجم المناسب ثم راجع الملف قبل التنزيل أو الطباعة. اختيار الطابعة يتم من حوار النظام ولا تكشف المنصة قائمة الطابعات المحلية.</DialogDescription></DialogHeader><div className="rounded-xl border bg-slate-100 p-2"><div className="mb-2 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600"><span>الحجم: {paperSize === "a4" ? "A4" : paperSize === "a5" ? "A5" : "إيصال 80mm"}</span><span>الحالة: فاتورة محلية · ETA مغلق بأمان</span></div>{previewUrl ? <iframe title="معاينة PDF للفاتورة" src={previewUrl} className="h-[60vh] w-full rounded-lg bg-white" /> : <div className="flex h-64 items-center justify-center text-sm text-slate-500">جارٍ تجهيز المعاينة…</div>}</div><DialogFooter><Button variant="outline" onClick={printInvoice}><Printer className="ml-1 h-4 w-4" /> طباعة</Button><Button onClick={() => void exportPdf()} disabled={!previewUrl}><Download className="ml-1 h-4 w-4" /> تنزيل PDF</Button></DialogFooter></DialogContent></Dialog></div>;
}
