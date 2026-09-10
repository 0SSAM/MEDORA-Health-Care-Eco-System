export const HOSPITAL_PAYER_FACILITY_TYPES = ["government_hospital", "private_hospital"] as const;
export type HospitalPayerFacilityType = typeof HOSPITAL_PAYER_FACILITY_TYPES[number];

export const HOSPITAL_PAYER_CONTRACT_STATUSES = ["draft", "active", "suspended", "expired"] as const;
export type HospitalPayerContractStatus = typeof HOSPITAL_PAYER_CONTRACT_STATUSES[number];

export const HOSPITAL_PAYER_READINESS_GATE_IDS = [
  "facility_context",
  "complete_scope",
  "payer_contract_reference",
  "local_contract_review",
  "local_effective_window",
] as const;
export type HospitalPayerReadinessGateId = typeof HOSPITAL_PAYER_READINESS_GATE_IDS[number];

export type HospitalPayerReadinessInput = {
  facilityType?: string | null;
  organizationId?: number | null;
  jurisdictionId?: number | null;
  branchId?: number | null;
  facilityId?: number | null;
  payerCode?: string | null;
  contractReference?: string | null;
  contractStatus?: string | null;
  localContractReviewed?: boolean;
  effectiveFrom?: string | null;
  effectiveTo?: string | null;
  asOfDate?: string;
};

type ReadinessGate = {
  id: HospitalPayerReadinessGateId;
  state: "verified" | "missing";
  titleAr: string;
  titleEn: string;
  evidenceBoundary: string;
};

const GATE_METADATA: Record<HospitalPayerReadinessGateId, Omit<ReadinessGate, "state">> = {
  facility_context: {
    id: "facility_context",
    titleAr: "سياق نوع المنشأة",
    titleEn: "Facility-type context",
    evidenceBoundary: "سجل داخلي مراجع لنوع منشأة حكومية أو خاصة؛ لا يثبت اعتماداً أو مشاركة رسمية.",
  },
  complete_scope: {
    id: "complete_scope",
    titleAr: "نطاق المؤسسة والمنشأة",
    titleEn: "Organization and facility scope",
    evidenceBoundary: "معرّفات مؤسسة واختصاص وفرع ومنشأة موجبة ومحددة؛ لا يجوز استنتاجها من جهة دافعة أو مريض.",
  },
  payer_contract_reference: {
    id: "payer_contract_reference",
    titleAr: "مرجع عقد الجهة الدافعة",
    titleEn: "Payer-contract reference",
    evidenceBoundary: "رمز جهة دافعة ومرجع عقد داخلي صالحان شكلياً؛ لا يثبتان شبكة أو منفعة أو تعريفة.",
  },
  local_contract_review: {
    id: "local_contract_review",
    titleAr: "مراجعة العقد المحلية",
    titleEn: "Local contract review",
    evidenceBoundary: "مراجعة داخلية وحالة محلية نشطة؛ لا تمثل موافقة خارجية أو تفويض مطالبة.",
  },
  local_effective_window: {
    id: "local_effective_window",
    titleAr: "نافذة السريان المحلية",
    titleEn: "Local effective window",
    evidenceBoundary: "تاريخا سريان محليان متماسكان ضمن تاريخ مرجعي صريح؛ لا يثبتان سرياناً قانونياً أو مالياً.",
  },
};

function positiveScopeValue(value: number | null | undefined): boolean {
  return Number.isInteger(value) && Number(value) > 0;
}

function nonBlank(value: string | null | undefined): boolean {
  return typeof value === "string" && value.trim().length > 0;
}

function validIsoDate(value: string | null | undefined): value is string {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const timestamp = Date.UTC(year, month - 1, day);
  const parsed = new Date(timestamp);
  return parsed.getUTCFullYear() === year && parsed.getUTCMonth() === month - 1 && parsed.getUTCDate() === day;
}

function isSupportedFacilityType(value: string | null | undefined): value is HospitalPayerFacilityType {
  return HOSPITAL_PAYER_FACILITY_TYPES.includes(value as HospitalPayerFacilityType);
}

function hasReviewedActiveContract(input: HospitalPayerReadinessInput): boolean {
  return input.localContractReviewed === true && input.contractStatus === "active";
}

function hasCoherentLocalEffectiveWindow(input: HospitalPayerReadinessInput): boolean {
  const asOfDate = input.asOfDate ?? "";
  if (!validIsoDate(input.effectiveFrom) || !validIsoDate(input.effectiveTo) || !validIsoDate(asOfDate)) return false;
  return input.effectiveFrom <= asOfDate && asOfDate <= input.effectiveTo;
}

export function buildHospitalPayerReadinessPacket(input: HospitalPayerReadinessInput = {}) {
  const states: Record<HospitalPayerReadinessGateId, boolean> = {
    facility_context: isSupportedFacilityType(input.facilityType),
    complete_scope: positiveScopeValue(input.organizationId) && positiveScopeValue(input.jurisdictionId) && positiveScopeValue(input.branchId) && positiveScopeValue(input.facilityId),
    payer_contract_reference: nonBlank(input.payerCode) && nonBlank(input.contractReference),
    local_contract_review: hasReviewedActiveContract(input),
    local_effective_window: hasCoherentLocalEffectiveWindow(input),
  };

  const gates = HOSPITAL_PAYER_READINESS_GATE_IDS.map(id => ({
    ...GATE_METADATA[id],
    state: states[id] ? "verified" as const : "missing" as const,
  }));
  const missingGateIds = gates.filter(gate => gate.state === "missing").map(gate => gate.id);
  const readyForInternalPreparation = missingGateIds.length === 0;

  return {
    packetVersion: "hospital-payer-readiness-v1" as const,
    operatingMode: "internal-contract-readiness" as const,
    activationPolicy: "fail-closed" as const,
    facilityType: isSupportedFacilityType(input.facilityType) ? input.facilityType : null,
    readinessState: readyForInternalPreparation ? "internal-preparation-ready" as const : "blocked" as const,
    externalOperationAllowed: false as const,
    externalOperationState: "blocked" as const,
    gates,
    missingGateIds,
    nextAction: readyForInternalPreparation
      ? "اكتمل التحقق الداخلي فقط؛ يظل أي تكامل أو أهلية أو تفويض أو مطالبة أو تحصيل أو تسوية خارجية محجوباً إلى حين حزمة أدلة ومراجعة وتفعيل منفصل مصرح به."
      : "أكمل أدلة النطاق وسجل العقد الداخلي والمراجعة ونافذة السريان المحلية قبل استعمال السجل في أي تحضير داخلي.",
    limitation: "لا تقرر هذه السياسة أهلية أو منفعة أو سعر أو اعتماد أو موافقة أو قبول مطالبة أو دفع، ولا تقرأ أو تكتب قاعدة بيانات ولا ترسل شبكة أو تحفظ أسراراً.",
  };
}
