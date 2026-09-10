export type KpiRole = "doctor" | "customer_service" | "warehouse_manager";

export type KpiTemplateItem = {
  code: string;
  nameAr: string;
  nameEn: string;
  descriptionAr: string;
  descriptionEn: string;
  weight: number;
  target: string;
  cadence: "daily" | "weekly" | "monthly";
  evidence: string[];
  qualityGate: "clinical_safety" | "privacy" | "sla" | "inventory_control" | "audit";
};

export type KpiRoleTemplate = {
  role: KpiRole;
  roleNameAr: string;
  roleNameEn: string;
  templateVersion: string;
  reviewPeriod: "monthly";
  mandatoryQualityGate: true;
  items: readonly KpiTemplateItem[];
};

const doctorTemplate = {
  role: "doctor",
  roleNameAr: "الطبيب",
  roleNameEn: "Doctor",
  templateVersion: "2026.08.21.1",
  reviewPeriod: "monthly",
  mandatoryQualityGate: true,
  items: [
    { code: "DOC_CLINICAL_SAFETY", nameAr: "سلامة القرار السريري", nameEn: "Clinical decision safety", descriptionAr: "الالتزام بالبروتوكولات وتوثيق مبررات القرار والإحالات عند الحاجة.", descriptionEn: "Follow approved protocols and document decision rationale and referrals when needed.", weight: 30, target: "100% of sampled records have required safety fields", cadence: "monthly", evidence: ["audited clinical record", "referral record", "quality-review outcome"], qualityGate: "clinical_safety" },
    { code: "DOC_DOCUMENTATION", nameAr: "اكتمال التوثيق الطبي", nameEn: "Clinical documentation completeness", descriptionAr: "إكمال التاريخ المرضي والتقييم والخطة والمتابعة دون بيانات سريرية مخترعة.", descriptionEn: "Complete history, assessment, plan, and follow-up fields without fabricated clinical data.", weight: 25, target: "≥ 95% completeness in approved sample", cadence: "monthly", evidence: ["signed encounter record", "documentation audit"], qualityGate: "audit" },
    { code: "DOC_CONTINUITY", nameAr: "استمرارية الرعاية", nameEn: "Continuity of care", descriptionAr: "تسليم آمن للحالات ومتابعة النتائج والإحالات ضمن المواعيد المعتمدة.", descriptionEn: "Safely hand over cases and follow results and referrals within approved timeframes.", weight: 20, target: "≥ 95% of due follow-ups completed or escalated", cadence: "weekly", evidence: ["follow-up task", "referral acknowledgement", "escalation record"], qualityGate: "clinical_safety" },
    { code: "DOC_PATIENT_PRIVACY", nameAr: "خصوصية المريض والموافقة", nameEn: "Patient privacy and consent", descriptionAr: "استخدام البيانات السريرية ضمن الغرض والصلاحية وتوثيق الموافقات المطلوبة.", descriptionEn: "Use clinical data only for authorized purposes and document required consent.", weight: 15, target: "0 confirmed unauthorized disclosures", cadence: "monthly", evidence: ["consent record", "access audit", "privacy review"], qualityGate: "privacy" },
    { code: "DOC_TEAM_HANDOVER", nameAr: "التواصل والتسليم للفريق", nameEn: "Team communication and handover", descriptionAr: "تسليم المعلومات الحرجة بوضوح وتسجيل المخاطر والإجراءات التالية.", descriptionEn: "Communicate critical information clearly and record risks and next actions.", weight: 10, target: "≥ 95% of sampled handovers contain required fields", cadence: "weekly", evidence: ["handover checklist", "incident-prevention review"], qualityGate: "audit" },
  ],
} as const satisfies KpiRoleTemplate;

const customerServiceTemplate = {
  role: "customer_service",
  roleNameAr: "خدمة العملاء",
  roleNameEn: "Customer Service",
  templateVersion: "2026.08.21.1",
  reviewPeriod: "monthly",
  mandatoryQualityGate: true,
  items: [
    { code: "CSR_FIRST_RESPONSE", nameAr: "زمن الاستجابة الأولى", nameEn: "First response time", descriptionAr: "الاستجابة للطلبات ضمن هدف SLA المعتمد دون كشف بيانات غير لازمة.", descriptionEn: "Respond within the approved SLA target without exposing unnecessary data.", weight: 25, target: "≥ 95% within configured first-response SLA", cadence: "weekly", evidence: ["ticket timeline", "SLA event", "redacted conversation audit"], qualityGate: "sla" },
    { code: "CSR_RESOLUTION", nameAr: "جودة الحل والإغلاق", nameEn: "Resolution quality", descriptionAr: "حل الطلب من أول مرة أو تصعيده للمسار المختص مع سبب واضح.", descriptionEn: "Resolve at first contact or escalate to the correct workflow with a clear reason.", weight: 25, target: "≥ 90% resolved or correctly escalated", cadence: "monthly", evidence: ["ticket disposition", "resolution note", "escalation record"], qualityGate: "sla" },
    { code: "CSR_PRIVACY", nameAr: "الخصوصية والتحقق من الهوية", nameEn: "Privacy and identity verification", descriptionAr: "التحقق من هوية العميل قبل عرض أو تعديل معلومات الحساب أو الطلب.", descriptionEn: "Verify identity before viewing or changing account or order information.", weight: 20, target: "100% of sampled sensitive interactions verified", cadence: "monthly", evidence: ["verification event", "access audit", "quality sample"], qualityGate: "privacy" },
    { code: "CSR_EMPATHY_ACCURACY", nameAr: "الدقة والاحترافية", nameEn: "Accuracy and professionalism", descriptionAr: "تقديم إجابة دقيقة ومهذبة باستخدام قاعدة المعرفة المعتمدة دون وعود غير موثقة.", descriptionEn: "Provide accurate, respectful answers using approved knowledge without unsupported promises.", weight: 20, target: "≥ 95% quality-review score", cadence: "monthly", evidence: ["human QA review", "approved article reference", "correction record"], qualityGate: "audit" },
    { code: "CSR_ESCALATION", nameAr: "التصعيد الآمن", nameEn: "Safe escalation", descriptionAr: "تصعيد الحالات السريرية أو الحرجة فوراً إلى الجهة المخولة مع حفظ الأثر التدقيقي.", descriptionEn: "Escalate clinical or critical cases promptly to the authorized team with an audit trail.", weight: 10, target: "100% of critical cases escalated within policy", cadence: "weekly", evidence: ["escalation event", "manager acknowledgement", "incident review"], qualityGate: "clinical_safety" },
  ],
} as const satisfies KpiRoleTemplate;

