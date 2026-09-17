import { useMemo, useState } from "react";
import { Banknote, ClipboardList, LockKeyhole, RefreshCcw, Search, UnlockKeyhole } from "lucide-react";
import { skipToken } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { hasBranchJurisdictionScope } from "@/lib/scope";
import { useLocalization } from "@/contexts/LocalizationContext";

type Props = { branchId: number | null; jurisdictionId: number | null };
const money = (value: unknown, locale: string) => new Intl.NumberFormat(locale, { style: "currency", currency: "EGP", maximumFractionDigits: 2 }).format(Number(value ?? 0));

export function CashierCycleWorkspace({ branchId, jurisdictionId }: Props) {
  const { direction, locale, language } = useLocalization();
  const t = (arabic: string, english: string) => language === "ar" ? arabic : english;
  const [openingAmount, setOpeningAmount] = useState("0");
  const [countedCash, setCountedCash] = useState("");
  const [note, setNote] = useState("");
  const [invoiceSearch, setInvoiceSearch] = useState("");
  const [returnSaleId, setReturnSaleId] = useState("");
  const [returnItemId, setReturnItemId] = useState("");
  const [returnQuantity, setReturnQuantity] = useState("1");
  const [status, setStatus] = useState("");
  const enabled = hasBranchJurisdictionScope(branchId, jurisdictionId);
  const scope = enabled ? { branchId: branchId!, jurisdictionId: jurisdictionId! } : skipToken;
  const shift = trpc.erp.cashier.currentShift.useQuery(scope, { enabled, retry: false });
  const from = useMemo(() => { const date = new Date(); date.setDate(date.getDate() - 7); date.setHours(0, 0, 0, 0); return date; }, []);
  const to = useMemo(() => new Date(), []);
  const invoices = trpc.erp.salesLedger.listPeriod.useQuery(enabled ? { branchId: branchId!, jurisdictionId: jurisdictionId!, from, to } : skipToken, { enabled, retry: false });
  const utils = trpc.useUtils();
  const openShift = trpc.erp.cashier.openShift.useMutation({ onSuccess: async () => { setStatus(t("تم فتح درج البيع وتسجيل الرصيد الافتتاحي.", "Cash drawer opened and the opening balance was recorded.")); await shift.refetch(); }, onError: e => setStatus(e.message) });
  const closeShift = trpc.erp.cashier.closeShift.useMutation({ onSuccess: async result => { setStatus(result.status === "approved" ? t("تم تقفيل الدرج واعتماده.", "Cash drawer closed and approved.") : t("تم إرسال التقفيل للمراجعة بسبب وجود فرق.", "Cash closure was submitted for review because a variance was found.")); await shift.refetch(); }, onError: e => setStatus(e.message) });
  const requestReturn = trpc.erp.returns.request.useMutation({ onSuccess: () => { setStatus(t("تم إنشاء طلب المرتجع للمراجعة؛ لم يتم رد المبلغ تلقائيًا.", "Return request created for review; neither refund nor stock reversal was completed automatically.")); setReturnSaleId(""); setReturnItemId(""); void utils.erp.salesLedger.listPeriod.invalidate(); }, onError: e => setStatus(e.message) });
  const filteredInvoices = (invoices.data ?? []).filter(invoice => !invoiceSearch.trim() || String(invoice.id).includes(invoiceSearch.trim()) || invoice.invoiceNumber.toLowerCase().includes(invoiceSearch.trim().toLowerCase()));
  if (!enabled) return <Card className="border-amber-200 bg-amber-50/60 shadow-none"><CardContent className="p-4 text-sm text-amber-900">{t("يلزم اختيار فرع واختصاص معتمد لإدارة درج البيع والفواتير.", "Select an authorized branch and jurisdiction to manage the cash drawer and invoices.")}</CardContent></Card>;
  return <div className="space-y-4" dir={direction}>
    <div className="grid gap-4 lg:grid-cols-2">
      <Card className="border-slate-200 shadow-none"><CardHeader className="pb-3"><CardTitle className="flex items-center gap-2 text-base"><Banknote className="h-5 w-5 text-cyan-700" />{t("وردية ودرج البيع", "Cashier shift & drawer")}</CardTitle></CardHeader><CardContent className="space-y-3">
        {shift.data ? <><div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-900"><span>{t(`وردية مفتوحة #${shift.data.id}`, `Open shift #${shift.data.id}`)}</span><Badge className="bg-emerald-600">{t("مفتوحة", "Open")}</Badge></div><div className="grid gap-2 sm:grid-cols-2"><Input type="number" min="0" value={countedCash} onChange={e => setCountedCash(e.target.value)} placeholder={t("النقد الفعلي عند التقفيل", "Counted cash at close")} aria-label={t("النقد الفعلي عند التقفيل", "Counted cash at close")} /><Input value={note} onChange={e => setNote(e.target.value)} placeholder={t("ملاحظة التقفيل (اختياري)", "Close note (optional)")} aria-label={t("ملاحظة التقفيل", "Close note")} /></div><Button className="w-full bg-[#0d1b2a]" disabled={!countedCash || closeShift.isPending} onClick={() => closeShift.mutate({ shiftId: shift.data.id, countedCash: Number(countedCash), note: note || undefined })}><LockKeyhole className="ms-1 h-4 w-4" />{t("تقفيل درج البيع", "Close cash drawer")}</Button></> : <><p className="text-sm leading-6 text-slate-600">{t("لا توجد وردية مفتوحة لهذا الكاشير في الفرع الحالي.", "There is no open shift for this cashier in the current branch.")}</p><Input type="number" min="0" value={openingAmount} onChange={e => setOpeningAmount(e.target.value)} placeholder={t("الرصيد الافتتاحي", "Opening balance")} aria-label={t("الرصيد الافتتاحي", "Opening balance")} /><Button className="w-full bg-[#0d1b2a]" disabled={openShift.isPending} onClick={() => openShift.mutate({ branchId: branchId!, jurisdictionId: jurisdictionId!, openingAmount: Number(openingAmount || 0) })}><UnlockKeyhole className="ms-1 h-4 w-4" />{t("فتح درج البيع", "Open cash drawer")}</Button></>}
      </CardContent></Card>
      <Card className="border-slate-200 shadow-none"><CardHeader className="pb-3"><CardTitle className="flex items-center gap-2 text-base"><ClipboardList className="h-5 w-5 text-violet-700" />{t("فواتير آخر ٧ أيام", "Invoices from the last 7 days")}</CardTitle></CardHeader><CardContent className="space-y-3"><div className="relative"><Search className="pointer-events-none absolute end-3 top-3 h-4 w-4 text-slate-400" /><Input className="pe-9" value={invoiceSearch} onChange={e => setInvoiceSearch(e.target.value)} placeholder={t("ابحث برقم الفاتورة أو العملية", "Search invoice or transaction number")} aria-label={t("بحث فواتير المبيعات", "Search sales invoices")} /></div><div className="max-h-56 space-y-2 overflow-y-auto">{invoices.isLoading ? <p className="text-sm text-slate-500">{t("جارٍ تحميل الفواتير…", "Loading invoices…")}</p> : filteredInvoices.length ? filteredInvoices.map(invoice => <div key={invoice.id} className="rounded-xl border border-slate-200 p-3 text-sm"><div className="flex items-center justify-between gap-2"><span className="font-semibold">{invoice.invoiceNumber}</span><Badge variant="outline">{invoice.saleStatus}</Badge></div><div className="mt-1 flex items-center justify-between text-xs text-slate-500"><span>{money(invoice.totalAmount, locale)}</span><span>{new Date(invoice.createdAt).toLocaleDateString(locale)}</span></div></div>) : <p className="rounded-xl bg-slate-50 p-4 text-center text-sm text-slate-500">{t("لا توجد فواتير ضمن الفترة.", "No invoices were found for this period.")}</p>}</div></CardContent></Card>
    </div>
    <Card className="border-rose-200 bg-rose-50/30 shadow-none"><CardHeader className="pb-3"><CardTitle className="flex items-center gap-2 text-base"><RefreshCcw className="h-5 w-5 text-rose-700" />{t("مرتجع مباشر من POS", "POS return request")}</CardTitle></CardHeader><CardContent className="space-y-3"><p className="text-xs leading-5 text-rose-900">{t("يُنشأ الطلب للمراجعة ولا يُعاد المخزون أو المبلغ إلا بعد اعتماد مخول.", "The request goes to review. Neither stock nor payment is reversed until an authorized approver accepts it.")}</p><div className="grid gap-2 sm:grid-cols-3"><Input value={returnSaleId} onChange={e => setReturnSaleId(e.target.value)} placeholder={t("رقم العملية", "Transaction number")} aria-label={t("رقم عملية المرتجع", "Return transaction number")} /><Input value={returnItemId} onChange={e => setReturnItemId(e.target.value)} placeholder={t("رقم صنف البيع", "Sale item number")} aria-label={t("رقم صنف البيع للمرتجع", "Sale item number for return")} /><Input type="number" min="0.001" value={returnQuantity} onChange={e => setReturnQuantity(e.target.value)} placeholder={t("الكمية", "Quantity")} aria-label={t("كمية المرتجع", "Return quantity")} /></div><Button variant="outline" className="border-rose-300 text-rose-800" disabled={!returnSaleId || !returnItemId || requestReturn.isPending} onClick={() => requestReturn.mutate({ saleId: Number(returnSaleId), saleItemId: Number(returnItemId), quantity: Number(returnQuantity), reasonCode: "customer_request", disposition: "pending_review" })}>{t("إنشاء طلب مرتجع للمراجعة", "Create return request for review")}</Button></CardContent></Card>
    {status && <div className="rounded-xl bg-cyan-50 p-3 text-sm text-cyan-900" role="status">{status}</div>}
  </div>;
}
