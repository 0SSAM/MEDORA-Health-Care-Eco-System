import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useLocalization } from "@/contexts/LocalizationContext";
import { trpc } from "@/lib/trpc";
import { AlertTriangle, Check, CheckCircle2, ClipboardCheck, Copy, FileCheck2, LockKeyhole, ShieldCheck } from "lucide-react";

export function GovernmentIntegrationReadinessPacket() {
  const [copied, setCopied] = useState(false);
  const { language, direction } = useLocalization();
  const packet = trpc.auth.governmentIntegrationPacket.useQuery(undefined, { retry: false });
  const isArabic = language === "ar";
  const text = isArabic ? {
    loading: "جارٍ إعداد حزمة الجاهزية التنظيمية…", loadError: "تعذر تحميل حزمة الجاهزية. لم يتم حفظ أي اعتماد أو محاولة اتصال خارجي.", blocked: "مغلق بأمان", ready: "جاهز لطلب تفعيل مُصرّح", summaryTitle: "MEDORA — حزمة جاهزية الارتباط الحكومي", state: "الحالة", completion: "الاكتمال الداخلي", nextAction: "الإجراء التالي", verified: "موثق", required: "مطلوب", safeNote: "ملاحظة: هذا الملخص لا يحتوي أسراراً ولا يفعّل اتصالاً خارجياً.", title: "حزمة جاهزية الارتباط الحكومي", description: "قائمة تسليم واعتماد داخلية قابلة للمراجعة قبل استلام أذونات الجهة. لا ترسل اللوحة أي بيانات ولا تقبل أسراراً.", activationHelp: "حتى اكتمال جميع البنود، تبقى الموصلات مغلقة. واكتمال الحزمة لا يفعّل أي اتصال؛ يلزم قرار تفعيل منفصل بعد قبول الإنتاج الرسمي.", evidenceCompletion: "اكتمال الأدلة والمراجعة", progress: "نسبة اكتمال حزمة الارتباط الحكومي", acceptanceGates: "بوابات القبول المطلوبة", evidence: "الدليل", reviewer: "المراجع المسؤول", copied: "تم النسخ", copy: "نسخ ملخص المراجعة",
  } : {
    loading: "Preparing the regulatory-readiness packet…", loadError: "The readiness packet could not be loaded. No credentials were saved and no external connection was attempted.", blocked: "Fail-closed", ready: "Ready to request authorized activation", summaryTitle: "MEDORA — Government Integration Readiness Packet", state: "State", completion: "Internal completion", nextAction: "Next action", verified: "Verified", required: "Required", safeNote: "Note: This summary contains no secrets and does not activate an external connection.", title: "Government integration readiness packet", description: "An internal, reviewable delivery and accreditation checklist before authority credentials are accepted. This panel sends no data and accepts no secrets.", activationHelp: "Connectors remain fail-closed until every gate is complete. Completing this packet does not activate a connection; a separate activation decision is required after official production acceptance.", evidenceCompletion: "Evidence and review completion", progress: "Government integration packet completion percentage", acceptanceGates: "Required acceptance gates", evidence: "Evidence", reviewer: "Assigned reviewer", copied: "Copied", copy: "Copy review summary",
  };

  if (packet.isLoading) return <Card className="border-indigo-100 bg-indigo-50/40" dir={direction}><CardContent className="flex items-center gap-3 p-6 text-sm text-slate-600"><ClipboardCheck className="h-5 w-5 animate-pulse text-indigo-700" aria-hidden="true" />{text.loading}</CardContent></Card>;
  if (packet.isError || !packet.data) return <Card className="border-rose-200 bg-rose-50" dir={direction}><CardContent className="flex items-start gap-3 p-6 text-sm leading-6 text-rose-900" role="alert"><AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" /><span>{text.loadError}</span></CardContent></Card>;

  const data = packet.data;
  const activationLabel = data.activationState === "blocked" ? text.blocked : text.ready;
  const activationClass = data.activationState === "blocked" ? "border-slate-300 bg-slate-100 text-slate-700" : "border-emerald-300 bg-emerald-50 text-emerald-800";
  const nextAction = isArabic ? data.nextAction : "Complete the outstanding acceptance gates before requesting external activation.";
  const limitation = isArabic ? data.limitation : "This readiness packet remains informational and cannot activate an external connector.";
  const copySummary = async () => {
    const summary = [text.summaryTitle, `${text.state}: ${activationLabel}`, `${text.completion}: ${data.verifiedCount}/${data.totalGateCount} (${data.readinessPercent}%)`, `${text.nextAction}: ${nextAction}`, ...data.gates.map(gate => `- ${isArabic ? gate.titleAr : gate.titleEn}: ${gate.state === "verified" ? text.verified : text.required} — ${text.evidence}: ${isArabic ? gate.evidenceRequired : "Official evidence required"}`), text.safeNote].join("\n");
    try { await navigator.clipboard.writeText(summary); setCopied(true); window.setTimeout(() => setCopied(false), 1800); } catch { setCopied(false); }
  };

  return <Card className="border-indigo-100 bg-gradient-to-br from-white to-indigo-50/50 shadow-sm" aria-labelledby="government-readiness-title" dir={direction}>
    <CardHeader className="pb-3"><div className="flex flex-wrap items-start justify-between gap-3"><div><CardTitle id="government-readiness-title" className="flex items-center gap-2 text-base text-slate-900"><ClipboardCheck className="h-5 w-5 text-indigo-700" aria-hidden="true" />{text.title}</CardTitle><p className="mt-1 text-xs leading-5 text-slate-600">{text.description}</p></div><Tooltip><TooltipTrigger asChild><Badge variant="outline" className={`cursor-help ${activationClass}`}><LockKeyhole className="me-1 h-3.5 w-3.5" aria-hidden="true" />{activationLabel}</Badge></TooltipTrigger><TooltipContent className="max-w-sm text-start leading-5">{text.activationHelp}</TooltipContent></Tooltip></div></CardHeader>
    <CardContent className="space-y-4"><div className="rounded-xl border border-indigo-100 bg-white/80 p-4"><div className="mb-2 flex flex-wrap items-center justify-between gap-2 text-sm"><span className="font-semibold text-slate-800">{text.evidenceCompletion}</span><span className="text-slate-600">{data.verifiedCount} / {data.totalGateCount} · {data.readinessPercent}%</span></div><Progress value={data.readinessPercent} aria-label={text.progress} /><p className="mt-3 flex items-start gap-2 text-xs leading-5 text-slate-600"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-indigo-700" aria-hidden="true" />{nextAction}</p></div>
      <div><div className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-800"><FileCheck2 className="h-4 w-4 text-indigo-700" aria-hidden="true" />{text.acceptanceGates}</div><ul className="grid gap-2 lg:grid-cols-2">{data.gates.map(gate => <li key={gate.id} className="rounded-xl border border-slate-200 bg-white p-3"><div className="flex items-start justify-between gap-3"><div><p className="text-sm font-semibold text-slate-900">{isArabic ? gate.titleAr : gate.titleEn}</p>{isArabic && <p className="mt-0.5 text-[11px] text-slate-500" dir="ltr">{gate.titleEn}</p>}</div><Badge variant="outline" className={gate.state === "verified" ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-amber-200 bg-amber-50 text-amber-900"}>{gate.state === "verified" ? <CheckCircle2 className="me-1 h-3.5 w-3.5" aria-hidden="true" /> : <AlertTriangle className="me-1 h-3.5 w-3.5" aria-hidden="true" />}{gate.state === "verified" ? text.verified : text.required}</Badge></div><p className="mt-2 text-xs leading-5 text-slate-600">{text.evidence}: {isArabic ? gate.evidenceRequired : "Official evidence required"}</p><p className="mt-1 text-[11px] text-slate-500">{text.reviewer}: {isArabic ? gate.reviewOwner : "Assigned internal reviewer"}</p></li>)}</ul></div>
      <div className="flex flex-wrap items-start justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs leading-5 text-slate-600"><div className="flex items-start gap-2"><LockKeyhole className="mt-0.5 h-4 w-4 shrink-0 text-slate-600" aria-hidden="true" />{limitation}</div><Button type="button" size="sm" variant="outline" onClick={copySummary} className="shrink-0 bg-white text-xs" aria-live="polite">{copied ? <Check className="me-1 h-3.5 w-3.5" aria-hidden="true" /> : <Copy className="me-1 h-3.5 w-3.5" aria-hidden="true" />}{copied ? text.copied : text.copy}</Button></div>
    </CardContent>
  </Card>;
}
