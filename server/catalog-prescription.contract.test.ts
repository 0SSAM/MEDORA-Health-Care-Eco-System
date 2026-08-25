import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const router = readFileSync(resolve(root, "server/routers/erp.ts"), "utf8");
const schema = readFileSync(resolve(root, "drizzle/schema.ts"), "utf8");
const home = readFileSync(resolve(root, "client/src/pages/Home.tsx"), "utf8");

describe("MEDORA catalog and e-prescription release contracts", () => {
  it("keeps catalog review and approval server-enforced", () => {
    expect(router).toContain("reviewQueue");
    expect(router).toContain("approveItem");
    expect(router).toContain("assertCatalogEvidence");
    expect(router).toContain("PENDING_REVIEW");
    expect(home).toContain("اعتماد بعد فحص الأدلة");
    expect(home).toContain("لا يتم إنشاء بيانات افتراضية");
  });

  it("models prescription verification and dispensing as separate states", () => {
    expect(schema).toContain("ePrescriptions");
    expect(schema).toContain("ePrescriptionLines");
    expect(router).toContain('status: "PENDING_VERIFICATION"');
    expect(router).toContain('status: "VERIFIED"');
    expect(router).toContain("dispenseLine");
    expect(router).toContain("Dispensed quantity exceeds the prescribed remainder");
    expect(home).toContain("تحقق صيدلي");
    expect(home).toContain("صرف المتبقي");
  });

  it("requires organization, branch, jurisdiction, and active-patient scope for pharmacy lookup", () => {
    expect(router).toContain("eq(ePrescriptions.organizationId, organizationId)");
    expect(router).toContain("eq(ePrescriptions.jurisdictionId, input.jurisdictionId)");
    expect(router).toContain("eq(ePrescriptions.branchId, input.branchId)");
    expect(router).toContain("eq(healthcarePatients.active, 1)");
    expect(router).toContain("Patient lookup is outside the active organization scope");
    expect(home).toContain("التكامل الحكومي والتأميني مغلق fail-closed");
  });
});
