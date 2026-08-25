// MEDORA | ميدورا — Integrated Health Care System
// Copyright (c) 2026 Hossam Naeim Osman | حسام نعيم عثمان. All rights reserved.
// Proprietary and confidential. Unauthorized copying, distribution, or use of this
// software, or of any portion of it, is strictly prohibited.
// Source: https://github.com/0SSAM/MEDORA-Health-Care-Eco-System
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { trpc } from "@/lib/trpc";
import { GovernmentIntegrationReadinessPacket } from "@/components/GovernmentIntegrationReadinessPacket";
import { AlertTriangle, Bell, CheckCircle2, Check, Clock3, Filter, Info, LockKeyhole, Search, ShieldCheck } from "lucide-react";

const stateLabels = {
  blocked: { ar: "مغلق بأمان", en: "Fail-closed", className: "border-slate-300 bg-slate-100 text-slate-700" },
  deferred: { ar: "مؤجل", en: "Deferred", className: "border-amber-300 bg-amber-50 text-amber-900" },
  ready: { ar: "جاهز للمراجعة", en: "Ready for review", className: "border-emerald-300 bg-emerald-50 text-emerald-800" },
} as const;

function SelectField({ label, value, onChange, children }: { label: string; value: string; onChange: (value: string) => void; children: React.ReactNode }) {
  return <label className="space-y-1 text-sm text-slate-700"><span className="block text-xs font-semibold text-slate-500">{label}</span><select value={value} onChange={event => onChange(event.target.value)} className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm shadow-sm outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100">{children}</select></label>;
}

