import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Activity, Boxes, BrainCircuit, Building2, CheckCircle2, ClipboardList, FileText, HeartPulse, PackageSearch, Plus, RefreshCw, ShieldCheck, ShoppingCart, Trash2, Truck, WalletCards, XCircle } from "lucide-react";
import { useLocalization } from "@/contexts/LocalizationContext";

const STORAGE_KEY = "medora-demo-sandbox-v1";

const modules = [
  ["POS & Sales", "sales", ShoppingCart, "Point of sale, dispensing and sales workflows"],
  ["Operations", "operations", Activity, "Daily operations, workforce and service control"],
  ["Supply Chain", "supply", PackageSearch, "Procurement, inventory and supplier operations"],
  ["Delivery", "delivery", Truck, "Delivery orchestration and fulfillment"],
  ["Finance", "finance", WalletCards, "Finance, accounting and commercial visibility"],
  ["KPI Intelligence", "kpi", ClipboardList, "Executive KPIs and operational intelligence"],
  ["Compliance", "compliance", ShieldCheck, "Compliance, audit and governed workflows"],
  ["AI Insights", "ai", BrainCircuit, "AI-assisted insights and decision support"],
  ["Healthcare", "healthcare", HeartPulse, "Clinical and healthcare-focused capabilities"],
  ["ICD-11", "icd11", FileText, "Clinical classification and reference workflows"],
  ["Organizations", "organizations", Building2, "Multi-organization operating model"],
  ["Inventory", "inventory", Boxes, "Stock-aware workflows and catalog operations"],
] as const;

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

