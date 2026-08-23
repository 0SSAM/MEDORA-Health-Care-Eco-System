import { FormEvent, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/_core/hooks/useAuth";
import { startLogin } from "@/const";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { AlertCircle, ArrowLeft, CheckCircle2, KeyRound, Loader2, Mail, ShieldCheck, UserRound } from "lucide-react";
import { useLocation } from "wouter";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useLocalization } from "@/contexts/LocalizationContext";
import { MEDORA_LOGO_PRIMARY } from "@/lib/brand";
import { resetIdentityBoundClientState } from "@/lib/identitySessionBoundary";

function Notice({ error, success }: { error?: string; success?: string }) {
  if (!error && !success) return null;
  return (
    <div role="alert" aria-live="polite" className={`flex items-start gap-2 rounded-xl p-3 text-sm leading-6 ${error ? "bg-rose-50 text-rose-800" : "bg-emerald-50 text-emerald-800"}`}>
      {error ? <AlertCircle className="mt-1 h-4 w-4 shrink-0" aria-hidden="true" /> : <CheckCircle2 className="mt-1 h-4 w-4 shrink-0" aria-hidden="true" />}
      <span>{error || success}</span>
    </div>
  );
}

export default function Login() {
  const { user, loading, logout } = useAuth();
  const { direction } = useLocalization();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const resetToken = useMemo(() => new URLSearchParams(window.location.search).get("resetToken") || "", []);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [internalError, setInternalError] = useState("");
  const [recoveryOpen, setRecoveryOpen] = useState(Boolean(resetToken));
  const [recoveryUsername, setRecoveryUsername] = useState("");
  const [resetPassword, setResetPassword] = useState("");
  const [resetConfirm, setResetConfirm] = useState("");
  const [recoveryError, setRecoveryError] = useState("");
  const [recoverySuccess, setRecoverySuccess] = useState("");

  const internalLogin = trpc.auth.internalLogin.useMutation({
    onSuccess: async result => {
      if (!result.success) { setInternalError(result.message); return; }
      setInternalError("");
      // Employee account changes must never reuse the preceding user's cached
      // tenant-scoped records, errors, or short-lived authorization header.
      resetIdentityBoundClientState(queryClient);
      // Reload so every workspace query starts against the newly committed
      // server-backed session rather than an in-memory SPA state.
      window.location.assign("/workspace");
    },
    onError: error => setInternalError(error.data?.code === "TOO_MANY_REQUESTS" ? "تم إيقاف المحاولات مؤقتاً للحماية. انتظر قليلاً ثم حاول مرة أخرى." : "تعذر التحقق من البيانات حالياً. تأكد من الاتصال وحاول مرة أخرى."),
  });
  const requestReset = trpc.auth.requestPasswordReset.useMutation({
    onSuccess: result => { setRecoveryError(""); setRecoverySuccess(result.message); },
    onError: () => setRecoveryError("تعذر تنفيذ طلب الاستعادة حالياً. حاول مرة أخرى لاحقاً."),
  });
  const completeReset = trpc.auth.resetPassword.useMutation({
    onSuccess: result => {
      if (!result.success) { setRecoveryError(result.message); return; }
      setRecoveryError(""); setRecoverySuccess(result.message); setResetPassword(""); setResetConfirm("");
      window.history.replaceState({}, "", "/login");
    },
    onError: () => setRecoveryError("تعذر تحديث كلمة المرور. قد يكون الرابط منتهياً أو مستخدماً من قبل."),
  });

  const submitLogin = (event: FormEvent) => {
    event.preventDefault(); setInternalError("");
    if (username.trim().length < 3) { setInternalError("أدخل اسم مستخدم صحيحاً لا يقل عن 3 أحرف."); return; }
    if (!password) { setInternalError("أدخل كلمة المرور للمتابعة."); return; }
    internalLogin.mutate({ username, password });
  };
  const submitRecovery = (event: FormEvent) => {
    event.preventDefault(); setRecoveryError(""); setRecoverySuccess("");
    if (resetToken) {
      completeReset.mutate({ token: resetToken, password: resetPassword, confirmPassword: resetConfirm });
    } else if (recoveryUsername.trim().length < 3) {
      setRecoveryError("أدخل اسم المستخدم المسجل لدى مؤسستك.");
    } else {
      requestReset.mutate({ username: recoveryUsername });
    }
  };
  const recoveryPending = requestReset.isPending || completeReset.isPending;

  if (loading) return <main dir="rtl" className="grid min-h-screen place-items-center bg-[#f4f7fb] text-slate-600"><div className="flex items-center gap-3" role="status" aria-live="polite"><Loader2 className="h-6 w-6 animate-spin" aria-hidden="true" /> جارٍ التحقق من الجلسة…</div></main>;

  return (
    <main dir={direction} className="relative grid min-h-screen overflow-hidden bg-[#f4f7fb] px-5 py-8 text-slate-900 sm:px-8">
      <div className="absolute left-5 top-5 z-10 sm:left-8 sm:top-8"><LanguageSwitcher /></div>
      <div className="pointer-events-none absolute -left-24 top-12 h-72 w-72 rounded-full bg-cyan-200/40 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 bottom-0 h-96 w-96 rounded-full bg-teal-200/30 blur-3xl" />
      <section className="relative m-auto grid w-full max-w-5xl overflow-hidden rounded-[2rem] border border-white/80 bg-white/85 shadow-[0_30px_100px_rgba(13,27,42,0.14)] backdrop-blur-xl lg:grid-cols-[1.05fr_.95fr]" aria-labelledby="login-title">
        <div className="flex flex-col justify-between bg-[#0d1b2a] p-8 text-white sm:p-12">
          <div><img src={MEDORA_LOGO_PRIMARY} alt="MEDORA Health Care Eco System" className="h-20 w-auto max-w-[15rem] object-contain object-right shadow-lg shadow-cyan-950/30" /><p className="mt-7 text-sm font-semibold tracking-[0.16em] text-cyan-200">MEDORA HEALTH CARE ECO SYSTEM</p><h1 className="mt-4 text-3xl font-bold leading-tight sm:text-4xl">منظومة الرعاية الصحية المتكاملة الآمنة</h1><p className="mt-5 max-w-md text-sm leading-7 text-slate-300">دخول مؤسسي بصلاحيات مرتبطة بالفرع والجهة والاختصاص، مع سجل تدقيق للموظفين. لا تُرسل كلمات المرور إلى سجل التدقيق.</p></div>
          <div className="mt-12 grid gap-3 text-sm text-slate-300 sm:grid-cols-2"><div className="rounded-2xl border border-white/10 bg-white/5 p-4"><strong className="block text-white">حماية متعددة الطبقات</strong><span className="mt-1 block">جلسات، صلاحيات، وحظر محاولات متكررة.</span></div><div className="rounded-2xl border border-white/10 bg-white/5 p-4"><strong className="block text-white">استعادة آمنة</strong><span className="mt-1 block">روابط قصيرة العمر وتستخدم مرة واحدة.</span></div></div>
        </div>
        <div className="p-8 sm:p-12"><button type="button" onClick={() => setLocation("/")} className="mb-8 inline-flex items-center gap-2 text-sm text-slate-500 transition hover:text-slate-900"><ArrowLeft className="h-4 w-4" /> العودة للصفحة العامة</button><div className="max-w-md">
          <p className="text-sm font-semibold text-cyan-700">تسجيل دخول الموظفين</p><h2 id="login-title" className="mt-2 text-3xl font-bold tracking-tight">دخول آمن حسب الدور</h2><p className="mt-3 text-sm leading-6 text-slate-500">استخدم اسم المستخدم وكلمة المرور التي أنشأها مسؤول مؤسستك.</p>
          {user ? <div className="mt-8 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-900"><p className="font-semibold">أنت مسجل الدخول بالفعل</p><p className="mt-1 text-sm leading-6">الحساب: {user.name || "مستخدم مصادق"} · الدور: {user.role}</p><div className="mt-4 flex flex-wrap gap-2"><Button type="button" onClick={() => setLocation("/")} className="bg-[#0d1b2a] hover:bg-[#16324a]">فتح مساحة العمل</Button><Button type="button" variant="outline" onClick={() => void logout()} className="border-emerald-300 bg-white">تسجيل الخروج ثم دخول موظف</Button></div></div> : recoveryOpen ? <>
            <div className="mt-8 flex items-center gap-3 text-cyan-800"><KeyRound className="h-5 w-5" /><h3 className="text-xl font-bold">{resetToken ? "إعادة تعيين كلمة المرور" : "استعادة كلمة المرور"}</h3></div>
            <p className="mt-3 text-sm leading-6 text-slate-500">{resetToken ? "أنشئ كلمة مرور جديدة ثم سجّل الدخول من جديد." : "أدخل اسم المستخدم. ستظهر رسالة موحدة حفاظاً على خصوصية الحسابات."}</p>
            <form className="mt-6 space-y-4" onSubmit={submitRecovery}>
              {!resetToken && <div className="space-y-2"><Label htmlFor="recovery-username">اسم المستخدم</Label><Input id="recovery-username" autoComplete="username" value={recoveryUsername} onChange={e => setRecoveryUsername(e.target.value)} disabled={recoveryPending} /></div>}
              {resetToken && <><div className="space-y-2"><Label htmlFor="reset-password">كلمة المرور الجديدة</Label><Input id="reset-password" type="password" autoComplete="new-password" value={resetPassword} onChange={e => setResetPassword(e.target.value)} disabled={recoveryPending} /></div><div className="space-y-2"><Label htmlFor="reset-confirm">تأكيد كلمة المرور</Label><Input id="reset-confirm" type="password" autoComplete="new-password" value={resetConfirm} onChange={e => setResetConfirm(e.target.value)} disabled={recoveryPending} /></div></>}
              <Notice error={recoveryError} success={recoverySuccess} />
              <Button type="submit" disabled={recoveryPending} className="h-12 w-full bg-[#0d1b2a] hover:bg-[#16324a]">{recoveryPending ? <><Loader2 className="ml-2 h-4 w-4 animate-spin" aria-hidden="true" /> جارٍ التحقق…</> : <><Mail className="ml-2 h-4 w-4" /> {resetToken ? "حفظ كلمة المرور" : "إرسال طلب الاستعادة"}</>}</Button>
              <button type="button" onClick={() => { setRecoveryOpen(false); setRecoveryError(""); setRecoverySuccess(""); }} className="w-full text-sm text-slate-500 hover:text-slate-900">العودة إلى تسجيل الدخول</button>
            </form>
          </> : <>
            <form className="mt-8 space-y-4" onSubmit={submitLogin} noValidate><div className="space-y-2"><Label htmlFor="internal-username">اسم المستخدم</Label><Input id="internal-username" autoComplete="username" value={username} onChange={e => setUsername(e.target.value)} placeholder="مثال: cashier.branch1" disabled={internalLogin.isPending} aria-invalid={Boolean(internalError)} /></div><div className="space-y-2"><Label htmlFor="internal-password">كلمة المرور</Label><Input id="internal-password" type="password" autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)} disabled={internalLogin.isPending} aria-invalid={Boolean(internalError)} /></div><Notice error={internalError} /><Button type="submit" disabled={internalLogin.isPending} className="h-12 w-full bg-[#0d1b2a] text-base hover:bg-[#16324a]">{internalLogin.isPending ? <><Loader2 className="ml-2 h-4 w-4 animate-spin" aria-hidden="true" /> جارٍ التحقق من البيانات…</> : <><UserRound className="ml-2 h-4 w-4" /> دخول الموظفين</>}</Button></form>
            <button type="button" onClick={() => { setRecoveryOpen(true); setRecoveryError(""); setRecoverySuccess(""); }} className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-cyan-800 hover:text-cyan-950"><KeyRound className="h-4 w-4" /> نسيت كلمة المرور؟</button>
            <div className="my-7 flex items-center gap-3 text-xs text-slate-400"><span className="h-px flex-1 bg-slate-200" /><span>أو حساب الإدارة</span><span className="h-px flex-1 bg-slate-200" /></div><Button type="button" variant="outline" onClick={() => startLogin()} className="h-12 w-full border-cyan-200 bg-white text-cyan-900 hover:bg-cyan-50">المتابعة إلى دخول الإدارة الآمن</Button>
          </>}
        </div></div>
      </section>
    </main>
  );
}
