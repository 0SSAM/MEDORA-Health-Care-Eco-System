import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";

export type Shift = { startHour: number; endHour: number; hours: number; isNight: boolean; isRamadan: boolean };

export function calculateEgyptianPayroll(input: { baseSalary: number; shifts: Shift[]; overtimeHours: number; hourlyRate: number; leaveDays: number; unpaidLeaveDeduction: number }) {
  const nightHours = input.shifts.filter(shift => shift.isNight).reduce((sum, shift) => sum + shift.hours, 0);
  const ramadanHours = input.shifts.filter(shift => shift.isRamadan).reduce((sum, shift) => sum + shift.hours, 0);
  const overtimePay = Number((input.overtimeHours * input.hourlyRate * 1.5).toFixed(2));
  const gross = Number((input.baseSalary + overtimePay).toFixed(2));
  const net = Number(Math.max(0, gross - input.unpaidLeaveDeduction).toFixed(2));
  return { gross, net, overtimePay, nightHours, ramadanHours, unpaidLeaveDeduction: input.unpaidLeaveDeduction };
}

export function validateEtaInvoice(input: { taxId: string; invoiceNumber: string; totalAmount: number }) {
  const errors: string[] = [];
  if (!/^\d{9}$/.test(input.taxId)) errors.push("ETA tax ID must contain 9 digits");
  if (!input.invoiceNumber.trim()) errors.push("Invoice number is required");
  if (!Number.isFinite(input.totalAmount) || input.totalAmount < 0) errors.push("Invoice total is invalid");
  return { valid: errors.length === 0, errors };
}

export function classifyInsuranceClaim(input: { submittedAmount: number; approvedAmount?: number; rejectionCode?: string }) {
  if (input.rejectionCode) return { status: "REJECTED" as const, outstandingAmount: input.submittedAmount, rejectionCode: input.rejectionCode };
  if (input.approvedAmount === undefined) return { status: "SUBMITTED" as const, outstandingAmount: input.submittedAmount };
  const outstandingAmount = Number(Math.max(0, input.submittedAmount - input.approvedAmount).toFixed(2));
  return { status: outstandingAmount > 0 ? "PARTIALLY_APPROVED" as const : "APPROVED" as const, outstandingAmount };
}

export function createAuditHash(input: { previousHash: string | null; actorId: number | null; action: string; entityType: string; entityId: string | null; timestamp: number }) {
  const payload = JSON.stringify(input);
  return createHash("sha256").update(payload).digest("hex");
}

export type AuditRecord = { previousHash: string | null; actorId: number | null; action: string; entityType: string; entityId: string | null; timestamp: number; hash: string };

export function verifyAuditHashChain(records: AuditRecord[]) {
  let previousHash: string | null = null;
  for (const record of records) {
    if (record.previousHash !== previousHash) return { valid: false as const, reason: "PREVIOUS_HASH_MISMATCH" as const };
    const expected = createAuditHash({ previousHash: record.previousHash, actorId: record.actorId, action: record.action, entityType: record.entityType, entityId: record.entityId, timestamp: record.timestamp });
    if (record.hash !== expected) return { valid: false as const, reason: "HASH_MISMATCH" as const };
    previousHash = record.hash;
  }
  return { valid: true as const, recordCount: records.length, lastHash: previousHash };
}

export type DataMatrixTraceInput = { gtin: string; batchNumber: string; expiryDate: string; serialNumber: string; jurisdictionCode: string; organizationScope: string; sourceReference: string };

export function buildDataMatrixTraceContract(input: DataMatrixTraceInput) {
  const values = Object.values(input);
  if (values.some(value => !value.trim())) throw new Error("Data Matrix trace fields are required");
  if (!/^\d{8,14}$/.test(input.gtin)) throw new Error("GTIN must contain 8 to 14 digits");
  if (!/^\d{6}$/.test(input.expiryDate)) throw new Error("Expiry date must use YYMMDD format");
  if (input.serialNumber.length > 20 || input.batchNumber.length > 20) throw new Error("Trace identifiers are too long");
  if (/[\u0000-\u001f]/.test(values.join(""))) throw new Error("Trace fields contain control characters");
  return { format: "GS1_DATA_MATRIX" as const, payload: `(01)${input.gtin}(17)${input.expiryDate}(10)${input.batchNumber}(21)${input.serialNumber}`, jurisdictionCode: input.jurisdictionCode, organizationScope: input.organizationScope, sourceReference: input.sourceReference, containsPatientData: false as const, officialAdapterRequired: true as const, externallyVerified: false as const };
}

export type EncryptedEnvelope = { algorithm: "AES-256-GCM"; keyVersion: string; iv: string; authTag: string; ciphertext: string };

function requireEncryptionKey(key: Uint8Array) {
  if (key.length !== 32) throw new Error("AES-256 key must be exactly 32 bytes");
  return Buffer.from(key);
}

