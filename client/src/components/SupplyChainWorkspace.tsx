// MEDORA | ميدورا — Integrated Health Care System
// Copyright (c) 2026 Hossam Naeim Osman | حسام نعيم عثمان. All rights reserved.
// Proprietary and confidential. Unauthorized copying, distribution, or use of this
// software, or of any portion of it, is strictly prohibited.
// Source: https://github.com/0SSAM/MEDORA-Health-Care-Eco-System
import { useMemo, useState } from "react";
import { trpc } from "@/lib/trpc";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { calculateDemandRecommendation } from "@shared/demand-forecast-policy";

type SupplyChainWorkspaceProps = { branchId?: number | null; jurisdictionId?: number | null };

export function SupplyChainWorkspace({ branchId = null, jurisdictionId = null }: SupplyChainWorkspaceProps) {
  const [query, setQuery] = useState("");
  const historyQuery = trpc.erp.forecast.salesHistory.useQuery(
    { branchId: branchId as number, jurisdictionId: jurisdictionId as number, historyDays: 56 },
    { enabled: Boolean(branchId && jurisdictionId), retry: false },
  );
  const recommendations = useMemo(() => (historyQuery.data ?? []).map(item => ({
    item: { id: String(item.productId), product: `الصنف #${item.productId}`, history: item.historyDays, onHand: 0, open: 0, lead: 7, review: 7, service: "standard" as const, shelf: null },
    result: calculateDemandRecommendation({
      scope: item.scope,
      productId: String(item.productId),
      dailyUnits: item.historyDays,
      onHand: 0,
      openOrderUnits: 0,
      leadTimeDays: 7,
      reviewPeriodDays: 7,
      serviceLevel: "standard",
      shelfLifeDays: null,
    }),
  })), [historyQuery.data]);
  const filtered = useMemo(() => recommendations.filter(({ item }) => `${item.id} ${item.product}`.toLowerCase().includes(query.toLowerCase())), [recommendations, query]);
  const noScope = !branchId || !jurisdictionId;

  return <div className="space-y-5" dir="rtl">
    <div className="grid gap-3 md:grid-cols-3"><Metric title="سجل المبيعات" value={noScope ? "غير متاح" : String(recommendations.length)} /><Metric title="توصيات إعادة الطلب" value={String(recommendations.filter(({ result }) => (result.suggestedOrderUnits ?? 0) > 0).length)} tone="emerald" /><Metric title="حالة النطاق" value={noScope ? "مطلوب" : "مؤكد"} tone={noScope ? "amber" : "cyan"} /></div>
    <Card><CardHeader><CardTitle className="flex flex-wrap items-center justify-between gap-3"><span>لوحة توقع الطلب وإعادة الطلب</span><Badge variant="outline">بيانات مبيعات خادمية ضمن النطاق</Badge></CardTitle><p className="text-sm leading-6 text-slate-500">تظهر التوصيات فقط من سجل مبيعات حقيقي ضمن المؤسسة والفرع والاختصاص المؤكدين. لا يتم إنشاء أوامر شراء تلقائياً، ولا تُستخدم بيانات اصطناعية.</p></CardHeader><CardContent>
      {noScope ? <EmptyState text="اختر مؤسسة وفرعاً واختصاصاً مصرحاً به لعرض البيانات التشغيلية." /> : historyQuery.isLoading ? <EmptyState text="جارٍ تحميل سجل المبيعات ضمن النطاق…" /> : historyQuery.isError ? <EmptyState text="تعذر تحميل سجل المبيعات. لم يتم عرض بيانات بديلة." /> : filtered.length === 0 ? <EmptyState text="لا توجد مبيعات مؤهلة أو بيانات كافية ضمن النطاق المحدد." /> : <><div className="grid gap-4 lg:grid-cols-3">{filtered.map(({ item, result }) => <div key={item.id} className="rounded-2xl border border-slate-200 p-4"><div className="flex items-start justify-between gap-2"><div><p className="font-semibold">{item.product}</p><p className="mt-1 text-xs text-slate-500">المهلة {item.lead} أيام · المراجعة {item.review} أيام</p></div><Badge variant="outline" className={result.dataQuality === "insufficient" ? "border-rose-300 text-rose-700" : result.dataQuality === "limited" ? "border-amber-300 text-amber-700" : "border-emerald-300 text-emerald-700"}>{result.dataQuality === "insufficient" ? "بيانات غير كافية" : result.dataQuality === "limited" ? "بيانات محدودة" : "بيانات كافية"}</Badge></div><div className="mt-4 grid grid-cols-2 gap-2 text-sm"><Stat label="توقع يومي" value={result.forecastDailyUnits === null ? "—" : `${result.forecastDailyUnits} وحدة`} /><Stat label="مخزون الأمان" value={result.safetyStockUnits === null ? "—" : `${result.safetyStockUnits} وحدة`} /><Stat label="نقطة الطلب" value={result.reorderPointUnits === null ? "—" : `${result.reorderPointUnits} وحدة`} /><Stat label="المقترح" value={result.suggestedOrderUnits === null ? "مراجعة يدوية" : `${result.suggestedOrderUnits} وحدة`} emphasis={(result.suggestedOrderUnits ?? 0) > 0} /></div><details className="mt-4 text-xs text-slate-600"><summary className="cursor-pointer font-medium">كيف حُسبت التوصية؟</summary><div className="mt-2 space-y-1 leading-5">{result.explanation.map(line => <p key={line}>{line}</p>)}</div></details></div>)}</div><p className="mt-4 rounded-xl bg-amber-50 p-3 text-xs leading-5 text-amber-800">بيانات المخزون والطلبات المفتوحة غير متاحة لهذا العرض، لذلك لا تُعتبر التوصية أمر شراء. التوصية أداة دعم قرار فقط وتتطلب مراجعة واعتماد مسؤول مخزون مخوّل.</p></>}
    </CardContent></Card>
    <Card><CardHeader><CardTitle>متابعة سلاسل الإمداد والتوريد</CardTitle><p className="text-sm leading-6 text-slate-500">لا توجد أوامر شراء محلية معروضة هنا دون مصدر تشغيلي موثق. التكامل مع الموردين وEDI/GS1 والجهات التنظيمية يبقى مغلقاً حتى توفير المواصفات والاعتمادات وبيئة الاختبار الرسمية.</p></CardHeader><CardContent><EmptyState text="لا توجد أوامر توريد مؤهلة للعرض ضمن النطاق الحالي." /></CardContent></Card>
  </div>;
}
function EmptyState({ text }: { text: string }) { return <p className="rounded-xl border border-dashed p-5 text-sm text-slate-500">{text}</p>; }
function Stat({ label, value, emphasis = false }: { label: string; value: string; emphasis?: boolean }) { return <div className={`rounded-xl p-3 ${emphasis ? "bg-cyan-50 text-cyan-900" : "bg-slate-50 text-slate-700"}`}><p className="text-xs opacity-70">{label}</p><p className="mt-1 font-semibold">{value}</p></div>; }
function Metric({ title, value, tone = "cyan" }: { title: string; value: string; tone?: "cyan" | "amber" | "emerald" }) { const tones = { cyan: "bg-cyan-50 text-cyan-800", amber: "bg-amber-50 text-amber-800", emerald: "bg-emerald-50 text-emerald-800" }; return <div className={`rounded-2xl p-4 ${tones[tone]}`}><p className="text-xs opacity-75">{title}</p><p className="mt-2 text-2xl font-bold">{value}</p></div>; }

export default SupplyChainWorkspace;

// Keep the forecast policy import local to the workspace so the server remains the single source of scope and sales truth.
void Input;
