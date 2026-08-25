// MEDORA | ميدورا — Integrated Health Care System
// Copyright (c) 2026 Hossam Naeim Osman | حسام نعيم عثمان. All rights reserved.
// Proprietary and confidential. Unauthorized copying, distribution, or use of this
// software, or of any portion of it, is strictly prohibited.
// Source: https://github.com/0SSAM/MEDORA-Health-Care-Eco-System
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { CheckCircle2, Clock3, Info, KeyRound, LockKeyhole, Mail, ShieldCheck } from "lucide-react";

export const authSecurityReadinessFallback = {
  twoFactorState: "deferred" as const,
  recoveryChannelState: "deferred" as const,
  emailProviderConfigured: false as const,
  externalActivation: "blocked" as const,
};

function ReadinessBadge({ state }: { state: "ready" | "deferred" | "blocked" }) {
  const config = {
    ready: { label: "جاهز للتهيئة", className: "border-emerald-200 bg-emerald-50 text-emerald-800", icon: CheckCircle2 },
    deferred: { label: "مؤجل حتى ربط القناة", className: "border-amber-200 bg-amber-50 text-amber-900", icon: Clock3 },
    blocked: { label: "مغلق بأمان", className: "border-slate-200 bg-slate-100 text-slate-700", icon: LockKeyhole },
  } as const;
  const item = config[state];
  const Icon = item.icon;
  return <Badge variant="outline" className={item.className}><Icon className="ml-1 h-3.5 w-3.5" aria-hidden="true" />{item.label}</Badge>;
}

export function AuthenticationSettingsWorkspace() {
  const readiness = trpc.auth.securityReadiness.useQuery(undefined, { retry: false });
  const [recoveryAddress, setRecoveryAddress] = useState("");
  const state = readiness.data?.recoveryChannelState ?? authSecurityReadinessFallback.recoveryChannelState;
  const twoFactorState = readiness.data?.twoFactorState ?? authSecurityReadinessFallback.twoFactorState;
  const emailConfigured = Boolean(readiness.data?.emailProviderConfigured ?? authSecurityReadinessFallback.emailProviderConfigured);

  return (
    <div className="space-y-4">
      <Card className="border-cyan-100 bg-cyan-50/50 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <CardTitle className="flex items-center gap-2 text-lg text-[#0d1b2a]"><ShieldCheck className="h-5 w-5 text-cyan-700" aria-hidden="true" />إعدادات الحماية والمصادقة</CardTitle>
              <p className="mt-1 text-sm leading-6 text-slate-600">واجهة إعداد جاهزة للربط المؤسسي، مع إبقاء التفعيل مغلقاً حتى اعتماد مزود البريد/OTP وسياسة 2FA.</p>
            </div>
            <ReadinessBadge state={readiness.isLoading ? "deferred" : state} />
          </div>
        </CardHeader>
        <CardContent className="space-y-3 text-sm leading-6 text-slate-700">
          {readiness.isError && <p className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-rose-800" role="alert">تعذر قراءة حالة الحماية. تبقى كل عمليات التفعيل الخارجية مغلقة بأمان.</p>}
          <div className="flex items-start gap-2 rounded-xl border border-cyan-200 bg-white p-3"><Info className="mt-1 h-4 w-4 shrink-0 text-cyan-700" aria-hidden="true" /><p>لا يتم عرض QR أو سر TOTP أو رمز استعادة داخل المتصفح قبل إنشاء تسجيل آمن من الخادم وربط مزود مؤسسي معتمد.</p></div>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <div className="flex items-start justify-between gap-3"><CardTitle className="flex items-center gap-2 text-base"><KeyRound className="h-5 w-5 text-cyan-700" aria-hidden="true" />المصادقة الثنائية 2FA</CardTitle><ReadinessBadge state={twoFactorState} /></div>
            <p className="text-sm leading-6 text-slate-500">ستكون هذه المساحة جاهزة لتطبيق TOTP أو موفر مؤسسي بعد اعتماد السياسة وتوفير قناة تحقق موثوقة.</p>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-900">الحالة الحالية: لا يوجد تسجيل 2FA نشط لهذا الحساب. لا يمكن بدء التسجيل أو إصدار أسرار/رموز وهمية في الوضع الحالي.</div>
            <Tooltip>
              <TooltipTrigger asChild><span className="inline-flex"><Button type="button" disabled className="cursor-not-allowed"><LockKeyhole className="ml-2 h-4 w-4" aria-hidden="true" />بدء إعداد 2FA</Button></span></TooltipTrigger>
              <TooltipContent className="max-w-xs text-right leading-5">يتطلب تفعيل مزود 2FA مؤسسياً، سياسة اعتماد، وتسجيل الخادم قبل إتاحة QR أو رموز الاستعادة.</TooltipContent>
            </Tooltip>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <div className="flex items-start justify-between gap-3"><CardTitle className="flex items-center gap-2 text-base"><Mail className="h-5 w-5 text-cyan-700" aria-hidden="true" />استعادة كلمة المرور</CardTitle><ReadinessBadge state={state} /></div>
            <p className="text-sm leading-6 text-slate-500">مسار الاستعادة موجود خادمياً ويستخدم استجابات موحدة، أما الإرسال الفعلي فينتظر قناة بريد أو OTP مؤسسية.</p>
          </CardHeader>
          <CardContent className="space-y-3">
            <label className="block text-sm font-medium text-slate-700">عنوان قناة الاستعادة المؤسسية<input value={recoveryAddress} onChange={event => setRecoveryAddress(event.target.value)} placeholder="security@example.org" type="email" disabled={!emailConfigured} className="mt-2 h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm disabled:cursor-not-allowed disabled:bg-slate-100" aria-describedby="recovery-help" /></label>
            <p id="recovery-help" className="text-xs leading-5 text-slate-500">هذا الحقل لا يحفظ بريداً ولا يرسل رسالة حالياً؛ سيُفعّل بعد ضبط مزود مؤسسي موثق من مسؤول النظام.</p>
            <div className="flex flex-wrap items-center gap-2"><Tooltip><TooltipTrigger asChild><span className="inline-flex"><Button type="button" disabled={!emailConfigured || !recoveryAddress.trim()} className="cursor-not-allowed"><Mail className="ml-2 h-4 w-4" aria-hidden="true" />حفظ قناة الاستعادة</Button></span></TooltipTrigger><TooltipContent className="max-w-xs text-right leading-5">الإرسال متوقف حتى ربط قناة مؤسسية موثقة. لا يتم كشف توكنات الاستعادة للمتصفح.</TooltipContent></Tooltip></div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-slate-200 bg-slate-50 shadow-none"><CardContent className="p-4 text-xs leading-6 text-slate-600"><p className="font-semibold text-slate-800">متطلبات التفعيل لاحقاً</p><ul className="mt-2 list-disc space-y-1 pr-5"><li>اعتماد مزود البريد أو OTP وعنوان الإرسال وسياسة الاحتفاظ.</li><li>اختبار بيئة غير إنتاجية وقبول السجلات والتنبيهات ومحددات المعدل.</li><li>تفعيل 2FA من الخادم مع تدقيق التسجيل والإبطال وعدم تخزين الأسرار في المتصفح.</li></ul></CardContent></Card>
    </div>
  );
}
