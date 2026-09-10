import { useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, ClipboardList, Eye, FileWarning, LockKeyhole, ShieldAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useLocalization } from "@/contexts/LocalizationContext";
import { trpc } from "@/lib/trpc";

type InterfaceLanguage = "ar" | "en";
const severityClass: Record<string, string> = { low: "bg-slate-100 text-slate-700", medium: "bg-amber-100 text-amber-800", high: "bg-orange-100 text-orange-900", critical: "bg-rose-100 text-rose-900" };

const copy = {
  ar: {
    riskNotAccusation: "إشارات مخاطر لا اتهامات",
    riskDescription: "هذه المساحة تجمع مؤشرات قابلة للتفسير وتربطها بأدلة ومراجعة بشرية. لا يصدر النظام حكماً على شخص ولا ينفذ حظراً أو إجراءً تأديبياً أو شراءً تلقائياً.",
    openCases: "قضايا مفتوحة", criticalSignals: "إشارات حرجة", viewScope: "نطاق العرض", branch: "الفرع", allBranches: "كل فروع المؤسسة",
    filterCaseStatus: "تصفية حالة القضية", allCases: "كل الحالات", governedReview: "المراجعة محكومة بالصلاحيات والنطاق",
    openCase: "فتح قضية من واقعة موثقة", category: "فئة القضية", severity: "شدة القضية", signalCode: "رمز الإشارة", caseSummary: "ملخص الواقعة", evidenceReference: "مرجع الدليل",
    inventory: "مخزون", cash: "نقد ومبيعات", procurement: "مشتريات", prescription: "وصفات", access: "صلاحيات", identity: "هوية", data: "بيانات", other: "أخرى",
    signalPlaceholder: "رمز الإشارة", summaryPlaceholder: "وصف واقعة لا يقل عن 10 أحرف", evidencePlaceholder: "مرجع الدليل أو ملاحظة المصدر (اختياري)", recordForReview: "تسجيل للمراجعة",
    loading: "جارٍ تحميل إشارات المخاطر…", loadError: "تعذر تحميل القضايا أو لا توجد صلاحية مراجعة لهذا النطاق.", reviewQueue: "طابور المراجعة البشرية", noCases: "لا توجد قضايا في هذا النطاق. لا يتم إنشاء قضايا وهمية أو بيانات اتهامية.", reviewFile: "ملف المراجعة والأدلة", signal: "الإشارة", createdBy: "أنشأها المستخدم", subject: "الموضوع", notSpecified: "غير محدد", evidenceConfirm: "يجب تأكيد الدليل من مصدر العمل قبل اتخاذ أي قرار تشغيلي.", savedEvidence: "الأدلة المحفوظة", noStructuredEvidence: "لا توجد أدلة منظمة.", evidenceReadError: "تعذر قراءة الدليل المحفوظ؛ لا يتم اعتبار القضية مكتملة.", recordReviewOutcome: "توثيق نتيجة المراجعة", outcomeCode: "رمز النتيجة، عند الإغلاق أو الاستبعاد", outcomeNote: "ملاحظة الدليل أو سبب القرار", beginReview: "بدء المراجعة", temporaryContainment: "احتواء مؤقت", documentedClosure: "إغلاق موثق", documentedDismissal: "استبعاد موثق", selectCase: "اختر قضية لعرض الأدلة وخيارات المراجعة.",
    new: "جديدة", under_review: "قيد المراجعة", contained: "تم الاحتواء", resolved: "مغلقة", dismissed: "مستبعدة", low: "منخفضة", medium: "متوسطة", high: "مرتفعة", critical: "حرجة",
    recordedStatus: "تم تسجيل الحالة", openedCase: "تم فتح القضية", humanReview: "للمراجعة البشرية.",
  },
  en: {
    riskNotAccusation: "Risk signals, not accusations",
    riskDescription: "This workspace records explainable indicators with evidence and human review. It does not judge a person or automatically block, discipline, or purchase.",
    openCases: "Open cases", criticalSignals: "Critical signals", viewScope: "View scope", branch: "Branch", allBranches: "All organisation branches",
    filterCaseStatus: "Filter case status", allCases: "All cases", governedReview: "Review is governed by permission and scope",
    openCase: "Open a case from a documented event", category: "Case category", severity: "Case severity", signalCode: "Signal code", caseSummary: "Event summary", evidenceReference: "Evidence reference",
    inventory: "Inventory", cash: "Cash and sales", procurement: "Procurement", prescription: "Prescriptions", access: "Access", identity: "Identity", data: "Data", other: "Other",
    signalPlaceholder: "Signal code", summaryPlaceholder: "Describe the event in at least 10 characters", evidencePlaceholder: "Evidence reference or source note (optional)", recordForReview: "Record for review",
    loading: "Loading risk signals…", loadError: "Cases could not be loaded, or you do not have review access for this scope.", reviewQueue: "Human review queue", noCases: "There are no cases in this scope. The system does not create fictional cases or accusatory data.", reviewFile: "Review file and evidence", signal: "Signal", createdBy: "Created by user", subject: "Subject", notSpecified: "Not specified", evidenceConfirm: "Confirm evidence at its operational source before making any decision.", savedEvidence: "Stored evidence", noStructuredEvidence: "No structured evidence is recorded.", evidenceReadError: "Stored evidence could not be read; the case cannot be considered complete.", recordReviewOutcome: "Record review outcome", outcomeCode: "Outcome code, required for closure or dismissal", outcomeNote: "Evidence note or decision reason", beginReview: "Start review", temporaryContainment: "Temporary containment", documentedClosure: "Documented closure", documentedDismissal: "Documented dismissal", selectCase: "Select a case to view its evidence and review options.",
    new: "New", under_review: "Under review", contained: "Contained", resolved: "Resolved", dismissed: "Dismissed", low: "Low", medium: "Medium", high: "High", critical: "Critical",
    recordedStatus: "Case status recorded", openedCase: "Case opened", humanReview: "for human review.",
  },
} as const;

