import { AlertCircle, AlertTriangle, CheckCircle2, ClipboardCheck, Loader2, PackageSearch, PauseCircle, PlayCircle, ShoppingCart, TimerReset, UsersRound } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { skipToken } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useLocalization } from "@/contexts/LocalizationContext";
import { hasOrganizationBranchJurisdictionScope } from "@/lib/scope";
import { trpc } from "@/lib/trpc";

type DecisionEntityType = "inventory_batch" | "branch_alert" | "purchase_order" | "customer_care_case" | "customer_care_task" | "procurement_request" | "inter_branch_transfer";
type Decision = "approved" | "rejected" | "deferred";

type Props = {
  organizationId: number | null;
  branchId: number | null;
  jurisdictionId: number | null;
  canManage: boolean;
  onOpenModule: (module: "supplyChain" | "customerCare" | "operations") => void;
};

export function ManagerOperationalIntelligence({ organizationId, branchId, jurisdictionId, canManage, onOpenModule }: Props) {
  const { language, direction } = useLocalization();
  const isEnglish = language === "en";
  const scopeReady = hasOrganizationBranchJurisdictionScope(organizationId, branchId, jurisdictionId);
  const input = scopeReady && canManage ? { organizationId: organizationId!, branchId: branchId!, jurisdictionId: jurisdictionId! } : skipToken;
  const inventory = trpc.operations.manager.inventorySignals.useQuery(input, { retry: false, refetchInterval: 60_000 });
  const sla = trpc.operations.manager.slaIndicators.useQuery(input, { retry: false, refetchInterval: 60_000 });
  const slaPolicy = trpc.operations.manager.slaPolicy.useQuery(input, { retry: false });
  const history = trpc.operations.manager.decisionHistory.useQuery(input === skipToken ? skipToken : { ...input, limit: 6 }, { retry: false });
  const automation = trpc.operations.manager.inventoryAutomation.useQuery(input, { retry: false });
  const utils = trpc.useUtils();
  const [formOpen, setFormOpen] = useState(false);
  const [entityType, setEntityType] = useState<DecisionEntityType>("inventory_batch");
  const [entityId, setEntityId] = useState("");
  const [decision, setDecision] = useState<Decision>("deferred");
  const [reason, setReason] = useState("");
  const [status, setStatus] = useState("");
  const [cronExpression, setCronExpression] = useState<"0 0 */6 * * *" | "0 0 6 * * *" | "0 0 0 * * *">("0 0 6 * * *");
  const [slaDraft, setSlaDraft] = useState({ procurementTargetHours: "48", customerCareTargetHours: "24", escalationGraceHours: "24", escalationEnabled: true });
  const [automationDraft, setAutomationDraft] = useState({ automationFailureNotificationThreshold: "3" });
  useEffect(() => {
    if (!slaPolicy.data) return;
    setSlaDraft({
      procurementTargetHours: String(slaPolicy.data.procurementTargetHours),
      customerCareTargetHours: String(slaPolicy.data.customerCareTargetHours),
      escalationGraceHours: String(slaPolicy.data.escalationGraceHours),
      escalationEnabled: slaPolicy.data.escalationEnabled,
    });
  }, [slaPolicy.data]);
  useEffect(() => {
    if (!automation.data) return;
    setAutomationDraft({ automationFailureNotificationThreshold: String(automation.data.automationFailureNotificationThreshold ?? 3) });
  }, [automation.data]);
  const copy = useMemo(() => isEnglish ? {
    title: "Operational intelligence", detail: "Signals identify work needing human attention. They do not approve or execute a source operation.", noAccess: "This operational view is available only to authorized managers in a complete organization, branch, and jurisdiction scope.", loading: "Loading protected operational signals…", loadError: "Operational signals could not be loaded. MEDORA does not show substitute or cross-scope data.", stock: "Inventory signals", lowStock: "Low stock", queued: "Queued branch alerts", noSignals: "No inventory signals require attention in this scope.", openSupply: "Open procurement", sla: "Service-level indicators", procurement: "Procurement", customerCare: "Customer care", overdue: "Overdue", breached: "Breached", onTrack: "On track", compliant: "Compliant", hour: "h target", openCare: "Open customer care", decisionTitle: "Human-review decision ledger", decisionDetail: "A recorded decision is immutable and audited. It records review only; it never changes the source record state.", recent: "Recent decisions", noDecisions: "No human-review decisions have been recorded in this scope.", record: "Record decision", close: "Close", entityType: "Source type", entityId: "Source record ID", decision: "Review outcome", reason: "Reason for the review decision", reasonHint: "At least 3 characters; explain the human rationale.", approved: "Approved", rejected: "Rejected", deferred: "Deferred", save: "Record reviewed decision", saving: "Recording…", missing: "Enter a positive source record ID and a reason of at least 3 characters.", saved: "The review decision was recorded. No source operation was executed.", failed: "The review decision could not be recorded.", signal: "Signal", alert: "Queued alert", batch: "Batch", product: "Product", quantity: "On hand", reorder: "Reorder point", expiry: "Expiry", noExpiry: "No expiry date", review: "Review", openOperations: "Open operations", slaSettings: "Organization SLA policy", slaSettingsDetail: "Set approved service targets for this organization. Escalation stays inside MEDORA and never sends an external notification or changes a source record.", procurementTarget: "Procurement target", careTarget: "Customer-care target", grace: "Quiet escalation grace", escalationEnabled: "Show quiet escalation indicators", attention: "Needs attention", persistent: "Persistent", savePolicy: "Save SLA policy", savingPolicy: "Saving policy…", policySaved: "The organization SLA policy was updated.", policyFailed: "The organization SLA policy could not be updated.", policyInvalid: "Enter service targets and a grace period between 1 and 720 hours.",
  } : {
    title: "ذكاء العمليات", detail: "تحدد الإشارات عملاً يحتاج انتباهاً بشرياً؛ ولا تعتمد أو تنفذ العملية المصدر.", noAccess: "تظهر هذه الرؤية فقط للمدير المصرح له داخل نطاق مكتمل للمؤسسة والفرع والاختصاص.", loading: "جارٍ تحميل الإشارات التشغيلية المقيدة…", loadError: "تعذر تحميل الإشارات التشغيلية. لا يعرض MEDORA بيانات بديلة أو من نطاق آخر.", stock: "إشارات المخزون", lowStock: "نقص مخزون", queued: "تنبيهات فرع منتظرة", noSignals: "لا توجد إشارات مخزون تحتاج انتباهاً ضمن النطاق الحالي.", openSupply: "فتح المشتريات", sla: "مؤشرات مستوى الخدمة", procurement: "المشتريات", customerCare: "خدمة العملاء", overdue: "متأخر", breached: "متجاوز", onTrack: "ضمن المسار", compliant: "ملتزم", hour: "ساعة مستهدفة", openCare: "فتح خدمة العملاء", decisionTitle: "سجل قرارات المراجعة البشرية", decisionDetail: "القرار المسجل غير قابل للتعديل ومدقق. يوثق المراجعة فقط ولا يغير حالة السجل المصدر.", recent: "أحدث القرارات", noDecisions: "لم تسجل قرارات مراجعة بشرية ضمن النطاق الحالي.", record: "تسجيل قرار", close: "إغلاق", entityType: "نوع السجل المصدر", entityId: "معرّف السجل المصدر", decision: "نتيجة المراجعة", reason: "سبب قرار المراجعة", reasonHint: "ثلاثة أحرف على الأقل؛ اشرح المبرر البشري.", approved: "اعتماد", rejected: "رفض", deferred: "تأجيل", save: "تسجيل القرار المراجع", saving: "جارٍ التسجيل…", missing: "أدخل معرّف سجل مصدر موجباً وسبباً من ثلاثة أحرف على الأقل.", saved: "سُجل قرار المراجعة؛ لم تنفذ أي عملية على السجل المصدر.", failed: "تعذر تسجيل قرار المراجعة.", signal: "إشارة", alert: "تنبيه منتظر", batch: "دفعة", product: "صنف", quantity: "المتاح", reorder: "نقطة الطلب", expiry: "الصلاحية", noExpiry: "بدون تاريخ صلاحية", review: "مراجعة", openOperations: "فتح العمليات", slaSettings: "سياسة SLA للمؤسسة", slaSettingsDetail: "حدد الأهداف المعتمدة لمستوى الخدمة في هذه المؤسسة. يبقى التصعيد داخل MEDORA ولا يرسل إشعاراً خارجياً ولا يغير سجلاً مصدرياً.", procurementTarget: "هدف المشتريات", careTarget: "هدف خدمة العملاء", grace: "مهلة التصعيد الهادئ", escalationEnabled: "إظهار مؤشرات التصعيد الهادئ", attention: "يحتاج انتباهاً", persistent: "مستمر", savePolicy: "حفظ سياسة SLA", savingPolicy: "جارٍ حفظ السياسة…", policySaved: "تم تحديث سياسة SLA للمؤسسة.", policyFailed: "تعذر تحديث سياسة SLA للمؤسسة.", policyInvalid: "أدخل أهداف الخدمة والمهلة بين ساعة و720 ساعة.",
  }, [isEnglish]);
  const automationCopy = useMemo(() => isEnglish ? {
    title: "Inventory automation", detail: "A managed, tenant-scoped scan queues existing inventory alerts. It never creates orders, moves stock, sends clinical data, or approves a decision.", cadence: "Scan cadence", sixHours: "Every 6 hours", daily: "Daily at 06:00", nightly: "Daily at midnight", enable: "Enable scoped scan", pause: "Pause scoped scan", enabled: "Active", paused: "Paused", notConfigured: "Not configured", evaluated: "Batches evaluated", queued: "Alerts queued", lastRun: "Last safe run", never: "Not yet run", eventLog: "Internal event log", eventLogRecorded: "Recorded inside MEDORA", eventLogDetail: "Every safe run appends a minimized, scoped HMAC-SHA256 signed record inside MEDORA. No event data leaves the system, and the log cannot execute work.", failureThreshold: "Manager notice after consecutive failures", consecutiveFailures: "Consecutive failures", lastEvent: "Last signed entry", entryNever: "No entry yet", entryRecorded: "Recorded", saveSettings: "Save automation settings", settingsInvalid: "Enter a failure threshold between 2 and 10.", saved: "Inventory automation was updated for the active scope.", failed: "Inventory automation could not be updated.", working: "Updating…",
  } : {
    title: "أتمتة المخزون", detail: "فحص مُدار ومقيد بالنطاق يضع تنبيهات المخزون القائمة في الطابور. لا ينشئ أوامر ولا ينقل مخزوناً ولا يرسل بيانات سريرية ولا يعتمد قراراً.", cadence: "وتيرة الفحص", sixHours: "كل 6 ساعات", daily: "يومياً الساعة 06:00", nightly: "يومياً عند منتصف الليل", enable: "تفعيل الفحص المقيد", pause: "إيقاف الفحص المقيد", enabled: "مفعل", paused: "موقوف", notConfigured: "غير مُعد", evaluated: "دفعات فُحصت", queued: "تنبيهات وُضعت بالطابور", lastRun: "آخر تشغيل آمن", never: "لم ينفذ بعد", eventLog: "سجل الأحداث الداخلي", eventLogRecorded: "مسجل داخل MEDORA", eventLogDetail: "كل تشغيل آمن يضيف سجلاً مصغراً ومقيداً بالنطاق وموقعاً بـ HMAC-SHA256 داخل MEDORA. لا تخرج بيانات حدث من النظام، ولا يستطيع السجل تنفيذ عمل.", failureThreshold: "إشعار المدير بعد إخفاقات متتالية", consecutiveFailures: "إخفاقات متتالية", lastEvent: "آخر سجل موقع", entryNever: "لا يوجد سجل بعد", entryRecorded: "مسجل", saveSettings: "حفظ إعدادات الأتمتة", settingsInvalid: "أدخل حداً للإخفاق بين 2 و10.", saved: "تم تحديث أتمتة المخزون للنطاق النشط.", failed: "تعذر تحديث أتمتة المخزون.", working: "جارٍ التحديث…",
  }, [isEnglish]);
  const recordDecision = trpc.operations.manager.recordDecision.useMutation({
    onSuccess: async () => {
      setStatus(copy.saved);
      setReason("");
      setEntityId("");
      setFormOpen(false);
      await Promise.all([
        utils.operations.manager.decisionHistory.invalidate(),
        utils.operations.manager.inventorySignals.invalidate(),
        utils.operations.manager.slaIndicators.invalidate(),
      ]);
    },
    onError: error => setStatus(error.message || copy.failed),
  });
  const configureAutomation = trpc.operations.manager.configureInventoryAutomation.useMutation({
    onSuccess: async () => {
      setStatus(automationCopy.saved);
      await utils.operations.manager.inventoryAutomation.invalidate();
    },
    onError: error => setStatus(error.message || automationCopy.failed),
  });
  const updateSlaPolicy = trpc.operations.manager.updateSlaPolicy.useMutation({
    onSuccess: async () => {
      setStatus(copy.policySaved);
      await Promise.all([utils.operations.manager.slaPolicy.invalidate(), utils.operations.manager.slaIndicators.invalidate()]);
    },
    onError: error => setStatus(error.message || copy.policyFailed),
  });
  const submit = async () => {
    const id = Number(entityId);
    if (!scopeReady || !canManage || !Number.isInteger(id) || id <= 0 || reason.trim().length < 3) { setStatus(copy.missing); return; }
    setStatus("");
    await recordDecision.mutateAsync({ organizationId: organizationId!, branchId: branchId!, jurisdictionId: jurisdictionId!, entityType, entityId: id, decision, reason: reason.trim() });
  };
  const updateAutomation = async (active: boolean) => {
    const automationFailureNotificationThreshold = Number(automationDraft.automationFailureNotificationThreshold);
    if (!scopeReady || !canManage || !Number.isInteger(automationFailureNotificationThreshold) || automationFailureNotificationThreshold < 2 || automationFailureNotificationThreshold > 10) { setStatus(automationCopy.settingsInvalid); return; }
    setStatus("");
    await configureAutomation.mutateAsync({ organizationId: organizationId!, branchId: branchId!, jurisdictionId: jurisdictionId!, active, cronExpression, automationFailureNotificationThreshold });
  };
  const saveSlaPolicy = async () => {
    const procurementTargetHours = Number(slaDraft.procurementTargetHours);
    const customerCareTargetHours = Number(slaDraft.customerCareTargetHours);
    const escalationGraceHours = Number(slaDraft.escalationGraceHours);
    if (!scopeReady || !canManage || ![procurementTargetHours, customerCareTargetHours, escalationGraceHours].every(value => Number.isInteger(value) && value >= 1 && value <= 720)) { setStatus(copy.policyInvalid); return; }
    setStatus("");
    await updateSlaPolicy.mutateAsync({ organizationId: organizationId!, branchId: branchId!, jurisdictionId: jurisdictionId!, procurementTargetHours, customerCareTargetHours, escalationGraceHours, escalationEnabled: slaDraft.escalationEnabled });
  };
  const entityLabels: Record<DecisionEntityType, string> = {
    inventory_batch: isEnglish ? "Inventory batch" : "دفعة مخزون", branch_alert: isEnglish ? "Branch alert" : "تنبيه فرع", purchase_order: isEnglish ? "Purchase order" : "أمر شراء", customer_care_case: isEnglish ? "Customer-care case" : "قضية خدمة عملاء", customer_care_task: isEnglish ? "Customer-care task" : "مهمة خدمة عملاء", procurement_request: isEnglish ? "Procurement request" : "طلب مشتريات", inter_branch_transfer: isEnglish ? "Inter-branch transfer" : "تحويل بين الفروع",
  };
  const decisionLabel = (value: Decision) => value === "approved" ? copy.approved : value === "rejected" ? copy.rejected : copy.deferred;

  if (!canManage || !scopeReady) return <Card className={direction === "rtl" ? "text-right" : "text-left"}><CardContent className="flex items-start gap-3 p-4 text-sm leading-6 text-slate-600"><AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />{copy.noAccess}</CardContent></Card>;

  const loading = inventory.isLoading || sla.isLoading || slaPolicy.isLoading || history.isLoading || automation.isLoading;
  const hasError = inventory.isError || sla.isError || slaPolicy.isError || history.isError || automation.isError;
  return <Card className={direction === "rtl" ? "text-right" : "text-left"}>
    <CardHeader className="flex-row items-start justify-between gap-3 space-y-0 border-b border-slate-100">
      <div className="min-w-0"><p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-violet-700">{copy.title}</p><CardTitle className="mt-1 flex items-center gap-2 text-lg"><ClipboardCheck className="h-5 w-5 text-violet-700" />{copy.stock} & SLA</CardTitle><p className="mt-1 text-sm leading-6 text-slate-500">{copy.detail}</p></div>
      <Badge variant="outline" className="shrink-0 border-violet-200 bg-violet-50 text-violet-800">{copy.review}</Badge>
    </CardHeader>
    <CardContent className="space-y-4 p-4 sm:p-6">
      {loading ? <p className="flex items-center gap-2 text-sm text-slate-600"><Loader2 className="h-4 w-4 animate-spin" />{copy.loading}</p> : hasError ? <p role="alert" className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm leading-6 text-rose-800"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />{copy.loadError}</p> : <>
        <div className="grid gap-3 lg:grid-cols-2">
          <section className="rounded-2xl border border-amber-200 bg-amber-50/60 p-4"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="flex items-center gap-2 text-sm font-bold text-amber-950"><PackageSearch className="h-4 w-4" />{copy.stock}</p><p className="mt-1 text-xs leading-5 text-amber-900">{copy.lowStock}: {inventory.data?.lowStockCount ?? 0} · {copy.queued}: {inventory.data?.queuedAlertCount ?? 0}</p></div><Button type="button" size="sm" variant="outline" className="border-amber-300 bg-white text-amber-900 hover:bg-amber-100" onClick={() => onOpenModule("supplyChain")}>{copy.openSupply}</Button></div>
            {inventory.data?.signals.length ? <div className="mt-3 space-y-2">{inventory.data.signals.slice(0, 3).map(signal => <div key={`${signal.type}-${signal.alertId ?? signal.batchId}`} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-amber-100 bg-white px-3 py-2 text-xs"><span className="font-semibold text-slate-800">{signal.type === "low_stock" ? copy.signal : copy.alert} · {copy.product} #{signal.productId}</span><span className="text-slate-500">{copy.quantity} {signal.quantityOnHand} / {copy.reorder} {signal.reorderPoint}</span><Button type="button" size="sm" variant="ghost" className="h-7 text-violet-700 hover:bg-violet-50 hover:text-violet-800" onClick={() => { setEntityType(signal.alertId ? "branch_alert" : "inventory_batch"); setEntityId(String(signal.alertId ?? signal.batchId)); setFormOpen(true); }}>{copy.review}</Button></div>)}</div> : <p className="mt-3 rounded-xl border border-dashed border-amber-300/80 bg-white/70 p-3 text-sm text-amber-900">{copy.noSignals}</p>}</section>
          <section className="rounded-2xl border border-cyan-200 bg-cyan-50/60 p-4"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="flex items-center gap-2 text-sm font-bold text-cyan-950"><AlertTriangle className="h-4 w-4" />{copy.sla}</p><p className="mt-1 text-xs leading-5 text-cyan-900">{copy.procurement}: {sla.data?.procurement.targetHours ?? 48}{copy.hour} · {copy.customerCare}: {sla.data?.customerService.targetHours ?? 24}{copy.hour}</p></div><Button type="button" size="sm" variant="outline" className="border-cyan-300 bg-white text-cyan-900 hover:bg-cyan-100" onClick={() => onOpenModule("customerCare")}>{copy.openCare}</Button></div><div className="mt-3 grid gap-2 sm:grid-cols-2"><div className="rounded-xl border border-cyan-100 bg-white p-3"><p className="text-xs font-semibold text-slate-700">{copy.procurement}</p><div className="mt-2 flex flex-wrap gap-2"><Badge variant="outline" className={(sla.data?.procurement.overdue ?? 0) > 0 ? "border-rose-200 bg-rose-50 text-rose-700" : "border-emerald-200 bg-emerald-50 text-emerald-700"}>{copy.overdue}: {sla.data?.procurement.overdue ?? 0}</Badge><Badge variant="outline">{copy.onTrack}: {sla.data?.procurement.onTrack ?? 0}</Badge></div></div><div className="rounded-xl border border-cyan-100 bg-white p-3"><p className="text-xs font-semibold text-slate-700">{copy.customerCare}</p><div className="mt-2 flex flex-wrap gap-2"><Badge variant="outline" className={(sla.data?.customerService.breached ?? 0) > 0 ? "border-rose-200 bg-rose-50 text-rose-700" : "border-emerald-200 bg-emerald-50 text-emerald-700"}>{copy.breached}: {sla.data?.customerService.breached ?? 0}</Badge><Badge variant="outline">{copy.compliant}: {sla.data?.customerService.compliant ?? 0}</Badge></div></div></div></section>
        </div>
        <details className="group rounded-2xl border border-sky-200 bg-sky-50/50">
          <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 px-4 text-sm font-semibold text-sky-950 marker:content-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-sky-500">
            <span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4" />{copy.slaSettings}</span>
            <Badge variant="outline" className={sla.data?.policy.escalationEnabled ? "border-amber-300 bg-amber-50 text-amber-800" : "border-slate-300 bg-white text-slate-700"}>{sla.data?.policy.escalationEnabled ? `${copy.grace}: ${sla.data.policy.escalationGraceHours}${copy.hour}` : copy.escalationEnabled}</Badge>
          </summary>
          <div className="space-y-4 border-t border-sky-200 p-4">
            <p className="text-xs leading-5 text-sky-950">{copy.slaSettingsDetail}</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-sky-100 bg-white p-3"><p className="text-xs font-semibold text-slate-700">{copy.procurement}</p><div className="mt-2 flex flex-wrap gap-2"><Badge variant="outline" className={(sla.data?.procurement.escalation.attention ?? 0) > 0 ? "border-amber-200 bg-amber-50 text-amber-800" : "border-slate-200 bg-slate-50 text-slate-600"}>{copy.attention}: {sla.data?.procurement.escalation.attention ?? 0}</Badge><Badge variant="outline" className={(sla.data?.procurement.escalation.persistent ?? 0) > 0 ? "border-rose-200 bg-rose-50 text-rose-700" : "border-slate-200 bg-slate-50 text-slate-600"}>{copy.persistent}: {sla.data?.procurement.escalation.persistent ?? 0}</Badge></div></div>
              <div className="rounded-xl border border-sky-100 bg-white p-3"><p className="text-xs font-semibold text-slate-700">{copy.customerCare}</p><div className="mt-2 flex flex-wrap gap-2"><Badge variant="outline" className={(sla.data?.customerService.escalation.attention ?? 0) > 0 ? "border-amber-200 bg-amber-50 text-amber-800" : "border-slate-200 bg-slate-50 text-slate-600"}>{copy.attention}: {sla.data?.customerService.escalation.attention ?? 0}</Badge><Badge variant="outline" className={(sla.data?.customerService.escalation.persistent ?? 0) > 0 ? "border-rose-200 bg-rose-50 text-rose-700" : "border-slate-200 bg-slate-50 text-slate-600"}>{copy.persistent}: {sla.data?.customerService.escalation.persistent ?? 0}</Badge></div></div>
            </div>
            <form className="grid gap-3 rounded-xl border border-sky-200 bg-white p-3 sm:grid-cols-3" onSubmit={event => { event.preventDefault(); void saveSlaPolicy(); }}>
              <label className="grid gap-1 text-xs font-semibold text-slate-700" htmlFor="medora-procurement-sla"><span>{copy.procurementTarget}</span><Input id="medora-procurement-sla" type="number" min="1" max="720" inputMode="numeric" value={slaDraft.procurementTargetHours} onChange={event => setSlaDraft(current => ({ ...current, procurementTargetHours: event.target.value }))} /></label>
              <label className="grid gap-1 text-xs font-semibold text-slate-700" htmlFor="medora-care-sla"><span>{copy.careTarget}</span><Input id="medora-care-sla" type="number" min="1" max="720" inputMode="numeric" value={slaDraft.customerCareTargetHours} onChange={event => setSlaDraft(current => ({ ...current, customerCareTargetHours: event.target.value }))} /></label>
              <label className="grid gap-1 text-xs font-semibold text-slate-700" htmlFor="medora-sla-grace"><span>{copy.grace}</span><Input id="medora-sla-grace" type="number" min="1" max="720" inputMode="numeric" value={slaDraft.escalationGraceHours} onChange={event => setSlaDraft(current => ({ ...current, escalationGraceHours: event.target.value }))} /></label>
              <label className="flex min-h-10 items-center gap-2 text-xs font-semibold text-slate-700 sm:col-span-2"><input type="checkbox" checked={slaDraft.escalationEnabled} onChange={event => setSlaDraft(current => ({ ...current, escalationEnabled: event.target.checked }))} className="h-4 w-4 rounded border-slate-300 text-sky-700 focus:ring-sky-600" /><span>{copy.escalationEnabled}</span></label>
              <div className="flex items-center justify-end"><Button type="submit" size="sm" className="bg-sky-700 hover:bg-sky-800" disabled={updateSlaPolicy.isPending}>{updateSlaPolicy.isPending ? <><Loader2 className="mx-1 h-4 w-4 animate-spin" />{copy.savingPolicy}</> : copy.savePolicy}</Button></div>
              <p aria-live="polite" className={status ? "text-xs leading-5 text-slate-600 sm:col-span-3" : "sr-only"}>{status}</p>
            </form>
          </div>
        </details>
        <details className="group rounded-2xl border border-emerald-200 bg-emerald-50/50">
          <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 px-4 text-sm font-semibold text-emerald-950 marker:content-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-emerald-500">
            <span className="flex items-center gap-2"><TimerReset className="h-4 w-4" />{automationCopy.title}</span>
            <Badge variant="outline" className={automation.data?.configured && automation.data.active ? "border-emerald-300 bg-emerald-100 text-emerald-800" : "border-slate-300 bg-white text-slate-700"}>{automation.data?.configured ? automation.data.active ? automationCopy.enabled : automationCopy.paused : automationCopy.notConfigured}</Badge>
          </summary>
          <div className="space-y-3 border-t border-emerald-200 p-4">
            <p className="text-xs leading-5 text-emerald-950">{automationCopy.detail}</p>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-xl border border-emerald-100 bg-white p-3"><p className="text-xs font-semibold text-slate-600">{automationCopy.evaluated}</p><p className="mt-1 text-lg font-bold text-slate-900">{automation.data?.lastRunEvaluatedCount ?? 0}</p></div>
              <div className="rounded-xl border border-emerald-100 bg-white p-3"><p className="text-xs font-semibold text-slate-600">{automationCopy.queued}</p><p className="mt-1 text-lg font-bold text-slate-900">{automation.data?.lastRunQueuedCount ?? 0}</p></div>
              <div className="rounded-xl border border-emerald-100 bg-white p-3"><p className="text-xs font-semibold text-slate-600">{automationCopy.lastRun}</p><p className="mt-1 text-sm font-semibold text-slate-900">{automation.data?.lastRunAt ? new Date(automation.data.lastRunAt).toLocaleString() : automationCopy.never}</p></div>
              <div className={(automation.data?.consecutiveFailureCount ?? 0) > 0 ? "rounded-xl border border-rose-200 bg-rose-50 p-3" : "rounded-xl border border-emerald-100 bg-white p-3"}><p className="text-xs font-semibold text-slate-600">{automationCopy.consecutiveFailures}</p><p className={(automation.data?.consecutiveFailureCount ?? 0) > 0 ? "mt-1 text-lg font-bold text-rose-700" : "mt-1 text-lg font-bold text-slate-900"}>{automation.data?.consecutiveFailureCount ?? 0}</p></div>
            </div>
            <div className="flex flex-wrap items-end justify-between gap-3">
              <label className="grid gap-1 text-xs font-semibold text-slate-700"><span>{automationCopy.cadence}</span><select value={cronExpression} onChange={event => setCronExpression(event.target.value as typeof cronExpression)} className="h-10 min-w-48 rounded-lg border border-emerald-200 bg-white px-3 text-sm font-normal"><option value="0 0 */6 * * *">{automationCopy.sixHours}</option><option value="0 0 6 * * *">{automationCopy.daily}</option><option value="0 0 0 * * *">{automationCopy.nightly}</option></select></label>
              <Button type="button" size="sm" className={automation.data?.configured && automation.data.active ? "bg-slate-700 hover:bg-slate-800" : "bg-emerald-700 hover:bg-emerald-800"} disabled={configureAutomation.isPending} onClick={() => void updateAutomation(!(automation.data?.configured && automation.data.active))}>{configureAutomation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : automation.data?.configured && automation.data.active ? <PauseCircle className="h-4 w-4" /> : <PlayCircle className="h-4 w-4" />}{configureAutomation.isPending ? automationCopy.working : automation.data?.configured && automation.data.active ? automationCopy.pause : automationCopy.enable}</Button>
            </div>
            <div className="space-y-3 rounded-xl border border-emerald-200 bg-white p-3">
              <div className="flex flex-wrap items-start justify-between gap-2"><div><p className="text-sm font-semibold text-emerald-950">{automationCopy.eventLog}</p><p className="mt-1 text-xs leading-5 text-slate-600">{automationCopy.eventLogDetail}</p></div><Badge variant="outline" className="border-emerald-300 bg-emerald-50 text-emerald-800">{automationCopy.eventLogRecorded}</Badge></div>
              <label className="grid gap-1 text-xs font-semibold text-slate-700"><span>{automationCopy.failureThreshold}</span><Input type="number" min="2" max="10" inputMode="numeric" value={automationDraft.automationFailureNotificationThreshold} onChange={event => setAutomationDraft(current => ({ ...current, automationFailureNotificationThreshold: event.target.value }))} /></label>
              <div className="flex flex-wrap items-center justify-between gap-2"><p className="text-xs text-slate-600">{automationCopy.lastEvent}: {automation.data?.lastInternalEventAt ? `${automation.data.lastInternalEventStatus === "recorded" ? automationCopy.entryRecorded : automation.data.lastInternalEventStatus} · ${new Date(automation.data.lastInternalEventAt).toLocaleString()}` : automationCopy.entryNever}</p><Button type="button" size="sm" variant="outline" className="border-emerald-300 text-emerald-800 hover:bg-emerald-50" disabled={configureAutomation.isPending} onClick={() => void updateAutomation(Boolean(automation.data?.configured && automation.data.active))}>{configureAutomation.isPending ? automationCopy.working : automationCopy.saveSettings}</Button></div>
            </div>
          </div>
        </details>
        <details className="group rounded-2xl border border-violet-200 bg-violet-50/40"><summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 px-4 text-sm font-semibold text-violet-950 marker:content-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-violet-500"><span className="flex items-center gap-2"><UsersRound className="h-4 w-4" />{copy.decisionTitle}</span><span className="text-xs font-normal text-violet-700">{copy.recent}</span></summary><div className="space-y-3 border-t border-violet-200 p-4"><p className="text-xs leading-5 text-violet-900">{copy.decisionDetail}</p><div className="flex flex-wrap items-center justify-between gap-2"><p className="text-sm font-semibold text-slate-800">{copy.recent}</p><Button type="button" size="sm" className="bg-violet-700 hover:bg-violet-800" onClick={() => { setFormOpen(value => !value); setStatus(""); }}>{formOpen ? copy.close : copy.record}</Button></div>{formOpen && <form className="grid gap-3 rounded-xl border border-violet-200 bg-white p-3 sm:grid-cols-2" onSubmit={event => { event.preventDefault(); void submit(); }}><label className="grid gap-1 text-xs font-semibold text-slate-700"><span>{copy.entityType}</span><select value={entityType} onChange={event => setEntityType(event.target.value as DecisionEntityType)} className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm font-normal">{(Object.keys(entityLabels) as DecisionEntityType[]).map(type => <option key={type} value={type}>{entityLabels[type]}</option>)}</select></label><label className="grid gap-1 text-xs font-semibold text-slate-700"><span>{copy.entityId}</span><Input value={entityId} onChange={event => setEntityId(event.target.value)} inputMode="numeric" min="1" type="number" /></label><label className="grid gap-1 text-xs font-semibold text-slate-700"><span>{copy.decision}</span><select value={decision} onChange={event => setDecision(event.target.value as Decision)} className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm font-normal"><option value="approved">{copy.approved}</option><option value="rejected">{copy.rejected}</option><option value="deferred">{copy.deferred}</option></select></label><label className="grid gap-1 text-xs font-semibold text-slate-700 sm:col-span-2"><span>{copy.reason}</span><textarea value={reason} onChange={event => setReason(event.target.value)} minLength={3} maxLength={1000} rows={3} className="resize-y rounded-lg border border-slate-200 bg-white p-3 text-sm font-normal" placeholder={copy.reasonHint} /></label><div className="flex flex-wrap items-center justify-between gap-2 sm:col-span-2"><p aria-live="polite" className={status ? "text-xs text-slate-600" : "sr-only"}>{status}</p><Button type="submit" disabled={recordDecision.isPending}>{recordDecision.isPending ? <><Loader2 className="mx-1 h-4 w-4 animate-spin" />{copy.saving}</> : copy.save}</Button></div></form>}{history.data?.items.length ? <div className="space-y-2">{history.data.items.map(item => <div key={item.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-violet-100 bg-white px-3 py-2 text-xs"><span className="font-semibold text-slate-800">{entityLabels[item.entityType as DecisionEntityType] ?? item.entityType} #{item.entityId}</span><Badge variant="outline" className={item.decision === "rejected" ? "border-rose-200 bg-rose-50 text-rose-700" : item.decision === "approved" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-amber-200 bg-amber-50 text-amber-700"}>{decisionLabel(item.decision)}</Badge><span className="max-w-full break-words text-slate-500 sm:max-w-[46%]">{item.reason}</span><span className="text-slate-400">{new Date(item.decidedAt).toLocaleString()}</span></div>)}</div> : <p className="rounded-xl border border-dashed border-violet-200 bg-white/70 p-3 text-sm text-slate-600">{copy.noDecisions}</p>}</div></details>
      </>}
    </CardContent>
  </Card>;
}
