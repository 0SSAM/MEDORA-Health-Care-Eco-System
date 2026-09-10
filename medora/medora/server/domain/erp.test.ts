import { describe, expect, it } from "vitest";
import { assertPrescriptionConfirmed, buildDataMatrixTraceContract, calculateCompoundingCost, calculateEgyptianPayroll, classifyInsuranceAging, classifyInsuranceClaim, createAuditHash, createCompoundingLiability, decryptSensitiveBytes, deductCompoundingBom, EGYPTIAN_TPA_PROVIDER_CODES, encryptSensitiveBytes, evaluateColdChain, buildLegalLabel, planInventoryAdjustment, preparePosSale, validateAuthorityArtifacts, validateEtaInvoice, validateFinanceEntry, validateInventorySchedulePolicy, validatePatientRecord, validatePrescriptionUpload, verifyAuditHashChain } from "./erp";

describe("ERP domain services", () => {
  it("calculates overtime and Ramadan/night shift metrics", () => {
    const result = calculateEgyptianPayroll({ baseSalary: 10000, hourlyRate: 100, overtimeHours: 4, leaveDays: 0, unpaidLeaveDeduction: 0, shifts: [{ startHour: 22, endHour: 6, hours: 8, isNight: true, isRamadan: false }, { startHour: 10, endHour: 16, hours: 6, isNight: false, isRamadan: true }] });
    expect(result.gross).toBe(10600);
    expect(result.nightHours).toBe(8);
    expect(result.ramadanHours).toBe(6);
  });

  it("validates ETA invoice fields without claiming remote submission", () => {
    expect(validateEtaInvoice({ taxId: "123456789", invoiceNumber: "INV-1", totalAmount: 25 }).valid).toBe(true);
    expect(validateEtaInvoice({ taxId: "bad", invoiceNumber: "", totalAmount: -1 }).errors).toHaveLength(3);
  });

  it("classifies insurance outcomes and exposes 25 provider codes", () => {
    expect(classifyInsuranceClaim({ submittedAmount: 100, approvedAmount: 80 }).status).toBe("PARTIALLY_APPROVED");
    expect(classifyInsuranceClaim({ submittedAmount: 100, rejectionCode: "R1" }).status).toBe("REJECTED");
    expect(EGYPTIAN_TPA_PROVIDER_CODES).toHaveLength(25);
  });

  it("blocks dispensing before pharmacist confirmation", () => {
    expect(() => assertPrescriptionConfirmed("PENDING_REVIEW")).toThrow(/confirmation is required/);
    expect(assertPrescriptionConfirmed("CONFIRMED")).toBe(true);
  });

  it("prepares fractional POS quantity with MOH discount and FEFO allocation", () => {
    const result = preparePosSale({ officialPrice: 100, quantity: 1.5, discountAmount: 10, batches: [{ id: "early", expiryDate: new Date("2026-10-01"), quantityOnHand: 1 }, { id: "late", expiryDate: new Date("2027-01-01"), quantityOnHand: 2 }] });
    expect(result.allocations).toEqual([{ batchId: "early", quantity: 1 }, { batchId: "late", quantity: 0.5 }]);
    expect(result.net).toBe(140);
    expect(() => preparePosSale({ officialPrice: 100, quantity: 1, discountAmount: 7.01, batches: [{ id: "one", expiryDate: new Date("2027-01-01"), quantityOnHand: 1 }] })).toThrow(/MOH/);
  });

  it("covers operational compliance and module boundary rules", () => {
    expect(planInventoryAdjustment([{ id: "b1", expiryDate: new Date("2026-10-01"), quantityOnHand: 2 }], 1, "TRANSFER").allocations[0]?.batchId).toBe("b1");
    expect(classifyInsuranceAging(75)).toBe("61_90");
    expect(evaluateColdChain(5, 2, 8).inRange).toBe(true);
    expect(buildLegalLabel({ productCode: "P1", batchNumber: "B1", expiryDate: "2027-01-01", barcodeValue: "123", qrPayload: "payload" }).verified).toBe(false);
    expect(calculateCompoundingCost([{ quantity: 2, unitCost: 10 }], 5, 10).price).toBe(27.5);
    expect(validateFinanceEntry({ taxAmount: 2, debit: 100, credit: 100 }).balanced).toBe(true);
    expect(validatePatientRecord({ patientCode: "PT-1", consentRecorded: true, chronicCareEnabled: true }).auditable).toBe(true);
  });

  it("covers compounding BOM and authority artifacts", () => {
    expect(deductCompoundingBom([{ componentId: "C1", requiredQuantity: 2, availableQuantity: 3 }])).toEqual([{ componentId: "C1", deductedQuantity: 2 }]);
    expect(() => deductCompoundingBom([{ componentId: "C1", requiredQuantity: 4, availableQuantity: 3 }])).toThrow(/Insufficient/);
    expect(createCompoundingLiability({ batchId: "CMP-1", preparedByUserId: 7, pharmacistApproved: true }).auditable).toBe(true);
    expect(validateAuthorityArtifacts({ authority: "EDA", reference: "EDA-REF", verified: false }).externalVerificationRequired).toBe(true);
    expect(validateAuthorityArtifacts({ authority: "ETA", reference: "ETA-REF", verified: true }).verified).toBe(true);
  });

  it("enforces inventory schedule authorization and path policy", () => {
    expect(validateInventorySchedulePolicy({ role: "manager", path: "/api/scheduled/inventory-alerts", cron: "0 0 6 * * *" })).toBe(true);
    expect(() => validateInventorySchedulePolicy({ role: "cashier", path: "/api/scheduled/inventory-alerts", cron: "0 0 6 * * *" })).toThrow(/Only/);
    expect(() => validateInventorySchedulePolicy({ role: "admin", path: "/api/other", cron: "0 0 6 * * *" })).toThrow(/path/);
  });

  it("rejects invalid prescription uploads and mismatched file signatures", () => {
    expect(() => validatePrescriptionUpload({ mimeType: "application/pdf", byteLength: 100 })).toThrow(/Unsupported/);
    expect(() => validatePrescriptionUpload({ mimeType: "image/png", byteLength: 8 * 1024 * 1024 + 1 })).toThrow(/8MB/);
    expect(() => validatePrescriptionUpload({ mimeType: "image/png", byteLength: 0 })).toThrow(/empty/);
    expect(() => validatePrescriptionUpload({ mimeType: "image/png", byteLength: 4, bytes: new Uint8Array([0, 1, 2, 3]) })).toThrow(/signature/);
    expect(validatePrescriptionUpload({ mimeType: "image/png", byteLength: 8, bytes: new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]) })).toBe(true);
  });

  it("creates and verifies a tamper-evident audit hash chain", () => {
    const first = { previousHash: null, actorId: 1, action: "CREATE", entityType: "SALE", entityId: "1", timestamp: 100 };
    const firstHash = createAuditHash(first);
    const second = { previousHash: firstHash, actorId: 1, action: "UPDATE", entityType: "SALE", entityId: "1", timestamp: 101 };
    const result = verifyAuditHashChain([{ ...first, hash: firstHash }, { ...second, hash: createAuditHash(second) }]);
    expect(result.valid).toBe(true);
    expect(verifyAuditHashChain([{ ...first, hash: "tampered" }]).valid).toBe(false);
  });

  it("builds a provenance-safe GS1 Data Matrix contract without patient data", () => {
    const result = buildDataMatrixTraceContract({ gtin: "06212345678901", batchNumber: "B-2026", expiryDate: "261231", serialNumber: "SN-001", jurisdictionCode: "EG", organizationScope: "ORG-1", sourceReference: "EDA-REF-PENDING" });
    expect(result.format).toBe("GS1_DATA_MATRIX");
    expect(result.payload).toContain("(01)06212345678901");
    expect(result.containsPatientData).toBe(false);
    expect(result.officialAdapterRequired).toBe(true);
    expect(() => buildDataMatrixTraceContract({ gtin: "not-a-gtin", batchNumber: "B", expiryDate: "261231", serialNumber: "S", jurisdictionCode: "EG", organizationScope: "ORG-1", sourceReference: "REF" })).toThrow(/GTIN/);
  });

  it("encrypts and authenticates sensitive bytes with AES-256-GCM", () => {
    const key = new Uint8Array(32).fill(7);
    const plaintext = new TextEncoder().encode("sensitive-document-bytes");
    const envelope = encryptSensitiveBytes({ plaintext, key, keyVersion: "v1" });
    expect(envelope.algorithm).toBe("AES-256-GCM");
    expect(new TextDecoder().decode(decryptSensitiveBytes(envelope, key))).toBe("sensitive-document-bytes");
    expect(() => decryptSensitiveBytes(envelope, new Uint8Array(32).fill(8))).toThrow();
    expect(() => encryptSensitiveBytes({ plaintext, key: new Uint8Array(16), keyVersion: "v1" })).toThrow(/32 bytes/);
  });
});
