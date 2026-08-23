import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useLocalization } from "@/contexts/LocalizationContext";
import { CheckCircle2, Clock3, Info, KeyRound, LockKeyhole, Mail, ShieldCheck } from "lucide-react";

export const authSecurityReadinessFallback = { twoFactorState: "deferred" as const, recoveryChannelState: "deferred" as const, emailProviderConfigured: false as const, externalActivation: "blocked" as const };
type InterfaceLanguage = "ar" | "en";

const copy = {
  ar: {
    settings: "إعدادات الحماية والمصادقة", settingsDetail: "واجهة إعداد جاهزة للربط المؤسسي، مع إبقاء التفعيل مغلقاً حتى اعتماد مزود البريد/OTP وسياسة 2FA.",
    statusError: "تعذر قراءة حالة الحماية. تبقى كل عمليات التفعيل الخارجية مغلقة بأمان.", noSecret: "لا يتم عرض QR أو سر TOTP أو رمز استعادة داخل المتصفح قبل إنشاء تسجيل آمن من الخادم وربط مزود مؤسسي معتمد.",
    twoFactor: "المصادقة الثنائية 2FA", twoFactorDetail: "ستكون هذه المساحة جاهزة لتطبيق TOTP أو موفر مؤسسي بعد اعتماد السياسة وتوفير قناة تحقق موثوقة.", noTwoFactor: "الحالة الحالية: لا يوجد تسجيل 2FA نشط لهذا الحساب. لا يمكن بدء التسجيل أو إصدار أسرار/رموز وهمية في الوضع الحالي.", startTwoFactor: "بدء إعداد 2FA", twoFactorTooltip: "يتطلب تفعيل مزود 2FA مؤسسياً، سياسة اعتماد، وتسجيل الخادم قبل إتاحة QR أو رموز الاستعادة.",
    recovery: "استعادة كلمة المرور", recoveryDetail: "مسار الاستعادة موجود خادمياً ويستخدم استجابات موحدة، أما الإرسال الفعلي فينتظر قناة بريد أو OTP مؤسسية.", recoveryAddress: "عنوان قناة الاستعادة المؤسسية", recoveryHelp: "هذا الحقل لا يحفظ بريداً ولا يرسل رسالة حالياً؛ سيُفعّل بعد ضبط مزود مؤسسي موثق من مسؤول النظام.", saveRecovery: "حفظ قناة الاستعادة", recoveryTooltip: "الإرسال متوقف حتى ربط قناة مؤسسية موثقة. لا يتم كشف توكنات الاستعادة للمتصفح.",
    requirements: "متطلبات التفعيل لاحقاً", requirementOne: "اعتماد مزود البريد أو OTP وعنوان الإرسال وسياسة الاحتفاظ.", requirementTwo: "اختبار بيئة غير إنتاجية وقبول السجلات والتنبيهات ومحددات المعدل.", requirementThree: "تفعيل 2FA من الخادم مع تدقيق التسجيل والإبطال وعدم تخزين الأسرار في المتصفح.",
    ready: "جاهز للتهيئة", deferred: "مؤجل حتى ربط القناة", blocked: "مغلق بأمان",
  },
  en: {
    settings: "Security and authentication settings", settingsDetail: "This setup surface is ready for an organisation-approved integration. Activation stays closed until an email/OTP provider and a 2FA policy are approved.",
    statusError: "The security readiness status could not be read. All external activation remains safely closed.", noSecret: "No QR code, TOTP secret, or recovery token is displayed in the browser before the server creates a secure enrolment and an approved enterprise provider is connected.",
    twoFactor: "Two-factor authentication", twoFactorDetail: "This area will be ready for TOTP or an enterprise provider after the policy is approved and a trusted verification channel is available.", noTwoFactor: "Current state: this account has no active 2FA enrolment. The current environment cannot start enrolment or issue fabricated secrets or codes.", startTwoFactor: "Start 2FA setup", twoFactorTooltip: "Activation requires an enterprise 2FA provider, an approval policy, and server-side enrolment logging before QR or recovery codes are available.",
    recovery: "Password recovery", recoveryDetail: "The recovery route exists on the server and uses uniform responses. Actual delivery waits for an approved enterprise email or OTP channel.", recoveryAddress: "Enterprise recovery-channel address", recoveryHelp: "This field does not save an address or send a message yet. It activates only after a system administrator configures a verified enterprise provider.", saveRecovery: "Save recovery channel", recoveryTooltip: "Delivery stays disabled until a verified enterprise channel is connected. Recovery tokens are never exposed to the browser.",
    requirements: "Future activation requirements", requirementOne: "Approve the email or OTP provider, sending address, and retention policy.", requirementTwo: "Test a non-production environment and accept logging, alerts, and rate limits.", requirementThree: "Enable 2FA from the server with enrolment and revocation auditing; never store secrets in the browser.",
    ready: "Ready to configure", deferred: "Deferred until channel connection", blocked: "Safely closed",
  },
} as const;

