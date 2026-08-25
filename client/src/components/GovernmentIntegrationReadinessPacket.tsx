// MEDORA | ميدورا — Integrated Health Care System
// Copyright (c) 2026 Hossam Naeim Osman | حسام نعيم عثمان. All rights reserved.
// Proprietary and confidential. Unauthorized copying, distribution, or use of this
// software, or of any portion of it, is strictly prohibited.
// Source: https://github.com/0SSAM/MEDORA-Health-Care-Eco-System
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { trpc } from "@/lib/trpc";
import { AlertTriangle, CheckCircle2, ClipboardCheck, FileCheck2, LockKeyhole, ShieldCheck } from "lucide-react";

export function GovernmentIntegrationReadinessPacket() {
  const packet = trpc.auth.governmentIntegrationPacket.useQuery(undefined, { retry: false });

  if (packet.isLoading) {
    return <Card className="border-indigo-100 bg-indigo-50/40"><CardContent className="flex items-center gap-3 p-6 text-sm text-slate-600"><ClipboardCheck className="h-5 w-5 animate-pulse text-indigo-700" aria-hidden="true" />جارٍ إعداد حزمة الجاهزية التنظيمية…</CardContent></Card>;
  }
  if (packet.isError || !packet.data) {
    return <Card className="border-rose-200 bg-rose-50"><CardContent className="flex items-start gap-3 p-6 text-sm leading-6 text-rose-900" role="alert"><AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" /><span>تعذر تحميل حزمة الجاهزية. لم يتم حفظ أي اعتماد أو محاولة اتصال خارجي.</span></CardContent></Card>;
  }

  const data = packet.data;
  const activationLabel = data.activationState === "blocked" ? "مغلق بأمان" : "جاهز لطلب تفعيل مُصرّح";
  const activationClass = data.activationState === "blocked" ? "border-slate-300 bg-slate-100 text-slate-700" : "border-emerald-300 bg-emerald-50 text-emerald-800";

  return <Card className="border-indigo-100 bg-gradient-to-br from-white to-indigo-50/50 shadow-sm" aria-labelledby="government-readiness-title">
    <CardHeader className="pb-3"><div className="flex flex-wrap items-start justify-between gap-3"><div><CardTitle id="government-readiness-title" className="flex items-center gap-2 text-base text-slate-900"><ClipboardCheck className="h-5 w-5 text-indigo-700" aria-hidden="true" />حزمة جاهزية الارتباط الحكومي</CardTitle><p className="mt-1 text-xs leading-5 text-slate-600">قائمة تسليم واعتماد داخلية قابلة للمراجعة قبل استلام أذونات الجهة. لا ترسل اللوحة أي بيانات ولا تقبل أسراراً.</p></div><Tooltip><TooltipTrigger asChild><Badge variant="outline" className={`cursor-help ${activationClass}`}><LockKeyhole className="ml-1 h-3.5 w-3.5" aria-hidden="true" />{activationLabel}</Badge></TooltipTrigger><TooltipContent className="max-w-sm text-right leading-5">حتى اكتمال جميع البنود، تبقى الموصلات مغلقة. واكتمال الحزمة لا يفعّل أي اتصال؛ يلزم قرار تفعيل منفصل بعد قبول الإنتاج الرسمي.</TooltipContent></Tooltip></div></CardHeader>
    <CardContent className="space-y-4" dir="rtl"><div className="rounded-xl border border-indigo-100 bg-white/80 p-4"><div className="mb-2 flex flex-wrap items-center justify-between gap-2 text-sm"><span className="font-semibold text-slate-800">اكتمال الأدلة والمراجعة</span><span className="text-slate-600">{data.verifiedCount} من {data.totalGateCount} · {data.readinessPercent}%</span></div><Progress value={data.readinessPercent} aria-label="نسبة اكتمال حزمة الارتباط الحكومي" /><p className="mt-3 flex items-start gap-2 text-xs leading-5 text-slate-600"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-indigo-700" aria-hidden="true" />{data.nextAction}</p></div>
      <div><div className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-800"><FileCheck2 className="h-4 w-4 text-indigo-700" aria-hidden="true" />بوابات القبول المطلوبة</div><ul className="grid gap-2 lg:grid-cols-2">{data.gates.map(gate => <li key={gate.id} className="rounded-xl border border-slate-200 bg-white p-3"><div className="flex items-start justify-between gap-3"><div><p className="text-sm font-semibold text-slate-900">{gate.titleAr}</p><p className="mt-0.5 text-[11px] text-slate-500" dir="ltr">{gate.titleEn}</p></div><Badge variant="outline" className={gate.state === "verified" ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-amber-200 bg-amber-50 text-amber-900"}>{gate.state === "verified" ? <CheckCircle2 className="ml-1 h-3.5 w-3.5" aria-hidden="true" /> : <AlertTriangle className="ml-1 h-3.5 w-3.5" aria-hidden="true" />}{gate.state === "verified" ? "موثق" : "مطلوب"}</Badge></div><p className="mt-2 text-xs leading-5 text-slate-600">الدليل: {gate.evidenceRequired}</p><p className="mt-1 text-[11px] text-slate-500">المراجع المسؤول: {gate.reviewOwner}</p></li>)}</ul></div>
      <div className="flex items-start gap-2 rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs leading-5 text-slate-600"><LockKeyhole className="mt-0.5 h-4 w-4 shrink-0 text-slate-600" aria-hidden="true" />{data.limitation}</div>
    </CardContent>
  </Card>;
}
