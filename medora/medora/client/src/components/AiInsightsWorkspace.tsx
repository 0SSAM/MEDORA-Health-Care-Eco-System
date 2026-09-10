import { skipToken } from "@tanstack/react-query";
import {
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  ClipboardCheck,
  FileText,
  Lightbulb,
  Loader2,
  MessageSquareText,
  PackageSearch,
  ShieldAlert,
  Sparkles,
  UserCheck,
  XCircle,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocalization } from "@/contexts/LocalizationContext";
import { trpc } from "@/lib/trpc";

type Props = { organizationId: number | null; branchId: number | null; jurisdictionId: number | null };
type Insight = {
  id: number;
  insightType: string;
  status: string;
  title: string;
  summary: string;
  evidenceJson: string;
  recommendationJson: string;
  confidence: string | number;
  requiresHumanReview: number;
};
type InterfaceLanguage = "ar" | "en";

const copy = {
  ar: {
    scopeRequired: "اختر المؤسسة والفرع أولاً لتشغيل التحليلات المحكومة.",
    title: "مركز الذكاء الاصطناعي التشغيلي",
    subtitle: "تحليلات مبنية على المبيعات والمخزون والطلبات ومؤشرات التشغيل المجمعة داخل نطاق الفرع. النتائج استشارية فقط، ولا تنشئ أمر شراء أو قراراً طبياً أو مالياً أو وظيفياً.",
    humanReview: "مراجعة بشرية إلزامية",
    purchasing: "تحليل المشتريات",
    purchasingDetail: "الطلب، المخزون، نقاط إعادة الطلب، ومؤشرات الشذوذ",
    decision: "دعم اتخاذ القرار",
    decisionDetail: "موجز مؤشرات التشغيل والاستثناءات",
    improvement: "اقتراحات التطوير",
    improvementDetail: "فرص تحسين مستندة إلى بيانات النظام",
    guardrail: "كل نتيجة تحتوي على مصدر الدليل والقيود ودرجة ثقة تقريبية. لا يجوز قبولها أو تحويلها إلى إجراء إلا بعد مراجعة مستخدم مخوّل، وتظل الموصلات الحكومية والتأمينية الخارجية مقفلة.",
    preparing: "جارٍ تجهيز التحليل والتحقق من النتيجة المنظمة…",
    failed: "تعذر إنشاء التحليل:",
    logTitle: "سجل التحليلات والمقترحات",
    logDescription: "اعرض النتيجة ثم حدّد حالتها بعد المراجعة. القبول هنا توثيقي ولا ينفذ الإجراء.",
    noResults: "لا توجد نتائج لهذا النطاق بعد. ابدأ بأحد التحليلات أعلاه.",
    confidence: "الثقة",
    review: "مراجعة بشرية",
    required: "مطلوبة",
    notRequired: "غير مطلوبة",
    purchasingReview: "مراجعة توصية المشتريات",
    insightReview: "تفاصيل النتيجة والمراجعة البشرية",
    stepOne: "1. افهم الدليل",
    stepOneDetail: "راجع الطلب والمخزون ونقطة إعادة الطلب.",
    stepTwo: "2. وثّق الحكم",
    stepTwoDetail: "اكتب سبب القبول أو الرفض عند الحاجة.",
    stepThree: "3. اختر الحالة",
    stepThreeDetail: "التغيير توثيقي ولا ينشئ أمر شراء.",
    evidence: "الدليل المستخدم",
    source: "المصدر",
    recommendations: "التوصيات الاستشارية",
    limitations: "القيود",
    noLimitations: "لا توجد قيود إضافية مسجلة.",
    reviewerNote: "ملاحظة المراجع",
    purchasingPlaceholder: "اذكر سبب اعتماد التوصية أو ما يحتاج إلى تحقق إضافي…",
    reviewPlaceholder: "أضف سياقاً تشغيلياً يفسر قرار المراجعة…",
    auditNote: "تُحفظ الملاحظة مع سجل التدقيق ولا تُرسل إلى جهة خارجية.",
    keepUnderReview: "إبقاءها قيد المراجعة",
    acceptAdvisory: "اعتماد استشاري",
    reject: "رفض التوصية",
    recordOnly: "هذه الحالة لا تنفذ شراءً ولا تعدل المخزون أو الأسعار. أي إجراء لاحق يجب أن يتم عبر سير العمل التشغيلي المعتاد وبصلاحية منفصلة.",
    generated: "مولّد للمراجعة",
    underReview: "قيد المراجعة",
    accepted: "مقبول بشرياً",
    rejected: "مرفوض",
    dismissed: "مستبعد",
    purchasingAnalysis: "تحليل المشتريات",
    decisionSupport: "دعم اتخاذ القرار",
    improvementProposal: "اقتراح تطوير",
    acceptNoteRequired: "أضف ملاحظة قصيرة قبل اعتماد التوصية لتوثيق سبب القرار.",
    outcomeNoteRequired: "أضف سبب القرار حتى يبقى القرار قابلاً للمراجعة والتعلم.",
  },
  en: {
    scopeRequired: "Select an organisation and branch before using governed analytics.",
    title: "Operational AI Centre",
    subtitle: "Insights are based on branch-scoped sales, inventory, requests, and operating indicators. They are advisory only and never create a purchase order or a medical, financial, or employment decision.",
    humanReview: "Human review required",
    purchasing: "Purchasing analysis",
    purchasingDetail: "Demand, inventory, reorder points, and anomaly indicators",
    decision: "Decision support",
    decisionDetail: "A concise view of operating indicators and exceptions",
    improvement: "Improvement ideas",
    improvementDetail: "Data-informed opportunities to improve the system",
    guardrail: "Each result includes its evidence source, limitations, and an approximate confidence level. An authorised user must review it before it can inform action; government and insurance connectors remain locked.",
    preparing: "Preparing the analysis and checking its structured result…",
    failed: "The analysis could not be created:",
    logTitle: "Insight and proposal log",
    logDescription: "Open a result, then document its review status. Acceptance here records a decision; it does not execute action.",
    noResults: "There are no results in this scope yet. Start with one of the analyses above.",
    confidence: "Confidence",
    review: "Human review",
    required: "Required",
    notRequired: "Not required",
    purchasingReview: "Purchasing recommendation review",
    insightReview: "Result details and human review",
    stepOne: "1. Understand the evidence",
    stepOneDetail: "Review demand, stock, and the reorder point.",
    stepTwo: "2. Record your judgement",
    stepTwoDetail: "Add a reason when accepting or rejecting it.",
    stepThree: "3. Choose a status",
    stepThreeDetail: "This is a record only; it does not create a purchase order.",
    evidence: "Evidence used",
    source: "Source",
    recommendations: "Advisory recommendations",
    limitations: "Limitations",
    noLimitations: "No additional limitations are recorded.",
    reviewerNote: "Reviewer note",
    purchasingPlaceholder: "Explain why you accept the recommendation or what needs further verification…",
    reviewPlaceholder: "Add operating context that explains your review decision…",
    auditNote: "This note is retained in the audit trail and is not sent to an external party.",
    keepUnderReview: "Keep under review",
    acceptAdvisory: "Accept as advisory",
    reject: "Reject recommendation",
    recordOnly: "This status does not make a purchase or alter inventory or prices. Any subsequent action must follow the normal operating workflow with its own authority.",
    generated: "Generated for review",
    underReview: "Under review",
    accepted: "Human accepted",
    rejected: "Rejected",
    dismissed: "Dismissed",
    purchasingAnalysis: "Purchasing analysis",
    decisionSupport: "Decision support",
    improvementProposal: "Improvement proposal",
    acceptNoteRequired: "Add a brief note before accepting the recommendation to record the decision basis.",
    outcomeNoteRequired: "Add the decision reason so it remains reviewable and useful for learning.",
  },
} as const;

