import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { trpc } from "@/lib/trpc";
import { hasJurisdictionScope, hasOrganizationBranchJurisdictionScope } from "@/lib/scope";
import { MEDORA_LOGO_MARK } from "@/lib/brand";
import { useLocalization } from "@/contexts/LocalizationContext";
import { listDurableOfflineDrafts, removeOfflineDraft, updateOfflineDraft, type OfflineDraft } from "@/lib/offlineQueue";
import { Activity, AlertCircle, AlertTriangle, ArrowLeftRight, BarChart3, Bell, BookOpenCheck, Boxes, BrainCircuit, Building2, CheckCircle2, ChevronDown, ChevronLeft, ChevronRight, ClipboardCheck, Database, FileText, FlaskConical, HeartPulse, HeartHandshake, Keyboard, LayoutDashboard, LifeBuoy, Loader2, LockKeyhole, Menu, PackageSearch, PhoneCall, Plus, PlugZap, Receipt, Search, Settings2, ShieldCheck, ShoppingCart, Sparkles, Stethoscope, Ticket, UploadCloud, UserRound, Users, WalletCards, X } from "lucide-react";
import { skipToken } from "@tanstack/react-query";
import { Component, lazy, ReactNode, Suspense, type ErrorInfo, type TouchEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "wouter";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { IntegrationStatusStrip } from "@/components/IntegrationStatusNotice";
import { describeSearchMatch, smartSearch } from "@/lib/smartSearch";
import { secondaryModuleTabForRoute } from "@/lib/secondaryModuleRouting";
import { isAtLogicalEdge, swipeAction } from "@/lib/sidebarGestures";
import { buildPrescriptionAccessInput, hasAssignedPrescriptionJurisdiction } from "@/lib/prescriptionAccessScope";
import { OfflineStatusIndicator } from "@/components/OfflineStatusIndicator";
import { ScreenCaptureProtection } from "@/components/ScreenCaptureProtection";
import { OperationalWorkflowGuide } from "@/components/OperationalWorkflowGuide";
import { ManagerOperationalIntelligence } from "@/components/ManagerOperationalIntelligence";
import { CAPTURE_RISK_REASONS, type CaptureRiskReason } from "@/lib/screenCaptureProtection";
import { classifyWorkspaceFailure, type WorkspaceFailureCategory } from "@/lib/workspaceFailureClassification";
import { Drawer, DrawerContent, DrawerDescription, DrawerTitle } from "@/components/ui/drawer";

const PointOfSaleWorkspace = lazy(() => import("@/components/PointOfSaleWorkspace").then(module => ({ default: module.PointOfSaleWorkspace })));
const BranchAnalyticsDashboard = lazy(() => import("@/components/BranchAnalyticsDashboard").then(module => ({ default: module.BranchAnalyticsDashboard })));
const HardwareWorkspace = lazy(() => import("@/components/HardwareWorkspace").then(module => ({ default: module.HardwareWorkspace })));
const SupplyChainWorkspace = lazy(() => import("@/components/SupplyChainWorkspace").then(module => ({ default: module.SupplyChainWorkspace })));
const EgyptHealthcareWorkspace = lazy(() => import("@/components/EgyptHealthcareWorkspace").then(module => ({ default: module.EgyptHealthcareWorkspace })));
const InsuranceWorkspace = lazy(() => import("@/components/IntegratedOperationsWorkspaces").then(module => ({ default: module.InsuranceWorkspace })));
const OrganizationWorkspace = lazy(() => import("@/components/IntegratedOperationsWorkspaces").then(module => ({ default: module.OrganizationWorkspace })));
const PromotionsWorkspace = lazy(() => import("@/components/IntegratedOperationsWorkspaces").then(module => ({ default: module.PromotionsWorkspace })));
const ReportsWorkspace = lazy(() => import("@/components/IntegratedOperationsWorkspaces").then(module => ({ default: module.ReportsWorkspace })));
const AccountingLoyaltyWorkspace = lazy(() => import("@/components/AccountingLoyaltyWorkspace"));
const ProcurementBalanceReports = lazy(() => import("@/components/ProcurementBalanceReports"));
const OperationsManagementWorkspace = lazy(() => import("@/components/OperationsManagementWorkspace").then(module => ({ default: module.OperationsManagementWorkspace })));
const NlmIcd10ReferencePanel = lazy(() => import("@/components/NlmIcd10ReferencePanel").then(module => ({ default: module.NlmIcd10ReferencePanel })));
const AuthenticationSettingsWorkspace = lazy(() => import("@/components/AuthenticationSettingsWorkspace").then(module => ({ default: module.AuthenticationSettingsWorkspace })));
const ConnectorAccreditationDashboard = lazy(() => import("@/components/ConnectorAccreditationDashboard").then(module => ({ default: module.ConnectorAccreditationDashboard })));
const TaxInvoiceWorkspace = lazy(() => import("@/components/TaxInvoiceWorkspace").then(module => ({ default: module.TaxInvoiceWorkspace })));
const AiGovernanceWorkspace = lazy(() => import("@/components/AiGovernanceWorkspace").then(module => ({ default: module.AiGovernanceWorkspace })));
const AiInsightsWorkspace = lazy(() => import("@/components/AiInsightsWorkspace").then(module => ({ default: module.AiInsightsWorkspace })));
const AntiFraudWorkspace = lazy(() => import("@/components/AntiFraudWorkspace").then(module => ({ default: module.AntiFraudWorkspace })));
const DemoExperienceWorkspace = lazy(() => import("@/components/DemoExperienceWorkspace").then(module => ({ default: module.DemoExperienceWorkspace })));
const createAssistantSupportWorkspace = () => lazy(() => import("@/components/AssistantSupportWorkspace").then(module => ({ default: module.AssistantSupportWorkspace })));
const BackupManagementWorkspace = lazy(() => import("@/components/BackupManagementWorkspace"));
const PolicyKnowledgeWorkspace = lazy(() => import("@/components/PolicyKnowledgeWorkspace").then(module => ({ default: module.PolicyKnowledgeWorkspace })));
const SecondaryModulesWorkspace = lazy(() => import("@/components/SecondaryModulesWorkspace"));
function WorkspaceLoadingState() {
  const { direction, t } = useLocalization();
  return <Card className="border-cyan-200 bg-cyan-50/60"><CardContent className={cn("flex min-h-40 items-center justify-center gap-3 p-6 text-sm text-cyan-900", direction === "rtl" ? "text-right" : "text-left")}><Loader2 className="h-5 w-5 animate-spin" /> {t("home.loadingWorkspace")}</CardContent></Card>;
}

function WorkspaceErrorState({ onRetry }: { onRetry: () => void }) {
  const { direction, t } = useLocalization();
  return <Card className="border-rose-200 bg-rose-50"><CardContent className={cn("space-y-3 p-6 text-sm leading-6 text-rose-900", direction === "rtl" ? "text-right" : "text-left")}><p>{t("home.workspaceLoadFailed")}</p><Button type="button" variant="outline" className="border-rose-300 bg-white text-rose-900 hover:bg-rose-100" onClick={onRetry}>{t("home.reloadWorkspace")}</Button></CardContent></Card>;
}

function AssistantWorkspaceErrorState({ organizationId, branchId, onRetry }: { organizationId: number | null; branchId: number | null; onRetry: () => void }) {
  const { direction, language } = useLocalization();
  const reportFailure = trpc.assistant.recordWorkspaceLoadFailure.useMutation();
  const reportedScope = useRef<string | null>(null);
  useEffect(() => {
    if (!organizationId || reportedScope.current === `${organizationId}:${branchId ?? "none"}`) return;
    reportedScope.current = `${organizationId}:${branchId ?? "none"}`;
    reportFailure.mutate({ organizationId, branchId, failureKey: "assistant_workspace_lazy_load" });
  }, [organizationId, branchId]);
  const isEnglish = language === "en";
  return <Card role="status" aria-live="polite" className="border-amber-200 bg-amber-50">
    <CardContent className={cn("space-y-3 p-6 text-sm leading-6 text-amber-950", direction === "rtl" ? "text-right" : "text-left")}>
      <CardTitle className="text-base text-amber-950">{isEnglish ? "MEDORA assistant is temporarily unavailable" : "مساعد MEDORA غير متاح مؤقتاً"}</CardTitle>
      <p>{isEnglish ? "The assistant module could not be loaded. No sale, prescription, purchase, permission change, or external message was executed." : "تعذر تحميل وحدة المساعد. لم يتم تنفيذ أي بيع أو وصفة أو شراء أو تغيير صلاحيات أو رسالة خارجية."}</p>
      <p className="text-xs text-amber-800">{isEnglish ? "You can continue using the rest of the workspace and retry the assistant when the connection is ready." : "يمكنك متابعة استخدام بقية مساحة العمل وإعادة محاولة المساعد عند استقرار الاتصال."}</p>
      <Button type="button" variant="outline" className="border-amber-300 bg-white text-amber-950 hover:bg-amber-100" onClick={onRetry}>{isEnglish ? "Retry assistant" : "إعادة محاولة المساعد"}</Button>
    </CardContent>
  </Card>;
}

class WorkspaceErrorBoundary extends Component<{ fallback: (onRetry: () => void) => ReactNode; children: ReactNode }, { hasError: boolean; failureCategory: WorkspaceFailureCategory | null; retryVersion: number }> {
  state = { hasError: false, failureCategory: null, retryVersion: 0 };
  static getDerivedStateFromError(error: unknown) { return { hasError: true, failureCategory: classifyWorkspaceFailure(error) }; }
  componentDidCatch(error: Error, info: ErrorInfo) {
    if (import.meta.env.DEV) console.error("Workspace recovery category; local retry remains available.", { category: this.state.failureCategory, name: error.name, componentStack: info.componentStack });
  }
  retry = () => this.setState(previousState => ({ hasError: false, failureCategory: null, retryVersion: previousState.retryVersion + 1 }));
  render() { return this.state.hasError ? this.props.fallback(this.retry) : <div key={this.state.retryVersion} className="min-w-0">{this.props.children}</div>; }
}

function ReloadableAssistantSupportWorkspace({ organizationId, branchId, screen, isOverlay = false, initialDraft }: { organizationId: number | null; branchId: number | null; screen: string; isOverlay?: boolean; initialDraft?: string }) {
  const [loadVersion, setLoadVersion] = useState(0);
  const AssistantWorkspace = useMemo(() => createAssistantSupportWorkspace(), [loadVersion]);
  const retryAssistantLoad = useCallback((resetBoundary: () => void) => {
    setLoadVersion(version => version + 1);
    resetBoundary();
  }, []);
  return <WorkspaceErrorBoundary key={`assistant:${organizationId ?? "none"}:${branchId ?? "none"}`} fallback={onRetry => <AssistantWorkspaceErrorState organizationId={organizationId} branchId={branchId} onRetry={() => retryAssistantLoad(onRetry)} />}><Suspense fallback={<WorkspaceLoadingState />}><AssistantWorkspace organizationId={organizationId} branchId={branchId} screen={screen} isOverlay={isOverlay} initialDraft={initialDraft} /></Suspense></WorkspaceErrorBoundary>;
}

export function buildWorkspaceResetKey(active: string, organizationId: number | null, branchId: number | null, jurisdictionId: number | null) {
  return `${active}:${organizationId ?? "none"}:${branchId ?? "none"}:${jurisdictionId ?? "none"}`;
}

function LazyWorkspace({ children, resetKey }: { children: ReactNode; resetKey: string }) {
  return <Suspense fallback={<WorkspaceLoadingState />}><WorkspaceErrorBoundary key={resetKey} fallback={onRetry => <WorkspaceErrorState onRetry={onRetry} />}>{children}</WorkspaceErrorBoundary></Suspense>;
}

const defaultModules = [
  { id: "overview", label: "نظرة عامة", searchText: "overview dashboard home", icon: LayoutDashboard },
  { id: "pos", label: "نقطة البيع", searchText: "pos sales cashier point of sale", icon: ShoppingCart },
  { id: "inventory", label: "المخزون و FEFO", searchText: "inventory stock fefo batches expiry", icon: Boxes },
  { id: "supplyChain", label: "سلاسل الإمداد والتنبؤ", searchText: "supply chain procurement demand forecast reorder", icon: BarChart3 },
  { id: "prescriptions", label: "الوصفات الذكية", searchText: "prescriptions prescription ai pharmacist", icon: BrainCircuit },
  { id: "insurance", label: "التأمين والمطالبات", searchText: "insurance claims tpa payer", icon: ClipboardCheck },
  { id: "egyptHealthcare", label: "المستشفيات والتأمين المصري", searchText: "egypt hospital government private universal health insurance claims", icon: Stethoscope },
  { id: "compliance", label: "الامتثال الإقليمي", searchText: "compliance regulatory egypt eta eda", icon: ShieldCheck },
  { id: "compounding", label: "التحضير الصيدلي", searchText: "compounding pharmacy bom", icon: FlaskConical },
  { id: "finance", label: "المالية والتقارير", searchText: "finance accounting reports", icon: WalletCards },
  { id: "promotions", label: "العروض الترويجية", searchText: "promotions discounts campaigns", icon: Receipt },
  { id: "people", label: "الموظفون والفروع", searchText: "people hr employees branches", icon: Users },
  { id: "secondaryModules", label: "CRM وHR والخدمة", searchText: "crm hr call center customer care contacts employees tickets service", icon: HeartHandshake },
  { id: "customerCare", label: "خدمة العملاء", searchText: "customer care crm patients", icon: UserRound },
  { id: "operations", label: "مركز العمليات", searchText: "operations center tasks staff procurement crm workflows متابعة العملاء متابعة العميل العملاء عميل ادارة علاقات العملاء مهام الموظفين الموارد البشرية", icon: ClipboardCheck },
  { id: "callCentre", label: "مركز الاتصال", searchText: "call center support tickets", icon: PhoneCall },
    { id: "catalog", label: "كتالوج الأصناف", searchText: "catalog medicines cosmetics supplies products", icon: Database },
    { id: "demo", label: "تجربة Demo للمستثمر", searchText: "demo showcase investor trial catalog invoices scanner", icon: Receipt },
    { id: "icd10", label: "بحث التشخيص المرجعي", searchText: "icd 10 icd10 diagnosis disease coding NLM", icon: Stethoscope },
  { id: "hardware", label: "إعداد الأجهزة والمحاكاة", searchText: "hardware printers scanners simulation devices", icon: Settings2 },
  { id: "security", label: "إعدادات الحماية والمصادقة", searchText: "security authentication 2fa two factor password recovery email otp", icon: LockKeyhole },
  { id: "connectors", label: "مركز الموصلات والاعتمادات", searchText: "connectors integrations government insurance accreditation readiness UPA EDA ETA UHIA", icon: PlugZap },
  { id: "aiGovernance", label: "الذكاء الاصطناعي والمراقبة", searchText: "ai governance operational analysis workplace monitoring privacy camera microphone", icon: BrainCircuit },
  { id: "aiInsights", label: "تحليلات المشتريات والقرار", searchText: "ai purchasing decision support improvement proposals demand anomalies", icon: Sparkles },
  { id: "antiFraud", label: "النزاهة ومكافحة الاحتيال", searchText: "anti fraud theft manipulation inventory cash procurement audit investigation", icon: ShieldCheck },
  { id: "assistant", label: "المساعد الذكي ومكتب الدعم الآلي", searchText: "ai assistant auto help desk support ticket chatbot smart typing help", icon: LifeBuoy },
  { id: "backup", label: "النسخ الاحتياطي والاستعادة الآمنة", searchText: "backup restore online offline data recovery schedule automated heartbeat", icon: Database },
  { id: "policyKnowledge", label: "قاعدة معرفة سياسات النظام", searchText: "policy knowledge base governance approved procedures assistant", icon: BookOpenCheck },
];

const organizationModules: Record<string, string[]> = { government: ["overview", "compliance", "finance", "people", "insurance", "egyptHealthcare", "icd10"], pharmacy: ["overview", "pos", "inventory", "supplyChain", "prescriptions", "insurance", "promotions", "compliance", "customerCare", "operations", "callCentre", "catalog", "demo", "icd10", "aiInsights", "antiFraud"], pharmacy_chain: ["overview", "pos", "inventory", "supplyChain", "prescriptions", "insurance", "promotions", "compliance", "finance", "people", "customerCare", "operations", "callCentre", "catalog", "demo", "icd10", "aiInsights", "antiFraud"], distributor: ["overview", "inventory", "supplyChain", "promotions", "compliance", "finance", "people", "operations", "catalog", "aiInsights", "antiFraud"], insurer: ["overview", "insurance", "compliance", "finance", "people", "customerCare", "icd10"], rehabilitation: ["overview", "prescriptions", "customerCare", "finance", "compliance", "people", "icd10"], hospital: ["overview", "inventory", "prescriptions", "insurance", "egyptHealthcare", "compliance", "finance", "people", "operations", "customerCare", "icd10", "antiFraud"], laboratory: ["overview", "prescriptions", "compliance", "finance", "people", "customerCare", "icd10"], radiology: ["overview", "prescriptions", "compliance", "finance", "people", "customerCare", "icd10"] };

const defaultModuleGroups: ReadonlyArray<{ id: string; label: string; modules: string[] }> = [
  { id: "start", label: "البداية", modules: ["overview", "assistant"] },
  { id: "work", label: "العمل اليومي", modules: ["pos", "inventory", "supplyChain", "prescriptions", "secondaryModules", "operations"] },
  { id: "business", label: "الإدارة والتقارير", modules: ["finance", "insurance", "promotions", "people", "catalog", "demo", "icd10"] },
  { id: "control", label: "الامتثال والحماية", modules: ["compliance", "egyptHealthcare", "compounding", "aiInsights", "antiFraud", "aiGovernance", "backup", "policyKnowledge", "security", "connectors", "hardware"] },
];

const defaultNextStepByModule: Record<string, string> = { operations: "اختر مسارًا واضحًا: عمل الموظفين، التوريد، أو متابعة العملاء.", overview: "ابدأ من المؤشرات والتنبيهات الحرجة.", pos: "ابحث عن الصنف ثم أنشئ الفاتورة.", inventory: "راجع الأصناف الحرجة قبل طلب التوريد.", prescriptions: "أدخل الوصفة ثم اطلب المراجعة الصيدلية.", finance: "ابدأ بالتقرير ثم راجع القيد والتسوية.", people: "اختر الموظف أو الفرع لإدارة الصلاحيات.", compliance: "راجع حالة الاعتماد قبل أي عملية منظمة.", aiInsights: "راجع التوصية ثم اعتمدها بشرياً قبل التنفيذ.", antiFraud: "ابدأ بالإشارات ثم افتح قضية عند الحاجة.", security: "تحقق من إعدادات الحماية قبل تعديلها.", supplyChain: "راجع التنبؤ ثم أرسل الطلب للمراجعة.", customerCare: "ابحث عن العميل ثم افتح المتابعة المناسبة.", assistant: "اطرح سؤالاً تشغيلياً، استخدم الكتابة الذكية، أو افتح تذكرة للدعم الآلي.", backup: "أنشئ سياسة Online يومية وسياسة Offline أسبوعية ثم راقب البصمة وسجل التشغيل.", policyKnowledge: "راجع السياسة أو أنشئ مسودة ثم أرسلها للمراجعة البشرية." };

type WorkflowAction = { label: string; description: string };
const defaultWorkflowActions: Record<string, WorkflowAction[]> = {
  overview: [{ label: "عرض المؤشرات والتنبيهات", description: "ابدأ من ملخص العمل اليومي" }, { label: "فتح الإجراءات السريعة", description: "بيع، مخزون، وصفات، وتقارير" }],
  pos: [{ label: "فتح بيع جديد", description: "ابحث عن صنف وأضفه إلى السلة" }, { label: "البحث عن صنف", description: "استخدم الاسم أو الباركود" }, { label: "الفواتير المعلقة", description: "استرجع عملية محفوظة مؤقتًا" }, { label: "المرتجعات وتقفيل الفترة", description: "راجع العمليات وفق الصلاحيات" }],
  inventory: [{ label: "البحث عن صنف", description: "راجع الرصيد والدفعات والصلاحية" }, { label: "الأصناف الحرجة", description: "ابدأ بالأصناف منخفضة أو نافدة" }, { label: "مراجعة FEFO", description: "رتّب الصرف حسب الأقرب انتهاءً" }],
  supplyChain: [{ label: "مراجعة التوريد", description: "راجع الاحتياج والتنبؤ" }, { label: "اقتراحات الشراء", description: "افحص التوصيات قبل الاعتماد" }],
  prescriptions: [{ label: "فتح وصفة جديدة", description: "أدخل الوصفة وأرسلها للمراجعة" }, { label: "مراجعة الوصفات", description: "تابع الحالات التي تحتاج قرارًا" }],
  finance: [{ label: "عرض التقارير", description: "ابدأ بملخص الفترة" }, { label: "دفتر الحسابات", description: "راجع القيود والتسويات" }],
  demo: [{ label: "إدارة كتالوج Demo", description: "عدّل الأصناف الاصطناعية ضمن نطاق العرض" }, { label: "سجل الفواتير التجريبية", description: "راجع عمليات البيع الوهمية وابحث فيها" }],
  insurance: [{ label: "المطالبات", description: "راجع الحالات المعلقة" }, { label: "التأمين", description: "تابع دورة المطالبة" }],
  compliance: [{ label: "حالة الاعتمادات", description: "اعرف ما هو جاهز وما يحتاج إجراءً" }, { label: "المتطلبات المنظمة", description: "راجع المتطلبات قبل التشغيل" }],
  people: [{ label: "إدارة الموظفين", description: "راجع الحسابات والصلاحيات" }, { label: "الفروع والنطاقات", description: "حدد نطاق العمل المصرح" }],
  customerCare: [{ label: "البحث عن عميل", description: "افتح سجل المتابعة المناسب" }, { label: "متابعة جديدة", description: "أنشئ تذكرة أو متابعة" }],
  operations: [{ label: "مهام الموظفين", description: "ابدأ من العمل اليومي والحالات المسندة" }, { label: "التوريد والمشتريات", description: "راجع الطلبات والتوصيات قبل الاعتماد" }, { label: "متابعة العملاء", description: "افتح مسار CRM أو التذاكر" }],
  callCentre: [{ label: "فتح تذكرة", description: "سجل طلب العميل" }, { label: "متابعة الاتصالات", description: "راجع الحالات المفتوحة" }],
  aiInsights: [{ label: "مراجعة التوصيات", description: "لا تنفذ أي توصية دون اعتماد بشري" }, { label: "تحليل الشراء", description: "افحص الاتجاهات والشذوذ" }],
  antiFraud: [{ label: "الإشارات", description: "راجع الحالات غير المعتادة" }, { label: "القضايا", description: "افتح تحقيقًا وفق الصلاحية" }],
  promotions: [{ label: "إنشاء عرض", description: "ابدأ حملة وفق الصلاحيات" }, { label: "مراجعة العروض", description: "تحقق من الحالة والفترة" }],
  compounding: [{ label: "تركيبة جديدة", description: "أدخل المكونات للمراجعة الصيدلية" }, { label: "مراجعة BOM", description: "تحقق من التكلفة والمسؤولية" }],
  hardware: [{ label: "اختبار الماسح", description: "تحقق من إدخال الباركود" }, { label: "اختبار الطابعة", description: "تحقق من الإيصال قبل التشغيل" }],
  aiGovernance: [{ label: "مراجعة استخدام الذكاء الاصطناعي", description: "تحقق من الموافقات والحدود" }, { label: "سياسة المراقبة", description: "راجع الخصوصية وعدم جمع الوسائط افتراضيًا" }],
  security: [{ label: "فحص إعدادات الدخول", description: "راجع المصادقة والجلسات" }, { label: "سجل الحماية", description: "افتح الأحداث القابلة للتدقيق" }],
  connectors: [{ label: "حالة التكاملات", description: "راجع الاعتماد قبل الاتصال الخارجي" }, { label: "إضافة جهة", description: "افتح إعداد التكامل المصرح" }],
  egyptHealthcare: [{ label: "جاهزية الحزمة المصرية", description: "راجع الأدلة قبل أي إرسال" }, { label: "مسار المطالبات", description: "افتح المسار الداخلي الآمن" }],
  icd10: [{ label: "بحث تشخيص", description: "ابحث في المرجع المساعد" }, { label: "مراجعة المصدر", description: "تحقق من الإصدار والمرجعية" }],
  catalog: [{ label: "بحث صنف", description: "ابحث في الكتالوج الموثق" }, { label: "إضافة صنف للمراجعة", description: "أرسل الصنف للموافقة" }],
};

const coreShortcuts: ReadonlyArray<{ key: string; label: string; description: string; module: string; roles: readonly string[] }> = [
  { key: "F2", label: "فاتورة بيع جديدة", description: "فتح نقطة البيع لبدء معاملة جديدة", module: "pos", roles: ["admin", "manager", "pharmacist", "cashier"] },
  { key: "F4", label: "المرتجعات", description: "فتح نقطة البيع لمراجعة المرتجع وفق الصلاحيات والسياسة", module: "pos", roles: ["admin", "manager", "pharmacist", "cashier"] },
  { key: "F6", label: "الوصفة الإلكترونية", description: "الوصول إلى التحقق والصرف المقيّد", module: "prescriptions", roles: ["admin", "manager", "pharmacist"] },
  { key: "F7", label: "المخزون", description: "فتح المخزون وFEFO", module: "inventory", roles: ["admin", "manager", "pharmacist"] },
  { key: "F8", label: "البحث الذكي", description: "تركيز البحث عن الوحدات", module: "overview", roles: ["admin", "manager", "pharmacist", "cashier"] },
  { key: "F9", label: "التقارير", description: "فتح المالية والتقارير", module: "finance", roles: ["admin", "manager"] },
  { key: "?", label: "دليل الاختصارات", description: "عرض الاختصارات المتاحة لهذا الدور", module: "overview", roles: ["admin", "manager", "pharmacist", "cashier", "user"] },
] ;

const englishNextStepByModule: Record<string, string> = {
  operations: "Choose a focused path: staff work, procurement, or customer follow-up.", overview: "Start with the critical indicators and alerts.", pos: "Search for an item, then create the invoice.", inventory: "Review critical items before requesting replenishment.", prescriptions: "Enter the prescription, then request pharmacist review.", finance: "Start with the report, then review entries and reconciliation.", people: "Choose an employee or branch to manage access.", compliance: "Review accreditation status before a regulated operation.", aiInsights: "Review the recommendation, then approve it manually before execution.", antiFraud: "Start with the signals, then open a case when appropriate.", security: "Verify security settings before changing them.", supplyChain: "Review the forecast, then send the request for review.", customerCare: "Find the customer, then open the appropriate follow-up.", assistant: "Ask the assistant or open a support ticket when needed.", policyKnowledge: "Review a policy or create a draft, then submit it for human review.",
};

const englishWorkflowActions: Record<string, WorkflowAction[]> = {
  overview: [{ label: "View indicators and alerts", description: "Start with today's operating summary" }, { label: "Open quick actions", description: "Sales, inventory, prescriptions, and reports" }],
  pos: [{ label: "Start a new sale", description: "Search for an item and add it to the basket" }, { label: "Find an item", description: "Use the name or barcode" }, { label: "Held invoices", description: "Restore a temporarily saved transaction" }, { label: "Returns and shift close", description: "Review operations under your permissions" }],
  inventory: [{ label: "Find an item", description: "Review balance, batches, and expiry" }, { label: "Critical items", description: "Start with low-stock or out-of-stock items" }, { label: "Review FEFO", description: "Prioritize dispensing by the nearest expiry" }],
  supplyChain: [{ label: "Review replenishment", description: "Review demand and forecast" }, { label: "Purchase suggestions", description: "Inspect recommendations before approval" }],
  prescriptions: [{ label: "Create a prescription", description: "Enter the prescription and submit it for review" }, { label: "Review prescriptions", description: "Follow up on cases that need a decision" }],
  finance: [{ label: "View reports", description: "Start with the period summary" }, { label: "General ledger", description: "Review entries and reconciliations" }],
  demo: [{ label: "Manage the demo catalog", description: "Edit synthetic items within the showcase scope" }, { label: "Demo invoice log", description: "Review and search simulated sales" }],
  insurance: [{ label: "Claims", description: "Review pending cases" }, { label: "Insurance", description: "Follow the claim lifecycle" }],
  compliance: [{ label: "Accreditation status", description: "See what is ready and what needs action" }, { label: "Regulatory requirements", description: "Review requirements before operation" }],
  people: [{ label: "Manage employees", description: "Review accounts and permissions" }, { label: "Branches and scopes", description: "Define the authorized operating scope" }],
  customerCare: [{ label: "Find a customer", description: "Open the appropriate follow-up record" }, { label: "New follow-up", description: "Create a ticket or follow-up" }],
  operations: [{ label: "Staff tasks", description: "Start with daily work and assigned cases" }, { label: "Procurement", description: "Review orders and suggestions before approval" }, { label: "Customer follow-up", description: "Open the CRM or ticketing path" }],
  callCentre: [{ label: "Open a ticket", description: "Record the customer request" }, { label: "Follow up calls", description: "Review open cases" }],
  aiInsights: [{ label: "Review recommendations", description: "Do not execute a recommendation without human approval" }, { label: "Purchasing analysis", description: "Inspect trends and anomalies" }],
  antiFraud: [{ label: "Signals", description: "Review unusual cases" }, { label: "Cases", description: "Open an investigation under your authority" }],
  promotions: [{ label: "Create a promotion", description: "Start a campaign under your permissions" }, { label: "Review promotions", description: "Check status and effective period" }],
  compounding: [{ label: "New formulation", description: "Enter components for pharmacist review" }, { label: "Review BOM", description: "Verify cost and accountability" }],
  hardware: [{ label: "Test scanner", description: "Verify barcode input" }, { label: "Test printer", description: "Verify the receipt before operation" }],
  aiGovernance: [{ label: "Review AI use", description: "Verify approvals and boundaries" }, { label: "Monitoring policy", description: "Review privacy and the default no-media-collection rule" }],
  security: [{ label: "Check sign-in settings", description: "Review authentication and sessions" }, { label: "Security log", description: "Open auditable events" }],
  connectors: [{ label: "Integration status", description: "Review accreditation before an external connection" }, { label: "Add an entity", description: "Open the authorized integration setup" }],
  egyptHealthcare: [{ label: "Egypt package readiness", description: "Review evidence before any submission" }, { label: "Claim workflow", description: "Open the secure internal path" }],
  icd10: [{ label: "Search diagnosis", description: "Search the reference assistant" }, { label: "Review source", description: "Verify edition and source" }],
  catalog: [{ label: "Find an item", description: "Search the verified catalog" }, { label: "Submit a new item", description: "Send the item for approval" }],
};

const englishCoreShortcuts: ReadonlyArray<{ key: string; label: string; description: string; module: string; roles: readonly string[] }> = [
  { key: "F2", label: "New sales invoice", description: "Open Point of Sale to start a new transaction", module: "pos", roles: ["admin", "manager", "pharmacist", "cashier"] },
  { key: "F4", label: "Returns", description: "Open Point of Sale to review a return under your permissions and policy", module: "pos", roles: ["admin", "manager", "pharmacist", "cashier"] },
  { key: "F6", label: "Electronic prescription", description: "Open controlled validation and dispensing", module: "prescriptions", roles: ["admin", "manager", "pharmacist"] },
  { key: "F7", label: "Inventory", description: "Open inventory and FEFO", module: "inventory", roles: ["admin", "manager", "pharmacist"] },
  { key: "F8", label: "Smart search", description: "Focus the module search", module: "overview", roles: ["admin", "manager", "pharmacist", "cashier"] },
  { key: "F9", label: "Reports", description: "Open finance and reports", module: "finance", roles: ["admin", "manager"] },
  { key: "?", label: "Shortcut guide", description: "Show the shortcuts available for this role", module: "overview", roles: ["admin", "manager", "pharmacist", "cashier", "user"] },
];

type HomeRole = "admin" | "manager" | "pharmacist" | "cashier" | "user";

type HomeMetric = {
  label: string;
  value: string;
  hint: string;
  icon: typeof Receipt;
  tone: string;
  roles: readonly HomeRole[];
  modules: readonly string[];
};

const metrics: readonly HomeMetric[] = [
  { label: "home.metric.sales", value: "—", hint: "home.metric.salesHint", icon: Receipt, tone: "bg-cyan-50 text-cyan-700", roles: ["admin", "manager", "cashier"], modules: ["pos", "finance"] },
  { label: "home.metric.inventory", value: "—", hint: "home.metric.inventoryHint", icon: Boxes, tone: "bg-violet-50 text-violet-700", roles: ["admin", "manager", "pharmacist"], modules: ["inventory", "supplyChain"] },
  { label: "home.metric.claims", value: "—", hint: "home.metric.claimsHint", icon: ClipboardCheck, tone: "bg-amber-50 text-amber-700", roles: ["admin", "manager", "pharmacist"], modules: ["insurance"] },
  { label: "home.metric.alerts", value: "—", hint: "home.metric.alertsHint", icon: AlertTriangle, tone: "bg-rose-50 text-rose-700", roles: ["admin", "manager"], modules: ["operations", "aiInsights", "antiFraud"] },
];

// These modules already contain their own task-first workspace. Repeating a generic
// action launcher above them creates visual noise and adds a redundant decision step.
const inlineTaskSurfaceModules = new Set(["pos", "inventory", "supplyChain", "prescriptions", "finance", "insurance", "promotions", "people", "catalog", "demo", "icd10", "assistant"]);

export default function Home() {
  const { user, loading, logout } = useAuth();
  const [, setLocation] = useLocation();
  const [logoutError, setLogoutError] = useState("");
  const localization = useLocalization();
  const { language, t, direction } = localization;
  const isRtl = direction === "rtl";
  const modules = useMemo(() => defaultModules.map(module => ({ ...module, label: t(`home.module.${module.id}`) })), [language, t]);
  const moduleGroups = useMemo(() => defaultModuleGroups.map(group => ({ ...group, label: t(`home.group.${group.id}`) })), [language, t]);
  const moduleGroupLabel = useCallback((moduleId: string) => moduleGroups.find(group => group.modules.includes(moduleId))?.label ?? t("home.group.other"), [moduleGroups, t]);
  const nextStepByModule = useMemo(() => language === "en" ? englishNextStepByModule : defaultNextStepByModule, [language]);
  const workflowActions = useMemo<Record<string, WorkflowAction[]>>(() => {
    const configuredActions = language === "en" ? englishWorkflowActions : defaultWorkflowActions;
    return Object.fromEntries(Object.entries(configuredActions).map(([moduleId, actions]) => [moduleId, inlineTaskSurfaceModules.has(moduleId) ? [] : actions])) as Record<string, WorkflowAction[]>;
  }, [language]);
  const salesContactUrl = import.meta.env.VITE_ALDO_SALES_CONTACT_URL as string | undefined;
  const [online, setOnline] = useState(() => typeof navigator === "undefined" ? true : navigator.onLine);
  const [offlineDrafts, setOfflineDrafts] = useState<OfflineDraft[]>([]);
  const serverDrafts = trpc.erp.offlineDrafts.listMine.useQuery(undefined, { enabled: Boolean(user) });
  const organizationsQuery = trpc.organizations.mine.useQuery(undefined, { enabled: Boolean(user) });
  const sessionInfoQuery = trpc.auth.sessionInfo.useQuery(undefined, { enabled: Boolean(user), retry: false });
  const isShowcaseSession = sessionInfoQuery.data?.authenticated === true && sessionInfoQuery.data.sessionMode === "showcase";
  const scopeBranchName = useMemo(() => {
    const branch = localization.branches.find(item => item.id === localization.branchId);
    if (!branch) return t("home.branchUnspecified");
    return language === "en" && localization.sessionMode === "showcase" ? t("home.showcaseBranch") : branch.nameAr;
  }, [language, localization.branchId, localization.branches, localization.sessionMode, t]);
  const [selectedOrganizationId, setSelectedOrganizationId] = useState<number | null>(null);
  const notificationsQuery = trpc.notifications.list.useQuery({ organizationId: selectedOrganizationId }, { enabled: Boolean(user) });
  const markNotificationRead = trpc.notifications.markRead.useMutation({ onSuccess: () => { void notificationsQuery.refetch(); } });
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const organizationTypeLabels: Record<string, string> = language === "en"
    ? { government: "Government entity", pharmacy: "Independent pharmacy", pharmacy_chain: "Pharmacy chain", distributor: "Medicine distributor", insurer: "Medical insurer", rehabilitation: "Rehabilitation center", hospital: "Hospital", laboratory: "Laboratory", radiology: "Radiology center" }
    : { government: "جهة حكومية", pharmacy: "صيدلية فردية", pharmacy_chain: "سلسلة صيدليات", distributor: "شركة توزيع دواء", insurer: "شركة تأمين طبي", rehabilitation: "مركز تأهيل وعلاج طبيعي", hospital: "مستشفى", laboratory: "معمل تحاليل", radiology: "مركز أشعة" };
  const activeOrganizationType = organizationsQuery.data?.find(item => item.id === selectedOrganizationId)?.organizationType;
  const isShowcaseAdministrator = sessionInfoQuery.data?.authenticated === true
    && sessionInfoQuery.data.showcaseAdmin === true
    && organizationsQuery.data?.some(organization => organization.id === selectedOrganizationId && organization.environment === "showcase") === true;
  const showcaseAdminCopy = language === "en"
    ? {
      title: "Isolated admin simulation",
      detail: "Review the administrator workspace using showcase-only data. Any operational change is simulated and is not saved.",
      open: "Open Admin Console",
    }
    : {
      title: "محاكاة الإدارة المعزولة",
      detail: "راجع مساحة الإدارة ببيانات العرض فقط. أي تغيير تشغيلي هو محاكاة ولا يُحفظ.",
      open: "فتح لوحة الإدارة",
    };
  const replayDraft = trpc.erp.offlineDrafts.replay.useMutation({ onSuccess: () => { void serverDrafts.refetch(); } });
  const enqueueDraft = trpc.erp.offlineDrafts.enqueue.useMutation();
  const logCaptureRisk = trpc.operations.logCaptureRisk.useMutation().mutate;
  const syncInFlight = useRef(false);
  const recentCaptureRiskAudits = useRef(new Map<CaptureRiskReason, number>());
  const [active, setActive] = useState(() => typeof window !== "undefined" && window.location.pathname === "/sales" ? "pos" : "overview");
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [assistantDraft, setAssistantDraft] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [desktopDrawerOpen, setDesktopDrawerOpen] = useState(false);
  const desktopDrawerCloseTimer = useRef<number | null>(null);
  const edgeSwipeStart = useRef<{ x: number; y: number } | null>(null);
  const drawerSwipeStart = useRef<{ x: number; y: number } | null>(null);
  const [drawerDragOffset, setDrawerDragOffset] = useState(0);
  const drawerTouchStartX = useRef<number | null>(null);
  const [scopeSwitching, setScopeSwitching] = useState(false);
  const [scopeSwitchError, setScopeSwitchError] = useState("");
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchActiveIndex, setSearchActiveIndex] = useState(-1);
  const [searchDropdownAnchor, setSearchDropdownAnchor] = useState<{ top: number; left: number; width: number } | null>(null);
  const searchDismissTimer = useRef<number | null>(null);
  const [expandedTaskModule, setExpandedTaskModule] = useState<string | null>("pos");
  const [operationsFocus, setOperationsFocus] = useState<"people" | "procurement" | "crm">("people");
  const moduleSearchRef = useRef<HTMLInputElement | null>(null);
  const handleScopeSwitch = async () => {
    const targetMode = localization.sessionMode === "showcase" ? "production" : "showcase";
    const available = targetMode === "showcase" ? localization.sessionModes.showcase : localization.sessionModes.production;
    if (!available || scopeSwitching) return;
    setScopeSwitchError("");
    setScopeSwitching(true);
    try {
      const result = await localization.switchSessionMode(targetMode);
      if (!result.success) setScopeSwitchError(targetMode === "production" ? t("home.scopeProductionUnavailable") : t("home.scopeShowcaseUnavailable"));
    } catch {
      setScopeSwitchError(t("home.scopeSwitchFailed"));
    } finally {
      setScopeSwitching(false);
    }
  };
  useEffect(() => {
    if (!mobileOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previousOverflow; };
  }, [mobileOpen]);
  const role = user?.role as HomeRole | undefined;
  const allowedModules = useMemo(() => {
    if (!role) return modules.filter(item => item.id === "overview");
  const access: Record<string, string[]> = { overview: ["admin", "manager", "pharmacist", "cashier"], pos: ["admin", "manager", "pharmacist", "cashier"], inventory: ["admin", "manager", "pharmacist"], supplyChain: ["admin", "manager", "pharmacist"], prescriptions: ["admin", "manager", "pharmacist"], insurance: ["admin", "manager", "pharmacist"], compliance: ["admin", "manager", "pharmacist"], compounding: ["admin", "manager", "pharmacist"], finance: ["admin", "manager"], demo: ["admin", "manager"], promotions: ["admin", "manager"], people: ["admin", "manager"], secondaryModules: ["admin", "manager", "pharmacist", "cashier"], operations: ["admin", "manager", "pharmacist", "cashier"], customerCare: ["admin", "manager", "pharmacist", "cashier"], callCentre: ["admin", "manager", "pharmacist", "cashier"], catalog: ["admin", "manager", "pharmacist"], icd10: ["admin", "manager", "pharmacist"], hardware: ["admin", "manager"], security: ["admin", "manager", "pharmacist", "cashier", "user"], connectors: ["admin"], aiGovernance: ["admin", "manager"], antiFraud: ["admin", "manager"], assistant: ["admin", "manager", "pharmacist", "cashier", "user"], backup: ["admin", "manager"], policyKnowledge: ["admin", "manager", "pharmacist", "cashier", "user"] };
    const scopedModuleIds = activeOrganizationType ? organizationModules[activeOrganizationType] : undefined;
    return modules.filter(item => (access[item.id] ?? (item.id === "egyptHealthcare" ? ["admin", "manager", "pharmacist"] : [])).includes(role) && (!scopedModuleIds || item.id === "hardware" || item.id === "connectors" || item.id === "aiGovernance" || item.id === "assistant" || item.id === "backup" || item.id === "policyKnowledge" || scopedModuleIds.includes(item.id)));
  }, [role, activeOrganizationType]);
  const activeModule = allowedModules.find(item => item.id === active) ?? allowedModules[0] ?? modules[0];
  const activeBranchId = localization.branchId;
  const activeJurisdictionId = localization.jurisdictionId;
  const hasCompleteOperationalScope = hasOrganizationBranchJurisdictionScope(selectedOrganizationId, activeBranchId, activeJurisdictionId);
  const isManagementRole = role === "admin" || role === "manager";
  const canSeeManagementSurfaces = isManagementRole && hasCompleteOperationalScope;
  const canSeeServiceDrafts = active === "customerCare" || active === "callCentre";
  useEffect(() => {
    if (!user || !hasCompleteOperationalScope || selectedOrganizationId === null || activeBranchId === null || activeJurisdictionId === null) return;

    const onCaptureRisk = (event: Event) => {
      const detail = event instanceof CustomEvent ? event.detail : undefined;
      if (!detail || typeof detail !== "object") return;
      const candidate = detail as { reason?: unknown; occurredAt?: unknown };
      if (typeof candidate.reason !== "string" || typeof candidate.occurredAt !== "string") return;
      if (!CAPTURE_RISK_REASONS.includes(candidate.reason as CaptureRiskReason) || Number.isNaN(Date.parse(candidate.occurredAt))) return;

      const riskType = candidate.reason as CaptureRiskReason;
      const now = Date.now();
      const lastRecordedAt = recentCaptureRiskAudits.current.get(riskType) ?? 0;
      // Repeated lifecycle callbacks can fire in bursts. Keep the server audit durable and
      // legible by coalescing the same signal for this user and scope within ten seconds.
      if (now - lastRecordedAt < 10_000) return;
      recentCaptureRiskAudits.current.set(riskType, now);
      logCaptureRisk({
        organizationId: selectedOrganizationId,
        branchId: activeBranchId,
        jurisdictionId: activeJurisdictionId,
        riskType,
        occurredAt: candidate.occurredAt,
      });
    };

    window.addEventListener("medora:capture-risk", onCaptureRisk);
    return () => window.removeEventListener("medora:capture-risk", onCaptureRisk);
  }, [activeBranchId, activeJurisdictionId, hasCompleteOperationalScope, logCaptureRisk, selectedOrganizationId, user]);
  const visibleMetrics = useMemo(
    () => role ? metrics.filter(metric => metric.roles.includes(role) && metric.modules.includes(active)) : [],
    [active, role],
  );
  const filteredModuleResults = useMemo(() => smartSearch(allowedModules, query, ["label", "searchText"]), [allowedModules, query]);
  const filteredModules = filteredModuleResults.map(result => result.item);
  const searchCorrection = filteredModuleResults.find(result => result.matchedBy === "keyboard-layout");
  const inlineSearchResults = useMemo(() => query.trim() ? filteredModuleResults.slice(0, 8) : [], [filteredModuleResults, query]);
  const searchResultCountLabel = inlineSearchResults.length
    ? language === "en" ? `${inlineSearchResults.length} permitted result${inlineSearchResults.length === 1 ? "" : "s"}` : `${inlineSearchResults.length} نتيجة مسموح بها`
    : language === "en" ? "No permitted results" : "لا توجد نتائج مسموح بها";
  const getSearchMatchLabel = (result: typeof inlineSearchResults[number]) => {
    const matchLabels = language === "en"
      ? { exact: "Exact", prefix: "Starts with", contains: "Contains", tolerant: "Close spelling" }
      : { exact: "مطابقة تامة", prefix: "يبدأ بـ", contains: "يتضمن", tolerant: "تهجئة قريبة" };
    const label = matchLabels[result.matchKind];
    return result.matchedBy === "keyboard-layout"
      ? language === "en" ? `Keyboard corrected · ${label}` : `تصحيح لوحة المفاتيح · ${label}`
      : label;
  };
  const closeSearchDropdown = () => {
    if (searchDismissTimer.current !== null) window.clearTimeout(searchDismissTimer.current);
    searchDismissTimer.current = null;
    setSearchOpen(false);
    setSearchActiveIndex(-1);
  };
  const activateSearchResult = (moduleId: string) => {
    if (!allowedModules.some(item => item.id === moduleId)) return;
    setActive(moduleId);
    setExpandedTaskModule(moduleId);
    setQuery("");
    setMobileOpen(false);
    closeSearchDropdown();
    window.setTimeout(() => document.getElementById("module-workspace")?.scrollIntoView({ behavior: "smooth", block: "start" }), 0);
  };
  const handleSearchKeyDown = (event: KeyboardEvent) => {
    if (!inlineSearchResults.length) {
      if (event.key === "Escape") closeSearchDropdown();
      return;
    }
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setSearchOpen(true);
      setSearchActiveIndex(current => (current + 1) % inlineSearchResults.length);
      return;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      setSearchOpen(true);
      setSearchActiveIndex(current => current <= 0 ? inlineSearchResults.length - 1 : current - 1);
      return;
    }
    if (event.key === "Enter") {
      event.preventDefault();
      activateSearchResult(inlineSearchResults[searchActiveIndex >= 0 ? searchActiveIndex : 0]!.item.id);
      return;
    }
    if (event.key === "Escape") {
      event.preventDefault();
      closeSearchDropdown();
    }
  };
  useEffect(() => {
    if (!query.trim()) {
      setSearchOpen(false);
      setSearchActiveIndex(-1);
      setSearchDropdownAnchor(null);
      return;
    }
    setSearchOpen(true);
    setSearchActiveIndex(current => current >= inlineSearchResults.length ? -1 : current);
    const updateAnchor = () => {
      const input = moduleSearchRef.current;
      if (!input) return;
      const rect = input.getBoundingClientRect();
      setSearchDropdownAnchor({ top: rect.bottom + 6, left: Math.max(8, rect.left - 28), width: Math.min(window.innerWidth - 16, rect.width + 56) });
    };
    updateAnchor();
    window.addEventListener("resize", updateAnchor);
    window.addEventListener("scroll", updateAnchor, true);
    return () => {
      window.removeEventListener("resize", updateAnchor);
      window.removeEventListener("scroll", updateAnchor, true);
    };
  }, [inlineSearchResults.length, query]);
  useEffect(() => {
    const onSearchKeyDown = (event: KeyboardEvent) => {
      if (event.target !== moduleSearchRef.current) return;
      handleSearchKeyDown(event);
    };
    window.addEventListener("keydown", onSearchKeyDown, true);
    return () => window.removeEventListener("keydown", onSearchKeyDown, true);
  }, [inlineSearchResults, searchActiveIndex]);
  useEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Element | null;
      if (target === moduleSearchRef.current || target?.closest("#home-smart-search-results")) return;
      closeSearchDropdown();
    };
    window.addEventListener("pointerdown", onPointerDown);
    return () => window.removeEventListener("pointerdown", onPointerDown);
  }, []);
  useEffect(() => {
    const onFocusOut = (event: FocusEvent) => {
      if (event.target !== moduleSearchRef.current) return;
      if (searchDismissTimer.current !== null) window.clearTimeout(searchDismissTimer.current);
      searchDismissTimer.current = window.setTimeout(() => {
        const focused = document.activeElement;
        if (focused === moduleSearchRef.current || (focused instanceof Element && focused.closest("#home-smart-search-results"))) return;
        setSearchOpen(false);
        setSearchActiveIndex(-1);
      }, 0);
    };
    window.addEventListener("focusout", onFocusOut);
    return () => window.removeEventListener("focusout", onFocusOut);
  }, []);
  useEffect(() => {
    const input = moduleSearchRef.current;
    if (!input) return;
    const isExpanded = searchOpen && Boolean(query.trim());
    input.setAttribute("aria-autocomplete", "list");
    input.setAttribute("aria-expanded", String(isExpanded));
    if (!isExpanded) {
      input.removeAttribute("aria-controls");
      input.removeAttribute("aria-activedescendant");
      return;
    }
    input.setAttribute("aria-controls", "home-smart-search-results");
    if (searchActiveIndex >= 0) input.setAttribute("aria-activedescendant", `home-smart-search-option-${searchActiveIndex}`);
    else input.removeAttribute("aria-activedescendant");
  }, [query, searchActiveIndex, searchOpen]);
  useEffect(() => () => {
    if (searchDismissTimer.current !== null) window.clearTimeout(searchDismissTimer.current);
  }, []);
  useEffect(() => {
    const firstOrganization = organizationsQuery.data?.[0];
    if (firstOrganization && selectedOrganizationId === null) setSelectedOrganizationId(firstOrganization.id);
  }, [organizationsQuery.data, selectedOrganizationId]);

  const availableShortcuts = useMemo(() => (language === "en" ? englishCoreShortcuts : coreShortcuts).filter(shortcut => !role || shortcut.roles.includes(role)), [language, role]);
  const overviewQuickActions = useMemo(
    () => availableShortcuts.filter(shortcut => shortcut.module !== "overview" && allowedModules.some(module => module.id === shortcut.module)),
    [allowedModules, availableShortcuts],
  );
  const primaryOverviewAction = overviewQuickActions[0];
  const commandCenterCopy = language === "en"
    ? {
      eyebrow: "MEDORA command center",
      greeting: `Welcome back, ${user?.name || "there"}`,
      detail: "Start with one approved action, then keep the rest of the system within reach.",
      primaryLabel: "Start now",
      actionsTitle: "Your next actions",
      actionsDetail: "Only the most relevant approved work is shown first.",
      safety: "The assistant provides guidance only. Sensitive decisions remain subject to human review.",
    }
    : {
      eyebrow: "مركز قيادة MEDORA",
      greeting: `أهلاً بعودتك، ${user?.name || "بك"}`,
      detail: "ابدأ بإجراء واحد مصرح به، واترك بقية النظام قريبة منك عند الحاجة.",
      primaryLabel: "ابدأ الآن",
      actionsTitle: "خطوتك التالية",
      actionsDetail: "تظهر أولاً الأعمال المصرح بها والأكثر ارتباطًا بعملك.",
      safety: "المساعد يقدم إرشادًا فقط؛ القرارات الحساسة تبقى خاضعة للمراجعة البشرية.",
    };
  const openFloatingAssistant = () => {
    const activeLabel = activeModule?.label ?? (language === "en" ? "this workspace" : "هذه المساحة");
    setAssistantDraft(language === "en" ? `Help me with ${activeLabel}. What is the safe next step?` : `ساعدني في ${activeLabel}. ما الخطوة التالية الآمنة؟`);
    setAssistantOpen(true);
    setMobileOpen(false);
  };
  const activateShortcut = (module: string) => {
    if (module === "assistant") {
      openFloatingAssistant();
      return;
    }
    if (module === "overview") {
      setActive("overview");
      setExpandedTaskModule("overview");
      setQuery("");
      return;
    }
    if (allowedModules.some(item => item.id === module)) {
      setActive(module);
      setExpandedTaskModule(module);
      setQuery("");
    }
  };
  const activateWorkflow = (module: string, actionIndex = 0) => {
    if (!allowedModules.some(item => item.id === module)) return;
    setActive(module);
    setExpandedTaskModule(module);
    if (module === "operations") setOperationsFocus(actionIndex === 1 ? "procurement" : actionIndex === 2 ? "crm" : "people");
    setQuery("");
    setMobileOpen(false);
    window.setTimeout(() => document.getElementById("module-workspace")?.scrollIntoView({ behavior: "smooth", block: "start" }), 0);
  };
  const handleEdgeSwipeStart = (event: TouchEvent<HTMLDivElement>) => {
    if (mobileOpen || event.touches.length !== 1) return;
    const touch = event.touches[0];
    if (!touch || !isAtLogicalEdge(direction, touch.clientX, window.innerWidth, 32)) return;
    edgeSwipeStart.current = { x: touch.clientX, y: touch.clientY };
  };
  const handleEdgeSwipeEnd = (event: TouchEvent<HTMLDivElement>) => {
    const start = edgeSwipeStart.current;
    edgeSwipeStart.current = null;
    const touch = event.changedTouches[0];
    if (!start || !touch) return;
    if (swipeAction(direction, touch.clientX - start.x, touch.clientY - start.y) === "open") setMobileOpen(true);
  };
  const handleDrawerSwipeStart = (event: TouchEvent<HTMLElement>) => {
    const touch = event.touches[0];
    if (touch) drawerSwipeStart.current = { x: touch.clientX, y: touch.clientY };
  };
  const handleDrawerSwipeEnd = (event: TouchEvent<HTMLElement>) => {
    const start = drawerSwipeStart.current;
    drawerSwipeStart.current = null;
    const touch = event.changedTouches[0];
    if (!start || !touch) return;
    if (swipeAction(direction, touch.clientX - start.x, touch.clientY - start.y) === "close") setMobileOpen(false);
  };
  const cancelDesktopDrawerClose = () => {
    if (desktopDrawerCloseTimer.current !== null) window.clearTimeout(desktopDrawerCloseTimer.current);
    desktopDrawerCloseTimer.current = null;
  };
  const openDesktopDrawer = () => {
    cancelDesktopDrawerClose();
    setDesktopDrawerOpen(true);
  };
  const closeDesktopDrawer = () => {
    cancelDesktopDrawerClose();
    desktopDrawerCloseTimer.current = window.setTimeout(() => setDesktopDrawerOpen(false), 140);
  };
  const continueToAccessRequest = async () => {
    setLogoutError("");
    try {
      await logout();
      setLocation("/login");
    } catch {
      setLogoutError(t("home.logoutFailed"));
    }
  };
  useEffect(() => () => cancelDesktopDrawerClose(), []);
  const previousActiveModule = useRef(active);
  useEffect(() => {
    if (previousActiveModule.current !== active) setMobileOpen(false);
    previousActiveModule.current = active;
  }, [active]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.isComposing) return;
      const target = event.target as HTMLElement | null;
      if (target?.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target?.tagName ?? "")) return;
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") { event.preventDefault(); moduleSearchRef.current?.focus(); return; }
      if (event.key === "Escape" && assistantOpen) { setAssistantOpen(false); return; }
      if (event.key === "Escape" && query.trim()) { setQuery(""); return; }
      if (event.key === "?" || (event.shiftKey && event.key === "/")) { event.preventDefault(); setShortcutsOpen(value => !value); return; }
      const shortcut = availableShortcuts.find(item => item.key.toLowerCase() === event.key.toLowerCase() && item.key !== "?");
      if (!shortcut) return;
      event.preventDefault();
      activateShortcut(shortcut.module);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [assistantOpen, availableShortcuts, allowedModules]);

  useEffect(() => {
    const isOwner = (user as { role?: string } | null)?.role === "owner";
    if (role === "admin" || isOwner) return;
    const onSelectAll = (event: KeyboardEvent) => {
      if (!(event.ctrlKey || event.metaKey) || event.key.toLowerCase() !== "a") return;
      const target = event.target as HTMLElement | null;
      if (target?.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target?.tagName ?? "")) return;
      event.preventDefault();
      event.stopPropagation();
    };
    window.addEventListener("keydown", onSelectAll, true);
    return () => window.removeEventListener("keydown", onSelectAll, true);
  }, [role, user]);

  useEffect(() => {
    const refreshDrafts = async () => {
      const drafts = await listDurableOfflineDrafts().catch(() => [] as OfflineDraft[]);
      setOfflineDrafts(drafts);
      return drafts;
    };
    const syncEligibleDrafts = async () => {
      if (!online || !user || syncInFlight.current) return;
      syncInFlight.current = true;
      try {
        const drafts = await refreshDrafts();
        for (const draft of drafts) {
          if (draft.status === "conflict" || draft.status === "failed" || !["customerCare", "callCentre"].includes(draft.module)) continue;
          await updateOfflineDraft(draft.id, { status: "syncing", lastAttemptAt: Date.now(), lastError: undefined, conflictReason: undefined });
          setOfflineDrafts(current => current.map(item => item.id === draft.id ? { ...item, status: "syncing", lastAttemptAt: Date.now() } : item));
          try {
            await enqueueDraft.mutateAsync({ idempotencyKey: draft.idempotencyKey, module: draft.module as "customerCare" | "callCentre", payload: draft.payload });
            removeOfflineDraft(draft.id);
            setOfflineDrafts(current => current.filter(item => item.id !== draft.id));
          } catch (error) {
            const message = error instanceof Error ? error.message : "sync-failed";
            const isConflict = message.toLowerCase().includes("conflict") || message.toLowerCase().includes("scope") || message.toLowerCase().includes("validation");
            await updateOfflineDraft(draft.id, { status: isConflict ? "conflict" : "failed", conflictReason: isConflict ? t("home.offlineScopeConflict") : undefined, lastError: message, lastAttemptAt: Date.now() });
            setOfflineDrafts(current => current.map(item => item.id === draft.id ? { ...item, status: isConflict ? "conflict" : "failed", conflictReason: isConflict ? t("home.offlineScopeConflict") : undefined, lastError: message } : item));
          }
        }
        await refreshDrafts();
        void serverDrafts.refetch();
      } finally {
        syncInFlight.current = false;
      }
    };
    const onOnline = () => { setOnline(true); void syncEligibleDrafts(); };
    const onOffline = () => setOnline(false);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    navigator.serviceWorker?.controller?.postMessage({ type: "ALDO_SYNC_STATUS" });
    void syncEligibleDrafts();
    return () => { window.removeEventListener("online", onOnline); window.removeEventListener("offline", onOffline); };
  }, [online, user, serverDrafts, enqueueDraft]);

  if (loading) return <div dir={direction} className="aldo-loading-shell relative grid min-h-screen place-items-center overflow-hidden bg-[#f4f7fb] px-6 text-slate-600"><div className="aldo-loading-orb aldo-loading-orb-one" aria-hidden="true" /><div className="aldo-loading-orb aldo-loading-orb-two" aria-hidden="true" /><div className="relative z-10 flex w-full max-w-sm flex-col items-center rounded-[2rem] border border-white/80 bg-white/75 px-8 py-10 text-center shadow-[0_24px_80px_rgba(13,27,42,0.12)] backdrop-blur-xl"><div className="aldo-brand-mark grid h-16 w-16 place-items-center rounded-[1.35rem] shadow-lg shadow-cyan-900/10" aria-label="MEDORA"><img src={MEDORA_LOGO_MARK} alt="MEDORA" className="h-12 w-12 object-contain" /></div><p className="mt-5 text-lg font-bold tracking-tight text-[#0d1b2a]">{t("home.brandName")}</p><p className="mt-2 text-sm text-slate-500">{t("home.loadingSession")}</p><div className="mt-6 h-1.5 w-40 overflow-hidden rounded-full bg-slate-100"><div className="aldo-loading-bar h-full w-1/2 rounded-full bg-gradient-to-l from-cyan-500 to-teal-300" /></div></div></div>;

  return (
    <ScreenCaptureProtection
      enabled={Boolean(user)}
      label={user?.name ?? t("home.authenticatedUser")}
      scopeLabel={`${scopeBranchName} · ${localization.sessionMode === "showcase" ? t("home.showcaseData") : t("home.productionData")}`}
    >
      <div dir={localization.direction} data-country={localization.countryCode} className="aldo-app-shell min-h-screen min-w-0 overflow-x-hidden text-slate-900" onTouchStart={handleEdgeSwipeStart} onTouchEnd={handleEdgeSwipeEnd}>
      <aside aria-label={t("home.mainMenu")} onMouseEnter={openDesktopDrawer} onMouseLeave={closeDesktopDrawer} onTouchStart={event => { drawerTouchStartX.current = event.touches[0]?.clientX ?? null; setDrawerDragOffset(0); }} onTouchMove={event => { const start = drawerTouchStartX.current; const current = event.touches[0]?.clientX; if (start === null || current === undefined) return; const delta = Math.max(0, isRtl ? current - start : start - current); setDrawerDragOffset(Math.min(delta, 286)); }} onTouchEnd={() => { if (drawerDragOffset > 84) setMobileOpen(false); drawerTouchStartX.current = null; setDrawerDragOffset(0); }} style={drawerDragOffset ? { transform: `translateX(${isRtl ? drawerDragOffset : -drawerDragOffset}px)`, transition: "none" } : undefined} className={cn("fixed inset-y-0 z-50 flex w-[min(286px,calc(100vw-1rem))] flex-col overflow-y-auto overscroll-contain border-slate-200 bg-[#0d1b2a] text-white shadow-2xl shadow-slate-950/25 transition-transform duration-200 motion-reduce:transition-none", isRtl ? "right-0 border-l" : "left-0 border-r", mobileOpen ? "translate-x-0" : isRtl ? "translate-x-full" : "-translate-x-full", desktopDrawerOpen ? "lg:translate-x-0" : isRtl ? "lg:translate-x-full" : "lg:-translate-x-full")}>

        <div className="flex min-h-20 shrink-0 items-center justify-between border-b border-white/10 px-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-3"><div className="aldo-brand-mark grid h-10 w-10 shrink-0 place-items-center rounded-2xl" aria-label="MEDORA"><img src={MEDORA_LOGO_MARK} alt="MEDORA" className="h-8 w-8 object-contain" /></div><div className="min-w-0"><p className="truncate text-sm font-bold tracking-tight">{t("home.brandName")}</p><p className="truncate text-[11px] text-cyan-200/70">MEDORA | Health Care Eco System</p></div></div>
          <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 lg:hidden" onClick={() => setMobileOpen(false)}><X className="h-5 w-5" /></Button>
        </div>
        <div className="px-4 py-5"><p className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">{t("home.workspace")}</p><div className="mb-4 rounded-2xl border border-white/10 bg-white/5 p-3"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="truncate text-sm font-semibold text-white">{user?.name || t("home.authenticatedUser")}</p><p className="mt-1 text-[11px] text-cyan-200/70">{user?.role || t("home.noRole")}{isShowcaseSession ? ` · ${t("home.showcaseAccount")}` : ` · ${t("home.organizationAccount")}`}</p></div><UserRound className="mt-0.5 h-4 w-4 shrink-0 text-cyan-200" /></div><Button type="button" variant="outline" size="sm" className="mt-3 w-full border-white/20 bg-transparent text-white hover:bg-white/10 hover:text-white" onClick={async () => { setLogoutError(""); try { await logout(); setLocation("/login"); } catch { setLogoutError(t("home.logoutFailed")); } }}>{t("home.logout")}</Button>{logoutError && <p role="alert" className="mt-2 text-[11px] leading-5 text-rose-200">{logoutError}</p>}</div><p className="mb-3 px-3 text-xs text-cyan-200/70">{user ? `${t("home.role")}: ${user.role}` : t("home.loginRequired")}</p><nav aria-label={t("home.systemModules")} className="space-y-4">{moduleGroups.map(group => { const groupModules = filteredModules.filter(item => group.modules.includes(item.id)); if (!groupModules.length) return null; return <section key={group.id}><p className="mb-1 px-3 text-[11px] font-semibold text-slate-500">{group.label}</p><div className="space-y-1">{groupModules.map(item => { const Icon = item.icon; const selected = active === item.id; return <div key={item.id} className="space-y-1"><button type="button" key={item.id} onClick={() => { if (item.id === "assistant") { openFloatingAssistant(); return; } setActive(item.id); setExpandedTaskModule(expandedTaskModule === item.id ? null : item.id); setQuery(""); }} aria-current={selected ? "page" : undefined} aria-expanded={selected ? expandedTaskModule === item.id : undefined} className={cn("flex min-h-11 w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition", isRtl ? "text-right" : "text-left", selected ? "bg-cyan-400 font-semibold text-[#0d1b2a] shadow-lg shadow-cyan-950/20" : "text-slate-300 hover:bg-white/10 hover:text-white")}><Icon className="h-[18px] w-[18px] shrink-0" /><span className="min-w-0 truncate">{item.label}</span>{workflowActions[item.id]?.length ? <ChevronDown className={cn(isRtl ? "mr-auto" : "ml-auto", "h-4 w-4 shrink-0 transition-transform", selected && expandedTaskModule === item.id && "rotate-180")} /> : selected && (isRtl ? <ChevronLeft className="mr-auto h-4 w-4 shrink-0" /> : <ChevronRight className="ml-auto h-4 w-4 shrink-0" />)}</button>{selected && expandedTaskModule === item.id && workflowActions[item.id] && <div className={cn("space-y-1 border-cyan-300/30", isRtl ? "mr-3 border-r pr-2" : "ml-3 border-l pl-2")} aria-label={`${t("home.actionsFor")} ${item.label}`}>{workflowActions[item.id].map((action, actionIndex) => <button type="button" key={`${item.id}-${actionIndex}`} onClick={() => activateWorkflow(item.id, actionIndex)} className={cn("w-full rounded-lg px-3 py-2 text-[11px] text-cyan-100 transition hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300", isRtl ? "text-right" : "text-left")}><span className="block font-semibold">{action.label}</span><span className="mt-0.5 block text-[10px] text-slate-400">{action.description}</span></button>)}</div>}</div>; })}</div></section>; })}</nav></div>
        <div className="mt-auto border-t border-white/10 p-4"><div className="rounded-2xl bg-white/5 p-4"><div className="mb-3 flex items-center gap-2 text-cyan-200"><LockKeyhole className="h-4 w-4" /><span className="text-xs font-semibold">{t("home.institutionalProtection")}</span></div><p className="text-xs leading-6 text-slate-400">{t("home.protectionDetail")}</p></div></div>
      </aside>
      <div aria-hidden="true" onMouseEnter={openDesktopDrawer} className={cn("fixed inset-y-0 z-40 hidden w-4 lg:block", isRtl ? "right-0" : "left-0")} />
      {mobileOpen && <button aria-label={t("home.closeMenu")} className="fixed inset-0 z-40 bg-slate-950/45 backdrop-blur-[1px] lg:hidden" onClick={() => setMobileOpen(false)} />}

      <main className={cn("min-w-0 overflow-x-hidden transition-[margin] duration-200 motion-reduce:transition-none", desktopDrawerOpen && (isRtl ? "lg:mr-[286px]" : "lg:ml-[286px]"))}>
        <header className="sticky top-0 z-20 isolate border-b border-slate-200/80 bg-white/95 px-3 py-3 backdrop-blur-xl sm:px-8 sm:py-4">{isShowcaseSession && <aside data-testid="showcase-read-only-banner" role="status" aria-live="polite" className={cn("mb-3 flex min-w-0 flex-wrap items-start gap-3 rounded-xl border border-amber-300 bg-amber-100 px-3 py-2.5 text-amber-950 shadow-sm", isRtl ? "text-right" : "text-left")}><span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-amber-500 text-white shadow-sm"><LockKeyhole aria-hidden="true" className="h-4 w-4" /></span><div className="min-w-0 flex-1"><p className="text-sm font-bold">{t("home.readOnlyBannerTitle")}</p><p className="mt-0.5 text-xs leading-5 text-amber-900">{t("home.readOnlyBannerDetail")}</p></div><Button data-testid="showcase-read-only-access-action" type="button" size="sm" variant="outline" title={t("home.readOnlyAccessDetail")} className={cn("h-8 shrink-0 border-amber-400 bg-white/85 text-xs font-semibold text-amber-950 hover:bg-white", isRtl ? "sm:mr-auto" : "sm:ml-auto")} onClick={() => void continueToAccessRequest()}>{t("home.readOnlyBannerSignIn")}</Button></aside>}<div className="flex min-w-0 flex-wrap items-center gap-2 sm:gap-3"><Button variant="outline" size="icon" className="shrink-0 lg:hidden" aria-label={t("home.mainMenu")} onClick={() => setMobileOpen(true)}><Menu className="h-5 w-5" /></Button><div className="min-w-0 flex-1 basis-[calc(100%-3rem)] sm:basis-auto"><p className="truncate text-[11px] font-medium text-slate-500 sm:text-xs">{t("home.breadcrumbHome")} / {moduleGroupLabel(activeModule.id)} / {activeModule.label}</p><h1 className="truncate text-xl font-bold tracking-tight sm:text-2xl">{activeModule.label}</h1><p className="truncate text-xs text-slate-500">{nextStepByModule[activeModule.id] ?? t("home.nextStep")}</p></div><div className="order-last flex basis-full items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 sm:order-none sm:w-64 sm:basis-auto"><Search className="h-4 w-4 shrink-0 text-slate-400" /><Input ref={moduleSearchRef} value={query} onChange={e => setQuery(e.target.value)} placeholder={t("home.searchPlaceholder")} aria-label={t("home.smartSearch")} className="h-9 border-0 bg-transparent px-0 text-sm shadow-none focus-visible:ring-0" />{query.trim() && <span className="sr-only" aria-live="polite">{searchCorrection ? describeSearchMatch(searchCorrection) : filteredModules.length ? `${filteredModules.length} ${t("home.results")}` : t("home.noResults")}</span>}</div>{localization.branches.length > 0 && <select value={localization.branchId ?? ""} onChange={event => localization.setBranchId(Number(event.target.value))} aria-label={t("home.selectBranch")} className="hidden h-9 max-w-40 rounded-lg border border-slate-200 bg-white px-2 text-xs sm:block"><option value="" disabled>{t("home.selectBranch")}</option>{localization.branches.map(branch => <option key={branch.id} value={branch.id}>{language === "en" && localization.sessionMode === "showcase" ? t("home.showcaseBranch") : branch.nameAr} · {branch.countryCode}</option>)}</select>}<Badge variant="outline" className="hidden bg-white px-3 py-2 sm:flex">{localization.countryCode} · {localization.currencyCode}</Badge><LanguageSwitcher compact /><Badge variant="outline" className={cn("hidden px-3 py-2 text-xs sm:flex", online ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700")}>{online ? t("home.online") : t("home.limitedMode")}</Badge><div className={cn("flex shrink-0 items-center gap-1.5 sm:gap-2", isRtl ? "ml-auto" : "mr-auto")}><Button variant="outline" size="icon" className="bg-white" aria-label={t("home.shortcuts")} title={t("home.shortcuts")} onClick={() => setShortcutsOpen(true)}><Keyboard className="h-4 w-4" /></Button><div className="relative"><Button variant="outline" size="icon" className="relative bg-white" aria-label={t("home.notifications")} onClick={() => setNotificationOpen(value => !value)}><Bell className="h-4 w-4" />{Boolean(notificationsQuery.data?.unreadCount) && <span className={cn("absolute -top-1 grid min-h-4 min-w-4 place-items-center rounded-full bg-rose-500 px-1 text-[9px] font-bold text-white", isRtl ? "-left-1" : "-right-1")}>{notificationsQuery.data?.unreadCount}</span>}</Button>{notificationOpen && <div className={cn("absolute top-11 z-50 w-[min(22rem,calc(100vw-2rem))] rounded-2xl border border-slate-200 bg-white p-3 shadow-xl", isRtl ? "left-0 text-right" : "right-0 text-left")}><div className="mb-2 flex items-center justify-between"><p className="text-sm font-bold text-slate-900">{t("home.notifications")}</p><button className="text-xs text-slate-400 hover:text-slate-700" onClick={() => setNotificationOpen(false)}>{t("home.close")}</button></div>{!user ? <p className="rounded-xl bg-slate-50 p-3 text-xs leading-5 text-slate-500">{t("home.notificationsLogin")}</p> : notificationsQuery.isLoading ? <p className="p-3 text-xs text-slate-500">{t("home.loadingNotifications")}</p> : notificationsQuery.data?.items.length ? <div className="max-h-80 space-y-2 overflow-auto">{notificationsQuery.data.items.map(item => <button key={item.id} className={cn("w-full rounded-xl border p-3 transition hover:bg-slate-50", isRtl ? "text-right" : "text-left", item.isRead ? "border-slate-100 bg-white" : "border-cyan-100 bg-cyan-50/50")} onClick={() => { if (!item.isRead) markNotificationRead.mutate({ notificationId: item.id }); }}><div className="flex items-start justify-between gap-3"><span className="text-sm font-semibold text-slate-900">{item.title}</span><span className="text-[10px] text-slate-400">{item.severity}</span></div><p className="mt-1 text-xs leading-5 text-slate-600">{item.body}</p></button>)}</div> : <p className="rounded-xl bg-slate-50 p-3 text-xs leading-5 text-slate-500">{t("home.noNotifications")}</p>}</div>}</div></div>{user ? <Badge variant="secondary" className="hidden gap-2 px-3 py-2 sm:flex"><span className="h-2 w-2 rounded-full bg-emerald-500" />{user.name || t("home.user")}</Badge> : <Button onClick={() => { window.location.href = "/login"; }} className="hidden bg-[#0d1b2a] sm:flex">{t("home.login")}</Button>}</div><div className="mt-3 flex min-w-0 flex-wrap items-center gap-2 rounded-xl border border-cyan-100 bg-cyan-50/70 px-3 py-2 text-xs text-slate-700" role="status" aria-live="polite"><span className="font-semibold text-cyan-950">{t("home.currentScope")}</span><span className="max-w-[12rem] truncate font-medium">{scopeBranchName}</span><span className="text-slate-400">·</span><span className={cn("rounded-full px-2 py-1 font-semibold", localization.sessionMode === "showcase" ? "bg-amber-100 text-amber-900" : "bg-emerald-100 text-emerald-800")}>{localization.sessionMode === "showcase" ? t("home.showcaseData") : t("home.productionData")}</span><Button type="button" size="sm" variant="outline" disabled={scopeSwitching || !(localization.sessionMode === "showcase" ? localization.sessionModes.production : localization.sessionModes.showcase)} onClick={() => void handleScopeSwitch()} className={cn("h-8 border-cyan-200 bg-white text-xs hover:bg-cyan-100", isRtl ? "mr-auto" : "ml-auto")}>{scopeSwitching ? <><Loader2 className={cn("h-3.5 w-3.5 animate-spin", isRtl ? "ml-1" : "mr-1")} />{t("home.switching")}</> : localization.sessionMode === "showcase" ? t("home.switchToProduction") : t("home.switchToShowcase")}</Button>{scopeSwitchError && <span className="basis-full text-[11px] text-rose-700">{scopeSwitchError}</span>}{localization.branchSwitching && <span className="flex items-center gap-1 text-cyan-800"><Loader2 className="h-3.5 w-3.5 animate-spin" />{t("home.loadingBranch")}</span>}</div></header>
        {searchOpen && query.trim() && searchDropdownAnchor && <div id="home-smart-search-results" role="listbox" aria-label={language === "en" ? "Smart search results" : "نتائج البحث الذكي"} dir={isRtl ? "rtl" : "ltr"} style={searchDropdownAnchor} className={cn("fixed z-50 max-h-[min(24rem,calc(100vh-1rem))] overflow-y-auto rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl shadow-slate-900/10", isRtl ? "text-right" : "text-left")}><p className="px-2 py-1.5 text-[11px] font-medium text-slate-500">{searchResultCountLabel}</p>{inlineSearchResults.length ? inlineSearchResults.map((result, index) => { const Icon = result.item.icon; return <button id={`home-smart-search-option-${index}`} key={result.item.id} type="button" role="option" aria-selected={searchActiveIndex === index} onMouseDown={event => event.preventDefault()} onClick={() => activateSearchResult(result.item.id)} className={cn("flex w-full items-center gap-3 rounded-lg px-2.5 py-2.5 text-sm transition-colors hover:bg-cyan-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500", searchActiveIndex === index && "bg-cyan-50", isRtl ? "text-right" : "text-left")}><span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-slate-100 text-cyan-800"><Icon className="h-4 w-4" /></span><span className="min-w-0 flex-1"><span className="block truncate font-semibold text-slate-900">{result.item.label}</span><span className="mt-0.5 block truncate text-[11px] text-slate-500">{result.item.searchText}</span></span><Badge variant="outline" className={cn("shrink-0 border-cyan-200 bg-cyan-50 text-[10px] font-medium text-cyan-800", result.matchedBy === "keyboard-layout" && "border-violet-200 bg-violet-50 text-violet-800")}>{getSearchMatchLabel(result)}</Badge></button>; }) : <p className="rounded-lg bg-slate-50 px-3 py-3 text-xs leading-5 text-slate-500">{language === "en" ? "Try a different spelling or keyboard layout." : "جرّب تهجئة أو تخطيط لوحة مفاتيح مختلفاً."}</p>}</div>}
        <div className="mx-auto max-w-[1500px] space-y-6 p-4 sm:p-8">
	          {isShowcaseSession && <Card className={cn("border-amber-200 bg-amber-50/80 shadow-sm", isRtl ? "text-right" : "text-left")} role="status"><CardContent className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-bold text-amber-950">{t("home.showcaseTitle")}</p><p className="mt-1 text-sm leading-6 text-amber-900">{t("home.showcaseDetail")}</p></div><Badge variant="outline" className="w-fit border-amber-300 bg-white text-amber-900">{t("home.nonProductionSimulation")}</Badge></CardContent></Card>}
	          {isShowcaseAdministrator && <Card data-testid="showcase-admin-console-entry" className={cn("border-violet-200 bg-violet-50/80 shadow-sm", isRtl ? "text-right" : "text-left")} role="status"><CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-bold text-violet-950">{showcaseAdminCopy.title}</p><p className="mt-1 max-w-3xl text-sm leading-6 text-violet-900">{showcaseAdminCopy.detail}</p></div><Button asChild className="w-full shrink-0 bg-violet-800 hover:bg-violet-700 sm:w-auto"><a href="/admin"><ShieldCheck className={cn("h-4 w-4", isRtl ? "ml-2" : "mr-2")} />{showcaseAdminCopy.open}</a></Button></CardContent></Card>}
	          {user && active === "overview" && <Card className={cn("overflow-hidden border-0 bg-[#0d1b2a] text-white shadow-[0_18px_50px_rgba(13,27,42,0.18)]", isRtl ? "text-right" : "text-left")}><CardContent className="relative overflow-hidden p-5 sm:p-6"><div aria-hidden="true" className={cn("absolute -top-16 h-48 w-48 rounded-full bg-cyan-400/15 blur-3xl", isRtl ? "-left-16" : "-right-16")} /><div className="relative grid gap-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center"><div className="min-w-0"><div className="mb-3 flex flex-wrap items-center gap-2"><Badge className="border-0 bg-cyan-400/15 px-2.5 py-1 text-[11px] font-semibold text-cyan-100 hover:bg-cyan-400/15">{commandCenterCopy.eyebrow}</Badge><span className="text-xs text-slate-400">{scopeBranchName} · {localization.sessionMode === "showcase" ? t("home.showcaseData") : t("home.productionData")}</span></div><div className="flex items-start gap-3"><span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-cyan-400 text-[#0d1b2a] shadow-lg shadow-cyan-400/15"><Sparkles className="h-5 w-5" /></span><div><p className="text-xl font-bold tracking-tight text-white sm:text-2xl">{commandCenterCopy.greeting}</p><p className="mt-1 max-w-2xl text-sm leading-6 text-slate-300">{commandCenterCopy.detail}</p></div></div><p className="mt-4 flex items-start gap-2 text-xs leading-5 text-cyan-100/80"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-cyan-300" />{commandCenterCopy.safety}</p></div><div className="flex flex-col gap-2 sm:flex-row lg:flex-col">{primaryOverviewAction && <Button type="button" onClick={() => activateShortcut(primaryOverviewAction.module)} className="min-h-11 bg-cyan-400 px-4 font-semibold text-[#0d1b2a] hover:bg-cyan-300"><span className="max-w-44 truncate">{commandCenterCopy.primaryLabel}: {primaryOverviewAction.label}</span>{isRtl ? <ChevronLeft className="mr-2 h-4 w-4 shrink-0" /> : <ChevronRight className="ml-2 h-4 w-4 shrink-0" />}</Button>}<Button type="button" variant="outline" onClick={() => activateShortcut("assistant")} className="min-h-11 border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white"><LifeBuoy className={cn("h-4 w-4", isRtl ? "ml-2" : "mr-2")} />{t("home.openAssistant")}</Button></div></div></CardContent></Card>}
	          {user && active === "overview" && <Card className={cn("border-0 bg-white shadow-sm shadow-slate-200/70", isRtl ? "text-right" : "text-left")}><CardHeader className="flex-row items-center justify-between gap-4 space-y-0"><div><p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-cyan-700">{t("home.quickStart")}</p><CardTitle className="mt-1 text-xl tracking-tight">{commandCenterCopy.actionsTitle}</CardTitle><p className="mt-1 text-sm leading-6 text-slate-500">{commandCenterCopy.actionsDetail}</p></div><Badge variant="outline" className="shrink-0 border-slate-200 bg-slate-50 text-slate-700">{user.role}</Badge></CardHeader><CardContent className="space-y-3"><div className="grid gap-3 lg:grid-cols-3">{overviewQuickActions.slice(0, 3).map(shortcut => { const Icon = allowedModules.find(module => module.id === shortcut.module)?.icon ?? Sparkles; return <button key={shortcut.key} type="button" onClick={() => activateShortcut(shortcut.module)} className={cn("group relative flex min-h-28 items-start gap-3 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:-translate-y-0.5 hover:border-cyan-300 hover:bg-white hover:shadow-lg hover:shadow-cyan-900/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500", isRtl ? "text-right" : "text-left")}><span aria-hidden="true" className={cn("absolute top-0 h-full w-1 bg-cyan-500 opacity-0 transition-opacity group-hover:opacity-100", isRtl ? "right-0" : "left-0")} /><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-cyan-50 text-cyan-700"><Icon className="h-5 w-5" /></span><span className="min-w-0 flex-1"><span className="block truncate text-sm font-semibold text-slate-900">{shortcut.label}</span><span className="mt-1 block text-xs leading-5 text-slate-500">{shortcut.description}</span></span>{isRtl ? <ChevronLeft className="mt-1 mr-auto h-4 w-4 shrink-0 text-slate-300 transition group-hover:text-cyan-600" /> : <ChevronRight className="mt-1 ml-auto h-4 w-4 shrink-0 text-slate-300 transition group-hover:text-cyan-600" />}</button>; })}</div>{overviewQuickActions.length > 3 && <details className="group rounded-2xl border border-slate-200 bg-slate-50/70"><summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 px-4 text-sm font-semibold text-slate-700 marker:content-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-cyan-500"><span>{t("home.moreQuickActions")}</span><ChevronDown className="h-4 w-4 text-slate-400 transition-transform duration-200 group-open:rotate-180 motion-reduce:transition-none" /></summary><div className="grid gap-3 border-t border-slate-200 p-3 sm:grid-cols-2 lg:grid-cols-3">{overviewQuickActions.slice(3).map(shortcut => { const Icon = allowedModules.find(module => module.id === shortcut.module)?.icon ?? Sparkles; return <button key={shortcut.key} type="button" onClick={() => activateShortcut(shortcut.module)} className={cn("group/item flex min-h-20 items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-cyan-300 hover:bg-cyan-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500", isRtl ? "text-right" : "text-left")}><span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-slate-50 text-cyan-700"><Icon className="h-4 w-4" /></span><span className="min-w-0 flex-1"><span className="block truncate text-sm font-semibold text-slate-900">{shortcut.label}</span><span className="mt-1 block truncate text-xs text-slate-500">{shortcut.description}</span></span>{isRtl ? <ChevronLeft className="mr-auto h-4 w-4 shrink-0 text-slate-300 transition group-hover/item:text-cyan-600" /> : <ChevronRight className="ml-auto h-4 w-4 shrink-0 text-slate-300 transition group-hover/item:text-cyan-600" />}</button>; })}</div></details>}</CardContent></Card>}
          {user && active !== "overview" && workflowActions[activeModule.id] && <Card id="module-workspace" className={cn("border-cyan-100 bg-white shadow-sm shadow-slate-200/60", active === "operations" && "border-violet-200 bg-violet-50/40", isRtl ? "text-right" : "text-left")}><CardHeader className="flex-row items-start justify-between gap-4 space-y-0"><div><CardTitle className="text-lg">{t("home.whatNext")}</CardTitle><p className="mt-1 text-sm text-slate-500">{t("home.workspaceDetail").replace("{module}", activeModule.label)}</p></div><Badge variant="outline" className={cn("shrink-0", active === "operations" ? "border-violet-200 bg-violet-50 text-violet-800" : "border-cyan-200 bg-cyan-50 text-cyan-800")}>{active === "operations" ? t("home.operationsCenter") : t("home.directActions")}</Badge></CardHeader><CardContent className="space-y-3"><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{workflowActions[activeModule.id].slice(0, 3).map((action, index) => <button key={`${activeModule.id}-${index}`} type="button" onClick={() => activateWorkflow(activeModule.id, index)} className={cn("group min-h-24 rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:-translate-y-0.5 hover:border-cyan-300 hover:bg-cyan-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500", isRtl ? "text-right" : "text-left")}><span className="flex items-center gap-2 text-sm font-semibold text-slate-900"><span className="grid h-7 w-7 place-items-center rounded-lg bg-white text-cyan-700 shadow-sm">{index + 1}</span>{action.label}</span><span className="mt-2 block text-xs leading-5 text-slate-500">{action.description}</span><span className="mt-3 block text-xs font-semibold text-cyan-700">{t("home.openArea")} {isRtl ? <ChevronLeft className="mr-1 inline h-3.5 w-3.5" /> : <ChevronRight className="ml-1 inline h-3.5 w-3.5" />}</span></button>)}</div>{workflowActions[activeModule.id].length > 3 && <details className={cn("group rounded-2xl border border-slate-200 bg-slate-50/70", active === "operations" && "border-violet-200 bg-violet-50/50")}><summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 px-4 text-sm font-semibold text-slate-700 marker:content-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-cyan-500"><span>{t("home.moreWorkflowActions")}</span><span className="flex items-center gap-2 text-xs font-normal text-slate-500"><span>{t("home.moreWorkflowActionsDetail")}</span><ChevronDown className="h-4 w-4 transition-transform duration-200 group-open:rotate-180 motion-reduce:transition-none" /></span></summary><div className="grid gap-3 border-t border-slate-200 p-3 sm:grid-cols-2 lg:grid-cols-3">{workflowActions[activeModule.id].slice(3).map((action, index) => <button key={`${activeModule.id}-${index + 3}`} type="button" onClick={() => activateWorkflow(activeModule.id, index + 3)} className={cn("group/item min-h-24 rounded-2xl border border-slate-200 bg-white p-4 transition hover:-translate-y-0.5 hover:border-cyan-300 hover:bg-cyan-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500", isRtl ? "text-right" : "text-left")}><span className="flex items-center gap-2 text-sm font-semibold text-slate-900"><span className="grid h-7 w-7 place-items-center rounded-lg bg-slate-50 text-cyan-700 shadow-sm">{index + 4}</span>{action.label}</span><span className="mt-2 block text-xs leading-5 text-slate-500">{action.description}</span><span className="mt-3 block text-xs font-semibold text-cyan-700">{t("home.openArea")} {isRtl ? <ChevronLeft className="mr-1 inline h-3.5 w-3.5" /> : <ChevronRight className="ml-1 inline h-3.5 w-3.5" />}</span></button>)}</div></details>}</CardContent></Card>}
          {user && active === "overview" && canSeeManagementSurfaces && <OperationalWorkflowGuide language={language === "en" ? "en" : "ar"} direction={direction} scopeLabel={scopeBranchName} primaryActionLabel={primaryOverviewAction?.label} onOpenPrimaryAction={() => { if (primaryOverviewAction) activateShortcut(primaryOverviewAction.module); }} onOpenAssistant={() => activateShortcut("assistant")} />}
          {user && active === "overview" && canSeeManagementSurfaces && <ManagerOperationalIntelligence organizationId={selectedOrganizationId} branchId={activeBranchId} jurisdictionId={activeJurisdictionId} canManage={canSeeManagementSurfaces} onOpenModule={module => { setActive(module); setExpandedTaskModule(module); window.setTimeout(() => document.getElementById("module-workspace")?.scrollIntoView({ behavior: "smooth", block: "start" }), 0); }} />}
          {user && active !== "overview" && canSeeManagementSurfaces && <IntegrationStatusStrip />}
          {user && canSeeServiceDrafts && <OfflineStatusIndicator online={online} drafts={offlineDrafts} serverPendingCount={serverDrafts.data?.length ?? 0} onRefresh={async () => { await serverDrafts.refetch(); const latest = await listDurableOfflineDrafts(); setOfflineDrafts(latest); }} onRetryConflict={async () => { const latest = await listDurableOfflineDrafts(); setOfflineDrafts(latest); }} />}
          {user && active !== "overview" && visibleMetrics.length > 0 && <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{visibleMetrics.map(metric => { const Icon = metric.icon; return <Card key={metric.label} className={cn("border-0 shadow-sm shadow-slate-200/60", isRtl ? "text-right" : "text-left")}><CardContent className="p-5"><div className="mb-5 flex items-start justify-between"><div className={cn("grid h-11 w-11 place-items-center rounded-2xl", metric.tone)}><Icon className="h-5 w-5" /></div><span className="text-xs font-medium text-slate-400">{t("home.today")}</span></div><p className="text-sm text-slate-500">{t(metric.label)}</p><p className="mt-1 text-3xl font-bold tracking-tight">{metric.value}</p><p className="mt-2 text-xs text-slate-400">{t(metric.hint)}</p></CardContent></Card>; })}</section>}
          {shortcutsOpen && <Card className={cn("border-cyan-100 bg-white shadow-sm shadow-slate-200/60", isRtl ? "text-right" : "text-left")} role="dialog" aria-modal="false" aria-labelledby="shortcuts-title"><CardHeader className="flex-row items-center justify-between space-y-0"><div><CardTitle id="shortcuts-title" className="flex items-center gap-2 text-lg"><Keyboard className="h-5 w-5 text-cyan-700" />{t("home.shortcutsTitle")}</CardTitle><p className="mt-1 text-sm text-slate-500">{t("home.shortcutsDetail")}</p></div><Button variant="ghost" size="sm" onClick={() => setShortcutsOpen(false)}>{t("home.close")}</Button></CardHeader><CardContent className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">{availableShortcuts.map(shortcut => <button key={shortcut.key} onClick={() => { activateShortcut(shortcut.module); setShortcutsOpen(false); }} className={cn("flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 transition hover:border-cyan-300 hover:bg-cyan-50", isRtl ? "text-right" : "text-left")}><kbd className="min-w-10 rounded-lg border border-slate-300 bg-white px-2 py-1 text-center text-xs font-bold text-slate-700">{shortcut.key}</kbd><span><span className="block text-sm font-semibold text-slate-900">{shortcut.label}</span><span className="mt-1 block text-xs leading-5 text-slate-500">{shortcut.description}</span></span></button>)}</CardContent></Card>}
          {user && active !== "overview" && canSeeManagementSurfaces && <Card className="border-cyan-100 bg-white shadow-sm shadow-slate-200/60"><CardHeader className="flex-row items-center justify-between space-y-0"><div><CardTitle className="text-lg">{t("home.organizationWorkspace")}</CardTitle><p className="mt-1 text-sm text-slate-500">{t("home.organizationDetail")}</p></div><Badge variant="outline" className="border-cyan-200 bg-cyan-50 text-cyan-800">{t("home.institutionalIsolation")}</Badge></CardHeader><CardContent>{organizationsQuery.isLoading ? <p className="text-sm text-slate-500">{t("home.loadingOrganizations")}</p> : organizationsQuery.data?.length ? <div className="flex flex-wrap items-center gap-3"><select value={selectedOrganizationId ?? ""} onChange={event => setSelectedOrganizationId(Number(event.target.value))} aria-label={t("home.selectOrganization")} className="h-10 min-w-64 rounded-xl border border-slate-200 bg-white px-3 text-sm"><option value="" disabled>{t("home.selectOrganization")}</option>{organizationsQuery.data.map(organization => <option key={organization.id} value={organization.id}>{organization.displayName} · {organizationTypeLabels[organization.organizationType] ?? organization.organizationType}</option>)}</select><div className="rounded-xl bg-slate-50 px-4 py-2 text-xs text-slate-600">{organizationsQuery.data.find(item => item.id === selectedOrganizationId)?.countryCode ?? "—"} · {t("home.serverEnforced")}</div><div className="flex flex-wrap items-center gap-2 text-xs text-slate-600"><span className="rounded-full bg-cyan-50 px-3 py-1 text-cyan-800">{t("home.branch")}: {scopeBranchName}</span><span className="rounded-full bg-slate-100 px-3 py-1">{t("home.jurisdiction")}: {hasJurisdictionScope(localization.jurisdictionId) ? (isShowcaseSession ? t("home.showcaseJurisdiction") : t("home.serverApproved")) : t("home.notSpecified")}</span></div></div> : <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">{t("home.noOrganizationScope")}</div>}</CardContent></Card>}
          {user && active !== "overview" && <LazyWorkspace resetKey={buildWorkspaceResetKey(active, selectedOrganizationId, activeBranchId, activeJurisdictionId)}><ModulePanel active={active} organizationId={selectedOrganizationId} branchId={activeBranchId} jurisdictionId={activeJurisdictionId} operationsFocus={operationsFocus} canManagePolicies={role === "admin" || isShowcaseAdministrator} /></LazyWorkspace>}
          {offlineDrafts.length > 0 && <Card className="border-amber-200 bg-amber-50/60 shadow-sm"><CardHeader className="flex-row items-center justify-between space-y-0"><div><CardTitle className="text-lg text-amber-950">الوضع المحدود والمسودات المحلية</CardTitle><p className="mt-1 text-sm text-amber-800">يُسمح بالمسودات غير المنظمة فقط. البيع والوصفات والفوترة وإعادة التشغيل تبقى محجوبة حتى عودة الاتصال والتحقق من الصلاحيات والجهاز.</p></div><Badge variant="outline" className="border-amber-300 bg-white text-amber-800">{offlineDrafts.length} مسودة</Badge></CardHeader><CardContent className="space-y-2">{offlineDrafts.slice(0, 4).map(draft => <div key={draft.id} className="flex items-center justify-between gap-3 rounded-xl border border-amber-200 bg-white px-3 py-2 text-sm"><div><span className="font-medium text-slate-800">{draft.module}</span><span className="mr-2 text-xs text-slate-500">{draft.status === "conflict" ? "تعارض يحتاج مراجعة" : "في الانتظار"}</span></div><Button variant="ghost" size="sm" className="text-amber-800" onClick={() => { removeOfflineDraft(draft.id); setOfflineDrafts(current => current.filter(item => item.id !== draft.id)); }}>إزالة</Button></div>)}</CardContent></Card>}
          {user && canSeeServiceDrafts && (serverDrafts.data?.length ?? 0) > 0 && <Card className="border-cyan-200 bg-cyan-50/50 shadow-sm"><CardHeader className="flex-row items-center justify-between space-y-0"><div><CardTitle className="text-lg text-cyan-950">مسودات الخادم القابلة لإعادة التشغيل</CardTitle><p className="mt-1 text-sm text-cyan-800">هذه المسودات تخص خدمة العملاء ومركز الاتصال فقط، ولا تشمل البيع أو الوصفات أو الفوترة. إعادة التشغيل تتطلب اتصالاً وجهازاً موثوقاً.</p></div><Badge variant="outline" className="border-cyan-300 bg-white text-cyan-800">{serverDrafts.data?.length} محفوظة</Badge></CardHeader><CardContent className="space-y-2">{serverDrafts.data?.slice(0, 6).map(draft => <div key={draft.id} className="flex items-center justify-between gap-3 rounded-xl border border-cyan-200 bg-white px-3 py-2 text-sm"><div><span className="font-medium text-slate-800">{draft.module === "customerCare" ? "خدمة العملاء" : "مركز الاتصال"}</span><span className="mr-2 text-xs text-slate-500">{draft.status === "queued" ? "جاهزة للمراجعة وإعادة التشغيل" : draft.status === "replayed" ? "أعيد تشغيلها" : "تحتاج مراجعة"}</span></div>{draft.status === "queued" && <span title="يتطلب جهازاً موثوقاً قبل إعادة التشغيل" className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-800">محجوبة: تحقق الجهاز مطلوب</span>}</div>)}</CardContent></Card>}
          {user && canSeeManagementSurfaces && <section className={cn("rounded-2xl border border-slate-200 bg-white shadow-sm shadow-slate-200/60", isRtl ? "text-right" : "text-left")}><details className="group"><summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-4 px-5 marker:content-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-cyan-500 sm:px-6"><div className="flex min-w-0 items-center gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-slate-100 text-slate-700"><Activity className="h-5 w-5" /></span><span className="min-w-0"><span className="block text-sm font-semibold text-slate-900">{t("home.systemStatus")}</span><span className="mt-0.5 block truncate text-xs text-slate-500">{t("home.systemStatusDetail")}</span></span></div><span className="flex shrink-0 items-center gap-2 text-xs font-medium text-slate-500"><span className="hidden sm:inline">{t("home.protected")}</span><ChevronDown className="h-4 w-4 transition-transform duration-200 group-open:rotate-180 motion-reduce:transition-none" /></span></summary><div className="grid gap-4 border-t border-slate-100 p-4 lg:grid-cols-3 sm:p-6"><Card className="border-0 bg-[#0d1b2a] text-white shadow-none"><CardHeader><div className="flex items-center gap-3"><div className="grid h-9 w-9 place-items-center rounded-xl bg-cyan-400/15 text-cyan-300"><Activity className="h-4 w-4" /></div><CardTitle className="text-base text-white">{t("home.systemStatus")}</CardTitle></div></CardHeader><CardContent className="space-y-4"><div><div className="mb-2 flex justify-between text-xs"><span className="text-slate-300">{t("home.authPermissions")}</span><span className="text-emerald-300">{t("home.protected")}</span></div><Progress value={100} className="h-2 bg-white/10" /></div><div><div className="mb-2 flex justify-between text-xs"><span className="text-slate-300">{t("home.fefoRules")}</span><span className="text-emerald-300">{t("home.enabled")}</span></div><Progress value={100} className="h-2 bg-white/10" /></div><div><div className="mb-2 flex justify-between text-xs"><span className="text-slate-300">{t("home.scheduledAlerts")}</span><span className="text-amber-300">{t("home.awaitingPublication")}</span></div><Progress value={45} className="h-2 bg-white/10" /></div><div className="flex items-center gap-2 border-t border-white/10 pt-3 text-[11px] text-slate-400"><Building2 className="h-4 w-4" />{t("home.multibranchAudit")}</div></CardContent></Card><Card className="border-slate-200 shadow-none lg:col-span-2"><CardHeader className="flex-row items-center justify-between gap-3 space-y-0"><div><CardTitle className="text-base">{t("home.recentActivity")}</CardTitle><p className="mt-1 text-xs leading-5 text-slate-500">{t("home.recentActivityDetail")}</p></div><Button type="button" variant="ghost" size="sm" onClick={() => setActive("integrity")} className="shrink-0 text-cyan-700">{t("home.auditTrail")} {isRtl ? <ChevronLeft className="mr-1 h-4 w-4" /> : <ChevronRight className="ml-1 h-4 w-4" />}</Button></CardHeader><CardContent><div className="grid place-items-center rounded-2xl border border-dashed border-slate-300 bg-slate-50/70 px-6 py-8 text-center"><FileText className="mb-3 h-7 w-7 text-slate-300" /><p className="font-medium text-slate-600">{t("home.noEvents")}</p><p className="mt-1 max-w-sm text-sm leading-6 text-slate-400">{t("home.noEventsDetail")}</p></div></CardContent></Card><Card className="border-slate-200 shadow-none lg:col-span-3"><CardHeader><CardTitle className="text-base">{t("home.nonOverrideRules")}</CardTitle></CardHeader><CardContent className="grid gap-4 sm:grid-cols-3"><div className="flex gap-3"><ShieldCheck className="h-5 w-5 shrink-0 text-emerald-600" /><p className="text-sm leading-6 text-slate-600">{t("home.discountRule")}</p></div><div className="flex gap-3"><PackageSearch className="h-5 w-5 shrink-0 text-cyan-600" /><p className="text-sm leading-6 text-slate-600">{t("home.fefoRule")}</p></div><div className="flex gap-3"><Stethoscope className="h-5 w-5 shrink-0 text-violet-600" /><p className="text-sm leading-6 text-slate-600">{t("home.prescriptionRule")}</p></div></CardContent></Card></div></details></section>
          }
        </div>
      </main>
      {user && allowedModules.some(module => module.id === "assistant") && <>
        <button type="button" aria-label={language === "en" ? "Open MEDORA assistant" : "فتح مساعد MEDORA"} onClick={openFloatingAssistant} className={cn("fixed bottom-5 z-30 grid h-14 w-14 place-items-center rounded-2xl bg-[#0d1b2a] text-white shadow-[0_18px_42px_rgba(13,27,42,0.32)] transition duration-200 hover:-translate-y-1 hover:bg-cyan-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-cyan-200 active:scale-95 motion-reduce:transform-none", isRtl ? "left-5" : "right-5")}><span className="absolute inset-1 rounded-xl border border-cyan-300/30" /><Sparkles className="relative h-5 w-5" /><span className="sr-only">{language === "en" ? "Guidance only, human review required" : "إرشاد فقط، والمراجعة البشرية مطلوبة"}</span></button>
        <Drawer direction={isRtl ? "left" : "right"} open={assistantOpen} onOpenChange={setAssistantOpen}>
          <DrawerContent className={cn("z-[70] flex h-[min(100dvh,56rem)] w-full !w-[calc(100vw-1rem)] flex-col overflow-hidden border-0 bg-[#f8fbfd] p-0 shadow-2xl sm:!w-[min(34rem,calc(100vw-2rem))] sm:!max-w-[34rem]", isRtl ? "left-0 rounded-r-[2rem]" : "right-0 rounded-l-[2rem]")}>
            <DrawerTitle className="sr-only">MEDORA AI</DrawerTitle>
            <DrawerDescription className="sr-only">{language === "en" ? "Guidance with human review" : "إرشاد مع مراجعة بشرية"}</DrawerDescription>
            <div className="relative flex items-center justify-between gap-3 border-b border-cyan-100 bg-[#0d1b2a] px-5 py-4 text-white"><div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.25),transparent_45%)]" aria-hidden="true" /><div className="relative flex min-w-0 items-center gap-3"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-cyan-400 text-[#0d1b2a]"><Sparkles className="h-4 w-4" /></span><div className="min-w-0"><p className="truncate text-sm font-bold">MEDORA AI</p><p className="truncate text-[11px] text-cyan-100/80">{language === "en" ? "Guidance with human review" : "إرشاد مع مراجعة بشرية"}</p></div></div><Button type="button" variant="ghost" size="icon" aria-label={t("home.close")} className="relative shrink-0 text-white hover:bg-white/10 hover:text-white" onClick={() => setAssistantOpen(false)}><X className="h-5 w-5" /></Button></div>
            <div className="min-h-0 flex-1 overflow-y-auto p-3 sm:p-4"><ReloadableAssistantSupportWorkspace organizationId={selectedOrganizationId} branchId={activeBranchId} screen={activeModule.id} isOverlay initialDraft={assistantDraft} /></div>
          </DrawerContent>
        </Drawer>
      </>}
    </div>
    </ScreenCaptureProtection>
  );
}

function ModulePanel({ active, organizationId, branchId, jurisdictionId, operationsFocus, canManagePolicies }: { active: string; organizationId: number | null; branchId: number | null; jurisdictionId: number | null; operationsFocus: "people" | "procurement" | "crm"; canManagePolicies: boolean }) {
  const panels: Record<string, { title: string; description: string; items: string[] }> = {
    overview: { title: "ملخص التشغيل", description: "نظرة آمنة لا تعرض أرقاماً غير موجودة في قاعدة البيانات.", items: ["مؤشرات الفروع", "التنبيهات الحرجة", "حالة التكاملات"] },
    pos: { title: "نقطة البيع", description: "العمليات الحساسة ستُنفذ على الخادم مع خصم أقصى ٧٪ وFEFO.", items: ["صرف كسري للوحدات", "تحقق MOH قبل الإتمام", "حالة إيصال ETA"] },
    inventory: { title: "المخزون و FEFO", description: "ترتيب التشغيلات حسب أقرب انتهاء مع تنبيهات نقطة إعادة الطلب.", items: ["رقم التشغيلة والانتهاء", "نقل بين الفروع", "مرتجعات وتالف"] },
    prescriptions: { title: "الوصفة الذكية", description: "ارفع صورة الوصفة ليقوم النموذج المدمج بالاستخراج، ثم يراجعها الصيدلي.", items: ["رفع صورة آمن", "أسماء وجرعات وكميات", "تأكيد صيدلي إلزامي"] },
    insurance: { title: "التأمين والمطالبات", description: "دورة مطالبة قابلة للتدقيق مع حالة رفض ومبالغ معلقة.", items: ["موافقة مسبقة", "25 مزود TPA", "تقارير aging"] },
    compliance: { title: "الامتثال الإقليمي", description: "كل دولة لها ملف ومصادر وحزمة قواعد مستقلة؛ لا تُفعل العمليات المنظمة قبل اعتماد الحزمة وتحديث أدلتها.", items: ["ملف دولة مستقل", "حزمة قواعد بإصدار", "أدلة ومراجعة بشرية"] },
    compounding: { title: "التحضير الصيدلي", description: "تركيبات وBOM وتكلفة مع سجل مسؤولية.", items: ["تركيبة ومكونات", "خصم BOM", "تتبع التحضير المعقم"] },
    finance: { title: "المالية والتقارير", description: "تقارير على بيانات فعلية مع حدود دفع وتسوية واضحة.", items: ["دفتر وحركة نقدية", "Meeza / InstaPay", "تسوية ومراجعة"] },
    people: { title: "الموظفون والفروع", description: "أدوار مرتبطة بالفروع وقواعد حضور ورواتب مصدرها حزمة الدولة المعتمدة.", items: ["أدوار وصلاحيات", "وردية وتوقيت محلي", "إجازات ورواتب"] },
    operations: { title: "مركز العمليات", description: "بوابة تنفيذية تجمع مهام الموظفين والتوريد ومتابعة العملاء في مسارات قصيرة، مع إبقاء القرار الحساس خاضعًا للصلاحيات والمراجعة.", items: ["مهام اليوم", "التوريد والمشتريات", "CRM والتذاكر"] },
    customerCare: { title: "خدمة العملاء", description: "ملفات العملاء، الموافقات، المتابعة، والشكاوى مع سجل قابل للتدقيق.", items: ["ملف عميل", "متابعة علاجية", "موافقة وخصوصية"] },
    secondaryModules: { title: "CRM وHR والخدمة", description: "مساحة موحدة للجهات والموظفين ومركز الاتصال وخدمة العملاء، مرتبطة بنطاق المؤسسة والفرع.", items: ["CRM والفرص", "HR والورديات", "التذاكر والمتابعة"] },
    callCentre: { title: "مركز الاتصال", description: "استقبال المكالمات وتوزيع التذاكر ومواعيد إعادة الاتصال دون حفظ تسجيلات حساسة تلقائياً.", items: ["تذكرة جديدة", "أولوية وتصعيد", "موعد متابعة"] },
    catalog: { title: "كتالوج الأصناف", description: "بحث معزول حسب الدولة في الأدوية والتجميل والمستلزمات، مع مصدر ودرجة تحقق لكل صنف.", items: ["أدوية الدولة", "تجميل", "مستلزمات طبية"] },
    icd10: { title: "بحث التشخيص المرجعي", description: "بحث مساعد في ICD-10-CM من NLM الأمريكي؛ لا يعتمد تشخيصاً نهائياً ولا يغير المطالبات أو الفواتير.", items: ["NLM Clinical Tables", "إصدار 2026", "مرجع US فقط"] },
    hardware: { title: "إعداد الأجهزة والمحاكاة", description: "اختيار موديلات الطابعات واتصالاتها واختبار الماسح والطابعة الحرارية دون جهاز فعلي.", items: ["موديلات ووسائط", "نوع الاتصال", "سجل محاكاة محلي"] },
    aiGovernance: { title: "الذكاء الاصطناعي والمراقبة", description: "تحليل تشغيلي محكوم بالإنسان، وجاهزية مراقبة خصوصية أولًا دون أي جمع وسائط أو قرار آلي.", items: ["تحليل استشاري", "مراجعة بشرية", "مراقبة مقفلة"] },
    antiFraud: { title: "النزاهة ومكافحة الاحتيال", description: "إشارات مخاطر قابلة للتفسير، فصل للمهام، وتسوية وتحقيق بشري دون اتهام أو مراقبة خفية.", items: ["نقد ومخزون", "مشتريات وصلاحيات", "قضايا وأدلة"] },
    security: { title: "إعدادات الحماية والمصادقة", description: "حالة 2FA واستعادة كلمة المرور وقنوات التحقق المؤسسية، مع إبقاء التفعيل مغلقاً حتى الاعتماد.", items: ["2FA", "استعادة كلمة المرور", "قناة بريد مؤسسية"] },
    supplyChain: { title: "سلاسل الإمداد والتنبؤ", description: "توقع الطلب من المبيعات المسجلة ضمن الفرع والاختصاص المؤكدين، مع حالات جودة واضحة ومنع إصدار أمر شراء تلقائي.", items: ["سجل مبيعات فعلي", "مخزون مؤكد", "مراجعة بشرية"] },
    egyptHealthcare: { title: "المستشفيات والتأمين المصري", description: "مسارات مصرية داخلية للمرافق والمقابلات والمطالبات؛ الإرسال الحكومي لا يتفعل دون اعتماد رسمي.", items: ["حكومي وخاص", "مقابلات وإحالات", "مطالبات وفشل آمن"] },
  };
  const panel = panels[active] ?? panels.overview;
  const workspaceResetKey = buildWorkspaceResetKey(active, organizationId, branchId, jurisdictionId);
  if (active === "overview") return <LazyWorkspace resetKey={workspaceResetKey}><BranchAnalyticsDashboard branchId={branchId} jurisdictionId={jurisdictionId} /></LazyWorkspace>;
  if (active === "compliance") return <RegionalComplianceWorkspace />;
  if (active === "pos") return <LazyWorkspace resetKey={workspaceResetKey}><SalesFinanceWorkspace branchId={branchId} jurisdictionId={jurisdictionId} /></LazyWorkspace>;
  if (active === "inventory") return <SupplyChainWorkspace organizationId={organizationId} branchId={branchId} jurisdictionId={jurisdictionId} canManage={canManagePolicies} />;
  if (active === "prescriptions") return <PrescriptionWorkspace />;
  if (active === "customerCare") return <SecondaryModulesWorkspace organizationId={organizationId} branchId={branchId} jurisdictionId={jurisdictionId} initialTab={secondaryModuleTabForRoute(active)!} />;
  if (active === "secondaryModules") return <SecondaryModulesWorkspace organizationId={organizationId} branchId={branchId} jurisdictionId={jurisdictionId} initialTab={secondaryModuleTabForRoute(active)!} />;
  if (active === "operations") return <OperationsManagementWorkspace organizationId={organizationId} branchId={branchId} jurisdictionId={jurisdictionId} focus={operationsFocus} />;
  if (active === "callCentre") return <SecondaryModulesWorkspace organizationId={organizationId} branchId={branchId} jurisdictionId={jurisdictionId} initialTab={secondaryModuleTabForRoute(active)!} />;
  if (active === "catalog") return <CatalogWorkspace />;
  if (active === "demo") return <DemoExperienceWorkspace branchId={branchId} jurisdictionId={jurisdictionId} />;
  if (active === "icd10") return <NlmIcd10ReferencePanel />;
  if (active === "hardware") return <HardwareWorkspace />;
  if (active === "aiGovernance") return <AiGovernanceWorkspace organizationId={organizationId} />;
  if (active === "aiInsights") return <AiInsightsWorkspace organizationId={organizationId} branchId={branchId} jurisdictionId={jurisdictionId} />;
  if (active === "antiFraud") return <AntiFraudWorkspace organizationId={organizationId} branchId={branchId} />;
  if (active === "assistant") return <ReloadableAssistantSupportWorkspace organizationId={organizationId} branchId={branchId} screen="المساعد ومركز الدعم" />;
  if (active === "backup") return <BackupManagementWorkspace organizationId={organizationId} branchId={branchId} />;
  if (active === "policyKnowledge") return <PolicyKnowledgeWorkspace organizationId={organizationId} branchId={branchId} jurisdictionId={jurisdictionId} canManage={canManagePolicies} />;
     if (active === "security") return <AuthenticationSettingsWorkspace />;
   if (active === "connectors") return <ConnectorAccreditationDashboard />;

  if (active === "supplyChain") return <SupplyChainWorkspace organizationId={organizationId} branchId={branchId} jurisdictionId={jurisdictionId} canManage={canManagePolicies} />;
  if (active === "egyptHealthcare") return <EgyptHealthcareWorkspace organizationId={organizationId} branchId={branchId} jurisdictionId={jurisdictionId} />;
  if (active === "insurance") return <InsuranceWorkspace organizationId={organizationId} jurisdictionId={jurisdictionId} branchId={branchId} />;
  if (active === "finance") return <div className="space-y-5"><ReportsWorkspace organizationId={organizationId} jurisdictionId={jurisdictionId} branchId={branchId} /><ProcurementBalanceReports organizationId={organizationId} branchId={branchId} jurisdictionId={jurisdictionId} /><AccountingLoyaltyWorkspace organizationId={organizationId} branchId={branchId} jurisdictionId={jurisdictionId} /></div>;
  if (active === "people") return <div className="space-y-5"><Card className="border-slate-200 bg-slate-50/80 shadow-sm"><CardContent className="flex flex-wrap items-center justify-between gap-3 p-4"><div><p className="font-semibold text-slate-900">إدارة الحسابات والصلاحيات</p><p className="mt-1 text-sm text-slate-600">افتح لوحة الإدارة لتعديل الدور والفرع ضمن المؤسسة ومراجعة المصفوفة الثابتة للصلاحيات.</p></div><Button asChild className="gap-2 bg-slate-900"><a href="/admin"><ShieldCheck className="h-4 w-4" />لوحة الإدارة</a></Button></CardContent></Card><OrganizationWorkspace organizationId={organizationId} /><SecondaryModulesWorkspace organizationId={organizationId} branchId={branchId} jurisdictionId={jurisdictionId} initialTab={secondaryModuleTabForRoute(active)!} /></div>;
  if (active === "promotions") return <PromotionsWorkspace organizationId={organizationId} jurisdictionId={jurisdictionId} branchId={branchId} />;
  return <Card className="overflow-hidden border-0 bg-white shadow-sm shadow-slate-200/60"><CardContent className="p-0"><div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6"><div><div className="mb-2 flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-cyan-500" /><span className="text-xs font-semibold uppercase tracking-[0.14em] text-cyan-700">مساحة عمل</span></div><h2 className="text-xl font-bold tracking-tight">{panel.title}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">{panel.description}</p></div><div className="grid grid-cols-1 gap-2 sm:min-w-[300px] sm:grid-cols-3">{panel.items.map(item => <div key={item} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-center text-xs font-medium text-slate-600">{item}</div>)}</div></div></CardContent></Card>;
}

function SalesFinanceWorkspace({ branchId, jurisdictionId }: { branchId: number | null; jurisdictionId: number | null }) {
  return <PointOfSaleWorkspace branchId={branchId} jurisdictionId={jurisdictionId} />;
}

function RegionalComplianceWorkspace() {
  const { user } = useAuth();
  const registry = trpc.regional.registry.useQuery(undefined, { retry: false });
  const branchJurisdictions = trpc.regional.myBranchJurisdictions.useQuery(undefined, { retry: false });
  const [selectedCode, setSelectedCode] = useState("");
  const [selectedPackId, setSelectedPackId] = useState<number | null>(null);
  const [reason, setReason] = useState("");
  const [status, setStatus] = useState("");
  const isAdmin = user?.role === "admin";
  const selectedCountry = registry.data?.find(country => country.countryCode === selectedCode) ?? registry.data?.[0];
  const assignedJurisdictionId = branchJurisdictions.data?.find(item => item.assignment?.jurisdictionId != null && item.profile?.active === 1)?.assignment?.jurisdictionId;
  const jurisdictionId = selectedCountry?.profile?.id ?? assignedJurisdictionId;
  const packs = trpc.regional.listPacks.useQuery(hasJurisdictionScope(jurisdictionId) ? { jurisdictionId: jurisdictionId! } : skipToken, { retry: false });
  const selectedPack = packs.data?.find(pack => pack.id === selectedPackId) ?? packs.data?.[0];
  const evidence = trpc.regional.listEvidence.useQuery(selectedPack?.id ? { packId: selectedPack.id } : skipToken, { retry: false });
  const audits = trpc.regional.listPackAudits.useQuery(selectedPack?.id && isAdmin ? { packId: selectedPack.id } : skipToken, { retry: false });
  const approveProfile = trpc.regional.approveProfile.useMutation({ onSuccess: async () => { setStatus("تم تحديث حالة ملف الدولة."); await registry.refetch(); } });
  const verifyEvidence = trpc.regional.verifyEvidence.useMutation({ onSuccess: async () => { setStatus("تم تسجيل قرار الدليل."); await evidence.refetch(); await registry.refetch(); } });
  const approvePack = trpc.regional.approvePack.useMutation({ onSuccess: async () => { setStatus("تم اعتماد الحزمة بعد اجتياز فحوص الأدلة."); await packs.refetch(); await registry.refetch(); } });
  const rollbackPack = trpc.regional.rollbackPack.useMutation({ onSuccess: async () => { setStatus("تم تسجيل التراجع مع سبب تدقيقي."); await packs.refetch(); await registry.refetch(); await audits.refetch(); } });
  const configured = registry.data?.filter(country => country.status === "configured").length ?? 0;
  const pending = registry.data?.filter(country => country.status !== "configured").length ?? 0;
  useEffect(() => { if (!selectedCode && registry.data?.[0]) setSelectedCode(registry.data[0].countryCode); }, [registry.data, selectedCode]);
  useEffect(() => { if (packs.data?.[0] && !packs.data.some(pack => pack.id === selectedPackId)) setSelectedPackId(packs.data[0].id); }, [packs.data, selectedPackId]);
  return <WorkspaceShell title="إدارة الدول وحزم الامتثال"><div className="space-y-4"><div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950"><strong>بوابة الاعتماد:</strong> لا يُعتبر أي بلد جاهزاً للعمليات المنظمة بمجرد إدخاله. يجب وجود ملف نشط، حزمة معتمدة، أدلة رسمية، وتاريخ مراجعة غير منتهٍ.</div><div className="grid gap-3 sm:grid-cols-3"><div className="rounded-xl bg-emerald-50 p-4"><p className="text-xs text-emerald-700">دول مهيأة</p><p className="mt-1 text-2xl font-bold text-emerald-900">{configured}</p></div><div className="rounded-xl bg-slate-100 p-4"><p className="text-xs text-slate-600">تحتاج إعداداً أو اعتماداً</p><p className="mt-1 text-2xl font-bold text-slate-900">{pending}</p></div><div className="rounded-xl bg-cyan-50 p-4"><p className="text-xs text-cyan-700">إجمالي السجل العربي</p><p className="mt-1 text-2xl font-bold text-cyan-900">{registry.data?.length ?? 0}</p></div></div>{registry.isLoading ? <p className="text-sm text-slate-500">جارٍ تحميل سجل الدول…</p> : registry.error ? <p className="rounded-xl bg-rose-50 p-4 text-sm text-rose-700">تعذر تحميل حالة الدول؛ ستظل العمليات المنظمة محجوبة.</p> : <><div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">{registry.data?.map(country => <button key={country.countryCode} onClick={() => setSelectedCode(country.countryCode)} className={cn("flex items-center justify-between rounded-xl border bg-white p-3 text-right transition", selectedCountry?.countryCode === country.countryCode ? "border-cyan-400 ring-2 ring-cyan-100" : "border-slate-200 hover:border-cyan-200")}><div><p className="font-medium">{country.countryNameAr}</p><p className="text-xs text-slate-500">{country.countryCode}</p></div><Badge variant={country.status === "configured" ? "default" : "outline"}>{country.status === "configured" ? "مهيأ" : "غير معتمد"}</Badge></button>)}</div><div className="grid gap-4 lg:grid-cols-[.8fr_1.2fr]"><Card className="border-slate-200 shadow-none"><CardHeader><CardTitle className="text-base">الملف المحدد</CardTitle></CardHeader><CardContent className="space-y-3 text-sm">{selectedCountry ? <><div><p className="font-semibold">{selectedCountry.countryNameAr} · {selectedCountry.countryCode}</p><p className="mt-1 text-xs text-slate-500">{selectedCountry.profile?.legalAuthorityProfile ?? "لا يوجد ملف قانوني محفوظ"}</p></div><p className="text-xs leading-5 text-slate-500">الحالة: {selectedCountry.status}. لا يتم حفظ اختيار المستخدم محلياً ولا يتحول إلى اختصاص قانوني دون تعيين فرع مؤكد من الخادم.</p>{isAdmin && selectedCountry.profile && <Button variant="outline" disabled={approveProfile.isPending} onClick={() => approveProfile.mutate({ jurisdictionId: selectedCountry.profile!.id, approved: !selectedCountry.profile!.active })}>{selectedCountry.profile.active ? "تعطيل الملف" : "تفعيل الملف بعد المراجعة"}</Button>}</> : <p className="text-slate-500">لا يوجد ملف محدد.</p>}</CardContent></Card><Card className="border-slate-200 shadow-none"><CardHeader><CardTitle className="text-base">حزم الامتثال والأدلة</CardTitle></CardHeader><CardContent className="space-y-3">{hasJurisdictionScope(jurisdictionId) && packs.data?.length ? <><select value={selectedPack?.id ?? ""} onChange={event => setSelectedPackId(Number(event.target.value))} className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm" aria-label="حزمة الامتثال">{packs.data.map(pack => <option key={pack.id} value={pack.id}>الإصدار {pack.packVersion} · {pack.status}</option>)}</select><div className="space-y-2">{evidence.data?.length ? evidence.data.map(item => <div key={item.id} className="rounded-xl border border-slate-200 p-3"><div className="flex items-start justify-between gap-3"><div><p className="font-medium">{item.ruleKey ?? item.catalogField ?? item.operation}</p><p className="text-xs text-slate-500">{item.authorityName} · {item.sourceRecordId ?? "بدون رقم مرجعي"}</p></div><Badge variant={item.verificationStatus === "verified" ? "default" : "outline"}>{item.verificationStatus === "verified" ? "موثق" : item.verificationStatus === "rejected" ? "مرفوض" : "قيد المراجعة"}</Badge></div>{isAdmin && item.verificationStatus === "review" && <div className="mt-2 flex gap-2"><Button size="sm" onClick={() => verifyEvidence.mutate({ evidenceId: item.id, decision: "verified" })}>توثيق</Button><Button size="sm" variant="outline" onClick={() => verifyEvidence.mutate({ evidenceId: item.id, decision: "rejected" })}>رفض</Button></div>}</div>) : <p className="rounded-xl border border-dashed border-slate-300 p-5 text-center text-sm text-slate-500">لا توجد أدلة مسجلة لهذه الحزمة.</p>}</div><div className="flex flex-wrap gap-2">{isAdmin && selectedPack?.status === "draft" && <Button disabled={approvePack.isPending} onClick={() => approvePack.mutate({ packId: selectedPack.id, reason: reason.trim() || undefined })}>اعتماد الحزمة</Button>}{isAdmin && selectedPack?.status === "approved" && <Button variant="outline" disabled={rollbackPack.isPending || reason.trim().length < 5} onClick={() => rollbackPack.mutate({ packId: selectedPack.id, reason })}>تراجع مع سبب</Button>}</div>{isAdmin && selectedPack?.status === "approved" && <Input value={reason} onChange={event => setReason(event.target.value)} placeholder="سبب التدقيق، ٥ أحرف على الأقل" aria-label="سبب التدقيق" />}</> : <p className="text-sm text-slate-500">لا توجد حزمة لهذا الاختصاص أو لم يتم تحديد ملف.</p>}</CardContent></Card></div>{isAdmin && selectedPack && <div className="rounded-xl border border-slate-200 bg-slate-50 p-3"><p className="mb-2 text-sm font-semibold">آخر سجل تدقيق</p>{audits.data?.length ? audits.data.slice(0, 4).map(audit => <p key={audit.id} className="text-xs leading-6 text-slate-600">{audit.action} · {audit.reason ?? "بدون سبب"}</p>) : <p className="text-xs text-slate-500">لا يوجد سجل تدقيق بعد.</p>}</div>}{status && <Badge variant="outline">{status}</Badge>}</>}</div></WorkspaceShell>;
}

function PrescriptionWorkspace() {
  const localization = useLocalization();
  const [intakeId, setIntakeId] = useState<number | null>(null);
  const [branchId, setBranchId] = useState("");
  const [patientId, setPatientId] = useState("");
  const [prescriptionCode, setPrescriptionCode] = useState(() => `MED-${Date.now()}`);
  const [medicationText, setMedicationText] = useState("");
  const [dosage, setDosage] = useState("");
  const [frequency, setFrequency] = useState("");
  const [duration, setDuration] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [status, setStatus] = useState("لم تُرفع صورة أو تُنشأ وصفة بعد");
  const [resultText, setResultText] = useState("");
  const upload = trpc.erp.prescription.upload.useMutation();
  const extract = trpc.erp.prescription.extractFromIntake.useMutation();
  const createPrescription = trpc.erp.ePrescription.create.useMutation();
  const verifyPrescription = trpc.erp.ePrescription.verify.useMutation({ onSuccess: () => { void accessible.refetch(); } });
  const dispense = trpc.erp.ePrescription.dispenseLine.useMutation({ onSuccess: () => { void accessible.refetch(); } });
  const accessInput = useMemo(() => buildPrescriptionAccessInput({ branchId, jurisdictionId: localization.jurisdictionId, patientId }), [branchId, patientId, localization.jurisdictionId]);
  const accessible = trpc.erp.ePrescription.accessByPatientId.useQuery(accessInput ?? skipToken, { retry: false });

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) { setStatus("الملف يجب أن يكون صورة"); return; }
    if (file.size > 8 * 1024 * 1024) { setStatus("الحد الأقصى للصورة 8MB"); return; }
    const reader = new FileReader();
    reader.onload = async () => { try { const selectedBranchId = Number(branchId); if (!Number.isInteger(selectedBranchId) || selectedBranchId <= 0) { setStatus("أدخل رقم فرع مرتبطاً باختصاص مؤكد قبل رفع الوصفة"); return; } const uploaded = await upload.mutateAsync({ branchId: selectedBranchId, fileName: file.name, mimeType: file.type as "image/jpeg" | "image/png" | "image/webp", dataUrl: String(reader.result) }); setIntakeId(uploaded.intakeId); setStatus("تم الرفع. يمكنك بدء الاستخراج الآن."); } catch (error) { setStatus(error instanceof Error ? error.message : "تعذر رفع الصورة"); } };
    reader.readAsDataURL(file);
  };
  const runExtraction = async () => { if (!intakeId) return; setStatus("جارٍ تحليل الوصفة بالرؤية المدمجة…"); try { const response = await extract.mutateAsync({ intakeId }); setResultText(JSON.stringify(response.extraction, null, 2)); setStatus("اكتمل الاستخراج، وتبقى مراجعة الصيدلي إلزامية قبل الصرف."); } catch (error) { setStatus(error instanceof Error ? error.message : "تعذر تحليل الوصفة"); } };
  const createElectronicPrescription = async () => {
    const branch = Number(branchId); const patient = Number(patientId);
    if (!hasAssignedPrescriptionJurisdiction(localization.jurisdictionId) || !Number.isInteger(branch) || !Number.isInteger(patient) || !medicationText.trim() || !dosage.trim() || !frequency.trim() || !duration.trim()) { setStatus("أكمل الاختصاص والفرع والمريض وبيانات الدواء المطلوبة."); return; }
    try { const result = await createPrescription.mutateAsync({ branchId: branch, jurisdictionId: localization.jurisdictionId, patientId: patient, prescriptionCode, lines: [{ medicationText, dosage, frequency, duration, quantity: Number(quantity) }] }); setStatus(`أُنشئت الوصفة ${result.prescriptionCode} بحالة انتظار التحقق الصيدلي.`); setMedicationText(""); setDosage(""); setFrequency(""); setDuration(""); setQuantity("1"); setPrescriptionCode(`MED-${Date.now()}`); } catch (error) { setStatus(error instanceof Error ? error.message : "تعذر إنشاء الوصفة الإلكترونية"); }
  };
  return <WorkspaceShell title="الوصفات الإلكترونية والصرف الآمن"><div className="space-y-5"><div className="rounded-2xl border border-cyan-100 bg-cyan-50/50 p-4"><div className="mb-2 flex items-center gap-2"><BrainCircuit className="h-5 w-5 text-cyan-600" /><p className="font-semibold text-cyan-950">استقبال وصفة مصورة</p></div><p className="mb-3 text-xs leading-5 text-slate-600">الاستخراج مساعد فقط؛ لا ينشئ وصفة رسمية ولا بيعاً قبل مراجعة بشرية.</p><label className="block text-sm font-medium text-slate-700">رقم الفرع<input className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2" type="number" min="1" value={branchId} onChange={event => setBranchId(event.target.value)} placeholder="أدخل رقم الفرع" /></label><label className="mt-3 flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-cyan-200 bg-white px-6 py-7 text-center hover:bg-cyan-50"><UploadIcon /><span className="mt-2 font-semibold text-slate-700">اختر صورة الوصفة</span><input className="hidden" type="file" accept="image/jpeg,image/png,image/webp" onChange={event => { const file = event.target.files?.[0]; if (file) handleFile(file); }} /></label><div className="mt-3 flex flex-wrap items-center gap-3"><Badge variant="outline">{status}</Badge>{intakeId && <Button onClick={runExtraction} disabled={extract.isPending}>{extract.isPending ? "جارٍ التحليل…" : "تحليل الوصفة"}</Button>}</div>{resultText && <pre className="mt-3 max-h-52 overflow-auto rounded-xl bg-slate-950 p-4 text-left text-xs text-cyan-100" dir="ltr">{resultText}</pre>}</div><div className="grid gap-4 lg:grid-cols-2"><div className="rounded-2xl border border-slate-200 bg-white p-4"><div className="mb-3 flex items-center gap-2"><Stethoscope className="h-5 w-5 text-teal-600" /><p className="font-semibold">إنشاء وصفة الطبيب</p></div><p className="mb-3 text-xs leading-5 text-slate-500">تُحفظ كـ PENDING_VERIFICATION، ولا تظهر للصيدلية حتى اعتمادها من مستخدم صيدلي مخوّل.</p><div className="grid gap-2 sm:grid-cols-2"><Input value={patientId} onChange={e => setPatientId(e.target.value)} placeholder="معرّف المريض الداخلي" aria-label="معرف المريض" type="number" /><Input value={prescriptionCode} onChange={e => setPrescriptionCode(e.target.value)} placeholder="رمز الوصفة" aria-label="رمز الوصفة" /><Input value={medicationText} onChange={e => setMedicationText(e.target.value)} placeholder="اسم الدواء" aria-label="اسم الدواء" /><Input value={dosage} onChange={e => setDosage(e.target.value)} placeholder="الجرعة" aria-label="الجرعة" /><Input value={frequency} onChange={e => setFrequency(e.target.value)} placeholder="التكرار" aria-label="التكرار" /><Input value={duration} onChange={e => setDuration(e.target.value)} placeholder="المدة" aria-label="المدة" /><Input value={quantity} onChange={e => setQuantity(e.target.value)} placeholder="الكمية" aria-label="الكمية" type="number" min="0.001" step="0.001" /></div><Button className="mt-3 w-full bg-[#0d1b2a]" onClick={createElectronicPrescription} disabled={createPrescription.isPending}>{createPrescription.isPending ? "جارٍ الحفظ…" : "إرسال للتحقق الصيدلي"}</Button></div><div className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><div className="mb-3 flex items-center gap-2"><Receipt className="h-5 w-5 text-amber-600" /><p className="font-semibold">وصفات الصيدلية للمريض</p></div><p className="mb-3 text-xs leading-5 text-slate-500">البحث لا يعمل إلا داخل الفرع والاختصاص الحاليين وبمعرّف مريض نشط. التكامل الحكومي والتأميني مغلق fail-closed.</p>{accessible.isLoading ? <p className="text-sm text-slate-500">جارٍ البحث…</p> : accessible.data?.length ? <div className="space-y-3">{accessible.data.map(item => <div key={item.prescription.id} className="rounded-xl border border-white bg-white p-3"><div className="flex items-start justify-between gap-2"><div><p className="font-medium">{item.prescription.prescriptionCode}</p><p className="text-xs text-slate-500">{item.prescription.status} · {new Date(item.prescription.createdAt).toLocaleString()}</p></div><div className="flex items-center gap-2"><Badge variant="secondary">{item.lines.length} بند</Badge>{item.prescription.status === "PENDING_VERIFICATION" && <Button size="sm" disabled={verifyPrescription.isPending} onClick={() => verifyPrescription.mutate({ prescriptionId: item.prescription.id })}>تحقق صيدلي</Button>}</div></div>{item.lines.map(line => <div key={line.id} className="mt-2 rounded-lg bg-slate-50 p-2 text-xs"><p className="font-medium">{line.medicationText} · {line.dosage}</p><p>{line.frequency} · {line.duration} · المتبقي {Number(line.quantity) - Number(line.dispensedQuantity)}</p>{line.status !== "DISPENSED" && <Button size="sm" className="mt-2" disabled={dispense.isPending} onClick={() => dispense.mutate({ prescriptionId: item.prescription.id, lineId: line.id, quantity: Number(line.quantity) - Number(line.dispensedQuantity) })}>صرف المتبقي</Button>}</div>)}</div>)}</div> : <p className="rounded-xl border border-dashed border-slate-300 p-5 text-center text-sm text-slate-500">أدخل معرّف مريض لعرض الوصفات التي تم التحقق منها فقط.</p>}</div></div></div></WorkspaceShell>;
}

function UploadIcon() { return <div className="grid h-12 w-12 place-items-center rounded-2xl bg-white text-cyan-600 shadow-sm"><FileText className="h-6 w-6" /></div>; }

function WorkspaceShell({ title, children }: { title: string; children: React.ReactNode }) {
  const { t } = useLocalization();
  return <Card className="overflow-hidden border-0 bg-white shadow-sm shadow-slate-200/60"><CardHeader><CardTitle className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-cyan-500" />{title}</CardTitle></CardHeader><CardContent>{children}</CardContent><div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 px-6 py-2 text-[10px] text-slate-400"><span>{t("home.footerBrand")}</span><span title={t("home.footerProvenanceTitle")}>{t("home.footerProvenance")}</span></div></Card>;
}

function CustomerCareWorkspace() {
  const localization = useLocalization();
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState("");
  const create = trpc.erp.customerCare.create.useMutation();
  const customers = trpc.erp.customerCare.list.useQuery(undefined, { retry: false });
  const submit = async () => {
    if (!fullName.trim() || !phone.trim()) { setStatus("أدخل الاسم ورقم الهاتف بعد الحصول على الموافقة اللازمة."); return; }
    if (!localization.branchId) { setStatus("اختر فرعاً موثقاً قبل إنشاء ملف العميل."); return; }
    try { const result = await create.mutateAsync({ fullName, phone, branchId: localization.branchId, consentStatus: "pending", chronicCareEnabled: false }); setStatus(`تم إنشاء ملف عميل رقم ${result.customerId} بحالة موافقة معلقة.`); setFullName(""); setPhone(""); await customers.refetch(); } catch (error) { setStatus(error instanceof Error ? error.message : "تعذر إنشاء الملف"); }
  };
  return <WorkspaceShell title="خدمة العملاء"><div className="grid gap-4 lg:grid-cols-[1fr_1.2fr]"><div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4"><p className="text-sm font-semibold">ملف عميل جديد</p><Input value={fullName} onChange={e => setFullName(e.target.value)} placeholder="الاسم الكامل" aria-label="الاسم الكامل" /><Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="رقم الهاتف" aria-label="رقم الهاتف" /><p className="text-xs leading-5 text-slate-500">سيظل consent بحالة معلقة حتى يتم توثيق موافقة العميل وفق سياسة الفرع. الفرع الحالي: {localization.branchId ?? "غير محدد"}.</p><Button onClick={submit} disabled={create.isPending} className="w-full bg-[#0d1b2a]">{create.isPending ? "جارٍ الحفظ…" : <><Plus className="ml-2 h-4 w-4" />إنشاء ملف</>}</Button>{status && <Badge variant="outline">{status}</Badge>}</div><div><p className="mb-3 text-sm font-semibold">آخر الملفات</p>{customers.isLoading ? <p className="text-sm text-slate-500">جارٍ التحميل…</p> : customers.data?.length ? <div className="space-y-2">{customers.data.slice(0, 5).map(customer => <div key={customer.id} className="flex items-center justify-between rounded-xl border border-slate-200 p-3"><div><p className="font-medium">{customer.fullName}</p><p className="text-xs text-slate-500">{customer.phone}</p></div><Badge variant="secondary">{customer.consentStatus}</Badge></div>)}</div> : <p className="rounded-xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">لا توجد ملفات فعلية بعد.</p>}</div></div></WorkspaceShell>;
}

function CallCentreWorkspace() {
  const localization = useLocalization();
  const [subject, setSubject] = useState("");
  const [status, setStatus] = useState("");
  const create = trpc.erp.callCentre.create.useMutation();
  const tickets = trpc.erp.callCentre.list.useQuery(undefined, { retry: false });
  const submit = async () => { if (!subject.trim()) { setStatus("اكتب موضوع التذكرة."); return; } if (!localization.branchId) { setStatus("اختر فرعاً موثقاً قبل فتح التذكرة."); return; } try { const result = await create.mutateAsync({ subject, channel: "phone", direction: "inbound", priority: "normal", branchId: localization.branchId }); setStatus(`تم إنشاء التذكرة #${result.ticketId}`); setSubject(""); await tickets.refetch(); } catch (error) { setStatus(error instanceof Error ? error.message : "تعذر إنشاء التذكرة"); } };
  return <WorkspaceShell title="مركز الاتصال"><div className="grid gap-4 lg:grid-cols-[1fr_1.2fr]"><div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4"><p className="text-sm font-semibold">مكالمة واردة</p><Input value={subject} onChange={e => setSubject(e.target.value)} placeholder="موضوع الاتصال أو الطلب" aria-label="موضوع الاتصال" /><p className="text-xs leading-5 text-slate-500">لا يتم حفظ تسجيل صوتي تلقائياً؛ يُحفظ فقط مرجع التسجيل عند تفعيل سياسة قانونية واضحة. الفرع الحالي: {localization.branchId ?? "غير محدد"}.</p><Button onClick={submit} disabled={create.isPending} className="w-full bg-[#0d1b2a]">{create.isPending ? "جارٍ الإنشاء…" : <><Ticket className="ml-2 h-4 w-4" />فتح تذكرة</>}</Button>{status && <Badge variant="outline">{status}</Badge>}</div><div><p className="mb-3 text-sm font-semibold">طابور التذاكر</p>{tickets.isLoading ? <p className="text-sm text-slate-500">جارٍ التحميل…</p> : tickets.data?.length ? <div className="space-y-2">{tickets.data.slice(0, 6).map(ticket => <div key={ticket.id} className="flex items-center justify-between rounded-xl border border-slate-200 p-3"><div><p className="font-medium">{ticket.subject}</p><p className="text-xs text-slate-500">{ticket.channel} · {ticket.direction}</p></div><Badge variant="secondary">{ticket.status}</Badge></div>)}</div> : <p className="rounded-xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">لا توجد تذاكر مفتوحة.</p>}</div></div></WorkspaceShell>;
}

type BulkCatalogRow = Record<string, unknown>;
type BulkDryRunResult = { dryRunToken: string; expiresAt: number; totals: { received: number; valid: number; errors: number; conflicts: number; importable: number }; issues: Array<{ rowNumber: number; severity: "error" | "conflict"; code: string; message: string; existingId?: number }>; provenancePolicy: string; scope: { organizationId: number; branchId: number; jurisdictionId: number } };

function parseCsvLine(line: string) { const cells: string[] = []; let current = ""; let quoted = false; for (let index = 0; index < line.length; index += 1) { const char = line[index]; if (char === '"' && line[index + 1] === '"' && quoted) { current += '"'; index += 1; } else if (char === '"') quoted = !quoted; else if (char === "," && !quoted) { cells.push(current.trim()); current = ""; } else current += char; } cells.push(current.trim()); return cells; }
function parseBulkCatalogFile(text: string, fileName: string): BulkCatalogRow[] { if (fileName.toLowerCase().endsWith(".json")) { const parsed: unknown = JSON.parse(text); if (!Array.isArray(parsed)) throw new Error("ملف JSON يجب أن يحتوي على مصفوفة سجلات"); return parsed.filter(item => item && typeof item === "object") as BulkCatalogRow[]; } const lines = text.replace(/^\uFEFF/, "").split(/\r?\n/).filter(line => line.trim()); if (lines.length < 2) throw new Error("ملف CSV يحتاج إلى صف عناوين وصف واحد على الأقل"); const headers = parseCsvLine(lines[0]).map(header => header.trim()); if (!headers.length || headers.some(header => !header)) throw new Error("صف عناوين CSV غير صالح"); return lines.slice(1).map(line => { const values = parseCsvLine(line); return Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ""])); }); }

function BulkCatalogImportPanel({ jurisdictionId }: { jurisdictionId?: number }) {
  const localization = useLocalization();
  const organizations = trpc.organizations.mine.useQuery(undefined, { retry: false });
  const [organizationId, setOrganizationId] = useState<number | null>(null);
  const [rows, setRows] = useState<BulkCatalogRow[]>([]);
  const [fileName, setFileName] = useState("");
  const [dryRunResult, setDryRunResult] = useState<BulkDryRunResult | null>(null);
  const [acknowledge, setAcknowledge] = useState(false);
  const [status, setStatus] = useState("");
  const dryRun = trpc.erp.catalog.bulkDryRun.useMutation({ onSuccess: result => { setDryRunResult(result); setAcknowledge(false); setStatus("اكتملت المحاكاة دون إدخال بيانات."); }, onError: error => setStatus(error.message) });
  const confirmImport = trpc.erp.catalog.bulkConfirm.useMutation({ onSuccess: result => { setStatus(`تم إدخال ${result.imported} سجل محلي بحالة قيد المراجعة.`); setDryRunResult(null); setRows([]); setFileName(""); setAcknowledge(false); } , onError: error => setStatus(error.message) });
  useEffect(() => { if (!organizationId && organizations.data?.[0]) setOrganizationId(organizations.data[0].id); }, [organizationId, organizations.data]);
  const branchId = localization.branchId;
  const canRun = Boolean(hasOrganizationBranchJurisdictionScope(organizationId, branchId, jurisdictionId) && rows.length && !dryRun.isPending && !confirmImport.isPending);
  const handleFile = (file: File) => { setStatus(""); setDryRunResult(null); setAcknowledge(false); if (file.size > 15 * 1024 * 1024) { setStatus("الحد الأقصى للملف 15MB."); return; } const reader = new FileReader(); reader.onload = () => { try { const parsed = parseBulkCatalogFile(String(reader.result), file.name); if (parsed.length > 2000) throw new Error("الحد الأقصى 2000 سجل في العملية الواحدة."); setRows(parsed); setFileName(file.name); setStatus(`تم تحميل ${parsed.length} سجل للمراجعة قبل المحاكاة.`); } catch (error) { setRows([]); setFileName(""); setStatus(error instanceof Error ? error.message : "تعذر قراءة الملف."); } }; reader.readAsText(file); };
  const runDryRun = async () => { if (!canRun) { setStatus("حدد المؤسسة والفرع والاختصاص وارفع ملفاً صالحاً أولاً."); return; } try { await dryRun.mutateAsync({ organizationId: organizationId!, branchId: branchId!, jurisdictionId: jurisdictionId!, rows }); } catch { /* mutation status is rendered below */ } };
  const confirm = async () => { if (!dryRunResult || !organizationId || !branchId || !jurisdictionId || dryRunResult.totals.errors || dryRunResult.totals.conflicts || !acknowledge) return; try { await confirmImport.mutateAsync({ organizationId, branchId, jurisdictionId, rows, dryRunToken: dryRunResult.dryRunToken, acknowledgePendingReview: true }); } catch { /* mutation status is rendered below */ } };
  return <Card className="border-cyan-200 bg-white shadow-none"><CardHeader><div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"><div><CardTitle className="text-base">استيراد جماعي آمن</CardTitle><p className="mt-1 text-xs leading-5 text-slate-500">ارفع CSV أو JSON، افحص النتائج والتعارضات، ثم أكد العملية صراحة. لا تُنشأ سجلات VERIFIED.</p></div><Badge variant="outline">صلاحية محرر الكتالوج</Badge></div></CardHeader><CardContent className="space-y-4"><div className="grid gap-3 md:grid-cols-[1fr_1fr_1fr_auto]"><select value={organizationId ?? ""} onChange={event => setOrganizationId(Number(event.target.value) || null)} className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm" aria-label="المؤسسة">{organizations.data?.map(item => <option key={item.id} value={item.id}>{item.displayName}</option>)}</select><div className="flex h-10 items-center rounded-md border border-slate-200 bg-slate-50 px-3 text-sm text-slate-600">الفرع: {branchId ?? "غير محدد"}</div><div className="flex h-10 items-center rounded-md border border-slate-200 bg-slate-50 px-3 text-sm text-slate-600">الاختصاص: {jurisdictionId ?? "غير محدد"}</div><label className="flex h-10 cursor-pointer items-center justify-center gap-2 rounded-md bg-[#0d1b2a] px-4 text-sm font-semibold text-white transition hover:bg-[#173450]"><UploadCloud className="h-4 w-4" />اختيار ملف<input type="file" accept=".csv,.json,text/csv,application/json" className="sr-only" onChange={event => { const file = event.target.files?.[0]; if (file) handleFile(file); event.currentTarget.value = ""; }} /></label></div>{fileName && <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-slate-50 p-3 text-xs"><span className="font-medium text-slate-700">{fileName} · {rows.length} سجل</span><Button variant="outline" size="sm" onClick={() => { setRows([]); setFileName(""); setDryRunResult(null); setAcknowledge(false); }}>إزالة الملف</Button></div>}<div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-950"><strong>سياسة الحماية:</strong> dry-run لا يكتب قاعدة البيانات. التأكيد يتطلب تطابق الملف والنطاق وتوكن قصير العمر، ثم يحفظ السجلات محلياً بحالة PENDING_REVIEW فقط.</div><Button onClick={runDryRun} disabled={!canRun} className="w-full bg-cyan-700 hover:bg-cyan-800">{dryRun.isPending ? "جارٍ فحص الملف…" : "تشغيل المحاكاة dry-run"}</Button>{dryRunResult && <div className="space-y-3 rounded-2xl border border-slate-200 p-4"><div className="grid grid-cols-2 gap-2 sm:grid-cols-5">{[["المستلم", dryRunResult.totals.received], ["صالح", dryRunResult.totals.valid], ["أخطاء", dryRunResult.totals.errors], ["تعارضات", dryRunResult.totals.conflicts], ["قابل للإدخال", dryRunResult.totals.importable]].map(([label, value]) => <div key={String(label)} className="rounded-xl bg-slate-50 p-3 text-center"><p className="text-[11px] text-slate-500">{label}</p><p className="mt-1 text-xl font-bold text-slate-900">{value}</p></div>)}</div>{dryRunResult.issues.length ? <div className="max-h-64 space-y-2 overflow-auto rounded-xl border border-rose-100 bg-rose-50/50 p-3">{dryRunResult.issues.map((issue, index) => <div key={`${issue.rowNumber}-${index}`} className="flex gap-2 text-xs leading-5"><span className="mt-0.5 shrink-0">{issue.severity === "error" ? <AlertCircle className="h-4 w-4 text-rose-600" /> : <AlertTriangle className="h-4 w-4 text-amber-600" />}</span><p><strong>صف {issue.rowNumber} · {issue.code}</strong><br />{issue.message}</p></div>)}</div> : <p className="flex items-center gap-2 rounded-xl bg-emerald-50 p-3 text-xs text-emerald-800"><CheckCircle2 className="h-4 w-4" />لا توجد أخطاء أو تعارضات. النتائج جاهزة للتأكيد.</p>}<div className="flex items-start gap-2"><input id="bulk-pending-review" type="checkbox" checked={acknowledge} onChange={event => setAcknowledge(event.target.checked)} disabled={Boolean(dryRunResult.totals.errors || dryRunResult.totals.conflicts)} className="mt-1" /><label htmlFor="bulk-pending-review" className="text-xs leading-5 text-slate-600">أؤكد أن هذه بيانات starter محلية غير موثقة، وأن كل سجل سيبقى PENDING_REVIEW ولن يستخدم كبيانات تشغيلية موثقة.</label></div><Button onClick={confirm} disabled={!acknowledge || Boolean(dryRunResult.totals.errors || dryRunResult.totals.conflicts) || confirmImport.isPending} className="w-full bg-[#0d1b2a]">{confirmImport.isPending ? "جارٍ التأكيد…" : "تأكيد الإدخال الآمن"}</Button><p className="text-[11px] text-slate-500">تنتهي صلاحية المحاكاة في {new Date(dryRunResult.expiresAt).toLocaleTimeString()}.</p></div>}{status && <p className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs leading-5 text-slate-600" role="status">{status}</p>}</CardContent></Card>;
}

function CatalogWorkspace() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<"medicine" | "cosmetic" | "medical_supply" | undefined>(undefined);
  const [reviewStatus, setReviewStatus] = useState<"UNVERIFIED" | "PENDING_REVIEW" | "VERIFIED" | "REJECTED">("PENDING_REVIEW");
  const [nameAr, setNameAr] = useState("");
  const [sku, setSku] = useState("");
  const [sourceAuthority, setSourceAuthority] = useState("LOCAL_PENDING_REVIEW");
  const [status, setStatus] = useState("");
  const registry = trpc.regional.registry.useQuery(undefined, { retry: false });
  const branchJurisdictions = trpc.regional.myBranchJurisdictions.useQuery(undefined, { retry: false });
  const jurisdictionId = registry.data?.find(country => country.status === "configured")?.profile?.id ?? branchJurisdictions.data?.find(item => item.assignment?.jurisdictionId != null && item.profile?.active === 1)?.assignment?.jurisdictionId;
  const catalog = trpc.erp.catalog.search.useQuery(hasJurisdictionScope(jurisdictionId) ? { jurisdictionId: jurisdictionId!, query, category } : skipToken, { retry: false });
  const reviewQueue = trpc.erp.catalog.reviewQueue.useQuery(hasJurisdictionScope(jurisdictionId) ? { jurisdictionId: jurisdictionId!, category, status: reviewStatus, query } : skipToken, { retry: false });
  const createItem = trpc.erp.catalog.createItem.useMutation();
  const approveItem = trpc.erp.catalog.approveItem.useMutation({ onSuccess: () => { void reviewQueue.refetch(); void catalog.refetch(); } });
  const submitItem = async () => {
    if (!jurisdictionId) { setStatus("لا يوجد اختصاص معتمد للكتالوج؛ يجب اعتماد حزمة الدولة أولاً."); return; }
    if (!nameAr.trim() || !sku.trim() || !category) { setStatus("اختر الفئة وأدخل الاسم العربي وSKU."); return; }
    try { const result = await createItem.mutateAsync({ jurisdictionId, category, nameAr, sku, sourceAuthority }); setStatus(`تم تسجيل الصنف #${result.itemId} بحالة ${result.verificationStatus}`); setNameAr(""); setSku(""); await reviewQueue.refetch(); } catch (error) { setStatus(error instanceof Error ? error.message : "تعذر تسجيل الصنف"); }
  };
  return <WorkspaceShell title="كتالوج الأصناف | المراجعة والاعتماد"><div className="space-y-4"><BulkCatalogImportPanel jurisdictionId={jurisdictionId} /><div className="rounded-2xl border border-cyan-100 bg-cyan-50/50 p-4"><div className="mb-3 flex items-center gap-2"><Plus className="h-4 w-4 text-cyan-700" /><p className="text-sm font-semibold text-cyan-950">إضافة سجل محلي للمراجعة</p></div><p className="mb-3 text-xs leading-5 text-slate-600">هذه سجلات بداية محلية تحمل provenance وحالة غير موثقة. لن تصبح VERIFIED إلا بعد اجتياز حزمة الأدلة المعتمدة على الخادم.</p><div className="grid gap-2 md:grid-cols-4"><Input value={nameAr} onChange={e => setNameAr(e.target.value)} placeholder="الاسم العربي" aria-label="اسم الصنف" /><Input value={sku} onChange={e => setSku(e.target.value)} placeholder="SKU داخلي" aria-label="SKU" /><select value={category ?? ""} onChange={e => setCategory((e.target.value || undefined) as typeof category)} className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm"><option value="">الفئة</option><option value="medicine">دواء</option><option value="cosmetic">تجميل</option><option value="medical_supply">مستلزم</option></select><Input value={sourceAuthority} onChange={e => setSourceAuthority(e.target.value)} placeholder="مصدر السجل" aria-label="مصدر السجل" /></div><div className="mt-3 flex flex-wrap items-center gap-3"><Button onClick={submitItem} disabled={createItem.isPending} className="bg-[#0d1b2a]">{createItem.isPending ? "جارٍ التسجيل…" : "إرسال للمراجعة"}</Button>{status && <Badge variant="outline">{status}</Badge>}</div></div><div className="flex flex-col gap-2 rounded-2xl border border-slate-200 bg-white p-3 sm:flex-row"><Input value={query} onChange={e => setQuery(e.target.value)} placeholder="بحث عربي أو إنجليزي أو SKU" aria-label="بحث الكتالوج" /><select value={reviewStatus} onChange={e => setReviewStatus(e.target.value as typeof reviewStatus)} className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm"><option value="PENDING_REVIEW">قيد المراجعة</option><option value="UNVERIFIED">غير موثق</option><option value="VERIFIED">موثق</option><option value="REJECTED">مرفوض</option></select><select value={category ?? ""} onChange={e => setCategory((e.target.value || undefined) as typeof category)} className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm"><option value="">كل الفئات</option><option value="medicine">أدوية</option><option value="cosmetic">تجميل</option><option value="medical_supply">مستلزمات</option></select></div>{reviewQueue.isLoading ? <p className="text-sm text-slate-500">جارٍ تحميل طابور المراجعة…</p> : reviewQueue.data?.length ? <div className="grid gap-3 lg:grid-cols-2">{reviewQueue.data.map(item => <div key={item.id} className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4"><div className="flex items-start justify-between gap-3"><div><p className="font-semibold text-slate-900">{item.nameAr}{item.nameEn ? ` · ${item.nameEn}` : ""}</p><p className="mt-1 text-xs text-slate-500">{item.sku} · {item.category}{item.manufacturer ? ` · ${item.manufacturer}` : ""}</p></div><Badge variant="outline">{item.verificationStatus}</Badge></div><div className="mt-3 grid gap-1 text-xs text-slate-600"><p>المصدر: {item.sourceAuthority}</p><p>معرّف المصدر: {item.sourceRecordId ?? "غير متاح"}</p><p>تاريخ الجمع: {item.sourceRetrievedAt ? new Date(item.sourceRetrievedAt).toLocaleDateString() : "غير متاح"}</p></div>{item.verificationStatus === "PENDING_REVIEW" && <div className="mt-3 flex gap-2"><Button size="sm" disabled={approveItem.isPending} onClick={() => approveItem.mutate({ itemId: item.id, approved: true })}>اعتماد بعد فحص الأدلة</Button><Button size="sm" variant="outline" disabled={approveItem.isPending} onClick={() => approveItem.mutate({ itemId: item.id, approved: false })}>رفض</Button></div>}</div>)}</div> : <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500"><Database className="mx-auto mb-2 h-6 w-6 text-slate-300" />لا توجد سجلات بهذه الحالة. لا يتم إنشاء بيانات افتراضية أو ادعاء اعتماد غير موثق.</div>}</div></WorkspaceShell>;
}