function ReadinessBadge({ state, language }: { state: "ready" | "deferred" | "blocked"; language: InterfaceLanguage }) {
  const text = copy[language];
  const config = { ready: { label: text.ready, className: "border-emerald-200 bg-emerald-50 text-emerald-800", icon: CheckCircle2 }, deferred: { label: text.deferred, className: "border-amber-200 bg-amber-50 text-amber-900", icon: Clock3 }, blocked: { label: text.blocked, className: "border-slate-200 bg-slate-100 text-slate-700", icon: LockKeyhole } } as const;
  const item = config[state]; const Icon = item.icon;
  return <Badge variant="outline" className={item.className}><Icon className="me-1 h-3.5 w-3.5" aria-hidden="true" />{item.label}</Badge>;
}

export function AuthenticationSettingsWorkspace() {
  const { language } = useLocalization();
  const interfaceLanguage: InterfaceLanguage = language === "en" ? "en" : "ar";
  const text = copy[interfaceLanguage];
  const readiness = trpc.auth.securityReadiness.useQuery(undefined, { retry: false });
  const [recoveryAddress, setRecoveryAddress] = useState("");
  const state = readiness.data?.recoveryChannelState ?? authSecurityReadinessFallback.recoveryChannelState;
  const twoFactorState = readiness.data?.twoFactorState ?? authSecurityReadinessFallback.twoFactorState;
  const emailConfigured = Boolean(readiness.data?.emailProviderConfigured ?? authSecurityReadinessFallback.emailProviderConfigured);

  return <div className="space-y-4" dir={interfaceLanguage === "ar" ? "rtl" : "ltr"}>
    <Card className="border-cyan-100 bg-cyan-50/50 shadow-sm"><CardHeader className="pb-3"><div className="flex flex-wrap items-start justify-between gap-3"><div><CardTitle className="flex items-center gap-2 text-lg text-[#0d1b2a]"><ShieldCheck className="h-5 w-5 text-cyan-700" aria-hidden="true" />{text.settings}</CardTitle><p className="mt-1 text-sm leading-6 text-slate-600">{text.settingsDetail}</p></div><ReadinessBadge state={readiness.isLoading ? "deferred" : state} language={interfaceLanguage} /></div></CardHeader><CardContent className="space-y-3 text-sm leading-6 text-slate-700">{readiness.isError && <p className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-rose-800" role="alert">{text.statusError}</p>}<div className="flex items-start gap-2 rounded-xl border border-cyan-200 bg-white p-3"><Info className="mt-1 h-4 w-4 shrink-0 text-cyan-700" aria-hidden="true" /><p>{text.noSecret}</p></div></CardContent></Card>
    <div className="grid gap-4 lg:grid-cols-2">
      <Card className="border-slate-200 shadow-sm"><CardHeader><div className="flex items-start justify-between gap-3"><CardTitle className="flex items-center gap-2 text-base"><KeyRound className="h-5 w-5 text-cyan-700" aria-hidden="true" />{text.twoFactor}</CardTitle><ReadinessBadge state={twoFactorState} language={interfaceLanguage} /></div><p className="text-sm leading-6 text-slate-500">{text.twoFactorDetail}</p></CardHeader><CardContent className="space-y-3"><div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-900">{text.noTwoFactor}</div><Tooltip><TooltipTrigger asChild><span className="inline-flex"><Button type="button" disabled className="cursor-not-allowed"><LockKeyhole className="me-2 h-4 w-4" aria-hidden="true" />{text.startTwoFactor}</Button></span></TooltipTrigger><TooltipContent className="max-w-xs text-start leading-5">{text.twoFactorTooltip}</TooltipContent></Tooltip></CardContent></Card>
      <Card className="border-slate-200 shadow-sm"><CardHeader><div className="flex items-start justify-between gap-3"><CardTitle className="flex items-center gap-2 text-base"><Mail className="h-5 w-5 text-cyan-700" aria-hidden="true" />{text.recovery}</CardTitle><ReadinessBadge state={state} language={interfaceLanguage} /></div><p className="text-sm leading-6 text-slate-500">{text.recoveryDetail}</p></CardHeader><CardContent className="space-y-3"><label className="block text-sm font-medium text-slate-700">{text.recoveryAddress}<input value={recoveryAddress} onChange={event => setRecoveryAddress(event.target.value)} placeholder="security@example.org" type="email" disabled={!emailConfigured} className="mt-2 h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm disabled:cursor-not-allowed disabled:bg-slate-100" aria-describedby="recovery-help" /></label><p id="recovery-help" className="text-xs leading-5 text-slate-500">{text.recoveryHelp}</p><Tooltip><TooltipTrigger asChild><span className="inline-flex"><Button type="button" disabled={!emailConfigured || !recoveryAddress.trim()} className="cursor-not-allowed"><Mail className="me-2 h-4 w-4" aria-hidden="true" />{text.saveRecovery}</Button></span></TooltipTrigger><TooltipContent className="max-w-xs text-start leading-5">{text.recoveryTooltip}</TooltipContent></Tooltip></CardContent></Card>
    </div>
    <Card className="border-slate-200 bg-slate-50 shadow-none"><CardContent className="p-4 text-xs leading-6 text-slate-600"><p className="font-semibold text-slate-800">{text.requirements}</p><ul className="mt-2 list-disc space-y-1 ps-5"><li>{text.requirementOne}</li><li>{text.requirementTwo}</li><li>{text.requirementThree}</li></ul></CardContent></Card>
  </div>;
}
