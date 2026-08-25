// MEDORA | ميدورا — Integrated Health Care System
// Copyright (c) 2026 Hossam Naeim Osman | حسام نعيم عثمان. All rights reserved.
// Proprietary and confidential. Unauthorized copying, distribution, or use of this
// software, or of any portion of it, is strictly prohibited.
// Source: https://github.com/0SSAM/MEDORA-Health-Care-Eco-System
import { skipToken } from "@tanstack/react-query";
import { BrainCircuit, EyeOff, LockKeyhole, ShieldAlert, Sparkles, UserCheck } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";

export function AiGovernanceWorkspace({ organizationId }: { organizationId: number | null }) {
  const readiness = trpc.aiGovernance.readiness.useQuery(organizationId ? { organizationId } : skipToken);
  const monitoring = trpc.aiGovernance.workplaceMonitoringReadiness.useQuery(organizationId ? { organizationId } : skipToken);
  const generate = trpc.aiGovernance.generateOperationalBrief.useMutation();
  const [facts, setFacts] = useState("");

  if (!organizationId) return <Card><CardContent className="p-6 text-sm text-slate-600">اختر مؤسسة أولًا لعرض ضوابط الذكاء الاصطناعي والمراقبة الخاصة بها.</CardContent></Card>;
  const submit = () => {
    const operationalFacts = facts.split("\n").map(item => item.trim()).filter(Boolean);
    generate.mutate({ organizationId, useCase: "workflow_triage", operationalFacts, containsProtectedData: false, humanReviewAcknowledged: true });
  };

  return <div className="space-y-5" dir="rtl">
    <Card className="border-cyan-100 bg-gradient-to-br from-cyan-50 via-white to-violet-50 shadow-sm">
      <CardHeader className="pb-3"><div className="flex flex-wrap items-start justify-between gap-3"><div><CardTitle className="flex items-center gap-2 text-slate-900"><BrainCircuit className="h-5 w-5 text-cyan-700" /> الذكاء الاصطناعي التشغيلي المحكوم</CardTitle><CardDescription className="mt-2 max-w-3xl leading-6">تحليل مساعد لحقائق تشغيلية غير حساسة فقط. كل نتيجة استشارية، ولا تُنفّذ قرارًا طبيًا أو وظيفيًا أو ماليًا أو تنظيميًا.</CardDescription></div><Badge className="bg-cyan-700">{readiness.data?.state ?? "جارٍ التحقق"}</Badge></div></CardHeader>
      <CardContent className="grid gap-3 md:grid-cols-2">{(readiness.data?.requiredControls ?? []).map(control => <div key={control} className="rounded-xl border border-cyan-100 bg-white/80 p-3 text-sm text-slate-700"><ShieldAlert className="mb-2 h-4 w-4 text-cyan-700" />{control}</div>)}</CardContent>
    </Card>

    <Card><CardHeader><CardTitle className="flex items-center gap-2"><Sparkles className="h-5 w-5 text-violet-700" />موجز تشغيلي مساعد</CardTitle><CardDescription>أدخل حقائق موجزة مثل مؤشرات مخزون أو مهام متأخرة. لا تضع أسماء أشخاص أو مرضى أو وصفات أو أرقام اتصال أو سجلات طبية.</CardDescription></CardHeader><CardContent className="space-y-3"><Textarea value={facts} onChange={event => setFacts(event.target.value)} placeholder={"مثال آمن:\n12 صنفًا وصل إلى حد إعادة الطلب هذا الأسبوع\n7 مهام اعتماد متأخرة أكثر من 48 ساعة"} className="min-h-28 bg-slate-50" /><div className="flex flex-wrap items-center justify-between gap-3"><p className="text-xs leading-5 text-slate-500">بتشغيل التحليل أنت تقر بأن المحتوى تشغيلي وغير حساس وأنك ستراجعه بشريًا قبل أي إجراء.</p><Button onClick={submit} disabled={!facts.trim() || generate.isPending} className="gap-2"><UserCheck className="h-4 w-4" />{generate.isPending ? "جارٍ التحليل…" : "إنشاء موجز استشاري"}</Button></div>{generate.error && <p className="rounded-lg bg-rose-50 p-3 text-sm text-rose-700">{generate.error.message}</p>}{generate.data && <div className="rounded-xl border border-violet-100 bg-violet-50/60 p-4 text-sm text-slate-700"><p className="font-semibold text-slate-900">{generate.data.brief.summary}</p><ul className="mt-3 space-y-2">{generate.data.brief.prioritizedActions.map((item, index) => <li key={`${item.action}-${index}`} className="rounded-lg bg-white p-3"><span className="font-medium">{item.action}</span><span className="mx-2 text-slate-400">—</span>{item.rationale}</li>)}</ul><p className="mt-3 text-xs text-violet-800">تتطلب النتيجة مراجعة بشرية ولا تُنفذ أي إجراء تلقائيًا.</p></div>}</CardContent></Card>

    <Card className="border-amber-200"><CardHeader><div className="flex flex-wrap items-start justify-between gap-3"><div><CardTitle className="flex items-center gap-2"><EyeOff className="h-5 w-5 text-amber-700" />جاهزية مراقبة مواقع العمل</CardTitle><CardDescription className="mt-2">لا يوجد اتصال كاميرا أو ميكروفون أو تخزين للوسائط في هذه المنظومة. أي إمكانية مستقبلية تبقى مقفلة حتى الاستيفاء القانوني والخصوصي والأمني.</CardDescription></div><Badge variant="destructive">{monitoring.data?.state ?? "BLOCKED"}</Badge></div></CardHeader><CardContent className="grid gap-4 md:grid-cols-2"><div><h3 className="mb-2 flex items-center gap-2 text-sm font-semibold"><LockKeyhole className="h-4 w-4 text-rose-700" />محظور صراحة</h3><ul className="space-y-2 text-sm text-slate-600">{(monitoring.data?.prohibitedCapabilities ?? []).map(item => <li key={item}>• {item}</li>)}</ul></div><div><h3 className="mb-2 flex items-center gap-2 text-sm font-semibold"><ShieldAlert className="h-4 w-4 text-amber-700" />بوابات مطلوبة قبل أي ربط</h3><ul className="space-y-2 text-sm text-slate-600">{(monitoring.data?.requiredGates ?? []).map(item => <li key={item}>• {item}</li>)}</ul></div></CardContent></Card>
  </div>;
}
