import { useLocalization } from "@/contexts/LocalizationContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, ArrowLeft, ArrowRight, BarChart3, Boxes, BrainCircuit, Building2, CheckCircle2, FileText, HeartPulse, PackageSearch, ShieldCheck, ShoppingCart, Truck, WalletCards } from "lucide-react";

const modules = [
  ["POS & Sales", "/pos", ShoppingCart, "Point of sale, dispensing and sales workflows"],
  ["Operations", "/operations", Activity, "Daily operations, workforce and service control"],
  ["Supply Chain", "/supply", PackageSearch, "Procurement, inventory and supplier operations"],
  ["Delivery", "/delivery", Truck, "Delivery orchestration and fulfillment"],
  ["Finance", "/finance-hub", WalletCards, "Finance, accounting and commercial visibility"],
  ["KPI Intelligence", "/kpi", BarChart3, "Executive KPIs and operational intelligence"],
  ["Compliance", "/compliance", ShieldCheck, "Compliance, audit and governed workflows"],
  ["AI Insights", "/workspace", BrainCircuit, "AI-assisted insights inside the unified workspace"],
  ["Healthcare", "/gp-max", HeartPulse, "Clinical and healthcare-focused capabilities"],
  ["ICD-11", "/icd11", FileText, "Clinical classification and reference workflows"],
  ["Organizations", "/workspace", Building2, "Multi-organization operating model"],
  ["Inventory", "/pos", Boxes, "Stock-aware workflows and catalog operations"],
] as const;

export default function DemoWorkspace() {
  const { language, direction } = useLocalization();
  const en = language === "en";
  const Arrow = direction === "rtl" ? ArrowLeft : ArrowRight;

  return (
    <main dir={direction} className="min-h-screen bg-slate-50 text-slate-950">
      <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-10">
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-5">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-slate-950 text-white"><HeartPulse className="h-5 w-5" /></div>
            <div><p className="font-black tracking-tight">MEDORA</p><p className="text-xs text-slate-500">{en ? "Healthcare ecosystem" : "منظومة الرعاية الصحية"}</p></div>
          </div>
          <div className="flex items-center gap-2"><Badge className="border border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-50">{en ? "DEMO MODE" : "وضع تجريبي"}</Badge><Button asChild variant="outline"><a href="/">{en ? "Exit demo" : "الخروج"}</a></Button></div>
        </header>

        <section className="py-8 sm:py-12">
          <div className="max-w-3xl">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-cyan-700">MEDORA / GUEST EXPERIENCE</p>
            <h1 className="text-3xl font-black tracking-tight sm:text-5xl">{en ? "Explore MEDORA without an account." : "استكشف MEDORA بدون إنشاء حساب."}</h1>
            <p className="mt-4 text-base leading-7 text-slate-600 sm:text-lg">{en ? "A safe, non-production showcase for visitors, investors and partners. It uses no employee credentials and does not expose production records." : "تجربة آمنة غير إنتاجية للزوار والمستثمرين والشركاء، بدون بيانات دخول للموظفين وبدون كشف بيانات الإنتاج."}</p>
            <div className="mt-6 flex flex-wrap gap-2 text-xs text-slate-600"><span className="rounded-full bg-white px-3 py-2 ring-1 ring-slate-200">✓ {en ? "Read-only" : "للاستعراض فقط"}</span><span className="rounded-full bg-white px-3 py-2 ring-1 ring-slate-200">✓ {en ? "No credentials" : "بدون بيانات دخول"}</span><span className="rounded-full bg-white px-3 py-2 ring-1 ring-slate-200">✓ {en ? "No production mutations" : "بدون تغييرات إنتاجية"}</span></div>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[['24/7','Operational visibility'],['12+','Core capability areas'],['RBAC','Governed access'],['AR / EN','Bilingual UX']].map(([value,label]) => <Card key={label}><CardContent className="p-5"><p className="text-2xl font-black">{value}</p><p className="mt-1 text-xs text-slate-500">{en ? label : ({'Operational visibility':'رؤية تشغيلية مستمرة','Core capability areas':'مجالات تشغيل أساسية','Governed access':'وصول محكوم بالصلاحيات','Bilingual UX':'واجهة عربية وإنجليزية'} as Record<string,string>)[label]}</p></CardContent></Card>)}
          </div>

          <div className="mt-10 flex items-center justify-between gap-3"><div><h2 className="text-xl font-bold">{en ? "Capability map" : "خريطة الإمكانات"}</h2><p className="mt-1 text-sm text-slate-500">{en ? "Open any area to inspect its interface." : "افتح أي مجال لاستعراض واجهته."}</p></div><Arrow className="h-5 w-5 text-slate-400" /></div>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {modules.map(([name, href, Icon, description]) => <Card key={name} className="group transition hover:-translate-y-0.5 hover:shadow-lg"><CardHeader className="pb-3"><div className="flex items-start justify-between gap-3"><div className="grid h-10 w-10 place-items-center rounded-xl bg-cyan-50 text-cyan-700"><Icon className="h-5 w-5" /></div><CheckCircle2 className="h-4 w-4 text-emerald-600" /></div><CardTitle className="pt-2 text-base">{name}</CardTitle></CardHeader><CardContent><p className="min-h-12 text-sm leading-6 text-slate-500">{description}</p><Button asChild variant="outline" className="mt-4 w-full"><a href={href}>{en ? "Explore module" : "استعراض الوحدة"}<Arrow className="mr-2 h-4 w-4" /></a></Button></CardContent></Card>)}
          </div>

          <Card className="mt-8 border-cyan-200 bg-cyan-50/60"><CardContent className="flex gap-3 p-5 text-sm leading-6 text-cyan-950"><ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-cyan-700" /><p><strong>{en ? "Demo boundary:" : "حدود الوضع التجريبي:"}</strong> {en ? "All displayed information is illustrative. Transactional, regulated, administrative and destructive actions remain protected behind real authentication." : "المعلومات المعروضة توضيحية. العمليات المالية والمنظمة والإدارية والحذف والتعديلات الحساسة تظل محمية بالمصادقة الحقيقية."}</p></CardContent></Card>
        </section>
      </div>
    </main>
  );
}
