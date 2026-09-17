/**
 * GAHAR (Egyptian General Authority for Healthcare Accreditation & Regulation)
 * readiness model. Each standard maps to concrete, testable controls present in MEDORA.
 */
export interface GaharStandard {
  code: string;
  titleAr: string;
  domain: "governance" | "medication_safety" | "patient_safety" | "infection_control" | "information_management" | "facility";
  requiredControls: string[];
  implemented: string[];   // which are wired in code today
}

export const GAHAR_STANDARDS: GaharStandard[] = [
  {
    code: "GAHAR-PH-01",
    titleAr: "إدارة الأدوية عالية الخطورة والمخدرة",
    domain: "medication_safety",
    requiredControls: ["controlled_substance_policy", "double_signoff", "dispensing_audit"],
    implemented: ["controlled_substance_policy", "dispensing_audit"],
  },
  {
    code: "GAHAR-PH-02",
    titleAr: "تتبع الأدوية (DataMatrix / باركود)",
    domain: "medication_safety",
    requiredControls: ["gs1_datamatrix_parse", "gtin_checkdigit", "batch_expiry_capture"],
    implemented: ["gs1_datamatrix_parse", "gtin_checkdigit", "batch_expiry_capture"],
  },
  {
    code: "GAHAR-IM-01",
    titleAr: "أمن المعلومات والخصوصية",
    domain: "information_management",
    requiredControls: ["rbac", "audit_log_hmac", "data_boundary", "capture_protection"],
    implemented: ["rbac", "audit_log_hmac", "data_boundary", "capture_protection"],
  },
  {
    code: "GAHAR-PS-01",
    titleAr: "هوية المريض والسلامة",
    domain: "patient_safety",
    requiredControls: ["patient_identity_policy", "icd11_coding"],
    implemented: ["patient_identity_policy", "icd11_coding"],
  },
  {
    code: "GAHAR-GOV-01",
    titleAr: "الحوكمة والامتثال المؤسسي",
    domain: "governance",
    requiredControls: ["ai_governance", "kpi_monitoring", "attendance_integrity"],
    implemented: ["ai_governance", "kpi_monitoring", "attendance_integrity"],
  },
];

export interface GaharReadiness {
  total: number;
  covered: number;
  gaps: { code: string; titleAr: string; missing: string[] }[];
  score: number; // 0..100
}

export function evaluateGaharReadiness(): GaharReadiness {
  const gaps = GAHAR_STANDARDS.map((s) => ({
    code: s.code,
    titleAr: s.titleAr,
    missing: s.requiredControls.filter((c) => !s.implemented.includes(c)),
  })).filter((g) => g.missing.length > 0);
  const covered = GAHAR_STANDARDS.length - gaps.length;
  return {
    total: GAHAR_STANDARDS.length,
    covered,
    gaps,
    score: Math.round((covered / GAHAR_STANDARDS.length) * 100),
  };
}
