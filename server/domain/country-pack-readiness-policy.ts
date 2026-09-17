export const MEDORA_COUNTRY_PACK_SEQUENCE = ["EG", "SA", "AE", "OM", "IQ"] as const;
export type MedoraCountryPackCode = typeof MEDORA_COUNTRY_PACK_SEQUENCE[number];

export const COUNTRY_PACK_READINESS_GATE_IDS = [
  "supported_country_context",
  "matched_organization_scope",
  "pack_identity",
  "authority_source_register",
  "effective_window",
  "accountable_owner",
  "approved_governance",
  "official_contract_reference",
  "isolated_acceptance_evidence",
] as const;
export type CountryPackReadinessGateId = typeof COUNTRY_PACK_READINESS_GATE_IDS[number];

export type CountryPackReadinessInput = {
  countryCode?: string | null;
  recordCountryCode?: string | null;
  organizationId?: number | null;
  recordOrganizationId?: number | null;
  jurisdictionId?: number | null;
  recordJurisdictionId?: number | null;
  branchId?: number | null;
  recordBranchId?: number | null;
  packVersion?: string | null;
  authoritySourceRegisterReference?: string | null;
  effectiveFrom?: string | null;
  effectiveTo?: string | null;
  asOfDate?: string | null;
  accountableOwnerUserId?: number | null;
  approvalState?: "approved" | "draft" | "rejected" | null;
  officialContractReference?: string | null;
  isolatedAcceptanceEvidence?: boolean;
};

type ReadinessGate = {
  id: CountryPackReadinessGateId;
  state: "verified" | "missing";
  titleAr: string;
  titleEn: string;
  evidenceBoundary: string;
};

const GATE_METADATA: Record<CountryPackReadinessGateId, Omit<ReadinessGate, "state">> = {
  supported_country_context: {
    id: "supported_country_context",
    titleAr: "سياق الدولة المدعوم",
    titleEn: "Supported country context",
    evidenceBoundary: "رمز حزمة ضمن التسلسل المقرر فقط؛ لا يثبت قابلية تشغيل أو امتثالاً قانونياً.",
  },
  matched_organization_scope: {
    id: "matched_organization_scope",
    titleAr: "نطاق المؤسسة والاختصاص والفرع",
    titleEn: "Organization, jurisdiction and branch scope",
    evidenceBoundary: "مطابقة صريحة موجبة بين الطلب والسجل؛ لا تستنتج من موقع الجهاز أو بيانات العميل.",
  },
  pack_identity: {
    id: "pack_identity",
    titleAr: "هوية وإصدار الحزمة",
    titleEn: "Pack identity and version",
    evidenceBoundary: "مرجع إصدار داخلي غير فارغ؛ لا يمثل قاعدة تشريعية أو موافقة جهة رسمية.",
  },
  authority_source_register: {
    id: "authority_source_register",
    titleAr: "سجل مصادر السلطة المختصة",
    titleEn: "Competent-authority source register",
    evidenceBoundary: "مرجع سجل أدلة مراجع داخلياً؛ لا يساوي بمفرده مصادقة قانونية أو تكاملاً تقنياً.",
  },
  effective_window: {
    id: "effective_window",
    titleAr: "نافذة السريان والمراجعة",
    titleEn: "Effective and review window",
    evidenceBoundary: "تواريخ محلية متماسكة عند تاريخ مرجعي صريح؛ لا تثبت سرياناً قانونياً دون مراجعة مختصة.",
  },
  accountable_owner: {
    id: "accountable_owner",
    titleAr: "مالك المساءلة",
    titleEn: "Accountable owner",
    evidenceBoundary: "معرّف مالك داخلي موجب؛ لا يمنح تفويضاً ذاتياً أو صلاحية جهة خارجية.",
  },
  approved_governance: {
    id: "approved_governance",
    titleAr: "اعتماد الحوكمة",
    titleEn: "Governance approval",
    evidenceBoundary: "حالة اعتماد محلية محددة؛ لا تعني إقراراً حكومياً أو تأمينياً أو ضريبياً.",
  },
  official_contract_reference: {
    id: "official_contract_reference",
    titleAr: "مرجع العقد الرسمي المقيد",
    titleEn: "Scoped official-contract reference",
    evidenceBoundary: "مرجع عقد/مواصفة مقيد بالنطاق فقط؛ لا يحتوي أسراراً ولا ينشئ اتصالاً أو تفويضاً.",
  },
  isolated_acceptance_evidence: {
    id: "isolated_acceptance_evidence",
    titleAr: "دليل قبول معزول",
    titleEn: "Isolated acceptance evidence",
    evidenceBoundary: "إثبات قبول مراجع في بيئة معزولة؛ لا يفعّل الإنتاج أو يجيز بيانات حقيقية.",
  },
};