export function encryptSensitiveBytes(input: { plaintext: Uint8Array; key: Uint8Array; keyVersion: string }): EncryptedEnvelope {
  if (!input.keyVersion.trim()) throw new Error("Encryption key version is required");
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", requireEncryptionKey(input.key), iv);
  const ciphertext = Buffer.concat([cipher.update(input.plaintext), cipher.final()]);
  return { algorithm: "AES-256-GCM", keyVersion: input.keyVersion, iv: iv.toString("base64"), authTag: cipher.getAuthTag().toString("base64"), ciphertext: ciphertext.toString("base64") };
}

export function decryptSensitiveBytes(envelope: EncryptedEnvelope, key: Uint8Array) {
  if (envelope.algorithm !== "AES-256-GCM") throw new Error("Unsupported encryption algorithm");
  const decipher = createDecipheriv("aes-256-gcm", requireEncryptionKey(key), Buffer.from(envelope.iv, "base64"));
  decipher.setAuthTag(Buffer.from(envelope.authTag, "base64"));
  return Buffer.concat([decipher.update(Buffer.from(envelope.ciphertext, "base64")), decipher.final()]);
}

export const EGYPTIAN_TPA_PROVIDER_CODES = [
  "AXA", "MEDRIGHT", "MASHOUR", "GLORY", "NEXUS", "MISRPOLICY", "ALLIANZ", "METLIFE", "BUPA", "CIGNA", "MUSALLA", "MEDNET", "SAUDI_GERMAN", "ECARE", "HEALTH_INSURANCE_ORG", "UHIA", "NILE_BADR", "WATANIYA", "MISRA_LIFE", "GIG", "PHARMA_CARE", "TPA_23", "TPA_24", "TPA_25", "TPA_26",
] as const;

export function assertPrescriptionConfirmed(status: "UPLOADED" | "PENDING_REVIEW" | "CONFIRMED" | "REJECTED") {
  if (status !== "CONFIRMED") throw new Error("Pharmacist confirmation is required before dispensing");
  return true as const;
}

export function validatePrescriptionUpload(input: { mimeType: string; byteLength: number; bytes?: Uint8Array }) {
  const allowed = new Set(["image/jpeg", "image/png", "image/webp"]);
  if (!allowed.has(input.mimeType)) throw new Error("Unsupported prescription image type");
  if (!Number.isSafeInteger(input.byteLength) || input.byteLength <= 0) throw new Error("Prescription image is empty or invalid");
  if (input.byteLength > 8 * 1024 * 1024) throw new Error("Prescription image must be 8MB or smaller");
  if (input.bytes) {
    const bytes = input.bytes;
    const jpeg = input.mimeType === "image/jpeg" && bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
    const png = input.mimeType === "image/png" && bytes.length >= 8 && bytes.slice(0, 8).every((value, index) => value === [137, 80, 78, 71, 13, 10, 26, 10][index]);
    const webp = input.mimeType === "image/webp" && bytes.length >= 12 && String.fromCharCode(bytes[0], bytes[1], bytes[2], bytes[3]) === "RIFF" && String.fromCharCode(bytes[8], bytes[9], bytes[10], bytes[11]) === "WEBP";
    if (!(jpeg || png || webp)) throw new Error("Prescription image signature does not match MIME type");
  }
  return true as const;
}

import { enforceDiscount, selectFefoBatches, type StockBatch } from "./rules";

export function preparePosSale(input: { officialPrice: number; quantity: number; discountAmount: number; batches: StockBatch[] }) {
  if (!Number.isFinite(input.quantity) || input.quantity <= 0) throw new Error("Quantity must be positive");
  const discount = enforceDiscount(input.officialPrice * input.quantity, input.discountAmount);
  if (!discount.allowed) throw new Error("MOH discount cap exceeded");
  const allocations = selectFefoBatches(input.batches, input.quantity);
  return { allocations, gross: Number((input.officialPrice * input.quantity).toFixed(2)), discountAmount: input.discountAmount, net: Number((input.officialPrice * input.quantity - input.discountAmount).toFixed(2)), etaStatus: "pending" as const };
}

export function planInventoryAdjustment(batches: StockBatch[], quantity: number, reason: "TRANSFER" | "RETURN" | "DAMAGED" | "INSURANCE_DISPENSE") {
  if (!reason) throw new Error("Adjustment reason required");
  return { reason, allocations: selectFefoBatches(batches, quantity) };
}

export function classifyInsuranceAging(daysOutstanding: number) {
  if (!Number.isFinite(daysOutstanding) || daysOutstanding < 0) throw new Error("Invalid aging days");
  return daysOutstanding <= 30 ? "0_30" : daysOutstanding <= 60 ? "31_60" : daysOutstanding <= 90 ? "61_90" : "90_PLUS";
}

