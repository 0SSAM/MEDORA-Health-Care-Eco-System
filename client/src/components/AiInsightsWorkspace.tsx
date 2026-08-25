// MEDORA | ميدورا — Integrated Health Care System
// Copyright (c) 2026 Hossam Naeim Osman | حسام نعيم عثمان. All rights reserved.
// Proprietary and confidential. Unauthorized copying, distribution, or use of this
// software, or of any portion of it, is strictly prohibited.
// Source: https://github.com/0SSAM/MEDORA-Health-Care-Eco-System
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { ProcurementActionTrigger } from "./OperationsManagementWorkspace";

type Props = {
  organizationId: number | null;
  branchId: number | null;
  jurisdictionId: number | null;
};
type Insight = {
  id: number;
  organizationId: number;
  branchId: number | null;
  jurisdictionId: number | null;
  insightType: string;
  status: string;
  title: string;
  summary: string;
  evidenceJson: string;
  recommendationJson: string;
  confidence: string | number;
  requiresHumanReview: number;
};

const labels: Record<string, string> = {
  purchasing_analysis: "تحليل المشتريات",
  decision_support: "دعم اتخاذ القرار",
  improvement_proposal: "اقتراح تطوير",
};
const statusLabels: Record<string, string> = {
  generated: "مولّد للمراجعة",
  under_review: "قيد المراجعة",
  accepted: "مقبول بشريًا",
  rejected: "مرفوض",
  dismissed: "مستبعد",
};

