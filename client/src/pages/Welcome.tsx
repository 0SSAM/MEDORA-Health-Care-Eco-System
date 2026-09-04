import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useLocalization } from "@/contexts/LocalizationContext";
import { MEDORA_LOGO_MARK } from "@/lib/brand";
import {
  ArrowLeft,
  ArrowRight,
  BrainCircuit,
  CheckCircle2,
  ChevronLeft,
  CircleDot,
  HeartPulse,
  Layers3,
  LockKeyhole,
  ScanLine,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  UsersRound,
  WalletCards,
  Workflow,
} from "lucide-react";
import type { ComponentType, ReactNode } from "react";

export const welcomeRoutes = { login: "/login", workspace: "/workspace" } as const;

type Icon = ComponentType<{ className?: string }>;

function BrandMark() {
  return (
    <div role="img" aria-label="MEDORA Health Care Eco System" className="relative grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-[1.35rem] bg-gradient-to-br from-cyan-500 via-teal-500 to-violet-600 shadow-lg shadow-cyan-900/10">
      <span aria-hidden="true" className="grid h-9 w-9 place-items-center rounded-2xl border border-white/40 bg-slate-950/20 text-white">
        <HeartPulse className="h-5 w-5" />
      </span>
      <img src={MEDORA_LOGO_MARK} alt="" onError={event => event.currentTarget.classList.add("hidden")} className="absolute inset-0 h-full w-full object-contain" />
    </div>
  );
}

function SectionKicker({ children, dark = false }: { children: ReactNode; dark?: boolean }) {
  return (
    <div className={`mb-4 inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em] ${dark ? "border-white/15 bg-white/10 text-cyan-200" : "border-cyan-200 bg-white/80 text-cyan-800"}`}>
      <CircleDot className="h-3.5 w-3.5" />
      {children}
    </div>
  );
}

