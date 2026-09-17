export const COUNTRY_BOUND_ENTITY_TYPES = [
  "medicine",
  "cosmetic",
  "medical_supply",
  "authority",
  "tax",
  "invoice",
  "price",
  "prescription",
  "insurance",
  "payroll",
  "label",
] as const;

export type CountryBoundEntityType = (typeof COUNTRY_BOUND_ENTITY_TYPES)[number];

export type CountryBoundRecord = {
  entityType: CountryBoundEntityType;
  jurisdictionId: number | null | undefined;
  organizationId: number | null | undefined;
};

export function assertCountryBoundRecord(record: CountryBoundRecord) {
  if (!Number.isInteger(record.jurisdictionId) || Number(record.jurisdictionId) <= 0) {
    throw new Error(`${record.entityType} requires a jurisdiction profile`);
  }
  if (!Number.isInteger(record.organizationId) || Number(record.organizationId) <= 0) {
    throw new Error(`${record.entityType} requires an organization scope`);
  }
  return true as const;
}

export function assertCountryRecordContext(record: CountryBoundRecord, context: { jurisdictionId: number; organizationId: number }) {
  assertCountryBoundRecord(record);
  if (record.jurisdictionId !== context.jurisdictionId) {
    throw new Error(`Cross-country ${record.entityType} access denied`);
  }
  if (record.organizationId !== context.organizationId) {
    throw new Error(`Cross-organization ${record.entityType} access denied`);
  }
  return true as const;
}
