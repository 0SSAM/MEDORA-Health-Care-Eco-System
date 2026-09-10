export type PharmacopeiaJurisdiction = "EG" | "JO" | "QA" | "MA" | "regional" | "international";

export type PharmacopeiaReferencePurpose =
  | "quality_specification"
  | "identity_and_assay"
  | "pharmacist_reference"
  | "regulatory_evidence_review";

export type PharmacopeiaSourceKind =
  | "national_authority"
  | "regional_authority"
  | "international_standard"
  | "licensed_publisher"
  | "user_supplied";

export type PharmacopeiaReference = {
  sourceId: string;
  title: string;
  issuingAuthority: string | null;
  sourceKind: PharmacopeiaSourceKind;
  jurisdiction: PharmacopeiaJurisdiction;
  edition: string | null;
  effectiveDate: string | null;
  sourceUrl: string | null;
  accessStatus: "verified_open" | "licensed" | "restricted" | "unverified";
  monographId: string | null;
  verifiedAt: string | null;
  purposes: PharmacopeiaReferencePurpose[];
};

export type PharmacopeiaUseRequest = {
  jurisdiction: Exclude<PharmacopeiaJurisdiction, "regional" | "international">;
  purpose: PharmacopeiaReferencePurpose;
  requestedMonographId?: string | null;
  now?: string;
};

export function missingPharmacopeiaReferenceRequirements(reference: PharmacopeiaReference, request: PharmacopeiaUseRequest) {
  const missing: string[] = [];
  if (!reference.sourceId.trim()) missing.push("sourceId");
  if (!reference.title.trim()) missing.push("title");
  if (!reference.issuingAuthority?.trim()) missing.push("issuingAuthority");
  if (!reference.edition?.trim()) missing.push("edition");
  if (!reference.effectiveDate?.trim()) missing.push("effectiveDate");
  if (!reference.sourceUrl?.trim()) missing.push("sourceUrl");
  if (!reference.verifiedAt?.trim()) missing.push("verifiedAt");
  if (reference.accessStatus !== "verified_open" && reference.accessStatus !== "licensed") missing.push("licensedOrVerifiedAccess");
  if (reference.jurisdiction !== request.jurisdiction && reference.jurisdiction !== "international") {
    missing.push("jurisdictionScope");
  }
  if (!reference.purposes.includes(request.purpose)) missing.push("purposeScope");
  if (request.requestedMonographId && reference.monographId !== request.requestedMonographId) {
    missing.push("monographId");
  }
  const now = request.now ? Date.parse(request.now) : Date.now();
  const effective = reference.effectiveDate ? Date.parse(reference.effectiveDate) : Number.NaN;
  const verified = reference.verifiedAt ? Date.parse(reference.verifiedAt) : Number.NaN;
  if (!Number.isFinite(effective) || effective > now) missing.push("effectiveDateValidity");
  if (!Number.isFinite(verified) || verified > now) missing.push("verificationDateValidity");
  return missing;
}

export function canUsePharmacopeiaReference(reference: PharmacopeiaReference, request: PharmacopeiaUseRequest) {
  return missingPharmacopeiaReferenceRequirements(reference, request).length === 0;
}

export function assertPharmacopeiaReference(reference: PharmacopeiaReference, request: PharmacopeiaUseRequest) {
  const missing = missingPharmacopeiaReferenceRequirements(reference, request);
  if (missing.length) throw new Error(`Pharmacopeia reference is not ready: ${missing.join(", ")}`);
  return true as const;
}

/** A pharmacopeia reference supports evidence review; it never proves product registration or market authorization. */
export function canReferenceApproveCommercialProduct() {
  return false as const;
}

export const EGYPTIAN_PHARMACOPEIA_AUTHORITY_REFERENCE = {
  sourceId: "eda-egyptian-pharmacopoeia",
  title: "Egyptian Pharmacopoeia",
  issuingAuthority: "Egyptian Drug Authority",
  sourceKind: "national_authority" as const,
  jurisdiction: "EG" as const,
  sourceUrl: "https://edaegypt.gov.eg/ar/الدستور-الدوائي-المصري/",
};

export const REGIONAL_ARAB_PHARMACOPEIA_PENDING = {
  sourceId: "arab-regional-pharmacopoeia-pending-verification",
  title: "Regional Arab pharmacopeia reference — pending authority verification",
  issuingAuthority: null,
  sourceKind: "regional_authority" as const,
  jurisdiction: "regional" as const,
  accessStatus: "unverified" as const,
};
