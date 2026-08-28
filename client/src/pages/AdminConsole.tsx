import { useEffect, useState } from "react";
import { Building2, ChevronLeft, ShieldCheck } from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { startLogin } from "@/const";
import { trpc } from "@/lib/trpc";
import { useLocalization } from "@/contexts/LocalizationContext";
import { EmployeeAdministrationWorkspace } from "@/components/EmployeeAdministrationWorkspace";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type OrganizationOption = { id: number; displayName: string; organizationType: string; organizationRole?: string };

export default function AdminConsole() {
  const { user, loading } = useAuth();
  const { language, direction } = useLocalization();
  const t = (arabic: string, english: string) => language === "ar" ? arabic : english;
  const organizations = trpc.organizations.mine.useQuery(undefined, { enabled: Boolean(user), retry: false });
  const [organizationId, setOrganizationId] = useState<number | null>(null);
  const organizationOptions = (organizations.data ?? []) as OrganizationOption[];

  useEffect(() => {
    if (organizationId || organizationOptions.length === 0) return;
    setOrganizationId(organizationOptions[0].id);
  }, [organizationId, organizationOptions]);

  if (loading) return <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6 text-sm text-slate-600">{t("جارٍ تحميل لوحة الإدارة…", "Loading the Admin Console…")}</main>;
  if (!user) return <main dir={direction} className="flex min-h-screen items-center justify-center bg-slate-50 px-6"><Card className="w-full max-w-md"><CardContent className="space-y-5 p-7 text-center"><ShieldCheck className="mx-auto h-10 w-10 text-slate-800" /><h1 className="text-xl font-semibold text-slate-900">{t("تتطلب لوحة الإدارة تسجيل الدخول", "The Admin Console requires sign-in")}</h1><p className="text-sm leading-6 text-slate-600">{t("تظهر بيانات الموظفين ومصفوفة الامتيازات بعد التحقق من الهوية والنطاق التنظيمي.", "Employee data and the privilege matrix appear only after identity and organization scope are verified.")}</p><Button className="w-full bg-slate-900" onClick={startLogin}>{t("تسجيل الدخول", "Sign in")}</Button></CardContent></Card></main>;

  return <main dir={direction} className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8"><div className="mx-auto max-w-6xl space-y-6"><div className="flex flex-wrap items-center justify-between gap-4"><div className="flex items-start gap-3"><div className="rounded-2xl bg-slate-900 p-3 text-white"><ShieldCheck className="h-7 w-7" /></div><div><p className="text-sm font-medium text-slate-500">MEDORA</p><h1 className="text-2xl font-semibold tracking-tight text-slate-950">{t("لوحة الإدارة", "Admin Console")}</h1><p className="mt-1 text-sm text-slate-600">{t("إدارة موظفين مقيدة بالمؤسسة مع عرض امتيازات قابل للمراجعة.", "Organization-scoped employee administration with an auditable privilege view.")}</p></div></div><Button variant="outline" asChild className="gap-2"><Link href="/workspace">{t("العودة إلى مساحة العمل", "Back to workspace")}<ChevronLeft className="h-4 w-4 rtl:rotate-180" /></Link></Button></div>
    <Card className="border-slate-200 shadow-sm"><CardContent className="flex flex-wrap items-center gap-4 p-4"><div className="rounded-xl bg-slate-100 p-2 text-slate-700"><Building2 className="h-5 w-5" /></div><label className="grid min-w-[min(100%,20rem)] flex-1 gap-1.5 text-sm font-medium text-slate-800"><span>{t("المؤسسة", "Organization")}</span><select value={organizationId ?? ""} onChange={event => setOrganizationId(event.target.value ? Number(event.target.value) : null)} className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm" disabled={organizations.isLoading || organizationOptions.length === 0}><option value="">{organizations.isLoading ? t("جارٍ تحميل المؤسسات…", "Loading organizations…") : t("اختر مؤسسة", "Select an organization")}</option>{organizationOptions.map(organization => <option key={organization.id} value={organization.id}>{organization.displayName}</option>)}</select></label>{organizations.isError && <p className="w-full text-sm text-rose-700">{t("تعذر تحميل المؤسسات المتاحة لهذه الهوية.", "Available organizations could not be loaded for this identity.")}</p>}</CardContent></Card>
    <EmployeeAdministrationWorkspace organizationId={organizationId} />
  </div></main>;
}
