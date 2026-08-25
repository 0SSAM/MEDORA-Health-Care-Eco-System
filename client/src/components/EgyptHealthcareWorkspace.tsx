// MEDORA | ميدورا — Integrated Health Care System
// Copyright (c) 2026 Hossam Naeim Osman | حسام نعيم عثمان. All rights reserved.
// Proprietary and confidential. Unauthorized copying, distribution, or use of this
// software, or of any portion of it, is strictly prohibited.
// Source: https://github.com/0SSAM/MEDORA-Health-Care-Eco-System
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";

type Scope = { organizationId: number; branchId: number; jurisdictionId: number };

function CountCard({ title, value, detail }: { title: string; value: number | string; detail: string }) {
  return <Card><CardHeader><CardTitle className="text-sm">{title}</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold">{value}</p><p className="mt-1 text-xs text-slate-500">{detail}</p></CardContent></Card>;
}

export function EgyptHealthcareWorkspace({ organizationId, branchId, jurisdictionId }: { organizationId: number | null; branchId: number | null; jurisdictionId: number | null }) {
  const enabled = Boolean(organizationId && branchId && jurisdictionId);
  const scope: Scope = { organizationId: organizationId ?? 0, branchId: branchId ?? 0, jurisdictionId: jurisdictionId ?? 0 };
  const facilities = trpc.egyptHealthcare.facilities.useQuery(scope, { enabled });
  const encounters = trpc.egyptHealthcare.encounters.useQuery(scope, { enabled });
  const claims = trpc.egyptHealthcare.claims.useQuery(scope, { enabled });
  const beds = trpc.egyptHealthcare.beds.useQuery(scope, { enabled });
  const admissions = trpc.egyptHealthcare.admissions.useQuery(scope, { enabled });
  const clinicalOrders = trpc.egyptHealthcare.clinicalOrders.useQuery(scope, { enabled });
  const payerContracts = trpc.egyptHealthcare.payerContracts.useQuery({ organizationId: scope.organizationId, jurisdictionId: scope.jurisdictionId }, { enabled });
  const preauthorizations = trpc.egyptHealthcare.preauthorizations.useQuery(scope, { enabled });
  const remittances = trpc.egyptHealthcare.remittances.useQuery(scope, { enabled });
  const appeals = trpc.egyptHealthcare.appeals.useQuery(scope, { enabled });
  const billingAccounts = trpc.egyptHealthcare.billingAccounts.useQuery(scope, { enabled });
  const gaharProfiles = trpc.egyptHealthcare.gaharProfiles.useQuery(scope, { enabled });
  const activeProfileId = gaharProfiles.data?.[0]?.id ?? 0;
  const gaharCriteria = trpc.egyptHealthcare.gaharCriteria.useQuery({ ...scope, profileId: activeProfileId }, { enabled: enabled && activeProfileId > 0 });
  const gaharEvidence = trpc.egyptHealthcare.gaharEvidence.useQuery({ ...scope, profileId: activeProfileId }, { enabled: enabled && activeProfileId > 0 });
  const gaharIndicators = trpc.egyptHealthcare.gaharQualityIndicators.useQuery({ ...scope, profileId: activeProfileId }, { enabled: enabled && activeProfileId > 0 });
  const queries = [facilities, encounters, claims, beds, admissions, clinicalOrders, payerContracts, preauthorizations, remittances, appeals, billingAccounts, gaharProfiles, gaharCriteria, gaharEvidence, gaharIndicators];

  if (!enabled) return <Card><CardContent className="p-6 text-sm text-amber-800">يلزم اختيار مؤسسة وفرع واختصاص مصر قبل قراءة بيانات المستشفى أو التأمين.</CardContent></Card>;
  const blocked = queries.find(query => query.error);
  if (blocked) return <Card><CardContent className="p-6 text-sm text-rose-700">تعذر تحميل المساحة المصرية ضمن النطاق الحالي. لم يتم عرض أي بيانات خارج النطاق أو بيانات تجريبية.</CardContent></Card>;
  const loading = queries.some(query => query.isLoading);

  return <div className="space-y-4" dir="rtl">
    <div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-lg font-bold text-slate-900">الحزمة المصرية للمستشفيات والتأمين</h2><p className="text-sm text-slate-500">مسارات داخلية للمرافق الحكومية والخاصة والتأمين؛ الربط الخارجي يظل متوقفاً حتى اعتماد الجهة الرسمية.</p></div><Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">الربط الرسمي: متوقف بأمان</Badge></div>
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <CountCard title="المرافق" value={loading ? "…" : facilities.data?.length ?? 0} detail="حكومية وخاصة داخل النطاق" />
      <CountCard title="المقابلات" value={loading ? "…" : encounters.data?.length ?? 0} detail="رعاية أولية وطوارئ وتنويم وإحالات" />
      <CountCard title="الأسرة والتنويم" value={loading ? "…" : `${beds.data?.length ?? 0} / ${admissions.data?.length ?? 0}`} detail="أسرة / حالات تنويم" />
      <CountCard title="الأوامر السريرية" value={loading ? "…" : clinicalOrders.data?.length ?? 0} detail="مختبر وأشعة وأدوية وإجراءات" />
      <CountCard title="المطالبات" value={loading ? "…" : claims.data?.length ?? 0} detail="تظل محكومة بحالة الاعتماد" />
      <CountCard title="التفويضات" value={loading ? "…" : preauthorizations.data?.length ?? 0} detail="تفويضات داخلية قابلة للتدقيق" />
      <CountCard title="عقود الجهات الدافعة" value={loading ? "…" : payerContracts.data?.length ?? 0} detail="لا تفعيل خارجي تلقائي" />
      <CountCard title="التسويات والتظلمات" value={loading ? "…" : `${remittances.data?.length ?? 0} / ${appeals.data?.length ?? 0}`} detail="تسويات / تظلمات" />
      <CountCard title="حسابات الفوترة" value={loading ? "…" : billingAccounts.data?.length ?? 0} detail="باقات ودفعات واعتماد داخلي" />
      <CountCard title="ملفات GAHAR" value={loading ? "…" : gaharProfiles.data?.length ?? 0} detail="تقييم ذاتي داخلي فقط" />
      <CountCard title="المعايير والأدلة" value={loading ? "…" : `${gaharCriteria.data?.length ?? 0} / ${gaharEvidence.data?.length ?? 0}`} detail="معايير / أدلة موثقة داخلياً" />
      <CountCard title="مؤشرات الجودة" value={loading ? "…" : gaharIndicators.data?.length ?? 0} detail="مصادر داخلية قابلة للمراجعة" />
    </div>
    <Card className="border-amber-200 bg-amber-50/50"><CardHeader><CardTitle className="text-sm">جاهزية GAHAR الداخلية</CardTitle></CardHeader><CardContent className="space-y-3 text-sm"><p className="text-slate-700">تساعد هذه المساحة على التقييم الذاتي، إدارة الأدلة، الإجراءات التصحيحية ومؤشرات الجودة وفق مصدر GAHAR الرسمي. لا تمثل النتائج اعتماداً رسمياً ولا ترسل بيانات إلى GAHAR.</p>{gaharProfiles.data?.length ? <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">{gaharProfiles.data.slice(0, 6).map(profile => <div key={profile.id} className="rounded-xl border border-amber-200 bg-white p-3"><div className="flex items-center justify-between gap-2"><p className="font-medium">{profile.standardFamily}</p><Badge variant="outline">{profile.status}</Badge></div><p className="mt-1 text-xs text-slate-500">{profile.facilityType} · الإصدار {profile.standardVersion}</p><p className="mt-1 text-xs text-amber-700">بوابة التقديم: {profile.officialSubmissionGate === "not_authorized" ? "غير مخولة" : profile.officialSubmissionGate}</p></div>)}</div> : <p className="text-slate-500">لا يوجد ملف جاهزية GAHAR داخل النطاق الحالي.</p>}<div className="flex flex-wrap gap-2 text-xs text-slate-600"><span>المعايير: {gaharCriteria.data?.length ?? 0}</span><span>الأدلة: {gaharEvidence.data?.length ?? 0}</span><span>المؤشرات: {gaharIndicators.data?.length ?? 0}</span></div></CardContent></Card>
    <Card><CardHeader><CardTitle className="text-sm">حالة التشغيل الداخلي</CardTitle></CardHeader><CardContent className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
      {[...(facilities.data ?? []).map(item => ({ label: item.facilityType, detail: `ترخيص: ${item.licensingStatus} · اعتماد: ${item.accreditationStatus}` })), ...(billingAccounts.data ?? []).slice(0, 4).map(item => ({ label: `فوترة #${item.id} · ${item.payerType}`, detail: `الباقة: ${item.packageCode ?? "غير محددة"} · الحالة: ${item.status}` })), ...(admissions.data ?? []).slice(0, 4).map(item => ({ label: `تنويم #${item.id}`, detail: `الحالة: ${item.status} · النوع: ${item.admissionType}` })), ...(clinicalOrders.data ?? []).slice(0, 4).map(item => ({ label: `${item.orderType} · ${item.serviceCode}`, detail: `حالة الأمر: ${item.status}` }))].map((item, index) => <div key={`${item.label}-${index}`} className="rounded-xl border border-slate-100 p-3 text-sm"><p className="font-medium">{item.label}</p><p className="mt-1 text-xs text-slate-500">{item.detail}</p></div>)}
      {!facilities.data?.length && !admissions.data?.length && !clinicalOrders.data?.length && <p className="text-sm text-slate-500">لا توجد سجلات داخلية في هذا النطاق.</p>}
    </CardContent></Card>
  </div>;
}