function labelsFor(language: InterfaceLanguage) {
  const text = copy[language];
  return {
    status: { new: text.new, under_review: text.under_review, contained: text.contained, resolved: text.resolved, dismissed: text.dismissed } as Record<string, string>,
    severity: { low: text.low, medium: text.medium, high: text.high, critical: text.critical } as Record<string, string>,
    category: { inventory: text.inventory, cash: text.cash, procurement: text.procurement, prescription: text.prescription, access: text.access, identity: text.identity, data: text.data, other: text.other } as Record<string, string>,
  };
}

export function AntiFraudWorkspace({ organizationId, branchId }: { organizationId: number | null; branchId: number | null }) {
  const { language } = useLocalization();
  const interfaceLanguage: InterfaceLanguage = language === "en" ? "en" : "ar";
  const text = copy[interfaceLanguage];
  const labels = labelsFor(interfaceLanguage);
  const dir = interfaceLanguage === "ar" ? "rtl" : "ltr";
  const [statusFilter, setStatusFilter] = useState<"all" | "new" | "under_review" | "contained" | "resolved" | "dismissed">("all");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [resolutionCode, setResolutionCode] = useState("");
  const [resolutionNote, setResolutionNote] = useState("");
  const [notice, setNotice] = useState("");
  const [category, setCategory] = useState<"cash" | "inventory" | "procurement" | "prescription" | "access" | "identity" | "data" | "other">("inventory");
  const [severity, setSeverity] = useState<"low" | "medium" | "high" | "critical">("medium");
  const [signalCode, setSignalCode] = useState("");
  const [summary, setSummary] = useState("");
  const [evidenceNote, setEvidenceNote] = useState("");
  const cases = trpc.antiFraud.listCases.useQuery({ organizationId: organizationId ?? 0, branchId, status: statusFilter === "all" ? undefined : statusFilter }, { enabled: Boolean(organizationId), retry: false });
  const transition = trpc.antiFraud.transitionCase.useMutation({ onSuccess: async result => { setNotice(`${text.recordedStatus}: ${labels.status[result.status] ?? result.status}`); setResolutionCode(""); setResolutionNote(""); await cases.refetch(); } });
  const createCase = trpc.antiFraud.createCase.useMutation({ onSuccess: async result => { setNotice(`${text.openedCase} #${result.id} ${text.humanReview}`); setSignalCode(""); setSummary(""); setEvidenceNote(""); await cases.refetch(); setSelectedId(result.id); } });
  const selected = useMemo(() => cases.data?.find(item => item.id === selectedId) ?? cases.data?.[0], [cases.data, selectedId]);
  const parsedEvidence = useMemo(() => {
    if (!selected) return [] as Array<[string, string]>;
    try { return Object.entries(JSON.parse(selected.evidenceJson) as Record<string, string | number | boolean>).map(([key, value]) => [key, String(value)] as [string, string]); } catch { return [["evidence", text.evidenceReadError]]; }
  }, [selected, text.evidenceReadError]);
  const openCount = cases.data?.filter(item => !["resolved", "dismissed"].includes(item.status)).length ?? 0;
  const criticalCount = cases.data?.filter(item => item.severity === "critical").length ?? 0;
  const submitCase = () => { if (!organizationId || signalCode.trim().length < 3 || summary.trim().length < 10) return; createCase.mutate({ organizationId, branchId, category, severity, signalCode: signalCode.trim(), summary: summary.trim(), evidence: evidenceNote.trim() ? { sourceNote: evidenceNote.trim() } : {} }); };
  const move = (nextStatus: "under_review" | "contained" | "resolved" | "dismissed") => { if (!organizationId || !selected) return; transition.mutate({ organizationId, caseId: selected.id, nextStatus, resolutionCode: resolutionCode || undefined, resolutionNote: resolutionNote || undefined }); };
  const locale = interfaceLanguage === "ar" ? "ar-EG" : "en-US";
  return <div className="space-y-5" dir={dir}>
    <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm leading-6 text-rose-950"><div className="flex items-start gap-3"><ShieldAlert className="mt-0.5 h-5 w-5 shrink-0" /><div><p className="font-bold">{text.riskNotAccusation}</p><p>{text.riskDescription}</p></div></div></div>
    <div className="grid gap-3 sm:grid-cols-3"><Metric icon={<ClipboardList className="h-6 w-6 text-cyan-700" />} label={text.openCases} value={openCount} /><Metric icon={<AlertTriangle className="h-6 w-6 text-rose-600" />} label={text.criticalSignals} value={criticalCount} critical /><Metric icon={<LockKeyhole className="h-6 w-6 text-slate-500" />} label={text.viewScope} value={branchId ? `${text.branch} #${branchId}` : text.allBranches} /></div>
    <div className="flex flex-wrap gap-2"><select value={statusFilter} onChange={event => setStatusFilter(event.target.value as typeof statusFilter)} className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm" aria-label={text.filterCaseStatus}><option value="all">{text.allCases}</option>{Object.entries(labels.status).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select><span className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">{text.governedReview}</span></div>
    <Card className="border-cyan-200 bg-cyan-50/40"><CardHeader><CardTitle className="text-base">{text.openCase}</CardTitle></CardHeader><CardContent className="grid gap-2 md:grid-cols-5"><select value={category} onChange={event => setCategory(event.target.value as typeof category)} className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm" aria-label={text.category}>{Object.entries(labels.category).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select><select value={severity} onChange={event => setSeverity(event.target.value as typeof severity)} className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm" aria-label={text.severity}>{Object.entries(labels.severity).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select><Input value={signalCode} onChange={event => setSignalCode(event.target.value)} placeholder={text.signalPlaceholder} aria-label={text.signalCode} /><Input value={summary} onChange={event => setSummary(event.target.value)} placeholder={text.summaryPlaceholder} aria-label={text.caseSummary} /><Button onClick={submitCase} disabled={createCase.isPending || signalCode.trim().length < 3 || summary.trim().length < 10}>{text.recordForReview}</Button><Input className="md:col-span-4" value={evidenceNote} onChange={event => setEvidenceNote(event.target.value)} placeholder={text.evidencePlaceholder} aria-label={text.evidenceReference} /></CardContent></Card>
    {cases.isLoading ? <Card><CardContent className="p-8 text-center text-sm text-slate-500">{text.loading}</CardContent></Card> : cases.error ? <Card className="border-amber-200 bg-amber-50"><CardContent className="p-5 text-sm text-amber-900">{text.loadError}</CardContent></Card> : <div className="grid gap-4 lg:grid-cols-[.9fr_1.1fr]"><Card><CardHeader><CardTitle className="text-base">{text.reviewQueue}</CardTitle></CardHeader><CardContent className="space-y-2">{cases.data?.length ? cases.data.map(item => <button key={item.id} onClick={() => setSelectedId(item.id)} className={`w-full rounded-xl border p-3 text-start transition ${selected?.id === item.id ? "border-cyan-400 bg-cyan-50" : "border-slate-200 bg-white hover:border-cyan-200"}`}><div className="flex items-start justify-between gap-3"><div><p className="font-semibold text-slate-900">{item.summary}</p><p className="mt-1 text-xs text-slate-500">#{item.id} · {item.signalCode} · {new Date(item.createdAt).toLocaleString(locale)}</p></div><span className={`rounded-full px-2 py-1 text-[11px] font-semibold ${severityClass[item.severity] ?? severityClass.low}`}>{labels.severity[item.severity] ?? item.severity}</span></div><div className="mt-2 flex items-center gap-2 text-xs text-slate-500"><Badge variant="outline">{labels.status[item.status] ?? item.status}</Badge><span>{labels.category[item.category] ?? item.category}</span></div></button>) : <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500"><FileWarning className="mx-auto mb-2 h-6 w-6 text-slate-300" />{text.noCases}</div>}</CardContent></Card><Card><CardHeader><CardTitle className="flex items-center gap-2 text-base"><Eye className="h-4 w-4 text-cyan-700" />{text.reviewFile}</CardTitle></CardHeader><CardContent className="space-y-4">{selected ? <><div><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="font-bold text-slate-900">{selected.summary}</p><p className="mt-1 text-xs text-slate-500">{text.signal}: {selected.signalCode} · {text.createdBy} #{selected.createdByUserId}</p></div><Badge>{labels.status[selected.status] ?? selected.status}</Badge></div><p className="mt-3 rounded-lg bg-slate-50 p-3 text-xs leading-5 text-slate-600">{text.subject}: {selected.subjectType ?? text.notSpecified} {selected.subjectId ? `· ${selected.subjectId}` : ""}. {text.evidenceConfirm}</p></div><div className="rounded-xl border border-slate-200 p-3"><p className="mb-2 text-sm font-semibold">{text.savedEvidence}</p>{parsedEvidence.length ? <div className="grid gap-2 sm:grid-cols-2">{parsedEvidence.map(([key, value]) => <div key={key} className="rounded-lg bg-slate-50 p-2 text-xs"><span className="font-semibold text-slate-700">{key}</span><p className="mt-1 text-slate-600">{value}</p></div>)}</div> : <p className="text-xs text-slate-500">{text.noStructuredEvidence}</p>}</div>{!["resolved", "dismissed"].includes(selected.status) && <div className="space-y-2 rounded-xl border border-cyan-100 bg-cyan-50/50 p-3"><p className="text-sm font-semibold text-cyan-950">{text.recordReviewOutcome}</p><Input value={resolutionCode} onChange={event => setResolutionCode(event.target.value)} placeholder={text.outcomeCode} aria-label={text.outcomeCode} /><Input value={resolutionNote} onChange={event => setResolutionNote(event.target.value)} placeholder={text.outcomeNote} aria-label={text.outcomeNote} /><div className="flex flex-wrap gap-2"><Button size="sm" variant="outline" disabled={transition.isPending} onClick={() => move("under_review")}>{text.beginReview}</Button><Button size="sm" disabled={transition.isPending} onClick={() => move("contained")}>{text.temporaryContainment}</Button><Button size="sm" variant="outline" disabled={transition.isPending || resolutionCode.trim().length < 1 || resolutionNote.trim().length < 1} onClick={() => move("resolved")}><CheckCircle2 className="me-1 h-4 w-4" />{text.documentedClosure}</Button><Button size="sm" variant="ghost" disabled={transition.isPending || resolutionCode.trim().length < 1 || resolutionNote.trim().length < 1} onClick={() => move("dismissed")}>{text.documentedDismissal}</Button></div></div>}{notice && <p className="rounded-lg bg-emerald-50 p-3 text-xs text-emerald-800">{notice}</p>}</> : <p className="py-10 text-center text-sm text-slate-500">{text.selectCase}</p>}</CardContent></Card></div>}
  </div>;
}

function Metric({ icon, label, value, critical }: { icon: React.ReactNode; label: string; value: string | number; critical?: boolean }) {
  return <Card><CardContent className="flex items-center justify-between p-4"><div><p className="text-xs text-slate-500">{label}</p><p className={`mt-1 text-2xl font-bold ${critical ? "text-rose-700" : ""}`}>{value}</p></div>{icon}</CardContent></Card>;
}