function loadState(): DemoState {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) as DemoState : seedState;
  } catch {
    return seedState;
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

  const current = useMemo(() => modules.find(([name, key]) => key === state.activeModule) ?? modules[0], [state.activeModule]);
  const records = state.records[state.activeModule] ?? [];
  const totalRecords = Object.values(state.records).reduce((sum, items) => sum + items.length, 0);

  function addRecord() {
    const name = draft.trim() || (en ? `New ${current[0]} demo item` : `عنصر تجريبي جديد — ${current[0]}`);
    const next: DemoRecord = { id: Date.now(), name, status: en ? "Created in sandbox" : "أُنشئ داخل البيئة التجريبية" };
    setState(prev => ({ ...prev, records: { ...prev.records, [state.activeModule]: [...(prev.records[state.activeModule] ?? []), next] }, events: [`Created: ${name}`, ...prev.events].slice(0, 20) }));
    setDraft("");
  }

  function cycleRecord(id: number) {
    const statuses = en ? ["Pending", "Running", "Completed"] : ["معلّق", "قيد التنفيذ", "مكتمل"];
    setState(prev => ({ ...prev, records: { ...prev.records, [state.activeModule]: (prev.records[state.activeModule] ?? []).map(item => item.id === id ? { ...item, status: statuses[(statuses.indexOf(item.status) + 1) % statuses.length] } : item) }, events: [`Updated item #${id}`, ...prev.events].slice(0, 20) }));
  }

  function removeRecord(id: number) {
    setState(prev => ({ ...prev, records: { ...prev.records, [state.activeModule]: (prev.records[state.activeModule] ?? []).filter(item => item.id !== id) }, events: [`Deleted sandbox item #${id}`, ...prev.events].slice(0, 20) }));
  }

  function resetDemo() {
    setState({ ...seedState, activeModule: state.activeModule, events: ["Demo sandbox reset"] });
    setDraft("");
  }

  return (
    <main dir={direction} className="min-h-screen bg-slate-50 text-slate-950">
      <div className="mx-auto max-w-[1500px] px-4 py-5 sm:px-6 lg:px-10">
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-5">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-slate-950 text-white"><HeartPulse className="h-5 w-5" /></div>
            <div><p className="font-black tracking-tight">MEDORA</p><p className="text-xs text-slate-500">{en ? "Anonymous Admin Sandbox" : "بيئة Admin تجريبية مجهولة"}</p></div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="border border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-50">{en ? "DEMO / SANDBOX" : "تجريبي / Sandbox"}</Badge>
            <Badge variant="outline">{en ? "No credentials" : "بدون بيانات دخول"}</Badge>
            <Button variant="outline" onClick={resetDemo}><RefreshCw className="mr-2 h-4 w-4" />{en ? "Reset sandbox" : "إعادة ضبط"}</Button>
            <Button asChild variant="outline"><a href="/">{en ? "Exit" : "خروج"}</a></Button>
          </div>
        </header>

        <section className="py-7">
          <div className="rounded-3xl border border-cyan-200 bg-white p-5 shadow-sm sm:p-7">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-4xl">
                <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-cyan-700">MEDORA / VISITOR EXPERIENCE</p>
                <h1 className="text-3xl font-black tracking-tight sm:text-5xl">{en ? "Explore the system like an administrator — safely." : "استكشف النظام بصلاحيات Admin — بأمان."}</h1>
                <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600 sm:text-base">{en ? "This is an isolated browser sandbox. You can create, update and delete synthetic records across the capability map. Nothing here authenticates against production and nothing is written to the production database." : "هذه بيئة Sandbox معزولة داخل المتصفح. يمكنك إنشاء وتعديل وحذف بيانات اصطناعية عبر خريطة الإمكانات. لا تتم مصادقة هذا الوضع على الإنتاج ولا تُكتب أي بيانات في قاعدة بيانات الإنتاج."}</p>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="rounded-2xl bg-slate-50 p-3"><p className="text-xl font-black">12+</p><p className="text-slate-500">{en ? "Areas" : "مجالات"}</p></div>
                <div className="rounded-2xl bg-slate-50 p-3"><p className="text-xl font-black">{totalRecords}</p><p className="text-slate-500">{en ? "Demo items" : "عناصر تجريبية"}</p></div>
                <div className="rounded-2xl bg-slate-50 p-3"><p className="text-xl font-black">0</p><p className="text-slate-500">{en ? "Prod writes" : "كتابات إنتاج"}</p></div>
              </div>
            </div>
          </div>

          <div className="mt-6 grid gap-5 lg:grid-cols-[300px_1fr]">
            <Card className="h-fit lg:sticky lg:top-4">
              <CardHeader><CardTitle>{en ? "Capability map" : "خريطة الإمكانات"}</CardTitle></CardHeader>
              <CardContent className="grid gap-2">
                {modules.map(([name, key, Icon]) => <Button key={key} variant={key === state.activeModule ? "default" : "ghost"} className="justify-start" onClick={() => setState(prev => ({ ...prev, activeModule: key }))}><Icon className="mr-2 h-4 w-4" />{name}</Button>)}
              </CardContent>
            </Card>

            <div className="space-y-5">
              <Card>
                <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0">
                  <div><CardTitle>{current[0]}</CardTitle><p className="mt-1 text-sm text-slate-500">{current[3]}</p></div>
                  <Badge variant="outline"><CheckCircle2 className="mr-1 h-3 w-3" />{en ? "Sandbox isolated" : "Sandbox معزول"}</Badge>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col gap-2 sm:flex-row"><Input value={draft} onChange={e => setDraft(e.target.value)} placeholder={en ? "Name a synthetic record…" : "اسم سجل اصطناعي…"} onKeyDown={e => { if (e.key === "Enter") addRecord(); }} /><Button onClick={addRecord}><Plus className="mr-2 h-4 w-4" />{en ? "Create" : "إنشاء"}</Button></div>
                  <div className="mt-4 space-y-2">
                    {records.length === 0 && <div className="rounded-xl border border-dashed p-8 text-center text-sm text-slate-500">{en ? "No sandbox records. Create one above." : "لا توجد سجلات تجريبية. أنشئ سجلًا من الأعلى."}</div>}
                    {records.map(item => <div key={item.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-white p-3"><div><p className="font-semibold">{item.name}</p><p className="text-xs text-slate-500">ID {item.id}</p></div><div className="flex items-center gap-2"><Badge variant="outline">{item.status}</Badge><Button size="sm" variant="outline" onClick={() => cycleRecord(item.id)}>{en ? "Update" : "تعديل"}</Button><Button size="sm" variant="ghost" onClick={() => removeRecord(item.id)} aria-label={en ? "Delete demo item" : "حذف العنصر التجريبي"}><Trash2 className="h-4 w-4" /></Button></div></div>)}
                  </div>
                </CardContent>
              </Card>

              <Tabs defaultValue="overview">
                <TabsList><TabsTrigger value="overview">{en ? "Overview" : "نظرة عامة"}</TabsTrigger><TabsTrigger value="activity">{en ? "Activity" : "النشاط"}</TabsTrigger><TabsTrigger value="boundary">{en ? "Safety boundary" : "حدود الأمان"}</TabsTrigger></TabsList>
                <TabsContent value="overview"><Card><CardContent className="grid gap-3 p-5 sm:grid-cols-3"><div className="rounded-xl bg-slate-50 p-4"><p className="text-xs text-slate-500">{en ? "Session identity" : "هوية الجلسة"}</p><p className="mt-1 font-bold">{en ? "Anonymous visitor" : "زائر مجهول"}</p></div><div className="rounded-xl bg-slate-50 p-4"><p className="text-xs text-slate-500">{en ? "Privileges" : "الصلاحيات"}</p><p className="mt-1 font-bold">{en ? "Admin-like demo controls" : "تحكم تجريبي مماثل للـAdmin"}</p></div><div className="rounded-xl bg-slate-50 p-4"><p className="text-xs text-slate-500">{en ? "Persistence" : "الاستمرارية"}</p><p className="mt-1 font-bold">{en ? "Session only" : "داخل الجلسة فقط"}</p></div></CardContent></Card></TabsContent>
                <TabsContent value="activity"><Card><CardContent className="p-5"><div className="space-y-2">{state.events.map((event, index) => <div key={`${event}-${index}`} className="flex items-center gap-2 text-sm"><CheckCircle2 className="h-4 w-4 text-emerald-600" />{event}</div>)}</div></CardContent></Card></TabsContent>
                <TabsContent value="boundary"><Card><CardContent className="space-y-3 p-5 text-sm leading-6"><p className="flex gap-2"><ShieldCheck className="mt-1 h-4 w-4 shrink-0 text-cyan-700" />{en ? "No username, password or employee session is created." : "لا يتم إنشاء اسم مستخدم أو كلمة مرور أو جلسة موظف."}</p><p className="flex gap-2"><ShieldCheck className="mt-1 h-4 w-4 shrink-0 text-cyan-700" />{en ? "Synthetic records live only in this browser session and are never sent to the production database." : "السجلات اصطناعية وتعيش فقط داخل جلسة المتصفح ولا تُرسل إلى قاعدة بيانات الإنتاج."}</p><p className="flex gap-2"><ShieldCheck className="mt-1 h-4 w-4 shrink-0 text-cyan-700" />{en ? "Production authentication, regulated integrations, payments and destructive production operations remain outside this sandbox." : "المصادقة الإنتاجية والتكاملات المنظمة والمدفوعات والعمليات التدميرية على الإنتاج خارج هذا الـSandbox."}</p><p className="flex gap-2"><XCircle className="mt-1 h-4 w-4 shrink-0 text-amber-700" />{en ? "Browser shutdown cleanup is best-effort; sessionStorage is the primary expiry boundary, with pagehide cleanup when the browser provides it." : "حذف البيانات عند إغلاق المتصفح يعتمد على حدود sessionStorage مع تنظيف pagehide عندما يتيحه المتصفح."}</p></CardContent></Card></TabsContent>
              </Tabs>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