function parseJson<T>(value: string, fallback: T): T {
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export function getReviewValidation(
  status: "under_review" | "accepted" | "rejected" | "dismissed",
  note: string
): string | null {
  if ((status === "accepted" || status === "rejected" || status === "dismissed") && !note.trim()) {
    return status === "accepted"
      ? "أضف ملاحظة قصيرة قبل اعتماد التوصية لتوثيق سبب القرار."
      : "أضف سبب القرار حتى يبقى القرار قابلًا للمراجعة والتعلم.";
  }
  return null;
}

export function AiInsightsWorkspace({
  organizationId,
  branchId,
  jurisdictionId,
}: Props) {
  const enabled = Boolean(organizationId && branchId);
  const input = enabled
    ? {
        organizationId: organizationId!,
        branchId: branchId!,
        jurisdictionId: jurisdictionId ?? undefined,
      }
    : skipToken;
  const insights = trpc.aiInsights.list.useQuery(input, { retry: false });
  const purchasing = trpc.aiInsights.generatePurchasingAnalysis.useMutation({
    onSuccess: () => void insights.refetch(),
  });
  const decision = trpc.aiInsights.generateDecisionSupport.useMutation({
    onSuccess: () => void insights.refetch(),
  });
  const improvement = trpc.aiInsights.generateImprovementProposal.useMutation({
    onSuccess: () => void insights.refetch(),
  });
  const review = trpc.aiInsights.review.useMutation({
    onSuccess: () => void insights.refetch(),
  });
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const selected = useMemo(
    () =>
      (insights.data as Insight[] | undefined)?.find(
        item => item.id === selectedId
      ) ?? null,
    [insights.data, selectedId]
  );

  if (!organizationId || !branchId)
    return (
      <Card>
        <CardContent className="p-6 text-sm text-slate-600">
          اختر المؤسسة والفرع أولًا لتشغيل التحليلات المحكومة.
        </CardContent>
      </Card>
    );
  const busy =
    purchasing.isPending || decision.isPending || improvement.isPending;
  const generate = (kind: "purchasing" | "decision" | "improvement") => {
    const payload = {
      organizationId,
      branchId,
      jurisdictionId: jurisdictionId ?? undefined,
    };
    if (kind === "purchasing")
      purchasing.mutate({ ...payload, historyDays: 56 });
    if (kind === "decision") decision.mutate(payload);
    if (kind === "improvement") improvement.mutate(payload);
  };
  const error =
    purchasing.error ?? decision.error ?? improvement.error ?? review.error;
  const reviewInsight = (nextStatus: "under_review" | "accepted" | "rejected" | "dismissed", reviewNote?: string) => {
    if (!selected) return;
    review.mutate({ insightId: selected.id, nextStatus, reviewNote });
  };

  return (
    <div className="space-y-5" dir="rtl">
      <Card className="border-violet-200 bg-gradient-to-br from-violet-50 via-white to-cyan-50">
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <CardTitle className="flex items-center gap-2 text-slate-900">
                <Sparkles className="h-5 w-5 text-violet-700" /> مركز الذكاء
                الاصطناعي التشغيلي
              </CardTitle>
              <CardDescription className="mt-2 max-w-3xl leading-6">
                تحليلات مبنية على المبيعات والمخزون والطلبات ومؤشرات التشغيل
                المجمعة داخل نطاق الفرع. النتائج استشارية فقط، ولا تنشئ أمر شراء
                أو قرارًا طبيًا أو ماليًا أو وظيفيًا.
              </CardDescription>
            </div>
            <Badge className="bg-amber-600">مراجعة بشرية إلزامية</Badge>
          </div>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-3">
          <Button
            disabled={busy}
            onClick={() => generate("purchasing")}
            className="h-auto justify-start gap-3 whitespace-normal bg-cyan-700 p-4 text-right hover:bg-cyan-800"
          >
            <PackageSearch className="h-5 w-5 shrink-0" />
            <span>
              <strong className="block">تحليل المشتريات</strong>
              <small className="font-normal opacity-90">
                الطلب، المخزون، نقاط إعادة الطلب، ومؤشرات الشذوذ
              </small>
            </span>
          </Button>
          <Button
            disabled={busy}
            onClick={() => generate("decision")}
            className="h-auto justify-start gap-3 whitespace-normal bg-violet-700 p-4 text-right hover:bg-violet-800"
          >
            <BarChart3 className="h-5 w-5 shrink-0" />
            <span>
              <strong className="block">دعم اتخاذ القرار</strong>
              <small className="font-normal opacity-90">
                موجز مؤشرات التشغيل والاستثناءات
              </small>
            </span>
          </Button>
          <Button
            disabled={busy}
            onClick={() => generate("improvement")}
            className="h-auto justify-start gap-3 whitespace-normal bg-emerald-700 p-4 text-right hover:bg-emerald-800"
          >
            <Lightbulb className="h-5 w-5 shrink-0" />
            <span>
              <strong className="block">اقتراحات التطوير</strong>
              <small className="font-normal opacity-90">
                فرص تحسين مستندة إلى بيانات النظام
              </small>
            </span>
          </Button>
        </CardContent>
      </Card>
      <Card className="border-amber-200 bg-amber-50/50">
        <CardContent className="flex gap-3 p-4 text-sm leading-6 text-amber-950">
          <ShieldAlert className="mt-1 h-5 w-5 shrink-0 text-amber-700" />
          <p>
            كل نتيجة تحتوي على مصدر الدليل والقيود ودرجة ثقة تقريبية. لا يجوز
            قبولها أو تحويلها إلى إجراء إلا بعد مراجعة مستخدم مخوّل، وتظل
            الموصلات الحكومية والتأمينية الخارجية مقفلة.
          </p>
        </CardContent>
      </Card>
      {busy && (
        <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-600">
          <Loader2 className="h-4 w-4 animate-spin" /> جارٍ تجهيز التحليل
          والتحقق من النتيجة المنظمة…
        </div>
      )}
      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          تعذر إنشاء التحليل: {error.message}
        </div>
      )}
      <Card>
        <CardHeader>
          <CardTitle>سجل التحليلات والمقترحات</CardTitle>
          <CardDescription>
            اعرض النتيجة ثم حدّد حالتها بعد المراجعة. القبول هنا توثيقي ولا ينفذ
            الإجراء.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {!insights.data?.length && (
            <p className="rounded-xl bg-slate-50 p-5 text-sm text-slate-500">
              لا توجد نتائج لهذا النطاق بعد. ابدأ بأحد التحليلات أعلاه.
            </p>
          )}
          {(insights.data as Insight[] | undefined)?.map(item => (
            <button
              key={item.id}
              onClick={() => setSelectedId(item.id)}
              className={`w-full rounded-xl border p-4 text-right transition hover:border-violet-300 hover:shadow-sm ${selectedId === item.id ? "border-violet-400 bg-violet-50" : "border-slate-200 bg-white"}`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-semibold text-slate-900">
                  {item.title}
                </span>
                <span className="flex items-center gap-2">
                  <Badge variant="outline">
                    {labels[item.insightType] ?? item.insightType}
                  </Badge>
                  <Badge
                    variant={
                      item.status === "accepted" ? "default" : "secondary"
                    }
                  >
                    {statusLabels[item.status] ?? item.status}
                  </Badge>
                </span>
              </div>
              <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">
                {item.summary}
              </p>
              <p className="mt-2 text-xs text-slate-500">
                الثقة: {(Number(item.confidence) * 100).toFixed(0)}% · مراجعة
                بشرية: {item.requiresHumanReview ? "مطلوبة" : "غير مطلوبة"}
              </p>
            </button>
          ))}
        </CardContent>
      </Card>
      {selected && (
        <InsightDetail
          item={selected}
          onReview={reviewInsight}
          reviewPending={review.isPending}
        />
      )}
    </div>
  );
}