function parseJson<T>(value: string, fallback: T): T {
  try { return JSON.parse(value) as T; } catch { return fallback; }
}

function getLabels(language: InterfaceLanguage) {
  const text = copy[language];
  return {
    purchasing_analysis: text.purchasingAnalysis,
    decision_support: text.decisionSupport,
    improvement_proposal: text.improvementProposal,
  } as Record<string, string>;
}

function getStatusLabels(language: InterfaceLanguage) {
  const text = copy[language];
  return { generated: text.generated, under_review: text.underReview, accepted: text.accepted, rejected: text.rejected, dismissed: text.dismissed } as Record<string, string>;
}

export function getReviewValidation(
  status: "under_review" | "accepted" | "rejected" | "dismissed",
  note: string,
  language: InterfaceLanguage = "ar"
): string | null {
  if ((status === "accepted" || status === "rejected" || status === "dismissed") && !note.trim()) {
    return status === "accepted" ? copy[language].acceptNoteRequired : copy[language].outcomeNoteRequired;
  }
  return null;
}

export function AiInsightsWorkspace({ organizationId, branchId, jurisdictionId }: Props) {
  const { language } = useLocalization();
  const interfaceLanguage: InterfaceLanguage = language === "en" ? "en" : "ar";
  const text = copy[interfaceLanguage];
  const dir = interfaceLanguage === "ar" ? "rtl" : "ltr";
  const labels = getLabels(interfaceLanguage);
  const statusLabels = getStatusLabels(interfaceLanguage);
  const enabled = Boolean(organizationId && branchId);
  const input = enabled ? { organizationId: organizationId!, branchId: branchId!, jurisdictionId: jurisdictionId ?? undefined } : skipToken;
  const insights = trpc.aiInsights.list.useQuery(input, { retry: false });
  const purchasing = trpc.aiInsights.generatePurchasingAnalysis.useMutation({ onSuccess: () => void insights.refetch() });
  const decision = trpc.aiInsights.generateDecisionSupport.useMutation({ onSuccess: () => void insights.refetch() });
  const improvement = trpc.aiInsights.generateImprovementProposal.useMutation({ onSuccess: () => void insights.refetch() });
  const review = trpc.aiInsights.review.useMutation({ onSuccess: () => void insights.refetch() });
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const selected = useMemo(() => (insights.data as Insight[] | undefined)?.find(item => item.id === selectedId) ?? null, [insights.data, selectedId]);

  if (!organizationId || !branchId) {
    return <Card dir={dir}><CardContent className="p-6 text-sm text-slate-600">{text.scopeRequired}</CardContent></Card>;
  }
  const busy = purchasing.isPending || decision.isPending || improvement.isPending;
  const generate = (kind: "purchasing" | "decision" | "improvement") => {
    const payload = { organizationId, branchId, jurisdictionId: jurisdictionId ?? undefined };
    if (kind === "purchasing") purchasing.mutate({ ...payload, historyDays: 56 });
    if (kind === "decision") decision.mutate(payload);
    if (kind === "improvement") improvement.mutate(payload);
  };
  const error = purchasing.error ?? decision.error ?? improvement.error ?? review.error;
  const reviewInsight = (nextStatus: "under_review" | "accepted" | "rejected" | "dismissed", reviewNote?: string) => {
    if (selected) review.mutate({ insightId: selected.id, nextStatus, reviewNote });
  };

  return (
    <div className="space-y-5" dir={dir}>
      <Card className="border-violet-200 bg-gradient-to-br from-violet-50 via-white to-cyan-50">
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <CardTitle className="flex items-center gap-2 text-slate-900"><Sparkles className="h-5 w-5 text-violet-700" />{text.title}</CardTitle>
              <CardDescription className="mt-2 max-w-3xl leading-6">{text.subtitle}</CardDescription>
            </div>
            <Badge className="bg-amber-600">{text.humanReview}</Badge>
          </div>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-3">
          <ActionButton icon={<PackageSearch className="h-5 w-5 shrink-0" />} title={text.purchasing} detail={text.purchasingDetail} disabled={busy} onClick={() => generate("purchasing")} tone="bg-cyan-700 hover:bg-cyan-800" />
          <ActionButton icon={<BarChart3 className="h-5 w-5 shrink-0" />} title={text.decision} detail={text.decisionDetail} disabled={busy} onClick={() => generate("decision")} tone="bg-violet-700 hover:bg-violet-800" />
          <ActionButton icon={<Lightbulb className="h-5 w-5 shrink-0" />} title={text.improvement} detail={text.improvementDetail} disabled={busy} onClick={() => generate("improvement")} tone="bg-emerald-700 hover:bg-emerald-800" />
        </CardContent>
      </Card>
      <Card className="border-amber-200 bg-amber-50/50"><CardContent className="flex gap-3 p-4 text-sm leading-6 text-amber-950"><ShieldAlert className="mt-1 h-5 w-5 shrink-0 text-amber-700" /><p>{text.guardrail}</p></CardContent></Card>
      {busy && <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-600"><Loader2 className="h-4 w-4 animate-spin" />{text.preparing}</div>}
      {error && <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{text.failed} {error.message}</div>}
      <Card>
        <CardHeader><CardTitle>{text.logTitle}</CardTitle><CardDescription>{text.logDescription}</CardDescription></CardHeader>
        <CardContent className="space-y-3">
          {!insights.data?.length && <p className="rounded-xl bg-slate-50 p-5 text-sm text-slate-500">{text.noResults}</p>}
          {(insights.data as Insight[] | undefined)?.map(item => <button key={item.id} onClick={() => setSelectedId(item.id)} className={`w-full rounded-xl border p-4 text-start transition hover:border-violet-300 hover:shadow-sm ${selectedId === item.id ? "border-violet-400 bg-violet-50" : "border-slate-200 bg-white"}`}>
            <div className="flex flex-wrap items-center justify-between gap-2"><span className="font-semibold text-slate-900">{item.title}</span><span className="flex items-center gap-2"><Badge variant="outline">{labels[item.insightType] ?? item.insightType}</Badge><Badge variant={item.status === "accepted" ? "default" : "secondary"}>{statusLabels[item.status] ?? item.status}</Badge></span></div>
            <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">{item.summary}</p>
            <p className="mt-2 text-xs text-slate-500">{text.confidence}: {(Number(item.confidence) * 100).toFixed(0)}% · {text.review}: {item.requiresHumanReview ? text.required : text.notRequired}</p>
          </button>)}
        </CardContent>
      </Card>
      {selected && <InsightDetail item={selected} onReview={reviewInsight} reviewPending={review.isPending} language={interfaceLanguage} />}
    </div>
  );
}

function ActionButton({ icon, title, detail, disabled, onClick, tone }: { icon: React.ReactNode; title: string; detail: string; disabled: boolean; onClick: () => void; tone: string }) {
  return <Button disabled={disabled} onClick={onClick} className={`h-auto justify-start gap-3 whitespace-normal p-4 text-start ${tone}`}><span>{icon}</span><span><strong className="block">{title}</strong><small className="font-normal opacity-90">{detail}</small></span></Button>;
}

function InsightDetail({ item, onReview, reviewPending, language }: { item: Insight; onReview: (status: "under_review" | "accepted" | "rejected" | "dismissed", reviewNote?: string) => void; reviewPending: boolean; language: InterfaceLanguage }) {
  const text = copy[language];
  const statusLabels = getStatusLabels(language);
  const [reviewNote, setReviewNote] = useState("");
  const [reviewError, setReviewError] = useState<string | null>(null);
  const isPurchasing = item.insightType === "purchasing_analysis";
  const evidence = parseJson<{ evidence?: Array<{ metric: string; value: string; source: string }>; limitations?: string[] }>(item.evidenceJson, {});
  const recommendations = parseJson<Array<{ action: string; rationale: string; priority: string }>>(item.recommendationJson, []);
  return <Card className="border-violet-200">
    <CardHeader className="border-b border-violet-100 bg-violet-50/50">
      <div className="flex flex-wrap items-start justify-between gap-3"><div><CardTitle className="flex items-center gap-2">{isPurchasing ? <ClipboardCheck className="h-5 w-5 text-cyan-700" /> : <UserCheck className="h-5 w-5 text-violet-700" />}{isPurchasing ? text.purchasingReview : text.insightReview}</CardTitle><CardDescription className="mt-2">{item.summary}</CardDescription></div><Badge variant={item.status === "accepted" ? "default" : "secondary"}>{statusLabels[item.status] ?? item.status}</Badge></div>
      {isPurchasing && <div className="mt-4 grid gap-2 text-xs text-slate-700 sm:grid-cols-3"><InfoStep title={text.stepOne} detail={text.stepOneDetail} /><InfoStep title={text.stepTwo} detail={text.stepTwoDetail} /><InfoStep title={text.stepThree} detail={text.stepThreeDetail} /></div>}
    </CardHeader>
    <CardContent className="space-y-4">
      <div><h3 className="mb-2 text-sm font-semibold">{text.evidence}</h3><div className="grid gap-2 md:grid-cols-3">{(evidence.evidence ?? []).map((entry, index) => <div key={`${entry.metric}-${index}`} className="rounded-lg bg-slate-50 p-3 text-sm"><strong className="block">{entry.metric}</strong><span className="block text-slate-700">{entry.value}</span><small className="text-slate-500">{text.source}: {entry.source}</small></div>)}</div></div>
      <div><h3 className="mb-2 text-sm font-semibold">{text.recommendations}</h3><ul className="space-y-2">{recommendations.map((entry, index) => <li key={`${entry.action}-${index}`} className="rounded-lg border border-slate-200 p-3 text-sm"><span className="font-medium">{entry.action}</span><span className="mx-2 text-slate-400">—</span>{entry.rationale}<Badge variant="outline" className="ms-2">{entry.priority}</Badge></li>)}</ul></div>
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-900"><AlertTriangle className="me-1 inline h-4 w-4" />{text.limitations}: {(evidence.limitations ?? []).join(language === "ar" ? "، " : ", ") || text.noLimitations}</div>
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4"><label htmlFor="ai-review-note" className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-800"><MessageSquareText className="h-4 w-4 text-violet-700" />{text.reviewerNote}</label><textarea id="ai-review-note" value={reviewNote} onChange={event => { setReviewNote(event.target.value); setReviewError(null); }} maxLength={1000} rows={3} placeholder={isPurchasing ? text.purchasingPlaceholder : text.reviewPlaceholder} className="w-full rounded-lg border border-slate-200 bg-white p-3 text-sm leading-6 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100" /><div className="mt-1 flex items-center justify-between text-xs text-slate-500"><span>{text.auditNote}</span><span>{reviewNote.length}/1000</span></div>{reviewError && <p className="mt-2 text-xs font-medium text-rose-700">{reviewError}</p>}</div>
      <div className="flex flex-wrap gap-2"><Button size="sm" variant="outline" disabled={reviewPending} onClick={() => onReview("under_review", reviewNote.trim() || undefined)}><UserCheck className="me-1 h-4 w-4" />{text.keepUnderReview}</Button><Button size="sm" disabled={reviewPending} onClick={() => { const validation = getReviewValidation("accepted", reviewNote, language); if (validation) { setReviewError(validation); return; } onReview("accepted", reviewNote.trim()); }}><CheckCircle2 className="me-1 h-4 w-4" />{text.acceptAdvisory}</Button><Button size="sm" variant="outline" disabled={reviewPending} onClick={() => { const validation = getReviewValidation("rejected", reviewNote, language); if (validation) { setReviewError(validation); return; } onReview("rejected", reviewNote.trim()); }}><XCircle className="me-1 h-4 w-4" />{text.reject}</Button></div>
      <p className="flex items-start gap-2 text-xs leading-5 text-slate-500"><FileText className="mt-0.5 h-4 w-4 shrink-0" />{text.recordOnly}</p>
    </CardContent>
  </Card>;
}

function InfoStep({ title, detail }: { title: string; detail: string }) {
  return <div className="rounded-lg border border-cyan-200 bg-white p-3"><strong className="block text-cyan-800">{title}</strong><span>{detail}</span></div>;
}
