import { Activity, ArrowLeftRight, BrainCircuit, ClipboardCheck, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type OperationalWorkflowGuideProps = {
  language: "ar" | "en";
  direction: "rtl" | "ltr";
  scopeLabel: string;
  primaryActionLabel?: string;
  onOpenPrimaryAction: () => void;
  onOpenAssistant: () => void;
};

export function OperationalWorkflowGuide({
  language,
  direction,
  scopeLabel,
  primaryActionLabel,
  onOpenPrimaryAction,
  onOpenAssistant,
}: OperationalWorkflowGuideProps) {
  const isRtl = direction === "rtl";
  const copy = language === "en"
    ? {
      eyebrow: "CONNECTED OPERATING LOGIC",
      title: "From signal to an auditable action",
      detail: "MEDORA connects approved operational signals to a clear next step. It does not execute clinical, financial, or sensitive actions automatically.",
      scope: "Current protected scope",
      steps: [
        { title: "Signal", detail: "A permitted metric, request, or notice is detected.", icon: Activity },
        { title: "Context", detail: "The relevant role, branch, and workflow frame the decision.", icon: BrainCircuit },
        { title: "Human review", detail: "Advice remains reviewable before any sensitive decision.", icon: ShieldCheck },
        { title: "Authorized action", detail: "The user opens an approved workspace; outcomes remain traceable.", icon: ClipboardCheck },
      ],
      review: "Open advisory review",
      continue: "Continue to",
      noAction: "Choose an approved next action",
    }
    : {
      eyebrow: "منطق تشغيلي مترابط",
      title: "من الإشارة إلى إجراء قابل للتدقيق",
      detail: "تربط MEDORA الإشارات التشغيلية المصرح بها بخطوة تالية واضحة، من دون تنفيذ تلقائي لإجراء سريري أو مالي أو حساس.",
      scope: "النطاق المحمي الحالي",
      steps: [
        { title: "إشارة", detail: "يتم رصد مقياس أو طلب أو تنبيه مسموح به.", icon: Activity },
        { title: "سياق", detail: "يحدد الدور والفرع وسير العمل إطار القرار.", icon: BrainCircuit },
        { title: "مراجعة بشرية", detail: "تبقى التوصية قابلة للمراجعة قبل أي قرار حساس.", icon: ShieldCheck },
        { title: "إجراء مصرح", detail: "يفتح المستخدم مساحة عمل مصرح بها وتبقى النتيجة قابلة للتتبع.", icon: ClipboardCheck },
      ],
      review: "فتح المراجعة الاستشارية",
      continue: "الانتقال إلى",
      noAction: "اختر خطوة تالية مصرح بها",
    };

  return (
    <Card className={cn("border-cyan-100 bg-gradient-to-br from-white to-cyan-50/50 shadow-sm shadow-cyan-950/5", isRtl ? "text-right" : "text-left")}>
      <CardHeader className="gap-3 pb-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold tracking-[0.16em] text-cyan-700">{copy.eyebrow}</p>
          <CardTitle className="mt-1 text-xl tracking-tight text-slate-900">{copy.title}</CardTitle>
          <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-600">{copy.detail}</p>
        </div>
        <div className="shrink-0 rounded-xl border border-cyan-100 bg-white/80 px-3 py-2 text-xs text-slate-600">
          <span className="block font-semibold text-cyan-900">{copy.scope}</span>
          <span className="mt-1 block max-w-48 truncate">{scopeLabel}</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <ol className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {copy.steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <li key={step.title} className="relative rounded-2xl border border-slate-200 bg-white/90 p-4">
                {index < copy.steps.length - 1 && <ArrowLeftRight aria-hidden="true" className={cn("absolute -bottom-5 hidden h-4 w-4 text-cyan-300 xl:block", isRtl ? "-left-2" : "-right-2")} />}
                <div className="mb-3 flex items-center gap-2">
                  <span className="grid h-8 w-8 place-items-center rounded-xl bg-cyan-50 text-cyan-700"><Icon className="h-4 w-4" /></span>
                  <span className="text-[11px] font-bold text-cyan-700">{index + 1}</span>
                </div>
                <p className="text-sm font-semibold text-slate-900">{step.title}</p>
                <p className="mt-1 text-xs leading-5 text-slate-500">{step.detail}</p>
              </li>
            );
          })}
        </ol>
        <div className={cn("flex flex-col gap-2 rounded-2xl border border-slate-200 bg-white/80 p-3 sm:flex-row sm:items-center sm:justify-between", isRtl ? "sm:text-right" : "sm:text-left")}>
          <p className="text-sm text-slate-600"><span className="font-semibold text-slate-900">{copy.continue}: </span>{primaryActionLabel ?? copy.noAction}</p>
          <div className="flex flex-wrap gap-2">
            <Button type="button" size="sm" variant="outline" onClick={onOpenAssistant} className="border-cyan-200 bg-white text-cyan-900 hover:bg-cyan-50">{copy.review}</Button>
            {primaryActionLabel && <Button type="button" size="sm" onClick={onOpenPrimaryAction} className="bg-[#0d1b2a] text-white hover:bg-slate-800">{copy.continue} {primaryActionLabel}</Button>}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
