import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Activity, BrainCircuit, Building2, CheckCircle2, ClipboardList, FileText, HeartPulse, PackageSearch, Plus, RefreshCw, ShieldCheck, ShoppingCart, Trash2, Truck, WalletCards, XCircle, Zap } from "lucide-react";
import { useLocalization } from "@/contexts/LocalizationContext";

const STORAGE_KEY = "medora-demo-sandbox-v1";

type DemoRecord = { id: number; name: string; status: string };
type DemoState = { activeModule: string; records: Record<string, DemoRecord[]>; events: string[] };
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
];

const seedRecords: Record<string, DemoRecord[]> = Object.fromEntries(
  modules.map(([, key]) => [key, [{ id: 1, name: "Synthetic visitor record", status: "Ready for exploration" }]])
);

const initialState = (): DemoState => ({
  activeModule: modules[0][1],
  records: structuredClone(seedRecords),
  events: ["Visitor sandbox initialized — no production connection"],
});

function loadState(): DemoState {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return initialState();
    const parsed = JSON.parse(raw) as DemoState;
    if (!parsed || typeof parsed !== "object" || !modules.some((m) => m[1] === parsed.activeModule)) return initialState();
    return {
      activeModule: parsed.activeModule,
      records: parsed.records && typeof parsed.records === "object" ? parsed.records : structuredClone(seedRecords),
      events: Array.isArray(parsed.events) ? parsed.events.slice(0, 30) : [],
    };
  } catch {
    return initialState();
  }
}

const scenarioNames = {
  care: ["Care journey", "رحلة الرعاية"],
  supply: ["Supply journey", "رحلة الإمداد"],
  order: ["Order-to-cash", "من الطلب إلى التحصيل"],
  executive: ["Executive review", "المراجعة التنفيذية"],
} as const;
type Scenario = keyof typeof scenarioNames;

