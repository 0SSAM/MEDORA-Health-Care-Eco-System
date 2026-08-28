import { useEffect, useMemo, useState } from "react";
import { keepPreviousData, skipToken } from "@tanstack/react-query";
import { AlertTriangle, Building2, ChevronLeft, ChevronRight, Download, LockKeyhole, Pencil, Search, ShieldCheck, UsersRound, X } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useLocalization } from "@/contexts/LocalizationContext";
import type { EmployeeDirectoryFilterRecord } from "@/lib/employeeDirectoryFilters";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

type EmployeeRecord = EmployeeDirectoryFilterRecord & {
  userId: number;
  credentialActive: number | boolean;
  membershipActive: number | boolean;
  branchName: string | null;
  capabilities: string[];
};

type BranchOption = {
  id: number;
  code: string;
  nameAr: string;
  jurisdictionId: number;
};

const EDITABLE_ROLES = ["staff", "operations_manager", "clinical_lead", "compliance_officer", "auditor"] as const;
const PROTECTED_ROLES = new Set(["owner", "org_admin"]);
const CAPABILITY_KEYS = ["view_workspace", "manage_members", "view_sensitive_clinical", "view_audit", "view_financials"] as const;
const EMPLOYEE_PAGE_SIZE = 20;
type DirectoryRole = "all" | "owner" | "org_admin" | (typeof EDITABLE_ROLES)[number];

const ROLE_CAPABILITY_MATRIX: ReadonlyArray<{ role: string; capabilities: readonly string[] }> = [
  { role: "owner", capabilities: ["view_workspace", "manage_members", "view_sensitive_clinical", "view_audit", "view_financials"] },
  { role: "org_admin", capabilities: ["view_workspace", "manage_members", "view_sensitive_clinical", "view_audit", "view_financials"] },
  { role: "compliance_officer", capabilities: ["view_workspace", "view_sensitive_clinical", "view_audit"] },
  { role: "clinical_lead", capabilities: ["view_workspace", "view_sensitive_clinical"] },
  { role: "operations_manager", capabilities: ["view_workspace", "view_financials"] },
  { role: "staff", capabilities: ["view_workspace"] },
  { role: "auditor", capabilities: ["view_workspace", "view_sensitive_clinical", "view_audit"] },
];

function localizedLabel(language: string, arabic: string, english: string) {
  return language === "ar" ? arabic : english;
}

function roleLabel(language: string, role: string) {
  const labels: Record<string, [string, string]> = {
    owner: ["مالك المؤسسة", "Organization owner"],
    org_admin: ["مدير المؤسسة", "Organization administrator"],
    staff: ["موظف", "Staff"],
    operations_manager: ["مدير عمليات", "Operations manager"],
    clinical_lead: ["قائد سريري", "Clinical lead"],
    compliance_officer: ["مسؤول امتثال", "Compliance officer"],
    auditor: ["مدقق", "Auditor"],
  };
  const [arabic, english] = labels[role] ?? [role, role];
  return localizedLabel(language, arabic, english);
}

function capabilityLabel(language: string, capability: string) {
  const labels: Record<string, [string, string]> = {
    view_workspace: ["مساحة العمل", "Workspace"],
    manage_members: ["إدارة الأعضاء", "Manage members"],
    view_sensitive_clinical: ["البيانات السريرية الحساسة", "Sensitive clinical data"],
    view_audit: ["سجل التدقيق", "Audit log"],
    view_financials: ["المالية", "Financials"],
  };
  const [arabic, english] = labels[capability] ?? [capability, capability];
  return localizedLabel(language, arabic, english);
}

