import { assertRecordBelongsToScope, type RecordScopeContext } from "./data-boundary";

export const INSURANCE_REQUEST_STATUSES = ["DRAFT", "READY_FOR_SUBMISSION", "SUBMITTED", "APPROVED", "PARTIALLY_APPROVED", "REJECTED", "CANCELLED"] as const;
export type InsuranceRequestStatus = typeof INSURANCE_REQUEST_STATUSES[number];

export type InsuranceRequest = {
  requestType: "ELIGIBILITY" | "PREAUTHORIZATION";
  organizationId: number;
  jurisdictionId: number;
  payerCode: string;
  memberReference: string;
  serviceCode: string;
  status: InsuranceRequestStatus;
  externalReference?: string | null;
  credentialGate: "NOT_CONFIGURED" | "TEST_READY" | "PRODUCTION_READY";
};

export function validateInsuranceRequest(request: InsuranceRequest): true {
  if (!Number.isInteger(request.organizationId) || request.organizationId <= 0) throw new Error("Insurance organization is required");
  if (!Number.isInteger(request.jurisdictionId) || request.jurisdictionId <= 0) throw new Error("Insurance jurisdiction is required");
  if (!/^[A-Z0-9._-]{2,80}$/i.test(request.payerCode)) throw new Error("Payer code is invalid");
  if (!request.memberReference.trim()) throw new Error("Member reference is required");
  if (!request.serviceCode.trim()) throw new Error("Service code is required");
  if (request.requestType === "PREAUTHORIZATION" && request.status === "READY_FOR_SUBMISSION" && request.credentialGate === "NOT_CONFIGURED") throw new Error("Payer credentials are required before preauthorization submission");
  if (request.status === "SUBMITTED" && !request.externalReference?.trim()) throw new Error("Submitted insurance requests require an external reference");
  return true;
}

export function assertInsuranceRequestScope(request: InsuranceRequest, context: RecordScopeContext): true {
  if (request.organizationId !== context.organizationId) throw new Error("Cross-organization insurance access denied");
  if (request.jurisdictionId !== context.jurisdictionId) throw new Error("Cross-country insurance access denied");
  return assertRecordBelongsToScope({ entityType: "prescription", organizationId: request.organizationId, jurisdictionId: request.jurisdictionId }, context);
}

export function assertInsuranceTransition(from: InsuranceRequestStatus, to: InsuranceRequestStatus): true {
  const allowed: Record<InsuranceRequestStatus, InsuranceRequestStatus[]> = {
    DRAFT: ["READY_FOR_SUBMISSION", "CANCELLED"],
    READY_FOR_SUBMISSION: ["SUBMITTED", "CANCELLED"],
    SUBMITTED: ["APPROVED", "PARTIALLY_APPROVED", "REJECTED", "CANCELLED"],
    APPROVED: [],
    PARTIALLY_APPROVED: [],
    REJECTED: [],
    CANCELLED: [],
  };
  if (!allowed[from].includes(to)) throw new Error(`Invalid insurance status transition: ${from} -> ${to}`);
  return true;
}

export function insuranceIntegrationReadiness(input: { credentialsConfigured: boolean; endpointConfigured: boolean; organizationRegistered: boolean; humanApproved: boolean }): "BLOCKED" | "TEST_READY" | "PRODUCTION_READY" {
  if (!input.credentialsConfigured || !input.endpointConfigured || !input.organizationRegistered || !input.humanApproved) return "BLOCKED";
  return "PRODUCTION_READY";
}
