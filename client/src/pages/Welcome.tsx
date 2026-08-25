// MEDORA | ميدورا — Integrated Health Care System
// Copyright (c) 2026 Hossam Naeim Osman | حسام نعيم عثمان. All rights reserved.
// Proprietary and confidential. Unauthorized copying, distribution, or use of this
// software, or of any portion of it, is strictly prohibited.
// Source: https://github.com/0SSAM/MEDORA-Health-Care-Eco-System
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useLocalization } from "@/contexts/LocalizationContext";
import { ArrowLeft, ArrowRight, CheckCircle2, ChevronLeft, LockKeyhole, ShieldCheck, Sparkles } from "lucide-react";

export const welcomeRoutes = { login: "/login", workspace: "/workspace" } as const;

function BrandMark() {
  return (
    <div className="medora-brand-mark grid h-14 w-14 place-items-center rounded-[1.35rem] shadow-lg shadow-cyan-900/10" aria-label="ميدورا">
      <svg viewBox="0 0 48 48" role="img" aria-hidden="true" className="h-9 w-9">
        <path d="M24 4 40 10v12c0 10.5-6.7 18.2-16 22-9.3-3.8-16-11.5-16-22V10L24 4Z" fill="#0d1b2a" opacity=".92" />
        <path d="M24 12c-5.5 3.8-8.5 8.1-8.5 12.9 0 5.6 3.8 9.5 8.5 11.1 4.7-1.6 8.5-5.5 8.5-11.1C32.5 20.1 29.5 15.8 24 12Z" fill="#9ff2e4" />
        <path d="M24 18c-2.4 2.5-3.6 4.8-3.6 7.1 0 2.4 1.4 4.2 3.6 5.2 2.2-1 3.6-2.8 3.6-5.2 0-2.3-1.2-4.6-3.6-7.1Z" fill="#19c5d1" />
      </svg>
    </div>
  );
}