function positive(value: number | null | undefined): boolean {
  return Number.isInteger(value) && Number(value) > 0;
}

function nonBlank(value: string | null | undefined): boolean {
  return typeof value === "string" && value.trim().length > 0;
}

function isValidIsoDate(value: string | null | undefined): value is string {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const parsed = new Date(Date.UTC(year, month - 1, day));
  return parsed.getUTCFullYear() === year && parsed.getUTCMonth() === month - 1 && parsed.getUTCDate() === day;
}

function supportedCountryCode(value: string | null | undefined): value is MedoraCountryPackCode {
  return MEDORA_COUNTRY_PACK_SEQUENCE.includes(value as MedoraCountryPackCode);
}

function coherentEffectiveWindow(input: CountryPackReadinessInput): boolean {
  if (!isValidIsoDate(input.effectiveFrom) || !isValidIsoDate(input.effectiveTo) || !isValidIsoDate(input.asOfDate)) return false;
  return input.effectiveFrom <= input.asOfDate && input.asOfDate <= input.effectiveTo;
}

function matchedScope(input: CountryPackReadinessInput): boolean {
  return positive(input.organizationId)
    && input.organizationId === input.recordOrganizationId
    && positive(input.jurisdictionId)
    && input.jurisdictionId === input.recordJurisdictionId
    && positive(input.branchId)
    && input.branchId === input.recordBranchId
    && supportedCountryCode(input.countryCode)
    && input.countryCode === input.recordCountryCode;
}

/**
 * Pure evidence gate for a future country pack. It is deliberately not wired
 * to persistence, tRPC, UI, submission, pricing, claims, prescriptions, tax,
 * payments, traceability, messaging, devices or any authority adapter.
 */
export function buildCountryPackReadinessPacket(input: CountryPackReadinessInput = {}) {
  const states: Record<CountryPackReadinessGateId, boolean> = {
    supported_country_context: supportedCountryCode(input.countryCode) && input.countryCode === input.recordCountryCode,
    matched_organization_scope: matchedScope(input),
    pack_identity: nonBlank(input.packVersion),
    authority_source_register: nonBlank(input.authoritySourceRegisterReference),
    effective_window: coherentEffectiveWindow(input),
    accountable_owner: positive(input.accountableOwnerUserId),
    approved_governance: input.approvalState === "approved",
    official_contract_reference: nonBlank(input.officialContractReference),
    isolated_acceptance_evidence: input.isolatedAcceptanceEvidence === true,
  };

  const gates = COUNTRY_PACK_READINESS_GATE_IDS.map(id => ({
    ...GATE_METADATA[id],
    state: states[id] ? "verified" as const : "missing" as const,
  }));
  const missingGateIds = gates.filter(gate => gate.state === "missing").map(gate => gate.id);
  const internalPreparationReady = missingGateIds.length === 0;

  return {
    packetVersion: "country-pack-readiness-v1" as const,
    operatingMode: "evidence-gated-country-pack" as const,
    activationPolicy: "fail-closed" as const,
    countryCode: supportedCountryCode(input.countryCode) ? input.countryCode : null,
    readinessState: internalPreparationReady ? "internal-preparation-ready" as const : "blocked" as const,
    regulatedMutationAllowed: false as const,
    externalOperationAllowed: false as const,
    submissionAllowed: false as const,
    gates,
    missingGateIds,
    nextAction: internalPreparationReady
      ? "اكتملت بوابات التحضير الداخلي فقط. يلزم ربط خادمي منفصل ومراجعة مستقلة قبل أي عملية منظمة أو إرسال أو تكامل خارجي."
      : "أكمل أدلة الدولة والنطاق والحوكمة والعقد والقبول المعزول؛ يظل أي إجراء منظم أو خارجي محجوباً.",
    limitation: "لا تقرر هذه السياسة الامتثال أو الإقرار القانوني أو أهلية أو وصفة أو سجل مريض أو سعر أو فاتورة أو ضريبة أو مطالبة أو دفع أو تتبع أو تقرير منظم، ولا تحفظ بيانات أو تقرأ قاعدة بيانات أو تتصل بخدمة خارجية أو تحتفظ بسر.",
  };
}
