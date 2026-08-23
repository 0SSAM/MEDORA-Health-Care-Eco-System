import { useAuth } from "@/_core/hooks/useAuth";
import { useLocalization } from "@/contexts/LocalizationContext";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, LockKeyhole, ShieldCheck } from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";

function getSurface() {
  const agent = navigator.userAgent.toLowerCase();
  if (agent.includes("medora-desktop")) return "desktop_wrapper" as const;
  if (agent.includes("wv") || agent.includes("webview")) return "mobile_webview" as const;
  return "web" as const;
}

export function NdaAccessGate({ children }: { children: ReactNode }) {
  const { user, loading, logout } = useAuth();
  const { language, direction } = useLocalization();
  const [confirmed, setConfirmed] = useState(false);
  const status = trpc.nda.status.useQuery(undefined, { enabled: Boolean(user), retry: false, refetchOnWindowFocus: false });
  const accept = trpc.nda.accept.useMutation({ onSuccess: () => status.refetch() });
  const isEnglish = language === "en";
  const documentText = useMemo(() => status.data?.document.text[isEnglish ? "en" : "ar"] ?? "", [isEnglish, status.data]);

  if (loading || (user && status.isLoading)) {
    return <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-100"><Loader2 className="h-7 w-7 animate-spin" /></div>;
  }
  if (!user || status.data?.accepted) return <>{children}</>;

  const decline = async () => {
    await logout();
    window.location.assign("/login");
  };
  const submit = () => {
    if (!confirmed || !status.data) return;
    accept.mutate({ version: status.data.document.version, hash: status.data.document.hash, locale: isEnglish ? "en" : "ar", surface: getSurface(), confirmed: true });
  };

  return <main dir={direction} className="flex min-h-screen w-full min-w-0 max-w-full items-center justify-center overflow-x-hidden bg-[radial-gradient(circle_at_top,_#164e63,_#020617_55%)] p-3 sm:p-8">
    <Card className="w-full min-w-0 max-w-3xl overflow-hidden border-cyan-300/30 bg-slate-950/95 text-slate-100 shadow-2xl shadow-cyan-950/40">
      <CardHeader className="min-w-0 space-y-3 border-b border-slate-800 p-5 sm:p-6">
        <div className="flex items-center gap-3 text-cyan-300"><ShieldCheck className="h-7 w-7" /><span className="font-semibold tracking-[0.2em]">MEDORA</span></div>
        <CardTitle className="break-words text-xl text-white">{isEnglish ? "Non-Disclosure Agreement Required" : "اتفاقية عدم الإفصاح مطلوبة"}</CardTitle>
        <p className="break-words text-sm leading-6 text-slate-300">{isEnglish ? "No workspace data or actions are available until you explicitly accept the current agreement." : "لا تتاح بيانات أو إجراءات مساحة العمل قبل الموافقة الصريحة على الاتفاقية الحالية."}</p>
      </CardHeader>
      <CardContent className="min-w-0 space-y-5 p-4 sm:p-7">
        <section className="max-h-72 overflow-y-auto break-words rounded-xl border border-slate-700 bg-slate-900/70 p-4 text-sm leading-7 text-slate-200 whitespace-pre-line [overflow-wrap:anywhere]">{documentText}</section>
        <label className="flex min-w-0 cursor-pointer items-start gap-3 rounded-xl border border-cyan-300/25 bg-cyan-950/20 p-4 text-sm leading-6 text-slate-100">
          <Checkbox className="shrink-0" checked={confirmed} onCheckedChange={value => setConfirmed(value === true)} aria-label={isEnglish ? "Confirm NDA acceptance" : "تأكيد قبول اتفاقية عدم الإفصاح"} />
          <span className="min-w-0 break-words">{isEnglish ? "I have read and explicitly agree to this version of the MEDORA Non-Disclosure and Use Agreement." : "قرأت وأوافق صراحةً على هذه النسخة من اتفاقية عدم الإفصاح واستخدام MEDORA."}</span>
        </label>
        {accept.error ? <p role="alert" className="text-sm text-rose-300">{isEnglish ? "Acceptance could not be recorded. No access has been granted." : "تعذر تسجيل الموافقة. لم يتم منح أي وصول."}</p> : null}
        <div className="flex min-w-0 flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button type="button" variant="outline" onClick={decline} disabled={accept.isPending} className="w-full whitespace-normal border-slate-600 bg-transparent text-slate-100 hover:bg-slate-800 sm:w-auto"><LockKeyhole className="me-2 h-4 w-4 shrink-0" />{isEnglish ? "Decline and sign out" : "رفض وتسجيل الخروج"}</Button>
          <Button type="button" onClick={submit} disabled={!confirmed || accept.isPending} className="w-full whitespace-normal bg-cyan-500 text-slate-950 hover:bg-cyan-400 sm:w-auto">{accept.isPending ? (isEnglish ? "Recording…" : "جارٍ التسجيل…") : (isEnglish ? "Accept and continue" : "أوافق وأتابع")}</Button>
        </div>
      </CardContent>
    </Card>
  </main>;
}
