import { describe, expect, it } from "vitest";
import { KPI_ROLE_TEMPLATES, assertKpiTemplateIntegrity, getKpiRoleTemplate, listKpiRoleTemplates } from "./kpi-role-templates";

describe("remaining KPI role templates", () => {
  it("includes doctor, customer service, and warehouse manager templates", () => {
    expect(listKpiRoleTemplates().map(template => template.role)).toEqual([
      "doctor",
      "customer_service",
      "warehouse_manager",
    ]);
  });

  it("keeps every template bilingual, weighted to 100, and quality-gated", () => {
    for (const template of KPI_ROLE_TEMPLATES) {
      expect(assertKpiTemplateIntegrity(template)).toBe(true);
      expect(template.mandatoryQualityGate).toBe(true);
      expect(template.reviewPeriod).toBe("monthly");
      expect(template.items.length).toBeGreaterThanOrEqual(5);
      expect(template.items.every(item => item.nameAr.length > 0 && item.nameEn.length > 0)).toBe(true);
      expect(template.items.every(item => item.evidence.length > 0 && item.qualityGate.length > 0)).toBe(true);
      expect(template.items.reduce((total, item) => total + item.weight, 0)).toBe(100);
    }
  });

  it("preserves role-specific operational coverage", () => {
    expect(getKpiRoleTemplate("doctor").items.map(item => item.code)).toEqual(expect.arrayContaining(["DOC_CLINICAL_SAFETY", "DOC_PATIENT_PRIVACY"]));
    expect(getKpiRoleTemplate("customer_service").items.map(item => item.code)).toEqual(expect.arrayContaining(["CSR_FIRST_RESPONSE", "CSR_ESCALATION"]));
    expect(getKpiRoleTemplate("warehouse_manager").items.map(item => item.code)).toEqual(expect.arrayContaining(["WH_FEFO_EXPIRY", "WH_STOCK_ACCURACY"]));
  });

  it("fails closed when a template is incomplete", () => {
    const incomplete = { ...getKpiRoleTemplate("doctor"), items: [{ ...getKpiRoleTemplate("doctor").items[0], weight: 99, evidence: [] }] } as never;
    expect(() => assertKpiTemplateIntegrity(incomplete)).toThrow();
  });
});
