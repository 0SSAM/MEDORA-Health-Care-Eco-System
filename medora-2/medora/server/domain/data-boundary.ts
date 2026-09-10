import { assertSameJurisdiction } from "./regional-engine";

export type JurisdictionBoundRecord = {
  entityType: "product" | "inventory_batch" | "sale" | "prescription" | "catalog_item";
  jurisdictionId: number | null | undefined;
};

export type OrganizationScopedRecord = JurisdictionBoundRecord & {
  organizationId: number | null | undefined;
};

export type RecordScopeContext = {
  jurisdictionId: number;
  organizationId: number;
};

export function assertRecordBelongsToScope(record: OrganizationScopedRecord, context: RecordScopeContext) {
  assertRecordBelongsToJurisdiction(record, context.jurisdictionId);
  if (!Number.isInteger(context.organizationId) || context.organizationId <= 0) {
    throw new Error("Expected organization is required");
  }
  if (record.organizationId == null) {
    throw new Error(`${record.entityType} is not organization-bound`);
  }
  if (record.organizationId !== context.organizationId) {
    throw new Error(`Cross-organization ${record.entityType} access denied`);
  }
  return true as const;
}

export function assertRecordsShareScope(records: OrganizationScopedRecord[], context: RecordScopeContext) {
  records.forEach(record => assertRecordBelongsToScope(record, context));
  return true as const;
}

export function assertRecordBelongsToJurisdiction(record: JurisdictionBoundRecord, expectedJurisdictionId: number) {
  if (!Number.isInteger(expectedJurisdictionId) || expectedJurisdictionId <= 0) {
    throw new Error("Expected jurisdiction is required");
  }
  if (record.jurisdictionId == null) {
    throw new Error(`${record.entityType} is not jurisdiction-bound`);
  }
  if (record.jurisdictionId !== expectedJurisdictionId) {
    throw new Error(`Cross-country ${record.entityType} access denied`);
  }
  return assertSameJurisdiction(String(record.jurisdictionId), String(expectedJurisdictionId));
}

export function assertRecordsShareJurisdiction(records: JurisdictionBoundRecord[], expectedJurisdictionId: number) {
  records.forEach(record => assertRecordBelongsToJurisdiction(record, expectedJurisdictionId));
  return true as const;
}