export function EmployeeAdministrationWorkspace({ organizationId }: { organizationId: number | null }) {
  const { language, direction } = useLocalization();
  const t = (arabic: string, english: string) => localizedLabel(language, arabic, english);
  const enabled = Boolean(organizationId);
  const [editingMember, setEditingMember] = useState<EmployeeRecord | null>(null);
  const [editRole, setEditRole] = useState<(typeof EDITABLE_ROLES)[number]>("staff");
  const [editBranchId, setEditBranchId] = useState("");
  const [directoryQuery, setDirectoryQuery] = useState("");
  const [appliedDirectoryQuery, setAppliedDirectoryQuery] = useState("");
  const [directoryRole, setDirectoryRole] = useState<DirectoryRole>("all");
  const [directoryBranchId, setDirectoryBranchId] = useState("all");
  const [directoryPage, setDirectoryPage] = useState(1);
  const [status, setStatus] = useState("");
  const members = trpc.organizations.employeeDirectoryPage.useQuery(enabled ? { organizationId: organizationId!, page: directoryPage, pageSize: EMPLOYEE_PAGE_SIZE, query: appliedDirectoryQuery, role: directoryRole, branchId: directoryBranchId === "all" ? undefined : Number(directoryBranchId) } : skipToken, { retry: false, placeholderData: keepPreviousData });
  const branches = trpc.organizations.branches.useQuery(enabled ? { organizationId: organizationId! } : skipToken, { retry: false });
  const manager = trpc.organizations.assertManager.useQuery(enabled ? { organizationId: organizationId! } : skipToken, { retry: false });
  const branchOptions = (branches.data ?? []) as BranchOption[];
  const directory = (members.data?.records ?? []) as EmployeeRecord[];
  const selectedBranch = useMemo(() => branchOptions.find(branch => String(branch.id) === editBranchId) ?? null, [branchOptions, editBranchId]);
  const hasDirectoryFilters = Boolean(directoryQuery.trim()) || directoryRole !== "all" || directoryBranchId !== "all";
  const exportDirectory = trpc.organizations.exportEmployeeDirectoryCsv.useMutation();
  const updateEmployee = trpc.organizations.updateEmployee.useMutation({
    onSuccess: async () => {
      setStatus(t("تم تحديث دور الموظف وفرعه ضمن نطاق المؤسسة المؤكد.", "The employee role and branch were updated within the confirmed organization scope."));
      setEditingMember(null);
      await members.refetch();
    },
  });

  useEffect(() => {
    if (!editingMember) return;
    setEditRole(EDITABLE_ROLES.includes(editingMember.organizationRole as (typeof EDITABLE_ROLES)[number]) ? editingMember.organizationRole as (typeof EDITABLE_ROLES)[number] : "staff");
    setEditBranchId(String(editingMember.branchId));
  }, [editingMember]);

  useEffect(() => {
    const timer = window.setTimeout(() => setAppliedDirectoryQuery(directoryQuery.trim()), 250);
    return () => window.clearTimeout(timer);
  }, [directoryQuery]);

  useEffect(() => {
    setDirectoryPage(1);
  }, [organizationId, appliedDirectoryQuery, directoryRole, directoryBranchId]);

  const openEditor = (member: EmployeeRecord) => {
    if (PROTECTED_ROLES.has(member.organizationRole)) {
      setStatus(t("لا يمكن تعديل حساب المالك أو مدير المؤسسة من هذا المسار. تبقى هذه الحسابات محمية ضمن سياسة إدارة المنصة.", "Owner and organization-administrator accounts cannot be edited through this workflow. They remain protected by the platform administration policy."));
      return;
    }
    setEditingMember(member);
  };

  const saveEmployee = async () => {
    if (!organizationId || !editingMember || !selectedBranch) {
      setStatus(t("اختر فرعاً نشطاً ومؤكداً قبل الحفظ.", "Select an active confirmed branch before saving."));
      return;
    }
    if (PROTECTED_ROLES.has(editingMember.organizationRole)) {
      setStatus(t("حساب الدور المحمي لا يمكن تغييره من هذه الواجهة.", "A protected-role account cannot be changed from this console."));
      return;
    }
    try {
      await updateEmployee.mutateAsync({
        organizationId,
        userId: editingMember.userId,
        organizationRole: editRole,
        branchId: selectedBranch.id,
        jurisdictionId: selectedBranch.jurisdictionId,
        active: Boolean(editingMember.membershipActive && editingMember.credentialActive),
      });
    } catch (error) {
      setStatus(error instanceof Error ? error.message : t("تعذر تحديث الموظف.", "The employee could not be updated."));
    }
  };

  const managerAllowed = manager.data?.allowed === true;
  const clearDirectoryFilters = () => {
    setDirectoryQuery("");
    setDirectoryRole("all");
    setDirectoryBranchId("all");
    setDirectoryPage(1);
  };
  const exportFilteredDirectory = async () => {
    if (!organizationId || !managerAllowed) return;
    try {
      const result = await exportDirectory.mutateAsync({
        organizationId,
        query: appliedDirectoryQuery,
        role: directoryRole,
        branchId: directoryBranchId === "all" ? undefined : Number(directoryBranchId),
      });
      const blob = new Blob([result.csv], { type: result.contentType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = result.filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 0);
      setStatus(result.truncated
        ? t(`تم تصدير أول ${result.exportedCount} حساباً مطابقاً. حد التصدير الآمن هو ${result.exportLimit} حساب.`, `The first ${result.exportedCount} matching accounts were exported. The safe export limit is ${result.exportLimit} accounts.`)
        : t(`تم تصدير ${result.exportedCount} حساباً مطابقاً إلى CSV.`, `${result.exportedCount} matching accounts were exported to CSV.`));
    } catch (error) {
      setStatus(error instanceof Error ? error.message : t("تعذر تصدير قائمة الموظفين.", "The employee directory could not be exported."));
    }
  };

  return (
    <div dir={direction} className="space-y-5">
      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="space-y-2 border-b border-slate-100 bg-slate-50/70">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-slate-900 p-2.5 text-white"><UsersRound className="h-5 w-5" /></div>
              <div><CardTitle>{t("حسابات الموظفين", "Employee accounts")}</CardTitle><CardDescription>{t("تعديل الدور والفرع فقط ضمن المؤسسة والاختصاص المؤكدين.", "Edit role and branch only within the confirmed organization and jurisdiction.")}</CardDescription></div>
            </div>
            <Badge variant="outline" className="gap-1"><ShieldCheck className="h-3.5 w-3.5" />{t("تحقق خادمي إلزامي", "Server enforcement required")}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 pt-5">
          {!organizationId && <ScopeWarning message={t("اختر مؤسسة أولاً. لن تعرض وحدة الإدارة أي حسابات أو امتيازات دون نطاق مؤسسة مؤكد.", "Select an organization first. The console will not expose accounts or privileges without a confirmed organization scope.")} />}
          {organizationId && manager.isLoading && <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-600">{t("جارٍ التحقق من صلاحية إدارة المؤسسة…", "Verifying organization-management authority…")}</p>}
          {organizationId && manager.isError && <ScopeWarning message={t("تعذر التحقق من التفويض؛ بقيت عمليات الإدارة محجوبة بأمان.", "Authorization could not be verified; administration actions remain safely blocked.")} />}
          {organizationId && !manager.isLoading && !manager.isError && !managerAllowed && <ScopeWarning message={t("ليس لديك امتياز إدارة أعضاء هذه المؤسسة. ظهور رابط في الواجهة لا يمنح صلاحية خادمية.", "You do not hold member-management privilege for this organization. A visible UI link does not grant server authorization.")} />}
          {managerAllowed && <>
            {status && <p role="status" className="rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-700">{status}</p>}
            {members.isError ? <ScopeWarning message={t("تعذر تحميل دليل الموظفين ضمن هذه المؤسسة.", "The employee directory could not be loaded for this organization.")} /> : <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2"><p className="font-semibold text-slate-900">{t("الموظفون الحاليون", "Current employees")}</p><div className="flex flex-wrap items-center gap-2"><span className="text-sm text-slate-500">{directory.length} {t("حساب", "accounts")}</span><Button type="button" variant="outline" size="sm" onClick={exportFilteredDirectory} disabled={exportDirectory.isPending || members.isFetching || (members.data?.total ?? 0) === 0} className="gap-2"><Download aria-hidden="true" className="h-4 w-4" />{exportDirectory.isPending ? t("جارٍ التصدير…", "Exporting…") : t("تصدير CSV", "Export CSV")}</Button></div></div>
              <div id="employee-directory" className="space-y-3">
                <div role="search" aria-label={t("البحث وتصفية الموظفين", "Search and filter employees")} className="grid gap-3 rounded-2xl border border-slate-200 bg-slate-50/70 p-3 sm:grid-cols-2 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1fr)_auto]">
                  <label className="grid gap-1.5 text-sm font-medium text-slate-800"><span>{t("ابحث عن موظف", "Find an employee")}</span><div className="relative"><Search aria-hidden="true" className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input value={directoryQuery} onChange={event => setDirectoryQuery(event.target.value)} placeholder={t("الاسم أو البريد أو اسم المستخدم", "Name, email, or username")} className="h-10 w-full rounded-md border border-slate-300 bg-white ps-9 pe-3 text-sm" /></div></label>
                  <label className="grid gap-1.5 text-sm font-medium text-slate-800"><span>{t("الدور", "Role")}</span><select value={directoryRole} onChange={event => setDirectoryRole(event.target.value as DirectoryRole)} className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm"><option value="all">{t("كل الأدوار", "All roles")}</option>{ROLE_CAPABILITY_MATRIX.map(row => <option key={row.role} value={row.role}>{roleLabel(language, row.role)}</option>)}</select></label>
                  <label className="grid gap-1.5 text-sm font-medium text-slate-800"><span>{t("الفرع", "Branch")}</span><select value={directoryBranchId} onChange={event => setDirectoryBranchId(event.target.value)} className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm"><option value="all">{t("كل الفروع", "All branches")}</option>{branchOptions.map(branch => <option key={branch.id} value={branch.id}>{branch.nameAr} ({branch.code})</option>)}</select></label>
                  <div className="flex items-end"><Button type="button" variant="outline" onClick={clearDirectoryFilters} disabled={!hasDirectoryFilters} className="h-10 w-full gap-2 lg:w-auto"><X aria-hidden="true" className="h-4 w-4" />{t("مسح", "Clear")}</Button></div>
                </div>
                <p role="status" aria-live="polite" className="text-sm text-slate-600">{t(`عرض ${directory.length} من ${members.data?.total ?? 0} حساب`, `Showing ${directory.length} of ${members.data?.total ?? 0} accounts`)}</p>
                <p id="employee-export-scope" className="text-xs leading-5 text-slate-500">{t("يُصدّر CSV الحسابات المطابقة لعوامل التصفية الحالية داخل المؤسسة المحددة فقط. لا يتضمن البريد أو بيانات الاعتماد أو كلمات المرور، وبحد أقصى 1000 حساب.", "CSV exports only accounts matching the current filters in the selected organization. It excludes email, credential, and password data, and is limited to 1,000 accounts.")}</p>
                {members.isLoading ? <p className="rounded-xl border border-dashed border-slate-300 bg-white p-5 text-center text-sm text-slate-500">{t("جارٍ تحميل حسابات الموظفين…", "Loading employee accounts…")}</p> : directory.length === 0 ? <p className="rounded-xl border border-dashed border-slate-300 bg-white p-5 text-center text-sm text-slate-500">{hasDirectoryFilters ? t("لا توجد حسابات تطابق البحث أو عوامل التصفية. امسح عوامل التصفية لعرض الدليل المصرح به كاملاً.", "No accounts match the search or filters. Clear filters to view the full authorized directory.") : t("لا توجد حسابات موظفين ضمن المؤسسة المحددة.", "There are no employee accounts in the selected organization.")}</p> : directory.map(member => {
                const protectedAccount = PROTECTED_ROLES.has(member.organizationRole);
                const active = Boolean(member.membershipActive && member.credentialActive);
                return <div key={member.userId} className="rounded-2xl border border-slate-200 bg-white p-4"><div className="flex flex-wrap items-start justify-between gap-3"><div className="min-w-0"><p className="font-semibold text-slate-900">{member.name ?? member.username}</p><p className="mt-1 text-xs text-slate-500">{member.username} · {member.email ?? t("لا يوجد بريد معروض", "No email shown")}</p><p className="mt-2 text-sm text-slate-700">{roleLabel(language, member.organizationRole)} · {member.branchName ?? t("فرع غير محدد", "No branch")}</p></div><div className="flex flex-wrap gap-2"><Badge variant={active ? "secondary" : "outline"}>{active ? t("نشط", "Active") : t("معطل", "Disabled")}</Badge>{protectedAccount && <Badge variant="outline" className="gap-1"><LockKeyhole className="h-3.5 w-3.5" />{t("دور محمي", "Protected role")}</Badge>}</div></div><div className="mt-3 flex flex-wrap items-center justify-between gap-3"><p className="text-xs text-slate-500">{t("الصلاحيات الحالية:", "Current capabilities:")} {member.capabilities.map(capability => capabilityLabel(language, capability)).join(language === "ar" ? "، " : ", ") || t("لا توجد", "None")}</p><Button size="sm" variant="outline" onClick={() => openEditor(member)} disabled={protectedAccount || updateEmployee.isPending} className="gap-2"><Pencil className="h-3.5 w-3.5" />{t("تعديل الدور والفرع", "Edit role & branch")}</Button></div></div>;
                })}
                {(members.data?.total ?? 0) > 0 && <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-3 sm:flex-row sm:items-center sm:justify-between"><p className="text-sm text-slate-600">{t(`الصفحة ${members.data?.page ?? 1} من ${members.data?.pageCount ?? 1}`, `Page ${members.data?.page ?? 1} of ${members.data?.pageCount ?? 1}`)}</p><nav dir={direction} aria-label={t("ترقيم دليل الموظفين", "Employee directory pagination")} className="flex items-center gap-2 self-start sm:self-auto"><Button type="button" variant="outline" size="sm" disabled={!members.data?.hasPrevious || members.isFetching} onClick={() => setDirectoryPage(page => Math.max(1, page - 1))} className="gap-1.5">{direction === "rtl" ? <ChevronRight aria-hidden="true" className="h-4 w-4" /> : <ChevronLeft aria-hidden="true" className="h-4 w-4" />}{t("السابق", "Previous")}</Button><span aria-current="page" className="inline-flex h-9 min-w-9 items-center justify-center rounded-md border border-slate-200 bg-slate-50 px-3 text-sm font-medium text-slate-800">{members.data?.page ?? 1}</span><Button type="button" variant="outline" size="sm" disabled={!members.data?.hasNext || members.isFetching} onClick={() => setDirectoryPage(page => page + 1)} className="gap-1.5">{t("التالي", "Next")}{direction === "rtl" ? <ChevronLeft aria-hidden="true" className="h-4 w-4" /> : <ChevronRight aria-hidden="true" className="h-4 w-4" />}</Button></nav></div>}
                </div>
            </div>}
          </>}
        </CardContent>
      </Card>

      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="border-b border-slate-100"><div className="flex items-start gap-3"><div className="rounded-xl bg-blue-50 p-2.5 text-blue-700"><ShieldCheck className="h-5 w-5" /></div><div><CardTitle>{t("مصفوفة الصلاحيات", "Role capability matrix")}</CardTitle><CardDescription>{t("عرض للقراءة فقط. الامتيازات ثابتة ومشتقة من الدور؛ لا توجد استثناءات فردية أو محرر صلاحيات حر.", "Read-only view. Privileges are fixed and role-derived; there are no individual overrides or free-form permission editor.")}</CardDescription></div></div></CardHeader>
        <CardContent className="pt-5"><div className="grid gap-3 sm:hidden">{ROLE_CAPABILITY_MATRIX.map(row => <div key={row.role} className="rounded-xl border border-slate-200 p-3"><p className="font-semibold text-slate-900">{roleLabel(language, row.role)}{PROTECTED_ROLES.has(row.role) && <span className="ms-2 text-xs font-normal text-slate-500">{t("(محمي)", "(protected)")}</span>}</p><div className="mt-3 grid grid-cols-2 gap-2">{CAPABILITY_KEYS.map(capability => <div key={capability} className="flex items-center justify-between gap-2 rounded-lg bg-slate-50 px-2.5 py-2 text-xs text-slate-700"><span>{capabilityLabel(language, capability)}</span><span aria-label={row.capabilities.includes(capability) ? t("متاح", "Allowed") : t("غير متاح", "Not allowed")} className={row.capabilities.includes(capability) ? "font-semibold text-emerald-700" : "text-slate-300"}>{row.capabilities.includes(capability) ? "✓" : "—"}</span></div>)}</div></div>)}</div><div className="hidden overflow-x-auto sm:block"><table className="min-w-[740px] w-full text-sm"><thead><tr className="border-b border-slate-200 text-slate-600"><th className="px-3 py-3 text-start font-semibold">{t("الدور", "Role")}</th>{CAPABILITY_KEYS.map(capability => <th key={capability} className="px-3 py-3 text-center font-semibold">{capabilityLabel(language, capability)}</th>)}</tr></thead><tbody>{ROLE_CAPABILITY_MATRIX.map(row => <tr key={row.role} className="border-b border-slate-100 last:border-0"><td className="px-3 py-3 font-medium text-slate-900">{roleLabel(language, row.role)}{PROTECTED_ROLES.has(row.role) && <span className="ms-2 text-xs text-slate-500">{t("(محمي)", "(protected)")}</span>}</td>{CAPABILITY_KEYS.map(capability => <td key={capability} className="px-3 py-3 text-center">{row.capabilities.includes(capability) ? <span aria-label={t("متاح", "Allowed")} className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">✓</span> : <span aria-label={t("غير متاح", "Not allowed")} className="text-slate-300">—</span>}</td>)}</tr>)}</tbody></table></div></CardContent>
      </Card>

      <Dialog open={Boolean(editingMember)} onOpenChange={open => { if (!open) setEditingMember(null); }}>
        <DialogContent className="sm:max-w-xl" dir={direction}>
          <DialogHeader><DialogTitle>{t("تعديل الدور والفرع", "Edit role and branch")}</DialogTitle><DialogDescription>{t("يُتحقق الخادم من المؤسسة والفرع والاختصاص مرة أخرى عند الحفظ. لا يمكن لهذه النافذة منح دور المالك أو مدير المؤسسة.", "The server re-validates organization, branch, and jurisdiction on save. This dialog cannot grant owner or organization-administrator roles.")}</DialogDescription></DialogHeader>
          {editingMember && <div className="space-y-4"><div className="rounded-xl bg-slate-50 p-3 text-sm text-slate-700"><span className="font-semibold">{editingMember.name ?? editingMember.username}</span><span className="text-slate-500"> · {editingMember.username}</span></div><label className="grid gap-2 text-sm font-medium text-slate-800"><span>{t("الدور التنظيمي", "Organization role")}</span><select value={editRole} onChange={event => setEditRole(event.target.value as (typeof EDITABLE_ROLES)[number])} className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm"><option value="staff">{roleLabel(language, "staff")}</option><option value="operations_manager">{roleLabel(language, "operations_manager")}</option><option value="clinical_lead">{roleLabel(language, "clinical_lead")}</option><option value="compliance_officer">{roleLabel(language, "compliance_officer")}</option><option value="auditor">{roleLabel(language, "auditor")}</option></select></label><label className="grid gap-2 text-sm font-medium text-slate-800"><span>{t("الفرع النشط", "Active branch")}</span><select value={editBranchId} onChange={event => setEditBranchId(event.target.value)} className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm"><option value="">{t("اختر فرعاً", "Select a branch")}</option>{branchOptions.map(branch => <option key={branch.id} value={branch.id}>{branch.nameAr} ({branch.code})</option>)}</select></label><p className="rounded-xl border border-blue-100 bg-blue-50 p-3 text-xs leading-5 text-blue-900"><Building2 className="me-1 inline h-3.5 w-3.5" />{selectedBranch ? t(`الاختصاص المؤكد مشتق من الفرع: ${selectedBranch.jurisdictionId}. لا يمكن تعديله يدوياً.`, `Confirmed jurisdiction is derived from the branch: ${selectedBranch.jurisdictionId}. It cannot be edited manually.`) : t("لن يُحفظ التعديل قبل اختيار فرع نشط ذي اختصاص مؤكد.", "The change cannot be saved until an active branch with a confirmed jurisdiction is selected.")}</p></div>}
          <DialogFooter><Button variant="outline" onClick={() => setEditingMember(null)}>{t("إلغاء", "Cancel")}</Button><Button onClick={saveEmployee} disabled={!selectedBranch || updateEmployee.isPending} className="bg-slate-900">{updateEmployee.isPending ? t("جارٍ الحفظ…", "Saving…") : t("حفظ التعديل", "Save change")}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ScopeWarning({ message }: { message: string }) {
  return <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950"><AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />{message}</div>;
}