export default function DemoWorkspace() {
  const { language, direction } = useLocalization();
  const en = language !== "ar";
  const [state, setState] = useState<DemoState>(loadState);
  const [draft, setDraft] = useState("");
  const [scenario, setScenario] = useState<Scenario | null>(null);

  useEffect(() => {
    try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch { /* session storage is best-effort */ }
  }, [state]);

  useEffect(() => {
    const clear = () => { try { sessionStorage.removeItem(STORAGE_KEY); } catch { /* best-effort */ } };
    window.addEventListener("pagehide", clear);
    return () => window.removeEventListener("pagehide", clear);
  }, []);

  const current = useMemo(() => modules.find(([, key]) => key === state.activeModule) ?? modules[0], [state.activeModule]);
  const records = state.records[state.activeModule] ?? [];

  const addRecord = () => {
    const name = draft.trim() || (en ? `New ${current[0]} demo item` : `عنصر تجريبي جديد — ${current[4]}`);
    const next: DemoRecord = { id: Date.now(), name, status: en ? "Created in sandbox" : "أُنشئ داخل البيئة التجريبية" };
    setState((prev) => ({
      ...prev,
      records: { ...prev.records, [prev.activeModule]: [...(prev.records[prev.activeModule] ?? []), next] },
      events: [(en ? `Created: ${name}` : `إنشاء: ${name}`), ...prev.events].slice(0, 30),
    }));
    setDraft("");
  };

  const runScenario = (kind: Scenario) => {
    const labels: Record<Scenario, string> = {
      care: en ? "Synthetic patient intake → care plan → ICD-11 → governance" : "استقبال مريض تجريبي ← خطة رعاية ← ICD-11 ← حوكمة",
      supply: en ? "Purchase request → supplier order → receipt → FEFO stock" : "طلب شراء ← أمر مورد ← استلام ← مخزون FEFO",
      order: en ? "Customer order → fulfillment → delivery → settlement" : "طلب عميل ← تنفيذ ← توصيل ← تسوية",
      executive: en ? "KPI → AI insight → governance evidence" : "مؤشر أداء ← رؤية AI ← دليل حوكمة",
    };
    const timestamp = new Date().toLocaleTimeString(en ? "en-US" : "ar-EG", { hour: "2-digit", minute: "2-digit" });
    setScenario(kind);
    setState((prev) => ({ ...prev, events: [`${timestamp} — ${labels[kind]}`, ...prev.events].slice(0, 30) }));
  };

  const reset = () => { setState(initialState()); setDraft(""); setScenario(null); try { sessionStorage.removeItem(STORAGE_KEY); } catch { /* best-effort */ } };

  return (
    <main dir={direction} className="min-h-screen bg-background px-4 py-6 md:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="flex flex-col gap-4 rounded-2xl border bg-card p-5 shadow-sm md:flex-row md:items-center md:justify-between">
          <div>
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <Badge variant="secondary">{en ? "Anonymous Admin Sandbox" : "بيئة مسؤول تجريبية مجهولة"}</Badge>
              <Badge variant="outline">{modules.length}+ {en ? "capabilities" : "قدرات"}</Badge>
            </div>
            <h1 className="text-2xl font-bold tracking-tight">{en ? "MEDORA Visitor Workspace" : "مساحة زائر MEDORA"}</h1>
            <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
              {en ? "Explore admin-like workflows with synthetic data. No username. No password. No employee account. No production database writes." : "استكشف تدفقات شبيهة بالإدارة باستخدام بيانات اصطناعية. بلا اسم مستخدم أو كلمة مرور أو حساب موظف أو كتابة في قاعدة الإنتاج."}
            </p>
          </div>
          <Button variant="outline" onClick={reset}><RefreshCw className="me-2 h-4 w-4" />{en ? "Reset sandbox" : "إعادة البيئة"}</Button>
        </header>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Zap className="h-5 w-5" />{en ? "Guided end-to-end journeys" : "رحلات متكاملة موجهة"}</CardTitle></CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {(Object.keys(scenarioNames) as Scenario[]).map((key) => (
              <Button key={key} variant={scenario === key ? "default" : "outline"} className="h-auto justify-start whitespace-normal p-4 text-start" onClick={() => runScenario(key)}>
                <div><div className="font-semibold">{en ? scenarioNames[key][0] : scenarioNames[key][1]}</div><div className="mt-1 text-xs opacity-80">{key === "care" ? (en ? "Care → ICD-11 → governance" : "رعاية ← ICD-11 ← حوكمة") : key === "supply" ? (en ? "Procurement → stock" : "مشتريات ← مخزون") : key === "order" ? (en ? "Order → delivery → settlement" : "طلب ← توصيل ← تسوية") : (en ? "KPI → AI → evidence" : "KPI ← AI ← دليل")}</div></div>
              </Button>
            ))}
          </CardContent>
        </Card>

        <Tabs value={state.activeModule} onValueChange={(value) => setState((prev) => ({ ...prev, activeModule: value }))}>
          <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1 bg-muted/60 p-1">
            {modules.map(([enName, key, Icon, , arName]) => <TabsTrigger key={key} value={key} className="gap-2"><Icon className="h-4 w-4" />{en ? enName : arName}</TabsTrigger>)}
          </TabsList>
          <TabsContent value={state.activeModule} className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>{en ? current[0] : current[4]}</CardTitle>
                <p className="text-sm text-muted-foreground">{en ? current[3] : current[5]}</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Input value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") addRecord(); }} placeholder={en ? "Create a synthetic demo item…" : "أنشئ عنصرًا تجريبيًا اصطناعيًا…"} />
                  <Button onClick={addRecord}><Plus className="me-2 h-4 w-4" />{en ? "Add" : "إضافة"}</Button>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  {records.map((record) => <div key={record.id} className="flex items-center justify-between rounded-xl border p-4"><div><div className="font-medium">{record.name}</div><div className="text-xs text-muted-foreground">{record.status}</div></div><CheckCircle2 className="h-5 w-5 text-emerald-600" /></div>)}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="grid gap-6 lg:grid-cols-[1.4fr_.8fr]">
          <Card><CardHeader><CardTitle>{en ? "Sandbox activity" : "نشاط البيئة التجريبية"}</CardTitle></CardHeader><CardContent className="space-y-2">{state.events.length ? state.events.map((event, index) => <div key={`${event}-${index}`} className="rounded-lg border px-3 py-2 text-sm">{event}</div>) : <div className="text-sm text-muted-foreground">{en ? "No activity yet." : "لا يوجد نشاط بعد."}</div>}</CardContent></Card>
          <Card><CardHeader><CardTitle className="flex items-center gap-2"><ShieldCheck className="h-5 w-5" />{en ? "Boundary" : "حدود الأمان"}</CardTitle></CardHeader><CardContent className="space-y-3 text-sm text-muted-foreground"><p>{en ? "This surface is a public synthetic visitor sandbox, not an authenticated production administrator." : "هذه الواجهة بيئة زائر عامة اصطناعية وليست مسؤولًا حقيقيًا موثقًا في الإنتاج."}</p><p>{en ? "State is kept in sessionStorage and is intended to expire with the browser session. Browser shutdown cleanup is best-effort." : "الحالة محفوظة في sessionStorage ومصممة لتنتهي مع جلسة المتصفح. تنظيف الإغلاق يعتمد على سلوك المتصفح وهو best-effort."}</p><div className="flex items-center gap-2 text-foreground"><XCircle className="h-4 w-4" />{en ? "No production auth, DB, payment, or regulated integration." : "لا مصادقة إنتاجية أو قاعدة بيانات إنتاج أو دفع أو تكامل منظم."}</div></CardContent></Card>
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground"><Trash2 className="h-3.5 w-3.5" />{en ? "Synthetic data only — never use real patient, employee, payment, or credential data here." : "بيانات اصطناعية فقط — لا تستخدم بيانات مرضى أو موظفين أو مدفوعات أو بيانات اعتماد حقيقية هنا."}</div>
      </div>
    </main>
  );
}