export default function Welcome() {
  // Public preview must stay independent of production auth/tRPC APIs.
  const { language, direction } = useLocalization();
  const english = language === "en";
  const Arrow = direction === "rtl" ? ArrowLeft : ArrowRight;

  const copy = english
    ? {
        eyebrow: "MEDORA | HEALTH CARE ECO SYSTEM",
        title: "One secure operating space for the healthcare journey.",
        subtitle: "A calm, intelligent foundation for pharmacies, hospitals, insurers, distributors, laboratories, and care teams across the Arab world.",
        login: "Sign in securely",
        continue: "Enter your workspace",
        demoNote: "Secure access is available only through authorized employee or administrator accounts.",
        nav: ["Platform", "How it works", "Governance"],
        trustLabel: "Built for sensitive work",
        trustTitle: "Speed at the counter. Clarity in operations. Careful decisions everywhere.",
        workspaceTitle: "A clear view of the operation",
        workspaceSub: "ONE GOVERNED WORKSPACE",
        workspaceMetric: "Care · operations · control",
        scope: "Scope",
        scopeValue: "Branch protected",
        audit: "Audit trail",
        auditValue: "Always visible",
        review: "Human review",
        reviewValue: "Required for sensitive actions",
        platformKicker: "THE OPERATING SURFACE",
        platformTitle: "Every team sees the work that belongs to them.",
        platformBody: "MEDORA brings daily operations, inventory, finance, people, and governance into one role-aware surface—without pretending that integration gates are already live.",
        modules: [
          { icon: ScanLine, title: "POS & daily work", body: "Fast, touch-ready sales flows with branch scope, barcode pathways, and safe fallbacks." },
          { icon: Layers3, title: "Inventory & traceability", body: "Batches, expiry, FEFO planning, reorder signals, and a visible chain of custody." },
          { icon: Workflow, title: "Procurement & supply", body: "Review-first purchase flows with supplier balances, approvals, and reason capture." },
          { icon: Stethoscope, title: "Care & clinical boundaries", body: "Prescription and patient paths stay protected, role-gated, and fail closed." },
          { icon: WalletCards, title: "Finance & people", body: "Scoped financial foundations, expenses, payroll rules, shifts, and team workspaces." },
          { icon: BrainCircuit, title: "Advisory intelligence", body: "Bilingual assistance that supports people without diagnosing, dispensing, or acting alone." },
        ],
        modelKicker: "A HUMAN-CENTRED MODEL",
        modelTitle: "Designed to make the next safe step obvious.",
        modelBody: "Each workspace starts with the active organization, branch, jurisdiction, and role, then progressively reveals the actions that are actually permitted.",
        modelSteps: [
          ["01", "Scope first", "Organization, branch, jurisdiction, and Demo/Production state stay visible."],
          ["02", "Work with confidence", "The interface guides the next authorized action with clear states and fallbacks."],
          ["03", "Review before impact", "Sensitive financial, clinical, purchasing, and regulated changes require human authority."],
        ],
        governanceKicker: "GOVERNANCE BY DEFAULT",
        governanceTitle: "Useful, honest, and ready for scrutiny.",
        governanceBody: "MEDORA separates implemented product capability from integration-gated external connectivity so prepared boundaries are never mistaken for live connections.",
        boundaries: ["Tenant and branch isolation", "Append-only audit evidence", "Fail-closed regulated workflows", "AI remains advisory-only"],
        readiness: "Integration readiness",
        readinessBody: "Government, payment, insurance, catalog, and device connections remain disabled until contracts, credentials, security review, and acceptance evidence exist.",
        ctaTitle: "Give your teams one place to see the work clearly.",
        ctaBody: "Start with a secure workspace built around the realities of healthcare operations.",
        footer: "Built to be clear for people and careful with sensitive healthcare work.",
        brandTitle: "MEDORA | Health Care Eco System",
        brandSubtitle: "Integrated, secure healthcare operations",
      }
    : {
        eyebrow: "MEDORA | منظومة الرعاية الصحية المتكاملة",
        title: "مساحة تشغيل آمنة وموحّدة لدورة الرعاية الصحية.",
        subtitle: "أساس هادئ وذكي للصيدليات والمستشفيات وشركات التأمين والتوزيع والمعامل وفرق الرعاية في العالم العربي.",
        login: "تسجيل الدخول بأمان",
        continue: "دخول إلى مساحة العمل",
        demoNote: "الوصول متاح فقط من خلال حساب موظف أو مسؤول مصرح به.",
        nav: ["المنظومة", "كيف تعمل", "الحوكمة"],
        trustLabel: "مصممة للأعمال الحساسة",
        trustTitle: "سرعة عند نقطة البيع. وضوح في التشغيل. وقرار واعٍ في كل خطوة.",
        workspaceTitle: "رؤية واضحة لسير العمل",
        workspaceSub: "مساحة عمل منضبطة",
        workspaceMetric: "رعاية · تشغيل · رقابة",
        scope: "النطاق",
        scopeValue: "فرع محمي",
        audit: "سجل التدقيق",
        auditValue: "ظاهر دائماً",
        review: "المراجعة البشرية",
        reviewValue: "مطلوبة للإجراءات الحساسة",
        platformKicker: "مساحة التشغيل",
        platformTitle: "كل فريق يرى العمل الذي يخصه.",
        platformBody: "تجمع MEDORA التشغيل اليومي والمخزون والمالية والموظفين والحوكمة في مساحة واحدة واعية بالدور—من دون الادعاء بأن الموصلات الخارجية مفعّلة قبل أوانها.",
        modules: [
          { icon: ScanLine, title: "نقطة البيع والعمل اليومي", body: "مسارات بيع سريعة ومهيأة للمس مع نطاق الفرع ومسارات الباركود والبدائل الآمنة." },
          { icon: Layers3, title: "المخزون والتتبع", body: "دفعات وتواريخ انتهاء وتخطيط FEFO وإشارات إعادة الطلب وسلسلة حيازة واضحة." },
          { icon: Workflow, title: "المشتريات والإمداد", body: "تدفقات شراء تبدأ بالمراجعة مع أرصدة الموردين والموافقات وتسجيل سبب القرار." },
          { icon: Stethoscope, title: "الرعاية والحدود السريرية", body: "تبقى مسارات الوصفات والمرضى محمية ومقيدة بالدور وتفشل بأمان عند غياب المتطلبات." },
          { icon: WalletCards, title: "المالية والموظفون", body: "أسس مالية محددة النطاق والمصروفات وقواعد الرواتب والورديات ومساحات الفريق." },
          { icon: BrainCircuit, title: "ذكاء مساعد", body: "مساعدة ثنائية اللغة تدعم الناس من دون تشخيص أو صرف أو تنفيذ مستقل." },
        ],
        modelKicker: "نموذج يضع الإنسان أولاً",
        modelTitle: "مصممة لتجعل الخطوة الآمنة التالية واضحة.",
        modelBody: "تبدأ كل مساحة عمل بالمؤسسة والفرع والاختصاص والدور النشط، ثم تكشف تدريجياً الإجراءات المسموح بها فعلاً.",
        modelSteps: [
          ["01", "النطاق أولاً", "تبقى المؤسسة والفرع والاختصاص وحالة التجريبي/الإنتاج ظاهرة."],
          ["02", "اعمل بثقة", "توجّه الواجهة إلى الإجراء المصرح به مع حالات واضحة وبدائل آمنة."],
          ["03", "راجع قبل الأثر", "تتطلب التغييرات المالية والسريرية والشرائية والمنظمة سلطة بشرية واضحة."],
        ],
        governanceKicker: "حوكمة افتراضية",
        governanceTitle: "مفيدة، صادقة، وجاهزة للتدقيق.",
        governanceBody: "تفصل MEDORA بين ما تم تنفيذه وما يزال مرتبطاً بمتطلبات التكامل، حتى لا يختلط الحد الجاهز بالاتصال الخارجي الحي.",
        boundaries: ["عزل المؤسسة والفرع", "سجل تدقيق تراكمي", "فشل آمن للعمليات المنظمة", "الذكاء الاصطناعي استشاري فقط"],
        readiness: "جاهزية التكامل",
        readinessBody: "تبقى الموصلات الحكومية والدفع والتأمين والكتالوج والأجهزة معطلة حتى تتوفر العقود والاعتمادات ومراجعة الأمان ودليل القبول.",
        ctaTitle: "امنح فرقك مكاناً واحداً ترى فيه العمل بوضوح.",
        ctaBody: "ابدأ بمساحة عمل آمنة مبنية حول واقع التشغيل الصحي.",
        footer: "مصمم ليكون واضحاً للناس وحذراً مع أعمال الرعاية الصحية الحساسة.",
        brandTitle: "MEDORA | منظومة الرعاية الصحية المتكاملة",
        brandSubtitle: "تشغيل صحي متكامل وآمن",
      };

  return (
    <main dir={direction} className="relative min-h-screen overflow-hidden bg-[#f4f7fb] text-[#0d1b2a]">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(15,118,110,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(15,118,110,0.035)_1px,transparent_1px)] [background-size:34px_34px]" aria-hidden="true" />
      <div className="pointer-events-none absolute -left-40 top-20 h-[30rem] w-[30rem] rounded-full bg-cyan-200/30 blur-3xl" aria-hidden="true" />
      <div className="pointer-events-none absolute -right-40 top-[38rem] h-[34rem] w-[34rem] rounded-full bg-violet-200/20 blur-3xl" aria-hidden="true" />

      <div className="relative mx-auto w-full max-w-[1440px] px-5 py-5 sm:px-8 lg:px-12">
        <header className="flex items-center justify-between gap-4">
          <a href="/" className="flex min-w-0 items-center gap-3" aria-label={copy.brandTitle}>
            <BrandMark />
            <div className="min-w-0">
              <p className="truncate text-sm font-bold tracking-tight sm:text-base">{copy.brandTitle}</p>
              <p className="hidden truncate text-[11px] text-slate-500 sm:block">{copy.brandSubtitle}</p>
            </div>
          </a>
          <div className="flex shrink-0 items-center gap-2">
            <Badge variant="outline" className="hidden border-emerald-200 bg-emerald-50 text-emerald-700 sm:flex"><ShieldCheck className="mr-1 h-3.5 w-3.5" />{english ? "Secure access" : "دخول آمن"}</Badge>
            <LanguageSwitcher compact />
          </div>
        </header>

        <nav className="mx-auto mt-5 hidden justify-center gap-7 text-xs font-semibold text-slate-500 md:flex" aria-label={english ? "Primary" : "الرئيسية"}>
          <a href="#platform" className="hover:text-cyan-700">{copy.nav[0]}</a>
          <a href="#model" className="hover:text-cyan-700">{copy.nav[1]}</a>
          <a href="#governance" className="hover:text-cyan-700">{copy.nav[2]}</a>
        </nav>

        <section className="grid items-center gap-12 py-14 lg:grid-cols-[1.08fr_.92fr] lg:gap-20 lg:py-20">
          <div className="max-w-2xl">
            <SectionKicker><Sparkles className="h-3.5 w-3.5" />{copy.eyebrow}</SectionKicker>
            <h1 className="max-w-3xl text-4xl font-black leading-[1.08] tracking-[-0.04em] sm:text-6xl">{copy.title}</h1>
            <p className="mt-6 max-w-xl text-base leading-8 text-slate-600 sm:text-lg">{copy.subtitle}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Button asChild size="lg" className="h-12 rounded-xl bg-[#0d1b2a] px-6 text-white shadow-lg shadow-slate-900/15 hover:bg-[#18314a]"><a href={welcomeRoutes.login}>{copy.login}<Arrow className="mr-2 h-4 w-4" /></a></Button>
              <Button asChild size="lg" variant="ghost" className="h-12 rounded-xl px-4 text-slate-700 hover:bg-white"><a href={welcomeRoutes.workspace}>{copy.continue}<ChevronLeft className="mr-2 h-4 w-4" /></a></Button>
            </div>
            <p className="mt-4 max-w-xl text-xs leading-6 text-slate-500"><LockKeyhole className="mr-1 inline h-3.5 w-3.5 text-cyan-700" />{copy.demoNote}</p>
            <div className="mt-10 flex flex-wrap gap-2">{[copy.scopeValue, copy.auditValue, copy.reviewValue].map(item => <span key={item} className="rounded-full border border-slate-200 bg-white/80 px-3 py-2 text-xs font-medium text-slate-600">{item}</span>)}</div>
          </div>

          <div className="relative">
            <div className="absolute -inset-5 rounded-[2.5rem] bg-gradient-to-br from-cyan-200/50 via-white/20 to-violet-200/40 blur-2xl" aria-hidden="true" />
            <div className="relative overflow-hidden rounded-[2rem] border border-white/80 bg-white/80 p-5 shadow-[0_24px_80px_rgba(13,27,42,0.14)] backdrop-blur-xl sm:p-7">
              <div className="flex items-center justify-between border-b border-slate-100 pb-5"><div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-700">{copy.workspaceSub}</p><p className="mt-1 text-lg font-bold">{copy.workspaceTitle}</p></div><div className="grid h-10 w-10 place-items-center rounded-xl bg-cyan-50 text-cyan-700"><CheckCircle2 className="h-5 w-5" /></div></div>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-[#0d1b2a] p-4 text-white sm:col-span-2"><p className="text-xs text-cyan-200">{copy.workspaceSub}</p><p className="mt-2 text-2xl font-bold">{copy.workspaceMetric}</p><div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full w-4/5 rounded-full bg-gradient-to-l from-cyan-300 to-teal-200" /></div></div>
                {[ [copy.scope, copy.scopeValue, "text-emerald-700"], [copy.audit, copy.auditValue, "text-cyan-700"], [copy.review, copy.reviewValue, "text-violet-700"] ].map(([label, value, tone]) => <div key={label} className="rounded-2xl border border-slate-100 bg-slate-50 p-4 sm:last:col-span-2"><p className="text-xs text-slate-500">{label}</p><p className={`mt-2 font-bold ${tone}`}>{value}</p></div>)}
              </div>
              <div className="mt-6 rounded-2xl border border-cyan-100 bg-cyan-50/70 p-4"><div className="flex items-start gap-3"><ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-cyan-700" /><p className="text-sm leading-6 text-cyan-950"><strong>{copy.trustLabel}:</strong> {copy.trustTitle}</p></div></div>
            </div>
          </div>
        </section>

        <section id="platform" className="scroll-mt-10 py-16 sm:py-20">
          <SectionKicker>{copy.platformKicker}</SectionKicker>
          <div className="grid gap-10 lg:grid-cols-[.8fr_1.2fr] lg:items-end"><div><h2 className="max-w-2xl text-3xl font-black tracking-tight sm:text-5xl">{copy.platformTitle}</h2></div><p className="max-w-2xl text-base leading-8 text-slate-600">{copy.platformBody}</p></div>
          <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-3">{copy.modules.map(({ icon: Icon, title, body }) => <article key={title} className="rounded-3xl border border-slate-200/80 bg-white/80 p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"><div className="mb-5 grid h-11 w-11 place-items-center rounded-2xl bg-cyan-50 text-cyan-700"><Icon className="h-5 w-5" /></div><h3 className="text-lg font-bold">{title}</h3><p className="mt-2 text-sm leading-7 text-slate-600">{body}</p></article>)}</div>
        </section>

        <section id="model" className="scroll-mt-10 rounded-[2.5rem] border border-slate-200/80 bg-white/70 px-6 py-14 shadow-sm sm:px-10 sm:py-16">
          <SectionKicker>{copy.modelKicker}</SectionKicker>
          <div className="grid gap-10 lg:grid-cols-[.9fr_1.1fr]"><div><h2 className="text-3xl font-black tracking-tight sm:text-4xl">{copy.modelTitle}</h2><p className="mt-5 text-base leading-8 text-slate-600">{copy.modelBody}</p></div><div className="space-y-4">{copy.modelSteps.map(([number, title, body]) => <div key={number} className="flex gap-4 rounded-2xl border border-slate-200 bg-slate-50/70 p-5"><div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#0d1b2a] text-xs font-bold text-white">{number}</div><div><h3 className="font-bold">{title}</h3><p className="mt-1 text-sm leading-6 text-slate-600">{body}</p></div></div>)}</div></div>
        </section>

        <section id="governance" className="scroll-mt-10 py-16 sm:py-20">
          <SectionKicker>{copy.governanceKicker}</SectionKicker>
          <div className="grid gap-10 lg:grid-cols-[1fr_.9fr] lg:items-center"><div><h2 className="text-3xl font-black tracking-tight sm:text-5xl">{copy.governanceTitle}</h2><p className="mt-5 max-w-2xl text-base leading-8 text-slate-600">{copy.governanceBody}</p><div className="mt-7 grid gap-3 sm:grid-cols-2">{copy.boundaries.map(item => <div key={item} className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white/80 p-4 text-sm font-semibold"><CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />{item}</div>)}</div></div><div className="rounded-[2rem] bg-[#0d1b2a] p-7 text-white shadow-2xl"><ShieldCheck className="h-7 w-7 text-cyan-300" /><h3 className="mt-5 text-xl font-bold">{copy.readiness}</h3><p className="mt-3 text-sm leading-7 text-slate-300">{copy.readinessBody}</p></div></div>
        </section>

        <section className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-[#0d1b2a] via-[#123047] to-[#0f766e] px-7 py-14 text-white sm:px-12 sm:py-16"><div className="relative max-w-3xl"><SectionKicker dark><UsersRound className="h-3.5 w-3.5" />MEDORA</SectionKicker><h2 className="text-3xl font-black tracking-tight sm:text-5xl">{copy.ctaTitle}</h2><p className="mt-5 max-w-2xl text-base leading-8 text-slate-200">{copy.ctaBody}</p><Button asChild size="lg" className="mt-8 h-12 rounded-xl bg-white px-6 text-[#0d1b2a] hover:bg-slate-100"><a href={welcomeRoutes.login}>{copy.login}<Arrow className="mr-2 h-4 w-4" /></a></Button></div></section>

        <footer className="border-t border-slate-200/80 py-7 text-center text-xs leading-6 text-slate-500">{copy.footer}</footer>
      </div>
    </main>
  );
}
