import { createHash } from "node:crypto";
import { assertRecordBelongsToScope, type RecordScopeContext } from "./data-boundary";

export const REPORT_RECIPIENT_ROLES = ["admin", "org_admin", "manager", "operations_manager", "clinical_lead", "auditor"] as const;
export type ReportRecipientRole = typeof REPORT_RECIPIENT_ROLES[number];

export type ReportDefinition = {
  code: string;
  title: string;
  organizationId: number;
  jurisdictionId: number;
  recipientRoles: ReportRecipientRole[];
  scheduleCron: string;
  deliveryChannel: "in_app" | "email" | "webhook";
  queryKey: string;
  active: boolean;
  containsSensitiveData: boolean;
};

export type ReportRunInput = {
  reportCode: string;
  organizationId: number;
  jurisdictionId: number;
  scheduledForUtc: string;
};

export function validateReportDefinition(definition: ReportDefinition): true {
  if (!/^[a-z0-9][a-z0-9._-]{2,80}$/.test(definition.code)) throw new Error("Report code is invalid");
  if (!definition.title.trim()) throw new Error("Report title is required");
  if (!Number.isInteger(definition.organizationId) || definition.organizationId <= 0) throw new Error("Report organization is required");
  if (!Number.isInteger(definition.jurisdictionId) || definition.jurisdictionId <= 0) throw new Error("Report jurisdiction is required");
  if (!definition.recipientRoles.length || definition.recipientRoles.some(role => !REPORT_RECIPIENT_ROLES.includes(role))) throw new Error("Report recipients are invalid");
  if (!/^\d+ \S+ \S+ \S+ \S+ \S+$/.test(definition.scheduleCron)) throw new Error("Report schedule must be a six-field UTC cron expression");
  if (!definition.queryKey.trim() || /[;]|\b(select|insert|update|delete|drop|alter)\b/i.test(definition.queryKey)) throw new Error("Report query must reference a server-owned query key");
  if (definition.containsSensitiveData && !definition.recipientRoles.some(role => role === "admin" || role === "org_admin" || role === "clinical_lead")) throw new Error("Sensitive reports require an authorized recipient role");
  return true;
}

export function assertReportJurisdictionAccess(jurisdictionId: number, allowedJurisdictionIds: readonly number[] | null): true {
  if (allowedJurisdictionIds !== null && !allowedJurisdictionIds.includes(jurisdictionId)) throw new Error("Cross-country report access denied");
  return true;
}

export function assertReportScope(definition: ReportDefinition, context: RecordScopeContext): true {
  if (definition.organizationId !== context.organizationId) throw new Error("Cross-organization report access denied");
  if (definition.jurisdictionId !== context.jurisdictionId) throw new Error("Cross-country report access denied");
  if (!definition.active) throw new Error("Report is inactive");
  return true;
}

export function buildIdempotencyKey(input: ReportRunInput): string {
  if (!input.reportCode.trim() || !input.scheduledForUtc.trim()) throw new Error("Report run identity is required");
  if (!Number.isInteger(input.organizationId) || input.organizationId <= 0 || !Number.isInteger(input.jurisdictionId) || input.jurisdictionId <= 0) throw new Error("Report run scope is required");
  return createHash("sha256").update(JSON.stringify(input)).digest("hex");
}

export function authorizeReportRecipient(input: { role: string; organizationId: number; jurisdictionId: number; definition: ReportDefinition; context: RecordScopeContext }): true {
  assertReportScope(input.definition, input.context);
  if (input.organizationId !== input.definition.organizationId || input.jurisdictionId !== input.definition.jurisdictionId) throw new Error("Recipient scope does not match report scope");
  if (!REPORT_RECIPIENT_ROLES.includes(input.role as ReportRecipientRole) || !input.definition.recipientRoles.includes(input.role as ReportRecipientRole)) throw new Error("Recipient is not authorized for this report");
  return true;
}

export function assertScopedReportRecord(record: { entityType: "product" | "inventory_batch" | "sale" | "prescription" | "catalog_item"; jurisdictionId: number | null | undefined; organizationId: number | null | undefined }, context: RecordScopeContext): true {
  return assertRecordBelongsToScope(record, context);
}