function InsightDetail({
  item,
  onReview,
  reviewPending,
}: {
  item: Insight;
  onReview: (
    status: "under_review" | "accepted" | "rejected" | "dismissed",
    reviewNote?: string
  ) => void;
  reviewPending: boolean;
}) {
  const [reviewNote, setReviewNote] = useState("");
  const [reviewError, setReviewError] = useState<string | null>(null);
  const isPurchasing = item.insightType === "purchasing_analysis";
  const evidence = parseJson<{
    evidence?: Array<{ metric: string; value: string; source: string }>;
    limitations?: string[];
  }>(item.evidenceJson, {});
  const recommendations = parseJson<
    Array<{ action: string; rationale: string; priority: string }>
  >(item.recommendationJson, []);
  return (
    <Card className="border-violet-200">
      <CardHeader className="border-b border-violet-100 bg-violet-50/50">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2">
              {isPurchasing ? <ClipboardCheck className="h-5 w-5 text-cyan-700" /> : <UserCheck className="h-5 w-5 text-violet-700" />}
              {isPurchasing ? "مراجعة توصية المشتريات" : "تفاصيل النتيجة والمراجعة البشرية"}
            </CardTitle>
            <CardDescription className="mt-2">{item.summary}</CardDescription>
          </div>
          <Badge variant={item.status === "accepted" ? "default" : "secondary"}>
            {statusLabels[item.status] ?? item.status}
          </Badge>
        </div>
        {isPurchasing && (
          <div className="mt-4 grid gap-2 text-xs text-slate-700 sm:grid-cols-3">
            <div className="rounded-lg border border-cyan-200 bg-white p-3"><strong className="block text-cyan-800">1. افهم الدليل</strong><span>راجع الطلب والمخزون ونقطة إعادة الطلب.</span></div>
            <div className="rounded-lg border border-cyan-200 bg-white p-3"><strong className="block text-cyan-800">2. وثّق الحكم</strong><span>اكتب سبب القبول أو الرفض عند الحاجة.</span></div>
            <div className="rounded-lg border border-cyan-200 bg-white p-3"><strong className="block text-cyan-800">3. اختر الحالة</strong><span>التغيير توثيقي ولا ينشئ أمر شراء.</span></div>
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="mb-2 text-sm font-semibold">الدليل المستخدم</h3>
          <div className="grid gap-2 md:grid-cols-3">
            {(evidence.evidence ?? []).map((entry, index) => (
              <div
                key={`${entry.metric}-${index}`}
                className="rounded-lg bg-slate-50 p-3 text-sm"
              >
                <strong className="block">{entry.metric}</strong>
                <span className="block text-slate-700">{entry.value}</span>
                <small className="text-slate-500">المصدر: {entry.source}</small>
              </div>
            ))}
          </div>
        </div>
        <div>
          <h3 className="mb-2 text-sm font-semibold">التوصيات الاستشارية</h3>
          <ul className="space-y-2">
            {recommendations.map((entry, index) => (
              <li
                key={`${entry.action}-${index}`}
                className="rounded-lg border border-slate-200 p-3 text-sm"
              >
                <span className="font-medium">{entry.action}</span>
                <span className="mx-2 text-slate-400">—</span>
                {entry.rationale}
                <Badge variant="outline" className="mr-2">
                  {entry.priority}
                </Badge>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-900">
          <AlertTriangle className="ml-1 inline h-4 w-4" /> القيود: {""}
          {(evidence.limitations ?? []).join("، ") ||
            "لا توجد قيود إضافية مسجلة."}
        </div>
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <label htmlFor="ai-review-note" className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-800">
            <MessageSquareText className="h-4 w-4 text-violet-700" /> ملاحظة المراجع
          </label>
          <textarea
            id="ai-review-note"
            value={reviewNote}
            onChange={event => { setReviewNote(event.target.value); setReviewError(null); }}
            maxLength={1000}
            rows={3}
            placeholder={isPurchasing ? "اذكر سبب اعتماد التوصية أو ما يحتاج إلى تحقق إضافي…" : "أضف سياقًا تشغيليًا يفسر قرار المراجعة…"}
            className="w-full rounded-lg border border-slate-200 bg-white p-3 text-sm leading-6 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
          />
          <div className="mt-1 flex items-center justify-between text-xs text-slate-500">
            <span>تُحفظ الملاحظة مع سجل التدقيق ولا تُرسل إلى جهة خارجية.</span>
            <span>{reviewNote.length}/1000</span>
          </div>
          {reviewError && <p className="mt-2 text-xs font-medium text-rose-700">{reviewError}</p>}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant="outline"
            disabled={reviewPending}
            onClick={() => onReview("under_review", reviewNote.trim() || undefined)}
          >
            <UserCheck className="ml-1 h-4 w-4" />
            إبقاءها قيد المراجعة
          </Button>
          <Button
            size="sm"
            disabled={reviewPending}
            onClick={() => {
              const validation = getReviewValidation("accepted", reviewNote);
              if (validation) { setReviewError(validation); return; }
              onReview("accepted", reviewNote.trim());
            }}
          >
            <CheckCircle2 className="ml-1 h-4 w-4" />
            اعتماد استشاري
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={reviewPending}
            onClick={() => {
              const validation = getReviewValidation("rejected", reviewNote);
              if (validation) { setReviewError(validation); return; }
              onReview("rejected", reviewNote.trim());
            }}
          >
            <XCircle className="ml-1 h-4 w-4" />
            رفض التوصية
          </Button>
        </div>
        <p className="flex items-start gap-2 text-xs leading-5 text-slate-500"><FileText className="mt-0.5 h-4 w-4 shrink-0" /> هذه الحالة لا تنفذ شراءً ولا تعدل المخزون أو الأسعار. أي إجراء لاحق يجب أن يتم عبر سير العمل التشغيلي المعتاد وبصلاحية منفصلة.</p>
        
        {item.status === "accepted" && isPurchasing && (
          <div className="mt-4 rounded-xl border border-cyan-200 bg-cyan-50/50 p-4">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <PackageSearch className="h-4 w-4 text-cyan-700" />
                <span className="text-sm font-semibold text-cyan-900">إجراء تشغيلي مقترح</span>
              </div>
              <Badge className="bg-cyan-700">تحويل سريع</Badge>
            </div>
            <p className="mb-4 text-xs leading-5 text-cyan-800">
              بما أن التوصية مقبولة، يمكنك الآن تحويلها مباشرة إلى مسودة طلب شراء داخلي لمراجعتها في وحدة المشتريات.
            </p>
            <ProcurementActionTrigger
              organizationId={item.organizationId}
              branchId={item.branchId}
              jurisdictionId={item.jurisdictionId}
              initialTitle={item.title}
              initialJustification={item.summary}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
