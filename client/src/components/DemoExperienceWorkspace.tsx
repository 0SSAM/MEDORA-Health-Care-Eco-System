import { useState } from "react";
import { Search, Save, ReceiptText, Database, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { hasBranchJurisdictionScope } from "@/lib/scope";
import { useLocalization } from "@/contexts/LocalizationContext";

type Props = { branchId: number | null; jurisdictionId: number | null };
type InterfaceLanguage = "ar" | "en";

const copy = {
  ar: {
    demoOnlyTitle: "مساحة تجربة المستثمر متاحة في Demo فقط",
    demoOnlyDescription: "بدّل مؤشر النطاق في أعلى التطبيق إلى بيانات العرض. لن تظهر هذه الأدوات أو تستقبل بيانات إنتاجية.",
    validScope: "اختر فرعًا واختصاصًا صالحين أولًا.",
    title: "إدارة تجربة Demo",
    subtitle: "بيانات اصطناعية معزولة عن الإنتاج، والتعديلات قابلة للمراجعة.",
    catalog: "كتالوج Demo",
    catalogSearch: "ابحث بالاسم أو SKU أو الباركود",
    catalogSearchLabel: "بحث كتالوج Demo",
    refresh: "تحديث",
    loadingCatalog: "جارٍ تحميل الكتالوج…",
    catalogError: "تعذر تحميل كتالوج Demo ضمن النطاق الحالي.",
    noBarcode: "بدون باركود",
    active: "نشط",
    inactive: "متوقف",
    stock: "الرصيد",
    arabicName: "الاسم العربي",
    englishName: "English name",
    barcode: "الباركود",
    price: "السعر",
    saving: "جارٍ الحفظ…",
    save: "حفظ",
    cancel: "إلغاء",
    editItem: "تعديل صنف Demo",
    noProducts: "لا توجد أصناف ضمن بحثك.",
    invoiceHistory: "سجل الفواتير التجريبية",
    invoiceSearch: "ابحث برقم الفاتورة",
    invoiceSearchLabel: "بحث فواتير Demo",
    search: "بحث",
    loadingInvoices: "جارٍ تحميل السجل…",
    invoicesError: "تعذر تحميل سجل الفواتير التجريبية.",
    noInvoices: "لا توجد فواتير تجريبية مطابقة.",
    savedDemo: "تم حفظ التعديل داخل نطاق Demo فقط.",
    saveError: "تعذر حفظ الصنف.",
  },
  en: {
    demoOnlyTitle: "The investor showcase is available in Demo mode only",
    demoOnlyDescription: "Switch the scope indicator at the top of the application to showcase data. These tools never display or accept production data.",
    validScope: "Select a valid branch and jurisdiction first.",
    title: "Demo experience manager",
    subtitle: "Synthetic data is isolated from production, and changes remain reviewable.",
    catalog: "Demo catalogue",
    catalogSearch: "Search by name, SKU, or barcode",
    catalogSearchLabel: "Search the Demo catalogue",
    refresh: "Refresh",
    loadingCatalog: "Loading the catalogue…",
    catalogError: "The Demo catalogue could not be loaded for the current scope.",
    noBarcode: "No barcode",
    active: "Active",
    inactive: "Inactive",
    stock: "Stock",
    arabicName: "Arabic name",
    englishName: "English name",
    barcode: "Barcode",
    price: "Price",
    saving: "Saving…",
    save: "Save",
    cancel: "Cancel",
    editItem: "Edit Demo item",
    noProducts: "No items match your search.",
    invoiceHistory: "Trial invoice history",
    invoiceSearch: "Search by invoice number",
    invoiceSearchLabel: "Search Demo invoices",
    search: "Search",
    loadingInvoices: "Loading the history…",
    invoicesError: "The trial invoice history could not be loaded.",
    noInvoices: "There are no matching trial invoices.",
    savedDemo: "The change was saved in the Demo scope only.",
    saveError: "The item could not be saved.",
  },
} as const;

export function DemoExperienceWorkspace({ branchId, jurisdictionId }: Props) {
  const { language, sessionMode } = useLocalization();
  const interfaceLanguage: InterfaceLanguage = language === "en" ? "en" : "ar";
  const text = copy[interfaceLanguage];
  const dir = interfaceLanguage === "ar" ? "rtl" : "ltr";
  const locale = interfaceLanguage === "ar" ? "ar-EG" : "en-US";
  const currency = interfaceLanguage === "ar" ? "ج.م" : "EGP";
  const [query, setQuery] = useState("");
  const [invoiceQuery, setInvoiceQuery] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [draft, setDraft] = useState({ nameAr: "", nameEn: "", barcode: "", officialPrice: "" });
  const [status, setStatus] = useState<string | null>(null);
  const scope = hasBranchJurisdictionScope(branchId, jurisdictionId) ? { branchId: branchId!, jurisdictionId: jurisdictionId! } : null;
  const catalog = trpc.erp.pos.demoCatalog.list.useQuery(scope ? { ...scope, query, activeOnly: false } : { branchId: 0, jurisdictionId: 0, query, activeOnly: false }, { enabled: Boolean(scope && sessionMode === "showcase"), retry: false });
  const invoices = trpc.erp.pos.demoTrialInvoices.useQuery(scope ? { ...scope, query: invoiceQuery, limit: 50 } : { branchId: 0, jurisdictionId: 0, query: invoiceQuery, limit: 50 }, { enabled: Boolean(scope && sessionMode === "showcase"), retry: false });
  const utils = trpc.useUtils();
  const update = trpc.erp.pos.demoCatalog.update.useMutation({
    onSuccess: () => { setEditingId(null); setStatus(text.savedDemo); void utils.erp.pos.demoCatalog.list.invalidate(); },
    onError: () => setStatus(text.saveError),
  });

  const startEdit = (item: NonNullable<typeof catalog.data>[number]) => {
    setEditingId(item.id);
    setDraft({ nameAr: item.nameAr, nameEn: item.nameEn ?? "", barcode: item.barcode ?? "", officialPrice: String(item.officialPrice) });
    setStatus(null);
  };
  const save = () => {
    if (!scope || editingId === null) return;
    update.mutate({ ...scope, productId: editingId, nameAr: draft.nameAr, nameEn: draft.nameEn || null, barcode: draft.barcode || null, officialPrice: Number(draft.officialPrice) });
  };
  const money = (value: number) => `${value.toFixed(2)} ${currency}`;
  const productName = (item: { nameAr: string; nameEn?: string | null }) => interfaceLanguage === "en" ? item.nameEn || item.nameAr : item.nameAr;

  if (sessionMode !== "showcase") {
    return <Card className="border-amber-200 bg-amber-50" dir={dir}><CardContent className="space-y-2 p-6 text-sm leading-6 text-amber-900"><p className="font-semibold">{text.demoOnlyTitle}</p><p>{text.demoOnlyDescription}</p></CardContent></Card>;
  }
  if (!scope) return <Card dir={dir}><CardContent className="p-6 text-sm text-slate-600">{text.validScope}</CardContent></Card>;

  return <div className="space-y-5" dir={dir}>
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-cyan-200 bg-cyan-50 p-4"><div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-white text-cyan-700 shadow-sm"><ShieldCheck className="h-5 w-5" /></span><div><h2 className="font-bold text-cyan-950">{text.title}</h2><p className="text-xs text-cyan-800">{text.subtitle}</p></div></div><Badge className="bg-cyan-700">SHOWCASE</Badge></div>
    <div className="grid gap-5 xl:grid-cols-[1.25fr_.75fr]">
      <Card className="border-slate-200 shadow-sm"><CardHeader><CardTitle className="flex items-center gap-2 text-base"><Database className="h-4 w-4 text-cyan-700" />{text.catalog}</CardTitle><div className="flex gap-2"><div className="relative flex-1"><Search className="absolute start-3 top-2.5 h-4 w-4 text-slate-400" /><Input className="ps-9" value={query} onChange={event => setQuery(event.target.value)} placeholder={text.catalogSearch} aria-label={text.catalogSearchLabel} /></div><Button variant="outline" onClick={() => void catalog.refetch()}>{text.refresh}</Button></div></CardHeader><CardContent className="space-y-3">
        {catalog.isLoading ? <p className="text-sm text-slate-500">{text.loadingCatalog}</p> : catalog.isError ? <p className="rounded-xl bg-rose-50 p-3 text-sm text-rose-700">{text.catalogError}</p> : catalog.data?.length ? catalog.data.map(item => <div key={item.id} className="rounded-xl border border-slate-200 p-3"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="font-semibold text-slate-900">{productName(item)}</p><p className="text-xs text-slate-500">{item.sku} · {item.barcode || text.noBarcode}</p></div><div className="flex items-center gap-2"><Badge variant={item.active ? "default" : "outline"}>{item.active ? text.active : text.inactive}</Badge><Badge variant="secondary">{text.stock} {item.stock}</Badge></div></div>{editingId === item.id ? <div className="mt-3 grid gap-2 sm:grid-cols-2"><Input value={draft.nameAr} onChange={event => setDraft({ ...draft, nameAr: event.target.value })} placeholder={text.arabicName} aria-label={text.arabicName} /><Input value={draft.nameEn} onChange={event => setDraft({ ...draft, nameEn: event.target.value })} placeholder={text.englishName} aria-label={text.englishName} /><Input value={draft.barcode} onChange={event => setDraft({ ...draft, barcode: event.target.value })} placeholder={text.barcode} aria-label={text.barcode} /><Input type="number" min="0" step="0.01" value={draft.officialPrice} onChange={event => setDraft({ ...draft, officialPrice: event.target.value })} placeholder={text.price} aria-label={text.price} /><div className="flex gap-2 sm:col-span-2"><Button onClick={save} disabled={update.isPending}><Save className="me-1 h-4 w-4" />{update.isPending ? text.saving : text.save}</Button><Button variant="outline" onClick={() => setEditingId(null)}>{text.cancel}</Button></div></div> : <div className="mt-3 flex flex-wrap items-center justify-between gap-2"><span className="text-sm font-semibold text-cyan-800">{money(item.officialPrice)}</span><Button size="sm" variant="outline" onClick={() => startEdit(item)}>{text.editItem}</Button></div>}</div>) : <div className="rounded-xl border border-dashed p-7 text-center text-sm text-slate-500">{text.noProducts}</div>}
        {status && <p className="text-sm text-cyan-800" role="status">{status}</p>}
      </CardContent></Card>
      <Card className="border-slate-200 shadow-sm"><CardHeader><CardTitle className="flex items-center gap-2 text-base"><ReceiptText className="h-4 w-4 text-cyan-700" />{text.invoiceHistory}</CardTitle><div className="flex gap-2"><Input value={invoiceQuery} onChange={event => setInvoiceQuery(event.target.value)} placeholder={text.invoiceSearch} aria-label={text.invoiceSearchLabel} /><Button variant="outline" onClick={() => void invoices.refetch()}>{text.search}</Button></div></CardHeader><CardContent className="space-y-3">
        {invoices.isLoading ? <p className="text-sm text-slate-500">{text.loadingInvoices}</p> : invoices.isError ? <p className="rounded-xl bg-rose-50 p-3 text-sm text-rose-700">{text.invoicesError}</p> : invoices.data?.length ? invoices.data.map(invoice => <details key={invoice.id} className="rounded-xl border border-slate-200 p-3"><summary className="cursor-pointer list-none"><div className="flex items-center justify-between gap-2"><span className="font-semibold">{invoice.invoiceNumber}</span><span className="text-sm font-bold text-cyan-800">{money(invoice.totalAmount)}</span></div><p className="mt-1 text-xs text-slate-500">{new Date(invoice.createdAt).toLocaleString(locale)} · {invoice.paymentMethod} · {invoice.saleStatus}</p></summary><div className="mt-3 space-y-1 border-t pt-2 text-xs text-slate-600">{invoice.items.map(item => <p key={`${invoice.id}-${item.productId}`}>{productName(item)} · {item.quantity} × {item.unitPrice.toFixed(2)}</p>)}</div></details>) : <div className="rounded-xl border border-dashed p-7 text-center text-sm text-slate-500">{text.noInvoices}</div>}
      </CardContent></Card>
    </div>
  </div>;
}
