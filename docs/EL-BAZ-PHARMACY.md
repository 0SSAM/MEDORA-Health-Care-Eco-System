# El-Baz Pharmacy | صيدلية الباز

## Canonical business identity

- English name: **El-Baz Pharmacy**
- Arabic name: **صيدلية الباز**
- Manager: **Dr. Nouran Tarek**
- Address: **المنصوره، ميدان مشعل، بجوار كشري جدو**
- Landline: **0502243574**
- WhatsApp: **01040716080**
- Country pack: `EG`
- Organization type: `pharmacy`
- Main branch code: `MAIN`

The business profile is part of MEDORA's source-controlled pharmacy surface. The profile is not a substitute for live transaction data, payer credentials, government credentials, product-registration evidence, or regulatory accreditation.

## Executable persistence

The migration `0060_el_baz_pharmacy_profile.sql` creates a scoped `pharmacy_profiles` record keyed by `(organizationId, branchId)` and an immutable pharmacy key. The provisioning command is idempotent and persists the supplied identity, contacts, manager, and branding asset paths without creating a user login credential.

Run against the intended MEDORA database:

```bash
DATABASE_URL="<target MariaDB/MySQL URL>" pnpm provision:el-baz
```

The script reports the resulting `organizationId`, `branchId`, and `persistedProfile: true`. It must not be treated as evidence that the target production database has been provisioned until the command has actually been executed against that database and its result audited.

## API surface

`pharmacyProfile.profile` reads the persisted profile only inside the caller's organization/branch/jurisdiction scope. The existing pharmacy router continues to expose DataMatrix parsing, readiness, GAHAR readiness, capture-protection posture, inter-branch transfer requests, and hospital-ward stock summaries behind the same scope check.

## UI / print surface

`/pharmacy/el-baz` presents the bilingual pharmacy identity, operational entry points, receipt standard, product-label/traceability contract, and the boundary between currently implemented platform capability and external prerequisites. Receipt/label helpers escape user-controlled printable fields. The displayed barcode is explicitly a deterministic visual sample; production labels must use a verified product identifier from MEDORA provenance.

## Capability truth

Implemented/current surface:

- organization and branch identity provisioning
- persisted pharmacy profile
- bilingual branding and print templates
- POS/sales entry point
- inventory and FEFO-oriented foundations
- dispensing and procurement foundations
- customer/CRM and reporting entry points
- GS1/DataMatrix parsing boundary
- pharmacy-scoped authorization and readiness surfaces

Integration-ready / awaiting evidence:

- payer/insurance adapters and live payer credentials
- government/regulatory connectivity and credentials
- verified official medicine/product master-data sources

Broader planned or externally gated completion:

- full warehouse/WMS execution
- complete clinical medication-safety workflow
- external interoperability and production acceptance evidence
- regulatory accreditation/acceptance evidence

No credential, registration number, live government connection, insurer connection, or accreditation status is fabricated by this pharmacy profile.