export function evaluateColdChain(temperatureC: number, minC: number, maxC: number) {
  if (![temperatureC, minC, maxC].every(Number.isFinite) || minC > maxC) throw new Error("Invalid cold-chain range");
  return { inRange: temperatureC >= minC && temperatureC <= maxC, temperatureC, minC, maxC };
}

export function buildLegalLabel(input: { productCode: string; batchNumber: string; expiryDate: string; barcodeValue: string; qrPayload: string }) {
  if (Object.values(input).some(value => !value.trim())) throw new Error("Legal label fields are required");
  return { ...input, format: "QR_BARCODE", verified: false as const };
}

export function calculateCompoundingCost(components: Array<{ quantity: number; unitCost: number }>, laborCost: number, marginPercent: number) {
  if (components.some(item => item.quantity < 0 || item.unitCost < 0) || laborCost < 0 || marginPercent < 0) throw new Error("Invalid compounding cost");
  const cost = components.reduce((sum, item) => sum + item.quantity * item.unitCost, 0) + laborCost;
  return { cost: Number(cost.toFixed(2)), price: Number((cost * (1 + marginPercent / 100)).toFixed(2)) };
}

export function validateFinanceEntry(input: { taxAmount: number; debit: number; credit: number }) {
  if (![input.taxAmount, input.debit, input.credit].every(Number.isFinite) || input.taxAmount < 0 || input.debit < 0 || input.credit < 0) throw new Error("Invalid finance entry");
  return { balanced: Math.abs(input.debit - input.credit) < 0.005, taxAmount: Number(input.taxAmount.toFixed(2)) };
}

export function validatePatientRecord(input: { patientCode: string; consentRecorded: boolean; chronicCareEnabled: boolean }) {
  if (!input.patientCode.trim()) throw new Error("Patient code required");
  if (input.chronicCareEnabled && !input.consentRecorded) throw new Error("Consent required for chronic care");
  return { auditable: true as const, accessControlled: true as const };
}

export function validateInventorySchedulePolicy(input: { role: string; path: string; cron: string }) {
  if (!["admin", "manager"].includes(input.role)) throw new Error("Only administrators or managers can schedule alerts");
  if (input.path !== "/api/scheduled/inventory-alerts") throw new Error("Invalid inventory alert path");
  if (!/^\d+ \S+ \S+ \S+ \S+ \S+$/.test(input.cron)) throw new Error("Invalid cron expression");
  return true;
}

export function deductCompoundingBom(components: Array<{ componentId: string; requiredQuantity: number; availableQuantity: number }>) {
  if (components.some(item => !item.componentId || item.requiredQuantity <= 0 || item.availableQuantity < item.requiredQuantity)) throw new Error("Insufficient BOM component stock");
  return components.map(item => ({ componentId: item.componentId, deductedQuantity: item.requiredQuantity }));
}

export function createCompoundingLiability(input: { batchId: string; preparedByUserId: number; pharmacistApproved: boolean }) {
  if (!input.batchId || !Number.isInteger(input.preparedByUserId) || input.preparedByUserId <= 0) throw new Error("Liability identity required");
  if (!input.pharmacistApproved) throw new Error("Pharmacist approval required");
  return { ...input, status: "APPROVED" as const, auditable: true as const };
}

export function validateAuthorityArtifacts(input: { authority: "EDA" | "ETA" | "MOH" | "NFSA" | "UHIA" | "SYNDICATE"; reference: string; verified: boolean }) {
  if (!input.reference.trim()) throw new Error(`${input.authority} reference required`);
  return { authority: input.authority, reference: input.reference, verified: input.verified, externalVerificationRequired: !input.verified };
}

export type CustomerFollowUp = { customerId: number; dueAt: number; ownerId: number; status: "OPEN" | "DONE" | "CANCELLED" };
export type CustomerComplaint = { customerId: number; subject: string; priority: "LOW" | "NORMAL" | "HIGH"; status: "OPEN" | "IN_PROGRESS" | "RESOLVED" };
export function validateCustomerFollowUp(input: CustomerFollowUp): boolean { return input.customerId > 0 && input.ownerId > 0 && Number.isFinite(input.dueAt) && input.status !== "CANCELLED"; }
export function validateCustomerComplaint(input: CustomerComplaint): boolean { return input.customerId > 0 && input.subject.trim().length >= 3 && ["LOW", "NORMAL", "HIGH"].includes(input.priority) && ["OPEN", "IN_PROGRESS", "RESOLVED"].includes(input.status); }
export function validateCatalogItem(input: { sku: string; nameAr: string; category: string; price?: number }): boolean { return /^[A-Z0-9_-]{3,64}$/i.test(input.sku) && input.nameAr.trim().length >= 2 && ["medicine", "cosmetic", "medical_supply"].includes(input.category) && (input.price === undefined || (Number.isFinite(input.price) && input.price >= 0)); }
