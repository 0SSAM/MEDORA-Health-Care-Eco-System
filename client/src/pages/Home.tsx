// MEDORA | ميدورا — Integrated Health Care System
// Copyright (c) 2026 Hossam Naeim Osman | حسام نعيم عثمان. All rights reserved.
// Proprietary and confidential. Unauthorized copying, distribution, or use of this
// software, or of any portion of it, is strictly prohibited.
// Source: https://github.com/0SSAM/MEDORA-Health-Care-Eco-System
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { trpc } from "@/lib/trpc";
import { useLocalization } from "@/contexts/LocalizationContext";
import { listDurableOfflineDrafts, removeOfflineDraft, updateOfflineDraft, type OfflineDraft } from "@/lib/offlineQueue";
import { Activity, AlertCircle, AlertTriangle, ArrowLeftRight, BarChart3, Bell, Boxes, BrainCircuit, Building2, CheckCircle2, ChevronLeft, ClipboardCheck, Database, FileText, FlaskConical, HeartPulse, Keyboard, LayoutDashboard, Loader2, LockKeyhole, Menu, PackageSearch, PhoneCall, Plus, PlugZap, Receipt, Search, Settings2, ShieldCheck, ShoppingCart, Sparkles, Stethoscope, Ticket, UploadCloud, UserRound, Users, WalletCards, X } from "lucide-react";
import { skipToken } from "@tanstack/react-query";
import { Component, lazy, ReactNode, Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "wouter";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { IntegrationStatusStrip } from "@/components/IntegrationStatusNotice";
import { describeSearchMatch, smartSearch } from "@/lib/smartSearch";
import { OfflineStatusIndicator } from "@/components/OfflineStatusIndicator";

const HardwareWorkspace = lazy(() => import("@/components/HardwareWorkspace").then(module => ({ default: module.HardwareWorkspace })));
const SupplyChainWorkspace = lazy(() => import("@/components/SupplyChainWorkspace").then(module => ({ default: module.SupplyChainWorkspace })));
const EgyptHealthcareWorkspace = lazy(() => import("@/components/EgyptHealthcareWorkspace").then(module => ({ default: module.EgyptHealthcareWorkspace })));
const InsuranceWorkspace = lazy(() => import("@/components/IntegratedOperationsWorkspaces").then(module => ({ default: module.InsuranceWorkspace })));
const OrganizationWorkspace = lazy(() => import("@/components/IntegratedOperationsWorkspaces").then(module => ({ default: module.OrganizationWorkspace })));
const PromotionsWorkspace = lazy(() => import("@/components/IntegratedOperationsWorkspaces").then(module => ({ default: module.PromotionsWorkspace })));
const ReportsWorkspace = lazy(() => import("@/components/IntegratedOperationsWorkspaces").then(module => ({ default: module.ReportsWorkspace })));
const FinanceWorkspace = lazy(() => import("@/components/IntegratedOperationsWorkspaces").then(module => ({ default: module.FinanceWorkspace })));
const OperationsManagementWorkspace = lazy(() => import("@/components/OperationsManagementWorkspace").then(module => ({ default: module.OperationsManagementWorkspace })));
const NlmIcd10ReferencePanel = lazy(() => import("@/components/NlmIcd10ReferencePanel").then(module => ({ default: module.NlmIcd10ReferencePanel })));
const AuthenticationSettingsWorkspace = lazy(() => import("@/components/AuthenticationSettingsWorkspace").then(module => ({ default: module.AuthenticationSettingsWorkspace })));
const ConnectorAccreditationDashboard = lazy(() => import("@/components/ConnectorAccreditationDashboard").then(module => ({ default: module.ConnectorAccreditationDashboard })));
const TaxInvoiceWorkspace = lazy(() => import("@/components/TaxInvoiceWorkspace").then(module => ({ default: module.TaxInvoiceWorkspace })));
const AiGovernanceWorkspace = lazy(() => import("@/components/AiGovernanceWorkspace").then(module => ({ default: module.AiGovernanceWorkspace })));
const AiInsightsWorkspace = lazy(() => import("@/components/AiInsightsWorkspace").then(module => ({ default: module.AiInsightsWorkspace })));
const AntiFraudWorkspace = lazy(() => import("@/components/AntiFraudWorkspace").then(module => ({ default: module.AntiFraudWorkspace })));
const WhatsAppManagementWorkspace = lazy(() => import("@/components/IntegratedOperationsWorkspaces").then(module => ({ default: module.WhatsAppManagementWorkspace })));
function WorkspaceLoadingState() {
  return <Card className="border-cyan-200 bg-cyan-50/60"><CardContent className="flex min-h-40 items-center justify-center gap-3 p-6 text-sm text-cyan-900"><Loader2 className="h-5 w-5 animate-spin" /> جارٍ تحميل مساحة العمل…</CardContent></Card>;
}

function WorkspaceErrorState() {
  return <Card className="border-rose-200 bg-rose-50"><CardContent className="p-6 text-sm leading-6 text-rose-900">تعذر تحميل مساحة العمل الآن. أعد المحاولة أو اختر وحدة أخرى، ولن يتم تنفيذ أي عملية حساسة أثناء فشل التحميل.</CardContent></Card>;
}

class WorkspaceErrorBoundary extends Component<{ fallback: ReactNode; children: ReactNode }, { hasError: boolean }> {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  render() { return this.state.hasError ? this.props.fallback : this.props.children; }
}

function LazyWorkspace({ children }: { children: ReactNode }) {
  return <Suspense fallback={<WorkspaceLoadingState />}><WorkspaceErrorBoundary fallback={<WorkspaceErrorState />}>{children}</WorkspaceErrorBoundary></Suspense>;
}

const modules = [
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
  { id: "hr", label: "الموارد البشرية", searchText: "hr people employees workforce", icon: Users },
  { id: "crm", label: "علاقات العملاء CRM", searchText: "crm leads sales marketing", icon: Activity },
  { id: "customerCare", label: "خدمة العملاء", searchText: "customer care patients support", icon: UserRound },
  { id: "callCentre", label: "مركز الاتصال", searchText: "call center support tickets", icon: PhoneCall },
  { id: "whatsapp", label: "إدارة واتساب", searchText: "whatsapp messaging automation meta", icon: PhoneCall },
    { id: "catalog", label: "كتالوج الأصناف", searchText: "catalog medicines cosmetics supplies products", icon: Database },
    { id: "icd10", label: "بحث التشخيص المرجعي", searchText: "icd 10 icd10 diagnosis disease coding NLM", icon: Stethoscope },
  { id: "hardware", label: "إعداد الأجهزة والمحاكاة", searchText: "hardware printers scanners simulation devices", icon: Settings2 },
  { id: "security", label: "إعدادات الحماية والمصادقة", searchText: "security authentication 2fa two factor password recovery email otp", icon: LockKeyhole },
  { id: "connectors", label: "مركز الموصلات والاعتمادات", searchText: "connectors integrations government insurance accreditation readiness UPA EDA ETA UHIA", icon: PlugZap },
  { id: "aiGovernance", label: "الذكاء الاصطناعي والمراقبة", searchText: "ai governance operational analysis workplace monitoring privacy camera microphone", icon: BrainCircuit },
  { id: "aiInsights", label: "تحليلات المشتريات والقرار", searchText: "ai purchasing decision support improvement proposals demand anomalies", icon: Sparkles },
  { id: "antiFraud", label: "النزاهة ومكافحة الاحتيال", searchText: "anti fraud theft manipulation inventory cash procurement audit investigation", icon: ShieldCheck },
];

const organizationModules: Record<string, string[]> = { 
    government: ["overview", "compliance", "finance", "hr", "insurance", "egyptHealthcare", "icd10", "customerCare", "callCentre"], 
    pharmacy: ["overview", "pos", "inventory", "supplyChain", "prescriptions", "insurance", "promotions", "compliance", "hr", "crm", "customerCare", "callCentre", "whatsapp", "catalog", "icd10", "aiInsights", "antiFraud", "finance"], 
    pharmacy_chain: ["overview", "pos", "inventory", "supplyChain", "prescriptions", "insurance", "promotions", "compliance", "finance", "hr", "crm", "customerCare", "callCentre", "whatsapp", "catalog", "icd10", "aiInsights", "antiFraud"], 
    distributor: ["overview", "inventory", "supplyChain", "promotions", "compliance", "finance", "hr", "crm", "catalog", "aiInsights", "antiFraud", "customerCare"], 
    insurer: ["overview", "insurance", "compliance", "finance", "hr", "crm", "customerCare", "callCentre", "icd10"], 
    rehabilitation: ["overview", "prescriptions", "customerCare", "finance", "compliance", "hr", "icd10", "callCentre"], 
    hospital: ["overview", "inventory", "prescriptions", "insurance", "egyptHealthcare", "compliance", "finance", "hr", "crm", "customerCare", "icd10", "antiFraud", "callCentre"], 
    laboratory: ["overview", "prescriptions", "compliance", "finance", "hr", "customerCare", "icd10", "callCentre"], 
    radiology: ["overview", "prescriptions", "compliance", "finance", "hr", "customerCare", "icd10", "callCentre"] 
  };

const coreShortcuts: ReadonlyArray<{ key: string; label: string; description: string; module: string; roles: readonly string[] }> = [
  { key: "F2", label: "فاتورة بيع جديدة", description: "فتح نقطة البيع لبدء معاملة جديدة", module: "pos", roles: ["admin", "manager", "pharmacist", "cashier"] },
  { key: "F4", label: "المرتجعات", description: "فتح نقطة البيع لمراجعة المرتجع وفق الصلاحيات والسياسة", module: "pos", roles: ["admin", "manager", "pharmacist", "cashier"] },
  { key: "F6", label: "الوصفة الإلكترونية", description: "الوصول إلى التحقق والصرف المقيّد", module: "prescriptions", roles: ["admin", "manager", "pharmacist"] },
  { key: "F7", label: "المخزون", description: "فتح المخزون وFEFO", module: "inventory", roles: ["admin", "manager", "pharmacist"] },
  { key: "F8", label: "البحث الذكي", description: "تركيز البحث عن الوحدات", module: "overview", roles: ["admin", "manager", "pharmacist", "cashier"] },
  { key: "F9", label: "التقارير", description: "فتح المالية والتقارير", module: "finance", roles: ["admin", "manager"] },
  { key: "?", label: "دليل الاختصارات", description: "عرض الاختصارات المتاحة لهذا الدور", module: "overview", roles: ["admin", "manager", "pharmacist", "cashier", "user"] },
] as const;

const metrics = [
  { label: "مبيعات اليوم", value: "—", hint: "تظهر بعد ربط قاعدة البيانات", icon: Receipt, tone: "bg-cyan-50 text-cyan-700" },
  { label: "قيمة المخزون", value: "—", hint: "بانتظار بيانات الفروع", icon: Boxes, tone: "bg-violet-50 text-violet-700" },
  { label: "مطالبات معلقة", value: "—", hint: "حالة مباشرة من النظام", icon: ClipboardCheck, tone: "bg-amber-50 text-amber-700" },
  { label: "تنبيهات حرجة", value: "—", hint: "فحص يومي مجدول", icon: AlertTriangle, tone: "bg-rose-50 text-rose-700" },
];

export default function Home() {
  const { user, loading, logout } = useAuth();
  const [, setLocation] = useLocation();
  const [logoutError, setLogoutError] = useState("");
  const localization = useLocalization();
  const salesContactUrl = import.meta.env.VITE_MEDORA_SALES_CONTACT_URL as string | undefined;
  const [online, setOnline] = useState(() => typeof navigator === "undefined" ? true : navigator.onLine);
  const [offlineDrafts, setOfflineDrafts] = useState<OfflineDraft[]>([]);
  const serverDrafts = trpc.erp.offlineDrafts.listMine.useQuery(undefined, { enabled: Boolean(user) });
  const organizationsQuery = trpc.organizations.mine.useQuery(undefined, { enabled: Boolean(user) });
  const sessionInfoQuery = trpc.auth.sessionInfo.useQuery(undefined, { enabled: Boolean(user), retry: false });
  const isShowcaseSession = sessionInfoQuery.data?.authenticated === true && sessionInfoQuery.data.sessionMode === "showcase";
  const [selectedOrganizationId, setSelectedOrganizationId] = useState<number | null>(null);
  const notificationsQuery = trpc.notifications.list.useQuery({ organizationId: selectedOrganizationId }, { enabled: Boolean(user) });
  const markNotificationRead = trpc.notifications.markRead.useMutation({ onSuccess: () => { void notificationsQuery.refetch(); } });
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const organizationTypeLabels: Record<string, string> = { government: "جهة حكومية", pharmacy: "صيدلية فردية", pharmacy_chain: "سلسلة صيدليات", distributor: "شركة توزيع دواء", insurer: "شركة تأمين طبي", rehabilitation: "مركز تأهيل وعلاج طبيعي", hospital: "مستشفى", laboratory: "معمل تحاليل", radiology: "مركز أشعة" };
  const activeOrganizationType = organizationsQuery.data?.find(item => item.id === selectedOrganizationId)?.organizationType;
  const replayDraft = trpc.erp.offlineDrafts.replay.useMutation({ onSuccess: () => { void serverDrafts.refetch(); } });
  const enqueueDraft = trpc.erp.offlineDrafts.enqueue.useMutation();
  const syncInFlight = useRef(false);
  const [active, setActive] = useState(() => typeof window !== "undefined" && window.location.pathname === "/sales" ? "pos" : "overview");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [query, setQuery] = useState("");
  const role = user?.role as "admin" | "manager" | "pharmacist" | "cashier" | "user" | undefined;
  const allowedModules = useMemo(() => {
    if (!role) return modules.filter(item => item.id === "overview");
  const access: Record<string, string[]> = { overview: ["admin", "manager", "pharmacist", "cashier"], pos: ["admin", "manager", "pharmacist", "cashier"], inventory: ["admin", "manager", "pharmacist"], supplyChain: ["admin", "manager", "pharmacist"], prescriptions: ["admin", "manager", "pharmacist"], insurance: ["admin", "manager", "pharmacist"], compliance: ["admin", "manager", "pharmacist"], compounding: ["admin", "manager", "pharmacist"], finance: ["admin", "manager"], promotions: ["admin", "manager"], hr: ["admin", "manager"], crm: ["admin", "manager"], customerCare: ["admin", "manager", "pharmacist", "cashier"], callCentre: ["admin", "manager", "pharmacist", "cashier"], whatsapp: ["admin", "manager"], catalog: ["admin", "manager", "pharmacist"], icd10: ["admin", "manager", "pharmacist"], hardware: ["admin", "manager"], security: ["admin", "manager", "pharmacist", "cashier", "user"], connectors: ["admin"], aiGovernance: ["admin", "manager"], aiInsights: ["admin", "manager"], antiFraud: ["admin", "manager"] };
    const scopedModuleIds = activeOrganizationType ? organizationModules[activeOrganizationType] : undefined;
    return modules.filter(item => (access[item.id] ?? (item.id === "egyptHealthcare" ? ["admin", "manager", "pharmacist"] : [])).includes(role) && (!scopedModuleIds || item.id === "hardware" || item.id === "connectors" || item.id === "aiGovernance" || scopedModuleIds.includes(item.id)));
  }, [role, activeOrganizationType]);
  const activeModule = allowedModules.find(item => item.id === active) ?? allowedModules[0] ?? modules[0];
  const activeBranchId = localization.branchId;
  const activeJurisdictionId = localization.jurisdictionId;
  const filteredModuleResults = useMemo(() => smartSearch(allowedModules, query, ["label", "searchText"]), [allowedModules, query]);
  const filteredModules = filteredModuleResults.map(result => result.item);
  const searchCorrection = filteredModuleResults.find(result => result.matchedBy === "keyboard-layout");
  useEffect(() => {
    const firstOrganization = organizationsQuery.data?.[0];
    if (firstOrganization && selectedOrganizationId === null) setSelectedOrganizationId(firstOrganization.id);
  }, [organizationsQuery.data, selectedOrganizationId]);

  const availableShortcuts = useMemo(() => coreShortcuts.filter(shortcut => !role || shortcut.roles.includes(role)), [role]);
  const activateShortcut = (module: string) => {
    if (module === "overview") {
      setActive("overview");
      setQuery("");
      return;
    }
    if (allowedModules.some(item => item.id === module)) setActive(module);
  };

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.isComposing) return;
      const target = event.target as HTMLElement | null;
      if (target?.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target?.tagName ?? "")) return;
      if (event.key === "?" || (event.shiftKey && event.key === "/")) { event.preventDefault(); setShortcutsOpen(value => !value); return; }
      const shortcut = availableShortcuts.find(item => item.key.toLowerCase() === event.key.toLowerCase() && item.key !== "?");
      if (!shortcut) return;
      event.preventDefault();
      activateShortcut(shortcut.module);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [availableShortcuts, allowedModules]);

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
            await updateOfflineDraft(draft.id, { status: isConflict ? "conflict" : "failed", conflictReason: isConflict ? "تعارض أو تغير في نطاق السجل؛ يلزم مراجعة يدوية." : undefined, lastError: message, lastAttemptAt: Date.now() });
            setOfflineDrafts(current => current.map(item => item.id === draft.id ? { ...item, status: isConflict ? "conflict" : "failed", conflictReason: isConflict ? "تعارض أو تغير في نطاق السجل؛ يلزم مراجعة يدوية." : undefined, lastError: message } : item));
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
    navigator.serviceWorker?.controller?.postMessage({ type: "MEDORA_SYNC_STATUS" });
    void syncEligibleDrafts();
    return () => { window.removeEventListener("online", onOnline); window.removeEventListener("offline", onOffline); };
  }, [online, user, serverDrafts, enqueueDraft]);

  if (loading) return <div dir="rtl" className="medora-loading-shell relative grid min-h-screen place-items-center overflow-hidden bg-[#f4f7fb] px-6 text-slate-600"><div className="medora-loading-orb medora-loading-orb-one" aria-hidden="true" /><div className="medora-loading-orb medora-loading-orb-two" aria-hidden="true" /><div className="relative z-10 flex w-full max-w-sm flex-col items-center rounded-[2rem] border border-white/80 bg-white/75 px-8 py-10 text-center shadow-[0_24px_80px_rgba(13,27,42,0.12)] backdrop-blur-xl"><div className="medora-brand-mark grid h-16 w-16 place-items-center rounded-[1.35rem] shadow-lg shadow-cyan-900/10" aria-label="ميدورا"><svg viewBox="0 0 48 48" role="img" aria-hidden="true" className="h-10 w-10"><path d="M24 4 40 10v12c0 10.5-6.7 18.2-16 22-9.3-3.8-16-11.5-16-22V10L24 4Z" fill="#0d1b2a" opacity=".92"/><path d="M24 12c-5.5 3.8-8.5 8.1-8.5 12.9 0 5.6 3.8 9.5 8.5 11.1 4.7-1.6 8.5-5.5 8.5-11.1C32.5 20.1 29.5 15.8 24 12Z" fill="#9ff2e4"/><path d="M24 18c-2.4 2.5-3.6 4.8-3.6 7.1 0 2.4 1.4 4.2 3.6 5.2 2.2-1 3.6-2.8 3.6-5.2 0-2.3-1.2-4.6-3.6-7.1Z" fill="#19c5d1"/></svg></div><p className="mt-5 text-lg font-bold tracking-tight text-[#0d1b2a]">ميدورا | منظومة الرعاية الصحية المتكاملة</p><p className="mt-2 text-sm text-slate-500">جارٍ التحقق من جلسة الدخول…</p><div className="mt-6 h-1.5 w-40 overflow-hidden rounded-full bg-slate-100"><div className="medora-loading-bar h-full w-1/2 rounded-full bg-gradient-to-l from-cyan-500 to-teal-300" /></div></div></div>;

  return (
    <div dir={localization.direction} data-country={localization.countryCode} className="medora-app-shell min-h-screen text-slate-900">
      <aside className={cn("fixed inset-y-0 right-0 z-40 flex w-[286px] flex-col border-l border-slate-200 bg-[#0d1b2a] text-white transition-transform duration-200 lg:translate-x-0", mobileOpen ? "translate-x-0" : "translate-x-full")}>
        <div className="flex h-20 items-center justify-between border-b border-white/10 px-6">
          <div className="flex items-center gap-3"><div className="medora-brand-mark grid h-10 w-10 place-items-center rounded-2xl" aria-label="ميدورا"><svg viewBox="0 0 48 48" role="img" aria-hidden="true" className="h-7 w-7"><path d="M24 4 40 10v12c0 10.5-6.7 18.2-16 22-9.3-3.8-16-11.5-16-22V10L24 4Z" fill="#0d1b2a" opacity=".92"/><path d="M24 12c-5.5 3.8-8.5 8.1-8.5 12.9 0 5.6 3.8 9.5 8.5 11.1 4.7-1.6 8.5-5.5 8.5-11.1C32.5 20.1 29.5 15.8 24 12Z" fill="#9ff2e4"/><path d="M24 18c-2.4 2.5-3.6 4.8-3.6 7.1 0 2.4 1.4 4.2 3.6 5.2 2.2-1 3.6-2.8 3.6-5.2 0-2.3-1.2-4.6-3.6-7.1Z" fill="#19c5d1"/></svg></div><div><p className="font-bold tracking-tight">ميدورا | منظومة الرعاية الصحية المتكاملة</p><p className="text-[11px] text-cyan-200/70">MEDORA | Integrated Health System</p></div></div>
          <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 lg:hidden" onClick={() => setMobileOpen(false)}><X className="h-5 w-5" /></Button>
        </div>
        <div className="px-4 py-5"><p className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">مساحة العمل</p><div className="mb-4 rounded-2xl border border-white/10 bg-white/5 p-3"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="truncate text-sm font-semibold text-white">{user?.name || "المستخدم المصادق"}</p><p className="mt-1 text-[11px] text-cyan-200/70">{user?.role || "دون دور"}{isShowcaseSession ? " · حساب عرض" : " · حساب مؤسسي"}</p></div><UserRound className="mt-0.5 h-4 w-4 shrink-0 text-cyan-200" /></div><Button type="button" variant="outline" size="sm" className="mt-3 w-full border-white/20 bg-transparent text-white hover:bg-white/10 hover:text-white" onClick={async () => { setLogoutError(""); try { await logout(); setLocation("/login"); } catch { setLogoutError("تعذر إنهاء الجلسة. حاول مرة أخرى."); } }}>تسجيل الخروج</Button>{logoutError && <p role="alert" className="mt-2 text-[11px] leading-5 text-rose-200">{logoutError}</p>}</div><p className="mb-3 px-3 text-xs text-cyan-200/70">{user ? `الدور: ${user.role}` : "الوضع العام: تسجيل الدخول مطلوب"}</p><nav className="space-y-1">{filteredModules.map(item => { const Icon = item.icon; const selected = active === item.id; return <button key={item.id} onClick={() => { setActive(item.id); setMobileOpen(false); }} className={cn("flex w-full items-center gap-3 rounded-xl px-3 py-3 text-right text-sm transition", selected ? "bg-cyan-400 font-semibold text-[#0d1b2a] shadow-lg shadow-cyan-950/20" : "text-slate-300 hover:bg-white/10 hover:text-white")}><Icon className="h-[18px] w-[18px]" /><span>{item.label}</span>{selected && <ChevronLeft className="mr-auto h-4 w-4" />}</button>; })}</nav></div>
        <div className="mt-auto border-t border-white/10 p-4"><div className="rounded-2xl bg-white/5 p-4"><div className="mb-3 flex items-center gap-2 text-cyan-200"><LockKeyhole className="h-4 w-4" /><span className="text-xs font-semibold">حماية مؤسسية</span></div><p className="text-xs leading-6 text-slate-400">صلاحيات الخادم، سجل تدقيق، وقواعد FEFO مركزية للعمليات الحساسة.</p></div></div>
      </aside>
      {mobileOpen && <button aria-label="إغلاق القائمة" className="fixed inset-0 z-30 bg-slate-950/40 lg:hidden" onClick={() => setMobileOpen(false)} />}

      <main className="lg:mr-[286px]">
        <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/75 px-4 py-4 backdrop-blur-xl sm:px-8"><div className="flex items-center gap-3"><Button variant="outline" size="icon" className="lg:hidden" onClick={() => setMobileOpen(true)}><Menu className="h-5 w-5" /></Button><div className="min-w-0 flex-1"><p className="text-xs font-medium text-slate-500">الثلاثاء، ١٤ أغسطس ٢٠٢٦</p><h1 className="truncate text-xl font-bold tracking-tight sm:text-2xl">{activeModule.label}</h1></div><div className="hidden w-64 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 sm:flex"><Search className="h-4 w-4 text-slate-400" /><Input value={query} onChange={e => setQuery(e.target.value)} placeholder="ابحث بالعربية أو English…" aria-label="البحث الذكي في الوحدات" className="border-0 bg-transparent px-0 shadow-none focus-visible:ring-0" />{query.trim() && <span className="sr-only" aria-live="polite">{searchCorrection ? describeSearchMatch(searchCorrection) : filteredModules.length ? `${filteredModules.length} نتائج` : "لا توجد نتائج"}</span>}</div>{localization.branches.length > 0 && <select value={localization.branchId ?? ""} onChange={event => localization.setBranchId(Number(event.target.value))} aria-label="اختيار الفرع" className="hidden h-9 max-w-40 rounded-lg border border-slate-200 bg-white px-2 text-xs sm:block"><option value="" disabled>اختر الفرع</option>{localization.branches.map(branch => <option key={branch.id} value={branch.id}>{branch.nameAr} · {branch.countryCode}</option>)}</select>}<Badge variant="outline" className="hidden bg-white px-3 py-2 text-xs sm:flex">{localization.countryCode} · {localization.currencyCode}</Badge><LanguageSwitcher compact /><Badge variant="outline" className={cn("hidden px-3 py-2 text-xs sm:flex", online ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700")}>{online ? "متصل" : "وضع محدود: مسودات غير منظمة فقط"}</Badge><div className="flex items-center gap-2"><Button variant="outline" size="icon" className="bg-white" aria-label="دليل الاختصارات" title="دليل الاختصارات (?)" onClick={() => setShortcutsOpen(true)}><Keyboard className="h-4 w-4" /></Button><div className="relative"><Button variant="outline" size="icon" className="relative bg-white" aria-label="الإشعارات" onClick={() => setNotificationOpen(value => !value)}><Bell className="h-4 w-4" />{Boolean(notificationsQuery.data?.unreadCount) && <span className="absolute -left-1 -top-1 grid min-h-4 min-w-4 place-items-center rounded-full bg-rose-500 px-1 text-[9px] font-bold text-white">{notificationsQuery.data?.unreadCount}</span>}</Button>{notificationOpen && <div className="absolute left-0 top-11 z-50 w-[min(22rem,calc(100vw-2rem))] rounded-2xl border border-slate-200 bg-white p-3 text-right shadow-xl"><div className="mb-2 flex items-center justify-between"><p className="text-sm font-bold text-slate-900">الإشعارات</p><button className="text-xs text-slate-400 hover:text-slate-700" onClick={() => setNotificationOpen(false)}>إغلاق</button></div>{!user ? <p className="rounded-xl bg-slate-50 p-3 text-xs leading-5 text-slate-500">الإشعارات التشغيلية تظهر بعد تسجيل الدخول.</p> : notificationsQuery.isLoading ? <p className="p-3 text-xs text-slate-500">جارٍ تحميل الإشعارات…</p> : notificationsQuery.data?.items.length ? <div className="max-h-80 space-y-2 overflow-auto">{notificationsQuery.data.items.map(item => <button key={item.id} className={cn("w-full rounded-xl border p-3 text-right transition hover:bg-slate-50", item.isRead ? "border-slate-100 bg-white" : "border-cyan-100 bg-cyan-50/50")} onClick={() => { if (!item.isRead) markNotificationRead.mutate({ notificationId: item.id }); }}><div className="flex items-start justify-between gap-3"><span className="text-sm font-semibold text-slate-900">{item.title}</span><span className="text-[10px] text-slate-400">{item.severity}</span></div><p className="mt-1 text-xs leading-5 text-slate-600">{item.body}</p></button>)}</div> : <p className="rounded-xl bg-slate-50 p-3 text-xs leading-5 text-slate-500">لا توجد إشعارات جديدة.</p>}</div>}</div></div>{user ? <Badge variant="secondary" className="hidden gap-2 px-3 py-2 sm:flex"><span className="h-2 w-2 rounded-full bg-emerald-500" />{user.name || "مستخدم"}</Badge> : <Button onClick={() => { window.location.href = "/login"; }} className="hidden bg-[#0d1b2a] sm:flex">تسجيل الدخول</Button>}</div></header>
        <div className="mx-auto max-w-[1500px] space-y-6 p-4 sm:p-8">
          {isShowcaseSession && <Card className="border-amber-200 bg-amber-50/80 shadow-sm" role="status"><CardContent className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-bold text-amber-950">مساحة عرض استثمارية · Investor Showcase</p><p className="mt-1 text-sm leading-6 text-amber-900">أنت تعمل داخل مؤسسة عرض معزولة. البيانات اصطناعية، والعمليات التجريبية لا تغيّر أرصدة الإنتاج ولا تتصل بجهات خارجية.</p></div><Badge variant="outline" className="w-fit border-amber-300 bg-white text-amber-900">محاكاة غير إنتاجية</Badge></CardContent></Card>}
          <IntegrationStatusStrip />
          <OfflineStatusIndicator online={online} drafts={offlineDrafts} serverPendingCount={serverDrafts.data?.length ?? 0} onRefresh={async () => { await serverDrafts.refetch(); const latest = await listDurableOfflineDrafts(); setOfflineDrafts(latest); }} onRetryConflict={async () => { const latest = await listDurableOfflineDrafts(); setOfflineDrafts(latest); }} />
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{metrics.map(metric => { const Icon = metric.icon; return <Card key={metric.label} className="border-0 shadow-sm shadow-slate-200/60"><CardContent className="p-5"><div className="mb-5 flex items-start justify-between"><div className={cn("grid h-11 w-11 place-items-center rounded-2xl", metric.tone)}><Icon className="h-5 w-5" /></div><span className="text-xs font-medium text-slate-400">اليوم</span></div><p className="text-sm text-slate-500">{metric.label}</p><p className="mt-1 text-3xl font-bold tracking-tight">{metric.value}</p><p className="mt-2 text-xs text-slate-400">{metric.hint}</p></CardContent></Card>; })}</section>
          {shortcutsOpen && <Card className="border-cyan-100 bg-white shadow-sm shadow-slate-200/60" role="dialog" aria-modal="false" aria-labelledby="shortcuts-title"><CardHeader className="flex-row items-center justify-between space-y-0"><div><CardTitle id="shortcuts-title" className="flex items-center gap-2 text-lg"><Keyboard className="h-5 w-5 text-cyan-700" />الاختصارات الأساسية</CardTitle><p className="mt-1 text-sm text-slate-500">تعمل داخل التطبيق فقط، وتتوقف تلقائياً أثناء الكتابة في الحقول.</p></div><Button variant="ghost" size="sm" onClick={() => setShortcutsOpen(false)}>إغلاق</Button></CardHeader><CardContent className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">{availableShortcuts.map(shortcut => <button key={shortcut.key} onClick={() => { activateShortcut(shortcut.module); setShortcutsOpen(false); }} className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 text-right transition hover:border-cyan-300 hover:bg-cyan-50"><kbd className="min-w-10 rounded-lg border border-slate-300 bg-white px-2 py-1 text-center text-xs font-bold text-slate-700">{shortcut.key}</kbd><span><span className="block text-sm font-semibold text-slate-900">{shortcut.label}</span><span className="mt-1 block text-xs leading-5 text-slate-500">{shortcut.description}</span></span></button>)}</CardContent></Card>}
          {user && <Card className="border-cyan-100 bg-white shadow-sm shadow-slate-200/60"><CardHeader className="flex-row items-center justify-between space-y-0"><div><CardTitle className="text-lg">مساحة المؤسسة</CardTitle><p className="mt-1 text-sm text-slate-500">يعرض هذا النطاق المؤسسات المرتبطة بحسابك فقط. اختيار النطاق لا يمنح صلاحيات إضافية.</p></div><Badge variant="outline" className="border-cyan-200 bg-cyan-50 text-cyan-800">عزل مؤسسي</Badge></CardHeader><CardContent>{organizationsQuery.isLoading ? <p className="text-sm text-slate-500">جارٍ تحميل المؤسسات المصرح بها…</p> : organizationsQuery.data?.length ? <div className="flex flex-wrap items-center gap-3"><select value={selectedOrganizationId ?? ""} onChange={event => setSelectedOrganizationId(Number(event.target.value))} aria-label="اختيار المؤسسة" className="h-10 min-w-64 rounded-xl border border-slate-200 bg-white px-3 text-sm"><option value="" disabled>اختر المؤسسة</option>{organizationsQuery.data.map(organization => <option key={organization.id} value={organization.id}>{organization.displayName} · {organizationTypeLabels[organization.organizationType] ?? organization.organizationType}</option>)}</select><div className="rounded-xl bg-slate-50 px-4 py-2 text-xs text-slate-600">{organizationsQuery.data.find(item => item.id === selectedOrganizationId)?.countryCode ?? "—"} · الصلاحية خادمية</div></div> : <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">لا توجد مؤسسة نشطة مرتبطة بهذا الحساب حتى الآن. لا يتم إنشاء نطاق افتراضي أو منح وصول تلقائي.</div>}</CardContent></Card>}
          {user && <LazyWorkspace><ModulePanel active={active} organizationId={selectedOrganizationId} branchId={activeBranchId} jurisdictionId={activeJurisdictionId} /></LazyWorkspace>}
          {offlineDrafts.length > 0 && <Card className="border-amber-200 bg-amber-50/60 shadow-sm"><CardHeader className="flex-row items-center justify-between space-y-0"><div><CardTitle className="text-lg text-amber-950">الوضع المحدود والمسودات المحلية</CardTitle><p className="mt-1 text-sm text-amber-800">يُسمح بالمسودات غير المنظمة فقط. البيع والوصفات والفوترة وإعادة التشغيل تبقى محجوبة حتى عودة الاتصال والتحقق من الصلاحيات والجهاز.</p></div><Badge variant="outline" className="border-amber-300 bg-white text-amber-800">{offlineDrafts.length} مسودة</Badge></CardHeader><CardContent className="space-y-2">{offlineDrafts.slice(0, 4).map(draft => <div key={draft.id} className="flex items-center justify-between gap-3 rounded-xl border border-amber-200 bg-white px-3 py-2 text-sm"><div><span className="font-medium text-slate-800">{draft.module}</span><span className="mr-2 text-xs text-slate-500">{draft.status === "conflict" ? "تعارض يحتاج مراجعة" : "في الانتظار"}</span></div><Button variant="ghost" size="sm" className="text-amber-800" onClick={() => { removeOfflineDraft(draft.id); setOfflineDrafts(current => current.filter(item => item.id !== draft.id)); }}>إزالة</Button></div>)}</CardContent></Card>}
          {user && (serverDrafts.data?.length ?? 0) > 0 && <Card className="border-cyan-200 bg-cyan-50/50 shadow-sm"><CardHeader className="flex-row items-center justify-between space-y-0"><div><CardTitle className="text-lg text-cyan-950">مسودات الخادم القابلة لإعادة التشغيل</CardTitle><p className="mt-1 text-sm text-cyan-800">هذه المسودات تخص خدمة العملاء ومركز الاتصال فقط، ولا تشمل البيع أو الوصفات أو الفوترة. إعادة التشغيل تتطلب اتصالاً وجهازاً موثوقاً.</p></div><Badge variant="outline" className="border-cyan-300 bg-white text-cyan-800">{serverDrafts.data?.length} محفوظة</Badge></CardHeader><CardContent className="space-y-2">{serverDrafts.data?.slice(0, 6).map(draft => <div key={draft.id} className="flex items-center justify-between gap-3 rounded-xl border border-cyan-200 bg-white px-3 py-2 text-sm"><div><span className="font-medium text-slate-800">{draft.module === "customerCare" ? "خدمة العملاء" : "مركز الاتصال"}</span><span className="mr-2 text-xs text-slate-500">{draft.status === "queued" ? "جاهزة للمراجعة وإعادة التشغيل" : draft.status === "replayed" ? "أعيد تشغيلها" : "تحتاج مراجعة"}</span></div>{draft.status === "queued" && <span title="يتطلب جهازاً موثوقاً قبل إعادة التشغيل" className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-800">محجوبة: تحقق الجهاز مطلوب</span>}</div>)}</CardContent></Card>}
          <section className="grid gap-6 xl:grid-cols-[1.45fr_1fr]">
            <Card className="border-0 shadow-sm shadow-slate-200/60"><CardHeader className="flex-row items-center justify-between space-y-0"><div><CardTitle className="text-lg">مركز العمليات</CardTitle><p className="mt-1 text-sm text-slate-500">ابدأ من الوحدة المناسبة لإدارة دورة العمل.</p></div><Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50">جاهز للتهيئة</Badge></CardHeader><CardContent className="grid gap-3 sm:grid-cols-2">{[[ShoppingCart,"نقطة البيع","صرف جزئي، خصم MOH، إيصال ETA","pos"],[PackageSearch,"المخزون","FEFO، التشغيلات، الصلاحيات","inventory"],[BrainCircuit,"الوصفة الذكية","رفع ومراجعة الوصفة بالرؤية","prescriptions"],[UserRound,"خدمة العملاء","ملفات العملاء والمتابعة والموافقات","customerCare"],[Activity,"إدارة علاقات العملاء CRM","الفرص والطلبات والتحليلات","crm"],[Users,"الموارد البشرية HR","إدارة الموظفين والصلاحيات","hr"]].map(([Icon,title,desc,id]) => <button key={title as string} onClick={() => setActive(id as string)} className="group rounded-2xl border border-slate-200 bg-white p-4 text-right transition hover:-translate-y-0.5 hover:border-cyan-300 hover:shadow-md"><div className="mb-4 flex items-center justify-between"><div className="grid h-10 w-10 place-items-center rounded-xl bg-slate-100 text-slate-700 group-hover:bg-cyan-50 group-hover:text-cyan-700"><Icon className="h-5 w-5" /></div><ChevronLeft className="h-4 w-4 text-slate-300 group-hover:text-cyan-600" /></div><p className="font-semibold">{title as string}</p><p className="mt-1 text-xs leading-5 text-slate-500">{desc as string}</p></button>)}</CardContent></Card>
            <Card className="border-0 bg-[#0d1b2a] text-white shadow-sm shadow-slate-300"><CardHeader><div className="flex items-center gap-3"><div className="grid h-10 w-10 place-items-center rounded-xl bg-cyan-400/15 text-cyan-300"><Activity className="h-5 w-5" /></div><div><CardTitle className="text-white">حالة المنظومة</CardTitle><p className="mt-1 text-sm text-slate-400">مراقبة الخدمات الأساسية</p></div></div></CardHeader><CardContent className="space-y-5"><div><div className="mb-2 flex justify-between text-sm"><span className="text-slate-300">المصادقة والصلاحيات</span><span className="text-emerald-300">محمية</span></div><Progress value={100} className="h-2 bg-white/10" /></div><div><div className="mb-2 flex justify-between text-sm"><span className="text-slate-300">قواعد المخزون FEFO</span><span className="text-emerald-300">مفعلة</span></div><Progress value={100} className="h-2 bg-white/10" /></div><div><div className="mb-2 flex justify-between text-sm"><span className="text-slate-300">التنبيهات المجدولة</span><span className="text-amber-300">بانتظار النشر</span></div><Progress value={45} className="h-2 bg-white/10" /></div><div className="flex items-center gap-2 border-t border-white/10 pt-4 text-xs text-slate-400"><Building2 className="h-4 w-4" /> متعدد الفروع · عزل حسب الدولة · سجل تدقيق</div></CardContent></Card>
          </section>
          <section className="grid gap-6 lg:grid-cols-3"><Card className="border-0 shadow-sm shadow-slate-200/60 lg:col-span-2"><CardHeader className="flex-row items-center justify-between space-y-0"><div><CardTitle className="text-lg">آخر النشاطات</CardTitle><p className="mt-1 text-sm text-slate-500">ستظهر الأحداث بعد تسجيل الدخول وربط الفروع.</p></div><Button variant="ghost" className="text-cyan-700">سجل التدقيق <ChevronLeft className="mr-1 h-4 w-4" /></Button></CardHeader><CardContent><div className="grid place-items-center rounded-2xl border border-dashed border-slate-300 bg-slate-50/70 px-6 py-12 text-center"><FileText className="mb-3 h-8 w-8 text-slate-300" /><p className="font-medium text-slate-600">لا توجد أحداث معروضة بعد</p><p className="mt-1 max-w-sm text-sm leading-6 text-slate-400">لن يتم إنشاء بيانات تجريبية. سيعرض النظام السجلات الفعلية فقط بعد تهيئة الفروع والمستخدمين.</p></div></CardContent></Card><Card className="border-0 shadow-sm shadow-slate-200/60"><CardHeader><CardTitle className="text-lg">قواعد لا يمكن تجاوزها</CardTitle></CardHeader><CardContent className="space-y-4"><div className="flex gap-3"><ShieldCheck className="h-5 w-5 shrink-0 text-emerald-600" /><p className="text-sm leading-6 text-slate-600">الخصم الأقصى <strong>٧٪</strong> وفق محرك MOH على الخادم.</p></div><div className="flex gap-3"><PackageSearch className="h-5 w-5 shrink-0 text-cyan-600" /><p className="text-sm leading-6 text-slate-600">الصرف من أقرب تاريخ انتهاء عبر FEFO.</p></div><div className="flex gap-3"><Stethoscope className="h-5 w-5 shrink-0 text-violet-600" /><p className="text-sm leading-6 text-slate-600">الوصفة الذكية تحتاج مراجعة صيدلي قبل الصرف.</p></div></CardContent></Card></section>
        </div>
      </main>
    </div>
  );
}

function ModulePanel({ active, organizationId, branchId, jurisdictionId }: { active: string; organizationId: number | null; branchId: number | null; jurisdictionId: number | null }) {
  const panels: Record<string, { title: string; description: string; items: string[] }> = {
    overview: { title: "ملخص التشغيل", description: "نظرة آمنة لا تعرض أرقاماً غير موجودة في قاعدة البيانات.", items: ["مؤشرات الفروع", "التنبيهات الحرجة", "حالة التكاملات"] },
    pos: { title: "نقطة البيع", description: "العمليات الحساسة ستُنفذ على الخادم مع خصم أقصى ٧٪ وFEFO.", items: ["صرف كسري للوحدات", "تحقق MOH قبل الإتمام", "حالة إيصال ETA"] },
    inventory: { title: "المخزون و FEFO", description: "ترتيب التشغيلات حسب أقرب انتهاء مع تنبيهات نقطة إعادة الطلب.", items: ["رقم التشغيلة والانتهاء", "نقل بين الفروع", "مرتجعات وتالف"] },
    prescriptions: { title: "الوصفة الذكية", description: "ارفع صورة الوصفة ليقوم النموذج المدمج بالاستخراج، ثم يراجعها الصيدلي.", items: ["رفع صورة آمن", "أسماء وجرعات وكميات", "تأكيد صيدلي إلزامي"] },
    insurance: { title: "التأمين والمطالبات", description: "دورة مطالبة قابلة للتدقيق مع حالة رفض ومبالغ معلقة.", items: ["موافقة مسبقة", "25 مزود TPA", "تقارير aging"] },
    compliance: { title: "الامتثال الإقليمي", description: "كل دولة لها ملف ومصادر وحزمة قواعد مستقلة؛ لا تُفعل العمليات المنظمة قبل اعتماد الحزمة وتحديث أدلتها.", items: ["ملف دولة مستقل", "حزمة قواعد بإصدار", "أدلة ومراجعة بشرية"] },
    compounding: { title: "التحضير الصيدلي", description: "تركيبات وBOM وتكلفة مع سجل مسؤولية.", items: ["تركيبة ومكونات", "خصم BOM", "تتبع التحضير المعقم"] },
    finance: { title: "المالية والتقارير", description: "تقارير على بيانات فعلية مع حدود دفع وتسوية واضحة.", items: ["دفتر وحركة نقدية", "Meeza / InstaPay", "تسوية ومراجعة"] },
    hr: { title: "الموارد البشرية وإدارة الموظفين", description: "إدارة الحسابات والأدوار وسجلات الموظفين ضمن نطاق المؤسسة.", items: ["حسابات الموظفين", "الأدوار والصلاحيات", "سجلات الموظفين"] },
    crm: { title: "إدارة علاقات العملاء CRM", description: "إدارة الفرص والموافقات والطلبات التشغيلية بخصوصية تامة.", items: ["فرص CRM", "موافقات العملاء", "طلبات الشراء"] },
    customerCare: { title: "خدمة العملاء", description: "ملفات العملاء، الموافقات، المتابعة، والشكاوى مع سجل قابل للتدقيق.", items: ["ملف عميل", "متابعة علاجية", "موافقة وخصوصية"] },
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
  if (active === "compliance") return <RegionalComplianceWorkspace />;
  if (active === "pos") return <SalesFinanceWorkspace branchId={branchId} jurisdictionId={jurisdictionId} />;
  if (active === "inventory") return <SupplyChainWorkspace branchId={branchId} jurisdictionId={jurisdictionId} />;
  if (active === "prescriptions") return <PrescriptionWorkspace />;
  if (active === "customerCare") return <CustomerCareWorkspace />;
  if (active === "callCentre") return <CallCentreWorkspace />;
  if (active === "catalog") return <CatalogWorkspace />;
  if (active === "icd10") return <NlmIcd10ReferencePanel />;
  if (active === "hardware") return <HardwareWorkspace />;
  if (active === "aiGovernance") return <AiGovernanceWorkspace organizationId={organizationId} />;
  if (active === "aiInsights") return <AiInsightsWorkspace organizationId={organizationId} branchId={branchId} jurisdictionId={jurisdictionId} />;
  if (active === "antiFraud") return <AntiFraudWorkspace organizationId={organizationId} branchId={branchId} />;
     if (active === "security") return <AuthenticationSettingsWorkspace />;
   if (active === "connectors") return <ConnectorAccreditationDashboard />;

  if (active === "supplyChain") return <SupplyChainWorkspace branchId={branchId} jurisdictionId={jurisdictionId} />;
  if (active === "egyptHealthcare") return <EgyptHealthcareWorkspace organizationId={organizationId} branchId={branchId} jurisdictionId={jurisdictionId} />;
  if (active === "insurance") return <InsuranceWorkspace organizationId={organizationId} jurisdictionId={jurisdictionId} branchId={branchId} />;
  if (active === "finance") return <FinanceWorkspace organizationId={organizationId} jurisdictionId={jurisdictionId} branchId={branchId} />;
  if (active === "hr") return <div className="space-y-5"><OrganizationWorkspace organizationId={organizationId} /><OperationsManagementWorkspace organizationId={organizationId} branchId={branchId} jurisdictionId={jurisdictionId} section="hr" /></div>;
  if (active === "crm") return <OperationsManagementWorkspace organizationId={organizationId} branchId={branchId} jurisdictionId={jurisdictionId} section="crm" />;
  if (active === "promotions") return <PromotionsWorkspace organizationId={organizationId} jurisdictionId={jurisdictionId} branchId={branchId} />;
  if (active === "whatsapp") return <WhatsAppManagementWorkspace organizationId={organizationId} />;
  return <Card className="overflow-hidden border-0 bg-white shadow-sm shadow-slate-200/60"><CardContent className="p-0"><div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6"><div><div className="mb-2 flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-cyan-500" /><span className="text-xs font-semibold uppercase tracking-[0.14em] text-cyan-700">مساحة عمل</span></div><h2 className="text-xl font-bold tracking-tight">{panel.title}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">{panel.description}</p></div><div className="grid grid-cols-1 gap-2 sm:min-w-[300px] sm:grid-cols-3">{panel.items.map(item => <div key={item} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-center text-xs font-medium text-slate-600">{item}</div>)}</div></div></CardContent></Card>;
}

function SalesFinanceWorkspace({ branchId, jurisdictionId }: { branchId: number | null; jurisdictionId: number | null }) {
  return <TaxInvoiceWorkspace branchId={branchId} jurisdictionId={jurisdictionId} />;
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
  const assignedJurisdictionId = branchJurisdictions.data?.find(item => item.assignment?.jurisdictionId && item.profile?.active === 1)?.assignment?.jurisdictionId;
  const jurisdictionId = selectedCountry?.profile?.id ?? assignedJurisdictionId;
  const packs = trpc.regional.listPacks.useQuery(jurisdictionId ? { jurisdictionId } : skipToken, { retry: false });
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
  return <WorkspaceShell title="إدارة الدول وحزم الامتثال"><div className="space-y-4"><div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950"><strong>بوابة الاعتماد:</strong> لا يُعتبر أي بلد جاهزاً للعمليات المنظمة بمجرد إدخاله. يجب وجود ملف نشط، حزمة معتمدة، أدلة رسمية، وتاريخ مراجعة غير منتهٍ.</div><div className="grid gap-3 sm:grid-cols-3"><div className="rounded-xl bg-emerald-50 p-4"><p className="text-xs text-emerald-700">دول مهيأة</p><p className="mt-1 text-2xl font-bold text-emerald-900">{configured}</p></div><div className="rounded-xl bg-slate-100 p-4"><p className="text-xs text-slate-600">تحتاج إعداداً أو اعتماداً</p><p className="mt-1 text-2xl font-bold text-slate-900">{pending}</p></div><div className="rounded-xl bg-cyan-50 p-4"><p className="text-xs text-cyan-700">إجمالي السجل العربي</p><p className="mt-1 text-2xl font-bold text-cyan-900">{registry.data?.length ?? 0}</p></div></div>{registry.isLoading ? <p className="text-sm text-slate-500">جارٍ تحميل سجل الدول…</p> : registry.error ? <p className="rounded-xl bg-rose-50 p-4 text-sm text-rose-700">تعذر تحميل حالة الدول؛ ستظل العمليات المنظمة محجوبة.</p> : <><div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">{registry.data?.map(country => <button key={country.countryCode} onClick={() => setSelectedCode(country.countryCode)} className={cn("flex items-center justify-between rounded-xl border bg-white p-3 text-right transition", selectedCountry?.countryCode === country.countryCode ? "border-cyan-400 ring-2 ring-cyan-100" : "border-slate-200 hover:border-cyan-200")}><div><p className="font-medium">{country.countryNameAr}</p><p className="text-xs text-slate-500">{country.countryCode}</p></div><Badge variant={country.status === "configured" ? "default" : "outline"}>{country.status === "configured" ? "مهيأ" : "غير معتمد"}</Badge></button>)}</div><div className="grid gap-4 lg:grid-cols-[.8fr_1.2fr]"><Card className="border-slate-200 shadow-none"><CardHeader><CardTitle className="text-base">الملف المحدد</CardTitle></CardHeader><CardContent className="space-y-3 text-sm">{selectedCountry ? <><div><p className="font-semibold">{selectedCountry.countryNameAr} · {selectedCountry.countryCode}</p><p className="mt-1 text-xs text-slate-500">{selectedCountry.profile?.legalAuthorityProfile ?? "لا يوجد ملف قانوني محفوظ"}</p></div><p className="text-xs leading-5 text-slate-500">الحالة: {selectedCountry.status}. لا يتم حفظ اختيار المستخدم محلياً ولا يتحول إلى اختصاص قانوني دون تعيين فرع مؤكد من الخادم.</p>{isAdmin && selectedCountry.profile && <Button variant="outline" disabled={approveProfile.isPending} onClick={() => approveProfile.mutate({ jurisdictionId: selectedCountry.profile!.id, approved: !selectedCountry.profile!.active })}>{selectedCountry.profile.active ? "تعطيل الملف" : "تفعيل الملف بعد المراجعة"}</Button>}</> : <p className="text-slate-500">لا يوجد ملف محدد.</p>}</CardContent></Card><Card className="border-slate-200 shadow-none"><CardHeader><CardTitle className="text-base">حزم الامتثال والأدلة</CardTitle></CardHeader><CardContent className="space-y-3">{jurisdictionId && packs.data?.length ? <><select value={selectedPack?.id ?? ""} onChange={event => setSelectedPackId(Number(event.target.value))} className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm" aria-label="حزمة الامتثال">{packs.data.map(pack => <option key={pack.id} value={pack.id}>الإصدار {pack.packVersion} · {pack.status}</option>)}</select><div className="space-y-2">{evidence.data?.length ? evidence.data.map(item => <div key={item.id} className="rounded-xl border border-slate-200 p-3"><div className="flex items-start justify-between gap-3"><div><p className="font-medium">{item.ruleKey ?? item.catalogField ?? item.operation}</p><p className="text-xs text-slate-500">{item.authorityName} · {item.sourceRecordId ?? "بدون رقم مرجعي"}</p></div><Badge variant={item.verificationStatus === "verified" ? "default" : "outline"}>{item.verificationStatus === "verified" ? "موثق" : item.verificationStatus === "rejected" ? "مرفوض" : "قيد المراجعة"}</Badge></div>{isAdmin && item.verificationStatus === "review" && <div className="mt-2 flex gap-2"><Button size="sm" onClick={() => verifyEvidence.mutate({ evidenceId: item.id, decision: "verified" })}>توثيق</Button><Button size="sm" variant="outline" onClick={() => verifyEvidence.mutate({ evidenceId: item.id, decision: "rejected" })}>رفض</Button></div>}</div>) : <p className="rounded-xl border border-dashed border-slate-300 p-5 text-center text-sm text-slate-500">لا توجد أدلة مسجلة لهذه الحزمة.</p>}</div><div className="flex flex-wrap gap-2">{isAdmin && selectedPack?.status === "draft" && <Button disabled={approvePack.isPending} onClick={() => approvePack.mutate({ packId: selectedPack.id, reason: reason.trim() || undefined })}>اعتماد الحزمة</Button>}{isAdmin && selectedPack?.status === "approved" && <Button variant="outline" disabled={rollbackPack.isPending || reason.trim().length < 5} onClick={() => rollbackPack.mutate({ packId: selectedPack.id, reason })}>تراجع مع سبب</Button>}</div>{isAdmin && selectedPack?.status === "approved" && <Input value={reason} onChange={event => setReason(event.target.value)} placeholder="سبب التدقيق، ٥ أحرف على الأقل" aria-label="سبب التدقيق" />}</> : <p className="text-sm text-slate-500">لا توجد حزمة لهذا الاختصاص أو لم يتم تحديد ملف.</p>}</CardContent></Card></div>{isAdmin && selectedPack && <div className="rounded-xl border border-slate-200 bg-slate-50 p-3"><p className="mb-2 text-sm font-semibold">آخر سجل تدقيق</p>{audits.data?.length ? audits.data.slice(0, 4).map(audit => <p key={audit.id} className="text-xs leading-6 text-slate-600">{audit.action} · {audit.reason ?? "بدون سبب"}</p>) : <p className="text-xs text-slate-500">لا يوجد سجل تدقيق بعد.</p>}</div>}{status && <Badge variant="outline">{status}</Badge>}</>}</div></WorkspaceShell>;
}

function PrescriptionWorkspace() {
  const localization = useLocalization();
  const [intakeId, setIntakeId] = useState<number | null>(null);
  const [branchId, setBranchId] = useState("");
  const [patientId, setPatientId] = useState("");
  const [prescriptionCode, setPrescriptionCode] = useState(() => `ALD-${Date.now()}`);
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
  const accessInput = useMemo(() => { const branch = Number(branchId); const patient = Number(patientId); return localization.jurisdictionId && Number.isInteger(branch) && branch > 0 && Number.isInteger(patient) && patient > 0 ? { branchId: branch, jurisdictionId: localization.jurisdictionId, patientId: patient, includePending: true } : null; }, [branchId, patientId, localization.jurisdictionId]);
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
    if (!localization.jurisdictionId || !Number.isInteger(branch) || !Number.isInteger(patient) || !medicationText.trim() || !dosage.trim() || !frequency.trim() || !duration.trim()) { setStatus("أكمل الاختصاص والفرع والمريض وبيانات الدواء المطلوبة."); return; }
    try { const result = await createPrescription.mutateAsync({ branchId: branch, jurisdictionId: localization.jurisdictionId, patientId: patient, prescriptionCode, lines: [{ medicationText, dosage, frequency, duration, quantity: Number(quantity) }] }); setStatus(`أُنشئت الوصفة ${result.prescriptionCode} بحالة انتظار التحقق الصيدلي.`); setMedicationText(""); setDosage(""); setFrequency(""); setDuration(""); setQuantity("1"); setPrescriptionCode(`ALD-${Date.now()}`); } catch (error) { setStatus(error instanceof Error ? error.message : "تعذر إنشاء الوصفة الإلكترونية"); }
  };
  return <WorkspaceShell title="الوصفات الإلكترونية والصرف الآمن"><div className="space-y-5"><div className="rounded-2xl border border-cyan-100 bg-cyan-50/50 p-4"><div className="mb-2 flex items-center gap-2"><BrainCircuit className="h-5 w-5 text-cyan-600" /><p className="font-semibold text-cyan-950">استقبال وصفة مصورة</p></div><p className="mb-3 text-xs leading-5 text-slate-600">الاستخراج مساعد فقط؛ لا ينشئ وصفة رسمية ولا بيعاً قبل مراجعة بشرية.</p><label className="block text-sm font-medium text-slate-700">رقم الفرع<input className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2" type="number" min="1" value={branchId} onChange={event => setBranchId(event.target.value)} placeholder="أدخل رقم الفرع" /></label><label className="mt-3 flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-cyan-200 bg-white px-6 py-7 text-center hover:bg-cyan-50"><UploadIcon /><span className="mt-2 font-semibold text-slate-700">اختر صورة الوصفة</span><input className="hidden" type="file" accept="image/jpeg,image/png,image/webp" onChange={event => { const file = event.target.files?.[0]; if (file) handleFile(file); }} /></label><div className="mt-3 flex flex-wrap items-center gap-3"><Badge variant="outline">{status}</Badge>{intakeId && <Button onClick={runExtraction} disabled={extract.isPending}>{extract.isPending ? "جارٍ التحليل…" : "تحليل الوصفة"}</Button>}</div>{resultText && <pre className="mt-3 max-h-52 overflow-auto rounded-xl bg-slate-950 p-4 text-left text-xs text-cyan-100" dir="ltr">{resultText}</pre>}</div><div className="grid gap-4 lg:grid-cols-2"><div className="rounded-2xl border border-slate-200 bg-white p-4"><div className="mb-3 flex items-center gap-2"><Stethoscope className="h-5 w-5 text-teal-600" /><p className="font-semibold">إنشاء وصفة الطبيب</p></div><p className="mb-3 text-xs leading-5 text-slate-500">تُحفظ كـ PENDING_VERIFICATION، ولا تظهر للصيدلية حتى اعتمادها من مستخدم صيدلي مخوّل.</p><div className="grid gap-2 sm:grid-cols-2"><Input value={patientId} onChange={e => setPatientId(e.target.value)} placeholder="معرّف المريض الداخلي" aria-label="معرف المريض" type="number" /><Input value={prescriptionCode} onChange={e => setPrescriptionCode(e.target.value)} placeholder="رمز الوصفة" aria-label="رمز الوصفة" /><Input value={medicationText} onChange={e => setMedicationText(e.target.value)} placeholder="اسم الدواء" aria-label="اسم الدواء" /><Input value={dosage} onChange={e => setDosage(e.target.value)} placeholder="الجرعة" aria-label="الجرعة" /><Input value={frequency} onChange={e => setFrequency(e.target.value)} placeholder="التكرار" aria-label="التكرار" /><Input value={duration} onChange={e => setDuration(e.target.value)} placeholder="المدة" aria-label="المدة" /><Input value={quantity} onChange={e => setQuantity(e.target.value)} placeholder="الكمية" aria-label="الكمية" type="number" min="0.001" step="0.001" /></div><Button className="mt-3 w-full bg-[#0d1b2a]" onClick={createElectronicPrescription} disabled={createPrescription.isPending}>{createPrescription.isPending ? "جارٍ الحفظ…" : "إرسال للتحقق الصيدلي"}</Button></div><div className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><div className="mb-3 flex items-center gap-2"><Receipt className="h-5 w-5 text-amber-600" /><p className="font-semibold">وصفات الصيدلية للمريض</p></div><p className="mb-3 text-xs leading-5 text-slate-500">البحث لا يعمل إلا داخل الفرع والاختصاص الحاليين وبمعرّف مريض نشط. التكامل الحكومي والتأميني مغلق fail-closed.</p>{accessible.isLoading ? <p className="text-sm text-slate-500">جارٍ البحث…</p> : accessible.data?.length ? <div className="space-y-3">{accessible.data.map(item => <div key={item.prescription.id} className="rounded-xl border border-white bg-white p-3"><div className="flex items-start justify-between gap-2"><div><p className="font-medium">{item.prescription.prescriptionCode}</p><p className="text-xs text-slate-500">{item.prescription.status} · {new Date(item.prescription.createdAt).toLocaleString()}</p></div><div className="flex items-center gap-2"><Badge variant="secondary">{item.lines.length} بند</Badge>{item.prescription.status === "PENDING_VERIFICATION" && <Button size="sm" disabled={verifyPrescription.isPending} onClick={() => verifyPrescription.mutate({ prescriptionId: item.prescription.id })}>تحقق صيدلي</Button>}</div></div>{item.lines.map(line => <div key={line.id} className="mt-2 rounded-lg bg-slate-50 p-2 text-xs"><p className="font-medium">{line.medicationText} · {line.dosage}</p><p>{line.frequency} · {line.duration} · المتبقي {Number(line.quantity) - Number(line.dispensedQuantity)}</p>{line.status !== "DISPENSED" && <Button size="sm" className="mt-2" disabled={dispense.isPending} onClick={() => dispense.mutate({ prescriptionId: item.prescription.id, lineId: line.id, quantity: Number(line.quantity) - Number(line.dispensedQuantity) })}>صرف المتبقي</Button>}</div>)}</div>)}</div> : <p className="rounded-xl border border-dashed border-slate-300 p-5 text-center text-sm text-slate-500">أدخل معرّف مريض لعرض الوصفات التي تم التحقق منها فقط.</p>}</div></div></div></WorkspaceShell>;
}

function UploadIcon() { return <div className="grid h-12 w-12 place-items-center rounded-2xl bg-white text-cyan-600 shadow-sm"><FileText className="h-6 w-6" /></div>; }

function WorkspaceShell({ title, children }: { title: string; children: React.ReactNode }) {
  return <Card className="overflow-hidden border-0 bg-white shadow-sm shadow-slate-200/60"><CardHeader><CardTitle className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-cyan-500" />{title}</CardTitle></CardHeader><CardContent>{children}</CardContent><div className="border-t border-slate-100 px-6 py-2 text-[10px] text-slate-400">© 2026 ميدورا | منظومة الرعاية الصحية المتكاملة</div></Card>;
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
  const canRun = Boolean(organizationId && branchId && jurisdictionId && rows.length && !dryRun.isPending && !confirmImport.isPending);
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
  const jurisdictionId = registry.data?.find(country => country.status === "configured")?.profile?.id ?? branchJurisdictions.data?.find(item => item.assignment?.jurisdictionId && item.profile?.active === 1)?.assignment?.jurisdictionId;
  const catalog = trpc.erp.catalog.search.useQuery(jurisdictionId ? { jurisdictionId, query, category } : skipToken, { retry: false });
  const reviewQueue = trpc.erp.catalog.reviewQueue.useQuery(jurisdictionId ? { jurisdictionId, category, status: reviewStatus, query } : skipToken, { retry: false });
  const createItem = trpc.erp.catalog.createItem.useMutation();
  const approveItem = trpc.erp.catalog.approveItem.useMutation({ onSuccess: () => { void reviewQueue.refetch(); void catalog.refetch(); } });
  const submitItem = async () => {
    if (!jurisdictionId) { setStatus("لا يوجد اختصاص معتمد للكتالوج؛ يجب اعتماد حزمة الدولة أولاً."); return; }
    if (!nameAr.trim() || !sku.trim() || !category) { setStatus("اختر الفئة وأدخل الاسم العربي وSKU."); return; }
    try { const result = await createItem.mutateAsync({ jurisdictionId, category, nameAr, sku, sourceAuthority }); setStatus(`تم تسجيل الصنف #${result.itemId} بحالة ${result.verificationStatus}`); setNameAr(""); setSku(""); await reviewQueue.refetch(); } catch (error) { setStatus(error instanceof Error ? error.message : "تعذر تسجيل الصنف"); }
  };
  return <WorkspaceShell title="كتالوج الأصناف | المراجعة والاعتماد"><div className="space-y-4"><BulkCatalogImportPanel jurisdictionId={jurisdictionId} /><div className="rounded-2xl border border-cyan-100 bg-cyan-50/50 p-4"><div className="mb-3 flex items-center gap-2"><Plus className="h-4 w-4 text-cyan-700" /><p className="text-sm font-semibold text-cyan-950">إضافة سجل محلي للمراجعة</p></div><p className="mb-3 text-xs leading-5 text-slate-600">هذه سجلات بداية محلية تحمل provenance وحالة غير موثقة. لن تصبح VERIFIED إلا بعد اجتياز حزمة الأدلة المعتمدة على الخادم.</p><div className="grid gap-2 md:grid-cols-4"><Input value={nameAr} onChange={e => setNameAr(e.target.value)} placeholder="الاسم العربي" aria-label="اسم الصنف" /><Input value={sku} onChange={e => setSku(e.target.value)} placeholder="SKU داخلي" aria-label="SKU" /><select value={category ?? ""} onChange={e => setCategory((e.target.value || undefined) as typeof category)} className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm"><option value="">الفئة</option><option value="medicine">دواء</option><option value="cosmetic">تجميل</option><option value="medical_supply">مستلزم</option></select><Input value={sourceAuthority} onChange={e => setSourceAuthority(e.target.value)} placeholder="مصدر السجل" aria-label="مصدر السجل" /></div><div className="mt-3 flex flex-wrap items-center gap-3"><Button onClick={submitItem} disabled={createItem.isPending} className="bg-[#0d1b2a]">{createItem.isPending ? "جارٍ التسجيل…" : "إرسال للمراجعة"}</Button>{status && <Badge variant="outline">{status}</Badge>}</div></div><div className="flex flex-col gap-2 rounded-2xl border border-slate-200 bg-white p-3 sm:flex-row"><Input value={query} onChange={e => setQuery(e.target.value)} placeholder="بحث عربي أو إنجليزي أو SKU" aria-label="بحث الكتالوج" /><select value={reviewStatus} onChange={e => setReviewStatus(e.target.value as typeof reviewStatus)} className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm"><option value="PENDING_REVIEW">قيد المراجعة</option><option value="UNVERIFIED">غير موثق</option><option value="VERIFIED">موثق</option><option value="REJECTED">مرفوض</option></select><select value={category ?? ""} onChange={e => setCategory((e.target.value || undefined) as typeof category)} className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm"><option value="">كل الفئات</option><option value="medicine">أدوية</option><option value="cosmetic">تجميل</option><option value="medical_supply">مستلزمات</option></select></div>{reviewQueue.isLoading ? <p className="text-sm text-slate-500">جارٍ تحميل طابور المراجعة…</p> : reviewQueue.data?.length ? <div className="grid gap-3 lg:grid-cols-2">{reviewQueue.data.map(item => <div key={item.id} className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4"><div className="flex items-start justify-between gap-3"><div><p className="font-semibold text-slate-900">{item.nameAr}{item.nameEn ? ` · ${item.nameEn}` : ""}</p><p className="mt-1 text-xs text-slate-500">{item.sku} · {item.category}{item.manufacturer ? ` · ${item.manufacturer}` : ""}</p></div><Badge variant="outline">{item.verificationStatus}</Badge></div><div className="mt-3 grid gap-1 text-xs text-slate-600"><p>المصدر: {item.sourceAuthority}</p><p>معرّف المصدر: {item.sourceRecordId ?? "غير متاح"}</p><p>تاريخ الجمع: {item.sourceRetrievedAt ? new Date(item.sourceRetrievedAt).toLocaleDateString() : "غير متاح"}</p></div>{item.verificationStatus === "PENDING_REVIEW" && <div className="mt-3 flex gap-2"><Button size="sm" disabled={approveItem.isPending} onClick={() => approveItem.mutate({ itemId: item.id, approved: true })}>اعتماد بعد فحص الأدلة</Button><Button size="sm" variant="outline" disabled={approveItem.isPending} onClick={() => approveItem.mutate({ itemId: item.id, approved: false })}>رفض</Button></div>}</div>)}</div> : <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500"><Database className="mx-auto mb-2 h-6 w-6 text-slate-300" />لا توجد سجلات بهذه الحالة. لا يتم إنشاء بيانات افتراضية أو ادعاء اعتماد غير موثق.</div>}</div></WorkspaceShell>;
}