export default function Welcome() {
  const { user } = useAuth();
  const { language, direction } = useLocalization();
  const english = language === "en";
  const Arrow = direction === "rtl" ? ArrowLeft : ArrowRight;

  const copy = english
    ? {
        eyebrow: "MEDORA | INTEGRATED HEALTH SYSTEM",
        title: "One secure operating space for the healthcare journey.",
        subtitle: "A calm, intelligent foundation for pharmacies, hospitals, insurers, distributors, laboratories, and care teams across the Arab world.",
        login: "Sign in securely",
        continue: "Continue to your workspace",
        demoNote: "Secure access is available only through authorized employee or administrator accounts.",
        trust: "Security-first by design",
        trustBody: "Tenant isolation, scoped permissions, audit trails, and fail-closed regulated workflows.",
        features: ["Unified operations", "Regional readiness", "Human-friendly workflows"],
        footer: "Built to be clear for people and careful with sensitive healthcare work.",
      }
    : {
        eyebrow: "ميدورا | منظومة الرعاية الصحية المتكاملة",
        title: "مساحة تشغيل آمنة وموحّدة لدورة الرعاية الصحية.",
        subtitle: "أساس هادئ وذكي للصيدليات والمستشفيات وشركات التأمين والتوزيع والمعامل وفرق الرعاية في العالم العربي.",
        login: "تسجيل الدخول بأمان",
        continue: "متابعة إلى مساحة العمل",
        demoNote: "الوصول متاح فقط من خلال حساب موظف أو مسؤول مصرح به.",
        trust: "الأمان أولاً",
        trustBody: "عزل المؤسسات، صلاحيات محددة، سجل تدقيق، وفشل آمن في العمليات المنظمة.",
        features: ["عمليات موحّدة", "جاهزية إقليمية", "تجربة عمل إنسانية"],
        footer: "مصمم ليكون واضحاً للناس وحذراً مع أعمال الرعاية الصحية الحساسة.",
      };

  return (
    <main dir={direction} className="relative min-h-screen overflow-hidden bg-[#f4f7fb] text-[#0d1b2a]">
      <div className="pointer-events-none absolute -left-24 top-16 h-72 w-72 rounded-full bg-cyan-200/40 blur-3xl" aria-hidden="true" />
      <div className="pointer-events-none absolute -right-24 bottom-0 h-96 w-96 rounded-full bg-violet-200/30 blur-3xl" aria-hidden="true" />
      <div className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col px-5 py-5 sm:px-8 lg:px-12">
        <header className="flex items-center justify-between gap-4">
          <a href="/" className="flex items-center gap-3" aria-label="ميدورا | منظومة الرعاية الصحية المتكاملة">
            <BrandMark />
            <div>
              <p className="text-sm font-bold tracking-tight sm:text-base">ميدورا | منظومة الرعاية الصحية المتكاملة</p>
              <p className="text-[11px] text-slate-500">MEDORA | Integrated Health System</p>
            </div>
          </a>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="hidden border-emerald-200 bg-emerald-50 text-emerald-700 sm:flex"><ShieldCheck className="ml-1 h-3.5 w-3.5" /> {english ? "Secure access" : "دخول آمن"}</Badge>
            <LanguageSwitcher compact />
          </div>
        </header>

        <section className="grid flex-1 items-center gap-12 py-14 lg:grid-cols-[1.08fr_.92fr] lg:gap-20 lg:py-20">
          <div className="max-w-2xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-200 bg-white/80 px-3 py-1.5 text-xs font-semibold text-cyan-800 shadow-sm"><Sparkles className="h-3.5 w-3.5" />{copy.eyebrow}</div>
            <h1 className="max-w-3xl text-4xl font-black leading-[1.12] tracking-[-0.04em] text-[#0d1b2a] sm:text-6xl">{copy.title}</h1>
            <p className="mt-6 max-w-xl text-base leading-8 text-slate-600 sm:text-lg">{copy.subtitle}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Button asChild size="lg" className="h-12 rounded-xl bg-[#0d1b2a] px-6 text-white shadow-lg shadow-slate-900/15 hover:bg-[#18314a]"><a href={welcomeRoutes.login}>{copy.login}<Arrow className="mr-2 h-4 w-4" /></a></Button>
              {user && <Button asChild size="lg" variant="ghost" className="h-12 rounded-xl px-4 text-slate-700 hover:bg-white"><a href={welcomeRoutes.workspace}>{copy.continue}<ChevronLeft className="mr-2 h-4 w-4" /></a></Button>}
            </div>
            <p className="mt-4 max-w-xl text-xs leading-6 text-slate-500"><LockKeyhole className="mr-1 inline h-3.5 w-3.5 text-cyan-700" />{copy.demoNote}</p>
            <div className="mt-10 flex flex-wrap gap-2">{copy.features.map(feature => <span key={feature} className="rounded-full border border-slate-200 bg-white/80 px-3 py-2 text-xs font-medium text-slate-600">{feature}</span>)}</div>
          </div>

          <div className="relative">
            <div className="absolute -inset-5 rounded-[2.5rem] bg-gradient-to-br from-cyan-200/50 via-white/20 to-violet-200/40 blur-2xl" aria-hidden="true" />
            <div className="relative overflow-hidden rounded-[2rem] border border-white/80 bg-white/80 p-5 shadow-[0_24px_80px_rgba(13,27,42,0.14)] backdrop-blur-xl sm:p-7">
              <div className="flex items-center justify-between border-b border-slate-100 pb-5"><div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-700">MEDORA / WORKSPACE</p><p className="mt-1 text-lg font-bold">{english ? "A clear view of the operation" : "رؤية واضحة لسير العمل"}</p></div><div className="grid h-10 w-10 place-items-center rounded-xl bg-cyan-50 text-cyan-700"><CheckCircle2 className="h-5 w-5" /></div></div>
              <div className="mt-6 grid gap-3 sm:grid-cols-2"><div className="rounded-2xl bg-[#0d1b2a] p-4 text-white sm:col-span-2"><p className="text-xs text-cyan-200">{english ? "One governed workspace" : "مساحة عمل منضبطة"}</p><p className="mt-2 text-2xl font-bold">{english ? "Care, operations, control" : "رعاية · تشغيل · رقابة"}</p><div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full w-4/5 rounded-full bg-gradient-to-l from-cyan-300 to-teal-200" /></div></div><div className="rounded-2xl border border-slate-100 bg-slate-50 p-4"><p className="text-xs text-slate-500">{english ? "Access" : "الوصول"}</p><p className="mt-2 font-bold text-emerald-700">{english ? "Scoped & audited" : "منضبط ومدقق"}</p></div><div className="rounded-2xl border border-slate-100 bg-slate-50 p-4"><p className="text-xs text-slate-500">{english ? "Governance" : "الحوكمة"}</p><p className="mt-2 font-bold text-cyan-700">{english ? "Scoped & controlled" : "منضبطة ومتحكم بها"}</p></div></div>
              <div className="mt-6 rounded-2xl border border-cyan-100 bg-cyan-50/70 p-4"><div className="flex items-start gap-3"><ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-cyan-700" /><p className="text-sm leading-6 text-cyan-950">{copy.trust} — {copy.trustBody}</p></div></div>
            </div>
          </div>
        </section>
        <footer className="border-t border-slate-200/80 py-5 text-center text-xs text-slate-500">{copy.footer}</footer>
      </div>
    </main>
  );
}
