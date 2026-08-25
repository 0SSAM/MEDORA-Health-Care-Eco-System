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

type Scope = { organizationId: number | null; branchId: number | null; jurisdictionId: number | null };

function ScopeWarning({ organizationId, branchId, needBranch = false }: { organizationId: number | null; branchId: number | null; needBranch?: boolean }) {
  if (organizationId && (!needBranch || branchId)) return null;
  return <p className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm leading-6 text-amber-900">{needBranch ? "اختر مؤسسة وفرعًا مصرحًا بهما قبل إنشاء هذا السجل؛ لن يستخدم النظام نطاقًا افتراضيًا." : "اختر مؤسسة مصرحًا بها قبل إدارة سجلات العمليات."}</p>;
}

function StatusNote({ text }: { text: string }) {
  return text ? <p className="rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-700">{text}</p> : null;
}

export function OperationsManagementWorkspace({ organizationId, branchId, jurisdictionId, section }: Scope & { section?: "hr" | "crm" | "procurement" }) {
  const organizationReady = Boolean(organizationId);
  const branchReady = Boolean(organizationId && branchId);
  const [employeeNumber, setEmployeeNumber] = useState("");
  const [employeeName, setEmployeeName] = useState("");
  const [department, setDepartment] = useState("");
  const [procurementNumber, setProcurementNumber] = useState("");
  const [procurementTitle, setProcurementTitle] = useState("");
  const [procurementJustification, setProcurementJustification] = useState("");
  const [leadLabel, setLeadLabel] = useState("");
  const [leadConsent, setLeadConsent] = useState<"unknown" | "granted" | "withdrawn" | "not_required">("unknown");
  const [status, setStatus] = useState("");

  const people = trpc.operations.people.list.useQuery(organizationReady ? { organizationId: organizationId!, branchId: branchId ?? undefined, jurisdictionId: jurisdictionId ?? undefined } : skipToken, { retry: false });
  const procurements = trpc.operations.procurement.list.useQuery(organizationReady ? { organizationId: organizationId!, branchId: branchId ?? undefined, jurisdictionId: jurisdictionId ?? undefined } : skipToken, { retry: false });
  const leads = trpc.operations.crm.list.useQuery(organizationReady ? { organizationId: organizationId!, branchId: branchId ?? undefined, jurisdictionId: jurisdictionId ?? undefined } : skipToken, { retry: false });

  const createEmployee = trpc.operations.people.create.useMutation({ onSuccess: async result => { setStatus(`تم إنشاء ملف الموظف #${result.employeeProfileId} ضمن النطاق المحدد.`); setEmployeeNumber(""); setEmployeeName(""); setDepartment(""); await people.refetch(); } });
  const createProcurement = trpc.operations.procurement.create.useMutation({ onSuccess: async result => { setStatus(`تم حفظ طلب الشراء #${result.requestId} كمسودة خاضعة للمراجعة. لا يُرسل طلب شراء إلى مورد من هذه الوحدة.`); setProcurementNumber(""); setProcurementTitle(""); setProcurementJustification(""); await procurements.refetch(); } });
  const createLead = trpc.operations.crm.create.useMutation({ onSuccess: async result => { setStatus(result.status === "do_not_contact" ? "تم حفظ السجل كـ «لا تتصل» بسبب سحب الموافقة." : `تم إنشاء فرصة CRM #${result.leadId} ضمن نطاق المؤسسة.`); setLeadLabel(""); await leads.refetch(); } });

  const addEmployee = async () => {
    if (!organizationId || !employeeNumber.trim() || !employeeName.trim()) return setStatus("أدخل الرقم الوظيفي والاسم المعروض قبل الحفظ.");
    try { await createEmployee.mutateAsync({ organizationId, branchId: branchId ?? undefined, jurisdictionId: jurisdictionId ?? undefined, employeeNumber: employeeNumber.trim(), displayName: employeeName.trim(), department: department.trim() || undefined, employmentStatus: "onboarding" }); }
    catch (error) { setStatus(error instanceof Error ? error.message : "تعذر إنشاء ملف الموظف."); }
  };

  const addProcurement = async (manualData?: { title: string; justification: string }) => {
    const title = manualData?.title ?? procurementTitle;
    const justification = manualData?.justification ?? procurementJustification;
    const reqNum = manualData ? `AI-${Date.now().toString().slice(-6)}` : procurementNumber;

    if (!organizationId || !branchId || !reqNum.trim() || !title.trim() || justification.trim().length < 5) {
      return setStatus("أكمل رقم الطلب والعنوان والمبرر (خمسة أحرف على الأقل) واختر فرعًا.");
    }
    try {
      await createProcurement.mutateAsync({
        organizationId,
        branchId,
        jurisdictionId: jurisdictionId ?? undefined,
        requestNumber: reqNum,
        requestType: "stock",
        title: title.trim(),
        businessJustification: justification.trim(),
        currencyCode: "EGP",
      });
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "تعذر حفظ طلب الشراء.");
    }
  };

  const addLead = async () => {
    if (!organizationId || !leadLabel.trim()) return setStatus("أدخل تسمية غير حساسة للفرصة قبل الحفظ.");
    try { await createLead.mutateAsync({ organizationId, branchId: branchId ?? undefined, jurisdictionId: jurisdictionId ?? undefined, label: leadLabel.trim(), source: "other", consentStatus: leadConsent }); }
    catch (error) { setStatus(error instanceof Error ? error.message : "تعذر إنشاء فرصة CRM."); }
  };

  const renderHr = () => (
    <Card className="border-0 bg-white shadow-sm"><CardHeader><CardTitle>ملفات الموظفين</CardTitle><p className="text-sm leading-6 text-slate-500">سجل داخلي مقيد بالمؤسسة والفرع؛ لا يتضمن تشغيل الرواتب أو أي تعاقدات خارجية.</p></CardHeader><CardContent className="space-y-4"><ScopeWarning organizationId={organizationId} branchId={branchId} /><div className="grid gap-2 sm:grid-cols-3"><Input value={employeeNumber} onChange={e => setEmployeeNumber(e.target.value)} placeholder="رقم الموظف" aria-label="رقم الموظف" /><Input value={employeeName} onChange={e => setEmployeeName(e.target.value)} placeholder="الاسم المعروض" aria-label="الاسم المعروض" /><Input value={department} onChange={e => setDepartment(e.target.value)} placeholder="القسم (اختياري)" aria-label="القسم" /></div><Button onClick={addEmployee} disabled={!organizationReady || createEmployee.isPending} className="bg-[#0d1b2a]">{createEmployee.isPending ? "جارٍ الحفظ…" : "إنشاء ملف موظف"}</Button>{people.isError ? <p className="text-sm text-rose-700">تعذر تحميل سجلات الموظفين ضمن هذا النطاق.</p> : people.data?.length ? <div className="space-y-2">{people.data.slice(0, 5).map(person => <div key={person.id} className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 p-3 text-sm"><div><p className="font-medium">{person.employeeNumber} · {person.displayName}</p><p className="text-xs text-slate-500">{person.department ?? "بدون قسم"}{person.jobTitle ? ` · ${person.jobTitle}` : ""}</p></div><Badge variant="secondary">{person.employmentStatus}</Badge></div>)}</div> : <p className="rounded-xl border border-dashed border-slate-300 p-4 text-center text-sm text-slate-500">لا توجد ملفات موظفين ضمن النطاق الحالي.</p>}</CardContent></Card>
  );

  const renderProcurement = () => (
    <Card className="border-0 bg-white shadow-sm"><CardHeader><CardTitle>طلبات الشراء الداخلية</CardTitle><p className="text-sm leading-6 text-slate-500">تبدأ كل المعاملات كمسودة قابلة للتدقيق وتتطلب اعتمادًا قبل التنفيذ؛ لا يوجد اتصال بمورد أو جهة خارجية.</p></CardHeader><CardContent className="space-y-4"><ScopeWarning organizationId={organizationId} branchId={branchId} needBranch /><div className="grid gap-2 sm:grid-cols-2"><Input value={procurementNumber} onChange={e => setProcurementNumber(e.target.value)} placeholder="رقم طلب الشراء" aria-label="رقم طلب الشراء" /><Input value={procurementTitle} onChange={e => setProcurementTitle(e.target.value)} placeholder="عنوان الطلب" aria-label="عنوان الطلب" /></div><Input value={procurementJustification} onChange={e => setProcurementJustification(e.target.value)} placeholder="المبرر التشغيلي" aria-label="المبرر التشغيلي" /><Button onClick={() => addProcurement()} disabled={!branchReady || createProcurement.isPending} className="bg-[#0d1b2a]">{createProcurement.isPending ? "جارٍ الحفظ…" : "حفظ طلب شراء كمسودة"}</Button>{procurements.isError ? <p className="text-sm text-rose-700">تعذر تحميل طلبات الشراء.</p> : procurements.data?.length ? <div className="space-y-2">{procurements.data.slice(0, 5).map(request => <div key={request.id} className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 p-3 text-sm"><div><p className="font-medium">{request.requestNumber} · {request.title}</p><p className="text-xs text-slate-500">{request.requestType} · {request.currencyCode}</p></div><Badge variant="secondary">{request.status}</Badge></div>)}</div> : <p className="rounded-xl border border-dashed border-slate-300 p-4 text-center text-sm text-slate-500">لا توجد طلبات شراء ضمن النطاق الحالي.</p>}</CardContent></Card>
  );

  const renderCrm = () => (
    <Card className="border-0 bg-white shadow-sm"><CardHeader><CardTitle>إدارة علاقات العملاء والموافقات</CardTitle><p className="text-sm leading-6 text-slate-500">لا تحفظ هذه المساحة بيانات اتصال خام. سحب الموافقة يؤدي مباشرةً إلى حالة «لا تتصل» النهائية.</p></CardHeader><CardContent className="space-y-4"><ScopeWarning organizationId={organizationId} branchId={branchId} /><div className="grid gap-2 md:grid-cols-[1fr_220px_auto]"><Input value={leadLabel} onChange={e => setLeadLabel(e.target.value)} placeholder="تسمية غير حساسة للفرصة" aria-label="تسمية فرصة CRM" /><select value={leadConsent} onChange={e => setLeadConsent(e.target.value as typeof leadConsent)} className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm" aria-label="حالة الموافقة"><option value="unknown">الموافقة غير معروفة</option><option value="granted">الموافقة ممنوحة</option><option value="withdrawn">الموافقة مسحوبة</option><option value="not_required">لا تتطلب موافقة</option></select><Button onClick={addLead} disabled={!organizationReady || createLead.isPending} className="bg-[#0d1b2a]">{createLead.isPending ? "جارٍ الحفظ…" : "إنشاء فرصة"}</Button></div><StatusNote text={status} />{leads.isError ? <p className="text-sm text-rose-700">تعذر تحميل فرص CRM.</p> : leads.data?.length ? <div className="grid gap-2 md:grid-cols-2">{leads.data.slice(0, 6).map(lead => <div key={lead.id} className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 p-3 text-sm"><div><p className="font-medium">{lead.label}</p><p className="text-xs text-slate-500">{lead.source} · {lead.consentStatus}</p></div><Badge variant="secondary">{lead.stage}</Badge></div>)}</div> : <p className="rounded-xl border border-dashed border-slate-300 p-4 text-center text-sm text-slate-500">لا توجد فرص CRM ضمن النطاق الحالي.</p>}</CardContent></Card>
  );

  if (section === "hr") return <div className="space-y-5">{renderHr()}</div>;
  if (section === "crm") return <div className="space-y-5">{renderCrm()}</div>;
  if (section === "procurement") return <div className="space-y-5">{renderProcurement()}</div>;

  return (
    <div className="grid gap-5 xl:grid-cols-2">
      {renderHr()}
      {renderProcurement()}
      <div className="xl:col-span-2">{renderCrm()}</div>
      <div className="xl:col-span-2"><StatusNote text={status} /></div>
    </div>
  );
}

export function ProcurementActionTrigger({
  organizationId,
  branchId,
  jurisdictionId,
  initialTitle,
  initialJustification,
  onComplete,
}: Scope & {
  initialTitle: string;
  initialJustification: string;
  onComplete?: () => void;
}) {
  const [status, setStatus] = useState("");
  const createProcurement = trpc.operations.procurement.create.useMutation({
    onSuccess: () => {
      setStatus("تم إنشاء مسودة طلب الشراء بنجاح.");
      onComplete?.();
    },
  });

  const handleAction = async () => {
    if (!organizationId || !branchId) return setStatus("النطاق غير مكتمل.");
    try {
      await createProcurement.mutateAsync({
        organizationId,
        branchId,
        jurisdictionId: jurisdictionId ?? undefined,
        requestNumber: `AI-${Date.now().toString().slice(-6)}`,
        requestType: "stock",
        title: initialTitle,
        businessJustification: initialJustification,
        currencyCode: "EGP",
      });
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "تعذر التنفيذ");
    }
  };

  return (
    <div className="space-y-2">
      <Button
        size="sm"
        onClick={handleAction}
        disabled={createProcurement.isPending}
        className="bg-cyan-700 hover:bg-cyan-800"
      >
        {createProcurement.isPending ? "جارٍ التنفيذ..." : "تحويل لتوصية شراء"}
      </Button>
      {status && <p className="text-[10px] text-cyan-700">{status}</p>}
    </div>
  );
}