export function ConnectorAccreditationDashboard() {
  const [countryCode, setCountryCode] = useState("ALL");
  const [provider, setProvider] = useState("ALL");
  const [connectorType, setConnectorType] = useState("ALL");
  const [readinessState, setReadinessState] = useState("ALL");
  const [acknowledgedAlerts, setAcknowledgedAlerts] = useState<string[]>([]);
  const input = useMemo(() => ({ countryCode: countryCode as "ALL" | "EG", provider, connectorType: connectorType as "ALL" | "government-regulatory" | "insurance-payer", readinessState: readinessState as "ALL" | "blocked" | "deferred" | "ready" }), [countryCode, provider, connectorType, readinessState]);
  const readiness = trpc.auth.connectorReadiness.useQuery(input, { retry: false });

  if (readiness.isLoading) return <Card className="border-slate-200 bg-white/80"><CardContent className="flex items-center gap-3 p-6 text-sm text-slate-600"><Clock3 className="h-5 w-5 animate-pulse text-cyan-700" aria-hidden="true" />جارٍ تحميل مركز الموصلات…</CardContent></Card>;
  if (readiness.isError || !readiness.data) return <Card className="border-rose-200 bg-rose-50"><CardContent className="flex items-start gap-3 p-6 text-sm leading-6 text-rose-900" role="alert"><AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" /><span>تعذر تحميل اللوحة. لم يتم تغيير أي اعتماد أو محاولة اتصال خارجي.</span></CardContent></Card>;

  const { data } = readiness;
  const blockedCount = data.connectors.filter(item => item.state === "blocked").length;
  const unreadAlertCount = data.alerts.filter(alert => !acknowledgedAlerts.includes(alert.id)).length;
  const reviewedAt = new Date(data.reviewedAt).toLocaleString("ar-EG");
  const alertStyles = {
    critical: "border-rose-200 bg-rose-50 text-rose-950",
    warning: "border-amber-200 bg-amber-50 text-amber-950",
    info: "border-cyan-200 bg-cyan-50 text-cyan-950",
  } as const;
  const alertLabels = {
    critical: "عاجل",
    warning: "تنبيه",
    info: "معلومة",
  } as const;
  const reset = () => { setCountryCode("ALL"); setProvider("ALL"); setConnectorType("ALL"); setReadinessState("ALL"); };

  return <section className="space-y-4" aria-labelledby="connector-dashboard-title" dir="rtl">
    <Card className="border-cyan-100 bg-gradient-to-br from-white to-cyan-50/50 shadow-sm">
      <CardHeader className="pb-4"><div className="flex flex-wrap items-start justify-between gap-3"><div><CardTitle id="connector-dashboard-title" className="flex items-center gap-2 text-xl text-slate-900"><ShieldCheck className="h-5 w-5 text-cyan-700" aria-hidden="true" />مركز الموصلات والاعتمادات</CardTitle><p className="mt-2 text-sm leading-6 text-slate-600">تصفية ومتابعة الجاهزية التنظيمية والتأمينية. اللوحة للقراءة والتدقيق فقط ولا تفعّل أي إرسال خارجي.</p></div><Tooltip><TooltipTrigger asChild><Badge variant="outline" className="cursor-help border-slate-300 bg-white text-slate-700"><LockKeyhole className="ml-1 h-3.5 w-3.5" aria-hidden="true" />سياسة fail-closed</Badge></TooltipTrigger><TooltipContent className="max-w-sm text-right leading-5">لا يتغير الموصل إلى نشط إلا بعد المواصفة الرسمية والاعتماد وبيئة الاختبار والقبول الموثق. لا تعرض اللوحة أسراراً.</TooltipContent></Tooltip></div></CardHeader>
      <CardContent className="space-y-4"><div className="flex items-center gap-2 text-sm font-semibold text-slate-800"><Filter className="h-4 w-4 text-cyan-700" aria-hidden="true" />فلاتر متقدمة</div><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"><SelectField label="الدولة" value={countryCode} onChange={setCountryCode}><option value="ALL">كل الدول</option><option value="EG">مصر (EG)</option></SelectField><SelectField label="الجهة المزودة" value={provider} onChange={setProvider}><option value="ALL">كل الجهات</option>{data.filterOptions.providers.map(item => <option key={item} value={item}>{item}</option>)}</SelectField><SelectField label="نوع الموصل" value={connectorType} onChange={setConnectorType}><option value="ALL">كل الأنواع</option><option value="government-regulatory">حكومي وتنظيمي</option><option value="insurance-payer">تأميني / جهة دافعة</option></SelectField><SelectField label="مرحلة الجاهزية" value={readinessState} onChange={setReadinessState}><option value="ALL">كل المراحل</option><option value="blocked">مغلق بأمان</option><option value="deferred">مؤجل</option><option value="ready">جاهز للمراجعة</option></SelectField></div><div className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-white/80 p-3 text-xs text-slate-600"><span className="flex items-center gap-2"><Search className="h-4 w-4 text-cyan-700" aria-hidden="true" />عرض {data.connectors.length} من {data.filterOptions.total} موصلات · {blockedCount} مغلق بأمان</span><Button type="button" variant="outline" size="sm" onClick={reset}>مسح الفلاتر</Button></div></CardContent>
    </Card>

    <GovernmentIntegrationReadinessPacket />

    <Card className="border-amber-100 bg-gradient-to-br from-white to-amber-50/60 shadow-sm" aria-labelledby="connector-alerts-title">
      <CardHeader className="pb-3"><div className="flex flex-wrap items-center justify-between gap-3"><div><CardTitle id="connector-alerts-title" className="flex items-center gap-2 text-base text-slate-900"><Bell className="h-5 w-5 text-amber-700" aria-hidden="true" />تنبيهات الاعتمادات وحالة الموصلات</CardTitle><p className="mt-1 text-xs leading-5 text-slate-600">تنبيهات داخلية للمسؤولين فقط. لا يتم إرسال أي بيانات إلى جهات خارجية.</p></div><Badge variant="outline" className="border-amber-200 bg-white text-amber-900" aria-live="polite">{unreadAlertCount} غير مقروء</Badge></div></CardHeader>
      <CardContent className="space-y-3" aria-live="polite">{data.alerts.length === 0 ? <p className="rounded-lg bg-slate-50 p-4 text-sm text-slate-600">لا توجد تنبيهات حالية ضمن الفلاتر.</p> : <>{data.alerts.map(alert => { const acknowledged = acknowledgedAlerts.includes(alert.id); return <article key={alert.id} className={`rounded-xl border p-3 ${alertStyles[alert.severity]} ${acknowledged ? "opacity-60" : ""}`}><div className="flex items-start justify-between gap-3"><div className="flex items-start gap-2"><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" /><div><div className="flex flex-wrap items-center gap-2"><h3 className="text-sm font-semibold">{alert.title}</h3><Badge variant="outline" className="border-current/20 bg-white/60 text-[10px]">{alertLabels[alert.severity]}</Badge></div><p className="mt-1 text-xs leading-5">{alert.detail}</p><p className="mt-1 text-[11px] opacity-75">الموصل: {alert.connectorId} · {new Date(alert.occurredAt).toLocaleString("ar-EG")}</p></div></div><Button type="button" size="sm" variant="outline" className="shrink-0 border-current/20 bg-white/70 text-xs" onClick={() => setAcknowledgedAlerts(current => acknowledged ? current.filter(id => id !== alert.id) : [...current, alert.id])} aria-label={acknowledged ? "إعادة فتح التنبيه" : "تمييز التنبيه كمقروء"}>{acknowledged ? <Bell className="ml-1 h-3.5 w-3.5" aria-hidden="true" /> : <Check className="ml-1 h-3.5 w-3.5" aria-hidden="true" />}{acknowledged ? "إعادة فتح" : "تمت المراجعة"}</Button></div></article>; })}</>}</CardContent>
    </Card>

    <div className="grid gap-4 xl:grid-cols-2">{data.connectors.map(connector => { const state = stateLabels[connector.state]; return <Card key={connector.id} className="border-slate-200 bg-white shadow-sm"><CardHeader className="pb-3"><div className="flex items-start justify-between gap-3"><div><CardTitle className="text-base text-slate-900">{connector.name}</CardTitle><p className="mt-1 text-xs text-slate-500">{connector.countryCode} · {connector.connectorType} · {connector.providers.join(" · ")}</p></div><Tooltip><TooltipTrigger asChild><Badge variant="outline" className={`cursor-help ${state.className}`}><LockKeyhole className="ml-1 h-3.5 w-3.5" aria-hidden="true" />{state.ar}</Badge></TooltipTrigger><TooltipContent className="max-w-xs text-right leading-5">الحالة الإنجليزية: {state.en}. لا يوجد تفعيل خارجي في هذه المرحلة.</TooltipContent></Tooltip></div></CardHeader><CardContent className="space-y-4"><div><div className="mb-1 flex justify-between text-xs text-slate-500"><span>نسبة الجاهزية الداخلية</span><span>{connector.readinessPercent}%</span></div><Progress value={connector.readinessPercent} aria-label={`نسبة جاهزية ${connector.name}`} /></div><div><p className="mb-2 text-sm font-semibold text-slate-800">المتطلبات المتبقية</p><ul className="space-y-2 text-sm leading-5 text-slate-600">{connector.prerequisites.map(item => <li key={item} className="flex items-start gap-2"><Info className="mt-0.5 h-4 w-4 shrink-0 text-cyan-700" aria-hidden="true" /><span>{item}</span></li>)}</ul></div><div className="flex items-start gap-2 rounded-lg bg-slate-50 p-3 text-xs leading-5 text-slate-600"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" aria-hidden="true" />{connector.note}</div></CardContent></Card>; })}</div>

    <Card className="border-slate-200 bg-white shadow-sm"><CardHeader><CardTitle className="text-base text-slate-900">سجل تدقيق تغييرات الموصلات</CardTitle><p className="text-xs leading-5 text-slate-500">سجل محمي ومختصر يعرض مراجعات الحالة والتغييرات المصرح بها فقط؛ لا يتم تسجيل كلمات مرور أو مفاتيح أو رموز.</p></CardHeader><CardContent className="space-y-2">{data.auditLog.length === 0 ? <p className="rounded-lg bg-slate-50 p-4 text-sm text-slate-600">لا توجد سجلات مطابقة للفلاتر الحالية.</p> : data.auditLog.map(entry => <div key={`${entry.connectorId}-${entry.recordHash}`} className="grid gap-2 rounded-lg border border-slate-100 bg-slate-50/70 p-3 text-xs text-slate-600 sm:grid-cols-[1fr_auto] sm:items-center"><div><p className="font-semibold text-slate-800">{entry.connectorId} · {entry.newState} · {entry.reason}</p><p className="mt-1">الفاعل: مسؤول النظام · الدولة: {entry.countryCode} · النطاق: {entry.connectorType}</p></div><Tooltip><TooltipTrigger asChild><span className="flex cursor-help items-center gap-1 text-emerald-700"><ShieldCheck className="h-4 w-4" aria-hidden="true" />سجل موقّع</span></TooltipTrigger><TooltipContent>سلسلة السجل موقعة بمفتاح التدقيق الخادمي، ولا يظهر المفتاح في الواجهة.</TooltipContent></Tooltip></div>)}</CardContent></Card>
    <p className="text-xs text-slate-500">آخر مراجعة: {reviewedAt} · سياسة التفعيل: fail-closed</p>
  </section>;
}
