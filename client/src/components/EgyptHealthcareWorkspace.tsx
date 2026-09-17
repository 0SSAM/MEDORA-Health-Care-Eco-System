import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useLocalization } from "@/contexts/LocalizationContext";
import { hasOrganizationBranchJurisdictionScope } from "@/lib/scope";
import { trpc } from "@/lib/trpc";
import { useState } from "react";

type EgyptHealthcareWorkspaceProps = {
  organizationId: number | null;
  branchId: number | null;
  jurisdictionId: number | null;
};

function CountCard({ title, value, detail }: { title: string; value: number | string; detail: string }) {
  return (
    <Card className="border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-slate-700 dark:text-slate-200">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-semibold tabular-nums">{value}</div>
        <p className="mt-1 text-xs text-muted-foreground">{detail}</p>
      </CardContent>
    </Card>
  );
}

export function EgyptHealthcareWorkspace({ organizationId, branchId, jurisdictionId }: EgyptHealthcareWorkspaceProps) {
  const { language } = useLocalization();
  const ar = language === "ar";
  const copy = ar
    ? {
        title: "مساحة الرعاية الصحية", subtitle: "لوحة تشغيل داخلية مقيدة بنطاق المؤسسة والفرع والاختصاص.", patients: "مراجع الملفات", facilities: "المنشآت", appointments: "المواعيد", billing: "حسابات الفوترة", live: "داخلي", blocked: "محظور",
        noScope: "يرجى اختيار مؤسسة وفرع واختصاص صالحين أولاً.", requestTitle: "طلب موعد داخلي", requestHelp: "يسجل الطلب داخل النطاق الحالي فقط. لا يرسل هذا النموذج حجزاً أو بيانات إلى خدمة خارجية.", facility: "المنشأة ضمن النطاق", patientRecord: "مرجع الملف الطبي المحلي", scheduledAt: "الموعد المطلوب", specialty: "التخصص", specialtyPlaceholder: "مثال: عيادة باطنة", selectFacility: "اختر المنشأة", selectRecord: "اختر المرجع", submitRequest: "تسجيل طلب الموعد", requestPending: "جارٍ تسجيل الطلب…", requestSuccess: "تم تسجيل طلب الموعد الداخلي بنجاح.", requestError: "تعذر تسجيل الطلب. راجع النطاق والبيانات ثم حاول مرة أخرى.", invalidRequest: "اختر المنشأة والملف الطبي والموعد والتخصص قبل الإرسال.", appointmentReferencesLoading: "جارٍ تحميل المنشآت ومراجع الملفات الطبية داخل النطاق…", appointmentReferencesError: "تعذر تحميل مراجع نموذج الموعد حالياً.", appointmentReferencesRetry: "إعادة محاولة تحميل المراجع", noAppointmentReferences: "لا توجد منشآت أو مراجع ملفات طبية نشطة ومتاحة ضمن هذا النطاق.",
        clinicSummaryTitle: "ملخص تشغيل العيادة", clinicSummaryHelp: "أرقام تجميعية داخل النطاق فقط؛ لا تُعرض هوية مريض أو تفاصيل مالية فردية.", clinicSummaryLoading: "جارٍ تحميل الملخص التجميعي…", clinicSummaryError: "تعذر تحميل ملخص العيادة حالياً.", clinicSummaryUnavailable: "ملخص العيادة غير متاح ضمن هذا النطاق حالياً.", clinicSummaryRetry: "إعادة محاولة تحميل الملخص", summaryGeneratedAt: "وقت إنشاء الملخص (UTC)", summaryAppointments: "طلبات المواعيد", summaryAppointmentDetail: "{requested} مطلوب · {confirmed} مؤكد", summaryAppointmentLifecycleDetail: "{cancelled} ملغى · {noShow} عدم حضور · {checkedIn} مسجل الحضور · {completed} مكتمل تشغيلياً", summaryBilling: "حسابات الفوترة الداخلية", summaryBillingDetail: "{pending} بانتظار الاعتماد", summaryExternal: "العمليات الخارجية", summaryExternalDetail: "تظل غير مفعلة ضمن هذا المسار.", exportSummary: "تصدير CSV تجميعي", exportSummaryHelp: "ينشئ ملفاً محلياً من العدادات المعروضة فقط؛ لا يرسل بيانات أو ينفذ استعلاماً جديداً.",
        patientFoundationTitle: "أساس سجل المريض الداخلي", patientFoundationHelp: "يعرض مرجع الملف المحلي وحالة الموافقة والنشاط وأعداد التشغيل داخل النطاق فقط. لا يعرض هذا الأساس اسماً أو ملاحظات سريرية أو تشخيصات أو تفاصيل فوترة.", patientFoundationSelect: "مرجع الملف الطبي المحلي", patientFoundationPlaceholder: "اختر مرجع الملف", patientFoundationEmpty: "اختر مرجع ملف طبي لعرض أساس السجل التشغيلي المحدود.", patientFoundationUnavailable: "لا توجد مراجع ملفات طبية نشطة ضمن هذا النطاق.", patientFoundationLoading: "جارٍ تحميل مراجع الملفات الطبية النشطة داخل النطاق…", patientFoundationError: "تعذر تحميل مراجع سجل المريض حالياً.", patientFoundationRetry: "إعادة محاولة تحميل المراجع", patientFoundationCountsLoading: "جارٍ تحميل الأعداد التشغيلية المحدودة ضمن النطاق…", patientFoundationCountsError: "تعذر تحميل الأعداد التشغيلية المحدودة حالياً.", patientFoundationCountsUnavailable: "لا تتوافر الأعداد التشغيلية المحدودة لهذا المرجع ضمن النطاق حالياً. لا تُعرض قيمة بديلة.", patientFoundationCountsRetry: "إعادة محاولة تحميل الأعداد", patientFoundationConsent: "حالة الموافقة", patientFoundationActivity: "الحالة", patientFoundationActive: "نشط", patientFoundationAppointments: "مواعيد ضمن النطاق", patientFoundationEncounters: "سجلات مقابلات ضمن النطاق",
        billingIntakeTitle: "فتح حساب فوترة داخلي", billingIntakeHelp: "ينشئ هذا النموذج مسودة حساب داخل النطاق وبانتظار الاعتماد. لا ينشئ فاتورة أو تحصيلاً أو مطالبة تأمين أو إرسالاً خارجياً.", billingPayerType: "نوع الجهة الدافعة", billingPayerSelf: "دفع ذاتي", billingPayerInsurance: "تأمين", billingPayerGovernment: "جهة حكومية", billingPayerEmployer: "صاحب عمل", billingPackageCode: "رمز الباقة الداخلي (اختياري)", billingDeposit: "مبلغ الإيداع الداخلي (اختياري)", billingAmount: "المبلغ الداخلي المسجل (اختياري)", billingEncounter: "مقابلة مطابقة (اختياري)", billingNoEncounter: "بدون مقابلة", billingSubmit: "إنشاء حساب داخلي", billingPending: "جارٍ إنشاء الحساب…", billingSuccess: "تم إنشاء حساب الفوترة الداخلي كمسودة بانتظار الاعتماد.", billingError: "تعذر إنشاء الحساب الداخلي. راجع النطاق والمراجع المخولة ثم حاول مرة أخرى.", billingInvalid: "اختر المنشأة ومرجع الملف ونوع الجهة الدافعة، واستخدم مبالغ صحيحة من منزلتين عشريتين كحد أقصى.", billingReferencesLoading: "جارٍ تحميل المنشآت ومراجع الملفات الطبية لنموذج الحساب الداخلي…", billingReferencesError: "تعذر تحميل مراجع نموذج الحساب الداخلي حالياً.", billingReferencesRetry: "إعادة محاولة تحميل المراجع", billingUnavailable: "لا توجد منشآت أو مراجع ملفات طبية نشطة ومتاحة لفتح حساب داخلي ضمن هذا النطاق.",
        confirmationTitle: "تأكيد موعد داخلي", confirmationHelp: "يؤكد هذا الإجراء طلباً داخلياً ضمن النطاق فقط. لا يرسل تقويماً أو رسالة لمزوّد أو مريض، ولا ينشئ حجزاً عاماً.", confirmationEmpty: "لا توجد طلبات مواعيد داخلية بانتظار التأكيد ضمن هذا النطاق.", confirmationSubmit: "تأكيد داخلي", confirmationPending: "جارٍ التأكيد…", confirmationSuccess: "تم تأكيد الموعد داخلياً ضمن النطاق.", confirmationError: "تعذر تأكيد الموعد. راجع الصلاحية والحالة ثم حاول مرة أخرى.", cancellationTitle: "إلغاء موعد داخلي", cancellationHelp: "يلغي هذا الإجراء موعداً مطلوباً أو مؤكداً داخل النطاق فقط. لا يرسل رسالة أو تقويماً أو إشعاراً للمزوّد أو المريض، ولا يغير حجزاً عاماً.", cancellationEmpty: "لا توجد مواعيد داخلية مطلوبة أو مؤكدة متاحة للإلغاء ضمن هذا النطاق.", cancellationSubmit: "إلغاء داخلي", cancellationPending: "جارٍ الإلغاء…", cancellationSuccess: "تم إلغاء الموعد داخلياً ضمن النطاق.", cancellationError: "تعذر إلغاء الموعد. راجع الصلاحية والحالة ثم حاول مرة أخرى.", checkInTitle: "تسجيل حضور داخلي", checkInHelp: "يسجل هذا الإجراء حضور موعد مؤكد داخل النطاق فقط. لا يضيف ملاحظة سريرية أو دليلاً للحضور، ولا يرسل رسالة أو تقويماً أو إشعاراً للمزوّد أو المريض، ولا يغير حجزاً عاماً.", checkInEmpty: "لا توجد مواعيد داخلية مؤكدة متاحة لتسجيل الحضور ضمن هذا النطاق.", checkInSubmit: "تسجيل الحضور", checkInPending: "جارٍ تسجيل الحضور…", checkInSuccess: "تم تسجيل حضور الموعد داخلياً ضمن النطاق.", checkInError: "تعذر تسجيل الحضور. راجع الصلاحية والحالة ثم حاول مرة أخرى.", noShowTitle: "تسجيل عدم حضور داخلي", noShowHelp: "يسجل هذا الإجراء عدم حضور موعد مؤكد داخل النطاق فقط. لا يرسل رسالة أو تقويماً أو إشعاراً للمزوّد أو المريض، ولا يغير حجزاً عاماً.", noShowEmpty: "لا توجد مواعيد داخلية مؤكدة متاحة لتسجيل عدم الحضور ضمن هذا النطاق.", noShowSubmit: "تسجيل عدم الحضور", noShowPending: "جارٍ التسجيل…", noShowSuccess: "تم تسجيل عدم حضور الموعد داخلياً ضمن النطاق.", noShowError: "تعذر تسجيل عدم الحضور. راجع الصلاحية والحالة ثم حاول مرة أخرى.", appointmentReference: "موعد داخلي رقم {id}",
      }
    : {
        title: "Healthcare workspace", subtitle: "Internal operations dashboard scoped to the organization, branch, and jurisdiction.", patients: "Record references", facilities: "Facilities", appointments: "Appointments", billing: "Billing accounts", live: "Internal", blocked: "Blocked",
        noScope: "Select a valid organization, branch, and jurisdiction first.", requestTitle: "Internal appointment request", requestHelp: "This request is recorded only within the current scope. No external request is sent.", facility: "In-scope facility", patientRecord: "Local medical-record reference", scheduledAt: "Requested time", specialty: "Specialty", specialtyPlaceholder: "Example: Internal medicine", selectFacility: "Select facility", selectRecord: "Select reference", submitRequest: "Record appointment request", requestPending: "Recording request…", requestSuccess: "The internal appointment request was recorded.", requestError: "The request could not be recorded. Check the scope and inputs, then try again.", invalidRequest: "Choose a facility, medical-record reference, requested time, and specialty before submitting.", appointmentReferencesLoading: "Loading in-scope facilities and medical-record references…", appointmentReferencesError: "The appointment-form references are unavailable right now.", appointmentReferencesRetry: "Retry reference load", noAppointmentReferences: "No active facility or medical-record references are available in this scope.",
        clinicSummaryTitle: "Clinic operations summary", clinicSummaryHelp: "Scoped aggregate counts only; no patient identity or individual financial detail is displayed.", clinicSummaryLoading: "Loading the aggregate summary…", clinicSummaryError: "The clinic summary is unavailable right now.", clinicSummaryUnavailable: "No clinic summary is available in this scope right now.", clinicSummaryRetry: "Retry summary load", summaryGeneratedAt: "Summary generated at (UTC)", summaryAppointments: "Appointment requests", summaryAppointmentDetail: "{requested} requested · {confirmed} confirmed", summaryAppointmentLifecycleDetail: "{cancelled} cancelled · {noShow} no-show · {checkedIn} checked in · {completed} operationally completed", summaryBilling: "Internal billing accounts", summaryBillingDetail: "{pending} pending approval", summaryExternal: "External operations", summaryExternalDetail: "They remain disabled in this workflow.", exportSummary: "Export aggregate CSV", exportSummaryHelp: "Creates a local file from the displayed counts only; it sends no data and runs no new query.",
        patientFoundationTitle: "Internal patient-record foundation", patientFoundationHelp: "It shows the local record reference, consent/activity status, and scoped operational counts only. This foundation does not display a name, clinical notes, diagnoses, or billing detail.", patientFoundationSelect: "Local medical-record reference", patientFoundationPlaceholder: "Select a record reference", patientFoundationEmpty: "Select a medical-record reference to view the limited operational record foundation.", patientFoundationUnavailable: "No active medical-record references are available in this scope.", patientFoundationLoading: "Loading active medical-record references in this scope…", patientFoundationError: "The patient-record references are unavailable right now.", patientFoundationRetry: "Retry reference load", patientFoundationCountsLoading: "Loading the limited operational counts in this scope…", patientFoundationCountsError: "The limited operational counts are unavailable right now.", patientFoundationCountsUnavailable: "The limited operational counts are not available for this reference in this scope right now. No substitute value is displayed.", patientFoundationCountsRetry: "Retry count load", patientFoundationConsent: "Consent status", patientFoundationActivity: "Activity", patientFoundationActive: "Active", patientFoundationAppointments: "In-scope appointments", patientFoundationEncounters: "In-scope encounter records",
        billingIntakeTitle: "Open internal billing account", billingIntakeHelp: "This form creates a scoped draft pending approval. It does not create an invoice, collect payment, submit insurance, or send anything externally.", billingPayerType: "Payer type", billingPayerSelf: "Self pay", billingPayerInsurance: "Insurance", billingPayerGovernment: "Government", billingPayerEmployer: "Employer", billingPackageCode: "Internal package code (optional)", billingDeposit: "Internal deposit amount (optional)", billingAmount: "Recorded internal amount (optional)", billingEncounter: "Matching encounter (optional)", billingNoEncounter: "No encounter", billingSubmit: "Create internal account", billingPending: "Creating account…", billingSuccess: "The internal billing account was created as a draft pending approval.", billingError: "The internal account could not be created. Check the scope and authorized references, then try again.", billingInvalid: "Choose a facility, record reference, and payer type, and use valid amounts with up to two decimal places.", billingReferencesLoading: "Loading in-scope facilities and medical-record references for the internal account form…", billingReferencesError: "The internal-account references are unavailable right now.", billingReferencesRetry: "Retry reference load", billingUnavailable: "No active facility or medical-record reference is available to open an internal account in this scope.",
        confirmationTitle: "Confirm internal appointment", confirmationHelp: "This action confirms a requested appointment only within the current scope. It does not send a calendar entry or message to a provider or patient, and it does not create public booking.", confirmationEmpty: "No internal appointment requests are awaiting confirmation in this scope.", confirmationSubmit: "Confirm internally", confirmationPending: "Confirming…", confirmationSuccess: "The appointment was confirmed internally within the active scope.", confirmationError: "The appointment could not be confirmed. Check the permission and current state, then try again.", cancellationTitle: "Cancel internal appointment", cancellationHelp: "This action cancels a requested or confirmed appointment only within the current scope. It does not send a message, calendar entry, or notification to a provider or patient, and it does not alter public booking.", cancellationEmpty: "No requested or confirmed internal appointments are available to cancel in this scope.", cancellationSubmit: "Cancel internally", cancellationPending: "Cancelling…", cancellationSuccess: "The appointment was cancelled internally within the active scope.", cancellationError: "The appointment could not be cancelled. Check the permission and current state, then try again.", checkInTitle: "Record internal check-in", checkInHelp: "This action records check-in only for a confirmed appointment within the current scope. It does not add clinical narrative or attendance evidence, and it does not send a message, calendar entry, or notification to a provider or patient, or alter public booking.", checkInEmpty: "No confirmed internal appointments are available to record as checked in within this scope.", checkInSubmit: "Record check-in", checkInPending: "Recording check-in…", checkInSuccess: "The appointment check-in was recorded internally within the active scope.", checkInError: "The appointment check-in could not be recorded. Check the permission and current state, then try again.", noShowTitle: "Record internal no-show", noShowHelp: "This action records no-show only for a confirmed appointment within the current scope. It does not send a message, calendar entry, or notification to a provider or patient, and it does not alter public booking.", noShowEmpty: "No confirmed internal appointments are available to record as no-show in this scope.", noShowSubmit: "Record no-show", noShowPending: "Recording…", noShowSuccess: "The appointment no-show was recorded internally within the active scope.", noShowError: "The appointment no-show could not be recorded. Check the permission and current state, then try again.", appointmentReference: "Internal appointment #{id}",
      };

  const completionCopy = ar
    ? { title: "إتمام موعد داخلي", help: "يسجل هذا الإجراء اكتمالاً تشغيلياً فقط لموعد تم تسجيل حضوره داخل النطاق. لا ينشئ مقابلة أو سرداً سريرياً أو دليلاً للحضور أو رسوماً أو فاتورة أو تحصيلاً، ولا يرسل رسالة أو تقويماً أو إشعاراً، ولا يغير حجزاً عاماً.", empty: "لا توجد مواعيد داخلية مسجلة الحضور متاحة للإتمام ضمن هذا النطاق.", submit: "إتمام تشغيلي", pending: "جارٍ تسجيل الإتمام…", success: "تم تسجيل اكتمال الموعد تشغيلياً ضمن النطاق.", error: "تعذر إتمام الموعد. راجع الصلاحية والحالة ثم حاول مرة أخرى." }
    : { title: "Complete internal appointment", help: "This action records an operational completion only for a checked-in appointment within the current scope. It does not create an encounter, clinical narrative, attendance evidence, charge, invoice, or collection; it does not send a message, calendar entry, or notification, and it does not alter public booking.", empty: "No checked-in internal appointments are available to complete in this scope.", submit: "Complete operationally", pending: "Recording completion…", success: "The appointment completion was recorded operationally within the active scope.", error: "The appointment could not be completed. Check the permission and current state, then try again." };

  const appointmentTransitionCopy = ar
    ? { loading: "جارٍ تحميل قوائم انتقالات المواعيد الداخلية…", error: "تعذر تحميل قوائم انتقالات المواعيد حالياً.", retry: "إعادة محاولة تحميل القوائم", unavailable: "لا تتوافر قوائم انتقالات المواعيد لهذا النطاق حالياً. لا يظهر أي تحكم انتقالي." }
    : { loading: "Loading internal appointment-transition lists…", error: "The appointment-transition lists are unavailable right now.", retry: "Retry list load", unavailable: "Appointment-transition lists are not available for this scope right now. No transition control is shown." };

  const billingEncounterReferenceCopy = ar
    ? { loading: "جارٍ تحميل مراجع المقابلات المطابقة الاختيارية داخل النطاق…", error: "تعذر تحميل مراجع المقابلات المطابقة حالياً.", retry: "إعادة محاولة تحميل مراجع المقابلات", unavailable: "لا تتوافر مراجع مقابلات مطابقة لهذا النطاق حالياً. يظل إنشاء الحساب الداخلي متاحاً بدون مقابلة." }
    : { loading: "Loading optional matching encounter references in this scope…", error: "Matching encounter references are unavailable right now.", retry: "Retry encounter-reference load", unavailable: "Matching encounter references are not available for this scope right now. The internal account can still be created without an encounter." };

  const operationalCounterCopy = ar
    ? { loading: "جارٍ تحميل العدادات التشغيلية المقيدة…", error: "تعذر تحميل عداد تشغيلي واحد أو أكثر حالياً.", retry: "إعادة محاولة العدادات الفاشلة", unavailable: "لا تتوافر عدادات تشغيلية كاملة لهذا النطاق حالياً. لا تُعرض قيمة بديلة." }
    : { loading: "Loading the scoped operational counters…", error: "One or more operational counters are unavailable right now.", retry: "Retry failed counters", unavailable: "Complete operational counters are not available for this scope right now. No substitute value is shown." };

  const canRead = hasOrganizationBranchJurisdictionScope(organizationId, branchId, jurisdictionId);
  const scope = { organizationId: organizationId ?? 0, branchId: branchId ?? 0, jurisdictionId: jurisdictionId ?? 0 };
  const queryOptions = { enabled: canRead };
  const utils = trpc.useUtils();
  const patientsQuery = trpc.egyptHealthcare.patients.useQuery(scope, queryOptions);
  const facilitiesQuery = trpc.egyptHealthcare.facilities.useQuery(scope, queryOptions);
  const appointmentsQuery = trpc.egyptHealthcare.appointments.useQuery(scope, queryOptions);
  const encountersQuery = trpc.egyptHealthcare.encounters.useQuery(scope, queryOptions);
  const billingAccountsQuery = trpc.egyptHealthcare.billingAccounts.useQuery(scope, queryOptions);
  const clinicSummaryQuery = trpc.egyptHealthcare.clinicOperationsSummary.useQuery(scope, queryOptions);
  const createAppointment = trpc.egyptHealthcare.createAppointment.useMutation();
  const confirmAppointment = trpc.egyptHealthcare.confirmAppointment.useMutation();
  const cancelAppointment = trpc.egyptHealthcare.cancelAppointment.useMutation();
  const markAppointmentNoShow = trpc.egyptHealthcare.markAppointmentNoShow.useMutation();
  const checkInAppointment = trpc.egyptHealthcare.checkInAppointment.useMutation();
  const completeAppointment = trpc.egyptHealthcare.completeAppointment.useMutation();
  const createBillingAccount = trpc.egyptHealthcare.createBillingAccount.useMutation();
  const [appointmentDraft, setAppointmentDraft] = useState({ facilityId: "", patientId: "", scheduledAt: "", specialty: "" });
  const [appointmentFormError, setAppointmentFormError] = useState<string | null>(null);
  const [confirmedAppointmentId, setConfirmedAppointmentId] = useState<number | null>(null);
  const [cancelledAppointmentId, setCancelledAppointmentId] = useState<number | null>(null);
  const [noShowAppointmentId, setNoShowAppointmentId] = useState<number | null>(null);
  const [checkedInAppointmentId, setCheckedInAppointmentId] = useState<number | null>(null);
  const [completedAppointmentId, setCompletedAppointmentId] = useState<number | null>(null);
  const [billingDraft, setBillingDraft] = useState({ facilityId: "", patientId: "", encounterId: "", payerType: "self_pay" as "self_pay" | "insurance" | "government" | "employer", packageCode: "", depositAmount: "", billedAmount: "" });
  const [billingFormError, setBillingFormError] = useState<string | null>(null);
  const [selectedPatientId, setSelectedPatientId] = useState("");
  const appointmentReferencesAvailable = (patientsQuery.data?.length ?? 0) > 0 && (facilitiesQuery.data?.length ?? 0) > 0;
  const appointmentReferencesLoading = patientsQuery.isLoading || facilitiesQuery.isLoading;
  const appointmentReferencesFailed = patientsQuery.isError || facilitiesQuery.isError;
  const failedFormReferencesFetching = (patientsQuery.isError && patientsQuery.isFetching) || (facilitiesQuery.isError && facilitiesQuery.isFetching);
  const operationalCountersLoading = patientsQuery.isLoading || facilitiesQuery.isLoading || appointmentsQuery.isLoading || billingAccountsQuery.isLoading;
  const operationalCountersFailed = patientsQuery.isError || facilitiesQuery.isError || appointmentsQuery.isError || billingAccountsQuery.isError;
  const operationalCountersUnavailable = !operationalCountersLoading && !operationalCountersFailed && (!patientsQuery.data || !facilitiesQuery.data || !appointmentsQuery.data || !billingAccountsQuery.data);
  const operationalCountersFetching = (patientsQuery.isError && patientsQuery.isFetching) || (facilitiesQuery.isError && facilitiesQuery.isFetching) || (appointmentsQuery.isError && appointmentsQuery.isFetching) || (billingAccountsQuery.isError && billingAccountsQuery.isFetching);
  const patientFoundationReferencesLoading = patientsQuery.isLoading;
  const patientFoundationReferencesFailed = patientsQuery.isError;
  const billingReferencesAvailable = appointmentReferencesAvailable;
  const billingReferencesLoading = facilitiesQuery.isLoading || patientsQuery.isLoading;
  const billingReferencesFailed = facilitiesQuery.isError || patientsQuery.isError;
  const billingEncounterReferencesLoading = encountersQuery.isLoading;
  const billingEncounterReferencesFailed = encountersQuery.isError;
  const billingEncounterReferencesUnavailable = !billingEncounterReferencesLoading && !billingEncounterReferencesFailed && !encountersQuery.data;
  const billingEncounterReferencesReady = !billingEncounterReferencesLoading && !billingEncounterReferencesFailed && Boolean(encountersQuery.data);
  const appointmentTransitionsLoading = appointmentsQuery.isLoading;
  const appointmentTransitionsFailed = appointmentsQuery.isError;
  const appointmentTransitionsUnavailable = !appointmentTransitionsLoading && !appointmentTransitionsFailed && !appointmentsQuery.data;
  const clinicSummary = clinicSummaryQuery.data;
  const clinicSummaryLoading = clinicSummaryQuery.isLoading;
  const clinicSummaryFailed = clinicSummaryQuery.isError;
  const clinicSummaryUnavailable = !clinicSummaryLoading && !clinicSummaryFailed && !clinicSummary;
  const clinicSummaryReady = Boolean(clinicSummary);
  const appointmentSummaryDetail = clinicSummary
    ? `${copy.summaryAppointmentDetail.replace("{requested}", String(clinicSummary.appointments.requested)).replace("{confirmed}", String(clinicSummary.appointments.confirmed))} · ${copy.summaryAppointmentLifecycleDetail.replace("{cancelled}", String(clinicSummary.appointments.cancelled)).replace("{noShow}", String(clinicSummary.appointments.noShow)).replace("{checkedIn}", String(clinicSummary.appointments.checkedIn)).replace("{completed}", String(clinicSummary.appointments.completed))}`
    : "";

  const exportClinicSummary = () => {
    if (!clinicSummary) return;
    const rows = [
      [ar ? "وقت إنشاء التقرير" : "Report generated at", clinicSummary.generatedAt],
      [copy.summaryAppointments, String(clinicSummary.appointments.total)],
      [ar ? "مطلوب" : "Requested", String(clinicSummary.appointments.requested)],
      [ar ? "مؤكد" : "Confirmed", String(clinicSummary.appointments.confirmed)],
      [ar ? "ملغى" : "Cancelled", String(clinicSummary.appointments.cancelled)],
      [ar ? "عدم حضور" : "No-show", String(clinicSummary.appointments.noShow)],
      [ar ? "مسجل الحضور" : "Checked in", String(clinicSummary.appointments.checkedIn)],
      [ar ? "مكتمل تشغيلياً" : "Operationally completed", String(clinicSummary.appointments.completed)],
      [copy.summaryBilling, String(clinicSummary.billingAccounts.total)],
      [ar ? "حسابات بانتظار الاعتماد" : "Accounts pending approval", String(clinicSummary.billingAccounts.pendingApproval)],
    ];
    const blob = new Blob([`\ufeff${rows.map(row => row.map(value => `"${value.replace(/"/g, '""')}"`).join(",")).join("\n")}\n`], { type: "text/csv;charset=utf-8" });
    const downloadUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = "clinic-operations-summary.csv";
    link.click();
    URL.revokeObjectURL(downloadUrl);
  };
  const selectedPatient = (patientsQuery.data ?? []).find(patient => patient.id === Number(selectedPatientId));
  const selectedPatientAppointments = (appointmentsQuery.data ?? []).filter(appointment => appointment.patientId === selectedPatient?.id);
  const selectedPatientEncounters = (encountersQuery.data ?? []).filter(encounter => encounter.patientId === selectedPatient?.id);
  const patientFoundationCountsLoading = Boolean(selectedPatient) && (appointmentsQuery.isLoading || encountersQuery.isLoading);
  const patientFoundationCountsFailed = Boolean(selectedPatient) && (appointmentsQuery.isError || encountersQuery.isError);
  const patientFoundationCountsUnavailable = Boolean(selectedPatient) && !patientFoundationCountsLoading && !patientFoundationCountsFailed && (!appointmentsQuery.data || !encountersQuery.data);
  const patientFoundationCountsFetching = Boolean(selectedPatient) && ((appointmentsQuery.isError && appointmentsQuery.isFetching) || (encountersQuery.isError && encountersQuery.isFetching));
  const matchingBillingEncounters = billingEncounterReferencesReady ? (encountersQuery.data ?? []).filter(encounter => encounter.patientId === Number(billingDraft.patientId) && encounter.facilityId === Number(billingDraft.facilityId)) : [];
  const requestedAppointments = (appointmentsQuery.data ?? []).filter(appointment => appointment.status === "requested");
  const cancellableAppointments = (appointmentsQuery.data ?? []).filter(appointment => appointment.status === "requested" || appointment.status === "confirmed");
  const confirmedAppointments = (appointmentsQuery.data ?? []).filter(appointment => appointment.status === "confirmed");
  const checkedInAppointments = (appointmentsQuery.data ?? []).filter(appointment => appointment.status === "checked_in");

  const retryFailedOperationalCounters = () => {
    if (patientsQuery.isError) void patientsQuery.refetch();
    if (facilitiesQuery.isError) void facilitiesQuery.refetch();
    if (appointmentsQuery.isError) void appointmentsQuery.refetch();
    if (billingAccountsQuery.isError) void billingAccountsQuery.refetch();
  };

  const retryFailedPatientFoundationCounts = () => {
    if (appointmentsQuery.isError) void appointmentsQuery.refetch();
    if (encountersQuery.isError) void encountersQuery.refetch();
  };

  const retryFailedFormReferences = () => {
    if (patientsQuery.isError) void patientsQuery.refetch();
    if (facilitiesQuery.isError) void facilitiesQuery.refetch();
  };

  const renderBillingEncounterReference = () => {
    if (billingEncounterReferencesLoading) return <p className="rounded-md border border-slate-200 bg-slate-50 p-3 text-sm text-muted-foreground dark:border-slate-800 dark:bg-slate-900" role="status">{billingEncounterReferenceCopy.loading}</p>;
    if (billingEncounterReferencesFailed) return <div className="flex flex-wrap items-center gap-3" role="alert"><p className="text-sm text-amber-700 dark:text-amber-300">{billingEncounterReferenceCopy.error}</p><Button type="button" size="sm" variant="outline" onClick={() => void encountersQuery.refetch()} disabled={encountersQuery.isFetching}>{billingEncounterReferenceCopy.retry}</Button></div>;
    if (billingEncounterReferencesUnavailable) return <p className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-200" role="status">{billingEncounterReferenceCopy.unavailable}</p>;
    return <label className="grid gap-2 text-sm font-medium" htmlFor="billing-encounter">{copy.billingEncounter}<select id="billing-encounter" className="h-10 rounded-md border border-input bg-background px-3 text-sm" value={billingDraft.encounterId} onChange={event => setBillingDraft(current => ({ ...current, encounterId: event.target.value }))}><option value="">{copy.billingNoEncounter}</option>{matchingBillingEncounters.map(encounter => <option key={encounter.id} value={encounter.id}>{ar ? `مقابلة رقم ${encounter.id}` : `Encounter #${encounter.id}`}</option>)}</select></label>;
  };

  const renderAppointmentTransitionReadState = () => {
    if (appointmentTransitionsLoading) return <p className="rounded-md border border-slate-200 bg-slate-50 p-3 text-sm text-muted-foreground dark:border-slate-800 dark:bg-slate-900" role="status">{appointmentTransitionCopy.loading}</p>;
    if (appointmentTransitionsFailed) return <div className="flex flex-wrap items-center gap-3" role="alert"><p className="text-sm text-amber-700 dark:text-amber-300">{appointmentTransitionCopy.error}</p><Button type="button" size="sm" variant="outline" onClick={() => void appointmentsQuery.refetch()} disabled={appointmentsQuery.isFetching}>{appointmentTransitionCopy.retry}</Button></div>;
    if (appointmentTransitionsUnavailable) return <p className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-200" role="status">{appointmentTransitionCopy.unavailable}</p>;
    return null;
  };

  const submitAppointmentRequest = () => {
    if (!appointmentDraft.facilityId || !appointmentDraft.patientId || !appointmentDraft.scheduledAt || appointmentDraft.specialty.trim().length < 2) {
      setAppointmentFormError(copy.invalidRequest);
      return;
    }
    setAppointmentFormError(null);
    createAppointment.mutate({ ...scope, facilityId: Number(appointmentDraft.facilityId), patientId: Number(appointmentDraft.patientId), scheduledAt: new Date(appointmentDraft.scheduledAt), specialty: appointmentDraft.specialty.trim() }, {
      onSuccess: () => {
        setAppointmentDraft(current => ({ ...current, scheduledAt: "", specialty: "" }));
        void utils.egyptHealthcare.appointments.invalidate(scope);
        void utils.egyptHealthcare.clinicOperationsSummary.invalidate(scope);
      },
    });
  };

  const submitBillingAccount = () => {
    const validAmount = (value: string) => value === "" || /^\d+(\.\d{1,2})?$/.test(value);
    if (!billingDraft.facilityId || !billingDraft.patientId || !validAmount(billingDraft.depositAmount) || !validAmount(billingDraft.billedAmount)) {
      setBillingFormError(copy.billingInvalid);
      return;
    }
    setBillingFormError(null);
    createBillingAccount.mutate({ ...scope, facilityId: Number(billingDraft.facilityId), patientId: Number(billingDraft.patientId), encounterId: billingEncounterReferencesReady && billingDraft.encounterId ? Number(billingDraft.encounterId) : undefined, payerType: billingDraft.payerType, packageCode: billingDraft.packageCode.trim() || undefined, depositAmount: billingDraft.depositAmount || undefined, billedAmount: billingDraft.billedAmount || undefined }, {
      onSuccess: () => {
        setBillingDraft(current => ({ ...current, encounterId: "", packageCode: "", depositAmount: "", billedAmount: "" }));
        void utils.egyptHealthcare.billingAccounts.invalidate(scope);
        void utils.egyptHealthcare.clinicOperationsSummary.invalidate(scope);
      },
    });
  };

  const confirmInternalAppointment = (appointmentId: number) => {
    setConfirmedAppointmentId(null);
    confirmAppointment.mutate({ ...scope, appointmentId }, {
      onSuccess: () => {
        setConfirmedAppointmentId(appointmentId);
        void utils.egyptHealthcare.appointments.invalidate(scope);
        void utils.egyptHealthcare.clinicOperationsSummary.invalidate(scope);
      },
    });
  };

  const cancelInternalAppointment = (appointmentId: number) => {
    setCancelledAppointmentId(null);
    cancelAppointment.mutate({ ...scope, appointmentId }, {
      onSuccess: () => {
        setCancelledAppointmentId(appointmentId);
        void utils.egyptHealthcare.appointments.invalidate(scope);
        void utils.egyptHealthcare.clinicOperationsSummary.invalidate(scope);
      },
    });
  };

  const markInternalAppointmentNoShow = (appointmentId: number) => {
    setNoShowAppointmentId(null);
    markAppointmentNoShow.mutate({ ...scope, appointmentId }, {
      onSuccess: () => {
        setNoShowAppointmentId(appointmentId);
        void utils.egyptHealthcare.appointments.invalidate(scope);
        void utils.egyptHealthcare.clinicOperationsSummary.invalidate(scope);
      },
    });
  };

  const checkInInternalAppointment = (appointmentId: number) => {
    setCheckedInAppointmentId(null);
    checkInAppointment.mutate({ ...scope, appointmentId }, {
      onSuccess: () => {
        setCheckedInAppointmentId(appointmentId);
        void utils.egyptHealthcare.appointments.invalidate(scope);
        void utils.egyptHealthcare.clinicOperationsSummary.invalidate(scope);
      },
    });
  };

  const completeInternalAppointment = (appointmentId: number) => {
    setCompletedAppointmentId(null);
    completeAppointment.mutate({ ...scope, appointmentId }, {
      onSuccess: () => {
        setCompletedAppointmentId(appointmentId);
        void utils.egyptHealthcare.appointments.invalidate(scope);
        void utils.egyptHealthcare.clinicOperationsSummary.invalidate(scope);
      },
    });
  };

  if (!canRead) {
    return <Card className="border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/30"><CardContent className="p-5 text-sm text-amber-900 dark:text-amber-100">{copy.noScope}</CardContent></Card>;
  }

  return (
    <section className="space-y-5" aria-label={copy.title} dir={ar ? "rtl" : "ltr"}>
      <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div><h2 className="text-2xl font-bold tracking-tight">{copy.title}</h2><p className="mt-1 max-w-3xl text-sm text-muted-foreground">{copy.subtitle}</p></div>
        <Badge variant="outline" className="w-fit gap-2 border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-200"><span className="h-2 w-2 rounded-full bg-emerald-500" aria-hidden="true" />{copy.live}</Badge>
      </header>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <CountCard title={copy.patients} value={patientsQuery.data?.length ?? "—"} detail={patientsQuery.isLoading ? operationalCounterCopy.loading : patientsQuery.isError ? operationalCounterCopy.error : !patientsQuery.data ? operationalCounterCopy.unavailable : copy.subtitle} />
        <CountCard title={copy.facilities} value={facilitiesQuery.data?.length ?? "—"} detail={facilitiesQuery.isLoading ? operationalCounterCopy.loading : facilitiesQuery.isError ? operationalCounterCopy.error : !facilitiesQuery.data ? operationalCounterCopy.unavailable : copy.subtitle} />
        <CountCard title={copy.appointments} value={appointmentsQuery.data?.length ?? "—"} detail={appointmentsQuery.isLoading ? operationalCounterCopy.loading : appointmentsQuery.isError ? operationalCounterCopy.error : !appointmentsQuery.data ? operationalCounterCopy.unavailable : copy.subtitle} />
        <CountCard title={copy.billing} value={billingAccountsQuery.data?.length ?? "—"} detail={billingAccountsQuery.isLoading ? operationalCounterCopy.loading : billingAccountsQuery.isError ? operationalCounterCopy.error : !billingAccountsQuery.data ? operationalCounterCopy.unavailable : copy.subtitle} />
      </div>

      {operationalCountersLoading ? <p className="text-sm text-muted-foreground" role="status">{operationalCounterCopy.loading}</p> : operationalCountersFailed ? <div className="flex flex-wrap items-center gap-3" role="alert"><p className="text-sm text-amber-700 dark:text-amber-300">{operationalCounterCopy.error}</p><Button type="button" size="sm" variant="outline" onClick={retryFailedOperationalCounters} disabled={operationalCountersFetching}>{operationalCounterCopy.retry}</Button></div> : operationalCountersUnavailable ? <p className="text-sm text-amber-700 dark:text-amber-300" role="status">{operationalCounterCopy.unavailable}</p> : null}

      <Card className="border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <CardHeader><div className="flex flex-wrap items-center justify-between gap-2"><div><CardTitle>{copy.clinicSummaryTitle}</CardTitle><p className="mt-1 text-sm text-muted-foreground">{copy.clinicSummaryHelp}</p></div><div className="flex flex-wrap items-center gap-2"><Badge variant="outline" className="border-slate-300 text-slate-700 dark:border-slate-700 dark:text-slate-200">{copy.blocked}</Badge><Button type="button" size="sm" variant="outline" onClick={exportClinicSummary} disabled={!clinicSummaryReady}>{copy.exportSummary}</Button></div></div></CardHeader>
        <CardContent className="space-y-3">
          {clinicSummary && <p className="text-xs text-muted-foreground">{copy.exportSummaryHelp}</p>}
          {clinicSummaryLoading ? <p className="text-sm text-muted-foreground">{copy.clinicSummaryLoading}</p> : clinicSummaryFailed ? <div className="flex flex-wrap items-center gap-3" role="alert"><p className="text-sm text-amber-700 dark:text-amber-300">{copy.clinicSummaryError}</p><Button type="button" size="sm" variant="outline" onClick={() => void clinicSummaryQuery.refetch()} disabled={clinicSummaryQuery.isFetching}>{copy.clinicSummaryRetry}</Button></div> : clinicSummaryUnavailable ? <p className="text-sm text-amber-700 dark:text-amber-300" role="status">{copy.clinicSummaryUnavailable}</p> : clinicSummary ? <div className="space-y-3"><p className="text-xs text-muted-foreground">{copy.summaryGeneratedAt}: <time dateTime={clinicSummary.generatedAt} dir="ltr">{clinicSummary.generatedAt}</time></p><div className="grid gap-3 md:grid-cols-3"><CountCard title={copy.summaryAppointments} value={clinicSummary.appointments.total} detail={appointmentSummaryDetail} /><CountCard title={copy.summaryBilling} value={clinicSummary.billingAccounts.total} detail={copy.summaryBillingDetail.replace("{pending}", String(clinicSummary.billingAccounts.pendingApproval))} /><CountCard title={copy.summaryExternal} value={clinicSummary.externalOperations === "blocked" ? copy.blocked : "—"} detail={copy.summaryExternalDetail} /></div></div> : null}
        </CardContent>
      </Card>

      <Card className="border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <CardHeader><CardTitle>{copy.patientFoundationTitle}</CardTitle><p className="text-sm text-muted-foreground">{copy.patientFoundationHelp}</p></CardHeader>
        <CardContent className="space-y-4">
          {patientFoundationReferencesLoading ? <p className="rounded-md border border-slate-200 bg-slate-50 p-3 text-sm text-muted-foreground dark:border-slate-800 dark:bg-slate-900">{copy.patientFoundationLoading}</p> : patientFoundationReferencesFailed ? <div className="flex flex-wrap items-center gap-3" role="alert"><p className="text-sm text-amber-700 dark:text-amber-300">{copy.patientFoundationError}</p><Button type="button" size="sm" variant="outline" onClick={() => void patientsQuery.refetch()} disabled={patientsQuery.isFetching}>{copy.patientFoundationRetry}</Button></div> : (patientsQuery.data?.length ?? 0) > 0 ? <label className="grid max-w-md gap-2 text-sm font-medium" htmlFor="patient-record-foundation">{copy.patientFoundationSelect}<select id="patient-record-foundation" className="h-10 rounded-md border border-input bg-background px-3 text-sm" value={selectedPatientId} onChange={event => setSelectedPatientId(event.target.value)}><option value="">{copy.patientFoundationPlaceholder}</option>{(patientsQuery.data ?? []).map(patient => <option key={patient.id} value={patient.id}>{patient.localMedicalRecordNumber}</option>)}</select></label> : <p className="rounded-md border border-slate-200 bg-slate-50 p-3 text-sm text-muted-foreground dark:border-slate-800 dark:bg-slate-900">{copy.patientFoundationUnavailable}</p>}
          {selectedPatient ? <><div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><CountCard title={copy.patientRecord} value={selectedPatient.localMedicalRecordNumber} detail={copy.patientFoundationHelp} /><CountCard title={copy.patientFoundationConsent} value={selectedPatient.consentStatus} detail={copy.patientFoundationHelp} /><CountCard title={copy.patientFoundationActivity} value={selectedPatient.active ? copy.patientFoundationActive : "—"} detail={copy.patientFoundationHelp} /><CountCard title={copy.patientFoundationAppointments} value={patientFoundationCountsLoading || patientFoundationCountsFailed || patientFoundationCountsUnavailable ? "—" : selectedPatientAppointments.length} detail={patientFoundationCountsLoading ? copy.patientFoundationCountsLoading : patientFoundationCountsFailed ? copy.patientFoundationCountsError : patientFoundationCountsUnavailable ? copy.patientFoundationCountsUnavailable : `${copy.patientFoundationEncounters}: ${selectedPatientEncounters.length}`} /></div>{patientFoundationCountsFailed ? <div className="flex flex-wrap items-center gap-3" role="alert"><p className="text-sm text-amber-700 dark:text-amber-300">{copy.patientFoundationCountsError}</p><Button type="button" size="sm" variant="outline" onClick={retryFailedPatientFoundationCounts} disabled={patientFoundationCountsFetching}>{copy.patientFoundationCountsRetry}</Button></div> : patientFoundationCountsUnavailable ? <p className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-200" role="status">{copy.patientFoundationCountsUnavailable}</p> : null}</> : !patientFoundationReferencesLoading && !patientFoundationReferencesFailed && (patientsQuery.data?.length ?? 0) > 0 ? <p className="rounded-md border border-slate-200 bg-slate-50 p-3 text-sm text-muted-foreground dark:border-slate-800 dark:bg-slate-900">{copy.patientFoundationEmpty}</p> : null}
        </CardContent>
      </Card>

      <Card className="border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <CardHeader><CardTitle>{copy.requestTitle}</CardTitle><p className="text-sm text-muted-foreground">{copy.requestHelp}</p></CardHeader>
        <CardContent className="space-y-4">
          {appointmentReferencesLoading ? <p className="rounded-md border border-slate-200 bg-slate-50 p-3 text-sm text-muted-foreground dark:border-slate-800 dark:bg-slate-900">{copy.appointmentReferencesLoading}</p> : appointmentReferencesFailed ? <div className="flex flex-wrap items-center gap-3" role="alert"><p className="text-sm text-amber-700 dark:text-amber-300">{copy.appointmentReferencesError}</p><Button type="button" size="sm" variant="outline" onClick={retryFailedFormReferences} disabled={failedFormReferencesFetching}>{copy.appointmentReferencesRetry}</Button></div> : appointmentReferencesAvailable ? <div className="grid gap-4 md:grid-cols-2">
            <label className="grid gap-2 text-sm font-medium" htmlFor="appointment-facility">{copy.facility}<select id="appointment-facility" className="h-10 rounded-md border border-input bg-background px-3 text-sm" value={appointmentDraft.facilityId} onChange={event => setAppointmentDraft(current => ({ ...current, facilityId: event.target.value }))}><option value="">{copy.selectFacility}</option>{(facilitiesQuery.data ?? []).map(facility => <option key={facility.id} value={facility.id}>{ar ? `منشأة رقم ${facility.id}` : `Facility #${facility.id}`}</option>)}</select></label>
            <label className="grid gap-2 text-sm font-medium" htmlFor="appointment-patient-record">{copy.patientRecord}<select id="appointment-patient-record" className="h-10 rounded-md border border-input bg-background px-3 text-sm" value={appointmentDraft.patientId} onChange={event => setAppointmentDraft(current => ({ ...current, patientId: event.target.value }))}><option value="">{copy.selectRecord}</option>{(patientsQuery.data ?? []).map(patient => <option key={patient.id} value={patient.id}>{patient.localMedicalRecordNumber}</option>)}</select></label>
            <label className="grid gap-2 text-sm font-medium" htmlFor="appointment-scheduled-at">{copy.scheduledAt}<Input id="appointment-scheduled-at" type="datetime-local" value={appointmentDraft.scheduledAt} onChange={event => setAppointmentDraft(current => ({ ...current, scheduledAt: event.target.value }))} /></label>
            <label className="grid gap-2 text-sm font-medium" htmlFor="appointment-specialty">{copy.specialty}<Input id="appointment-specialty" value={appointmentDraft.specialty} onChange={event => setAppointmentDraft(current => ({ ...current, specialty: event.target.value }))} placeholder={copy.specialtyPlaceholder} maxLength={120} /></label>
          </div> : <p className="rounded-md border border-slate-200 bg-slate-50 p-3 text-sm text-muted-foreground dark:border-slate-800 dark:bg-slate-900">{copy.noAppointmentReferences}</p>}
          {(appointmentFormError || createAppointment.isError) && <p className="text-sm text-rose-700 dark:text-rose-300" role="alert">{appointmentFormError ?? copy.requestError}</p>}
          {createAppointment.isSuccess && <p className="text-sm text-emerald-700 dark:text-emerald-300" role="status">{copy.requestSuccess}</p>}
          <Button type="button" onClick={submitAppointmentRequest} disabled={!appointmentReferencesAvailable || createAppointment.isPending}>{createAppointment.isPending ? copy.requestPending : copy.submitRequest}</Button>
        </CardContent>
      </Card>

      <Card className="border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <CardHeader><div className="flex flex-wrap items-center justify-between gap-2"><div><CardTitle>{copy.confirmationTitle}</CardTitle><p className="mt-1 text-sm text-muted-foreground">{copy.confirmationHelp}</p></div><Badge variant="outline" className="border-slate-300 text-slate-700 dark:border-slate-700 dark:text-slate-200">{copy.blocked}</Badge></div></CardHeader>
        <CardContent className="space-y-3">
          {renderAppointmentTransitionReadState() ?? (requestedAppointments.length ? <div className="space-y-2">{requestedAppointments.map(appointment => <div key={appointment.id} className="flex flex-col gap-2 rounded-md border border-slate-200 p-3 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800"><div className="text-sm"><p className="font-medium">{copy.appointmentReference.replace("{id}", String(appointment.id))}</p><p className="text-muted-foreground">{copy.facility}: {ar ? `منشأة رقم ${appointment.facilityId}` : `Facility #${appointment.facilityId}`}</p></div><Button type="button" size="sm" onClick={() => confirmInternalAppointment(appointment.id)} disabled={confirmAppointment.isPending}>{confirmAppointment.isPending ? copy.confirmationPending : copy.confirmationSubmit}</Button></div>)}</div> : <p className="rounded-md border border-slate-200 bg-slate-50 p-3 text-sm text-muted-foreground dark:border-slate-800 dark:bg-slate-900">{copy.confirmationEmpty}</p>)}
          {confirmAppointment.isError && <p className="text-sm text-rose-700 dark:text-rose-300" role="alert">{copy.confirmationError}</p>}
          {confirmedAppointmentId !== null && confirmAppointment.isSuccess && <p className="text-sm text-emerald-700 dark:text-emerald-300" role="status">{copy.confirmationSuccess}</p>}
        </CardContent>
      </Card>

      <Card className="border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <CardHeader><div className="flex flex-wrap items-center justify-between gap-2"><div><CardTitle>{copy.cancellationTitle}</CardTitle><p className="mt-1 text-sm text-muted-foreground">{copy.cancellationHelp}</p></div><Badge variant="outline" className="border-slate-300 text-slate-700 dark:border-slate-700 dark:text-slate-200">{copy.blocked}</Badge></div></CardHeader>
        <CardContent className="space-y-3">
          {renderAppointmentTransitionReadState() ?? (cancellableAppointments.length ? <div className="space-y-2">{cancellableAppointments.map(appointment => <div key={appointment.id} className="flex flex-col gap-2 rounded-md border border-slate-200 p-3 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800"><div className="text-sm"><p className="font-medium">{copy.appointmentReference.replace("{id}", String(appointment.id))}</p><p className="text-muted-foreground">{copy.facility}: {ar ? `منشأة رقم ${appointment.facilityId}` : `Facility #${appointment.facilityId}`}</p></div><Button type="button" size="sm" variant="outline" onClick={() => cancelInternalAppointment(appointment.id)} disabled={cancelAppointment.isPending}>{cancelAppointment.isPending ? copy.cancellationPending : copy.cancellationSubmit}</Button></div>)}</div> : <p className="rounded-md border border-slate-200 bg-slate-50 p-3 text-sm text-muted-foreground dark:border-slate-800 dark:bg-slate-900">{copy.cancellationEmpty}</p>)}
          {cancelAppointment.isError && <p className="text-sm text-rose-700 dark:text-rose-300" role="alert">{copy.cancellationError}</p>}
          {cancelledAppointmentId !== null && cancelAppointment.isSuccess && <p className="text-sm text-emerald-700 dark:text-emerald-300" role="status">{copy.cancellationSuccess}</p>}
        </CardContent>
      </Card>

      <Card className="border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <CardHeader><div className="flex flex-wrap items-center justify-between gap-2"><div><CardTitle>{copy.checkInTitle}</CardTitle><p className="mt-1 text-sm text-muted-foreground">{copy.checkInHelp}</p></div><Badge variant="outline" className="border-slate-300 text-slate-700 dark:border-slate-700 dark:text-slate-200">{copy.blocked}</Badge></div></CardHeader>
        <CardContent className="space-y-3">
          {renderAppointmentTransitionReadState() ?? (confirmedAppointments.length ? <div className="space-y-2">{confirmedAppointments.map(appointment => <div key={appointment.id} className="flex flex-col gap-2 rounded-md border border-slate-200 p-3 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800"><div className="text-sm"><p className="font-medium">{copy.appointmentReference.replace("{id}", String(appointment.id))}</p><p className="text-muted-foreground">{copy.facility}: {ar ? `منشأة رقم ${appointment.facilityId}` : `Facility #${appointment.facilityId}`}</p></div><Button type="button" size="sm" onClick={() => checkInInternalAppointment(appointment.id)} disabled={checkInAppointment.isPending}>{checkInAppointment.isPending ? copy.checkInPending : copy.checkInSubmit}</Button></div>)}</div> : <p className="rounded-md border border-slate-200 bg-slate-50 p-3 text-sm text-muted-foreground dark:border-slate-800 dark:bg-slate-900">{copy.checkInEmpty}</p>)}
          {checkInAppointment.isError && <p className="text-sm text-rose-700 dark:text-rose-300" role="alert">{copy.checkInError}</p>}
          {checkedInAppointmentId !== null && checkInAppointment.isSuccess && <p className="text-sm text-emerald-700 dark:text-emerald-300" role="status">{copy.checkInSuccess}</p>}
        </CardContent>
      </Card>

      <Card className="border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <CardHeader><div className="flex flex-wrap items-center justify-between gap-2"><div><CardTitle>{completionCopy.title}</CardTitle><p className="mt-1 text-sm text-muted-foreground">{completionCopy.help}</p></div><Badge variant="outline" className="border-slate-300 text-slate-700 dark:border-slate-700 dark:text-slate-200">{copy.blocked}</Badge></div></CardHeader>
        <CardContent className="space-y-3">
          {renderAppointmentTransitionReadState() ?? (checkedInAppointments.length ? <div className="space-y-2">{checkedInAppointments.map(appointment => <div key={appointment.id} className="flex flex-col gap-2 rounded-md border border-slate-200 p-3 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800"><div className="text-sm"><p className="font-medium">{copy.appointmentReference.replace("{id}", String(appointment.id))}</p><p className="text-muted-foreground">{copy.facility}: {ar ? `منشأة رقم ${appointment.facilityId}` : `Facility #${appointment.facilityId}`}</p></div><Button type="button" size="sm" onClick={() => completeInternalAppointment(appointment.id)} disabled={completeAppointment.isPending}>{completeAppointment.isPending ? completionCopy.pending : completionCopy.submit}</Button></div>)}</div> : <p className="rounded-md border border-slate-200 bg-slate-50 p-3 text-sm text-muted-foreground dark:border-slate-800 dark:bg-slate-900">{completionCopy.empty}</p>)}
          {completeAppointment.isError && <p className="text-sm text-rose-700 dark:text-rose-300" role="alert">{completionCopy.error}</p>}
          {completedAppointmentId !== null && completeAppointment.isSuccess && <p className="text-sm text-emerald-700 dark:text-emerald-300" role="status">{completionCopy.success}</p>}
        </CardContent>
      </Card>

      <Card className="border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <CardHeader><div className="flex flex-wrap items-center justify-between gap-2"><div><CardTitle>{copy.noShowTitle}</CardTitle><p className="mt-1 text-sm text-muted-foreground">{copy.noShowHelp}</p></div><Badge variant="outline" className="border-slate-300 text-slate-700 dark:border-slate-700 dark:text-slate-200">{copy.blocked}</Badge></div></CardHeader>
        <CardContent className="space-y-3">
          {renderAppointmentTransitionReadState() ?? (confirmedAppointments.length ? <div className="space-y-2">{confirmedAppointments.map(appointment => <div key={appointment.id} className="flex flex-col gap-2 rounded-md border border-slate-200 p-3 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800"><div className="text-sm"><p className="font-medium">{copy.appointmentReference.replace("{id}", String(appointment.id))}</p><p className="text-muted-foreground">{copy.facility}: {ar ? `منشأة رقم ${appointment.facilityId}` : `Facility #${appointment.facilityId}`}</p></div><Button type="button" size="sm" variant="outline" onClick={() => markInternalAppointmentNoShow(appointment.id)} disabled={markAppointmentNoShow.isPending}>{markAppointmentNoShow.isPending ? copy.noShowPending : copy.noShowSubmit}</Button></div>)}</div> : <p className="rounded-md border border-slate-200 bg-slate-50 p-3 text-sm text-muted-foreground dark:border-slate-800 dark:bg-slate-900">{copy.noShowEmpty}</p>)}
          {markAppointmentNoShow.isError && <p className="text-sm text-rose-700 dark:text-rose-300" role="alert">{copy.noShowError}</p>}
          {noShowAppointmentId !== null && markAppointmentNoShow.isSuccess && <p className="text-sm text-emerald-700 dark:text-emerald-300" role="status">{copy.noShowSuccess}</p>}
        </CardContent>
      </Card>

      <Card className="border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <CardHeader><div className="flex flex-wrap items-center justify-between gap-2"><div><CardTitle>{copy.billingIntakeTitle}</CardTitle><p className="mt-1 text-sm text-muted-foreground">{copy.billingIntakeHelp}</p></div><Badge variant="outline" className="border-slate-300 text-slate-700 dark:border-slate-700 dark:text-slate-200">{copy.blocked}</Badge></div></CardHeader>
        <CardContent className="space-y-4">
          {billingReferencesLoading ? <p className="rounded-md border border-slate-200 bg-slate-50 p-3 text-sm text-muted-foreground dark:border-slate-800 dark:bg-slate-900">{copy.billingReferencesLoading}</p> : billingReferencesFailed ? <div className="flex flex-wrap items-center gap-3" role="alert"><p className="text-sm text-amber-700 dark:text-amber-300">{copy.billingReferencesError}</p><Button type="button" size="sm" variant="outline" onClick={retryFailedFormReferences} disabled={failedFormReferencesFetching}>{copy.billingReferencesRetry}</Button></div> : billingReferencesAvailable ? <div className="grid gap-4 md:grid-cols-2">
            <label className="grid gap-2 text-sm font-medium" htmlFor="billing-facility">{copy.facility}<select id="billing-facility" className="h-10 rounded-md border border-input bg-background px-3 text-sm" value={billingDraft.facilityId} onChange={event => setBillingDraft(current => ({ ...current, facilityId: event.target.value, encounterId: "" }))}><option value="">{copy.selectFacility}</option>{(facilitiesQuery.data ?? []).map(facility => <option key={facility.id} value={facility.id}>{ar ? `منشأة رقم ${facility.id}` : `Facility #${facility.id}`}</option>)}</select></label>
            <label className="grid gap-2 text-sm font-medium" htmlFor="billing-patient-record">{copy.patientRecord}<select id="billing-patient-record" className="h-10 rounded-md border border-input bg-background px-3 text-sm" value={billingDraft.patientId} onChange={event => setBillingDraft(current => ({ ...current, patientId: event.target.value, encounterId: "" }))}><option value="">{copy.selectRecord}</option>{(patientsQuery.data ?? []).map(patient => <option key={patient.id} value={patient.id}>{patient.localMedicalRecordNumber}</option>)}</select></label>
            <label className="grid gap-2 text-sm font-medium" htmlFor="billing-payer-type">{copy.billingPayerType}<select id="billing-payer-type" className="h-10 rounded-md border border-input bg-background px-3 text-sm" value={billingDraft.payerType} onChange={event => setBillingDraft(current => ({ ...current, payerType: event.target.value as typeof current.payerType }))}><option value="self_pay">{copy.billingPayerSelf}</option><option value="insurance">{copy.billingPayerInsurance}</option><option value="government">{copy.billingPayerGovernment}</option><option value="employer">{copy.billingPayerEmployer}</option></select></label>
            {renderBillingEncounterReference()}
            <label className="grid gap-2 text-sm font-medium" htmlFor="billing-package-code">{copy.billingPackageCode}<Input id="billing-package-code" value={billingDraft.packageCode} onChange={event => setBillingDraft(current => ({ ...current, packageCode: event.target.value }))} maxLength={120} /></label>
            <label className="grid gap-2 text-sm font-medium" htmlFor="billing-deposit">{copy.billingDeposit}<Input id="billing-deposit" inputMode="decimal" value={billingDraft.depositAmount} onChange={event => setBillingDraft(current => ({ ...current, depositAmount: event.target.value }))} placeholder="0.00" /></label>
            <label className="grid gap-2 text-sm font-medium" htmlFor="billing-amount">{copy.billingAmount}<Input id="billing-amount" inputMode="decimal" value={billingDraft.billedAmount} onChange={event => setBillingDraft(current => ({ ...current, billedAmount: event.target.value }))} placeholder="0.00" /></label>
          </div> : <p className="rounded-md border border-slate-200 bg-slate-50 p-3 text-sm text-muted-foreground dark:border-slate-800 dark:bg-slate-900">{copy.billingUnavailable}</p>}
          {(billingFormError || createBillingAccount.isError) && <p className="text-sm text-rose-700 dark:text-rose-300" role="alert">{billingFormError ?? copy.billingError}</p>}
          {createBillingAccount.isSuccess && <p className="text-sm text-emerald-700 dark:text-emerald-300" role="status">{copy.billingSuccess}</p>}
          <Button type="button" onClick={submitBillingAccount} disabled={!billingReferencesAvailable || createBillingAccount.isPending}>{createBillingAccount.isPending ? copy.billingPending : copy.billingSubmit}</Button>
        </CardContent>
      </Card>
    </section>
  );
}
