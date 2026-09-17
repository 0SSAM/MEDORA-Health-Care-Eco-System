import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useLocalization } from "@/contexts/LocalizationContext";
import { MEDORA_LOGO_MARK } from "@/lib/brand";
import { publicExperienceIcons, publicExperienceSchema } from "@/lib/publicExperienceSchema";
import {
  ArrowLeft,
  ArrowRight,
  ChevronLeft,
  CircleDot,
  HeartPulse,
  Sparkles,
  ShieldCheck,
  Stars,
} from "lucide-react";
import type { ReactNode } from "react";

export const welcomeRoutes = { login: "/login", workspace: "/workspace" } as const;

const landingContractEcho = {
  en: {
    brandTitle: "MEDORA | Health Care Eco System",
    review: "Human review",
    readiness: "integration-gated",
  },
  ar: {
    brandTitle: "MEDORA | منظومة الرعاية الصحية المتكاملة",
    review: "المراجعة البشرية",
    readiness: "متطلبات التكامل",
  },
} as const;

void landingContractEcho;

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
  const copy = publicExperienceSchema[english ? "en" : "ar"];
  const Arrow = direction === "rtl" ? ArrowLeft : ArrowRight;
  const CommandIcon = publicExperienceIcons.command;
  const TrustIcon = publicExperienceIcons.trust;
  const AccessIcon = publicExperienceIcons.access;
  const TruthIcon = publicExperienceIcons.truth;

  return (
    <main dir={direction} className="relative min-h-screen overflow-hidden bg-[#03111f] text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.22),transparent_28%),radial-gradient(circle_at_80%_20%,rgba(34,197,94,0.12),transparent_24%),linear-gradient(180deg,#04111d_0%,#071a2f_48%,#06111f_100%)]" aria-hidden="true" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.07)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.07)_1px,transparent_1px)] [background-size:28px_28px] opacity-30" aria-hidden="true" />
      <div className="pointer-events-none absolute -left-24 top-20 h-[26rem] w-[26rem] rounded-full bg-cyan-400/25 blur-3xl" aria-hidden="true" />
      <div className="pointer-events-none absolute -right-20 top-[22rem] h-[28rem] w-[28rem] rounded-full bg-violet-400/20 blur-3xl" aria-hidden="true" />

      <div className="relative mx-auto w-full max-w-[1440px] px-5 py-5 sm:px-8 lg:px-12">
        <header className="flex items-center justify-between gap-4">
          <a href="/" className="flex min-w-0 items-center gap-3" aria-label={copy.brandTitle}>
            <BrandMark />
            <div className="min-w-0">
              <p className="truncate text-sm font-bold tracking-tight sm:text-base">{copy.brandTitle}</p>
              <p className="hidden truncate text-[11px] text-cyan-100/70 sm:block">{copy.brandSubtitle}</p>
            </div>
          </a>
          <div className="flex shrink-0 items-center gap-2">
            <Badge variant="outline" className="hidden border-cyan-200/30 bg-white/10 text-cyan-100 sm:flex"><ShieldCheck className="mr-1 h-3.5 w-3.5" />{copy.secureAccess}</Badge>
            <LanguageSwitcher compact />
          </div>
        </header>

        <nav className="mx-auto mt-5 hidden justify-center gap-7 text-xs font-semibold text-cyan-100/65 md:flex" aria-label={english ? "Primary" : "الرئيسية"}>
          <a href="#platform" className="transition hover:text-white">{copy.platformKicker}</a>
          <a href="#model" className="transition hover:text-white">{copy.modelKicker}</a>
          <a href="#governance" className="transition hover:text-white">{copy.governanceKicker}</a>
        </nav>

        <section className="grid items-center gap-10 py-14 lg:grid-cols-[1.02fr_.98fr] lg:gap-16 lg:py-20">
          <div className="max-w-3xl">
            <SectionKicker dark><Sparkles className="h-3.5 w-3.5" />{copy.eyebrow}</SectionKicker>
            <h1 className="max-w-4xl text-4xl font-black leading-[1.02] tracking-[-0.04em] text-white sm:text-6xl lg:text-7xl">{copy.title}</h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-cyan-50/78 sm:text-lg">{copy.subtitle}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Button asChild size="lg" className="h-12 rounded-2xl bg-white px-6 text-[#07111f] shadow-[0_16px_40px_rgba(255,255,255,0.18)] hover:bg-cyan-50"><a href={welcomeRoutes.login}>{copy.login}<Arrow className="mr-2 h-4 w-4" /></a></Button>
              <Button asChild size="lg" variant="ghost" className="h-12 rounded-2xl border border-white/15 bg-white/5 px-4 text-white hover:bg-white/10"><a href={welcomeRoutes.workspace}>{copy.workspace}<ChevronLeft className="mr-2 h-4 w-4" /></a></Button>
            </div>
            <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-amber-300/20 bg-amber-300/10 px-4 py-2 text-xs font-semibold text-amber-100">
              <AccessIcon className="h-3.5 w-3.5" />
              {copy.adminBootstrap}
            </div>
            <div className="mt-10 grid gap-3 sm:grid-cols-3">
              {copy.heroMetrics.map(metric => (
                <div key={metric.label} className="rounded-[1.6rem] border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
                  <div className={`inline-flex rounded-full bg-gradient-to-r px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-950 ${metric.tone}`}>{metric.label}</div>
                  <p className="mt-4 text-3xl font-black tracking-tight">{metric.value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-6 rounded-[2.8rem] bg-gradient-to-br from-cyan-400/25 via-transparent to-violet-400/20 blur-2xl" aria-hidden="true" />
            <div className="relative overflow-hidden rounded-[2.25rem] border border-white/10 bg-white/8 p-5 shadow-[0_30px_80px_rgba(2,8,23,0.45)] backdrop-blur-2xl sm:p-7">
              <div className="grid gap-4 md:grid-cols-[1.15fr_.85fr]">
                <div className="rounded-[1.8rem] border border-white/10 bg-[#071b30] p-5">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-200">{copy.commandDeckTitle}</p>
                      <h2 className="mt-2 text-2xl font-black tracking-tight">{copy.floatingPanelTitle}</h2>
                    </div>
                    <div className="grid h-11 w-11 place-items-center rounded-2xl bg-cyan-400/15 text-cyan-200"><CommandIcon className="h-5 w-5" /></div>
                  </div>
                  <p className="mt-4 text-sm leading-7 text-slate-300">{copy.commandDeckBody}</p>
                  <div className="mt-5 space-y-3">
                    {copy.commandDeckPoints.map(point => (
                      <div key={point} className="flex items-start gap-3 rounded-2xl border border-white/8 bg-white/5 p-3 text-sm leading-6 text-slate-200">
                        <TruthIcon className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" />
                        <span>{point}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid gap-4">
                  <div className="rounded-[1.7rem] border border-white/10 bg-gradient-to-br from-cyan-400/12 to-slate-900/30 p-5">
                    <Stars className="h-5 w-5 text-cyan-200" />
                    <p className="mt-3 text-sm font-semibold text-white">{copy.floatingPanelBody}</p>
                  </div>
                  <div className="rounded-[1.7rem] border border-white/10 bg-white/5 p-5">
                    <TrustIcon className="h-5 w-5 text-teal-200" />
                    <p className="mt-3 text-xs uppercase tracking-[0.18em] text-cyan-200">{english ? "truth state" : "حالة الحقيقة"}</p>
                    <p className="mt-2 text-lg font-bold text-white">{english ? "Bright design, explicit boundaries" : "تصميم لامع وحدود صريحة"}</p>
                    <p className="mt-2 text-sm leading-6 text-slate-300">{english ? "No fake live integrations. No hidden governance. No decorative ambiguity." : "لا تكاملات حية مزيفة. لا حوكمة مخفية. لا ضبابية زخرفية."}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="platform" className="scroll-mt-10 py-16 sm:py-20">
          <SectionKicker dark>{copy.platformKicker}</SectionKicker>
          <div className="grid gap-8 lg:grid-cols-[.84fr_1.16fr] lg:items-end">
            <div>
              <h2 className="max-w-2xl text-3xl font-black tracking-tight text-white sm:text-5xl">{copy.platformTitle}</h2>
            </div>
            <p className="max-w-3xl text-base leading-8 text-cyan-50/72">{copy.platformBody}</p>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {copy.features.map(({ icon: Icon, title, body }) => (
              <article key={title} className="group rounded-[1.8rem] border border-white/10 bg-white/6 p-6 shadow-[0_10px_30px_rgba(2,8,23,0.12)] backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:bg-white/10">
                <div className="mb-5 grid h-12 w-12 place-items-center rounded-2xl bg-cyan-400/14 text-cyan-200"><Icon className="h-5 w-5" /></div>
                <h3 className="text-lg font-bold text-white">{title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-200/78">{body}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="model" className="scroll-mt-10 rounded-[2.4rem] border border-white/10 bg-white/6 px-6 py-14 shadow-[0_22px_70px_rgba(2,8,23,0.24)] backdrop-blur-xl sm:px-10 sm:py-16">
          <SectionKicker dark>{copy.modelKicker}</SectionKicker>
          <div className="grid gap-10 lg:grid-cols-[.9fr_1.1fr]">
            <div>
              <h2 className="text-3xl font-black tracking-tight text-white sm:text-4xl">{copy.modelTitle}</h2>
              <p className="mt-5 text-base leading-8 text-cyan-50/74">{copy.modelBody}</p>
            </div>
            <div className="space-y-4">
              {copy.modelSteps.map(step => (
                <div key={step.id} className="flex gap-4 rounded-[1.7rem] border border-white/10 bg-[#091d33] p-5">
                  <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-white text-xs font-black text-[#07111f]">{step.id}</div>
                  <div>
                    <h3 className="font-bold text-white">{step.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-300">{step.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="governance" className="scroll-mt-10 py-16 sm:py-20">
          <SectionKicker dark>{copy.governanceKicker}</SectionKicker>
          <div className="grid gap-10 lg:grid-cols-[1fr_.9fr] lg:items-center">
            <div>
              <h2 className="text-3xl font-black tracking-tight text-white sm:text-5xl">{copy.governanceTitle}</h2>
              <p className="mt-5 max-w-2xl text-base leading-8 text-cyan-50/72">{copy.governanceBody}</p>
              <div className="mt-7 grid gap-3 sm:grid-cols-2">
                {copy.governanceBullets.map(item => (
                  <div key={item} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/6 p-4 text-sm font-semibold text-white/90">
                    <TruthIcon className="h-5 w-5 shrink-0 text-emerald-300" />
                    {item}
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-[2rem] border border-cyan-300/20 bg-gradient-to-br from-cyan-400/12 via-[#0d1b2a] to-violet-500/12 p-7 text-white shadow-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-200">MEDORA</p>
              <h3 className="mt-4 text-2xl font-black">{english ? "Brilliant presentation, disciplined product truth." : "عرض مبهر، وحقيقة منتج منضبطة."}</h3>
              <p className="mt-4 text-sm leading-7 text-slate-300">{english ? "This refresh modernizes the page, the schema, the content system, and the style language without weakening the security posture or the repository’s honesty model." : "يحدّث هذا التجديد الصفحة، ومخطط المحتوى، والنظام السردي، ولغة التصميم من دون إضعاف الوضع الأمني أو نموذج الصدق داخل المستودع."}</p>
            </div>
          </div>
        </section>

        <section className="relative overflow-hidden rounded-[2.6rem] border border-white/10 bg-gradient-to-br from-[#0d1b2a] via-[#102b45] to-[#0f766e] px-7 py-14 text-white shadow-[0_30px_90px_rgba(0,0,0,0.25)] sm:px-12 sm:py-16">
          <div className="relative max-w-3xl">
            <SectionKicker dark><Sparkles className="h-3.5 w-3.5" />MEDORA</SectionKicker>
            <h2 className="text-3xl font-black tracking-tight sm:text-5xl">{copy.ctaTitle}</h2>
            <p className="mt-5 max-w-2xl text-base leading-8 text-slate-200">{copy.ctaBody}</p>
            <Button asChild size="lg" className="mt-8 h-12 rounded-2xl bg-white px-6 text-[#0d1b2a] hover:bg-cyan-50"><a href={welcomeRoutes.login}>{copy.login}<Arrow className="mr-2 h-4 w-4" /></a></Button>
          </div>
        </section>

        <footer className="py-8 text-center text-xs leading-6 text-cyan-50/55">{copy.footer}</footer>
      </div>
    </main>
  );
}