const warehouseManagerTemplate = {
  role: "warehouse_manager",
  roleNameAr: "مسؤول المخازن",
  roleNameEn: "Warehouse Manager",
  templateVersion: "2026.08.21.1",
  reviewPeriod: "monthly",
  mandatoryQualityGate: true,
  items: [
    { code: "WH_STOCK_ACCURACY", nameAr: "دقة أرصدة المخزون", nameEn: "Inventory accuracy", descriptionAr: "مطابقة الرصيد الفعلي مع النظام ضمن حدود التفاوت المعتمدة وبسجل جرد موثق.", descriptionEn: "Reconcile physical stock to system balances within approved tolerance with documented counts.", weight: 25, target: "≥ 98% location-level accuracy", cadence: "weekly", evidence: ["cycle count", "reconciliation report", "variance approval"], qualityGate: "inventory_control" },
    { code: "WH_FEFO_EXPIRY", nameAr: "FEFO والصلاحية", nameEn: "FEFO and expiry control", descriptionAr: "تطبيق الصرف حسب الأقرب انتهاءً وعزل الأصناف المنتهية أو القريبة من الانتهاء وفق السياسة.", descriptionEn: "Apply FEFO and quarantine expired or near-expiry items according to policy.", weight: 25, target: "0 unquarantined expired units; ≥ 98% FEFO compliance", cadence: "weekly", evidence: ["FEFO allocation", "expiry scan", "quarantine record"], qualityGate: "inventory_control" },
    { code: "WH_RECEIVING", nameAr: "دقة الاستلام والتوريد", nameEn: "Receiving accuracy", descriptionAr: "مطابقة الكميات والتشغيلة والصلاحية والمستندات قبل إدخال المخزون.", descriptionEn: "Verify quantities, batch, expiry, and documents before posting received stock.", weight: 20, target: "≥ 99% sampled receipts fully matched", cadence: "weekly", evidence: ["goods receipt", "supplier document", "batch verification"], qualityGate: "audit" },
    { code: "WH_REORDER", nameAr: "إدارة الحدود وإعادة الطلب", nameEn: "Reorder and stock thresholds", descriptionAr: "مراجعة نقاط إعادة الطلب والتنبيهات واتخاذ إجراء موثق دون تجاوز الصلاحيات.", descriptionEn: "Review reorder points and alerts and take documented action within authority.", weight: 15, target: "≥ 95% critical alerts actioned within SLA", cadence: "weekly", evidence: ["stock alert", "purchase request", "manager decision"], qualityGate: "sla" },
    { code: "WH_SAFETY_TRACE", nameAr: "السلامة والتتبع", nameEn: "Safety and traceability", descriptionAr: "الحفاظ على ظروف التخزين والتتبع الكامل للحركة والتحويلات والإتلاف.", descriptionEn: "Maintain storage safety and complete traceability for movements, transfers, and write-offs.", weight: 15, target: "100% of sampled movements traceable", cadence: "monthly", evidence: ["movement audit", "temperature record", "write-off approval"], qualityGate: "inventory_control" },
  ],
} as const satisfies KpiRoleTemplate;

export const KPI_ROLE_TEMPLATES: readonly KpiRoleTemplate[] = [doctorTemplate, customerServiceTemplate, warehouseManagerTemplate];

export function listKpiRoleTemplates(): readonly KpiRoleTemplate[] {
  return KPI_ROLE_TEMPLATES;
}

export function getKpiRoleTemplate(role: KpiRole): KpiRoleTemplate {
  const template = KPI_ROLE_TEMPLATES.find(item => item.role === role);
  if (!template) throw new Error("KPI role template not found");
  return template;
}

export function assertKpiTemplateIntegrity(template: KpiRoleTemplate): true {
  const weightTotal = template.items.reduce((total, item) => total + item.weight, 0);
  if (weightTotal !== 100) throw new Error(`KPI weights must total 100: ${template.role}`);
  if (template.items.some(item => item.weight <= 0 || item.target.trim().length === 0 || item.evidence.length === 0)) {
    throw new Error(`KPI template contains an incomplete item: ${template.role}`);
  }
  return true;
}

for (const template of KPI_ROLE_TEMPLATES) assertKpiTemplateIntegrity(template);
