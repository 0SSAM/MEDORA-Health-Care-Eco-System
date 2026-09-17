import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

describe("EgyptHealthcareWorkspace clinic-path contract", () => {
  it("uses only the scoped healthcare procedures that exist in the router", async () => {
    const source = await readFile(new URL("./EgyptHealthcareWorkspace.tsx", import.meta.url), "utf8");

    expect(source).toContain("hasOrganizationBranchJurisdictionScope(organizationId, branchId, jurisdictionId)");
    expect(source).toContain("trpc.egyptHealthcare.patients.useQuery");
    expect(source).toContain("trpc.egyptHealthcare.facilities.useQuery");
    expect(source).toContain("trpc.egyptHealthcare.appointments.useQuery");
    expect(source).toContain("trpc.egyptHealthcare.encounters.useQuery");
    expect(source).toContain("trpc.egyptHealthcare.billingAccounts.useQuery");
    expect(source).toContain("trpc.egyptHealthcare.clinicOperationsSummary.useQuery");
    expect(source).toContain("trpc.egyptHealthcare.createAppointment.useMutation");
    expect(source).toContain("trpc.egyptHealthcare.confirmAppointment.useMutation");
    expect(source).toContain("trpc.egyptHealthcare.cancelAppointment.useMutation");
    expect(source).toContain("trpc.egyptHealthcare.markAppointmentNoShow.useMutation");
    expect(source).toContain("trpc.egyptHealthcare.checkInAppointment.useMutation");
    expect(source).toContain("trpc.egyptHealthcare.completeAppointment.useMutation");
    expect(source).not.toContain("listPatients");
    expect(source).not.toContain("listFacilities");
    expect(source).not.toContain("listAppointments");
    expect(source).not.toContain("listBillingAccounts");
    expect(source).not.toContain("listOrganizationMemberships");
  });

  it("keeps the clinic view non-identifying and internal-only", async () => {
    const source = await readFile(new URL("./EgyptHealthcareWorkspace.tsx", import.meta.url), "utf8");

    expect(source).toContain("localMedicalRecordNumber");
    expect(source).toContain("externalOperations === \"blocked\"");
    expect(source).toContain("No external request is sent.");
    expect(source).not.toContain("patient.fullName");
    expect(source).not.toContain("patient.name");
    expect(source).not.toContain("patient.facilityId");
    expect(source).not.toContain("medicalRecordNumber");
    expect(source).not.toContain("externalScheduling");
    expect(source).not.toMatch(/(?:^|[^A-Za-z])fetch\(/);
  });

  it("renders only scoped aggregate appointment-state counts in the clinic summary", async () => {
    const source = await readFile(new URL("./EgyptHealthcareWorkspace.tsx", import.meta.url), "utf8");

    expect(source).toContain("summaryAppointmentLifecycleDetail");
    expect(source).toContain("clinicSummary.appointments.cancelled");
    expect(source).toContain("clinicSummary.appointments.noShow");
    expect(source).toContain("clinicSummary.appointments.checkedIn");
    expect(source).toContain("clinicSummary.appointments.completed");
    expect(source).not.toContain("clinicSummary.appointments.patientId");
    expect(source).not.toContain("clinicSummary.appointments.facilityId");
    expect(source).not.toContain("clinicSummary.appointments.scheduledAt");
    expect(source).not.toContain("clinicSummary.appointments.clinicalNotes");
    expect(source).not.toContain("clinicSummary.appointments.diagnosis");
    expect(source).not.toContain("clinicSummary.audit");
    expect(source).not.toContain("syncCalendar");
    expect(source).not.toContain("notifyPatient");
  });

  it("renders the already-loaded server-issued report timestamp without formatting or adding report content", async () => {
    const source = await readFile(new URL("./EgyptHealthcareWorkspace.tsx", import.meta.url), "utf8");

    expect(source).toContain("summaryGeneratedAt");
    expect(source).toContain('<time dateTime={clinicSummary.generatedAt} dir="ltr">{clinicSummary.generatedAt}</time>');
    expect(source).not.toContain("new Date(clinicSummary.generatedAt)");
    expect(source).not.toContain("clinicSummary.mutate");
  });

  it("retries only the failed scoped clinic-summary query without creating an operational side effect", async () => {
    const source = await readFile(new URL("./EgyptHealthcareWorkspace.tsx", import.meta.url), "utf8");

    expect(source).toContain("clinicSummaryRetry");
    expect(source).toContain("clinicSummaryQuery.isError");
    expect(source).toContain("clinicSummaryQuery.refetch()");
    expect(source).toContain("disabled={clinicSummaryQuery.isFetching}");
    expect(source).not.toContain("clinicSummaryQuery.mutate");
    expect(source).not.toContain("clinicSummaryQuery.invalidate");
    expect(source).not.toContain("clinicSummaryQuery.fetch");
  });

  it("distinguishes an unavailable clinic summary from a failed read and keeps local export disabled until ready", async () => {
    const source = await readFile(new URL("./EgyptHealthcareWorkspace.tsx", import.meta.url), "utf8");

    expect(source).toContain("clinicSummaryLoading");
    expect(source).toContain("clinicSummaryFailed");
    expect(source).toContain("clinicSummaryUnavailable");
    expect(source).toContain('role="status">{copy.clinicSummaryUnavailable}');
    expect(source).toContain("disabled={!clinicSummaryReady}");
    expect(source).toContain("if (!clinicSummary) return;");
    expect(source).not.toContain("clinicSummaryQuery.mutate");
    expect(source).not.toContain("clinicSummaryQuery.invalidate");
    expect(source).not.toContain("clinicSummaryQuery.fetch");
  });

  it("distinguishes appointment-reference loading, failed reads, and true absence with local retries only", async () => {
    const source = await readFile(new URL("./EgyptHealthcareWorkspace.tsx", import.meta.url), "utf8");
    const start = source.indexOf("const retryFailedFormReferences");
    const end = source.indexOf("const renderBillingEncounterReference");

    expect(source).toContain("appointmentReferencesLoading");
    expect(source).toContain("appointmentReferencesFailed");
    expect(source).toContain("appointmentReferencesError");
    expect(source).toContain("appointmentReferencesRetry");
    expect(source).toContain("patientsQuery.isLoading || facilitiesQuery.isLoading");
    expect(source).toContain("patientsQuery.isError || facilitiesQuery.isError");
    expect(source).toContain("onClick={retryFailedFormReferences}");
    expect(source).toContain("disabled={failedFormReferencesFetching}");
    expect(start).toBeGreaterThanOrEqual(0);
    expect(end).toBeGreaterThan(start);

    const retrySource = source.slice(start, end);
    expect(retrySource).toContain("if (patientsQuery.isError) void patientsQuery.refetch();");
    expect(retrySource).toContain("if (facilitiesQuery.isError) void facilitiesQuery.refetch();");
    expect(retrySource).not.toContain(".mutate(");
    expect(retrySource).not.toMatch(/(?:^|[^A-Za-z])fetch\(/);
    expect(retrySource).not.toContain("invalidate(");
    expect(source).not.toContain("createAppointment.mutate({ ...scope, facilityId: 0");
  });

  it("distinguishes top-level operational-counter reads and retries only failed existing queries", async () => {
    const source = await readFile(new URL("./EgyptHealthcareWorkspace.tsx", import.meta.url), "utf8");
    const start = source.indexOf("const retryFailedOperationalCounters");
    const end = source.indexOf("const submitAppointmentRequest");

    expect(source).toContain("operationalCountersLoading");
    expect(source).toContain("operationalCountersFailed");
    expect(source).toContain("operationalCountersUnavailable");
    expect(source).toContain("operationalCounterCopy.retry");
    expect(source).toContain("disabled={operationalCountersFetching}");
    expect(source).toContain("const operationalCountersFetching = (patientsQuery.isError && patientsQuery.isFetching) || (facilitiesQuery.isError && facilitiesQuery.isFetching) || (appointmentsQuery.isError && appointmentsQuery.isFetching) || (billingAccountsQuery.isError && billingAccountsQuery.isFetching);");
    expect(source).not.toContain("const operationalCountersFetching = patientsQuery.isFetching || facilitiesQuery.isFetching || appointmentsQuery.isFetching || billingAccountsQuery.isFetching;");
    expect(start).toBeGreaterThanOrEqual(0);
    expect(end).toBeGreaterThan(start);

    const retrySource = source.slice(start, end);
    expect(retrySource).toContain("patientsQuery.refetch()");
    expect(retrySource).toContain("facilitiesQuery.refetch()");
    expect(retrySource).toContain("appointmentsQuery.refetch()");
    expect(retrySource).toContain("billingAccountsQuery.refetch()");
    expect(retrySource).not.toContain(".mutate(");
    expect(retrySource).not.toMatch(/(?:^|[^A-Za-z])fetch\(/);
    expect(retrySource).not.toContain("invalidate(");
  });

  it("guards internal appointment-transition lists behind loading, failed-read, and unavailable states", async () => {
    const source = await readFile(new URL("./EgyptHealthcareWorkspace.tsx", import.meta.url), "utf8");
    const start = source.indexOf("const renderAppointmentTransitionReadState");
    const end = source.indexOf("const submitAppointmentRequest");

    expect(source).toContain("appointmentTransitionsLoading");
    expect(source).toContain("appointmentTransitionsFailed");
    expect(source).toContain("appointmentTransitionsUnavailable");
    expect(source).toContain("appointmentTransitionCopy.retry");
    expect(source).toContain("{renderAppointmentTransitionReadState() ?? (requestedAppointments.length ?");
    expect(source).toContain("{renderAppointmentTransitionReadState() ?? (cancellableAppointments.length ?");
    expect(source).toContain("{renderAppointmentTransitionReadState() ?? (confirmedAppointments.length ?");
    expect(source).toContain("{renderAppointmentTransitionReadState() ?? (checkedInAppointments.length ?");
    expect(start).toBeGreaterThanOrEqual(0);
    expect(end).toBeGreaterThan(start);

    const transitionStateSource = source.slice(start, end);
    expect(transitionStateSource).toContain("appointmentsQuery.refetch()");
    expect(transitionStateSource).toContain("disabled={appointmentsQuery.isFetching}");
    expect(transitionStateSource).not.toContain(".mutate(");
    expect(transitionStateSource).not.toMatch(/(?:^|[^A-Za-z])fetch\(/);
    expect(transitionStateSource).not.toContain("invalidate(");
  });

  it("exports only the already-loaded aggregate clinic summary as a local CSV", async () => {
    const source = await readFile(new URL("./EgyptHealthcareWorkspace.tsx", import.meta.url), "utf8");
    const start = source.indexOf("const exportClinicSummary");
    const end = source.indexOf("const selectedPatient =");

    expect(start).toBeGreaterThanOrEqual(0);
    expect(end).toBeGreaterThan(start);

    const exportSource = source.slice(start, end);
    expect(exportSource).toContain("clinicSummary.generatedAt");
    expect(exportSource).toContain("clinicSummary.appointments.total");
    expect(exportSource).toContain("clinicSummary.appointments.requested");
    expect(exportSource).toContain("clinicSummary.appointments.confirmed");
    expect(exportSource).toContain("clinicSummary.appointments.cancelled");
    expect(exportSource).toContain("clinicSummary.appointments.noShow");
    expect(exportSource).toContain("clinicSummary.appointments.checkedIn");
    expect(exportSource).toContain("clinicSummary.appointments.completed");
    expect(exportSource).toContain("clinicSummary.billingAccounts.total");
    expect(exportSource).toContain("clinicSummary.billingAccounts.pendingApproval");
    expect(exportSource).toContain('new Blob');
    expect(exportSource).toContain('URL.createObjectURL');
    expect(exportSource).toContain('clinic-operations-summary.csv');
    expect(exportSource).not.toContain("new Date().toISOString()");
    expect(exportSource).not.toContain("trpc.");
    expect(exportSource).not.toContain(".mutate(");
    expect(exportSource).not.toContain("fetch(");
    expect(exportSource).not.toContain("patient");
    expect(exportSource).not.toContain("facility");
    expect(exportSource).not.toContain("scheduled");
    expect(exportSource).not.toContain("clinical");
    expect(exportSource).not.toContain("audit");
    expect(exportSource).not.toContain("calendar");
    expect(exportSource).not.toContain("external");
    expect(exportSource).not.toContain("payment");
    expect(exportSource).not.toContain("invoice");
  });

  it("keeps the patient-record foundation operational and non-clinical", async () => {
    const source = await readFile(new URL("./EgyptHealthcareWorkspace.tsx", import.meta.url), "utf8");

    expect(source).toContain("patientFoundationTitle");
    expect(source).toContain("selectedPatientAppointments");
    expect(source).toContain("selectedPatientEncounters");
    expect(source).toContain("selectedPatient.consentStatus");
    expect(source).toContain("selectedPatient.active");
    expect(source).not.toContain("selectedPatient.fullName");
    expect(source).not.toContain("selectedPatient.dateOfBirth");
    expect(source).not.toContain("selectedPatient.sex");
    expect(source).not.toContain("fullNameEncrypted");
    expect(source).not.toContain("dateOfBirthEncrypted");
    expect(source).not.toContain("clinicalNotes");
    expect(source).not.toContain("decryptPatient");
  });

  it("distinguishes patient-foundation reference and count reads with local retries only", async () => {
    const source = await readFile(new URL("./EgyptHealthcareWorkspace.tsx", import.meta.url), "utf8");
    const start = source.indexOf("const retryFailedPatientFoundationCounts");
    const end = source.indexOf("const renderBillingEncounterReference");

    expect(source).toContain("patientFoundationReferencesLoading");
    expect(source).toContain("patientFoundationReferencesFailed");
    expect(source).toContain("patientFoundationLoading");
    expect(source).toContain("patientFoundationError");
    expect(source).toContain("patientFoundationRetry");
    expect(source).toContain("patientFoundationCountsLoading");
    expect(source).toContain("patientFoundationCountsFailed");
    expect(source).toContain("patientFoundationCountsUnavailable");
    expect(source).toContain("patientFoundationCountsFetching");
    expect(source).toContain("const patientFoundationCountsFetching = Boolean(selectedPatient) && ((appointmentsQuery.isError && appointmentsQuery.isFetching) || (encountersQuery.isError && encountersQuery.isFetching));");
    expect(source).not.toContain("const patientFoundationCountsFetching = appointmentsQuery.isFetching || encountersQuery.isFetching;");
    expect(source).toContain("patientFoundationCountsError");
    expect(source).toContain("patientFoundationCountsUnavailable");
    expect(source).toContain("patientFoundationCountsRetry");
    expect(source).toContain("onClick={() => void patientsQuery.refetch()}");
    expect(source).toContain('role="status">{copy.patientFoundationCountsUnavailable}');
    expect(source).toContain("onClick={retryFailedPatientFoundationCounts}");
    expect(source).toContain("disabled={patientsQuery.isFetching}");
    expect(source).toContain("disabled={patientFoundationCountsFetching}");
    expect(start).toBeGreaterThanOrEqual(0);
    expect(end).toBeGreaterThan(start);

    const retrySource = source.slice(start, end);
    expect(retrySource).toContain("if (appointmentsQuery.isError) void appointmentsQuery.refetch();");
    expect(retrySource).toContain("if (encountersQuery.isError) void encountersQuery.refetch();");
    expect(retrySource).not.toContain(".mutate(");
    expect(retrySource).not.toMatch(/(?:^|[^A-Za-z])fetch\(/);
    expect(retrySource).not.toContain("invalidate(");
    expect(source).not.toContain("patientsQuery.mutate");
    expect(source).not.toContain("appointmentsQuery.mutate");
    expect(source).not.toContain("encountersQuery.mutate");
  });

  it("distinguishes billing-form reference reads with a refetch-only recovery", async () => {
    const source = await readFile(new URL("./EgyptHealthcareWorkspace.tsx", import.meta.url), "utf8");

    expect(source).toContain("billingReferencesLoading");
    expect(source).toContain("billingReferencesFailed");
    expect(source).toContain("billingReferencesError");
    expect(source).toContain("billingReferencesRetry");
    expect(source).toContain("copy.billingReferencesLoading");
    expect(source).toContain("onClick={retryFailedFormReferences}");
    expect(source).toContain("disabled={failedFormReferencesFetching}");
    expect(source).toContain("disabled={!billingReferencesAvailable || createBillingAccount.isPending}");
    expect(source).not.toContain("billingReferencesQuery.mutate");
  });

  it("gates optional billing encounter selection behind its scoped read state and keeps recovery local", async () => {
    const source = await readFile(new URL("./EgyptHealthcareWorkspace.tsx", import.meta.url), "utf8");
    const start = source.indexOf("const renderBillingEncounterReference");
    const end = source.indexOf("const submitAppointmentRequest");

    expect(source).toContain("billingEncounterReferencesLoading");
    expect(source).toContain("billingEncounterReferencesFailed");
    expect(source).toContain("billingEncounterReferencesUnavailable");
    expect(source).toContain("billingEncounterReferencesReady");
    expect(source).toContain("billingEncounterReferenceCopy.retry");
    expect(source).toContain("billingEncounterReferencesReady && billingDraft.encounterId ? Number(billingDraft.encounterId) : undefined");
    expect(source).toContain("{renderBillingEncounterReference()}");
    expect(start).toBeGreaterThanOrEqual(0);
    expect(end).toBeGreaterThan(start);

    const encounterStateSource = source.slice(start, end);
    expect(encounterStateSource).toContain("encountersQuery.refetch()");
    expect(encounterStateSource).toContain("disabled={encountersQuery.isFetching}");
    expect(encounterStateSource).toContain("if (billingEncounterReferencesUnavailable)");
    expect(encounterStateSource).toContain('return <label className="grid gap-2 text-sm font-medium" htmlFor="billing-encounter">');
    expect(encounterStateSource).not.toContain(".mutate(");
    expect(encounterStateSource).not.toMatch(/(?:^|[^A-Za-z])fetch\(/);
    expect(encounterStateSource).not.toContain("invalidate(");
  });

  it("creates only a scoped internal billing-account draft without external financial operations", async () => {
    const source = await readFile(new URL("./EgyptHealthcareWorkspace.tsx", import.meta.url), "utf8");

    expect(source).toContain("trpc.egyptHealthcare.createBillingAccount.useMutation");
    expect(source).toContain("matchingBillingEncounters");
    expect(source).toContain("billingIntakeHelp");
    expect(source).toContain("It does not create an invoice, collect payment, submit insurance, or send anything externally.");
    expect(source).not.toContain("submitInvoice");
    expect(source).not.toContain("collectPayment");
    expect(source).not.toContain("submitInsurance");
    expect(source).not.toContain("externalInvoiceSubmission");
  });

  it("confirms only internal requested appointments without calendar, messaging, or public-booking behavior", async () => {
    const source = await readFile(new URL("./EgyptHealthcareWorkspace.tsx", import.meta.url), "utf8");

    expect(source).toContain("requestedAppointments");
    expect(source).toContain("confirmInternalAppointment");
    expect(source).toContain("confirmationHelp");
    expect(source).toContain("It does not send a calendar entry or message to a provider or patient, and it does not create public booking.");
    expect(source).not.toContain("syncCalendar");
    expect(source).not.toContain("notifyPatient");
    expect(source).not.toContain("publicBooking");
  });

  it("cancels only internal active appointments without calendar, messaging, or public-booking behavior", async () => {
    const source = await readFile(new URL("./EgyptHealthcareWorkspace.tsx", import.meta.url), "utf8");

    expect(source).toContain("cancellableAppointments");
    expect(source).toContain("cancelInternalAppointment");
    expect(source).toContain("cancellationHelp");
    expect(source).toContain("It does not send a message, calendar entry, or notification to a provider or patient, and it does not alter public booking.");
    expect(source).not.toContain("syncCalendar");
    expect(source).not.toContain("notifyPatient");
    expect(source).not.toContain("publicBooking");
  });

  it("records no-show only for internal confirmed appointments without calendar, messaging, or public-booking behavior", async () => {
    const source = await readFile(new URL("./EgyptHealthcareWorkspace.tsx", import.meta.url), "utf8");

    expect(source).toContain("confirmedAppointments");
    expect(source).toContain("markInternalAppointmentNoShow");
    expect(source).toContain("noShowHelp");
    expect(source).toContain("This action records no-show only for a confirmed appointment within the current scope. It does not send a message, calendar entry, or notification to a provider or patient, and it does not alter public booking.");
    expect(source).not.toContain("syncCalendar");
    expect(source).not.toContain("notifyPatient");
    expect(source).not.toContain("publicBooking");
  });

  it("records check-in only for internal confirmed appointments without clinical or external behavior", async () => {
    const source = await readFile(new URL("./EgyptHealthcareWorkspace.tsx", import.meta.url), "utf8");

    expect(source).toContain("confirmedAppointments");
    expect(source).toContain("checkInInternalAppointment");
    expect(source).toContain("checkInHelp");
    expect(source).toContain("This action records check-in only for a confirmed appointment within the current scope. It does not add clinical narrative or attendance evidence, and it does not send a message, calendar entry, or notification to a provider or patient, or alter public booking.");
    expect(source).not.toContain("syncCalendar");
    expect(source).not.toContain("notifyPatient");
    expect(source).not.toContain("publicBooking");
  });

  it("completes only checked-in internal appointments as an operational marker without clinical, financial, or external behavior", async () => {
    const source = await readFile(new URL("./EgyptHealthcareWorkspace.tsx", import.meta.url), "utf8");

    expect(source).toContain("checkedInAppointments");
    expect(source).toContain("completeInternalAppointment");
    expect(source).toContain("completionCopy.help");
    expect(source).toContain("This action records an operational completion only for a checked-in appointment within the current scope. It does not create an encounter, clinical narrative, attendance evidence, charge, invoice, or collection; it does not send a message, calendar entry, or notification, and it does not alter public booking.");
    expect(source).not.toContain("syncCalendar");
    expect(source).not.toContain("notifyPatient");
    expect(source).not.toContain("publicBooking");
  });
});
