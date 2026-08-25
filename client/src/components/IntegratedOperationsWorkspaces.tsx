// MEDORA | ميدورا — Integrated Health Care System
// Copyright (c) 2026 Hossam Naeim Osman | حسام نعيم عثمان. All rights reserved.
// Proprietary and confidential. Unauthorized copying, distribution, or use of this
// software, or of any portion of it, is strictly prohibited.
// Source: https://github.com/0SSAM/MEDORA-Health-Care-Eco-System
import { useState } from "react";
import { skipToken } from "@tanstack/react-query";
import { trpc } from "@/lib/trpc";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PhoneCall, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";

type ScopeProps = { organizationId: number | null; jurisdictionId: number | null; branchId?: number | null };

function ScopeNotice({ organizationId, jurisdictionId }: ScopeProps) {
  if (organizationId && jurisdictionId) return null;
  return <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">لا يمكن تشغيل هذه الوحدة قبل اختيار مؤسسة وفرع مرتبط باختصاص مؤكد. لن يتم استخدام نطاق افتراضي.</div>;
}

export function InsuranceWorkspace({ organizationId, jurisdictionId }: ScopeProps) {
  const enabled = Boolean(organizationId && jurisdictionId);
  const [requestType, setRequestType] = useState<"ELIGIBILITY" | "PREAUTHORIZATION">("ELIGIBILITY");
  const [payerCode, setPayerCode] = useState("");
  const [memberReference, setMemberReference] = useState("");
  const [serviceCode, setServiceCode] = useState("");
  const [status, setStatus] = useState("");
  const requests = trpc.insurance.list.useQuery(enabled ? { organizationId: organizationId!, jurisdictionId: jurisdictionId! } : skipToken, { retry: false });
  const create = trpc.insurance.create.useMutation({ onSuccess: async result => { setStatus(`تم حفظ المسودة #${result.requestId}. الإرسال الشبكي معطل حتى اعتماد الموصل الرسمي.`); setMemberReference(""); await requests.refetch(); } });
  const submit = async () => {
    if (!enabled) return setStatus("النطاق المؤكد مطلوب.");
    if (!payerCode.trim() || !memberReference.trim() || !serviceCode.trim()) return setStatus("أكمل رمز الجهة ورقم العضوية ورمز الخدمة.");
    try { await create.mutateAsync({ organizationId: organizationId!, jurisdictionId: jurisdictionId!, requestType, payerCode: payerCode.trim().toUpperCase(), memberReference, serviceCode, idempotencyKey: `medora-${Date.now()}-${Math.random().toString(36).slice(2, 10)}` }); } catch (error) { setStatus(error instanceof Error ? error.message : "تعذر حفظ طلب التأمين"); }
  };
  return <Card className="overflow-hidden border-0 bg-white shadow-sm"><CardHeader><CardTitle>التأمين والمطالبات</CardTitle><p className="text-sm text-slate-500">مسودة مطالبة قابلة للتدقيق؛ لا يوجد إرسال إلى شركة تأمين دون اعتماد موصل وبيانات رسمية.</p></CardHeader><CardContent className="space-y-4"><ScopeNotice organizationId={organizationId} jurisdictionId={jurisdictionId} /><div className="grid gap-2 md:grid-cols-4"><select value={requestType} onChange={e => setRequestType(e.target.value as typeof requestType)} className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm"><option value="ELIGIBILITY">تحقق أهلية</option><option value="PREAUTHORIZATION">موافقة مسبقة</option></select><Input value={payerCode} onChange={e => setPayerCode(e.target.value)} placeholder="رمز الجهة الدافعة" aria-label="رمز الجهة الدافعة" /><Input value={memberReference} onChange={e => setMemberReference(e.target.value)} placeholder="مرجع العضو" aria-label="مرجع العضو" /><Input value={serviceCode} onChange={e => setServiceCode(e.target.value)} placeholder="رمز الخدمة" aria-label="رمز الخدمة" /></div><Button onClick={submit} disabled={!enabled || create.isPending} className="bg-[#0d1b2a]">{create.isPending ? "جارٍ الحفظ…" : "حفظ مسودة مطالبة"}</Button>{status && <Badge variant="outline">{status}</Badge>}{requests.isError ? <p className="rounded-xl bg-rose-50 p-3 text-sm text-rose-700">تعذر تحميل المطالبات؛ بقيت الوحدة محجوبة حتى التحقق من نطاق الامتثال.</p> : <div className="space-y-2">{requests.data?.length ? requests.data.map(request => <div key={request.id} className="flex items-center justify-between rounded-xl border border-slate-200 p-3 text-sm"><div><p className="font-medium">{request.requestType} · {request.payerCode}</p><p className="text-xs text-slate-500">{request.serviceCode} · {request.credentialGate}</p></div><Badge variant="secondary">{request.status}</Badge></div>) : <p className="rounded-xl border border-dashed border-slate-300 p-5 text-center text-sm text-slate-500">لا توجد مطالبات فعلية في النطاق الحالي.</p>}</div>}</CardContent></Card>;
}

export function PromotionsWorkspace({ organizationId, jurisdictionId, branchId }: ScopeProps) {
  const enabled = Boolean(organizationId && jurisdictionId);
  const [code, setCode] = useState(""); const [name, setName] = useState(""); const [discountValue, setDiscountValue] = useState("0"); const [startsAt, setStartsAt] = useState(""); const [endsAt, setEndsAt] = useState(""); const [status, setStatus] = useState("");
  const promotions = trpc.promotions.list.useQuery(enabled ? { organizationId: organizationId!, jurisdictionId: jurisdictionId! } : skipToken, { retry: false });
  const create = trpc.promotions.create.useMutation({ onSuccess: async result => { setStatus(`تم حفظ العرض #${result.promotionId} كمسودة بانتظار الاعتماد.`); await promotions.refetch(); } });
  const approve = trpc.promotions.approve.useMutation({ onSuccess: async result => { setStatus(`تم اعتماد العرض #${result.promotionId}.`); await promotions.refetch(); } });
  const submit = async () => { if (!enabled) return setStatus("النطاق المؤكد مطلوب."); if (!code.trim() || !name.trim() || !startsAt || !endsAt) return setStatus("أكمل بيانات العرض والتاريخين."); try { await create.mutateAsync({ organizationId: organizationId!, jurisdictionId: jurisdictionId!, branchId: branchId ?? undefined, code: code.trim().toUpperCase(), name: name.trim(), discountType: "percent", discountValue: Number(discountValue), startsAt: new Date(startsAt), endsAt: new Date(endsAt) }); } catch (error) { setStatus(error instanceof Error ? error.message : "تعذر حفظ العرض"); } };
  return <Card className="overflow-hidden border-0 bg-white shadow-sm"><CardHeader><CardTitle>العروض الترويجية</CardTitle><p className="text-sm text-slate-500">كل عرض يبدأ كمسودة؛ الحد القانوني للخصم النسبي يطبقه الخادم ولا يمكن تجاوزه من الواجهة.</p></CardHeader><CardContent className="space-y-4"><ScopeNotice organizationId={organizationId} jurisdictionId={jurisdictionId} /><div className="grid gap-2 md:grid-cols-5"><Input value={code} onChange={e => setCode(e.target.value)} placeholder="كود العرض" aria-label="كود العرض" /><Input value={name} onChange={e => setName(e.target.value)} placeholder="اسم العرض" aria-label="اسم العرض" /><Input type="number" min="0" max="7" step="0.01" value={discountValue} onChange={e => setDiscountValue(e.target.value)} placeholder="الخصم %" aria-label="نسبة الخصم" /><Input type="datetime-local" value={startsAt} onChange={e => setStartsAt(e.target.value)} aria-label="بداية العرض" /><Input type="datetime-local" value={endsAt} onChange={e => setEndsAt(e.target.value)} aria-label="نهاية العرض" /></div><Button onClick={submit} disabled={!enabled || create.isPending} className="bg-[#0d1b2a]">{create.isPending ? "جارٍ الحفظ…" : "حفظ كمسودة"}</Button>{status && <Badge variant="outline">{status}</Badge>}{promotions.isError ? <p className="rounded-xl bg-rose-50 p-3 text-sm text-rose-700">تعذر تحميل العروض؛ تحقق من دور مدير المؤسسة والنطاق التنظيمي.</p> : <div className="space-y-2">{promotions.data?.length ? promotions.data.map(promotion => <div key={promotion.id} className="flex items-center justify-between rounded-xl border border-slate-200 p-3 text-sm"><div><p className="font-medium">{promotion.code} · {promotion.name}</p><p className="text-xs text-slate-500">{promotion.discountValue}% · {new Date(promotion.startsAt).toLocaleDateString()}</p></div><div className="flex items-center gap-2"><Badge variant="secondary">{promotion.status}</Badge>{promotion.status === "draft" && <Button size="sm" onClick={() => approve.mutate({ promotionId: promotion.id })} disabled={approve.isPending}>اعتماد</Button>}</div></div>) : <p className="rounded-xl border border-dashed border-slate-300 p-5 text-center text-sm text-slate-500">لا توجد عروض فعلية في النطاق الحالي.</p>}</div>}</CardContent></Card>;
}

export function ReportsWorkspace({ organizationId, jurisdictionId, section }: ScopeProps & { section?: "financial" | "compliance" | "operations" }) {
  const enabled = Boolean(organizationId);
  const [reportKey, setReportKey] = useState("sales.daily"); const [name, setName] = useState(""); const [status, setStatus] = useState("");
  const catalog = trpc.reports.catalog.useQuery(undefined, { retry: false });
  const automation = trpc.reports.automationStatus.useQuery(undefined, { retry: false });
  const definitions = trpc.reports.definitions.useQuery(enabled ? { organizationId: organizationId!, jurisdictionId: jurisdictionId ?? undefined } : skipToken, { retry: false });
  const runs = trpc.reports.runs.useQuery(enabled ? { organizationId: organizationId! } : skipToken, { retry: false });
  const create = trpc.reports.createDefinition.useMutation({ onSuccess: async result => { setStatus(`تم إنشاء تعريف التقرير #${result.definitionId} كمسودة. التسليم التلقائي معطل حتى الجدولة الصريحة.`); await definitions.refetch(); } });
  const schedule = trpc.reports.schedule.useMutation({ onSuccess: async result => { setStatus(result.status === "scheduled" ? "تمت جدولة التقرير عبر خدمة الجدولة." : "التقرير مجدول مسبقاً."); await definitions.refetch(); } });
  const submit = async () => { if (!organizationId || !jurisdictionId) return setStatus("المؤسسة والاختصاص المؤكد مطلوبان."); try { await create.mutateAsync({ organizationId, jurisdictionId, reportKey: reportKey as "inventory.alerts" | "sales.daily" | "compliance.expiry" | "operations.summary", name: name.trim() || undefined, recipientRole: "operations_manager" }); } catch (error) { setStatus(error instanceof Error ? error.message : "تعذر إنشاء تعريف التقرير"); } };
  
  const filteredCatalog = catalog.data?.filter(item => {
    if (!section) return true;
    if (section === "financial") return item.key.includes("sales") || item.key.includes("operations");
    if (section === "compliance") return item.key.includes("compliance") || item.key.includes("expiry");
    return true;
  }) ?? [];

  return (
    <Card className="overflow-hidden border-0 bg-white shadow-sm">
      <CardHeader>
        <CardTitle>{section === "financial" ? "التقارير المالية" : "التقارير والجدولة"}</CardTitle>
        <p className="text-sm text-slate-500">
          {section === "financial" ? "تحليل الأداء المالي والمبيعات والتدفقات." : "تعريفات التقارير ونشاطها ضمن المؤسسة والاختصاص فقط."}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <ScopeNotice organizationId={organizationId} jurisdictionId={jurisdictionId} />
        {automation.data?.enabled === false && <p className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm leading-6 text-amber-900">الجدولة معطلة في هذه البيئة إلى أن يعتمد مسؤول الإنتاج النشر ويُفعِّلها صراحةً. ما زال بإمكانك إنشاء تعريفات تقارير كمسودات آمنة.</p>}
        <div className="grid gap-2 md:grid-cols-3">
          <select value={reportKey} onChange={e => setReportKey(e.target.value)} className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm" aria-label="نوع التقرير">
            {filteredCatalog.length > 0 ? filteredCatalog.map(item => <option key={item.key} value={item.key}>{item.name}</option>) : <option value="sales.daily">المبيعات اليومية</option>}
          </select>
          <Input value={name} onChange={e => setName(e.target.value)} placeholder="اسم اختياري للتقرير" aria-label="اسم التقرير" />
          <Button onClick={submit} disabled={!organizationId || !jurisdictionId || create.isPending} className="bg-[#0d1b2a]">{create.isPending ? "جارٍ الإنشاء…" : "إنشاء تعريف مسودة"}</Button>
        </div>
        {status && <Badge variant="outline">{status}</Badge>}
        <div className="space-y-2">
          <p className="text-sm font-semibold">التعريفات الحالية</p>
          {definitions.isError ? <p className="rounded-xl bg-rose-50 p-3 text-sm text-rose-700">تعذر تحميل التقارير؛ بقيت الجدولة محجوبة.</p> : definitions.data?.length ? definitions.data.filter(d => !section || filteredCatalog.some(c => c.key === d.reportKey)).map(definition => <div key={definition.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 p-3 text-sm"><div><p className="font-medium">{definition.name}</p><p className="text-xs text-slate-500">{definition.reportKey} · {definition.status}</p></div><div className="flex items-center gap-2"><Badge variant="secondary">{definition.status}</Badge>{definition.status === "draft" && <Button size="sm" onClick={() => schedule.mutate({ definitionId: definition.id, cronExpression: "0 8 * * * *" })} disabled={schedule.isPending || !definition.jurisdictionId || automation.data?.enabled !== true}>جدولة يومية</Button>}</div></div>) : <p className="rounded-xl border border-dashed border-slate-300 p-5 text-center text-sm text-slate-500">لا توجد تعريفات تقارير فعلية.</p>}
        </div>
        <div>
          <p className="mb-2 text-sm font-semibold">آخر عمليات التشغيل</p>
          {runs.isError ? <p className="text-sm text-slate-500">لا يمكن عرض سجل التشغيل حالياً.</p> : runs.data?.length ? <div className="space-y-2">{runs.data.slice(0, 5).map(run => <div key={run.id} className="flex justify-between rounded-xl border border-slate-200 p-3 text-xs"><span>تعريف #{run.definitionId} · {run.status}</span><span>{new Date(run.createdAt).toLocaleString()}</span></div>)}</div> : <p className="text-sm text-slate-500">لا توجد عمليات تشغيل مسجلة.</p>}
        </div>
      </CardContent>
    </Card>
  );
}


export function OrganizationWorkspace({ organizationId }: { organizationId: number | null }) {
  const enabled = Boolean(organizationId);
  const [status, setStatus] = useState("");
  const [form, setForm] = useState({ name: "", email: "", username: "", password: "", branchId: "", jurisdictionId: "", organizationRole: "staff" });
  const [resetFor, setResetFor] = useState<number | null>(null);
  const [resetPassword, setResetPassword] = useState("");
  const members = trpc.organizations.employeeDirectory.useQuery(enabled ? { organizationId: organizationId! } : skipToken, { retry: false });
  const branches = trpc.organizations.branches.useQuery(enabled ? { organizationId: organizationId! } : skipToken, { retry: false });
  const manager = trpc.organizations.assertManager.useQuery(enabled ? { organizationId: organizationId! } : skipToken, { retry: false });
  const createEmployee = trpc.organizations.createEmployee.useMutation({ onSuccess: async () => { setStatus("تم إنشاء حساب الموظف وتسجيل العملية في سجل التدقيق."); setForm({ name: "", email: "", username: "", password: "", branchId: "", jurisdictionId: "", organizationRole: "staff" }); await members.refetch(); } });
  const updateEmployee = trpc.organizations.updateEmployee.useMutation({ onSuccess: async () => { setStatus("تم تحديث الصلاحيات والحالة والنطاق."); await members.refetch(); } });
  const resetEmployeePassword = trpc.organizations.resetEmployeePassword.useMutation({ onSuccess: async () => { setStatus("تم تدوير كلمة المرور وإبطال الجلسات السابقة."); setResetFor(null); setResetPassword(""); await members.refetch(); } });
  const branchOptions = branches.data ?? [];
  const selectedBranch = branchOptions.find(branch => String(branch.id) === form.branchId);
  const submit = async () => {
    if (!organizationId || !form.name.trim() || !form.username.trim() || !form.password || !form.branchId || !form.jurisdictionId) return setStatus("أكمل الاسم واسم المستخدم وكلمة المرور والفرع والاختصاص.");
    try { await createEmployee.mutateAsync({ organizationId, branchId: Number(form.branchId), jurisdictionId: Number(form.jurisdictionId), organizationRole: form.organizationRole as "staff" | "operations_manager" | "clinical_lead" | "compliance_officer" | "auditor" | "org_admin", name: form.name.trim(), email: form.email.trim() || undefined, username: form.username, password: form.password }); } catch (error) { setStatus(error instanceof Error ? error.message : "تعذر إنشاء الحساب"); }
  };
  const toggle = async (member: any) => { if (!organizationId) return; const branch = branchOptions.find(option => option.id === member.branchId); if (!branch) return setStatus("تعذر تحديد نطاق الموظف الحالي."); try { await updateEmployee.mutateAsync({ organizationId, userId: member.userId, branchId: member.branchId, jurisdictionId: branch.jurisdictionId, organizationRole: member.organizationRole, active: !Boolean(member.membershipActive && member.credentialActive) }); } catch (error) { setStatus(error instanceof Error ? error.message : "تعذر تحديث حالة الحساب"); } };
  const reset = async () => { if (!organizationId || !resetFor || !resetPassword) return setStatus("أدخل كلمة مرور جديدة مطابقة للسياسة."); try { await resetEmployeePassword.mutateAsync({ organizationId, userId: resetFor, password: resetPassword }); } catch (error) { setStatus(error instanceof Error ? error.message : "تعذر تدوير كلمة المرور"); } };
  return <Card className="overflow-hidden border-0 bg-white shadow-sm"><CardHeader><CardTitle>إدارة حسابات الموظفين</CardTitle><p className="text-sm text-slate-500">إنشاء الحسابات وتحديد الدور والنطاق وتعطيلها يتم عبر الخادم مع تسجيل كل تغيير. لا يمكن للواجهة تجاوز العزل أو منح صلاحيات مدير المؤسسة.</p></CardHeader><CardContent className="space-y-5">{!organizationId && <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">اختر مؤسسة مصرحاً بها قبل إدارة الحسابات.</div>}{manager.isError ? <p className="rounded-xl bg-rose-50 p-3 text-sm text-rose-700">تعذر التحقق من صلاحية إدارة المؤسسة؛ بقيت العمليات محجوبة.</p> : <>{status && <Badge variant="outline">{status}</Badge>}<div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4"><p className="mb-3 font-semibold text-slate-900">إنشاء حساب موظف فعلي</p><div className="grid gap-3 md:grid-cols-3"><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="الاسم الكامل" aria-label="الاسم الكامل" /><Input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="البريد الإلكتروني اختياري" aria-label="البريد الإلكتروني" /><Input value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} placeholder="اسم المستخدم" aria-label="اسم المستخدم" /><Input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="كلمة مرور قوية، 12 حرفاً على الأقل" aria-label="كلمة المرور" /><select value={form.organizationRole} onChange={e => setForm({ ...form, organizationRole: e.target.value })} className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm" aria-label="دور الموظف"><option value="staff">موظف</option><option value="operations_manager">مدير عمليات</option><option value="clinical_lead">قائد سريري</option><option value="compliance_officer">مسؤول امتثال</option><option value="auditor">مدقق</option></select><select value={form.branchId} onChange={e => { const branch = branchOptions.find(option => String(option.id) === e.target.value); setForm({ ...form, branchId: e.target.value, jurisdictionId: branch ? String(branch.jurisdictionId) : "" }); }} className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm" aria-label="فرع الموظف"><option value="">اختر الفرع</option>{branchOptions.map(branch => <option key={branch.id} value={branch.id}>{branch.nameAr} ({branch.code})</option>)}</select></div><div className="mt-3 flex flex-wrap items-center gap-3"><span className="text-xs text-slate-500">{selectedBranch ? `الاختصاص المؤكد: ${selectedBranch.jurisdictionId}` : "يُملأ الاختصاص من الفرع المؤكد"}</span><Button onClick={submit} disabled={!enabled || !manager.data?.allowed || createEmployee.isPending} className="bg-[#0d1b2a]">{createEmployee.isPending ? "جارٍ الإنشاء…" : "إنشاء الحساب"}</Button></div></div><div className="space-y-3"><div className="flex items-center justify-between"><p className="font-semibold text-slate-900">الحسابات الحالية</p><span className="text-xs text-slate-500">{members.data?.length ?? 0} حساب</span></div>{members.isError ? <p className="rounded-xl bg-rose-50 p-3 text-sm text-rose-700">تعذر تحميل حسابات المؤسسة.</p> : members.data?.length ? members.data.map(member => { const active = Boolean(member.membershipActive && member.credentialActive); return <div key={member.userId} className="rounded-xl border border-slate-200 p-4"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="font-medium text-slate-900">{member.name ?? member.username}</p><p className="text-xs text-slate-500">{member.username} · {member.email ?? "بدون بريد معروض"}</p><p className="mt-1 text-xs text-slate-500">{member.branchName ?? "بدون فرع"} · الصلاحيات: {member.capabilities.join("، ") || "لا توجد"}</p></div><Badge variant={active ? "secondary" : "outline"}>{active ? "نشط" : "معطل"}</Badge></div><div className="mt-3 flex flex-wrap gap-2"><Button size="sm" variant="outline" onClick={() => toggle(member)} disabled={updateEmployee.isPending}>{active ? "تعطيل الحساب" : "تفعيل الحساب"}</Button><Button size="sm" variant="outline" onClick={() => setResetFor(member.userId)}>تدوير كلمة المرور</Button></div>{resetFor === member.userId && <div className="mt-3 flex flex-wrap gap-2"><Input type="password" value={resetPassword} onChange={e => setResetPassword(e.target.value)} placeholder="كلمة المرور الجديدة" aria-label="كلمة المرور الجديدة" /><Button size="sm" onClick={reset} disabled={resetEmployeePassword.isPending} className="bg-[#0d1b2a]">تأكيد التدوير</Button><Button size="sm" variant="ghost" onClick={() => { setResetFor(null); setResetPassword(""); }}>إلغاء</Button></div>}</div>; }) : <p className="rounded-xl border border-dashed border-slate-300 p-5 text-center text-sm text-slate-500">لا توجد حسابات موظفين فعلية ضمن النطاق.</p>}</div></>}</CardContent></Card>;
}

export function FinanceWorkspace({ organizationId, jurisdictionId, branchId }: ScopeProps) {
  const enabled = Boolean(organizationId && jurisdictionId);
  const [status, setStatus] = useState("");
  const stats = trpc.erp.pos.getTaxInvoiceTemplate.useQuery(branchId ? { branchId: branchId! } : skipToken, { retry: false });
  
  return (
    <div className="space-y-5">
      <Card className="overflow-hidden border-0 bg-white shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>الإدارة المالية والمحاسبة</CardTitle>
              <p className="text-sm text-slate-500">نظرة عامة على السيولة، الضرائب، والمراكز المالية.</p>
            </div>
            <Badge variant="outline" className="bg-emerald-50 text-emerald-700">وضع التدقيق النشط</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <ScopeNotice organizationId={organizationId} jurisdictionId={jurisdictionId} />
          
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: "إجمالي المبيعات (اليوم)", value: "0.00", currency: "EGP", trend: "stable" },
              { label: "ضريبة القيمة المضافة المستحقة", value: "0.00", currency: "EGP", trend: "up" },
              { label: "رصيد الخزينة الحالي", value: "0.00", currency: "EGP", trend: "stable" },
              { label: "مطالبات التأمين المعلقة", value: "0.00", currency: "EGP", trend: "down" }
            ].map((item) => (
              <div key={item.label} className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4">
                <p className="text-xs text-slate-500">{item.label}</p>
                <p className="mt-1 text-xl font-bold">{item.value} <span className="text-xs font-normal text-slate-400">{item.currency}</span></p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">العمليات المالية السريعة</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            <Button variant="outline" className="h-auto flex-col items-start gap-1 p-4 text-right">
              <span className="font-semibold">تسوية يومية</span>
              <span className="text-[10px] text-slate-500">مطابقة النقد مع سجل المبيعات</span>
            </Button>
            <Button variant="outline" className="h-auto flex-col items-start gap-1 p-4 text-right">
              <span className="font-semibold">إقرار ضريبي</span>
              <span className="text-[10px] text-slate-500">تجهيز بيانات VAT للفترة الحالية</span>
            </Button>
            <Button variant="outline" className="h-auto flex-col items-start gap-1 p-4 text-right">
              <span className="font-semibold">قيود يدوية</span>
              <span className="text-[10px] text-slate-500">إضافة حركات محاسبية استثنائية</span>
            </Button>
            <Button variant="outline" className="h-auto flex-col items-start gap-1 p-4 text-right">
              <span className="font-semibold">إدارة العهد</span>
              <span className="text-[10px] text-slate-500">صرف وتسوية عهد الموظفين</span>
            </Button>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">حالة التقارير المالية</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { name: "قائمة الدخل (P&L)", status: "جاهز للمعاينة", type: "financial" },
              { name: "الميزانية العمومية", status: "بانتظار الإغلاق الشهري", type: "financial" },
              { name: "تدفقات النقدية", status: "محدث لحظياً", type: "financial" },
              { name: "أعمار ديون الموردين", status: "يوجد مبالغ مستحقة", type: "payable" }
            ].map((report) => (
              <div key={report.name} className="flex items-center justify-between rounded-xl border border-slate-100 p-3 text-sm">
                <span className="font-medium">{report.name}</span>
                <Badge variant="secondary" className="text-[10px]">{report.status}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
      <ReportsWorkspace organizationId={organizationId} jurisdictionId={jurisdictionId} branchId={branchId} section="financial" />
    </div>
  );
}

export function WhatsAppManagementWorkspace({ organizationId }: { organizationId: number | null }) {
  const [to, setTo] = useState("");
  const [text, setText] = useState("");
  const [status, setStatus] = useState("");
  const send = trpc.communication.sendWhatsApp.useMutation();
  const sessionInfo = trpc.auth.sessionInfo.useQuery(undefined);
  
  const handleTestSend = async () => {
    if (!to.trim() || !text.trim()) {
      setStatus("يرجى إدخال رقم الهاتف ونص الرسالة.");
      return;
    }
    try {
      const result = await send.mutateAsync({ to, text });
      setStatus(result.simulated ? "تمت محاكاة الإرسال بنجاح (وضع العرض)." : "تم إرسال الرسالة بنجاح عبر WhatsApp API.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "تعذر إرسال الرسالة.");
    }
  };

  return (
    <Card className="overflow-hidden border-0 bg-white shadow-sm">
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle className="flex items-center gap-2">
            <PhoneCall className="h-5 w-5 text-emerald-600" />
            إدارة رسائل واتساب التلقائية
          </CardTitle>
          <p className="mt-1 text-sm text-slate-500">إعداد وتفعيل قوالب التواصل التلقائي مع العملاء والمرضى.</p>
        </div>
        <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-800">
          WhatsApp Business API
        </Badge>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="border-slate-100 bg-slate-50/50">
            <CardContent className="p-4">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">حالة الربط</p>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-amber-500" />
                <span className="text-sm font-medium text-slate-700">بانتظار الإعداد (وضع العرض)</span>
              </div>
            </CardContent>
          </Card>
          <Card className="border-slate-100 bg-slate-50/50">
            <CardContent className="p-4">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">القوالب المعتمدة</p>
              <span className="text-xl font-bold text-slate-400">٠ قوالب</span>
            </CardContent>
          </Card>
          <Card className="border-slate-100 bg-slate-50/50">
            <CardContent className="p-4">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">جاهزية الأتمتة</p>
              <span className="text-sm font-medium text-rose-600">غير مفعلة</span>
            </CardContent>
          </Card>
        </div>

        <div className="rounded-2xl border border-amber-100 bg-amber-50/30 p-6 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-600">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">تفعيل WhatsApp Business API</h3>
          <p className="mx-auto mt-2 max-w-md text-sm text-slate-600">
            يتطلب إرسال الرسائل الحقيقية ربط حساب Meta Business موثق، وتكوين مفاتيح الوصول (API Keys) في مدير الأسرار، واعتماد قوالب الرسائل من قبل Meta.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button variant="outline" className="border-slate-200 bg-white text-slate-700">
              دليل الإعداد التقني
            </Button>
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
              بدء عملية الربط
            </Button>
          </div>
        </div>

        <div className="space-y-4 rounded-2xl border border-slate-200 p-4 opacity-50 grayscale pointer-events-none">
          <h3 className="text-sm font-bold text-slate-900">اختبار إرسال سريع (مغلق)</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <Input disabled placeholder="رقم الهاتف..." dir="ltr" />
            <Input disabled placeholder="نص الرسالة..." />
          </div>
          <Button disabled className="bg-slate-200 text-slate-400">إرسال رسالة تجريبية</Button>
        </div>
      </CardContent>
    </Card>
  );
}
