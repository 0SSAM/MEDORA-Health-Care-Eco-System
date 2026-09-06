import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Activity, Boxes, BrainCircuit, Building2, CheckCircle2, ClipboardList, FileText, HeartPulse, PackageSearch, Plus, RefreshCw, ShieldCheck, ShoppingCart, Trash2, Truck, WalletCards, XCircle, Zap } from "lucide-react";
import { useLocalization } from "@/contexts/LocalizationContext";

const STORAGE_KEY = "medora-demo-sandbox-v1";

type DemoModule = readonly [string, string, typeof ShoppingCart, string, string, string];

const modules: DemoModule[] = [
  ["POS & Sales", "sales", ShoppingCart, "Point of sale, dispensing and sales workflows", "نقطة البيع والمبيعات", "البيع والصرف ومسارات نقطة البيع"],
  ["Operations", "operations", Activity, "Daily operations, workforce and service control", "التشغيل", "التشغيل اليومي والقوى العاملة ومراقبة الخدمة"],
  ["Supply Chain", "supply", PackageSearch, "Procurement, inventory and supplier operations", "سلسلة الإمداد", "المشتريات والمخزون والموردون"],
  ["Delivery", "delivery", Truck, "Delivery orchestration and fulfillment", "التوصيل", "تنسيق التوصيل وتنفيذ الطلبات"],
  ["Finance", "finance", WalletCards, "Finance, accounting and commercial visibility", "المالية", "المالية والمحاسبة والرؤية التجارية"],
  ["KPI Intelligence", "kpi", ClipboardList, "Executive KPIs and operational intelligence", "ذكاء المؤشرات", "مؤشرات الإدارة العليا والذكاء التشغيلي"],
  ["Compliance", "compliance", ShieldCheck, "Compliance, audit and governed workflows", "الامتثال", "الامتثال والتدقيق والتدفقات المنضبطة"],
  ["AI Insights", "ai", BrainCircuit, "AI-assisted insights and decision support", "رؤى الذكاء الاصطناعي", "رؤى مساعدة ودعم القرار"],
  ["Healthcare", "healthcare", HeartPulse, "Clinical and healthcare-focused capabilities", "الرعاية الصحية", "الإمكانات السريرية والصحية"],
  ["ICD-11", "icd11", FileText, "Clinical classification and reference workflows", "ICD-11", "التصنيف السريري ومسارات المراجع"],
  ["Organizations", "organizations", Building2, "Multi-organization operating model", "المؤسسات", "نموذج تشغيل متعدد المؤسسات"],
  ["Inventory", "inventory", Boxes, "Stock-aware workflows and catalog operations", "المخزون", "التشغيل المعتمد على المخزون والكتالوج"],
];

type DemoRecord = { id: number; name: string; status: string };
type DemoState = { activeModule: string; records: Record<string, DemoRecord[]>; events: string[] };

const seedState: DemoState = {
  activeModule: "sales",
  records: {
    sales: [{ id: 1, name: "Demo Order #1001", status: "Completed" }, { id: 2, name: "Demo Order #1002", status: "Pending" }],
    operations: [{ id: 3, name: "Morning operations", status: "Running" }],
    supply: [{ id: 4, name: "Demo supplier replenishment", status: "Planned" }],
    delivery: [{ id: 5, name: "Demo delivery #5001", status: "Dispatched" }],
    finance: [{ id: 6, name: "Demo invoice #2001", status: "Open" }],
    kpi: [{ id: 7, name: "Demo KPI snapshot", status: "Healthy" }],
    compliance: [{ id: 8, name: "Demo compliance review", status: "In review" }],
    ai: [{ id: 9, name: "Demo insight", status: "Generated" }],
    healthcare: [{ id: 10, name: "Synthetic patient journey", status: "Active" }],
    icd11: [{ id: 11, name: "Synthetic classification", status: "Mapped" }],
    organizations: [{ id: 12, name: "MEDORA Demo Organization", status: "Active" }],
    inventory: [{ id: 13, name: "Demo inventory item", status: "In stock" }],
  },
  events: ["Demo session initialized"],
};

function cloneSeed(): DemoState {
  return JSON.parse(JSON.stringify(seedState)) as DemoState;
}

function loadState(): DemoState {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) as DemoState : cloneSeed();
  } catch {
    return cloneSeed();
  }
}

export default function DemoWorkspace() {
  const { language, direction } = useLocalization();
  const en = language === "en";
  const [state, setState] = useState<DemoState>(() => loadState());
  const [draft, setDraft] = useState("");

  useEffect(() => {
    try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch { /* session-only fallback remains in memory */ }
  }, [state]);

  useEffect(() => {
    const clear = () => { try { sessionStorage.removeItem(STORAGE_KEY); } catch { /* ignore storage shutdown errors */ } };
    window.addEventListener("pagehide", clear);
    return () => window.removeEventListener("pagehide", clear);
  }, []);

  const current = useMemo(() => modules.find(([, key]) => key === state.activeModule) ?? modules[0], [state.activeModule]);
  const records = state.records[state.activeModule] ?? [];
  const totalRecords = Object.values(state.records).reduce((sum, items) => sum + items.length, 0);

  const moduleTitle = (module: DemoModule) => en ? module[0] : module[4];
  const moduleDescription = (module: DemoModule) => en ? module[3] : module[5];

  function addRecord() {
    const name = draft.trim() || (en ? `New ${current[0]} demo item` : `عنصر تجريبي جديد — ${current[4]}`);
    const next: DemoRecord = { id: Date.now(), name, status: en ? "Created in sandbox" : "أُنشئ داخل البيئة التجريبية" };
    const activeModule = state.activeModule;
    setState(prev => ({ ...prev, records: { ...prev.records, [activeModule]: [...(prev.records[activeModule] ?? []), next] }, events: [`${en ? "Created" : "إنشاء