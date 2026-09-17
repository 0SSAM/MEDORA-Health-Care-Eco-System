export type GovernmentIntegrationGateId =
  | "official_specification"
  | "authority_authorization"
  | "organization_registration"
  | "managed_secret_reference"
  | "certificate_registration"
  | "sandbox_verification"
  | "data_mapping_approval"
  | "privacy_security_review"
  | "retry_idempotency_verification"
  | "acknowledgement_contract_verification"
  | "production_acceptance_record";

export type GovernmentIntegrationGateState = "missing" | "verified";
export type GovernmentIntegrationActivationState = "blocked" | "ready-for-authorized-activation";

type GovernmentIntegrationGateDefinition = {
  id: GovernmentIntegrationGateId;
  titleAr: string;
  titleEn: string;
  evidenceRequired: string;
  reviewOwner: string;
};

export const GOVERNMENT_INTEGRATION_GATE_DEFINITIONS: readonly GovernmentIntegrationGateDefinition[] = [
  { id: "official_specification", titleAr: "المواصفة التقنية الرسمية", titleEn: "Official technical specification", evidenceRequired: "نسخة مؤرخة من مواصفة الواجهة ونطاق العمليات المسموح بها", reviewOwner: "المسؤول التنظيمي والتقني" },
  { id: "authority_authorization", titleAr: "إذن الجهة المختصة", titleEn: "Authority authorization", evidenceRequired: "خطاب أو سجل اعتماد يحدد المؤسسة والخدمة والبيئة", reviewOwner: "المسؤول التنظيمي" },
  { id: "organization_registration", titleAr: "تسجيل المؤسسة والنطاق", titleEn: "Organization and scope registration", evidenceRequired: "معرّفات المؤسسة والفروع والاختصاص القضائي المعتمدة", reviewOwner: "مسؤول المؤسسة" },
  { id: "managed_secret_reference", titleAr: "مرجع الاعتماد السري المُدار", titleEn: "Managed secret reference", evidenceRequired: "مرجع مدير أسرار فقط؛ لا تُسجل كلمة مرور أو رمز أو مفتاح في الطلبات أو الواجهة", reviewOwner: "مسؤول الأمن" },
  { id: "certificate_registration", titleAr: "تسجيل الشهادة أو هوية العميل", titleEn: "Certificate or client identity registration", evidenceRequired: "دليل تسجيل الشهادة وبصمتها ومسار تدويرها دون مواد سرية", reviewOwner: "مسؤول الأمن" },
  { id: "sandbox_verification", titleAr: "التحقق في بيئة الاختبار", titleEn: "Sandbox verification", evidenceRequired: "نتائج اختبار موثقة لبيئة الجهة الرسمية، دون بيانات مرضى حقيقية", reviewOwner: "قائد التكامل" },
  { id: "data_mapping_approval", titleAr: "اعتماد خرائط البيانات", titleEn: "Approved data mappings", evidenceRequired: "خريطة حقول وإصدارات ورسائل خطأ وضوابط تقليل البيانات", reviewOwner: "مالك البيانات والامتثال" },
  { id: "privacy_security_review", titleAr: "مراجعة الخصوصية والأمن", titleEn: "Privacy and security review", evidenceRequired: "تقييم خصوصية وأمن معتمد، وسجل مخاطر وخطة معالجة", reviewOwner: "مسؤول الخصوصية والأمن" },
  { id: "retry_idempotency_verification", titleAr: "التحقق من إعادة المحاولة وعدم التكرار", titleEn: "Retry and idempotency verification", evidenceRequired: "اختبارات مفاتيح عدم التكرار والتعافي من الفشل وحدود الإرسال", reviewOwner: "قائد التكامل" },
  { id: "acknowledgement_contract_verification", titleAr: "التحقق من الإقرار والتسوية", titleEn: "Acknowledgement and reconciliation contract", evidenceRequired: "عقد استلام وإقرار وحالات رفض وتسوية وتدقيق", reviewOwner: "المالية أو العمليات المنظمة" },
  { id: "production_acceptance_record", titleAr: "سجل قبول الإنتاج", titleEn: "Production acceptance record", evidenceRequired: "دليل قبول مكتوب ونافذ من الجهة المختصة قبل أي طلب تفعيل منفصل", reviewOwner: "مالك الأعمال والمسؤول التنظيمي" },
] as const;

export type GovernmentIntegrationReadinessInput = Partial<Record<GovernmentIntegrationGateId, boolean>>;

export function buildGovernmentIntegrationReadinessPacket(input: GovernmentIntegrationReadinessInput = {}) {
  const gates = GOVERNMENT_INTEGRATION_GATE_DEFINITIONS.map(definition => ({
    ...definition,
    state: input[definition.id] === true ? "verified" as const : "missing" as const,
  }));
  const verifiedCount = gates.filter(gate => gate.state === "verified").length;
  const complete = verifiedCount === gates.length;

  return {
    packetVersion: "government-readiness-v1" as const,
    connectorId: "egypt-government" as const,
    jurisdiction: "EG" as const,
    integrationMode: "documentation-and-acceptance-readiness" as const,
    activationPolicy: "fail-closed" as const,
    externalSubmissionAllowed: false as const,
    activationState: complete ? "ready-for-authorized-activation" as const : "blocked" as const,
    readinessPercent: Math.round((verifiedCount / gates.length) * 100),
    verifiedCount,
    totalGateCount: gates.length,
    gates,
    missingGateIds: gates.filter(gate => gate.state === "missing").map(gate => gate.id),
    nextAction: complete
      ? "لا يزال التفعيل الخارجي معطلاً؛ يلزم إجراء تفعيل منفصل ومصرح به بعد مراجعة قبول الإنتاج."
      : "اجمع الأدلة الرسمية وراجعها ضمن حزمة الامتثال قبل طلب أي تفعيل خارجي.",
    limitation: "لا ينفذ هذا المسار طلبات شبكة خارجية ولا يقبل أسراراً أو شهادات أو رموزاً في الواجهة أو السجل.",
  };
}
