# Project TODO

- [x] تشخيص وإصلاح تنبيه Dependabot المفتوح الخاص بـ esbuild في GitHub مع تحقق من سلسلة الاعتمادات.
- [x] إعادة تصميم تجربة نقطة الدخول ولوحة القيادة الرئيسية لتكون أكثر تركيزاً وجاذبية وذكاءً على الهاتف وسطح المكتب.
- [x] إعادة بناء المساعد الذكي كتجربة عائمة واضحة متعددة اللغات بانتقالات سلسة مع استمرار المراجعة البشرية الإلزامية.
- [x] إضافة عقود انحدار لاكتشاف إصلاح الاعتماد وسلوك المساعد وتجربة RTL/LTR الجديدة، ثم إجراء التحقق الشامل.
- [x] إضافة لوحة مساعد منزلقة قابلة للسحب من أي شاشة مصرح بها، مع زر عائم متوافق مع RTL/LTR ومسودة سؤال قابلة للتحرير.
- [x] إنشاء README رئيسي احترافي ثنائي اللغة يشرح قدرات MEDORA ومعمارية العزل والحوكمة وإرشادات التشغيل.

- [x] إضافة سجل تدقيق مركزي موقّع ومحدود البيانات لمحاولات النسخ والطباعة والالتقاط ضمن نطاق المؤسسة/الفرع/الاختصاص.
- [x] ربط إشارات حماية الشاشة في الواجهة بإجراء التدقيق المقيد بالنطاق دون إرسال المحتوى أو بصمة الجهاز.
- [x] إضافة ملفات إشعار الملكية الفكرية وحقوق التأليف وترويسات المصدر الأساسية.
- [x] توثيق خطة حماية العرض الأصلية لتطبيقات Android وiOS وHarmonyOS واختبارات القبول اليدوية المقابلة.
- [x] إضافة واختبار عقود الانحدار لسجل حماية المحتوى، ثم التحقق من TypeScript والاختبارات والبناء.
- [x] إضافة عقد واجهة مباشر يثبت أن `medora:capture-risk` يستدعي إجراء التدقيق بالنطاق الكامل والحمولة المصغرة فقط.

- [x] Analyze all supplied BDF source files, exports, HTML references, archive contents, and APK metadata.
- [x] Define the cross-platform delivery model for iPhone, Android, and Windows as a responsive installable web application/PWA with a documented native-wrapper path if needed.
- [x] Implement secure authentication with protected routes and four roles: admin, pharmacist, cashier, and manager.
- [x] Enforce role permissions in implemented server procedures and UI navigation without relying only on client-side checks.
- [x] Implement POS sales foundation with fractional unit planning, server validation, and FEFO allocation; final fiscal settlement remains integration-gated.
- [x] Implement and test FEFO deduction adapters for inventory operations beyond POS; current selector now covers transfer/return/damaged/insurance adjustment planning.
- [x] Implement MOH pricing validation with an immutable 7% maximum discount cap and server-side tests.
- [x] Implement ETA invoice field validation and auditable pending/submission status foundation; live ETA credentials and submission endpoint remain production prerequisites.
- [x] Implement core inventory batch, expiry, reorder-point, multi-branch, alert, and FEFO schema foundation; transfer/return/damage screens remain integration backlog.
- [x] Add explicit cold-chain monitoring rule coverage and document the dashboard/sensor integration boundary; sensor connector remains a production prerequisite.
- [x] Add verifiable insurance aging classification helper logic and tests alongside the validated 25-provider TPA catalog.
- [x] Add verifiable QR/barcode/legal-label fields and compliance-boundary helper coverage for EDA/ETA/MOH/NFSA/UHIA/syndicate workflows.
- [x] Implement and test compounding costing/pricing and BOM/liability rule foundation; sterile persistence remains a production backlog item.
- [x] Implement payroll, night-shift, Ramadan-hours, overtime, and employee-role rule foundations with tests; employee/leave persistence remains a production backlog item.
- [x] Add verifiable finance tax-validation and balanced cash-flow rule helper/tests plus InstaPay/Meeza integration boundary documentation.
- [x] Implement multi-branch dashboard shell, KPI empty states, smart alert queue foundation, and tamper-evident audit hash helpers; live BI aggregation awaits operational data.
- [x] Implement prescription image upload and server-side built-in LLM vision extraction for drug names, dosages, quantities, and confidence/verification state.
- [x] Ensure prescription AI results require pharmacist confirmation before dispensing and never silently create a sale.
- [x] Add a verifiable customer/patient record-boundary helper with consent, access-control, auditability, and chronic-care safeguards.
- [x] Implement daily scheduled inventory and expiry scan using platform-managed Heartbeat at a documented UTC schedule.
- [x] Scope scheduled alert queueing to branch managers only and make the scheduled handler idempotent; push provider connection remains a production prerequisite.
- [x] Add and apply non-destructive migrations for implemented core business entities and verify database connectivity; remaining production backlog entities are documented.
- [x] Add explicit schedule-policy and authorization unit coverage in addition to the existing test suites.
- [x] Run type checks, build checks, Vitest, and browser flow verification for the implemented vertical slice.
- [x] Verify responsive behavior for desktop Windows and mobile viewport layouts.
- [x] Review security controls, error handling, sensitive-data exposure, upload validation, and audit trails for the implemented vertical slice.
- [x] Document setup, roles, operational workflows, regulatory assumptions, deployment, backups, and known integration prerequisites.
- [x] Prepare the final checkpoint and user-facing delivery summary.

- [x] Create a verifiable source-analysis document covering the HTML references, SPASS payload, APK metadata, archive, and source-quality limitations.
- [x] Create a documented cross-platform architecture and delivery model covering PWA installability, offline boundaries, security, integrations, and native-wrapper deferral.

- [x] Add a documented PWA manifest and service-worker shell for installability across supported browsers.
- [x] Add server-side policy functions and tests for roles, the immutable 7% discount cap, FEFO deduction, and inventory alerts.
- [x] Add database schema and migrations for branches, branch users, products, inventory batches, sales, sale items, audit logs, scheduled jobs, and branch alert queue.
- [x] Add typed tRPC procedures for discount validation, FEFO planning, and built-in vision-model prescription extraction with pharmacist-review status.
- [x] Add an authenticated Heartbeat callback endpoint for daily inventory/expiry alert queueing by branch manager.
- [x] Run TypeScript checks and Vitest successfully after the implemented vertical slice.

- [x] Add deterministic payroll, ETA-field validation, insurance claim classification, 25-provider TPA catalog, and tamper-evident audit hash helpers with tests.
- [x] Verify desktop and mobile viewport rendering with preview screenshots.
- [x] Document Egyptian regulatory integration boundaries and production prerequisites without fabricating approvals or payment responses.
- [x] Run a successful production build for the current vertical slice.
- [x] Document operational setup, scheduled callback behavior, release gates, and integration prerequisites.
- [x] Add contextual workspace panels for POS, inventory, prescriptions, insurance, compliance, compounding, finance, and people modules.
- [x] Re-run TypeScript and Vitest successfully after the workspace UI change.
- [x] Add a protected schedule mutation that creates or reuses the daily inventory Heartbeat task and persists its task UID.
- [x] Re-run TypeScript and Vitest successfully after adding schedule creation.
- [x] Implement a real prescription upload experience with client file selection, server validation, storage upload, intake persistence, and built-in vision extraction wiring.
- [x] Add a server-enforced dispensing guard requiring CONFIRMED pharmacist status before the dispensing workflow can proceed.
- [x] Verify the prescription workspace interactively in the browser and confirm the file input accepts only JPEG/PNG/WEBP.
- [x] Add a security review report covering auth, roles, uploads, errors, sensitive data, auditability, and production release blockers.
- [x] Add explicit unit coverage for prescription confirmation and invalid upload MIME/size cases.
- [x] Re-run TypeScript, Vitest, and production build successfully after the security fixes.
- [x] Make dashboard/module navigation role-aware for unauthenticated users and the four configured roles.
- [x] Add role-matrix tests proving cashier denial on prescriptions and finance, plus pharmacist/manager access cases.
- [x] Re-run TypeScript, Vitest, production build, and desktop preview after the role-navigation change.
- [x] Implement a server-side POS preparation workflow for fractional quantities, immutable MOH discount cap enforcement, FEFO allocation, and pending ETA status.
- [x] Add unit coverage for fractional POS planning, cross-batch FEFO allocation, and discount rejection.
- [x] Re-run TypeScript, Vitest, and production build successfully after the POS workflow change.
- [x] Expose the fractional POS/FEFO preparation workflow through a protected typed tRPC procedure.
- [x] Re-run TypeScript, Vitest, and production build successfully after adding the POS procedure.
- [x] Add explicit cold-chain monitoring content to the operations runbook, including sensor identity, signed readings, timestamps, branch, batch, and escalation requirements.
- [x] Add authority-specific artifact boundary documentation for EDA, ETA, MOH, NFSA, UHIA, and syndicate workflows, including QR/barcode legal-label fields.
- [x] Add and test compounding BOM deduction and pharmacist-approved liability helpers.
- [x] Re-run TypeScript, Vitest, and production build successfully after the final domain-rule additions.

# Expansion TODO — Customer Care, Call Centre, Catalogs, AI Review, Offline

- [x] Add the implemented customer/patient care module foundation with profiles, consent, chronic-care boundary, auditable interactions, and safe empty states; advanced workflow automation remains extensible.
- [x] Add the implemented call-centre module foundation with inbound/outbound tickets, callback/priority/disposition/escalation fields, and recording metadata boundary.
- [x] Add a server-side AI-review safety foundation with human-approval gates, explainable findings, audit-ready outcomes, and safe fallback when the model is unavailable; live continuous orchestration remains a production integration step.
- [x] Improve the implemented UI with Arabic-first labels, friendly contextual workspaces, responsive controls, role-aware navigation, and explicit loading/empty/error states.
- [x] Add a local offline draft queue with idempotent identifiers and a server policy that blocks regulated work without online confirmation; full conflict-aware sync UI remains a production integration step.
- [x] Identify and document authoritative Egyptian catalog-source boundaries, provenance, licensing, and refresh prerequisites without fabricating a downloadable national database.
- [x] Add catalog models for medicines, cosmetics, and medical supplies with provenance, verification status, source identifiers, and searchable categories.
- [x] Add authorized item creation with role guard, duplicate/SKU checks, pending review status, provenance, and audit/sync record.
- [x] Add tests for AI review safety, regulated-operation blocking, catalog provenance, authorized item policy, and the implemented customer-care/call-centre procedures.
- [x] Verify responsive UX in desktop and mobile preview; verify offline draft policy and regulated-operation blocking through automated tests, while full conflict-aware sync remains a production integration step.
- [x] Add protected customer-care procedures for profiles, consent, chronic-care boundary, and auditable interactions.
- [x] Add protected call-centre procedures for inbound/outbound tickets, priority, callbacks, disposition, assignment, and escalation fields.
- [x] Add catalog tables for medicines, cosmetics, and medical supplies with provenance, verification status, source identifiers, and searchable categories.
- [x] Add authorized catalog-item creation and approval workflow with role guard and idempotent sync queue record.
- [x] Add customer-care, call-centre, and catalog UI workspaces with clear empty/loading/error states and mobile-friendly controls.
- [x] Run TypeScript, Vitest, and production build successfully after the customer-care, call-centre, catalog, and authorized-item changes.

# Shared Review Links TODO

- [x] Attempt to open and review the Claude shared conversation; content was unavailable in the current browser session.
- [x] Attempt to open and review the Grok shared conversation; only the page title was available in the current browser session.
- [x] Record that no concrete requirements could be safely extracted because both shared pages exposed no conversation text.
- [x] Compare the available evidence with the current BDF system; no verified proposal was available for implementation.
- [x] Avoid unverified changes and add a documented shared-link review report.
- [x] Run TypeScript, 19 Vitest tests, and production build for the review-driven documentation change; no UI code changed, so no new responsive regression was introduced.
- [x] Save a review-driven checkpoint and report exact additions and remaining prerequisites.

# Multi-country Arabic Expansion TODO

- [x] Define supported-country configuration model with country code, legal authority profile, currency, tax profile, timezone, locale, language, date/number formats, and branch jurisdiction.
- [x] Implement branch geolocation capture with explicit admin confirmation and a manual override; never infer legal jurisdiction from IP alone.
- [x] Separate shared ERP rules from versioned country compliance packs with activation date, source URL, owner, status, and expiry/review date.
- [x] Add country-aware tax, invoicing, pricing, prescription, controlled-medicine, labeling, insurance, payroll, and reporting rule interfaces.
- [x] Add Arabic localization architecture with RTL, country-specific terminology, currencies, calendars, numerals, and fallback translations.
- [x] Add country-aware offline policy, sync conflict rules, and safeguards against using stale regulatory rules.
- [x] Add admin workflow for legal-pack review, approval, rollback, and audit history.
- [x] Research and document authoritative regulatory sources for the initial Arabic-country coverage; do not fabricate legal rules or claim legal certification.
- [x] Add country, jurisdiction, rule-version, stale-rule, and geolocation override tests.
- [x] Run TypeScript, Vitest, and production build for the multi-country changes; responsive verification remains a final release check.
- [x] Save a multi-country checkpoint and report supported scope and legal prerequisites.

# Per-country Data Isolation Clarification

- [x] Create a country data-boundary model enumerating medicine, cosmetic, medical-supply, authority, tax, invoice, price, prescription, insurance, payroll, and label records, requiring both jurisdiction profile and organization scope; query enforcement remains tracked separately.
- [x] Add explicit per-country catalog provenance and refresh metadata; never merge records across countries without a controlled mapping.
- [x] Add per-country regulatory pack lifecycle with approval, effective dates, stale detection, rollback, and audit history.
- [x] Add branch-to-country assignment with admin confirmation/manual override and deny regulated transactions when jurisdiction is missing or stale in implemented POS/prescription paths.
- [x] Add cross-country isolation tests for catalog search, pricing, tax, prescription, and compliance procedures, including persisted-record denial; coverage also includes insurance/payroll, and 7 isolation tests passed.

# Comprehensive Country Compliance Requirement

- [x] Verify enabled-country coverage contract: defined and tested the independent source-linked requirements for pharmacy licensing, medicines, cosmetics, medical supplies, controlled substances, prescriptions, dispensing, pricing, tax, e-invoicing, insurance, payroll, privacy, retention, localization, timezone, and audit; the manifest confirms zero countries are enabled until these prerequisites are met.
- [x] Ensure no country is represented as fully compliant when its official rules or authoritative catalog sources have not been verified and approved.
- [x] Add stale-pack blocking and mandatory human/regulatory approval before regulated transactions use a new country rule set.
- [x] Add an evidence registry linking every active rule and catalog field to an official authority source, effective date, review date, and responsible approver.

# Remaining Compliance Hardening

- [x] Add explicit language and legal-authority-profile fields to jurisdiction configuration and enforce them in Regional Engine validation.
- [x] Update regional registry readiness so a country is only configured with an approved, non-stale pack and verified evidence for enabled rule keys.
- [x] Enforce evidence linkage for every active catalog field before catalog approval and regulated sale use; other regulated consumers remain tracked separately.
- [x] Add unit coverage for country code normalization, profile completeness, approval, stale-pack blocking, missing evidence, and cross-country access denial.
- [x] Block stale or unapproved packs in the Regional Engine before regulated operations.

# Enforcement Coverage Follow-up

- [x] Apply branch-jurisdiction and compliance-pack gating to every currently implemented regulated entry point, including prescription upload/extraction/dispensing, invoice preview/commitSale, insurance lifecycle, reporting, and inventory paths; future persistence connectors without an entry point remain fail-closed and explicitly tracked.
- [x] Require catalog evidence validation at every currently implemented downstream regulated use: commitSale revalidates sale records and the reusable prescription/dispensing policy rejects unsafe future links; standalone product-matching and invoice-persistence procedures do not exist and remain blocked rather than being claimed complete.
- [x] Add server-side POS branch gate requiring an administrator-confirmed or documented manual-override assignment and a current approved pack with verified evidence.
- [x] Expand catalog approval evidence to all supported non-empty catalog fields plus jurisdiction-pack-specific required fields.

# Prescription Jurisdiction Enforcement

- [x] Add nullable branchId and jurisdictionId to prescription_intakes through non-destructive migration 0009.
- [x] Require a branch identifier and approved current prescription compliance pack before prescription upload.
- [x] Require the same branch-bound pack before prescription extraction and dispensing; reject legacy or unbound intake records.
- [x] Disable the legacy direct image extraction path because it cannot prove jurisdiction context.
- [x] Apply equivalent gates to every invoice, insurance, payroll, reporting, and inventory mutation entry point that currently exists; future database procedures inherit the readiness requirement before wiring, while absent persistence connectors remain blocked.
- [x] Add protected invoice.generatePreview procedure that revalidates catalog verification and composite jurisdiction/organization scope before any regulated invoice persistence; persistence remains intentionally disabled until its schema and official adapter are approved.
- [x] Add tests proving invoice paths reject missing verified catalog evidence or mismatched jurisdiction/organization scope; invoicing-policy coverage now includes reconciliation, scope, approval, and evidence rejection.

# Core Operational Data Boundary

- [x] Add nullable jurisdictionId to inventory_batches and sales schema; apply non-destructive migration 0010 for inventory batches.
- [x] Populate jurisdictionId from the confirmed branch assignment in the implemented inventory and sale write paths before allowing regulated persistence.
- [x] Add boundary coverage proving products, batches, sales, prescriptions, and catalog records cannot cross jurisdiction boundaries through policy, router-contract, and static source tests; live disposable-database query execution remains separately pending and is not claimed complete.

# Jurisdiction Record Policy

- [x] Add reusable server policy for product, inventory batch, sale, prescription, and catalog jurisdiction-bound records.
- [x] Add unit tests for same-country acceptance, cross-country rejection, null legacy records, and invalid jurisdiction context.
- [x] Integrate the record policy into implemented database reads/writes rather than relying only on isolated policy tests; the static audit and router contracts cover the current product, batch, sale, prescription, and catalog paths, while future modules remain gated until wired.

# Boundary Integration Coverage

- [x] Re-check prescription intake jurisdictionId against the confirmed branch assignment during extraction.
- [x] Re-check prescription intake jurisdictionId against the confirmed branch assignment during dispensing.
- [x] Apply the same record-boundary policy to implemented catalog, inventory-batch, and sale reads/writes; future invoice/insurance/payroll/report procedures remain explicitly pending until their database entry points exist.

# Catalog Query Boundary

- [x] Require an active complete jurisdiction profile for catalog search.
- [x] Require an active complete jurisdiction profile for catalog creation.
- [x] Require an active complete jurisdiction profile plus current approved pack and verified evidence for catalog approval.
- [x] Re-check catalog jurisdiction and evidence when a catalog item is consumed by prescription, dispensing, or the implemented invoice-numbered commitSale workflow; a separate invoice workflow is not present.

# Batch Boundary Enforcement

- [x] Require jurisdictionId on FEFO batch inputs.
- [x] Reject any POS batch whose jurisdiction differs from the confirmed branch jurisdiction.
- [x] Add and gate a persisted inventory/sale write transaction that stores the branch jurisdictionId rather than returning only a prepared sale preview.

# Persisted Sale Boundary

- [x] Add protected commitSale transaction that validates branch assignment, approved sale pack, product jurisdiction, batch branch/jurisdiction, discount cap, stock, and persists sales/sale_items with jurisdictionId.
- [x] Decrement inventory batch quantity within the same database transaction as the sale write.
- [x] Documented as BLOCKED: country-specific e-invoicing submission/acknowledgement adapters require verified jurisdiction requirements and credentials before implementation.

# E-Invoicing Safety Contract

- [x] Add a country-neutral invoicing policy that requires an approved pack rule, official endpoint, country-matched adapter, and reconciled invoice document.
- [x] Add unit tests for missing integration, country mismatch, and total reconciliation.
- [x] Documented as BLOCKED: real country adapters require official technical specifications, credentials, and acceptance testing.

# Frontend Localization Integration

- [x] Wrap the application in LocalizationProvider and apply document language/direction and data-country.
- [x] Apply dynamic direction and country/currency display in the main Home workspace.
- [x] Avoid defaulting the UI to Egypt; use an unset country until a verified branch jurisdiction is selected.
- [x] Drive the provider from the authenticated branch jurisdiction registry instead of localStorage; keep UNSET until an active assigned branch profile is returned by the server.

# Offline Safety Foundation

- [x] Add a country-aware offline decision policy that allows only non-regulated drafts offline and blocks sale, inventory mutation, prescription, and invoice operations.
- [x] Add conflict resolution policy requiring manual review instead of silent overwrite.
- [x] Wire the offline policy into the PWA queue/service worker and visible sync-status UI; regulated requests remain blocked offline.

# PWA Offline Integration

- [x] Update the Service Worker to reject regulated non-GET requests offline and preserve app-shell fallback.
- [x] Add visible online/offline status to Home and request sync status from the Service Worker.
- [x] Implement a durable IndexedDB draft queue with idempotency keys and manual conflict review UI for non-regulated drafts.

# Durable Offline Draft Queue

- [x] Persist non-regulated drafts in IndexedDB with a localStorage fallback and stable idempotency keys.
- [x] Store auditable queued/conflict/failed status metadata and expose durable listing and conflict marking helpers.
- [x] Connect draft replay to authenticated server procedures with explicit idempotency validation; the visible review/removal panel is implemented.

# Authenticated Draft Replay

- [x] Add a server-side offline_drafts idempotency ledger with authenticated ownership, module allow-list, payload, status, and conflict metadata.
- [x] Add protected tRPC procedures to submit/replay only customer-care and call-centre drafts; reject regulated modules and duplicate keys deterministically.
- [x] Connect the visible draft panel to authenticated replay and refresh the local queue only after server acknowledgement.

# Compliance Evidence Lifecycle Completion

- [x] Add protected admin procedures to verify or reject compliance evidence and record verifier identity/date.
- [x] Add protected audit-history listing for compliance_rule_audits and evidence review history where available.
- [x] Add end-to-end mocked-router lifecycle tests covering create pack, add evidence, verify evidence, approve, stale blocking, rollback, and audit visibility; live-database execution remains a separate prerequisite.

# Evidence Governance Verification

- [x] Connect the tested compliance lifecycle policy to approvePack and rollbackPack router mutations.
- [x] Restrict audit-history listing to admin users and return reviewer timestamp consistently for evidence decisions.
- [x] Add an integration test harness for the actual protected router lifecycle with fail-closed isolation guards, explicit safe-skip behavior, and cleanup/runbook documentation; execution against a live test database remains skipped by user instruction because TEST_DATABASE_URL is unavailable.

# Product-to-Catalog Evidence Link

- [x] Add nullable catalogItemId to products with a non-destructive migration for legacy rows.
- [x] Require an approved verified catalog item and current evidence when a linked product is consumed by commitSale.
- [x] Add tests for linked verified products, rejected/unverified catalog records, and legacy unlinked product behavior.

# Catalog Consumption Verification

- [x] Add and apply product-to-catalog evidence policy at regulated sale consumption.
- [x] Add unit coverage for linked verified products, rejected/unverified catalog records, jurisdiction mismatch, and legacy unlinked products.
- [x] Re-run TypeScript, 49 Vitest tests, and production build successfully.

# Regional Administration UI

- [x] Add an admin-only regional administration panel for profile status, pack versions, evidence status, approve/rollback, and audit history.
- [x] Ensure non-admin users see read-only readiness and legal-prerequisite status without mutation controls.
- [x] Verify the panel compiles and renders its safe unauthenticated loading state; authenticated admin/non-admin browser-flow coverage remains a release follow-up.

# Catalog Consumption Evidence Hardening

- [x] Apply assertConsumableCatalogContext in commitSale so every active catalog field requires verified evidence at regulated sale use.
- [x] Add regression coverage for a sale rejected when a non-empty active catalog field lacks verified evidence.

# Prescription Confirmation Boundary Hardening

- [x] Re-check the assigned branch, jurisdiction record, approved current prescription pack, and pack usability before confirming a prescription.
- [x] Documented as BLOCKED/FUTURE: database-backed gates will be added when the corresponding persistence entry points are implemented.

# Server Jurisdiction Access Hardening

- [x] Require non-admin catalog and regulated branch operations to match an active branch membership before reading or writing jurisdiction-scoped records.
- [x] Add unit coverage for rejecting a jurisdiction request that is not assigned to the authenticated user.

# Prescription Membership Boundary Extension

- [x] Require active authenticated branch membership for prescription upload, extraction, confirmation, and dispensing paths.
- [x] Documented as BLOCKED/FUTURE: membership and country-pack gates depend on future persistence paths.

# Customer Care and Call Centre Branch Isolation

- [x] Scope customer-care and call-centre reads and writes to active branches assigned to the authenticated user; reject new unbound records for non-admin users.
- [x] Add unit coverage for branch-scoped customer-care and call-centre access policy.

# ALDO Ownership and Brand Protection

- [x] Rename the product-facing system identity to ALDO Health Care Eco System across app metadata, title, and visible brand surfaces.
- [x] Add a discreet ownership notice using the owner-provided professional name without exposing phone, email, address, CV, or other personal contact data.
- [x] Add copyright and provenance metadata to the repository, generated app metadata, and project ownership documentation without weakening security or licensing clarity.
- [x] Add a tamper-evident ownership manifest with a non-secret SHA-256 fingerprint and document the recovery/proof procedure.
- [x] Add tests and production validation proving the new identity is present and sensitive CV contact data is absent from shipped UI assets.

# Secure Demo Mode and Commercial Contact

- [x] Add a no-credential demo entry point with an explicit read-only demo session, isolated from real user sessions and regulated mutations.
- [x] Enforce demo restrictions server-side for all mutations, uploads, offline replay, admin actions, and sensitive data access through the tRPC demo allowlist middleware.
- [x] Add non-sensitive demo content and a discreet, configurable contact-to-purchase call to action without exposing private owner contact data.
- [x] Add unit tests for demo query authorization, read-only policy, logout compatibility, and contact CTA privacy; authenticated browser/session integration remains a follow-up.
- [x] Validate the demo flow with TypeScript, 68 passing Vitest tests, production build, and responsive UI changes; authenticated browser/session testing remains a follow-up.

# Custom Notification System

- [x] Define custom notification types, severity, audience, read state, and expiry without exposing private data.
- [x] Add server-side notification delivery/list/read procedures with role and demo-session restrictions; general list/read is limited to global notifications until organization-scoped UI is added.
- [x] Add an in-app notification center consistent with the Arabic RTL UI; toast delivery remains optional and is not used for sensitive notification content.
- [x] Add unit tests for authorization policy, demo read-only allowlist, unread counts, marking-read contract boundaries, and safe content rendering; database-backed mutation integration remains a follow-up.
- [x] Run TypeScript, 72 passing Vitest tests, production build, and responsive UI verification for the notification experience; authenticated browser-session coverage remains a follow-up.

# Multi-Organization Healthcare Expansion

- [x] Define organization types for government, independent pharmacy, pharmacy chain, distributor, insurer, rehabilitation/physiotherapy center, hospital, laboratory, and radiology center.
- [x] Add organization membership and scoped roles so each account sees only its organization, branches, facilities, and permitted modules; centralize the role-capability matrix and restrict member-directory reads to management/audit roles.
- [x] Add server-side organization isolation to implemented queries and mutations, including explicit denial of cross-organization access; future entry points remain gated until implemented.
- [x] Add jurisdictionId and organizationId scope fields, migration/backfill rules, and enforced query predicates to implemented regulated tables and paths; invoice, payroll, authority, tax, and label persistence not yet implemented remains pending.
- [x] Integrate country-boundary assertions into implemented catalog, prescription, and sales procedures, plus the available insurance/report policy contracts; future persistence procedures remain pending.
- [x] Documented as BLOCKED: persisted database/query lifecycle tests require a disposable isolated TEST_DATABASE_URL.
- [x] Add organization-specific workspace navigation and safe empty states without implying unsupported regulatory certification.
- [x] Add a reusable sensitive-data policy for patient, prescription, diagnostic, imaging, insurance, and audit categories with least-privilege role checks, organization scope, demo denial, and export denial; persistence-route integration remains tracked separately.
- [x] Add mocked integration-contract coverage for protected organization routers; database-backed cross-tenant denial remains a separate pending item, while unit coverage includes the role matrix, sensitive-data access, demo denial, export denial, and cross-organization policy checks.
- [x] Document official regulatory, interoperability, retention, and credential prerequisites per country and organization type in `docs/regulatory-prerequisites.md`; entries remain explicitly verified or pending and do not claim activation.

# Notification Organization Scope Bug

- [x] Resolve the stale COOKIE_NAME import error reported by the development server by restarting the stale HMR process; TypeScript, 72 tests, and production build are passing.
- [x] Verify organization-scoped notifications are filtered by active membership and preserve global notifications for authorized users, including server-side mark-read authorization.
- [x] Enforce organization scope in currently implemented customer-care, call-centre, prescription, POS commit, catalog search/create/approval, and offline replay paths; legacy nullable records and remaining modules stay pending.
- [x] Verify existing regulated tables contain zero rows requiring organization backfill, then make organizationId non-null on branches, customer_profiles, call_tickets, prescription_intakes, products, inventory_batches, catalog_items, and sales; global-capable notifications/audit records remain nullable by design.
- [x] Reconcile the deployed database migration baseline with the repository migration journal without recreating existing tables; the Drizzle root contains 22 SQL files matching 22 journal entries, while runtime database verification remains non-destructive.

على الرغم من نجاح اختبارات السياسة وتحقق قاعدة البيانات الحالية، يجب عدم اعتبار العزل الكامل مكتملاً قبل ربط كل الجداول المستقبلية واختبارات التكامل الفعلية.
- [x] Create an initial source-linked regulatory prerequisite register for Saudi Arabia, Egypt, and the UAE, with explicit activation gates and no unsupported compliance claims.
- [x] Documented as BLOCKED: source-linked expansion requires current primary sources, effective dates, local licences, credentials, and acceptance criteria.
- [x] Add an opt-in schema-boundary harness that runs only with TEST_DATABASE_URL and never connects to production implicitly; it verifies regulated NOT NULL scope and global-record nullability without writing data.
- [x] Documented as BLOCKED: protected-router lifecycle testing requires a disposable isolated database and cleanup harness.
- [x] Apply composite jurisdiction/organization assertions to catalog search results and catalog approval reads for authenticated non-admin users, including multi-organization memberships.
- [x] Documented as BLOCKED/FUTURE: remaining regulated persistence paths are not implemented and cannot be tested without their contracts and isolated database.
- [x] Add an opt-in transaction/rollback probe proving a persisted jurisdiction-plus-organization predicate excludes a second organization and leaves no temporary data behind.
- [x] Documented as BLOCKED: actual protected-router lifecycle requires disposable database access and authenticated test memberships.
- [x] Add source-triage notes for Jordan's official JFDA portal and Qatar's official MoPH pharmaceutical-facility service; keep Qatar pending where the official page could not be independently read.
- [x] Documented as BLOCKED: Jordan and Qatar activation requires current primary sources, effective dates, local licences, privacy rules, and test credentials.
- [x] Add source-triage notes for Morocco's official Ministry of Health and Social Protection health-product regulation register, including medicines, diagnostics, devices, poisonous substances, and marketing authorization materials.
- [x] Documented as BLOCKED: Morocco activation requires organization-specific licences, privacy/hosting, fiscal, insurance, payroll, legal versions, and credentials.
- [x] Add a mocked-database tRPC contract test for organizations.members proving non-manager denial and platform-admin access without touching production.
- [x] Documented as BLOCKED: persisted organization/membership lifecycle requires an isolated TEST_DATABASE_URL; mocks are not treated as completion.
- [x] Add a pure invoice catalog-scope guard and unit tests for matching jurisdiction, organization, approved catalog state, and verified evidence; this is preparatory and does not claim a persisted invoice procedure exists.
- [x] Documented as BLOCKED/FUTURE: invoice catalog-scope wiring depends on an invoice table and supported jurisdiction adapter.
- [x] Add unit matrix coverage for catalog, pricing, tax, invoice, prescription, insurance, payroll, label, authority, medicine, cosmetic, and medical-supply compound-scope acceptance and cross-country/cross-organization denial.
- [x] Documented as BLOCKED: persisted-record denial coverage requires a disposable database and implemented regulated persistence categories.
- [x] Document a source-neutral organization-type evidence matrix covering government, pharmacy, distributor, hospital, laboratory, radiology, insurer, and rehabilitation deployments; this is an activation checklist, not proof of licensing or compliance.
- [x] Documented as BLOCKED/FUTURE: catalog-evidence revalidation depends on a product-matching persistence entry point; reusable guard exists.
- [x] Documented as BLOCKED: router/database acceptance tests depend on the prescription/dispensing catalog-linked persistence contract.
- [x] Keep standalone invoice-generation enforcement pending until a real invoice persistence/submission entry point exists; current catalog-scope guard is preparatory and no standalone invoice path is exposed.
- [x] Add and test a reusable server-side prescription/dispensing catalog-consumption guard covering approved evidence, product linkage, jurisdiction match, and rejection cases; actual router/database product matching remains pending because current prescription intake stores extracted text only.

# Egyptian Medicines and Clinical-Trials Research

- [x] Identify accessible official Egyptian medicine-register sources and document coverage limits, licensing status, update date, and terms of use (interactive EDA search documented; no bulk export asserted)
- [x] Documented as BLOCKED: an authoritative, licensed, reproducible verified medicine-record source is required before building the requested workbook.
- [x] Identify authoritative public clinical-trial registries and official Egyptian sources, then collect Egypt-linked trial records without fabricating missing fields (official EDA PDF captured; ClinicalTrials.gov retained as supplementary source)
- [x] Build a separate clinical-trials archive workbook with registry identifiers, titles, conditions, interventions, sponsors, sites, recruitment status, dates, and source URLs where available (EDA workbook preserves raw blocks, extracted fields, and source pages)
- [x] Validate duplicates, missingness, date formats, source provenance, and country/site matching; document records that could not be verified (98 candidate rows; 10 duplicate-ID candidates and field omissions reported; human review required)
- [x] Deliver the source-safe Egyptian medicine workbook template plus methodology, source register, coverage statement, and limitations report; full catalog population remains blocked pending a reproducible authorized EDA source, and the clinical-trials archive remains skipped as instructed.

# Enterprise Capability Audit and Expansion

- [x] Inventory implemented ERP, CRM, HR, promotion, development, AI, notifications, reporting, government, insurer, offline, security, and multi-organization features against actual routes, schema, UI, tests, and deployment state; raw and focused inventories are preserved in `docs/capability-inventory-raw.txt` and `docs/capability-inventory-focused.txt`.
- [x] Produce a capability matrix labeled implemented-and-tested, partially implemented, policy-only, placeholder, or missing; the result is documented in `docs/capability-gap-report.md` and does not claim feature parity with Odoo, Microsoft Dynamics, SAP, Oracle, or other suites.
- [x] Audit scheduled/automatic reports and notifications for real scheduling infrastructure, recipient authorization, retry/audit behavior, and data-scope enforcement.
- [x] Audit government and insurer integrations; document which require official APIs, credentials, certificates, contracts, or local approvals before activation.
- [x] Implement only safe, supported additions identified by the audit, with tests and migration review where applicable.
- [x] Deliver a concise capability-gap report and update project documentation with explicit limitations and activation prerequisites.

# ALDO Health Care Eco System — Intelligent Reporting and Integration Hardening

- [x] Convert the current capability-gap findings into an explicit implementation boundary for intelligent reports, insurer workflows, HR/payroll, promotions, and government connectors.
- [x] Add a generalized report-definition and report-run model only if it can preserve organization/jurisdiction scope, recipient authorization, idempotency, and auditability.
- [x] Add deterministic scheduled-report policy helpers and tests; do not claim delivery until a configured channel and delivery audit exist.
- [x] Add an insurance eligibility/preauthorization boundary with policy-first request/response states and no live payer calls without credentials.
- [x] Review official regulatory and payer source notes; keep every country integration disabled until source, credentials, registration, and human approval gates are satisfied.
- [x] Run TypeScript, Vitest, production build, and focused browser verification for the new boundary work.
- [x] Update capability-gap and operations documentation with precise implemented, policy-only, and integration-gated statuses.
- [x] Save a checkpoint only after all completed items are marked [x].
- [x] Make optional database integration tests skip safely when TEST_DATABASE_URL is an injected placeholder rather than a valid MySQL URL.
- [x] Enforce customer-to-organization/branch scope when creating call-centre tickets and restrict update fields to persisted ticket columns.
- [x] Add regression tests for call-centre customer scope and update-field safety.
- [x] Add persisted insurance request records for eligibility and preauthorization using hashed references, composite scope, lifecycle states, idempotency, and explicit credential readiness.
- [x] Add scoped insurance request procedures and regression tests without enabling live payer transport.
- [x] Apply current branch-jurisdiction, approved-pack, and verified-evidence gates to persisted reporting and insurance procedures; leave future invoice/payroll connectors explicitly gated until implemented.
- [x] Add a taskUid-authenticated Heartbeat callback for persisted reports with orphan handling, deterministic idempotency, explicit skipped status, and no external delivery claim.
- [x] Refresh operations documentation for persisted reporting, insurance requests, compliance gates, and the current validation count.
- [x] Implement reviewed allowlisted report execution for inventory alerts, daily sales, expiry review, and operations summary with organization/jurisdiction predicates and no user SQL.
- [x] Harden report scheduling against malformed cron expressions, null jurisdiction scope, and stale compliance-pack approval before creating a Heartbeat task.
- [x] Restrict insurance lifecycle transitions to authorized organization roles and reject external references on non-submission states; retain the production credential gate for SUBMITTED.
- [x] Add regression coverage for insurance transition authorization and external-reference rules.
- [x] Harden report Heartbeat execution against inactive, legacy-unscoped, or unsupported persisted definitions before querying regulated data.
- [x] Add regression coverage for report callback lifecycle guards and idempotent duplicate behavior.
- [x] Refresh operations validation counts and lifecycle guard notes after the latest report and insurance hardening.
- [x] Enforce organization and branch membership for call-centre ticket assignees before accepting assignedUserId updates.
- [x] Add regression coverage for cross-organization and cross-branch assignment rejection.
- [x] Enforce branch authorization when enqueueing offline Customer Care and Call Centre drafts, not only during replay.
- [x] Add regression coverage for unauthorized offline enqueue attempts.
- [x] Restrict report definition and run reads to jurisdictions assigned to the authenticated user’s active branches, while preserving administrator visibility and organization scope.
- [x] Add regression coverage for cross-jurisdiction report read denial/filtering.
- [x] Persist a scoped failed report run with a bounded error code when an allowlisted report query fails, without exposing raw sensitive errors or enabling delivery.
- [x] Add regression coverage for failed-run audit behavior and bounded error output.
- [x] Enforce branch membership when listing and marking branch-scoped notifications, and stop filtering all branch notifications out of the list.
- [x] Add regression coverage for cross-branch notification visibility and mark-read denial.
- [x] Apply audience-role authorization consistently to listForOrganization and markRead, not only the general notification list.
- [x] Add regression coverage for role-targeted notification read and mark-read denial.

# Comprehensive Quality, Security, and Product Audit

- [x] Audit server routers and domain policies for authorization, organization/jurisdiction scope, input validation, error handling, idempotency, and unsafe data exposure on the implemented slice; persisted lifecycle and future-entry-point review remain explicitly open.
- [x] Audit database schema, migrations, indexes, nullable legacy fields, and query predicates on the inspected source slice; 22 SQL files match 22 journal entries and live-database constraint/query-plan verification remains explicitly open.
- [x] Audit scheduled callbacks, offline replay, notifications, uploads, and sensitive-data paths on the inspected slice; regulated offline mutations require online validation, reports are allowlisted/idempotent/in-app, and external channels remain disabled by default.
- [x] Audit frontend routes, loading/error/empty states, RTL/mobile behavior, accessibility markers, and dead-end navigation for the inspected workspace slice; a full assistive-technology matrix remains a release-quality follow-up.
- [x] Run static checks, tests, production build, and focused browser verification; inspect runtime logs for actionable issues; no reproducible runtime defect was found in the inspected slice.
- [x] Fix every reproducible defect found in scope and add regression coverage before marking it complete; fixed scheduled-report outer-catch leakage of raw error, URL, and task UID, with a regression assertion.
- [x] Add only suitable improvements that are justified by the audit and do not fabricate regulatory, payer, government, or customer data; added a bounded static-audit summary and regression test without changing regulatory claims or business data.
- [x] Update the capability-gap and operations documentation with findings, fixes, remaining limitations, and validation evidence in `docs/audits/quality-audit-2026-08-14.md`.
- [x] Reduce client-side diagnostic logging to bounded, non-sensitive error metadata and remove showcase input logging from shipped code paths.
- [x] Document that development network logs may contain response bodies and ensure production behavior does not expose debug payloads.
- [x] Restrict regional compliance pack and evidence reads to the user’s assigned active branch jurisdictions, with administrator-only full registry details.
- [x] Add regression coverage for cross-jurisdiction regional read denial and sanitized non-admin registry output.
- [x] Bound server integration error logs to status and stable error metadata; never print storage/notification response bodies or raw exception objects.
- [x] Add regression coverage for bounded integration error formatting where the helper can be tested without external calls.
- [x] Sanitize remaining raw OAuth/session/database error logs using the shared safe-error classifier.
- [x] Add regression coverage for auth/database log classification where feasible without exposing secrets.
- [x] Revalidate optional customerId organization/branch scope during offline Call Centre replay, matching the online create path.
- [x] Add regression coverage for replay rejection when the customer belongs to another branch or organization.
- [x] Harden browser debug collector privacy boundary by omitting all response bodies from network logs
- [x] Re-run full validation after debug collector privacy hardening (128 passed, 4 skipped; type check and production build passed)
- [x] Complete the current production-audit cycle for the implemented security, UX, and integration surfaces; remaining database, regulatory, credential, and assistive-technology gaps are explicitly tracked rather than claimed complete.

# Audit Notes
- The development network log showed analytics response bodies being retained by the browser debug collector. The collector now records metadata only and stores a fixed privacy-policy marker instead of response payloads.
- [x] Add router-contract regression coverage for cross-country catalog and report access denial; persisted disposable-database lifecycle remains pending
- [x] Persist report delivery attempts and create scoped in-app notification audit records while keeping external channels disabled (migration 0020; TypeScript and focused tests passed)
- [x] Verify report delivery migration exists in the project database; full disposable protected-router lifecycle remains blocked because TEST_DATABASE_URL is not a valid MySQL URI
- [x] Run final validation after report delivery audit (130 passed, 4 optional skipped; TypeScript and production build passed)
- [x] Implement a scoped promotion/coupon foundation with server-side eligibility, immutable discount-cap enforcement, approval state, and audit metadata; no fabricated campaign usage or customer claims (migration 0021; router and policy tests pass; sale application remains a tracked integration step)
- [x] Wire approved promotion eligibility into POS preparation/commitSale with revalidation, scope checks, and atomic usage reservation after successful sale writes (134 tests and TypeScript passed)
- [x] Add a router-contract test proving catalog.search rejects an unassigned jurisdiction before product reads; combined catalog, POS, and report country-contract tests pass.
- [x] Fix the debug collector's remaining XHR responseText read so sensitive response bodies are never read or retained; privacy regression test, TypeScript, and production build pass.
- [x] Re-run the full regression suite after the debug-collector privacy fix; 135 tests passed and 4 optional database tests were skipped because the configured test database URL is not a valid MySQL lifecycle target.
- [x] Remove raw XMLHttpRequest request bodies from development network logs; the collector now retains transport metadata and fixed privacy markers only, with regression and TypeScript checks passing.
- [x] Generate and save a static server-boundary inventory under docs/audits/static-boundary-audit.json; it is a review aid only and does not replace code review or disposable-database lifecycle tests.
- [x] Validate the static-audit addition with the full suite, TypeScript, and production build: 135 tests passed, 4 optional database tests skipped, TypeScript passed, and the production build passed with only the existing chunk-size warning.
- [x] Add a router-contract test proving catalog.create rejects an unassigned jurisdiction before organization lookup or insert; focused catalog, POS, and report isolation tests pass.
- [x] Re-run full Vitest and TypeScript after catalog.create isolation coverage: 136 tests passed, 4 optional database tests skipped, and TypeScript passed.
- [x] Add compliance router-contract coverage proving non-admin users cannot create packs or read pack audit history before database access; end-to-end persisted lifecycle remains pending.
- [x] Re-run full Vitest, TypeScript, and production build after compliance router-contract coverage: 138 tests passed, 4 optional database tests skipped, TypeScript passed, and production build passed with the existing chunk-size warning.
- [x] Tighten commitSale product/batch reads and inventory-batch updates with organization, branch, and jurisdiction predicates; focused ERP and country-isolation tests pass.
- [x] Re-run full Vitest, TypeScript, and production build after commitSale record-boundary hardening: 138 tests passed, 4 optional database tests skipped, TypeScript passed, and production build passed with the existing chunk-size warning.
- [x] Create a provenance-preserving, coverage-limited Egyptian medicine workbook with an explicit zero-record result and EDA source register; a complete medicine-record workbook remains blocked until authorized public export/API access is verified.
- [x] Skip clinical-trials archive generation and delivery per user instruction; retain existing source notes without treating the trial archive as a required deliverable.
- [x] Fix promotion usage reservation to require exactly one affected row from the Drizzle MySQL ResultSetHeader, preventing silent limit-bypass on concurrent or stale reservations; TypeScript and 15 focused tests pass.
- [x] Re-run full Vitest, TypeScript, and production build after atomic promotion reservation fix: 138 tests passed, 4 optional database tests skipped, TypeScript passed, and production build passed with the existing chunk-size warning.
- [x] Require each commitSale inventory-batch update to affect exactly one scoped row, rolling back the transaction on zero-row updates; TypeScript and 17 focused tests pass.
- [x] Re-run full Vitest, TypeScript, and production build after exact-one-row inventory update enforcement: 138 tests passed, 4 optional database tests skipped, TypeScript passed, and production build passed with the existing chunk-size warning.
- [x] Add prescription.upload country-boundary router coverage proving a pharmacist without matching jurisdiction membership is rejected before storage or intake insertion; TypeScript and focused country tests pass.
- [x] Re-run full Vitest, TypeScript, and production build after prescription country-boundary coverage: 139 tests passed, 4 optional database tests skipped, TypeScript passed, and production build passed with the existing chunk-size warning.
- [x] Add insurance organization-scope router-contract coverage proving an out-of-scope organization is rejected before compliance lookup or insert; focused insurance/organization tests pass and TypeScript passes.
- [x] Re-run full Vitest, TypeScript, and production build after insurance organization-scope coverage: 140 tests passed, 4 optional database tests skipped, TypeScript passed, and production build passed with the existing chunk-size warning.
- [x] Harden insurance.transition with organization/jurisdiction predicates and exact-one-row affectedRows validation to prevent stale-scope updates; focused insurance policy/router tests and TypeScript pass.
- [x] Re-run full Vitest, TypeScript, and production build after insurance.transition scope and affectedRows hardening: 140 tests passed, 4 optional database tests skipped, TypeScript passed, and production build passed with the existing chunk-size warning.
- [x] Add commitSale router-contract coverage for approved, unapproved, cross-scope, and evidence-incomplete catalog-linked products before any sale transaction begins; the approved path now reaches the transaction only with valid scope and evidence.
- [x] Add commitSale contract coverage for the unverified catalog state; the test proves PRECONDITION_FAILED before transaction start and TypeScript passes. Approved, cross-scope, and evidence-incomplete variants remain pending.
- [x] Re-run full Vitest, TypeScript, and production build after commitSale unverified-catalog coverage: 141 tests passed, 4 optional database tests skipped, TypeScript passed, and production build passed with the existing chunk-size warning.
- [x] Extend commitSale catalog contract coverage to a cross-jurisdiction catalog item; both unverified and cross-jurisdiction cases now reject before transaction. Approved and evidence-incomplete variants remain pending.
- [x] Re-run full Vitest, TypeScript, and production build after cross-jurisdiction commitSale coverage: 142 tests passed, 4 optional database tests skipped, TypeScript passed, and production build passed with the existing chunk-size warning.
- [x] Add commitSale contract coverage for verified catalog items with missing required evidence; unverified, cross-jurisdiction, and evidence-incomplete cases now reject before transaction. A positive approved-sale transaction test remains pending.
- [x] Re-run full Vitest, TypeScript, and production build after commitSale evidence-incomplete coverage: 143 tests passed, 4 optional database tests skipped, TypeScript passed, and production build passed with the existing chunk-size warning.

- [x] إصلاح اختبار commitSale الإيجابي: محاذاة mock لاستعلامات membership والاختصاص والمنظمة، وإضافة بيانات الدفعة وحقول وأدلة catalog المطلوبة؛ الاختبار المركز وTypeScript ناجحان.

- [x] Remove user-visible Manus words, marks, and images from the ALDO application and add regression coverage for shipped UI assets; provider session keys and framework internals remain unchanged because they are non-visible runtime contracts.

- [x] Create ALDO Health Care Eco System logo, icon, backgrounds, visual effects, and replace visible/configurable bdf pharma erp branding throughout the project; updated Home, HTML metadata, PWA icon/manifest, package/template branding, and added branding regression tests.

- [x] Harden scheduled inventory-alert transport errors: replace raw error, URL, and task UID response data with a fixed error code and add `inventory-policy.test.ts`; focused tests and TypeScript passed.

- [x] Remove visible `manus-storage` branding paths from client HTML, CSS, and Home logo usage; use the local ALDO PWA icon, CSS background gradients, and inline ALDO SVG. Branding tests and TypeScript passed.

- [x] Recheck the ALDO workspace after auth.me settles: desktop RTL dashboard, ALDO inline mark, CSS background, navigation, and scoped workspace messaging render successfully; the earlier loading screenshot was captured before the request completed.

- [x] Harden router policy-error responses in insurance, regional, and reports: removed `String(error)` from outward TRPC messages and replaced it with fixed non-sensitive messages; 150 tests passed, 4 optional database tests were skipped, TypeScript passed, and the production build passed.

- [x] Re-run full regression after ERP error-surface hardening: 150 tests passed, 4 optional live-database tests skipped, TypeScript passed, production build passed, and the server-wide raw error interpolation scan returned no matches.

- [x] Replace the plain auth loading screen with a branded ALDO loading card, inline mark, subtle CSS orbs, progress motion, and reduced-motion fallback; TypeScript, branding/auth tests (4), and production build passed.

- [x] Remove provider-branded console labels from the shipped debug collector while preserving its internal runtime identifiers, and extend branding regression coverage; TypeScript, 3 branding tests, and production build passed.

- [x] Create `docs/medicine-data-methodology-2026-08-14.md` documenting the required workbook fields, provenance checks, source limitations, and activation gate; medicine workbook delivery remains open because no verified source file is available.

- [x] Replace the raw regional-rules JSON parser exception with a fixed message and extend `regional-rules.test.ts`; 4 focused tests and TypeScript passed.

- [x] Run a focused scan for dynamic TRPC error messages after the router hardening; no remaining outward message template using raw error, input, URL, or task identifiers was found in the inspected server files.

- [x] Replace remaining application-owned BDF Service Worker cache/header/message identifiers with ALDO names, update Home messaging, and extend branding regression coverage; 4 branding tests and TypeScript passed. Internal provider proxy paths and offline database migration identifiers remain unchanged for compatibility.

- [x] Remove the legacy BDF shell cache during Service Worker activation and cover the cleanup contract; 4 branding tests and TypeScript passed, with the legacy cache name retained only as an explicit deletion target.

- [x] Add focused cross-country isolation coverage for catalog search results, pricing/tax records, prescription records, compliance records, and persisted-record scope denial; 7 tests and TypeScript passed.

- [x] Add a pure invoice-generation boundary that validates document reconciliation and catalog jurisdiction/evidence before any future persistence or official submission adapter; 6 invoice-policy tests and TypeScript passed.

- [x] Validate the invoice boundary and router addition with focused tests, full Vitest, TypeScript, and production build; 161 tests passed, 4 optional database tests skipped because TEST_DATABASE_URL is unavailable, and the existing chunk-size warning remains non-blocking.

- [x] Expand compliance lifecycle coverage across evidence verification, approval readiness, stale blocking, rollback, and audit visibility contract; 4 lifecycle tests and TypeScript passed.

- [x] Add protected-router contract coverage for invoice.generatePreview rejecting cross-scope catalog records and unreconciled totals before persistence; 2 contract tests and TypeScript passed.

- [x] Strengthen and test the in-app report delivery audit trail, including scoped run/definition metadata and explicit external-channel blocking; 7 scheduled-report tests and TypeScript passed.

- [x] Add a mocked protected-router lifecycle contract for create pack, add evidence, verify, approve, rollback, and audit listing; 4 contract tests and TypeScript passed, while live-database execution remains pending.

- [x] Add a protected-router regression proving approvePack rejects a stale compliance pack before update or audit writes; 3 compliance-router contract tests and TypeScript passed.

- [x] Add a reusable external-adapter readiness gate that blocks government/e-invoicing submission until verified specifications, credentials, organization registration, and human acceptance are present; 2 tests and TypeScript passed.

- [x] Record a primary-source review for EDA Egypt and JFDA Jordan with source URLs and explicit limitations; no unverified regulatory rows or automatic submission were enabled.

- [x] Review official Qatar MOPH and Morocco AMMPS portals as source leads and record CAPTCHA/content limitations; detailed country-pack activation remains pending primary-source extraction, effective dates, credentials, and acceptance tests.

- [x] Add a country-pack activation policy requiring source-linked evidence, effective dates, local licensing, credentials, and acceptance criteria for every required regulatory domain; 2 policy tests and TypeScript passed, with incomplete packs blocked.

- [x] Create a source-safe Egyptian medicine workbook template with provenance fields and no fabricated medicine records while the reproducible EDA bulk source remains unavailable; generated docs/data/egypt-medicine-register-source-safe-template.xlsx.

- [x] Package the source-safe workbook with a concise methodology, source register, coverage statement, and limitations note for review; created docs/data/egypt-medicine-register-delivery.md.

- [x] Run regression validation after country-pack and source-safe workbook work; 172 tests passed, 4 optional database tests skipped, TypeScript passed, and production build passed with the existing non-blocking chunk-size warning.

- [x] Create an implementation-readiness note that maps remaining blocked items to the exact prerequisite needed, without treating blockers as completed features; created docs/audits/implementation-readiness-2026-08-15.md.

- [x] Add a machine-readable country-pack source manifest for Egypt, Jordan, Qatar, and Morocco with review status and explicit activation blockers only; 1 manifest test and TypeScript passed.

- [x] Add a country-aware payroll statutory readiness policy that blocks payroll activation until tax, social-insurance, employment, currency, effective-date, and employer-registration evidence is complete; 2 policy tests and TypeScript passed, with no payroll calculations activated.

- [x] Add an insurance payer transport readiness policy requiring endpoint specification, credential configuration, claim/eligibility mappings, sandbox verification, and acceptance evidence before activation; 2 policy tests and TypeScript passed, with no payer transport activated.

- [x] Add a pure prescription/dispensing product-consumption policy that rejects cross-scope, unapproved, and evidence-incomplete catalog links before any future persistence entry point; 2 policy tests and TypeScript passed.

- [x] Add an authorized catalog-intake policy requiring role permission, organization/branch/jurisdiction scope, and source verification before new medicine, cosmetic, or medical-supply records are accepted; integrated into non-local createItem, 2 policy tests and TypeScript passed.

- [x] Add explicit cross-country and cross-organization denial coverage for persisted compliance records/procedures, and document which implemented query paths are covered by helper-level tests; cross-country isolation now has 10 tests, while live query lifecycle remains separately pending.

- [x] Add a reusable regulated-mutation readiness policy requiring branch-jurisdiction assignment, approved non-stale compliance pack, and verified catalog evidence where a product is involved; 2 policy tests and TypeScript passed.

- [x] Add a jurisdiction-aware privacy and retention readiness policy requiring legal basis, retention period, data-subject rights handling, deletion/export controls, and effective source evidence before activation; 2 policy tests and TypeScript passed.

- [x] Add a controlled-substance dispensing readiness policy requiring jurisdiction evidence, facility licence, authorized prescriber/pharmacist roles, verified prescription, and dual review before activation; 2 policy tests and TypeScript passed.

- [x] Add an inventory-mutation readiness policy requiring scoped branch/jurisdiction, approved current compliance pack, valid batch evidence, FEFO selection, and non-negative stock before activation; 2 policy tests and TypeScript passed.

- [x] Add a jurisdiction-aware tax-calculation readiness policy requiring effective source evidence, rates, rounding rules, exemption handling, and audit metadata before activation; 2 policy tests and TypeScript passed.

- [x] Add an invoice-numbering readiness policy requiring jurisdiction-bound sequence, fiscal-period validity, uniqueness, gap handling, and audit metadata before invoice persistence is enabled; 2 policy tests and TypeScript passed.

- [x] Add a localization/timezone readiness policy requiring verified locale, RTL direction where applicable, timezone, currency, calendar/date formats, and effective source evidence before country activation; 2 policy tests and TypeScript passed.

- [x] Add an audit-event integrity readiness policy requiring actor identity, organization/branch/jurisdiction scope, event classification, UTC timestamp, and tamper-evidence metadata for regulated actions; 2 policy tests and TypeScript passed.

- [x] Add a notification-delivery readiness policy requiring recipient scope, consent/preferences, allowed channel, quiet-hours handling, localized content, and audit metadata before delivery; 2 policy tests and TypeScript passed.

- [x] Add a clinical-data access readiness policy requiring role authorization, declared purpose, organization/branch/jurisdiction scope, consent where applicable, and audited break-glass handling; 2 policy tests and TypeScript passed.

- [x] Add a patient-identity matching readiness policy requiring trusted internal identifier, minimum demographic confirmation, ambiguity blocking, and manual review for unresolved matches; 2 policy tests and TypeScript passed.

- [x] Add a data-export readiness policy requiring subject verification, organization/branch/jurisdiction scope, legal basis, field minimization/redaction, and audit metadata before export; 2 policy tests and TypeScript passed.

- [x] Add an offline-sync mutation readiness policy requiring idempotency key, scoped actor/device, conflict resolution, retry safety, and audit metadata before synchronization; 2 policy tests and TypeScript passed.

- [x] Add a device-trust readiness policy requiring device identity, encrypted local storage, supported app version, screen-lock assurance, revocation state, and scoped session before offline healthcare access; 2 policy tests and TypeScript passed.

- [x] Integrate REQUIRED_COUNTRY_PACK_DOMAINS into the regional registry and approval readiness path so a country cannot appear enabled without complete source-linked verified coverage; 9 focused tests and TypeScript passed.
- [x] Add regional router contract tests proving an enabled country is rejected when timezone, audit, or any required domain evidence is missing; contract coverage passed.
- [x] Persist or model per-country required-domain coverage explicitly in compliance pack rules without activating any unverified country; rulesJson now requires the full matrix and manifest remains blocked for all reviewed countries.

- [x] Check the official EDA registered-drug search endpoint for a reproducible bulk/API source; the endpoint was reachable by URL but exposed no usable export or interactive data in the test environment, so the catalog remains safely blocked pending an authorized source.

- [x] Documented as BLOCKED: real trusted-device attestation from an authorized native/MDM client path is required before regulated offline replay; browser capabilities are not treated as device trust.

- [x] Add a server-side Device-Trust gate to offline draft replay; missing or incomplete trust context is rejected before database access, with 5 contract/policy tests passing. Client attestation remains pending until a real trusted-device signal is available.

- [x] Expand Device-Trust policy tests to cover each individual missing trust signal and confirm all failures remain blocked; 7 focused tests and TypeScript passed.

- [x] Run full regression and production build after the latest readiness changes; latest run passed 70 test files with 220 tests passing and 5 optional database tests skipped because an isolated TEST_DATABASE_URL is unavailable, and the production build completed successfully.

- [x] Align the offline replay UI with server Device-Trust gating: show the blocked state and reason when no trusted client attestation is available instead of presenting a misleading actionable replay button; TypeScript and 7 focused tests passed.

- [x] Harden the optional database test harness so it requires an explicit isolated-test marker and refuses production-like TEST_DATABASE_URL values before opening a connection; 3 safety tests and TypeScript passed, while schema-boundary remains safely skipped without the isolated database URL.

- [x] Document the isolated database lifecycle test runbook, required environment markers, cleanup expectations, and the fact that no production URL or real patient/customer data may be used; persisted lifecycle execution remains pending until an isolated TEST_DATABASE_URL is available.

- [x] Document the trusted-device attestation contract and approved client options, explicitly excluding browser-only capabilities as security evidence; server and UI remain fail-closed until a provider is configured.

- [x] Add a source-level regulated-entrypoint contract test covering the currently implemented POS invoice preview, sale preparation/commit, and prescription upload/extract/confirm/dispense gates, while explicitly documenting absent invoice persistence and product-matching paths; 2 tests and TypeScript passed.

- [x] Consolidate the remaining blocked prerequisites into a dated audit index that separates implementable code gaps from missing database, regulatory source, credential, and trusted-device dependencies; saved as docs/audits/open-prerequisites-index-2026-08-15.md.

- [x] Align every DB-touching integration test with the isolation guard, including organization-scope and TEST_DATABASE_URL smoke checks, so no test opens a MySQL connection without TEST_DATABASE_ISOLATED=true and a non-production URL; 5 focused tests passed, 5 optional schema tests skipped safely, and TypeScript passed.

- [x] Update the open-prerequisites audit index after DB harness hardening to record that all current connection-opening tests are fail-closed behind the isolation guard.

- [x] Make the database smoke test assert its safe-skip state explicitly when no isolated test database is configured, while preserving the guarded connection check when one is available; 4 focused tests and TypeScript passed.

- [x] Refresh the open-prerequisites index with the exact remaining unchecked items after the database-test skip, preserving each blocker and its required prerequisite.

- [x] Create and validate the dated source-safe Egyptian medicine workbook with 28-column medicine schema, coverage/limitations, field dictionary, source register, and import instructions; validation passed with zero medicine product rows and one explicit non-record status row.

- [x] Add adaptive client performance defaults: conservative React Query caching, lazy-load non-critical routes/components, and avoid repeated session-storage work on every request without changing auth behavior.
- [x] Include client-side unit tests in Vitest so the session-header cache test runs in CI and local regression checks.
- [x] Refresh the open-prerequisites audit index with the latest 223-test regression and performance hardening status without closing external blockers.
- [x] Harden external-adapter readiness with explicit endpoint contract, submission acknowledgement, retry, and audit requirements while keeping all unconfigured adapters blocked; 71 test files passed, 223 tests passed, and production build passed.
- [x] Require future invoice adapters to prove the shared external-adapter readiness contract before submission, while preserving local document and catalog-scope validation; 71 test files passed, 223 tests passed, and production build passed.
- [x] Add a pure trusted-attestation contract validator for nonce, freshness, revocation, and organization/jurisdiction scope; keep it unused by browsers until an authorized native provider is configured; 71 test files passed, 231 tests passed, and production build passed.
- [x] Create Arabic and English operational manuals covering the implemented ALDO Health Care Eco System workflows by professional role, with country-specific readiness notes where relevant.
- [x] Create a safe demo-role access matrix without real credentials or personal data.
- [x] Generate validated PDF manuals and package all deliverables into a ZIP archive.
- [x] Create and integrate a simple ALDO system icon and favicon assets without changing the secure brand identity; asset bound to /manus-storage/aldo-system-icon_1c63a72c.png in HTML and PWA manifest.
- [x] Add a provenance-safe Data Matrix payload/validation contract and document the official tracking-system adapter boundary; GS1-style contract excludes patient data and remains externally unverified until an official adapter is configured.
- [x] Review and strengthen file/data encryption and immutable audit/hash-chain controls without claiming a live blockchain network or inventing keys; AES-256-GCM envelope and SHA-256 audit-chain verification added and tested.
- [x] Verify and expose the login entry screen and sales/POS route clearly in the current application, preserving demo-mode and protected-auth behavior; /login and /sales added, 233 tests passed, TypeScript and production build passed.
- [x] Add a diplomatic limited-device mode: allow read-only/demo and non-regulated drafts with clear scope messaging, while continuing to block regulated offline replay and submission without trusted attestation; offlineQueue now rejects regulated drafts, UI explains the boundary, and 235 tests passed.
- [x] Replace the visible subtitle «منصة الصيدليات العربية متعددة الدول» with «منظومة الرعاية الصحية الشاملة» while preserving ALDO branding, routes, and permissions; 235 tests passed, TypeScript and production build passed.

- [x] Clarify and expose the correct authentication model: distinguish owner/OAuth email login from internal role-based username/password login, without creating insecure demo credentials or weakening existing auth gates; /login now explains the separation and offers the appropriate employee form after OAuth sign-out.

- [x] Add a secure internal employee username/password authentication path separate from OAuth and demo mode, with hashed credentials, session rotation, throttling/lockout boundaries, and logout/revocation; implemented with opaque revocable sessions and generic failure handling.
- [x] Bind internal sessions to organization, branch, jurisdiction, role, and permission snapshot; enforce these scopes server-side for regulated workflows.
- [x] Add auditable authentication, authorization, and medicine-traceability events with tamper-evident linkage and no sensitive secret/password material.
- [x] Add the internal login UI, focused security tests, TypeScript/build verification, and documentation explaining how internal permissions connect to healthcare and medicine traceability; 74 test files passed, 239 tests passed, build passed, and /login was visually verified.

# Comprehensive Cross-System Review 2026-08-15
- [x] Review authentication, authorization, tenant/branch/jurisdiction isolation, session lifecycle, and audit integrity across implemented routes.
- [x] Review regulated workflows, offline boundaries, medicine traceability, Data Matrix, encryption, and external-adapter fail-closed behavior.
- [x] Review frontend routes, accessibility, RTL/mobile behavior, performance, error/loading states, and user-facing wording.
- [x] Review schema/migration safety, persistence boundaries, test coverage, logs/privacy, and deployment readiness.
- [x] Apply only reproducible fixes and additions, then run focused and full validation with visual checks.
- [x] Produce a dated comprehensive review report separating implemented controls, policy-only boundaries, and external blockers.
- [x] Reduce the main client bundle by lazy-loading Home and Login behind a shared route fallback, and harden internal-auth parameter validation so malformed scrypt records or missing audit HMAC keys fail closed.

# Interactive Demo Enhancement 2026-08-15
- [x] Replace the current read-only/demo landing behavior with an interactive demo workspace that exposes safe sample data for core ERP/CRM modules.
- [x] Add explicit demo-mode guardrails: synthetic data banner, no real persistence, no regulated submission, no external connector calls, and resettable demo state.
- [x] Add demo actions for browsing catalog, preparing a sample POS cart, reviewing a prescription workflow, viewing customer care/call-centre examples, and inspecting reports/alerts.
- [x] Add focused tests for demo-mode isolation, reset behavior, and blocked regulated/external mutations.
- [x] Verify desktop and mobile demo flows visually and run TypeScript, Vitest, and production build before checkpoint.
- [x] Document the demo entry path and the difference between simulated results and production integrations.

# Interactive Demo Enhancement

- [x] Replace the read-only Demo placeholder with a local synthetic-data interactive workspace.
- [x] Expose all Demo navigation modules while keeping real-user role and organization scoping unchanged.
- [x] Add safe local simulations for POS, FEFO inventory, prescription review, insurance, catalog, customer care, call centre, compliance, finance, compounding, and people views.
- [x] Add Demo reset action and explicit fail-closed/no-external-submission messaging.
- [x] Add unit coverage for Demo discount limits and synthetic catalog search.
- [x] Validate TypeScript, production build, full Vitest regression, and desktop visual routes.

# Hardware Integration Review

- [x] Audit printer support, including receipt, A4/label, barcode/Data Matrix, network, USB, Bluetooth, and browser/PWA limitations.
- [x] Audit scanner support, including keyboard-wedge barcode scanners, camera scanning, document scanners, and Data Matrix workflows.
- [x] Audit monitoring support, including cold-chain sensors, CCTV/access-control boundaries, device health, and alert delivery.
- [x] Define fail-closed hardware adapter contracts and a local bridge requirement where browser APIs are insufficient.
- [x] Add tests and documentation for hardware integration readiness without claiming unsupported device connectivity.

# Printer and Scanner Simulation Enhancement

- [x] Add a role-scoped hardware settings workspace for selecting printer models, media type, and connection transport.
- [x] Add an interactive barcode scanner simulator with sample payloads, validation, and event log.
- [x] Add an interactive thermal-printer simulator with receipt preview, print settings, and simulated print result.
- [x] Keep simulator state local and visibly separate from production device adapters and regulated workflows.
- [x] Add unit coverage for supported model/transport combinations, barcode validation, and simulator isolation.
- [x] Verify responsive UI, TypeScript, Vitest, and production build before checkpoint.

# Language Switcher and Demo Access Fix

- [x] Add a visible Arabic/English language switcher to the public login and authenticated workspace chrome.
- [x] Ensure language changes update direction and persist locally without exposing sensitive session data.
- [x] Add a prominent Demo entry CTA and direct Demo workspace launch path from the safe login flow.
- [x] Ensure Demo mode opens interactive module workspaces instead of read-only overview content.
- [x] Add tests for language persistence, RTL/LTR switching, and Demo entry visibility/guardrails.
- [x] Verify login, Demo, responsive layouts, TypeScript, Vitest, and production build before checkpoint.

# Welcome Screen 2026-08-15
- [x] Add a dedicated public welcome screen at the root route with ALDO branding, concise value proposition, language switcher, login CTA, interactive Demo CTA, and safe contact/status messaging.
- [x] Move the authenticated operational workspace to a dedicated route while preserving /sales and existing protected behavior.
- [x] Redirect Demo sessions directly to the interactive workspace and provide a safe return path from the welcome screen.
- [x] Add focused tests for welcome CTA destinations, language control presence, and Demo/workspace route separation.
- [x] Verify desktop/mobile visuals, RTL/LTR, TypeScript, Vitest, production build, and save a published checkpoint.

# Multilingual Smart Search 2026-08-15
- [x] Add deterministic Arabic/English text normalization for catalog and searchable operational labels.
- [x] Add Arabic-English keyboard-layout correction with conservative candidate scoring and no silent mutation of user input.
- [x] Add cross-language search matching for names, IDs, ingredients, categories, and source text where indexed locally.
- [x] Expose search suggestions and explain when a keyboard-layout correction was applied.
- [x] Add focused tests for Arabic normalization, English/Arabic lookup, keyboard mapping, mixed text, and no-result safety.
- [x] Verify performance, RTL/LTR behavior, TypeScript, Vitest, production build, and save a published checkpoint.

# Egyptian and Arab Pharmacopeia References 2026-08-15
- [x] Identify and record the authoritative Egyptian source with authority and URL; document that no current legally usable pan-Arab reference was verified, so edition, effective date, access/licensing status, and activation remain BLOCKED until an issuing authority provides them.
- [x] Add a provenance-safe pharmacopeia reference registry without copying protected monographs or treating pharmacopeia text as product registration approval.
- [x] Define scoped uses for quality/specification review, active-ingredient/form normalization, pharmacist reference, and regulatory evidence review.
- [x] Link eligible reference metadata to multilingual search and catalog verification with jurisdiction and organization scope.
- [x] Add fail-closed tests for missing source, stale edition, missing license, wrong jurisdiction, and unverified product claims.
- [x] Update Arabic/English operational documentation with pharmacopeia usage boundaries and run TypeScript, Vitest, build, and visual checks.
- [x] Save and publish the verified implementation; keep unavailable official sources and credentials explicitly open.

# Security Hardening Review 2026-08-15

- [x] Audit and harden HTTP security headers, transport security, clickjacking protection, MIME sniffing, referrer policy, and browser capability policy.
- [x] Audit authentication/session cookies, CSRF boundaries, OAuth/internal-auth separation, logout/revocation, throttling, and sensitive error disclosure.
- [x] Audit tRPC/API input validation, organization/branch/jurisdiction authorization, IDOR/cross-tenant access, and regulated-entrypoint fail-closed behavior.
- [x] Audit upload/storage handling, prescription files, path/key safety, MIME/size validation, and sensitive-data exposure.
- [x] Add automated security regression tests for the hardened controls and attack-boundary cases.
- [x] Run TypeScript, Vitest, production build, dependency/security checks, and document residual risks and external operational prerequisites.
- [x] Save and publish the security-hardening checkpoint with a dated security review report.

# Anti-Tampering and Workplace Monitoring Review 2026-08-15

- [x] Add server-enforced tamper-evident event policy for authentication, authorization, configuration, catalog, inventory, POS, prescription, export, storage, and audit actions.
- [x] Add detection and escalation policy for repeated failures, privilege changes, scope changes, record deletion/alteration, audit-chain breaks, clock anomalies, and suspicious bulk access without fabricating incidents.
- [x] Add privacy-preserving camera/audio monitoring contract with consent, notice, purpose limitation, retention, access scope, masking, legal approval, and fail-closed adapter readiness.
- [x] Add tests for anti-tampering event classification, alert thresholds, audit-chain integrity, privacy gates, and blocked unconfigured camera/audio adapters.
- [x] Document operational response, evidence preservation, retention/deletion, incident review, and human oversight requirements.
- [x] Run full tests, TypeScript, production build, and package the complete project plus relevant documentation into one compressed archive.
- [x] Save and publish the anti-tampering and monitoring checkpoint.

# Arabic Brand Rename and Language QA 2026-08-15

- [x] Choose and apply a formal, modern, premium Arabic system name with an accurate English equivalent and short form.
- [x] Replace old visible branding and metadata consistently across HTML, PWA manifest, app title, welcome screen, workspace, documentation, and generated delivery references.
- [x] Perform Arabic RTL and English LTR copyediting of visible user-facing strings, correcting spelling, grammar, punctuation, terminology, and capitalization without changing security meaning.
- [x] Review main routes and user-facing states for stale names, awkward translations, missing language labels, and inconsistent terminology.
- [x] Run focused language/branding tests, full Vitest, TypeScript, production build, and responsive visual checks.
- [x] Save and publish the renamed, language-reviewed checkpoint.

# Supply Chain and Procurement Tracking 2026-08-15

- [x] Add scoped supply-chain policy covering suppliers, procurement orders, receipts, batches, expiry, transfers, returns, recalls, and delivery status.
- [x] Add server-side validation for organization, branch, jurisdiction, supplier authorization, order state transitions, quantities, and batch traceability.
- [x] Add supply-chain event/audit records for creation, approval, dispatch, receipt, discrepancy, quarantine, return, recall, and cancellation.
- [x] Add supply-chain workspace with safe empty states, filters, multilingual search, traceability timeline, and risk indicators without fabricated operational data.
- [x] Add tests for scope isolation, state transitions, FEFO/expiry boundaries, discrepancy handling, recall/quarantine, and tamper-evident audit linkage.
- [x] Document real supplier/API/EDI/GS1/regulatory integration prerequisites and fail-closed boundaries.
- [x] Run full Vitest, TypeScript, production build, visual verification, and package the complete project, documentation, and tests into one downloadable ZIP archive.
- [x] Save and publish the supply-chain checkpoint.

# Demand Forecasting and Automatic Reorder Dashboard 2026-08-15

- [x] Define an explainable demand-forecasting policy using only supplied or persisted sales/usage history, with minimum-history and no-data states.
- [x] Add automatic reorder-point and suggested-order-quantity calculations with lead time, service level, safety stock, current stock, open orders, expiry/FEFO, and supplier constraints.
- [x] Enforce organization, branch, jurisdiction, product, and authorization scope on forecasting inputs and recommendations.
- [x] Add a supply-chain dashboard with forecast horizon, confidence/data-quality status, reorder alerts, calculation explanations, filters, and RTL/LTR states.
- [x] Add tests for forecast boundaries, seasonality/data gaps, lead-time and safety-stock calculations, expiry/FEFO constraints, scope isolation, and no-data fail-closed behavior.
- [x] Document that recommendations are decision support, require authorized review, and do not create purchase orders automatically without approval.
- [x] Run full Vitest, TypeScript, production build, and responsive visual verification, then save and publish the checkpoint.

# Actual Sales Forecast Integration and Reusable Skill

- [x] Review the implemented sales schema and forecast policy to define the authorized aggregation boundary for actual sales.
- [x] Add server-side actual-sales aggregation by organization, branch, jurisdiction, product, and time bucket with exclusion of cancelled, voided, demo, and unauthorized records.
- [x] Connect the aggregation to the demand forecast and reorder dashboard with data-quality states, source timestamps, and no-data fail-closed behavior.
- [x] Add tests for tenant/branch isolation, status filtering, time-window boundaries, duplicate/idempotency handling, and forecast input provenance.
- [x] Document that recommendations remain decision support and never create purchase orders without authorized approval.
- [x] Create a reusable skill package describing the secure healthcare ERP review, fail-closed implementation, testing, visual verification, checkpoint, and archive workflow.
- [x] Validate the reusable skill with the official skill validator and deliver its SKILL.md.
- [x] Run full Vitest, TypeScript, production build, responsive visual verification, and save/publish the application checkpoint.
- [x] Prepare the updated complete project archive if the user requests a downloadable bundle after this change.


# Current Forecast Integration TODO

- [x] Complete the reusable `aldora-healthcare-delivery` skill and validate its frontmatter/content.
- [x] Connect authenticated supply-chain forecasting to scoped server sales history without using synthetic fixtures.
- [x] Preserve fail-closed behavior when branch/jurisdiction scope, history, or verified inventory inputs are unavailable.
- [x] Add focused tests for forecast sales-history scope and real-data UI transformation.
- [x] Run TypeScript, Vitest, production build, responsive checks, and refresh the delivery ZIP archive.


# Comprehensive Integration Review

- [x] Audit end-to-end integration between authentication, organization/branch/jurisdiction scope, roles, and module navigation.
- [x] Audit server procedures and database boundaries for POS, inventory, prescriptions, catalog, customer care, call centre, procurement, reports, notifications, and offline workflows.
- [x] Audit frontend-to-backend contracts, loading/error/empty states, and real-versus-demo data boundaries.
- [x] Fix confirmed integration gaps without activating unverified regulatory, hardware, surveillance, or external-provider connectors.
- [x] Add or update integration regression tests and run TypeScript, Vitest, production build, and responsive visual verification.
- [x] Update integration documentation and save a new checkpoint/archive after all items are verified.


# Confirmed Integration Gaps

- [x] Connect the real insurance request workflow to an authenticated workspace with scoped list/create/transition states and fail-closed messaging.
- [x] Connect scheduled/report-definition and report-run workflows to a discoverable reports workspace, preserving organization/jurisdiction authorization.
- [x] Connect promotion list/create/approve workflows to an authorized workspace and expose statutory-cap/readiness states.
- [x] Add a scoped organization-management entry point for authorized managers/admins, or document it as intentionally server-only.
- [x] Add regression coverage for each newly connected frontend-to-backend contract and verify no demo data crosses into production views.


# Hospital and Universal Health Insurance Status Review

- [x] Audit government-hospital module coverage, workflows, roles, and data boundaries.
- [x] Audit private-hospital module coverage, workflows, roles, and data boundaries.
- [x] Audit universal health insurance workflows, claims, eligibility, approvals, providers, and official connector boundaries.
- [x] Produce an evidence-based completeness matrix distinguishing implemented foundations, connected workflows, and blocked external integrations.


# Egypt Hospital and Universal Health Insurance Completion

- [x] Establish an Egypt evidence register for hospital licensing, health insurance, privacy, e-invoicing, medicines, labs, radiology, and official connector prerequisites.
- [x] Add government-hospital internal workflows: patient registry, encounters, appointments, admissions, wards/beds, emergency, orders/results, discharge, referrals, and role boundaries.
- [x] Add private-hospital internal workflows: the same clinical core plus packages, payer contracts, deposits, billing, approvals, and private-provider reporting boundaries.
- [x] Expand universal health insurance internally: beneficiary eligibility, provider/payer contracts, preauthorization, claims, adjudication states, remittance/reconciliation, appeals, and audit.
- [x] Keep Egypt external adapters blocked until official endpoint specifications, credentials, test environment, acceptance evidence, and responsible authority are supplied.
- [x] Add schema migrations, server procedures, UI workspaces, scope/security tests, full validation, documentation, and an updated checkpoint/archive.


# GAHAR and Egypt Hospital Accreditation Readiness

- [x] Research and record current official GAHAR accreditation domains, standards, manuals, and evidence requirements with source dates and URLs.
- [x] Add scoped facility accreditation profiles, standard/domain catalog, readiness assessments, evidence register, corrective actions, and approval states.
- [x] Add patient-safety, infection-prevention, medication-safety, emergency preparedness, credentialing, incident reporting, complaints, quality indicators, and audit workflows.
- [x] Add government/private hospital dashboards and reports without claiming accreditation or substituting for GAHAR inspection.
- [x] Keep official submission, accreditation decision, and any external data exchange fail-closed until authorized specifications and credentials exist.
- [x] Add tests, documentation, visual verification, and checkpoint/archive after implementation.


# Remove Demo Mode and Demo Account

- [x] Remove demo-mode entry points, buttons, routes, session flags, and demo-only navigation.
- [x] Remove demo account/session handling and prevent demo authentication or bypass paths.
- [x] Remove demo fixtures, synthetic workspace data, demo-only assets, and demo wording while preserving legitimate empty states.
- [x] Audit internal employee and owner authentication, role guards, and production data boundaries after removal.
- [x] Add regression tests, run TypeScript, Vitest, production build, responsive verification, and save a checkpoint.


# Employee and Owner Login Recovery

- [x] Review the existing real employee/owner authentication contract, login page, and server session boundaries before changes.
- [x] Add a secure password-recovery request flow with generic anti-enumeration responses, throttling, expiry, single-use tokens, and audit events.
- [x] Add a secure password-reset completion flow with strong validation, token invalidation, session invalidation, and fail-closed behavior.
- [x] Improve Arabic/English login validation errors and visible loading/submission states without exposing credentials or sensitive authentication details.
- [x] Add focused authentication and password-recovery regression tests, then run TypeScript, Vitest, production build, and responsive browser verification.
- [x] Save and publish a checkpoint after all login and recovery items are verified.


# Verified Recovery Channel and 2FA

- [x] Review enabled connector configuration; no approved email or SMS/OTP delivery path is enabled, and the user deferred both channels.
- [x] Provider credentials and sender/issuer configuration remain intentionally unrequested and unvalidated because the user deferred activation; fail-closed boundary is documented.
- [x] 2FA enrollment, challenge, recovery-code, lockout, and audit implementation is deferred by the user; existing authentication remains without an unactivated 2FA bypass path.
- [x] Real password-recovery delivery is deferred; token policy, generic responses, expiry, single use, throttling, and fail-closed behavior remain implemented without exposing tokens to the browser.
- [x] Mandatory 2FA at login is deferred by the user; owner/employee login remains restricted to the currently configured real authentication path with no partial 2FA state.
- [x] Arabic/English password-recovery loading and error states are implemented; 2FA setup and OTP screens are deferred until the user selects a provider or TOTP policy.
- [x] Existing recovery and authentication regression coverage is complete; provider/OTP-specific tests are deferred with the provider implementation and no external connector is active.
- [x] TypeScript, Vitest, production build, responsive verification, and checkpoint validation completed for the currently enabled authentication and research scope; deferred integrations remain fail-closed.


# ICD-11 Clinical Coding Integration

- [x] WHO ICD-11 browser/API source, release, licensing, language coverage, and update obligations were researched and recorded; activation remains blocked by unavailable credentials.
- [x] ICD-11 catalog and provenance design boundary is documented; implementation is deferred until official access and permitted data delivery are available.
- [x] ICD-11 Arabic/English search is not activated without official access; alternative NLM ICD-10-CM search was evaluated as a separate jurisdiction-scoped option with safe fail-closed recommendation.
- [x] ICD-11 clinician workflow implementation is deferred until the official terminology source is available; no unverified diagnosis catalog is inserted.
- [x] ICD-11 billing, insurance, reporting, and GAHAR linkage is deferred until verified codes and jurisdiction rules exist; no financial outcome is changed automatically.
- [x] ICD-11 activation is blocked by the existing organization/branch/jurisdiction and credential gates; implementation remains deferred rather than bypassing access controls.
- [x] ICD-11 refresh/version activation remains deferred; the required evidence, approval, rollback, and stale-version fail-closed design is documented for future implementation.
- [x] Research-scope documentation, TypeScript/build health, responsive verification, and a published checkpoint are complete; ICD-11 runtime tests await authorized implementation.


# Alternative Disease Classification Sources

- [x] Identify free or open alternatives for disease classification and terminology lookup, including official national/open datasets and public APIs.
- [x] Verify each candidate's license, commercial-use terms, language coverage, release freshness, authentication complexity, and rate limits from primary sources.
- [x] Evaluate clinical suitability, coding authority, offline/cache options, and risks of using each candidate in patient records, billing, and insurance workflows.
- [x] Save a cited Arabic/English comparison report and recommend a fail-closed integration strategy for ALDORA without replacing WHO ICD-11 authority silently.


# Reusable Healthcare Research Skill and NLM ICD-10-CM Connector

- [x] Plan and package the reusable healthcare research, source-validation, licensing, fail-closed integration, and evidence-reporting skill.
- [x] Validate the reusable skill with the official skill validator and prepare it for delivery.
- [x] Add a provider-neutral NLM ICD-10-CM reference-search adapter with strict timeout, bounded results, source/version provenance, and no patient-data forwarding.
- [x] Add a protected ALDORA reference-search procedure and Arabic/English UI with jurisdiction-scoped labels and explicit non-authoritative status.
- [x] Add tests for exact/partial search, empty/error/timeout states, result bounds, provenance, tenant/role isolation, and prohibition on automatic diagnosis or billing changes.
- [x] Run TypeScript, Vitest, production build, responsive verification, validate the skill, save/publish a checkpoint, and deliver the reusable skill.


# NLM Reference Search Cache and Skill Iteration

- [x] Define a bounded, provider-scoped cache policy for NLM reference results, including TTL, key normalization, stale behavior, and privacy boundaries.
- [x] Extend the reusable ALDORA skill with repeatable cache design, provenance capture, invalidation, and verification guidance.
- [x] Implement NLM result caching with retrieval timestamp, dataset/version metadata, source URI, bounded memory/storage, and no patient data in cache keys or values.
- [x] Verify cache hit/miss, expiration, source failure, concurrent requests, tenant isolation, and response provenance through tests.
- [x] Run TypeScript, Vitest, production build, responsive verification, validate the skill, and save/publish a checkpoint.


# Admin-Only NLM Cache Refresh

- [x] Update the reusable ALDORA skill with an admin-only cache invalidation workflow, audit requirements, and UI/server separation.
- [x] Add a server-side admin-only NLM cache refresh/invalidation procedure with scope checks, rate limiting, and audit metadata.
- [x] Add an Arabic/English manual refresh button visible only to administrators, with loading, success, failure, and last-retrieved/version status.
- [x] Add regression tests proving non-admin denial, audit behavior, cache invalidation, refresh success/failure, and no automatic diagnosis or billing mutation.
- [x] Run TypeScript, Vitest, production build, responsive verification, validate the reusable skill, and save/publish a checkpoint.


# Isolated Investor Showcase Account

- [x] Define a separate investor-showcase tenant/environment boundary with no access to production records, PHI, customer data, secrets, or external regulatory connectors.
- [x] Add a dedicated showcase account type and safe credential lifecycle; do not use weak production credentials such as test/test.
- [x] Add read-only/demo-safe permissions, blocked destructive/export/admin actions, audit logging, throttling, and session expiry for showcase users.
- [x] Provide isolated showcase data and clear UI labeling so investors understand they are viewing a demonstration environment.
- [x] Add investor contact CTA without exposing personal contact data, plus Arabic/English showcase guidance.
- [x] Add authentication, tenant-isolation, authorization, and UI regression tests; run TypeScript, Vitest, build, responsive verification, and save/publish a checkpoint.


- [x] Confirmed deployment model: investor showcase account runs on the same site but is bound to a separate showcase organization and isolated scope.
- [x] Confirmed showcase account must not use test/test credentials; use a strong managed credential with controlled rotation.


- [x] Confirmed showcase credential choice: username `test` with a strong managed password, not `test/test`.
- [x] Confirmed same-site showcase scope: separate organization, labeled non-production data, trial permissions, no delete/export/production/sensitive-connector access.


- [x] Enforce server-side showcase simulation mode so sales, stock movements, receipts, invoices, claims, and other mutations cannot alter production balances or persistent production records.
- [x] Block external connectors, notifications, exports, deletion, and irreversible actions for showcase sessions, with explicit simulation audit events.
- [x] Provide isolated showcase data stores/records and visible Arabic/English simulation labels for all trial transactions.
- [x] Add regression tests proving showcase transactions never cross organization boundaries or mutate production balances.

# Investor Showcase TODO
- [x] Create isolated ALDORA Investor Showcase organization, branch, and test account records
- [x] Populate showcase-only synthetic products, inventory, and sales data
- [x] Verify showcase login, scope isolation, and server-side mutation simulation guard
- [x] Finalize showcase UI labels and access documentation
- [x] Fix showcase login contract test returning HTTP 500 and rerun authentication tests
- [x] Review Pharma eMarket and UPA portals for read-only integration requirements and official evidence
- [x] Switch tamper-evident audit signing from short JWT_SECRET to validated AUDIT_SIGNING_KEY and pass its regression test

# Comprehensive ALDORA Audit TODO
- [x] Audit repository architecture, runtime boundaries, schema, migrations, routes, UI, and dependency risks.
- [x] Audit authentication, session lifecycle, password recovery, audit signing, CSRF, rate limits, secrets, tenant isolation, and role permissions.
- [x] Audit healthcare data protection, PHI boundaries, consent, retention, exports, logs, uploads, backups, and external connectors.
- [x] Audit clinical, pharmacy, inventory, prescription, insurance, laboratory, radiology, hospital, and GAHAR workflow safety boundaries.
- [x] Research and document current official Egyptian and Arabic-region regulatory integration requirements without claiming certification.
- [x] Implement high-confidence corrective fixes and regression tests discovered during the audit.
- [x] Run full TypeScript, Vitest, production build, responsive verification, and security checks; document residual blockers.
- [x] Produce an Arabic/English audit and readiness report for investors, UPA, EDA, Egyptian government entities, distributors, pharmacies, chains, laboratories, and manufacturers.

- [x] Keep UPA, EDA, ETA, UHIA, government, insurer, and other official external connectors deferred and fail-closed until formal approval, specifications, credentials, sandbox access, and acceptance evidence are provided.
- [x] Audit and improve all internal workflows independently of deferred government integrations; do not block internal readiness on external connector availability.

- [x] Revalidate internal session user status, credential status, scope membership, branch activity, and jurisdiction binding on every request.
- [x] Prevent audit-chain concurrency races and validate request identifiers before recording showcase simulation events.
- [x] Add regression tests for stale/revoked membership, inactive users, expired sessions, and concurrent audit writes.

- [x] Review and remediate actionable production dependency advisories, prioritizing Drizzle ORM, Axios, Lodash, and redirect/SSRF-related packages; verify compatibility after updates. Remaining Express 4 body-parser advisory is documented as a non-breaking migration constraint.
- [x] Review client offline persistence to ensure no PHI or credentials can be stored in localStorage or IndexedDB.

- [x] Add payload-level defense-in-depth to offline drafts so common PHI, credential, and clinical identifiers cannot be queued even when a caller incorrectly marks a draft as non-regulated.

- [x] Reduce initial JavaScript payload with safe vendor code-splitting and verify production build output.

- [x] Trust forwarded host and protocol headers only when the request originates from the configured loopback proxy; add regression tests for direct-client spoofing.

# Integration Status Notices and Authentication Settings 2026-08-15

- [x] Add visible Arabic/English notices for government and insurance integrations that are currently closed pending official credentials, specifications, sandbox verification, and acceptance evidence.
- [x] Add accessible tooltips explaining why government and insurance features are fail-closed and what prerequisite unlocks them, without implying official integration is active.
- [x] Add a protected authentication settings workspace for 2FA and password recovery readiness, clearly separating configured, deferred, and unavailable states.
- [x] Add 2FA setup/status UI with fail-closed enrollment boundaries, no fake QR/OTP secrets, and explicit requirement for an approved TOTP or institutional provider policy.
- [x] Add password-recovery channel settings UI ready for an institutional email provider, without exposing or generating real recovery tokens in the browser.
- [x] Add Arabic/English loading, success, error, deferred, and unavailable states for the new settings and integration notices.
- [x] Add regression tests for notice visibility, tooltip accessibility, fail-closed 2FA/recovery states, role/scope protection, and no external activation.
- [x] Run TypeScript, Vitest, production build, responsive visual verification, and save/publish a checkpoint.


# Connector and Accreditation Control Center 2026-08-15

- [x] Define a central connector registry model with government and insurance providers, jurisdiction, organization scope, readiness state, required prerequisites, and last reviewed metadata.
- [x] Add an admin-only server procedure for reading connector and accreditation readiness without exposing credentials or enabling external calls.
- [x] Add a protected bilingual admin dashboard with summary counts, provider cards, prerequisite checklists, fail-closed state, and audit/review timestamps.
- [x] Add accessible tooltips and clear actions for reviewing prerequisites without presenting deferred connectors as active.
- [x] Add regression tests for admin-only access, organization/jurisdiction scope, credential redaction, fail-closed activation, and readiness-state rendering.
- [x] Run TypeScript, Vitest, production build, responsive visual verification, and save/publish a checkpoint.


# Connector Filters and Accreditation Audit Log 2026-08-15

- [x] Add advanced bilingual filters for country, provider, connector type, and readiness stage in the admin connector dashboard.
- [x] Add a protected server-side filtering contract that validates allowed values and preserves organization/branch/jurisdiction scope.
- [x] Add detailed connector/accreditation audit records for status changes, including actor, scope, connector, previous/new state, reason, timestamp, and correlation identifier.
- [x] Ensure audit records are tamper-evident, append-only, credential-redacted, and inaccessible to non-admin users.
- [x] Add an admin-only audit-log view with filtering, empty/loading/error states, and clear fail-closed messaging.
- [x] Add regression tests for filter combinations, invalid filters, admin-only access, scope isolation, audit integrity, and secret redaction.
- [x] Run TypeScript, Vitest, production build, responsive visual verification, and save/publish a checkpoint.


# Accreditation Expiry and Status Alerts 2026-08-15

- [x] Define bilingual alert policy for expiring, expired, and status-changed government/insurance accreditations, including severity and lead-time thresholds.
- [x] Add protected server-side alert derivation and acknowledgment procedures without enabling external connectors or notifications.
- [x] Preserve admin-only access, organization/branch/jurisdiction scope, credential redaction, and tamper-evident audit metadata for alert actions.
- [x] Add visible bilingual alert center and summary indicators to the connector dashboard with loading, empty, error, unread, and acknowledged states.
- [x] Add regression tests for expiry thresholds, status changes, admin-only access, scope isolation, deduplication, acknowledgment, and fail-closed external delivery.
- [x] Run TypeScript, Vitest, production build, responsive visual verification, and save/publish a checkpoint.


# Egyptian Healthcare Catalog Research Expansion 2026-08-15

- [x] Establish a source register and provenance policy for Egyptian medicines, cosmetics, medical cosmetics, medical equipment, and medical supplies.
- [x] Search official and public commercial sources for Egyptian medicines, capturing Arabic/English names, price when available, barcode/GTIN, manufacturer, source URL, extraction date, and regulatory status.
- [x] Search official and public commercial sources for cosmetics and medical cosmetics with the same provenance and field requirements.
- [x] Search official and public commercial sources for medical equipment and medical supplies, including model/catalog identifiers, manufacturer, price, barcode/GTIN, and source metadata when available.
- [x] Cross-check duplicates, normalize Arabic/English names, validate barcode/GTIN formats, separate product categories, and mark unverified fields as missing rather than inferring them.
- [x] Verify licensing, terms of use, source reliability, price-date limitations, and whether automated collection or redistribution is permitted.
- [x] Produce source-safe CSV/XLSX datasets and an Arabic/English research report with coverage, limitations, provenance, and import instructions; do not insert unverified records into production catalogs.
- [x] Add or update a controlled catalog-intake path for reviewed records, preserving jurisdiction, organization scope, source evidence, and approval status.
- [x] Run validation tests and provide downloadable research/data deliverables with a clear distinction between verified, commercial-reference, and pending-review records.


# Catalog Approval and E-Prescription 2026-08-15

- [x] Create a reusable skill for Egyptian healthcare catalog research, provenance, licensing, normalization, validation, review, and controlled import.
- [x] Validate and package the reusable skill using the skill-creator workflow.
- [x] Add an admin-authorized bilingual catalog review workspace for imported medicine and cosmetics records before main-catalog approval.
- [x] Support review decisions, rejection reasons, evidence/source links, duplicate detection, field corrections, approval status, and tamper-evident audit events.
- [x] Preserve organization/branch/jurisdiction isolation and prevent unreviewed records from appearing in operational catalogs.
- [x] Review existing prescription-related models and add a safe e-prescription workflow for doctors, pharmacies, hospital pharmacies, and contracted dispensaries.
- [x] Add prescription identity, verification, patient retrieval ID, dispensing status, partial dispensing, cancellation/expiry, and duplicate-dispense protections without exposing unnecessary PHI.
- [x] Keep governmental, insurer, e-prescription exchange, SMS/email, and regulated integrations fail-closed until official specifications, credentials, sandbox, and acceptance evidence are provided.
- [x] Add regression tests, run TypeScript, Vitest, production build, responsive visual verification, validate the skill, and save/publish a checkpoint.


# Local Starter Catalog Import Clarification 2026-08-15

- [x] Treat the collected medicine, cosmetics, medical cosmetics, equipment, instruments, and supplies datasets as local starter data rather than online-only references.
- [x] Preserve source URL, extraction date, source type, category, and review status for every imported starter record, even when official verification is unavailable.
- [x] Deduplicate starter records using normalized Arabic/English names, manufacturer, barcode/GTIN when present, and category-specific identifiers without inventing missing values.
- [x] Import starter records into a quarantined/pending-review catalog scope that is available for search and review but cannot silently become authoritative or regulated data.
- [x] Add controlled promotion from starter/pending-review records to the main catalog after an authorized review decision, with audit evidence and rollback-safe behavior.
- [x] Add tests and validation reports for local persistence, duplicate handling, source provenance, review states, and protection from unreviewed regulated use.

# Catalog Approval and E-Prescription Expansion

- [x] Add catalog review queue UI with category/status filters, provenance visibility, and authorized approve/reject actions.
- [x] Add safe local-starter catalog import path preserving PENDING_REVIEW provenance and idempotency; commit remains guarded by an explicit production scope.
- [x] Add clinician-authored e-prescription workflow with verification, patient-ID scoped pharmacy access, and dispensing gate.
- [x] Add Vitest coverage and responsive verification for catalog approval and e-prescription workflows.
- [x] Update ALDORA healthcare delivery skill with implemented catalog approval and e-prescription patterns.

# Bulk Catalog Import Workspace 2026-08-15

- [x] Add admin-only bulk catalog import workspace with file selection and explicit organization/branch/jurisdiction scope.
- [x] Add server dry-run contract that parses and validates starter rows without mutation, reports duplicates, existing records, invalid fields, and provenance gaps.
- [x] Add explicit confirmation contract that accepts only a matching dry-run token and preserves PENDING_REVIEW/idempotency/audit behavior.
- [x] Add bilingual responsive UI for dry-run results, conflict review, confirmation, loading, error, and fail-closed states.
- [x] Add focused tests, full validation, screenshots, and publish a checkpoint.

# Shortcuts, Egyptian Returns, Tax and Invoice Controls 2026-08-15

- [x] Fix the current bulk-import UI TypeScript error and complete focused/full validation before extending scope.
- [x] Add role-aware shortcuts registry and keyboard navigation for core operations: new sale, returns, prescription, inventory, search, reports, and help.
- [x] Add an accessible shortcuts help dialog with conflict detection, focus-safe behavior, and no sensitive-data exposure.
- [x] Review and document Egyptian consumer-protection return/refund policy boundaries; implement configurable return reasons, eligibility, approvals, refund/audit controls, and fail-closed official integration status.
- [x] Review and implement VAT/tax invoice foundations with jurisdiction-scoped tax profiles, invoice numbering, tax breakdown, correction/credit-note controls, and auditability; keep ETA/e-invoice exchange fail-closed pending credentials/specifications.
- [x] Disable Ctrl+A/Select All only within protected ALDORA application surfaces for non-admin/non-owner roles, while preserving text-field accessibility and OS/browser limits.
- [x] Add tests, responsive verification, update documentation/skill guidance, and publish a checkpoint.

# Sales Returns and Tax Invoice Workspace 2026-08-15

- [x] Review current sales, invoice, numbering, VAT, audit, and authorization contracts before adding a parallel financial path.
- [x] Add scoped server contracts for return preview, eligibility checks, approval, refund/exchange/credit-note outcomes, and tax invoice issuance.
- [x] Enforce original-invoice linkage, quantity limits, duplicate protection, jurisdiction tax profile, rounding, numbering, and audit events.
- [x] Add a bilingual sales workspace for return processing and tax-invoice preview/issuance with clear fail-closed states.
- [x] Add focused tests, full validation, responsive screenshots, documentation/skill updates, and publish a checkpoint.

# Local Tax Invoice PDF and Organization Template 2026-08-15

- [x] Review local tax-invoice output fields, organization scope, numbering, VAT status, and current POS invoice contract.
- [x] Add organization-scoped invoice template settings with safe defaults, validation, and auditability; never store file bytes in the database.
- [x] Add protected invoice preview, browser print, and PDF export for local invoices with explicit local/non-ETA status.
- [x] Add template customization UI for bilingual organization identity, address, tax identifiers, colors, footer, and optional uploaded logo reference.
- [x] Add tests for tenant isolation, template validation, PDF/print contract, and fail-closed behavior; run responsive verification and publish a checkpoint.

# Tax Invoice PDF and Organization Templates

- [x] Add organization-scoped tax invoice template editor and preview controls to SalesFinanceWorkspace.
- [x] Integrate jsPDF export and print flow using server-issued local tax invoice data and scoped branding.
- [x] Add focused tests for template permissions, PDF payload safety, and invoice UI contracts.
- [x] Update aldora-healthcare-delivery skill with reusable tax-invoice PDF/template patterns.
- [x] Run TypeScript, Vitest, production build, and desktop/mobile verification for invoice PDF/template work.

Generated invoice PDF remains a local presentation/export artifact; official ETA submission stays fail-closed until formal credentials and acceptance evidence exist.

# PDF Arabic Font and Preview Enhancements
- [x] Embed a licensed Arabic-capable font in exported local tax invoice PDFs with a safe fallback.
- [x] Add PDF preview modal before download with paper-size and printer-selection controls.
- [x] Preserve server-issued invoice amounts, tenant-scoped branding, local-only ETA status, and print safety.
- [x] Add focused tests and verify TypeScript, Vitest, production build, and responsive UI before checkpoint.

# Comprehensive Security, Resilience, Migration, and Documentation Review
- [x] Audit and strengthen discreet ownership/provenance protection for ALDO/ALDORA without claiming that code alone creates legal ownership rights.
- [x] Produce a current cross-module capability and integration-harmony audit with implemented, partial, blocked, and deferred boundaries.
- [x] Verify online/offline and weak-connection behavior; preserve fail-closed treatment for regulated mutations and document supported offline drafts.
- [x] Review encrypted backup/restore architecture and define safe online/offline operational procedures without exposing keys.
- [x] Define a safe legacy-data migration baseline and import contract with validation, mapping, dry-run, quarantine, idempotency, and audit requirements.
- [x] Review low-end device and supported-browser/platform performance boundaries and document verified support versus prerequisites.
- [x] Add role-aware shortcut discoverability/help UI if missing, preserving server authorization.
- [x] Prepare formal bilingual product description, role-based user manuals, IT/admin/owner guide, proposal, ALDO naming explanation, diagrams, and visual assets.
- [x] Package the reviewed documentation and supporting artifacts into one downloadable archive.
- [x] Run focused/full tests, TypeScript, production build, documentation validation, and responsive verification before checkpoint.

# Offline Connection and Sync Indicator
- [x] Add a role-safe bilingual connection-status and sync-progress indicator to the application workspace.
- [x] Reflect offline draft policy, pending/failed/syncing counts, last successful sync, and manual retry without claiming regulated offline commits.
- [x] Add focused tests and verify TypeScript, Vitest, production build, and responsive UI; document modified files for delivery.

# Automatic Reconnect Sync and Conflict Review
- [x] Upload eligible local customer-care/call-centre drafts automatically after reconnect using idempotency.
- [x] Add local sync states and a bilingual conflict review/resolution surface without auto-approving regulated work.
- [x] Update aldora-healthcare-delivery skill with reconnect sync and conflict-resolution patterns.
- [x] Add tests and run TypeScript, Vitest, production build, and responsive verification before checkpoint.

# Reusable Reconnect Sync Skill
- [x] Create and validate a standalone reusable skill for reconnect-triggered draft synchronization and conflict review.
- [x] Deliver the generated SKILL.md as a downloadable skill artifact.

# Retrospective Completion Review
- [x] Build a requirement-by-requirement matrix from the user's comprehensive request, mapping implemented, partial, deferred, blocked, and unverified items to evidence files.
- [x] Identify and implement remaining in-project ownership/provenance and governance safeguards that are technically feasible without making legal guarantees.
- [x] Identify and implement remaining feasible gaps in offline/online operation, backup/restore, migration, weak-network resilience, performance, platform support, and module integration.
- [x] Reconcile documentation, archives, reusable skills, and delivery artifacts with the requirement matrix.
- [x] Run final verification and deliver a concise completed/remaining/external-prerequisites report.

# ALDORA Official Overview Document — 2026-08-15
- [x] Create one formal Arabic/English document combining the ALDORA naming explanation and system philosophy/operation guidance.
- [x] Add print-friendly visual diagrams and restrained presentation effects without making unsupported claims.
- [x] Validate and deliver the single downloadable document file.

# ALDORA Official Overview Expansion — 2026-08-15
- [x] Add a formal bilingual section defining the healthcare sectors ALDORA is designed to serve.
- [x] Map the platform modules and operating role to each target sector without claiming unsupported live integrations.
- [x] Re-export, validate, checkpoint, and directly deliver the updated document.

# ALDORA Full Project Archive — 2026-08-15
- [x] Inventory project files and define safe archive exclusions for secrets, environment files, generated dependencies, and runtime logs.
- [x] Build one complete ZIP archive containing source code, tests, documentation, diagrams, migrations, configuration, and lockfiles.
- [x] Verify archive integrity, manifest, and absence of secret files before direct delivery.

# Enduro Raw Local Setup PDF — 2026-08-15
- [x] Create a formal Arabic local-setup guide titled «إعدادات التشغيل المحلي لنظام ALDORA» based on the provided setup instructions.
- [x] Generate and verify a print-ready PDF with clear headings, tables, commands, and security notes.
- [x] Deliver the PDF directly as a downloadable attachment.

# ALDORA Local Setup PDF Title Correction — 2026-08-15
- [x] Use the corrected title «إعدادات التشغيل المحلي لنظام ALDORA» and filename for the final PDF.

# ALDORA Account Access Sheet — 2026-08-15
- [x] Confirm which account identifiers and roles are documented, without exposing password hashes or unverified secrets.
- [x] Create a secure account sheet that identifies the test username and explains how its password is provisioned or reset.
- [x] Verify and deliver the account sheet directly to the user.

# ALDORA Continuous Integration — 2026-08-15
- [x] Review package scripts and existing GitHub workflow configuration.
- [x] Add a GitHub Actions workflow for TypeScript checks, tests, and production build on push and pull request.
- [x] Validate the workflow locally, save the project checkpoint, and confirm synchronization with GitHub.

# ALDORA CI Security and Maintenance Guardrails — 2026-08-15
- [x] Add lint/format validation, dependency security audit, CodeQL analysis, and dependency review to CI. Production audit is now a blocking gate after the high-severity baseline was remediated.
- [x] Add a post-build smoke check that validates the application responds without modifying data.
- [x] Configure main-branch protection requiring the CI check when GitHub permissions allow it. (Attempted via GitHub API; private-repository plan returned 403, so the limitation and compensating controls are documented.)
- [x] Document safe auto-maintenance boundaries: report and propose fixes automatically, but require review for security, data, permissions, or regulated changes; camera/microphone monitoring remains consent-gated and disabled by default.

# Production Dependency High-Severity Remediation — 2026-08-15
- [x] Inventory the nine high-severity production dependency findings and map each to its parent package and transitive path.
- [x] Apply the smallest safe dependency updates or overrides and regenerate the lockfile.
- [x] Re-run production audit, TypeScript, tests, build, and smoke check; document any residual advisory with a reason and remediation path.

# Dependabot Security Updates Skill — 2026-08-15
- [x] Verify repository, branch, existing Dependabot configuration, and GitHub security-update availability.
- [x] Enable Dependabot security updates and configure safe dependency update grouping/scheduling without auto-merging major changes.
- [x] Create and validate a reusable skill documenting Dependabot activation, CI gates, verification, and failure-safe rollback guidance.

# ALDORA Local-Ready Archive Refresh — 2026-08-15
- [x] Inventory the latest project files, CI, Dependabot, security policy, tests, and documentation for safe packaging.
- [x] Add or refresh local setup instructions and a placeholder environment template without real secrets. (Added LOCAL_SETUP.md; real environment files remain excluded by design.)

# Government Integration Readiness — Independent Copy

- [x] Audit the existing government-connector registry, readiness controls, audit records, configuration model, and regression coverage before extending the readiness workflow.
- [x] Define a versioned, organization-and-jurisdiction-scoped government integration acceptance packet with explicit evidence, security, sandbox, and production gate states.
- [x] Implement server-enforced readiness validation and tamper-evident audit events that keep every government adapter disabled until all required approvals and artifacts are verified.
- [x] Add a bilingual administrative readiness workspace that shows missing prerequisites, safe next actions, evidence review status, and explicit blocked status without exposing secrets or invoking external services.
- [x] Document the operational handover path for receiving official specifications, certificates, credentials, test endpoints, approval evidence, and production acceptance records.
- [x] Add focused regression tests, run TypeScript, Vitest, production build, and responsive verification, then save a checkpoint for the completed readiness hardening.

# Comprehensive Capability and Security Expansion — Independent Copy

- [x] Complete and validate the government-integration readiness packet, its server authorization boundary, redacted audit evidence, bilingual administrative UI, and operational handover documentation without enabling external transmission.
- [x] Map all deferred business capabilities into implementation releases, distinguishing feasible internal workflows from integrations that remain blocked pending official authority approval, specifications, credentials, sandbox access, and acceptance evidence.
- [x] Expand the highest-leverage internal operational modules for people/HR, finance and purchasing, CRM, reports, and workflow approvals with organization, branch, jurisdiction, role, audit, and empty-state protections.
- [x] Strengthen reporting, alerting, notification, and offline foundations with deterministic, idempotent server-side boundaries and no unapproved recurring jobs, external delivery, PHI persistence, or regulated offline replay.
- [x] Review and harden application security end-to-end, including authentication, authorization, tenant isolation, sessions, secrets, audit integrity, input validation, security headers, rate limiting, upload boundaries, dependency risks, and trusted-proxy/network controls.
- [x] Review every routed system capability for UI-to-server contract correctness, protected access, loading/error/empty states, data-scope enforcement, fail-closed regulatory actions, and test coverage.
- [x] Run focused and full tests, TypeScript, production build, desktop/mobile verification, and document every residual external prerequisite or security limitation before saving a checkpoint.
- [x] Build one complete updated ZIP archive and verify integrity, manifest, and absence of secrets or generated dependencies.
- [x] Validate the documented local startup sequence, save the project checkpoint, and deliver the ZIP directly.

# Governed AI and Workplace-Monitoring Readiness

- [x] Define an organization-scoped AI assistance registry covering permitted operational use cases, human-review requirements, protected-data restrictions, decision prohibitions, audit events, and fail-closed provider readiness.
- [x] Add an administrative AI readiness workspace for approved internal analysis use cases, transparent status, redacted configuration prerequisites, and no automatic clinical, employment, or regulated external decisions.
- [x] Implement a privacy-first workplace-monitoring readiness model with explicit purpose limitation, notice and consent records, minimal retention, role-based access, review workflow, incident auditability, and disabled-by-default ingestion.
- [x] Prohibit facial recognition, biometric identification, emotion inference, covert recording, and automated worker evaluation in workplace-monitoring policy and server-enforced readiness checks.
- [x] Document the prerequisite path for future camera or microphone connectivity, including lawful basis, signage, consent, retention schedule, security assessment, vendor agreement, sandbox validation, and human accountable owner.
- [x] Add focused tests for AI and monitoring guardrails, then include these controls in the final security, TypeScript, build, and responsive verification.

# AI Purchasing, Decision Support, and Full-System Verification

- [x] Audit current purchasing, AI-governance, decision-support, data, and test foundations before adding new AI workflows.
- [x] Define safe, organization-scoped AI contracts with provenance, data minimization, confidence, human approval, audit, and fail-closed rules.
- [x] Add AI purchasing analysis for demand, reorder priorities, supplier comparison, anomaly flags, and explainable recommendations without automatic purchase submission.
- [x] Add AI decision-support summaries for operational KPIs and exceptions without making clinical, employment, financial, or regulated decisions automatically.
- [x] Add data-driven improvement proposals with evidence windows, source metrics, confidence, expected impact, risks, owner, review status, and explicit human acceptance.
- [x] Audit and repair full-system routes, UI-server contracts, database boundaries, tenant isolation, permissions, security controls, integrations, loading/error states, and responsive behavior.
- [x] Run focused and full tests, TypeScript, production build, browser flows, and document every defect, repair, skipped integration, and residual limitation.
- [x] Save a validated checkpoint after all requested AI and system-wide verification work is complete.

> External regulated integrations, automatic purchasing, clinical decisions, employment decisions, and workplace surveillance actions remain disabled unless separately authorized, reviewed, and explicitly approved.

# Home Code Splitting and AI Purchasing Review UX

- [x] Inspect current Home imports, bundle composition, purchasing insight output, review permissions, and existing review tests.
- [x] Split Home feature workspaces with dynamic imports, resilient loading states, and route-level error handling without breaking navigation.
- [x] Design and implement a dedicated interactive human-review workspace for purchasing recommendations with evidence, confidence, limitations, traceability, and explicit review outcomes.
- [x] Enforce safe review semantics: approval is advisory/documentary only, rejection/dismissal requires context where appropriate, and no automatic purchase execution is introduced.
- [x] Add unit and UI coverage, responsive/accessibility verification, and compare production bundle output before and after code splitting.
- [x] Document the performance and review workflow changes and save a validated checkpoint.

# Anti-Manipulation, Anti-Fraud, and Anti-Theft Controls

- [x] Map risks across POS, inventory, procurement, prescriptions, finance, HR, CRM, offline drafts, accounts, devices, and audit logs.
- [x] Define server-enforced segregation of duties, dual control, approval limits, cooldowns, reversals, and conflict-of-interest rules.
- [x] Add incident, investigation, evidence, case-status, and investigator-access boundaries without fabricating accusations or production incidents.
- [x] Add risk-based detection for unusual discounts, voids, returns, stock adjustments, transfers, duplicate identities, privilege changes, after-hours activity, and purchase anomalies.
- [x] Add human investigation workspace with evidence timeline, reconciliation views, reason codes, review notes, escalation, and immutable audit references.
- [x] Harden tenant/branch isolation, rate limits, idempotency, session/device controls, export/download protections, and privacy-preserving alert data.
- [x] Add focused policy tests, full tests, TypeScript, production build, responsive verification, and repair any discovered conflicts.
- [x] Document residual risks, legal/HR boundaries, required operational policies, and save a validated checkpoint.

> The system will generate risk signals and preserve evidence, not declare a person guilty. No covert workplace surveillance, biometric inference, automated disciplinary action, or irreversible blocking will be introduced without explicit authorization and human review.

# Full System Audit, Manual Verification, and GitHub Synchronization

- [x] Inspect repository status, remotes, branch, uncommitted changes, project configuration, and audit scope.
- [x] Run complete tests, TypeScript, production build, dependency/security checks, and targeted policy tests.
- [x] Manually exercise public, authentication, dashboard, AI purchasing, human review, anti-fraud, POS, inventory, prescription, finance, HR, CRM, regulatory-readiness, and error/empty states.
- [x] Verify database schema/migrations, tenant and branch isolation, authorization boundaries, audit trails, uploads, schedules, disabled external integrations, and runtime logs.
- [x] Repair every reproducible defect or conflict found, with regression tests where applicable.
- [x] Document audit coverage, fixes, test results, residual limitations, and GitHub synchronization outcome.
- [x] Save a validated checkpoint and synchronize the validated project state with 0SSAM/ALDORA-Integrated-Health-System.

> Manual verification cannot bypass authentication or invent production data. Where a protected flow requires a real account, credentials, or external staging service, record the limitation and verify the server-side contract and safe failure behavior instead.

# PR, Staging Validation, Toolchain, and Integrity Completion

- [x] Inspect current GitHub branch and existing pull requests; confirm PR #8 source manus/full-system-audit-pr-2026-08-16 and target main.
- [x] Maintain PR #8 from manus/full-system-audit-pr-2026-08-16 to main with the audit, test, security, and residual-risk summary; latest validated head is 221ecf5.
- [x] Manually review the PR diff, changed files, mergeability, and CI; required CI gates pass, while GitHub review approval remains required and merge is intentionally blocked.
- [x] Document that the five database-dependent tests remain safely skipped because no authorized isolated TEST_DATABASE_URL and TEST_DATABASE_ISOLATED=true were provided; no application database was used.
- [x] Apply compatible toolchain configuration changes and document remaining upstream Node/action warnings; local and CI tests, type checks, build, smoke, and CodeQL passed.
- [x] Complete anti-manipulation, anti-fraud, and anti-theft controls across prevention, detection, reconciliation, investigation, evidence, escalation, privacy, and audit boundaries.
- [x] Perform final regression, security, responsive, and manual workflow verification for the new changes; local and CI validation passed.
- [x] Per user decision, do not merge PR #8; preserve its branch/history, publish the validated login fix through the project checkpoint, and document residual limitations including the eight safe database-dependent skips and required independent GitHub review if future synchronization is needed.

- [x] Keep the five database-dependent tests safely skipped until an explicitly isolated TEST_DATABASE_URL and TEST_DATABASE_ISOLATED=true are available; never substitute the application DATABASE_URL.
- [x] Complete autonomous PR review, toolchain compatibility checks, anti-fraud hardening, regression validation, and merge-gate documentation without bypassing required GitHub review; only independent GitHub approval remains.
- [x] إصلاح اختبار مسار تسجيل دخول الموظفين بعد تغيّر نصوص واجهة الدخول، ثم إعادة تشغيل prettier وTypeScript وVitest والبناء قبل تحديث PR.

- [x] إصلاح تحميل server/test.setup.ts في Vitest/CI وتشغيل smoke server بعزل واضح بقيم CI-only غير إنتاجية؛ quality وCodeQL نجحا على f9b4f74.

- [x] إصلاح فشل تسجيل دخول الموظفين عند تعذر بنية قاعدة البيانات أو سجل التدقيق عبر استجابة fail-closed عامة ووسم خطأ غير حساس؛ اجتازت 368 اختبارًا وTypeScript والبناء، ودُفع الإصلاح إلى PR #8 في commit cefb375.

# Login Recovery and PR Decision

- [x] توثيق قرار تجاوز PR #8 وعدم دمجه؛ الإصلاح الحالي سيُنشر عبر مسار المشروع المباشر مع بقاء الفرع والـPR المغلقين قابلين للتتبع.
- [x] تشخيص سبب فشل تسجيل دخول الموظفين: فشل تسجيل سجل محاولة الدخول كان يُرفع إلى الواجهة عند عدم تهيئة حساب/تدقيق الموظفين، فظهر كخطأ اتصال عام.
- [x] إصلاح مسار تسجيل الدخول دون إضعاف fail-closed أو كشف تفاصيل حساسة: أصبح سجل فشل الدخول غير حاجب للاستجابة، مع وسم خادم غير حساس ورسالة بيانات اعتماد عامة؛ أضيف اختبار عقد.
- [x] تشغيل التحقق الكامل: 369 اختبارًا ناجحًا و8 متخطاة بأمان، TypeScript والبناء ناجحان؛ الإصلاح جاهز للنشر عبر checkpoint.

# Comprehensive System Audit — 2026-08-16

- [x] تشغيل وفحص اختبارات Vitest وTypeScript والبناء وتدقيق التبعيات دون استخدام بيانات إنتاجية.
- [x] مراجعة سجلات الخادم والعميل وطلبات الشبكة لاكتشاف أخطاء تشغيل أو تسريبات أو مسارات فاشلة.
- [x] تجربة المسارات العامة والمحمية والمصادقة وتسجيل الخروج ورسائل الفشل الآمن على سطح المكتب والهاتف.
- [x] تجربة نقاط دخول الوحدات الأساسية: POS، المخزون، الوصفات، العملاء، مركز الاتصال، التأمين، الامتثال، المالية، الموارد البشرية، الذكاء الاصطناعي، ومكافحة الاحتيال.
- [x] مراجعة عزل المؤسسة والفرع والاختصاص، أدوار المستخدمين، حدود العمليات المنظمة، وسجل التدقيق.
- [x] إصلاح كل عيب قابل لإعادة الإنتاج، ثم إعادة تشغيل التحقق الكامل وتوثيق القيود المتبقية.

- [x] إصلاح تعارض سياسة الوحدات: organization type غير معروف يمنع الوصول fail-closed، واختبار العقد وواجهة مساحة العمل لا يسمحان بوحدات تشغيلية غير مصرح بها.

- [x] ربط وحدة inventory الظاهرة في قائمة مساحة العمل بـ SupplyChainWorkspace الموجود، وإضافة اختبار parity يمنع ظهور وحدة بلا renderer فعلي؛ اجتاز الاختبار TypeScript والبناء.

- [x] إصلاح اختبار Home module parity ليقرأ تعريف organizationModules الحالي رغم تنسيقه في سطر واحد؛ نجح Vitest الكامل: 371 ناجحًا و8 متخطاة بأمان.

- [x] إصلاح تعليق التحقق من الجلسة في /login و/workspace عند غياب session cookie، مع ضمان ظهور نموذج الدخول أو حالة الوصول الآمن وعدم بقاء spinner بلا نهاية.

# Mobile Login Incident — 2026-08-16

- [x] إعادة إنتاج فشل internalLogin من واجهة الهاتف وتحديد رمز/حمولة استجابة الخادم دون كشف بيانات اعتماد.
- [x] إصلاح سبب رسالة الاتصال العامة أو عرض نتيجة مصادقة آمنة ودقيقة للمستخدم.
- [x] اختبار تسجيل الدخول برسائل فشل آمنة على الهاتف وسطح المكتب، ثم تشغيل اختبارات الانحدار وحفظ إصدار مصحح.

- [x] إصلاح انحدار مصادقة: عدم بقاء /login و/workspace على «جارٍ التحقق من الجلسة» بلا جلسة بعد دمج إدارة الموظفين.

# Employee Account Administration — 2026-08-16

- [x] تحليل نموذج المستخدمين والأدوار والصلاحيات والنطاقات الحالي وتحديد نقاط إعادة الاستخدام.
- [x] تصميم عقد إدارة الموظفين مع عزل المؤسسة والفرع والاختصاص، وحالات الحساب، ودورة إعادة ضبط كلمة المرور.
- [x] تنفيذ إجراءات خادمية لإنشاء حساب الموظف وتعديله وتعطيله وإعادة ضبطه وفرض صلاحياته وسجل تدقيقه.
- [x] تنفيذ واجهة عربية RTL لإدارة الموظفين وتحديد الأدوار والصلاحيات وربط النطاقات مع حالات تحميل وخطأ آمنة.
- [x] إضافة اختبارات للصلاحيات والعزل ومنع التصعيد الذاتي وتعطيل الحسابات، والتحقق من الهاتف وسطح المكتب.
- [x] تشغيل TypeScript وVitest والبناء؛ 378 اختبارًا ناجحًا و9 متخطاة مبررًا.
- [x] إصلاح انحدار مصادقة: عدم بقاء /login و/workspace على «جارٍ التحقق من الجلسة» بلا جلسة بعد دمج إدارة الموظفين، مع مهلة واجهة 1.5 ثانية واختبار عقدي.

# Production Login Incident — 2026-08-16 (follow-up)

- [x] مطابقة النطاق الذي يستخدمه العميل مع الإصدار المنشور ومسار طلب internalLogin الفعلي؛ اللقطة الأحدث تؤكد أن الهاتف يستخدم نطاق الإنتاج الحالي.
- [x] تحليل استجابة internalLogin وسجلات الإنتاج دون كشف كلمات مرور أو رموز جلسات؛ اختبار الإنتاج الحالي أعاد 200 ونجاح مصادقة وجلسة.
- [x] إصلاح سبب الفشل وإعادة اختبار دخول حقيقي؛ أصل HTTPS خلف البوابة أصبح موثوقًا ويعالج مسار المتصفح الصحيح دون إضعاف CSRF.

# Browser Login Transport Incident — 2026-08-16

- [x] إعادة إنتاج طلب internalLogin من تدفق متصفح على نطاق الإنتاج الحالي، ومقارنة حالته باستدعاء الخادم الناجح عبر محاكاة طلب same-origin خلف بوابة HTTPS.
- [x] تحليل CORS وCSRF وcookies ورؤوس الحماية وشكل استجابة tRPC الذي يصل للمتصفح، دون كشف الأسرار؛ كان التحقق يستخدم أصل HTTP داخليًا لأن proxy لم يكن موثوقًا كممر إنتاج واحد.
- [x] إصلاح سبب اختلاف المتصفح وإعادة اختبار دخول حقيقي قبل نشر أي نتيجة؛ التحقق من الهاتف عاد برسالة اعتماد غير صحيح بدل خطأ اتصال عام، ما يثبت سلامة النقل.

# Showcase Credential Recovery — 2026-08-16

- [x] تحديث كلمة مرور حساب العرض `test` في مدير الأسرار فقط، ثم تدوير تجزئة الاعتماد وإبطال الجلسات القديمة عند تغيّر السر المُدار.
- [x] التحقق من نجاح دخول حساب العرض من الخادم دون كشف كلمة المرور أو قيم الجلسة؛ اختبار الدخول الحي غير المتخطى نجح.
- [x] إغلاق تحقيق النقل وتوثيق النتيجة بعد تحقق الإنتاج الآلي ولقطات الهاتف؛ تأكيد جهاز فعلي يبقى خطوة قبول اختيارية للمستخدم.

# Post-Login Session Persistence Incident — 2026-08-16

- [x] تحديد سبب نجاح `internalLogin` ثم عدم قراءة الجلسة أو استمرارها عند الرجوع إلى الصفحة العامة. السبب: لم يكن محلل الكوكيز الداخلي موصولاً بطلبات tRPC قبل إنشاء السياق، لذلك لم تصل `aldo_internal_session` إلى `auth.me` بعد نجاح الدخول.
- [x] إصلاح تثبيت جلسة دخول الموظف وتحديث قراءة الجلسة، ثم توجيه المستخدم إلى `/workspace` محليًا بعد النجاح. أضيف وسيط تحليل الكوكيز قبل tRPC، وأصبح نجاح الدخول يبطل مخزن `auth.me` ويعيد القراءة قبل الانتقال.
- [x] اختبار مسار الدخول والجلسة آليًا مع تحقق responsive للهاتف وحفظ الإصلاح؛ تحقق جهاز فعلي يبقى خطوة قبول اختيارية للمستخدم.

# Automatic Showcase Session and Logout Incident — 2026-08-16

- [x] تحديد سبب فتح الموقع تلقائيًا بحساب العرض `test` دون إجراء دخول من المستخدم، ومنع أي إنشاء أو استعادة تلقائية لجلسة العرض في الواجهة أو الخادم. تبيّن أن الجلسة السابقة كانت تبقى في كوكي المتصفح، وأن زر الخروج القديم كان يمسح جلسة OAuth فقط دون `aldo_internal_session`؛ لا يوجد مسار دخول تلقائي جديد في الكود.
- [x] إضافة زر تسجيل خروج واضح في مساحة العمل، مع إبطال جلسة الخادم وإعادة المستخدم إلى صفحة الدخول/البداية بحالة غير مصادق عليها. أصبح الخروج يستدعي `internalLogout` و`logout` ويمسح تخزين ورأس جلسة المعاينة.
- [x] إضافة اختبارات تمنع الدخول التلقائي وتثبت أن تسجيل الخروج لا يترك جلسة قابلة لإعادة الاستخدام، مع تحقق responsive للهاتف وحفظ الإصدار؛ اختبار جهاز فعلي يبقى قبولًا اختياريًا.

## Incident clarification

- [x] لا يجوز اعتبار وجود بيانات اعتماد `SHOWCASE_TEST_PASSWORD` أو تهيئة حساب العرض تصريحًا لتسجيل دخول المستخدم تلقائيًا؛ الحساب يجب أن يبقى متاحًا فقط بعد إدخال المستخدم لبياناته صراحةً. عقد الاختبار يثبت عدم وجود دخول test مضمّن في العميل، والتهيئة الخادمية محصورة بطلب `internalLogin` الصريح.
- [x] يجب أن يظهر خيار تسجيل الخروج للمستخدم المصادق عليه في جميع مسارات مساحة العمل، مع الحفاظ على عزل المؤسسة والفرع والاختصاص. زر الخروج موجود في شريط مساحة العمل، وإجراءات الخادم تظل محمية بنطاق المؤسسة/الفرع/الاختصاص.

# POS Reimplementation After Main Restore — 2026-08-16

- [x] إنشاء شاشة نقطة بيع فعلية لفتح فاتورة جديدة، البحث عن صنف، إضافته إلى السلة، وتحديد الكمية ثم تنفيذ البيع عبر العقد الخادمي المحمي.
- [x] ربط شاشة POS بمسار وحدة `pos` في Home وإظهار حالات فارغة/تحميل/خطأ ونتيجة البيع دون تجاوز الموافقات أو عزل المؤسسة والفرع.
- [x] إصلاح تداخل رأس التطبيق والقائمة الجانبية ولوحة POS على الهاتف مع الحفاظ على RTL والتمرير الآمن.
- [x] إضافة/تحديث اختبارات POS وتشغيل TypeScript والاختبارات الكاملة والبناء والتحقق البصري.
- [x] حفظ إصدار مستقل وطلب تحقق المستخدم من الهاتف.

# Daily Cross-Version Audit — 2026-08-16

- [x] مراجعة كل فروع Git ونقاط الحفظ وعمليات الدمج التي تغيّرت اليوم مقارنة بالنسخة الحالية.
- [x] فحص الملفات والتغييرات التي تخص POS والتخطيط المحمول وتسجيل مصدر كل تغيير مؤكد.
- [x] نقل التغييرات المؤكدة غير الموجودة في النسخة الحالية بطريقة انتقائية دون استرجاع إصلاحات جلسة أو أمن قديمة بالخطأ.
- [x] إعادة تشغيل اختبارات ومراجعة الفروق بعد النقل، ثم توثيق ما لم ينقل وسبب عدم نقله.

# POS Barcode, Held Invoices, Receipts, and Daftra Capability Audit — 2026-08-16

- [x] إضافة بحث سريع بالباركود من قارئ USB/كاميرا أو إدخال لوحة المفاتيح وربطه بالمخزون الموثق.
- [x] إضافة تعليق الفاتورة الحالية واسترجاع الفواتير المعلقة مع عزل المؤسسة والفرع والاختصاص وسجل تدقيق.
- [x] إضافة إيصال محلي قابل للطباعة بعد إتمام البيع بنجاح.
- [x] إضافة مشاركة آمنة للإيصال عبر رابط واتساب دون إرسال بيانات صحية أو أسرار إلى طرف خارجي.
- [x] مراجعة متطلبات دفترة ومطابقة كل خاصية مع ALDORA: مدمج، جزئي، محجوب، أو غير منفذ.
- [x] إضافة اختبارات POS، تشغيل TypeScript والاختبارات الكاملة والبناء والتحقق البصري، ثم حفظ الإصدار.

# Core Cashier Cycle and Accounting Gaps — 2026-08-16

- [x] إضافة نموذج وردية كاشير وفتح درج البيع مع رصيد افتتاحي وحارس منع تعدد الورديات المفتوحة.
- [x] إضافة شاشة تقفيل درج/وردية البيع مع عد نقدي، فروق، اعتماد مدير، وسجل تدقيق غير قابل للتلاعب.
- [x] إضافة استعراض فواتير المبيعات للفترة مع فلاتر الفرع والكاشير والتاريخ والحالة، دون تسريب خارج النطاق.
- [x] إضافة مرتجع مباشر من POS مرتبط بالفاتورة الأصلية وبصلاحيات ومراجعة وسجل تدقيق.
- [x] بدء دفتر الحسابات العام بحسابات وقيد مزدوج وإقفال فترة، مع فصل واضح عن التقارير التشغيلية.
- [x] بدء الولاء والعضويات بملف عميل، نقاط وحركات غير قابلة للتعديل المباشر، وخطط عضوية ذات صلاحيات.
- [x] إضافة اختبارات عقود وصلاحيات وعزل وواجهة، ثم TypeScript والبناء والتحقق البصري وحفظ الإصدار.

# Analytics and Mobile Interaction Enhancements

- [x] Add branch-scoped real-time sales analytics dashboard with sales KPIs, trends, payment mix, and refresh state.
- [x] Add branch-scoped inventory-alert dashboard with low-stock, out-of-stock, and expiring-stock visibility plus severity states.
- [x] Add protected server contracts and tests for analytics and inventory alert isolation.
- [x] Enhance Arabic RTL mobile cashier layout with accessible transitions, reduced-motion support, and touch feedback.
- [x] Validate analytics, inventory alerts, mobile responsiveness, TypeScript, tests, and production build.
- [x] Save and publish the completed analytics/mobile enhancement checkpoint.

# Test Account Scope and Mobile Layout Corrections

- [x] Allow the designated test/showcase account to enter demo workflows with an explicit safe demo branch and jurisdiction scope, without weakening production tenant isolation or regulated-operation guards.
- [x] Explain and expose the active organization, branch, and legal-jurisdiction scope clearly for the test account.
- [x] Fix mobile RTL header/sidebar overlap, clipped branding, and drawer positioning shown in the supplied screenshots.
- [x] Add regression tests for demo-scope behavior, logout/session safety, and mobile layout contracts.
- [x] Validate authenticated mobile flows, TypeScript, tests, production build, and responsive screenshots.
- [x] Save and publish the corrected checkpoint.

# Persistent Scope Indicator and Mobile Drawer Gestures

- [x] Add a persistent top-of-app indicator for the active organization, branch, and scope mode.
- [x] Add a guarded switch between showcase data and production data without bypassing server authorization or regulated-operation safeguards.
- [x] Add smooth loading feedback while switching branches and prevent stale branch data from appearing as current.
- [x] Add RTL mobile drawer swipe-to-close with accessible pointer/touch behavior and reduced-motion support.
- [x] Add regression tests for scope switching, branch loading state, and drawer gesture contracts.
- [x] Validate TypeScript, tests, production build, and mobile screenshots.
- [x] Save and publish the completed checkpoint.

# UI Simplification and Wayfinding

- [x] Audit current navigation, labels, hierarchy, and repeated interaction patterns that cause users to get lost.
- [x] Simplify the primary navigation into clear role-aware groups with an obvious current-location trail.
- [x] Add a compact command/search entry point for finding modules and common actions.
- [x] Simplify high-frequency workflows with clearer empty/loading/error states and contextual next actions.
- [x] Reduce visual competition, duplicate controls, and ambiguous labels across desktop and Arabic RTL mobile layouts.
- [x] Add regression tests for role-aware navigation, wayfinding, accessibility, and simplified UI contracts.
- [x] Validate mobile/desktop screenshots, TypeScript, tests, and production build.
- [x] Save and publish the simplified UI checkpoint.

# Database-Backed Demo Mode

- [x] Audit the test/showcase account, database scope, seed lifecycle, and regulated-operation guards.
- [x] Create an explicitly labelled isolated Demo data scope with synthetic fixtures and reset/reseed controls.
- [x] Connect POS, inventory, cashier, accounting, loyalty, and dashboard reads/writes to Demo data for the test account.
- [x] Ensure Demo transactions cannot affect production, government adapters, payment gateways, legal reports, or real customer/patient records.
- [x] Add visible Demo-mode warnings, scope details, and safe reset controls.
- [x] Add isolation, fixture-labeling, reset, authorization, and regulated-denial tests.
- [x] Validate core Demo workflows, TypeScript, tests, production build, and mobile/desktop behavior.
- [x] Save and publish the completed Demo-mode checkpoint.

# Complete Odoo-Inspired UX Simplification and Deep Audit

- [x] Audit all current UI shells, routes, workspaces, loading/error states, labels, and repeated controls.
- [x] Audit role-aware navigation and ensure every visible module/action matches server authorization.
- [x] Implement a role-centered application launcher with simple work-journey grouping and favorites.
- [x] Simplify global navigation, breadcrumbs, branch/scope context, and mobile drawer behavior.
- [x] Standardize high-frequency lists, forms, filters, primary actions, empty states, and confirmation patterns.
- [x] Add a universal quick-action/search experience for modules and common workflows.
- [x] Add contextual next-step guidance without obscuring regulated warnings or audit information.
- [x] Deeply audit POS, cashier, inventory, accounting, loyalty, Demo mode, analytics, AI governance, anti-fraud, and integration boundaries.
- [x] Fix verified functional, security, tenant-isolation, accessibility, RTL/mobile, and performance regressions.
- [x] Validate TypeScript, tests, production build, authenticated desktop/mobile flows, and responsive screenshots.
- [x] Save and publish the completed UX and audit release.

# Task-Oriented POS and Operations Navigation

- [x] Audit current module routing, Demo product search, POS entry points, and Operations Center actions.
- [x] Replace raw module expansion with task-oriented dropdown options for Overview, POS, Inventory, Accounting, and Operations Center.
- [x] Add a clear POS start screen with New Sale, Search Product, Held Invoices, Returns, and Close Cashier Period actions.
- [x] Make Demo product discovery obvious, seeded, searchable, and connected to the first-sale flow.
- [x] Make Operations Center an actionable hub with explicit cards/buttons and concise explanations.
- [x] Add regression tests for task navigation, Demo product search, POS start actions, and Operations Center behavior.
- [x] Validate RTL/mobile behavior, TypeScript, tests, production build, and core Demo sale flow.
- [x] Save and publish the task-oriented navigation release.

# System-Wide Task-Oriented Workflows

- [x] Audit every system module and identify the real first actions users need from each one.
- [x] Define role-aware expandable menus for Overview, POS, Inventory, Supply Chain, Prescriptions, Finance, Operations Center, Customer Care, Compliance, AI, and Administration.
- [x] Add direct start actions and secondary workflow options under every module instead of opening raw data by default.
- [x] Make Operations Center a functional workflow hub with clear actions, statuses, and explanations.
- [x] Ensure the same task-oriented navigation works for production users and isolated Demo users.
- [x] Add routing and visibility regression tests for roles, scopes, and module actions.
- [x] Validate full-system usability on RTL mobile and desktop, then publish the release.


# Task-Oriented UX Audit — 2026-08-16

- [x] Add a system-wide task menu so each permitted module exposes direct actions before opening dense workspace data.
- [x] Add POS task entry points for new sale, product/barcode search, suspended invoices, returns, and cashier period review while preserving server permissions.
- [x] Convert Operations Center into an actionable guided hub for frontline work, procurement, CRM, and review queues.
- [x] Add first-sale and product-discovery guidance paths for showcase/demo users without weakening production isolation.
- [x] Add focused regression tests for task menu visibility, role filtering, RTL labels, and safe fallback behavior.
- [x] Run TypeScript, focused Vitest tests, production build, and desktop/mobile visual verification for the task-oriented UX change.
- [x] Save a checkpoint only after all implementation and verification items above are complete.

## Task-Oriented UX Audit — Evidence

- [x] Record a capability audit of high-frequency entry points and remaining blocked integrations without claiming competitor parity.
- [x] Record that task buttons navigate only to existing authorized workspaces; no regulated mutation is bypassed by the menu.


# Mobile POS and Simulated Barcode Audit — 2026-08-16

- [x] Optimize POS layout for narrow mobile screens, including compact header, basket visibility, and touch targets.
- [x] Add an explicitly labeled simulated barcode scanner for Demo/testing that feeds the existing product search flow.
- [x] Preserve physical/USB keyboard barcode input, server-side product scope, and production authorization boundaries.
- [x] Add focused regression tests for simulated scanning, barcode search, mobile controls, and RTL labels.
- [x] Run TypeScript, focused Vitest tests, production build, and mobile visual verification.
- [x] Save and publish the mobile POS update after all checks pass.


# Universal Barcode and Data Matrix Reading — 2026-08-16

- [x] Audit all existing barcode inputs, supported formats, and data-preservation behavior across POS and related workflows.
- [x] Add a shared scanner contract for Barcode and Data Matrix that preserves the complete decoded payload, symbology, raw text, and scan source.
- [x] Add production-safe hardware/keyboard input handling and a clearly isolated simulated scan path for Demo/testing.
- [x] Integrate the shared reader into POS search and basket flows without weakening organization, branch, jurisdiction, role, or audit boundaries.
- [x] Add regression tests for full payload preservation, Data Matrix values, malformed input, duplicate scans, and RTL labels.
- [x] Validate TypeScript, focused tests, production build, and mobile POS behavior.
- [x] Save and publish the universal scanner update after all checks pass.


# Camera Barcode Scanner — 2026-08-16

- [x] Add a camera scanner entry point to POS with explicit Arabic RTL permission guidance.
- [x] Handle camera permission granted, denied, unavailable, insecure-context, and stream-error states safely.
- [x] Decode supported camera barcode payloads through the shared scanner contract without truncation.
- [x] Provide immediate USB/keyboard, manual-entry, and simulated-scan fallbacks when camera scanning fails.
- [x] Stop camera tracks on close, successful scan, unmount, and failure; do not retain camera frames.
- [x] Add regression tests for permission/fallback labels, scanner cleanup contracts, and payload handoff.
- [x] Run TypeScript, focused tests, production build, and mobile visual verification.
- [x] Save and publish the camera scanner update after all checks pass.


# Mobile Screen Capture Protection — Planned After Camera Scanner

- [x] Document realistic screenshot and screen-recording limits for web/PWA, Android, iOS, and HarmonyOS.
- [x] Add web-layer sensitive-view protection: blur/redaction on visibility loss, no-store handling where appropriate, dynamic user/branch watermark, and bounded capture-risk event notification.
- [x] Add capture-risk detection and user notification where browser/platform signals are available, without claiming absolute prevention.
- [x] Define an Android native wrapper path using secure-window controls for regulated screens.
- [x] Define iOS and HarmonyOS handling based on platform capture notifications and privacy overlays where supported.
- [x] Add tests for visibility changes, redaction, watermark rendering, and fail-safe recovery.
- [x] Publish a security note explaining that external-camera capture and privileged OS capture cannot be technically eliminated by a web app.


# Cinematic ALDORA Advertising Film — 2026-08-16

- [x] Confirm the creative treatment, target audiences, CTA, and delivery assumptions before generation.
- [x] Define a realistic Arabic cinematic visual system with neutral professional settings and no Gulf dress styling.
- [x] Plan horizontal 16:9 and vertical 9:16 cuts with synced narration, effects, and audience-specific value propositions.
- [x] Generate required visual references before producing video clips.
- [x] Attempt final MEDORA video generation; the service returned today's free-plan limit (1/1), so final horizontal/vertical production remains explicitly deferred until quota reset or upgrade, with no false completion claim.
- [x] Review continuity, readable branding, safe claims, framing, and platform suitability before delivery.


## Approved Advertising Direction

- [x] Use a 150-second horizontal master, a 90-second vertical cut, and short audience-specific edits.
- [x] Use Arabic male narration and the closing phrase “MEDORA | منظومة الرعاية الصحية المتكاملة”.
- [x] Design a new smart, modern MEDORA symbol to replace the current shield concept while preserving professional healthcare trust.
- [x] Apply the new symbol consistently in the video end card and approved brand visuals.


# MEDORA Brand Migration — 2026-08-16

- [x] Audit all user-facing MEDORA/old-name references, metadata, titles, logos, documentation, and advertising assets.
- [x] Design a MEDORA symbol based on six interconnected paths representing Medical, Enterprise, Data-Driven, Orchestrated, Resilient, and AI-Enabled.
- [x] Add the new logo and brand tokens as web-safe project assets without storing local media inside the deployed project.
- [x] Replace the visible product name and logo across the application while preserving stable technical identifiers and legal/audit provenance references where required.
- [x] Update relevant advertising blueprint and brand documentation to MEDORA Health Care Eco System.
- [x] Run focused name-migration checks, TypeScript, production build, and visual verification.
- [x] Save and publish the MEDORA brand migration checkpoint.


# Deferred MEDORA Video Generation — 2026-08-16

- [x] Define a bounded deferred execution strategy for the final MEDORA advertising video after quota reset.
- [x] Avoid claiming direct quota-reset event detection; use an explicit scheduled retry or user-triggered resume path.
- [x] Preserve the approved 150-second horizontal, 90-second vertical, and short audience-cut specifications.
- [x] Prevent uncontrolled retries or duplicate video generations.
- [x] Record the deferred status and resume conditions in project documentation.


# Reusable Cinematic Advertising Skill — 2026-08-16

- [x] Extract the reusable advertising-production workflow from the MEDORA campaign.
- [x] Define the skill trigger, input contract, phases, safety limits, and output checklist.
- [x] Initialize a standalone skill package with references or templates only where reusable.
- [x] Write and validate the skill with the skill-creator validation script.
- [x] Deliver the reusable SKILL.md to the user.

# MEDORA Follow-up Audit — 2026-08-16

- [x] Remove remaining user-facing ALDORA/Aldora labels from client UI, invoice print window/file defaults, offline sync labels, and capture-protection metadata while preserving technical server identifiers and historical audit evidence.
- [x] Repair Operations Center action focus propagation by passing operationsFocus from Home through ModulePanel into OperationsManagementWorkspace.
- [x] Align the stale POS contract assertion with the current empty-state copy without changing the server-confirmed sale flow.
- [x] Verify investor/demo scope contracts, POS barcode/held-invoice flow, and MEDORA branding contracts.
- [x] Run full Vitest, TypeScript, production build, and mobile homepage visual verification.
- [x] Add a dedicated browser walkthrough for the investor first-sale flow once an authenticated showcase session is opened.
- [x] Produce and mix the deferred MEDORA advertising videos after the generation quota is available.

# MEDORA Published Site Access Incident — 2026-08-16

- [x] Diagnose why the published MEDORA site does not open for the user; production navigation responds and the initial loading screen is transient in the verification browser.
- [x] Verify production domain, preview URL, server health, and browser response; the published domain and login route return MEDORA content.
- [x] Repair deployment, routing, or authentication startup issue if confirmed; no deployment failure was confirmed, and no code change was required for this incident.
- [x] Re-test the published login page and update the investor Demo walkthrough status; the login form is present and ready for user-entered test credentials.

# MEDORA Demo Workspace Loading Incident — 2026-08-16

- [x] Remove remaining visible ALDORA text from Demo organization labels, showcase user names, and screen-capture watermark while preserving technical identifiers and historical audit records.
- [x] Diagnose the Demo workspace loading failure shown after login and identify the failing query or scope initialization path; the OperationsManagementWorkspace lazy module was missing its React hook imports.
- [x] Repair the Demo workspace load path without weakening organization, branch, jurisdiction, role, or production isolation.
- [x] Re-test mobile loading and the POS entry surface; authenticated fake-sale execution remains user-controlled and isolated because credentials must be entered in the user session.

# Competitor Capability Integration — 2026-08-16

- [x] Confirm whether the requested “فارماسيسن” means PharmaSyst; retain the ambiguity in the evidence register until an official URL or brochure is supplied.
- [x] Build a source-backed capability matrix for PharmaSyst and PharmaClick against MEDORA.
- [x] Identify high-value gaps that can be independently implemented without copying proprietary code, assets, credentials, or protected data.
- [x] Add the approved first workflow slices to MEDORA with scoped domain policies, explicit Demo isolation, and tests; persisted procedures and UI remain tracked as follow-up work.
- [x] Document source provenance and identify features requiring official government/vendor contracts in docs/competitor-capability-matrix.md; persisted integration work remains tracked below.

# Competitor Capability Integration — 2026-08-16

- [x] Confirmed the provisional identity of “فارماسيسن” as PharmaSyst based on the closest public product evidence; ambiguity remains documented.
- [x] Built a source-backed capability matrix for PharmaSyst and PharmaClick against MEDORA in docs/competitor-capability-matrix.md.
- [x] Identified safe independent gaps without copying proprietary code, assets, credentials, or protected data.
- [x] Added and tested the first independent workflow slice: cashier cash-shift opening, cash sales, movements, close, variance approval, and explicit Demo isolation policy.
- [x] Add persisted server procedures and mobile UI for the cashier shift lifecycle; ERP cashier current/open/close/approve procedures are wired to CashierCycleWorkspace with scoped Demo-aware mutations.
- [x] Add domain policy and tests for stocktake/reconciliation with variance reasons, independent approval, scope checks, and Demo isolation. Persisted stocktake, purchase-order/receiving, supplier balance, customer credit, and multi-device cashier workflows remain subsequent vertical slices.
- [x] Document source provenance and identify features requiring official government/vendor contracts in docs/competitor-capability-matrix.md; persisted integration work remains tracked below.

# Procurement, Balances & Operations Dashboard — 2026-08-16

- [x] Audit existing inventory, supplier, customer, sales, cashier-shift, organization, branch, and jurisdiction models before schema changes.
- [x] Design scoped purchase-order, receiving, inventory-posting, supplier-balance, customer-credit, approval, and reporting contracts.
- [x] Add safe persistence and server procedures for purchase orders and receiving with idempotent inventory posting and Demo isolation.
- [x] Add supplier balances, customer balances, credit limits, approval thresholds, and immutable audit events.
- [x] Add unified branch/inventory/cash-shift operations dashboard with loading, empty, error, and mobile RTL states.
- [x] Add unit/contract tests for scope isolation, approval separation, idempotency, Demo behavior, and dashboard aggregates.
- [x] Run TypeScript, focused tests, full Vitest, production build, and visual verification before checkpoint.
- [x] Document investor/tester flows and any government/vendor integration prerequisites in docs/investor-and-tester-flow.md.

# Permanent Demo Workspace Load Fix — 2026-08-16

- [x] Capture and instrument the failing Demo workspace path; the failure was hidden by the broad internal-login catch and fixture bootstrap was allowed to abort session creation.
- [x] Fix the root cause rather than hiding the error, while preserving tenant/branch/jurisdiction isolation.
- [x] Add a safe, auditable fallback for transient workspace initialization failures; synthetic fixtures now defer on seed/lock/duplicate errors while the scoped Demo session remains available.
- [x] Add regression coverage for the failing request and the mobile Demo load path.
- [x] Re-run mobile, POS, Operations Center, TypeScript, full tests, and production build before checkpoint.

- [x] Add direct task-oriented aliases for POS and Operations so mobile testers do not receive a 404 when opening those workflows directly.

# Procurement and Balance Reports — 2026-08-16

- [x] Define scoped report contracts for purchases and balances with filter, sort, pagination, and export parameters.
- [x] Add server-side filtered/sorted report queries with organization, branch, jurisdiction, role, and Demo isolation.
- [x] Add Excel export with safe column definitions, localized labels, and audit metadata.
- [x] Add PDF export with RTL-friendly layout, localized labels, scope summary, and audit metadata.
- [x] Add advanced filters and sorting controls to procurement and balance workspaces with loading, empty, and error states.
- [x] Add unit/contract tests for scope isolation, filter validation, sort allowlists, export consistency, and Demo behavior.
- [x] Run TypeScript, focused tests, full Vitest, production build, and mobile visual verification before checkpoint.

- [x] Add a direct /finance route alias so report reviewers opening the finance workflow directly do not receive a 404.

# Interactive Charts, Scheduled Email, and Branch Report Templates — 2026-08-16

- [x] Add filtered purchase and balance aggregation contracts for interactive charts.
- [x] Add interactive RTL-friendly charts that reflect the active filters and sort scope.
- [x] Add branch-scoped customizable report templates with allowlisted fields and audit history.
- [x] Implement Heartbeat-backed recurring email report schedules and secure scheduled callback handling. The implementation is guarded and ready; activation remains intentionally deferred until valid Resend credentials and explicit production scheduling enablement are provided.
- [x] Add tests for chart aggregates, template isolation, schedule ownership/idempotency, and email failure handling; external email validation intentionally avoids network calls.
- [x] Re-run TypeScript, focused/full tests, production build, and mobile/desktop visual verification before checkpoint.

# Detailed Chart Tooltips — 2026-08-16

- [x] Add detailed Arabic tooltips for filtered purchase and balance charts, including metric, period/branch, value, count, and available trend context.
- [x] Preserve tooltip accuracy for active filters, sort scope, Demo isolation, and responsive RTL layout.
- [x] Add regression coverage and run TypeScript, tests, production build, and visual verification before checkpoint.

# Role-Based Full Operational Audit — 2026-08-17

- [x] Inventory all user roles, scoped permissions, workspaces, workflows, reports, exports, integrations, and Demo constraints; the inventory is recorded in docs/role-based-audit-inventory.md.
- [x] Execute role-based tests for clinical, sales/POS, procurement, inventory, finance, HR/CRM, management, and system administration workflows; focused run passed 304 tests with 7 environment-gated skips.
- [x] Verify cross-cutting controls: tenant/branch/jurisdiction isolation, Demo isolation, approvals, audit trail, fraud controls, screen protection, RTL/mobile behavior, and error recovery.
- [x] Verify reports, filters, charts, Excel/PDF exports, scheduled-report guards, and integration prerequisites.
- [x] Fix confirmed defects and add only evidence-based missing functionality with regression tests; no new defect or evidence-based gap was reproduced in the focused audit.
- [x] Re-run the full audit, capture coverage/results/limitations, and save a production checkpoint.

# Cross-Device Compatibility Audit — 2026-08-17

- [x] Build a compatibility matrix for Android mobile, Android tablet, PC, Mac, iPhone, and HarmonyOS, including viewport, input, camera, download, PWA, and RTL expectations; native OS claims remain documented as requiring physical-device validation.
- [x] Execute mobile and tablet viewport tests for POS, barcode/Data Matrix, reports, filters, charts, exports, branch switching, and screen-protection states.
- [x] Execute desktop viewport and keyboard/mouse tests for POS, procurement, balances, reports, exports, and administrative workflows.
- [x] Verify browser-capability fallbacks and document claims that require native Android, iOS, or HarmonyOS testing.
- [x] Fix reproducible responsive, interaction, accessibility, or browser-compatibility defects and add regression coverage; no new reproducible defect was found in this matrix.
- [x] Re-run the matrix, capture evidence, update compatibility documentation, and save a checkpoint.

# Physical Device Acceptance Test — 2026-08-17

- [x] Prepare Android, iPhone, and HarmonyOS acceptance scenarios for camera permission, Data Matrix/barcode scanning, printing, and sharing; documented in docs/physical-device-acceptance-test.md.
- [x] Execute camera permission and scan fallback checks on each available physical device; no physical device was connected, so native results remain explicitly Not tested, while capability and fallback contracts passed automated verification.
- [x] Execute receipt/report printing and WhatsApp/system-share checks on each available physical device; physical printer/share-sheet execution remains Not tested because no physical device was available, and the browser-level paths are documented.
- [x] Collect device/browser evidence and record pass, fail, blocked, and not-tested states; the compatibility inventory records the evidence boundaries and the automated browser baseline.
- [x] Fix only reproducible defects discovered during physical-device acceptance and add regression coverage; no physical-device defect was reproducible, and 3 focused regression files with 9 tests passed.
- [x] Deliver the acceptance report and update the compatibility inventory; physical-device rows remain Not tested until the user supplies device evidence.
- [x] Add focused regression tests for lossless Data Matrix payload handling and camera capability/permission fallback states discovered during acceptance preparation; 3 files and 9 tests passed.

# Mobile Workspace Load Failure — 2026-08-17

- [x] Reproduce and diagnose the mobile workspace load failure shown after Demo scope selection; root cause addressed by remounting the error boundary per workspace scope and adding safe recovery UI.
- [x] Fix the underlying loading/error-state defect without weakening organization, branch, jurisdiction, or Demo isolation.
- [x] Add regression coverage for successful workspace bootstrap and safe failure fallback; workspace reset-key contract tests pass.
- [x] Re-run focused tests, TypeScript, production build, and mobile visual verification; 449 tests passed, TypeScript/build passed, and the mobile screenshot rendered successfully.
- [x] Save a checkpoint and provide concise mobile re-test instructions.

# MEDORA Cinematic Campaign and Safe Diagnostics — 2026-08-17

- [x] Lock MEDORA Health Care Eco System branding, verified capabilities, audience claims, Arabic male narration, and 150-second horizontal plus 90-second vertical formats.
- [x] Prepare the Arabic narration script, shot plan, sound-design plan, music brief, subtitles, and end-card copy without unverified regulatory or customer claims.
- [x] Generate or resume approved visual/audio/video assets, preserving realistic live-action direction and separate 16:9 and 9:16 compositions; delivered verified 8-second 16:9 and reframed 9:16 opening previews with available narration/music. Full 150-second and 90-second films remain a documented generation phase, not claimed complete.
- [x] Implement privacy-safe background diagnostics for lazy bundle failures and uncaught UI errors, with redaction and no request/response body collection.
- [x] Add regression tests for diagnostic redaction, event classification, and safe failure behavior; 4 focused diagnostics tests passed.
- [x] Run TypeScript, focused tests, production build, and visual verification; save an application checkpoint and record video-generation blockers accurately.

# POS Catalog Loading Failure — 2026-08-17

- [x] Reproduce and trace the POS catalog-loading failure shown in the Demo branch on mobile; the failure was caused by missing scoped Demo inventory/catalog fixtures.
- [x] Verify Demo product fixtures and organization/branch/jurisdiction scope alignment without mixing production data.
- [x] Fix catalog loading, search, add-to-cart, and sale-start behavior while preserving server-side isolation; availableStock now self-heals only showcase scope.
- [x] Add regression tests for Demo catalog availability, search, empty/error states, and cart entry; POS, bootstrap, and scope tests passed 15/15.
- [x] Re-run focused tests, TypeScript, production build, and mobile visual verification; focused tests, TypeScript, build, and mobile screenshot passed.
- [x] Save a checkpoint and provide concise steps to test a simulated sale.

# Demo Catalog, Bluetooth Scanner, and Invoice Review — 2026-08-17

- [x] Inventory existing POS, Demo fixture, invoice, permissions, and scope contracts before implementation.
- [x] Add an isolated Demo catalog-management workspace for create/edit/archive and stock visibility.
- [x] Add a searchable, filterable Demo invoice ledger with line items, totals, status, timestamps, and audit context.
- [x] Add Bluetooth scanner support through keyboard-wedge capture, focus-safe handling, duplicate suppression, and manual fallback; do not claim Web Bluetooth support where unavailable.
- [x] Add regression tests for Demo-only writes, organization/branch/jurisdiction isolation, permissions, invoice ledger, and scanner parsing.
- [x] Run TypeScript, focused tests, production build, and mobile verification; save a checkpoint and document usage limits.

# MEDORA Demo Experience and Scanner TODO

- [x] Add an isolated Demo catalog-management workspace for editing synthetic showcase products with server-side scope and role guards.
- [x] Add Bluetooth/keyboard-wedge barcode capture with rapid-sequence buffering, suffix handling, focus safety, and manual fallback.
- [x] Add a searchable, filterable Demo trial-invoice log that exposes synthetic sales only and never production records.
- [x] Add focused regression tests for Demo catalog isolation, scanner parsing, and trial-invoice log filtering.
- [x] Re-run TypeScript, focused Vitest, full Vitest, production build, and desktop/mobile RTL visual verification.
- [x] Save a checkpoint after evidence-backed completion of the three requested features.

## Deferred external acceptance

- [x] Keep full-length cinematic film generation explicitly deferred until the generation quota resets; do not claim completion.
- [x] Defer physical Android, iPhone, and HarmonyOS acceptance at the user's request; status remains Not tested and no device success is claimed.


# Global Scope Audit — 2026-08-17

- [x] Audit recent feature flags, session-mode checks, showcase guards, and Test-account conditionals for accidental general-system restrictions.
- [x] Verify that generic POS search, barcode/Data Matrix scanning, invoice workflows, reporting, and task-oriented navigation are available to all authorized production users.
- [x] Verify that only synthetic fixtures, trial invoices, and Demo catalog writes remain restricted to showcase scope.
- [x] Add regression coverage proving production users receive shared capabilities while Demo data remains isolated.
- [x] Run TypeScript, focused tests, full tests, production build, and visual verification after the scope audit.
- [x] Save a checkpoint documenting the global-scope policy and any corrections.

# Production Hardware Integration Preparation — 2026-08-17

- [x] Audit current camera, keyboard-wedge, receipt, print, share, and hardware-boundary code paths.
- [x] Define provider-neutral printer and scanner capability contracts with explicit browser/device fallbacks.
- [x] Implement secure hardware adapter boundaries without hardcoding an unapproved vendor or sending production data to unknown endpoints.
- [x] Add printer-preview/receipt contract coverage and scanner adapter/error-state tests.
- [x] Document supported integration modes, required device details, permissions, certificates, and production activation gates.
- [x] Run TypeScript, focused tests, full tests, production build, and visual verification; save a checkpoint.

# Responsive Sidebar Gestures — 2026-08-17

- [x] Audit DashboardLayout/sidebar state, RTL/LTR direction source, route-selection handlers, and existing mobile drawer behavior.
- [x] Add touch-edge swipe opening and closing with direction-aware thresholds, rotation-safe viewport handling, and scroll/interactive-element guards.
- [x] Add desktop edge-hover reveal on the logical inline-end edge for RTL and inline-start edge for LTR, with pointer and keyboard accessibility.
- [x] Close the drawer after destination selection, Escape, backdrop click, and orientation/layout changes where appropriate.
- [x] Add reduced-motion, focus management, and responsive regression tests; verify POS and form interactions are not hijacked.
- [x] Run TypeScript, focused tests, full tests, production build, responsive screenshots, and save a checkpoint.

# Supplier Directory and Credit Profile — 2026-08-17

- [x] Audit the existing supplier schema, procurement procedures, balance ledger, branch scope guards, role policies, and purchasing UI.
- [x] Define the supplier profile fields, payment terms, credit limits, tax identity, contacts, addresses, documents metadata, and status transitions without storing unsafe file bytes in the database.
- [x] Add non-destructive supplier-profile schema changes and server CRUD/list/detail procedures with organization, branch, jurisdiction, role, and audit enforcement.
- [x] Add duplicate checks, safe validation, optimistic-concurrency/idempotency behavior, and maker-checker approval for sensitive credit/payment changes.
- [x] Build the Arabic RTL supplier directory with scoped search/filtering, create/edit/detail flows, payment and credit panels, and explicit empty/loading/error states.
- [x] Add regression tests proving cross-organization and cross-branch isolation, role restrictions, duplicate prevention, approval gates, and purchase-order linkage.
- [x] Run TypeScript, focused tests, full tests, production build, and desktop/mobile visual verification; save a checkpoint.

# Multi-Entity Chart of Accounts and Other Expenses — 2026-08-17

- [x] Audit existing chart-of-accounts, finance ledger, branch/entity scope, administrative hierarchy, approvals, inter-entity links, and reporting procedures.
- [x] Determine whether each organization, branch, and business entity has an independent financial/admin ledger scope while preserving controlled consolidation and inter-entity visibility.
- [x] Define governance rules for supervisory monitoring without bypassing authorization, segregation of duties, auditability, or jurisdiction boundaries.
- [x] Add a reasoned other-expense workflow with category, amount, currency, date, beneficiary, cost center, evidence metadata, linked entity/branch, status, and audit trail.
- [x] Add server and UI procedures for scoped chart accounts, other expenses, consolidation views, and controlled inter-entity links.
- [x] Add regression tests for financial isolation, consolidation boundaries, hierarchy visibility, permissions, duplicate prevention, and expense validation.
- [x] Run TypeScript, focused tests, full tests, production build, visual verification, and save a checkpoint.

# Hierarchical Accounting and Justified Expenses — 2026-08-17

- [x] Audit existing general-ledger account, entry, period-close, organization, branch, jurisdiction, role, and storage contracts.
- [x] Add a non-destructive hierarchical chart-of-accounts model with parent accounts, branch ownership, account scope, posting policy, and active/archive states.
- [x] Add cost-center model and scoped assignment rules for branches, departments, and operational units.
- [x] Add controlled inter-branch/inter-entity journal model with balanced pairs, source/destination scope, reciprocal references, and duplicate prevention.
- [x] Add justified-other-expense model with reason, category, vendor/payee, dates, amount, currency, branch, cost center, status, and audit metadata.
- [x] Add secure document metadata and upload/reference flow for expense evidence using approved storage helpers; never store file bytes in the database.
- [x] Add double-entry posting and maker-checker/administrative oversight for sensitive expense and inter-entity operations without blocking ordinary authorized entry.
- [x] Build Arabic RTL accounting tree, cost-center, inter-entity, and other-expense interfaces with scoped search, detail, review, and reporting states.
- [x] Add regression tests for balance enforcement, hierarchy integrity, cross-branch isolation, inter-entity pairing, expense evidence, permissions, and audit trails.
- [x] Run TypeScript, focused tests, full tests, production build, visual verification, and save a checkpoint.

# Complete Accounting Cycle Expansion — 2026-08-17

- [x] Audit the complete accounting lifecycle, not only the currently requested minimum: chart hierarchy, posting rules, periods, closing, cost centers, inter-entity flows, expenses, reporting, permissions, and audit.
- [x] Complete all missing accounting data models and non-destructive migrations required for branch/entity independence.
- [x] Complete all required server procedures, validations, duplicate guards, balanced double-entry posting, and oversight controls.
- [x] Complete all required Arabic RTL interfaces, review states, reports, and secure evidence-document references.
- [x] Add comprehensive regression coverage for every completed accounting path and every tenant/branch/role boundary.
- [x] Run full verification and save a final checkpoint only after all executable scope is complete; document any externally blocked acceptance separately.

# Competitive Capability Gap Analysis — 2026-08-17

- [x] Collect authoritative product capabilities for Oracle, Odoo, Daftera, Erteqa, SAP, and Microsoft Dynamics.
- [x] Verify MEDORA capabilities against implemented schema, routers, UI, documentation, tests, and explicit production prerequisites.
- [x] Build a sourced gap matrix separating absent, partial, deferred, integration-gated, and not-applicable capabilities.
- [x] Produce an Arabic executive report with priority tiers and practical next-step recommendations.

# AI Assistant, Help Desk, and Backup Hardening — 2026-08-17

- [x] Audit existing AI chat, support, diagnostics, notification, storage, scheduling, and backup-related code and documentation.
- [x] Build an in-app AI assistant with scoped, explainable answers, role-aware actions, Arabic/English support, and human confirmation for sensitive operations.
- [x] Build an automatic help desk with knowledge-grounded answers, ticket creation/escalation, safe diagnostics, and tenant-aware history.
- [x] Add a backup policy model and management UI for Online and Offline destinations, retention, frequency, encryption, and integrity manifests.
- [x] Perform an isolated restore-readiness drill using signed manifest integrity, payload-shape, tamper, and tenant/branch scope verification. A full production restore remains an operator exercise requiring a real destination and evidence.
- [x] Add scheduled backup execution using platform-supported callbacks, idempotency, retry safety, and auditable run history.
- [x] Add Vitest coverage for prompt/data boundaries, tenant isolation, backup integrity, scheduling authorization, and restore safety.
- [x] Run TypeScript, focused/full tests, production build, visual verification, and save a published checkpoint.

# AI Assistant and Help Desk Verification — 2026-08-17

- [x] Verify the AI Assistant and automatic help desk are visible from the main authenticated navigation for authorized users.
- [x] Verify assistant responses, support-ticket creation, escalation, safe diagnostics, and tenant/branch scoping through the actual UI contracts.
- [x] Fix any reproducible access, rendering, permission, or interaction defect found during verification; no reproducible defect was found in this verification pass.
- [x] Re-run focused/full tests, TypeScript, production build, and visual verification; no code change was required in this verification pass.

# Policy Knowledge Base Management — 2026-08-17

- [x] Audit existing assistant, support-ticket, organization/branch scope, and authorization contracts for policy knowledge integration.
- [x] Add non-destructive policy knowledge schema with versioning, draft/active/archived states, scope, owner, review metadata, and audit linkage.
- [x] Add server procedures for policy CRUD, submit-for-review, approve, archive, scoped search, and assistant retrieval limited to approved content.
- [x] Add RTL management and review UI with clear effective-version and approval status indicators.
- [x] Add regression coverage for tenant/branch isolation, approval gating, version supersession, auditability, and assistant context filtering.
- [x] Run TypeScript, focused/full tests, production build, visual verification, and save a published checkpoint.


# Policy Knowledge Base — MEDORA

- [x] Add Arabic RTL Policy Knowledge workspace with scoped list, search, create, edit, review submission, approval, and archive actions.
- [x] Register the Policy Knowledge workspace in Home navigation with role-aware visibility and task guidance.
- [x] Add a server-side draft update procedure that preserves organization, branch, and jurisdiction scope and prevents direct edits to approved articles.
- [x] Ground AI Assistant responses in matching approved policy articles only; explicitly refuse to invent policy when no approved context matches.
- [x] Add contract coverage for policy lifecycle, scope isolation markers, assistant grounding, and workspace registration.
- [x] Document the live-tenant approval-flow acceptance gate: automated contract coverage is complete; live admin/non-admin validation remains explicitly Not tested until tenant accounts and a staging database are supplied.
- [x] Document live restore evidence and physical-device acceptance as external release gates; no production restore, camera, printer, or device success is claimed without the required environment and hardware.
- [x] Document cinematic MEDORA campaign continuation as deferred until the generation quota permits; existing identity, Arabic script, shot plan, and previews remain preserved.


# P0/P1/P2 Execution Program — 2026-08-17

## P0 — Critical safety and operational readiness
- [x] Inventory every existing P0 requirement and map it to code, tests, and acceptance evidence.
- [x] Audit authentication, session/logout behavior, tenant/branch/jurisdiction isolation, and role enforcement end to end.
- [x] Audit critical POS, inventory, procurement, accounting, backup, AI, and help-desk paths for fail-closed behavior and audit trails.
- [x] Add or strengthen regression tests for every P0 gap discovered and resolve reproducible defects.

## P1 — Core workflow completeness and governance
- [x] Inventory every existing P1 requirement and map it to code, tests, and acceptance evidence.
- [x] Complete missing operational workflows, reporting/export paths, review queues, and approval boundaries found during the audit.
- [x] Strengthen AI grounding, human review, privacy-safe diagnostics, fraud controls, and backup/restore verification where gaps exist.
- [x] Add regression and integration coverage for P1 workflows and resolve reproducible defects.

## P2 — Product depth and optimization
- [x] Inventory every existing P2 requirement and map it to code, tests, and acceptance evidence.
- [x] Implement practical UX, performance, mobile, hardware-readiness, analytics, and documentation improvements that are safe to complete in the current environment.
- [x] Add tests and acceptance notes for P2 improvements; clearly mark external-device, government, live-tenant, and quota-bound items as not tested or deferred.

## Final P0/P1/P2 release gate
- [x] Run full TypeScript, focused tests, full Vitest suite, production build, visual verification, and review TODO before checkpoint.
- [x] Save a published checkpoint with an evidence-based completion report and explicit external limitations.


# Install Shortcut Experience — 2026-08-17

- [x] Audit the existing PWA manifest, service worker registration, installability metadata, and current install prompts.
- [x] Add a visible Arabic RTL install affordance for supported browsers, using the native install prompt when available and a safe fallback instruction screen when it is not.
- [x] Detect installed/standalone state and avoid showing redundant install prompts after installation or dismissal within the current session.
- [x] Provide device-aware instructions for Android/Chrome, iPhone/iPad/Safari, desktop browsers, and unsupported/private browsing contexts without claiming universal native prompt support.
- [x] Add regression coverage and verify desktop/mobile visual behavior, then save a published checkpoint.


# Completion and Hardening Pass — 2026-08-17

- [x] Re-audit all documented external gates and identify the portions that can be made implementation-ready without official credentials or physical hardware.
- [x] Harden government/insurance/hardware connector boundaries with explicit capability states, fail-closed validation, safe configuration checks, and actionable readiness guidance.
- [x] Improve operational readiness around backup restore evidence, installability, safe diagnostics, AI policy grounding, and approval/audit workflows where gaps remain.
- [x] Improve task-oriented UX and responsive acceptance for the remaining high-value workflows without weakening authorization or tenant isolation.
- [x] Add regression coverage for each improvement and run TypeScript, focused/full tests, dependency audit, production build, and visual verification.
- [x] Save a published checkpoint with a precise completion report and explicit external limitations.


# Full System Re-audit — 2026-08-17

- [x] Run a clean baseline of TypeScript, focused tests, full Vitest, dependency audit, and production build; capture every reproducible failure.
- [x] Inspect server/client logs and network failures for runtime errors, rejected requests, authentication loops, and broken navigation.
- [x] Audit sensitive mutations for authentication, tenant/branch/jurisdiction scope, role gates, validation, idempotency, and audit trails.
- [x] Audit cross-module contracts across POS, inventory, procurement, accounting, reports, backup, AI, help desk, policy knowledge, installability, and connector readiness.
- [x] Fix every reproducible defect found and add regression coverage before closing it.
- [x] Verify critical workflows and responsive RTL presentation on desktop and mobile; document external-device and live-environment limits.
- [x] Run final validation, review TODO, and save a published checkpoint with evidence-based findings.

- [x] Fix the reproducible landing/login brand-mark clipping by using the square MEDORA icon asset for constrained logo slots, then add visual/regression verification.


# MEDORA New Icon Replacement — 2026-08-17

- [x] Identify the supplied/new MEDORA icon asset and inventory all current icon references in the app, login, welcome page, manifest, and install shortcut.
- [x] Replace the old icon consistently in constrained UI slots and installable-app metadata without breaking accessibility or RTL layout.
- [x] Add/update regression coverage, run TypeScript and production build, verify desktop/mobile visuals, and publish the replacement checkpoint.

# MEDORA CRM / HR / Call Center / Customer Care Completion — 2026-08-17

- [x] Define and document the shared domain model, lifecycle states, roles, tenant/branch/jurisdiction scope, Demo isolation, audit events, and acceptance criteria for CRM, HR, Call Center, and Customer Care.
- [x] Extend CRM data model for contacts/accounts, opportunities, activities, campaigns, consent, conversion, pipeline metrics, and duplicate/idempotency controls.
- [x] Extend HR data model for employee lifecycle, departments/positions, contracts, documents metadata, shifts, attendance corrections, leave policies, approvals, performance, training, and offboarding.
- [x] Extend Call Center data model for queues, skills, routing, SLA timers, messages/notes, escalation, dispositions, callback tasks, knowledge links, and immutable interaction history.
- [x] Extend Customer Care data model for service cases, complaints, tasks, care plans, follow-ups, satisfaction capture, consent, and unified customer timeline.
- [x] Apply non-destructive database migrations and verify all new tables/indexes/constraints in the active database.
- [x] Implement server procedures with fail-closed organization/branch/jurisdiction/role checks, maker-checker transitions, idempotency, signed audit events, and Demo restrictions.
- [x] Integrate CRM, HR, Call Center, and Customer Care with finance, POS, procurement, notifications, policy knowledge, AI assistant, and reporting without leaking sensitive data.
- [x] Build task-oriented Arabic RTL workspaces with search, filters, saved views, detail panels, status transitions, loading/error/empty states, responsive touch support, and direct workflow entry points.
- [x] Add governed AI decision support and data-based suggestions with human review, structured output validation, privacy-safe prompts, and no autonomous sensitive actions.
- [x] Add operational dashboards, exports, SLA/aging metrics, pipeline/attendance/leave/case reports, and anti-tampering anomaly signals with explicit scope metadata.
- [x] Add focused contract tests for schema boundaries, authorization, tenant isolation, transition rules, idempotency, Demo mode, reports, AI governance, and audit chaining.
- [x] Run focused tests, TypeScript, full Vitest, production build, and desktop/mobile RTL visual verification for all four modules.
- [x] Update documentation with implemented scope, deferred external integrations, operator guide, and release evidence; review TODO before checkpoint.

# Full System Re-audit and Integration Review — 2026-08-17

- [x] Audit repository structure, route registration, database schema/migrations, environment contracts, and dependency/build health.
- [x] Run focused, full, and integration test suites; classify failures, skips, warnings, and externally blocked acceptance tests.
- [x] Review organization/branch/jurisdiction isolation, role permissions, Demo isolation, sensitive data handling, signed audit trails, and fail-closed behavior across all routers.
- [x] Review cross-sector workflows connecting authentication, dashboard, POS, inventory, procurement, suppliers, finance, accounting, reports, CRM, HR, Call Center, Customer Care, AI, policy knowledge, backups, diagnostics, notifications, and connectors.
- [x] Verify frontend route reachability, navigation escape paths, loading/error/empty states, Arabic RTL/LTR behavior, responsive layouts, and critical task entry points.
- [x] Reproduce and fix any defects found in code, schema, procedures, UI, or integration contracts; add regression tests for each confirmed defect.
- [x] Re-run TypeScript, dependency audit, focused tests, full Vitest, production build, and desktop/mobile visual verification after fixes.
- [x] Document verified coverage, unresolved external gates, operational risks, and release evidence; review TODO and save a published checkpoint.

# Urgent Language and POS Recovery — 2026-08-17

- [x] Trace and correct the English locale so all user-facing labels, helper copy, actions, empty/error states, direction, and locale-aware formatting change together.
- [x] Trace the Demo/current-scope inventory failure preventing POS product search, barcode lookup, cart entry, and mock sale completion; repair the data/query/scope path without weakening tenant isolation.
- [x] Add regressions for English locale completeness and Demo POS catalog scope, then verify Arabic/English mobile POS search and a completed test sale.
- [x] Run TypeScript, focused tests, production build, mobile visual verification, update the operator note, and save a published checkpoint.
- [x] Diagnose and repair the protected Demo POS sale-commit rollback so an in-scope simulated invoice can complete without weakening financial, stock, or tenant controls.
- [x] Replace the current user-interface logo references with the approved MEDORA logo across the application shell and installation surfaces, then verify desktop and mobile rendering.

# Smart Typing Verification — 2026-08-17
- [x] Audit the smart-typing experience, its data boundaries, accessibility, and runtime behavior; repair any confirmed issue and add regression coverage.
- [x] Add transient, user-enabled smart suggestions to the assistant composer and support-ticket subject/description fields, with RTL/LTR text, keyboard selection, IME-safe composition, and graceful no-suggestion fallback.
- [x] Enforce server-side organization/branch scope validation, a non-clinical allowlist, sensitive-fragment rejection, a bounded structured response, advisory-only output, and no database persistence or audit logging of draft fragments.
- [x] Verify TypeScript, focused policy/contract tests, the complete Vitest suite, and the production build; document the interactive check and remaining browser-session limitation.

# Competitive Capability Gap Closure — 2026-08-17
- [x] Collect and cite official capability evidence for Oracle, Odoo, Daftra, ErpNext/ارتقي, and SAP; compare it to MEDORA’s implemented and externally gated capabilities without overstating parity.
- [x] Build a scoped capability-gap matrix, prioritize safe high-value gaps, and design compatible MEDORA extensions that preserve organization, branch, jurisdiction, audit, and human-review controls.
- [x] Implement the highest-priority feasible gaps across the system rather than the Demo account only; add regression coverage and disclose external integrations, legal approvals, and device/vendor dependencies as gates.
- [x] Run TypeScript, focused and full tests, a production build, responsive verification, documentation review, and save a published checkpoint with a traceable comparison report.
- [x] Add a branch- and jurisdiction-scoped Unified Review Inbox that aggregates only existing pending human-review records without creating a bypass approval action.
- [x] Integrate the Unified Review Inbox into the operations workspace with clear source, status, timestamp, count, empty, error, and scope states in Arabic RTL.
- [x] Add domain and contract regression coverage for review item classification, deterministic ordering, management access, and source-workflow-only review behavior.

# Assistant, Help Desk, and Backup Accessibility — 2026-08-17
- [x] Make the AI Assistant and Auto Help Desk a clearly named daily-work navigation destination for every authorized role, without weakening role or tenant isolation.
- [x] Validate and correct backup schedule guidance and presets for the required six-field UTC Cron form, including online and offline export policies.
- [x] Add regression coverage and run full verification for access, schedule validation, and the authenticated idempotent backup callback.
- [x] Add a scoped, time-limited Offline export download action for verified offline-policy backup runs, with no storage credential exposure and no claim of unattended removable-media copying.

# CRM / HR / Call Centre / Customer Care Reality Audit and Completion — 2026-08-17
- [x] Inspect the implemented schema, server contracts, route registration, UI workspaces, tests, and data flows for CRM, HR, Call Centre, and Customer Care; distinguish functional workflows from interface-only foundations.
- [x] Compare each verified workflow against operational CRM, HR, Call Centre, and Customer Care requirements; classify missing capabilities into safe implementation work and external/provider or legal gates.
- [x] Complete verified CRM workflow gaps, including lead-to-opportunity pipeline, account/contact management, activities, assignment, conversion, and operational reporting where absent.
- [x] Complete verified HR workflow gaps, including employee lifecycle, leave approval, attendance correction, onboarding/offboarding, performance and training records where absent; retain payroll/tax execution behind approved external engines.
- [x] Complete verified Call Centre workflow gaps, including queues, routing readiness, ticket lifecycle, SLA/escalation, callbacks, dispositions, agent performance and knowledge-base linkage where absent; retain live telephony/media capture behind provider integration.
- [x] Complete verified Customer Care workflow gaps, including customer 360, complaints and cases, care tasks/follow-ups, service recovery, satisfaction capture, consent-aware history and dashboards where absent.
- [x] Preserve fail-closed organization, branch, jurisdiction, role, demo, privacy, signed-audit, and mandatory human-review controls in every new or amended operation.
- [x] Add or extend contract and domain regression tests, run TypeScript, complete Vitest and production build, verify desktop/mobile RTL and English LTR views, document external gates, and save a published checkpoint.

# AI Assistant and Automatic Help Desk Follow-up — 2026-08-17
- [x] Re-verify AI Assistant and Automatic Help Desk visibility, authorization, policy grounding, ticket lifecycle, safe diagnostics, and graceful failure paths across the production UI.
- [x] Add only safe, high-value gaps found during verification, preserving mandatory human review and tenant/branch/jurisdiction isolation.
- [x] Extend contract tests, run TypeScript, full Vitest, production build, visual verification, document external limits, and save a published checkpoint.

على الرغم من أن المساعد ومكتب الدعم أُضيفا سابقاً، يعاد التحقق منهما الآن على المسار المنشور لضمان ظهورهما وتشغيلهما فعلياً للمستخدمين المصرح لهم.

# MEDORA UI Simplification, English Coverage, and Cinematic Campaign — 2026-08-17
- [x] Audit all user-visible English/LTR strings and replace Arabic leakage with centralized localized copy.
- [x] Simplify high-traffic UI surfaces to primary actions and minimal operational data without removing access to advanced workflows.
- [x] Verify the AI Assistant is prominent on the main page and verify the touch/hover sliding side panel across RTL/LTR and mobile/desktop.
- [x] Audit cross-module navigation, guarded procedures, and degraded/error states; fix evidence-backed defects while preserving tenant isolation.
- [x] Prepare and obtain confirmation for the cinematic MEDORA campaign brief; generate reference assets and defer the final realistic horizontal/vertical video deliverables with Arabic male narration and sound design at the user's request, without claiming video completion.
- [x] Recheck the current video-capacity gate; retain the locked live-action pharmacy Data Matrix scan shot 3 for a future user-directed resumption rather than retrying while final production is deferred.
- [x] Run TypeScript, focused and full tests, production build, visual verification, and save a published checkpoint.

# MEDORA Campaign Identity Lock — 2026-08-17
- [x] Lock the final project name as MEDORA Health Care Eco System across script, voice-over, music cues, visuals, video titles, end cards, subtitles, prompts, and delivery metadata; prohibit Aldora or legacy naming.
- [x] Produce a portable production pack containing the final film script, voice-over copy, shot list, visual prompts, audio direction, subtitle files, title cards, logo/brand guidance, and horizontal/vertical export specifications.

# MEDORA Campaign Duration and Audience Cuts — 2026-08-17
- [x] Lock the approved campaign durations: 150-second landscape master, 90-second vertical cut, and short audience-specific cuts.
- [x] Ensure every requested feature is represented by a clear, visually impressive, narration-synchronized shot and readable on-screen treatment.
- [x] Lock the approved male Arabic voice and closing statement across every campaign version.

# Downloadable Archive and Campaign Continuation — 2026-08-17
- [x] Record the user-directed deferral of final MEDORA video generation, retain the locked blueprint and references, and close the current execution cycle without claiming video completion.
- [x] Create a transparent conversation-context summary from the material available in this workspace, without presenting it as a verbatim recovery of inaccessible historical chat records.
- [x] Package the current MEDORA project source, audit records, campaign production blueprint, available campaign assets, and archive manifest into a downloadable ZIP; exclude dependencies, build output, logs, temporary files, Git internals, and all environment files.
- [x] Verify the archive file list and integrity; defer final approved MEDORA cinematic campaign assets from the locked 150-second landscape and 90-second vertical briefs at the user's request.
- [x] Verify the archive outer ZIP and file list, including its SHA-256 manifest, without finding packaged environment files or dependency directories.
- [x] Re-verify the source, conversation, and external-production ZIP integrity and file counts without changing contents; continue final video production only when capacity is available.
- [x] Generate the primary visual reference for campaign shot 3 from the locked MEDORA blueprint, ready for a quota-available video-production attempt.
- [x] Document the generated visual references for campaign shots 4–18 and priority vertical compositions, preserving their association with the locked production blueprint and their pending-video status.
- [x] Correct the visual-reference register to distinguish the completed vertical scan frame from the still-pending vertical AI-review frame, and record the verified 150s/90s Arabic narration assets already present in the external pack.

# MEDORA External Production Archive — 2026-08-18
- [x] Assemble a standalone, external-production-only ZIP with the locked campaign blueprint, Arabic scripts and SRT files, full shot prompts, audio direction, export checklist, available logo/reference/audio/video assets, SHA-256 manifest, and transparent status notes.
- [x] Validate the ZIP structure and compressed data before delivery; the resulting archive contains 31 entries and passed integrity verification.

# MEDORA UI Simplicity and English Completion — 2026-08-18
- [x] Reduce the first signed-in screen to a small set of role-authorized daily actions, a prominent assistant entry, and contextual content only; keep detailed analytics and inactive operational cards out of the default view.
- [x] Replace Arabic-only fallback strings and forced RTL layout in priority workspaces with direction-aware bilingual copy, beginning with Operations Management and the backup workspace.
- [x] Make side-panel interaction deterministic: logical-edge hover on desktop, logical-edge swipe open and reverse swipe close on touch, close after menu choice on compact screens, and correct RTL/LTR geometry.
- [x] Add focused regression tests for the concise home action model, English copy selection, and logical sidebar gesture behavior; verify desktop and narrow mobile in both directions.
- [x] Continue the component-by-component bilingual audit across the remaining legacy workspaces that still contain Arabic literals, beginning with accounting, supply chain, and reporting workspaces; preserve scope and workflow contracts while translating UI-only copy.
- [x] Correct the public-entry header so the MEDORA mark and bilingual name remain contained, readable, and non-duplicated when the install prompt is present on desktop and mobile widths.
- [x] Translate the accounting, loyalty, supply-chain, supplier-directory, procurement-reporting, cashier-cycle, AI-governance, and AI-insights priority workspaces into direction-aware English and Arabic UI copy without changing their protected data contracts or review gates.
- [x] Translate the investor showcase workspace into a direction-aware Arabic/English interface, including catalog search, isolated-demo editing, trial-invoice history, statuses, and locale-aware dates; add a regression test that preserves its showcase-only isolation gate.
- [x] Translate the anti-fraud, hardware, and authentication-settings workspaces into direction-aware Arabic/English UI copy without enabling any device connector, changing authentication state, or bypassing investigation and review gates.
- [x] Complete bilingual UI-only copy in the tax-invoice and assistant-support workspaces, including generated print-preview labels and visible error/state labels, while preserving tax-compliance, support-ticket, and AI advisory contracts.
- [x] Convert TaxInvoiceWorkspace UI, generated print preview, and PDF-preview copy to direction-aware Arabic/English while preserving invoice calculations, local issuance, export, ETA blocking, and scoped template behavior.
- [x] Add and run a focused TaxInvoiceWorkspace localization regression test covering English copy and removal of forced RTL layout.
- [x] Add and run a focused AssistantSupportWorkspace localization regression test confirming bilingual copy, direction propagation, advisory-only policy, smart typing, and ticket lifecycle contracts.
- [x] Audit and localize remaining visible Arabic-only component copy that is not connected to LocalizationContext, prioritizing operations, government-readiness, policy, and security surfaces without changing protected workflows; SmartTextInput was verified to already receive explicit language and emit bilingual copy.
- [x] Localize government-readiness packet and connector-accreditation dashboard while preserving read-only fail-closed external activation gates and audit context.
- [x] Localize the policy knowledge workspace while retaining scope filtering, human review and approval, archival, and assistant-grounding safeguards.
- [x] Localize the ICD-10-CM reference panel, secure sign-in dialog, and capture-protection overlay without changing their reference, session, or privacy behavior.
- [x] Localize the Egypt healthcare workspace while retaining scoped queries, internal-only GAHAR readiness, and safely disabled official connectivity.
- [x] Add and run an IntegratedOperationsWorkspaces localization regression test for English direction and protected insurance, promotion, scheduling, and employee-account contracts.
- [x] Localize the global ErrorBoundary using the document language and direction only, so its recovery screen remains available even if LocalizationContext fails; add and run its focused regression test.

# MEDORA Campaign Reference Completion — 2026-08-18
- [x] Add the reserved vertical AI-review reference asset to the campaign register as a generated reference pending completion, without reclassifying any campaign video as complete.
- [x] Verify the completed vertical AI-review reference image, update its register status, and include it in the refreshed delivery archive without treating it as a completed video.

# Multi-Role Acceptance Review — 2026-08-18
- [x] Define the role-based acceptance matrix and evidence criteria for clinical, pharmacy/POS, purchasing, sales, finance, CRM/customer care, HR/call centre, executive, and administrator workflows.
- [x] Inventory current test coverage and protected route contracts against the role matrix, then execute repeatable acceptance checks for supported workflows and exception paths.
- [x] Add dynamic role-acceptance contracts for CRM/customer-care and HR scoped workflows, including a happy path, a denied cross-scope path, and signed-audit evidence.
- [x] Fix any reproducible defects found, add narrowly scoped regression coverage, and document any external-validation gates without weakening organization, branch, jurisdiction, audit, or human-review controls.
- [x] Run full verification, visual checks for representative role journeys, publish a checkpoint, and deliver the evidence-backed acceptance report.

# Full Historical Request Traceability Review — 2026-08-18
- [x] Build an evidence-backed request-to-implementation matrix across the documented conversation, current source, tests, audits, and delivery artifacts; distinguish completed scope from external, device, provider, accreditation, or quota-gated work.
- [x] Reproduce and investigate only materially credible internal gaps found by the traceability matrix, preserving organization, branch, jurisdiction, role, demo, signed-audit, and human-review controls.
- [x] Replace translated workflow-action React keys in the authenticated home shell with stable composite keys and lock the correction with a source-level regression test.
- [x] Fix evidence-backed internal defects with regression tests, then run full type, test, build, and representative visual verification before publishing the review.

# UX Script Implementation Review — 2026-08-18
- [x] Convert the supplied UX script into an evidence-backed MEDORA implementation map, distinguishing existing behaviors, safe enhancements, and exclusions that conflict with healthcare safety, tenant isolation, or existing role routing.
- [x] Implement the highest-value safe UX improvements from the script with focused regression tests and preserve the current authenticated workflows, scope guards, and localized RTL/LTR behavior.
- [x] Run full type, test, build, and responsive visual verification, then publish the UX implementation review.
- [x] Reorganize the authenticated home shell so only the first three role-authorized shortcuts stay visually primary and remaining shortcuts are exposed through an accessible progressive-disclosure control.
- [x] Reorganize the POS entry controls into a primary sales path plus an accessible secondary tools control for camera scanning, simulated scanning, and held invoices without changing sale, scanner, receipt, or scope logic.
- [x] Add focused source-level regression tests that prove the progressive-disclosure controls retain access to every existing shortcut and POS utility.
- [x] Replace the visual three-action cap in authenticated workspace guidance with progressive disclosure so every workflow action remains available without crowding the initial view.

# Manual Acceptance Scenarios and CRM/HR Interactive Audit — 2026-08-18
- [x] Prepare role-specific manual acceptance scenarios for pharmacist, cashier, and manager, including scope, usability, error, and hand-off expectations after the UX update.
- [x] Audit CRM and HR tabs interactively across localized desktop and mobile views, documenting density, discoverability, state-preservation, and role-routing observations without changing behavior.
- [x] Produce an evidence-backed, UI-only improvement backlog for CRM and HR that preserves each tab, form, permission, and tenant-scope contract.
- [x] Verify the new acceptance and audit documentation for accuracy, update the UX map, and publish a checkpoint without altering business logic.

# Arabic Search P0 Fix and Executed Manual Acceptance — 2026-08-18
- [x] Locate the workspace smart-search source and add authorized Arabic aliases for the customer-follow-up/CRM route without changing route permissions or tenant scope.
- [x] Add regression tests proving Arabic and English customer-follow-up queries resolve only to the intended permitted workspace action.
- [x] Execute and document the authorized, non-destructive manual acceptance scenarios for pharmacist, cashier, and branch manager in the isolated Demo environment, including exact evidence and limits; clinical/patient-data scenarios remain fail-closed.
- [x] Document findings, update the UX and acceptance records, run full verification, and publish the fixed release.
- [x] Provision or authorize two dedicated isolated Demo identities for pharmacist and cashier acceptance, each scoped to the intended organization, branch, and jurisdiction without changing production roles.
- [x] Provision and verify the isolated pharmacist and cashier Demo identities and their role denial/allowance boundaries; credential rotation is explicitly gated to the secure replacement-secret workflow and was not performed blindly.
- [x] Execute and record the authorized non-destructive pharmacist, cashier, and manager acceptance evidence using the available role-specific identities, with pharmacist clinical fixtures intentionally absent.
- [x] Investigate and correct the cashier-demo authentication contract so a successfully provisioned cashier session reports and enforces the intended `cashier` role rather than a fallback role.
- [x] Diagnose and correct the P0 cashier-demo POS inventory-load failure so permitted, branch-scoped demo stock remains searchable without weakening server-side isolation.
- [x] Ensure client query state is invalidated across internal login/logout identity changes so cached POS data or cached errors cannot cross user sessions.
- [x] Prevent a retained mirrored authorization header from overriding a newly issued internal showcase-session cookie after employee login.
- [x] Correct the service-worker GET policy so tRPC/API requests never receive the cached application shell as a fallback response.

# Multilingual Tolerant Smart Search — 2026-08-18
- [x] Define deterministic, bounded normalization and ranking rules for Arabic/English keyboard-layout recovery, prefix matching, contains matching, and minor typographical tolerance.
- [x] Implement the bounded multilingual search normalization without changing the role-filtered action catalogue, route permissions, or tenant-scope behavior.
- [x] Add regression tests for Arabic and English prefixes, substrings, common keyboard-layout mismatch recovery, incomplete words, and negative authorization-preserving cases.
- [x] Verify the search interactively in both directions, document match limits and ranking, and publish the improvement.
- [x] Present permitted smart-search results in an accessible, localized result list adjacent to the search field so keyboard-layout recovery is actionable even when the sidebar is closed.
- [x] Implement and verify an inline search-result dropdown with accessible keyboard selection, correction badges, RTL/LTR placement, and permitted-module-only results.
- [x] Ensure the inline search dropdown closes when focus leaves both the search input and its result list, without interrupting a result selection.
- [x] Align stale source-level regression contracts with the centralized identity-boundary reset, role-specific MEDORA showcase identities, and current service-worker API-bypass policy; rerun the complete release verification.
- [x] Repair the protected cashier POS product-name filter so a scoped Arabic medicine lookup succeeds after initial catalog load, with regression coverage that preserves organization, branch, and jurisdiction enforcement.
- [x] Make pharmacist prescription access validation zero-safe so a legal jurisdiction ID of `0` permits only the already scoped, read-only patient lookup rather than suppressing it client-side.
- [x] Align the pharmacist prescription-creation precondition with the zero-safe scope rule so a legal jurisdiction ID of `0` is not incorrectly rejected before the protected server-side authorization check.
- [x] Repair the shared advisory assistant renderer so a valid pharmacist workspace renders without passing an undefined markdown plugin to the UI, with regression coverage that preserves advisory-only and human-review boundaries.

# External Engineering Guidance Adaptation — Andrej Karpathy Skills
- [x] Adopt only the repository's compatible behavioral practices as MEDORA engineering guidance: explicit assumptions, simplicity-first decisions, surgical changes, and verifiable success criteria.
- [x] Keep the adaptation documentation explicit about boundaries: no executable external code, no healthcare authorization weakening, no tenant-scope changes, and no speculative features.
- [x] Verify the adapted guidance with repository documentation review and the existing MEDORA release checks; checkpoint only after all applicable checks pass.
- [x] Add a lightweight regression contract proving the external-guidance adaptation document retains MEDORA's protected authorization, tenant isolation, human-review, and no-executable-import boundaries.

- [x] Verify the showcase has no approved synthetic prescription fixture and document the fail-closed decision not to seed patient or prescription data without an authorized clinical-data policy and encryption key.
- [x] Record final role-acceptance evidence and limitations for the published release, including successful manager and cashier checks, pharmacist scope/assistant checks, and the intentionally blocked clinical-fixture scenarios.
- [x] Document the credential-rotation control: rotate only after an authorized replacement secret is supplied through the secure project-secret workflow; preserve the controlled acceptance account until then.

# MEDORA Campaign Video Resume — 2026-08-19
- [x] Prepare the approved 150-second Arabic horizontal master-film blueprint for MEDORA, preserving realistic live-action direction and verified-feature claims.
- [x] Generate the required visual references before video execution and verify brand, composition, continuity, and subtitle-safe areas.
- [x] Record the halted video-generation attempt: Arabic narration, original music, and a short opening exist, but a complete playable campaign video was not generated because the daily quota was exhausted.
- [x] Verify and attach the available opening clip as a non-final artifact; record that no full-film duration/aspect/codec claim is made and the remaining shots are deferred.
- [x] Record the resume control: do not request the next cinematic shot until the daily video-generation quota is available.
- [x] Record the user-directed deferral of MEDORA video production until the generation quota renews; require a new explicit continuation request to resume.

# MEDORA Ground-Up Review — 2026-08-19
- [x] Inventory the current route map, data model, server procedures, shared UI components, test suites, and operational documentation from the repository rather than assuming their coverage.
- [x] Produce a source-linked design and engineering audit that adapts only the compatible simplicity-first, surgical-change, and verification practices from the referenced repository.
- [x] Verify organization, branch, jurisdiction, role, Demo/production, clinical-data, and advisory-AI boundaries against the actual current procedures and tests; document any gap before changing behavior.
- [x] P0: Correct CRM/HR/customer-care scope handling so a legal showcase jurisdiction ID of 0 is never treated as absent or used to widen a query, with focused authorization regression coverage.
- [x] P0: Require the shared organization/branch/jurisdiction validator for HR contract and shift creation so managers cannot write an unassigned jurisdiction value.
- [x] P0: Make governed AI-insight inputs and list/fact filters zero-safe for a legal jurisdiction ID of 0, preserving branch-jurisdiction assignment validation and advisory-only output.
- [x] P0: Make operations/review scope contracts and filters zero-safe for jurisdiction ID 0 so branch-scoped reads cannot silently widen.
- [x] P0: Preserve a legal jurisdiction ID of 0 in the branch analytics request instead of silently falling back to branch-only analytics.
- [x] P0: Allow the showcase workspace to treat jurisdiction ID 0 as a valid scope and remain unavailable only when branch or jurisdiction scope is actually missing.
- [x] P0: Make the identified client workspace readiness and query gates zero-safe for legal jurisdiction ID 0, while keeping a missing organization or branch scope unavailable.
- [x] Update the secondary-module role-acceptance fixture to model the required branch-jurisdiction membership read and retain the stricter scope-denial expectation.
- [x] Review desktop and mobile RTL/LTR workflows for navigation clarity, primary-action discovery, empty/error/degraded states, and direct deep-link access.
- [x] Fix the Home screen-capture scope label to reuse the resolved branch label and remain intelligible while branch data is loading or unavailable, without changing session or authorization state.
- [x] Implement only evidence-backed, security-preserving redesign or rebuild changes with focused regression tests, full suite verification, and visual checks.
- [x] Publish a reversible checkpoint and a concise decision record distinguishing completed improvements, deferred work, and external prerequisites.

# MEDORA Deep Role-Based Acceptance — 2026-08-19
- [x] Map every implemented role, workspace, report, authorization boundary, and non-destructive Demo-capable workflow into an evidence-backed acceptance matrix.
- [x] Execute role simulations for doctor/pharmacist, cashier and sales, purchasing and inventory, finance, HR/CRM/customer care, branch manager, and system owner; record accessible workflows, denials, reports, search behavior, advisory-AI gates, and scope behavior.
- [x] Test representative create/read/update and export/report flows only where safe, authorized, and backed by non-clinical Demo data; keep patient, prescription, and regulated clinical operations fail-closed without an authorized policy and encryption key.
- [x] Investigate and fix every reproducible defect found during role simulation with a minimal server-first change and focused regression coverage; add a feature only for a demonstrated operational gap.
- [x] Run focused tests, TypeScript, the complete Vitest suite, production build, and desktop/mobile RTL visual verification after accepted fixes.
- [x] Publish a reversible acceptance checkpoint with a role-by-role evidence record, fixed defects, bounded limitations, and deferred external prerequisites.

# MEDORA Performance, Employee Self-Service & Production Reporting — 2026-08-19
- [x] Audit the production bundle and route/component loading boundaries; design and implement evidence-based lazy loading that preserves workspace access, RTL, and authorization behavior.
- [x] Define and implement an employee self-service policy and workflow that binds every request to the authenticated employee identity, active organization/branch/jurisdiction membership, and a fail-closed HR data-access boundary.
- [x] Extend report exports with server-authorized production email delivery, use configured sender credentials only, and preserve scoped filters, auditability, and sensitive-data minimization.
- [x] Add focused regression tests for lazy-loading boundaries, employee self-service isolation, export authorization, and email-delivery failure handling.
- [x] Run TypeScript, the complete Vitest suite, production build and desktop/mobile visual checks; publish an evidence-backed checkpoint with any required external configuration noted.

# MEDORA Smart, Simple UI/UX Redesign — 2026-08-19
- [x] Audit the current authenticated navigation, dashboard hierarchy, workspace launch paths, empty states, and mobile interactions for role-specific cognitive load and task completion friction.
- [x] Define and document a smart, progressive-disclosure UI/UX system that supports Arabic RTL and English LTR, preserves scope visibility, and keeps privileged actions discoverable without exposing unauthorized modules.
- [x] Implement the redesigned role-aware navigation, workspace home, guided quick actions, and responsive mobile interaction patterns using existing reusable components where applicable.
- [x] Add or update regression tests for navigation accessibility, role-aware discovery, language direction, and the redesigned primary task flows.
- [x] Verify the redesign with TypeScript, full Vitest, production build, desktop and mobile visual reviews, then publish a reversible checkpoint.

# MEDORA Problem-to-Workflow Intelligence — 2026-08-19
- [x] Map the reference's problem-first, integration-aware, automation-oriented logic to MEDORA's existing role, scope, reporting, and advisory boundaries; document only compatible applications.
- [x] Design a role-filtered workflow intelligence model that converts operational signals into traceable next steps, separates advice from execution, and keeps organization/branch/jurisdiction isolation fail-closed.
- [x] Implement the highest-value safe workflow and reporting connections using existing protected modules, without external data scraping, unauthorised messaging, or autonomous clinical/financial actions.
- [x] Add regression coverage for workflow visibility, scope isolation, authorization, human review, and non-execution of advisory recommendations.
- [x] Verify TypeScript, complete Vitest, production build, and desktop/mobile UI behavior; publish a reversible checkpoint with the design rationale.

# MEDORA Stock Signals, SLA & Human Decision Ledger — 2026-08-19
- [x] Audit the existing inventory, procurement, customer-service, audit-log, and role/scope schemas and routers; define a strict fail-closed data contract for each new operational signal and decision.
- [x] Design and document a manager-visible, role-filtered stock-signal queue, procurement/customer-service SLA metrics, and a human decision ledger that records reasoned approval or rejection without autonomous execution.
- [x] Implement scoped stock signals, SLA aggregation, and reviewed decision recording using protected server procedures and a simple responsive manager-facing work surface.
- [x] Add focused regression tests for organization/branch/jurisdiction isolation, manager authorization, source-data minimization, SLA calculation behavior, decision immutability/auditability, and the non-execution boundary.
- [x] Create and validate a reusable Manus skill that packages the secure problem-to-workflow implementation method, including design, implementation, verification, and delivery guardrails.
- [x] Verify TypeScript, complete Vitest, production build, and desktop/mobile UI behavior; publish a reversible checkpoint and deliver the reusable skill.

# MEDORA Automation & Orchestration Reorganization — 2026-08-19
- [x] Audit the existing managed inventory, reporting, and backup automation paths; compare the free internal control plane with an optional self-hosted n8n Community adapter and record security boundaries.
- [x] Design a scoped automation-control model that corrects the legacy unscoped inventory scheduler without enabling an external workflow connector or autonomous protected-data operation.
- [x] Add tenant scope, workflow identity, safe run state, idempotent schedule configuration, and audit events to inventory automation.
- [x] Reorganize the manager command centre so eligible managers can inspect and deliberately configure only their scoped inventory signal automation.
- [x] Add focused authorization, scope, idempotency, non-execution, and external-boundary regression contracts.
- [x] Verify TypeScript, full Vitest, production build, RTL desktop/mobile behavior, and publish a reversible checkpoint.

# MEDORA Configurable SLA, Quiet Escalation & Approval Ledger — 2026-08-19
- [x] Audit the existing SLA, escalation, purchase-order, transfer-review, decision-ledger, and authorization paths; define an internal-only, fail-closed delivery contract.
- [x] Design an organization-level SLA policy with non-intrusive in-app escalation levels and atomic, reasoned approval-ledger writes for purchase orders and inter-branch transfers.
- [x] Add scoped organization SLA policy storage, protected configuration procedures, and server-side target/escalation calculations.
- [x] Require approval/rejection reasons and create immutable decision/audit records in the original purchase-order and inter-branch-transfer approval paths.
- [x] Surface policy configuration and quiet SLA escalation indicators for authorized managers only.
- [x] Add focused authorization, isolation, required-reason, atomic-audit, escalation, and non-execution regression contracts.
- [x] Verify TypeScript, full Vitest, production build, desktop/mobile RTL behavior, and publish a reversible checkpoint.
- [x] Wire the existing purchase-order approval/rejection transition into the authorized supply workflow with a mandatory human reason and no parallel approval path.
- [x] Harden purchase-order list/report and creation scope handling so jurisdiction ID 0 remains legal and no cross-jurisdiction supplier or order data is exposed.

# Approved Automation Events and Failure Notifications — 2026-08-19

- [x] Re-verify that SLA targets remain configurable per organization only, with protected manager configuration and no cross-tenant policy reads.
- [x] Supersede the outbound n8n-adapter request with a MEDORA-internal, signed, minimized, scope-safe event ledger that never accepts execution commands.
- [x] Supersede external HTTPS/HMAC activation with server-side local signing for the internal ledger; no external endpoint, external credential, or network delivery is enabled.
- [x] Track consecutive tenant-scoped automation failures and create deduplicated in-app notifications for authorized managers after the configured threshold.
- [x] Add authorization, scope-isolation, payload-minimization, signature, idempotency, failure-threshold, and no-autonomous-execution regression contracts.
- [x] Run TypeScript, full Vitest, production build, responsive RTL verification, and save a reversible published checkpoint.

# Free Automation Engine Replacement — 2026-08-19

- [x] Supersede the n8n-specific adapter boundary with the completely internal MEDORA event ledger, retaining signed, minimized, outbound-free operational records.
- [x] Document that no self-hosted endpoint or activation path is required and that inbound execution remains prohibited.

# Internal Automation Delivery — 2026-08-19

- [x] Replace the optional Activepieces transport requirement with a MEDORA-internal, append-only operational-event ledger that needs no external endpoint or secret.
- [x] Keep scoped inventory automation and repeated-failure manager notifications fully operational with outbound networking disabled by default and no inbound execution route.
- [x] Remove external-engine configuration from manager-facing controls while preserving minimal event history and audit-safe diagnostics.

# Role-Scoped Personal Home Summary — 2026-08-20

- [x] Replace generic home-summary cards with a role-, permission-, and scope-gated personal task summary so each employee sees only operational indicators and actions directly relevant to their assigned work.
- [x] Preserve authorized manager and owner oversight without exposing unrelated sales, inventory, finance, HR, customer-care, or alert metrics to other roles.
- [x] Add regression tests for role-based home-card discovery and verify Arabic RTL presentation on desktop and narrow mobile before publishing.

# Reusable Role-Scoped Dashboard Audit — 2026-08-20
- [x] Package the verified role-, permission-, and scope-gated dashboard review method as a reusable Manus skill, including fail-closed acceptance criteria and a repeatable evidence checklist.
- [x] Execute separate authorized login journeys for every available non-clinical role and document the permitted summary cards, task tables, hidden unrelated surfaces, and any denied access result.
- [x] Re-run role-discovery contracts, TypeScript, the full Vitest suite, production build, and responsive RTL checks; fix only reproducible authorization or presentation defects.
- [x] P0: require an authoritative organization-membership finance role before any accounting read, and prove pharmacist/cashier sessions receive an explicit denial even when no financial rows exist.
- [x] Add a dedicated organization-membership financial-read capability and apply it before every accounting read or write procedure.
- [x] Add a regression contract proving only the designated financial membership roles can access accounting data, including authorized legal jurisdiction ID 0 handling.

# Sensitive Screen-Capture Protection Reinforcement — 2026-08-20
- [x] Re-enable the existing sensitive-screen protection boundary for authenticated MEDORA workspaces with no accidental protection of public pages.
- [x] Strengthen browser-available controls: immediate privacy overlay on focus/visibility/page-lifecycle risk, blocked print/copy/context actions for protected content, and a legible user-and-scope watermark.
- [x] Add focused regression tests and document non-bypassable web limitations, plus native-wrapper controls required for Android/iOS/HarmonyOS regulated deployments.
- [x] Verify TypeScript, focused and full tests, production build, desktop/mobile rendering, and save the hardened release.

# Intellectual Property and Native Device Protection — 2026-08-20
- [x] Audit source provenance, license notices, copyright headers, build artefacts, and repository evidence for MEDORA-owned work.
- [x] Add a project ownership notice, machine-verifiable source-integrity manifest, and release-evidence instructions without misrepresenting legal registration.
- [x] Record sensitive copy/print/context/drag/keyboard-risk events in a scope-minimized central audit trail with fail-closed authorization.
- [x] Provide Android, iOS, and HarmonyOS native-wrapper controls and an actual-device acceptance protocol, clearly separating simulator/browser checks from physical-device evidence.
- [x] Run focused and full verification, document remaining legal and physical-device prerequisites, and save the protected release.

- [x] إصلاح فشل النشر الناتج عن ERR_PNPM_LOCKFILE_CONFIG_MISMATCH والتحقق من تطابق package.json وpnpm-lock.yaml وpnpm-workspace.yaml.
- [x] إجراء اختبار شامل للمساعد العائم بصلاحيات المدير والصيدلي والكاشير، مع التحقق من الظهور والنطاق ومنع التنفيذ غير المصرح.
- [x] إنشاء مهارة قابلة لإعادة الاستخدام توثق نمط اختبار الأدوار وإصلاح النشر الآمن في MEDORA عبر مسار skill-creator.
- [x] إضافة اختبارات انحدار للنتائج الجديدة، ثم تشغيل TypeScript وVitest والبناء وحفظ إصدار منشور ناجح.

- [x] توثيق اختبار المحادثة الاستشارية لحساب إنتاج مصرح كـ environment-gated؛ يثبت العقد المحلي النطاق والمراجعة البشرية وعدم التنفيذ الذاتي، ولا يدّعي نجاح جلسة إنتاج بلا اعتماد متاح.
- [x] إضافة عقد UI قابل للتكرار يثبت ظهور المساعد ونطاقه للمدير والصيدلي والكاشير، مع تحقق RTL/LTR المكتبي والهاتف؛ اختبار الدخول الحي يبقى environment-gated.
- [x] تقسيم vendor-core إلى vendor-documents وvendor-export وvendor-cloud؛ انخفض vendor-core من نحو 1.06MB إلى نحو 0.86MB، مع بقاء تحذير vendor-documents غير المتزامن وتحقق البناء والتحميل الكسول.
- [x] تشغيل Vitest الكامل (704 ناجحة، 10 متخطاة عمداً)، TypeScript، البناء الإنتاجي، وعقود الصلاحيات؛ حفظ الإصدار المنشور بعد القياس والتحقق.

# KPI Role Template Expansion — Doctor, Customer Service, Warehouse Manager

- [x] Add bilingual KPI template for Doctor with clinical-safety, documentation, continuity-of-care, and quality-gate evidence requirements.
- [x] Add bilingual KPI template for Customer Service with response, resolution, empathy, privacy, SLA, and escalation evidence requirements.
- [x] Add bilingual KPI template for Warehouse Manager with inventory accuracy, FEFO, expiry control, receiving, reconciliation, and safety evidence requirements.
- [x] Integrate the three templates into the protected KPI catalog, preview, and idempotent apply workflow without weakening tenant/branch/jurisdiction isolation.
- [x] Add regression tests for template completeness, weights, role authorization, scope isolation, and non-overwrite behavior.
- [x] Run focused tests, TypeScript, full Vitest, production build, and responsive bilingual UI verification for the expanded KPI catalog.
- [x] Save a checkpoint for the three-role KPI template expansion after all evidence-backed validation passes.

# Production Test Account Visual Acceptance — 2026-08-21

- [x] Execute visual login with the user-provided test account without exposing credentials in logs or artifacts.
- [x] Verify authenticated role, assistant visibility, task summary scope, and navigation boundaries without submitting operational transactions; assistant content loading failed visibly and was not misrepresented as successful.
- [x] Record the result and any environment/session limitations; assistant content-loading defect remains open for separate investigation.

# Assistant Workspace Loading Repair — 2026-08-21

- [x] Trace the assistant workspace loading endpoint, client query, session scope, and server/browser logs to identify the concrete failure cause; the observed failure was isolated to the lazy assistant workspace load path, not an assistant chat success response.
- [x] Add a clear safe local fallback for assistant workspace loading failures without fabricating external AI responses or bypassing human review.
- [x] Add regression tests for endpoint failure, fallback rendering, role scope, bilingual messaging, and no sensitive-operation execution.
- [x] Re-run TypeScript, focused tests, full Vitest, production build, and responsive UI verification; full Vitest passed with 705 tests passed and 10 intentionally skipped, and production build passed with only the known chunk-size warning.
- [x] Re-test the assistant visually for the available manager account and document the reproduced global fallback; pharmacist and cashier production accounts remain environment-gated because only manager credentials were provided.
- [x] Save a checkpoint and deliver the repair report with exact remaining limitations.

# Assistant Post-Publish Acceptance and Monitoring — 2026-08-21

- [x] Re-test the published manager session and confirm the local assistant fallback renders without collapsing the workspace; visual verification confirmed the bilingual fallback, retry control, and safe message.
- [x] Verify whether authorized pharmacist and cashier test credentials are available; only manager credentials were available, so pharmacist and cashier live acceptance remains environment-gated.
- [x] Add bounded, redacted monitoring for repeated assistant workspace/load failures without storing prompts, responses, or clinical data.
- [x] Add manager notification policy for repeated assistant-load failures with deduplication and cooldown: three failures in 15 minutes, 30-minute cooldown.
- [x] Add regression tests for failure aggregation, scope isolation, redaction, notification thresholds, and fallback behavior.
- [x] Run TypeScript, focused tests, full Vitest, production build, and responsive verification; 709 tests passed, 10 intentionally skipped, and the build passed with the known chunk warning.
- [x] Save a checkpoint and deliver the post-publish acceptance and monitoring report.

# Video Free-Quota Resume Attempt
- [x] Retry the saved MEDORA horizontal opening only if the free video quota is available; do not upgrade or use paid generation. Completed once through the available native free-generation route as the 5-second 16:9 MEDORA opening test, without Pika or a paid route.
- [x] Preserve the generated clip if successful, or record the exact quota blocker and safe resume point if rejected. One 5-second 16:9 native free-generation test is preserved at `/home/ubuntu/webdev-static-assets/MEDORA_opening_free_test_arabic_narration_16x9.mp4` with technical codec/duration verification recorded.

# Lawful Free Video Production Path — 2026-08-22
- [x] Verify current free-tier availability and commercial-use/export constraints for eligible video generators; Pika official pages were checked on 2026-08-23 and their conflicting free-credit/commercial-use statements were recorded pending authenticated-account confirmation.
- [x] Prepare a short, modular MEDORA shot package that can be generated and assembled today without bypassing quotas or provider controls.
- [x] Create a reusable skill for quota-aware, rights-safe AI video production and archive auditing.
- [x] Attempt only the lawfully available free/open-source generation route; do not use paid APIs, unapproved accounts, or credentials. Generated one native free 5-second MEDORA opening test without Pika or an external account.
- [x] Record the result, usable artifacts, and any remaining access limitations. Technical integrity and remaining Pika/account and commercial-rights limits are recorded in the campaign status log.
# Pika First Free MEDORA Shot — 2026-08-22
- [ ] Verify that the authorized Pika browser session is available to this task and that a visible free credit balance can fund one 5-second test generation.
- [x] Finalize the 16:9 visual reference and detailed prompt for the MEDORA opening: pharmacist workflow, Data Matrix scan, and neutral professional setting without fake text or regulatory claims.
- [ ] Submit exactly one approved 5-second Pika 2.5 opening test only after the authenticated account and visible balance are confirmed; do not submit duplicate retries.
- [ ] Inspect the completed clip for basic technical integrity, claim safety, realistic continuity, and usable 16:9 framing before spending further credits.
# Reusable Quota-Aware Cinematic Video Skill — 2026-08-22
- [x] Initialize and validate a reusable Skill covering free-tier verification, safe archive inspection, credit-aware shot planning, asset continuity, and transparent quota-failure handling.
# Pika-Independent Free Video Route — 2026-08-22
- [x] Verify lawful no-payment alternatives that can produce a genuine short video without an authorized Pika session, distinguishing hosted anonymous capacity from local open-weight capacity.
- [x] Verify available compute, runtime, and output constraints before downloading or running any local video model.
- [x] Adapt the approved MEDORA opening prompt and visual reference to the selected free route without changing verified-claims boundaries.
- [x] Run one non-duplicated opening-shot generation only if the route is actually available and permitted, then inspect the resulting file; public LTX/Wan returned no output and no retry was submitted to the same route.
- [x] Record the exact outcome and smallest remaining dependency if an actual render cannot be completed in the current environment.
# User-Supplied MEDORA Investor Reference Pack — 2026-08-22
- [x] Inspect the uploaded ZIP inventory and the MP4 technical metadata without executing archive contents or adopting unverified claims.
- [x] Analyze the uploaded 150-second film for structure, pacing, visual motifs, readable on-screen messaging, and reusable production direction.
- [x] Extract only the user-approved, non-sensitive and production-useful elements into an updated MEDORA creative brief and shot plan.
- [x] Report precisely which supplied elements will be retained, changed, or excluded before creating any new video derivative.
# User-Authorized Investor-Cut Reuse — 2026-08-22
- [x] Extract only the uploaded video files into a controlled workspace and verify their technical metadata and integrity.
- [x] Define a distinct preview cut that reuses only user-supplied visuals, avoids unverified compliance text, and clearly differs from the supplied investor master.
- [x] Render and inspect a short motion preview with original transitions and MEDORA-safe caption treatment, without representing it as the final campaign master.
- [x] Deliver the preview and a precise record of reused, modified, and excluded material.
# Investor-Pack Asset Reuse Expansion — 2026-08-22
- [x] Safely inventory non-executable media, text, and design assets inside the user-supplied investor pack, excluding scripts, binaries, credentials, and unknown executables.
- [x] Identify additional user-authorized material that can improve a new MEDORA campaign structure without reusing unsupported claims or source UI.
- [x] Produce and inspect the next motion-preview cut using only verified, user-authorized assets and new conservative MEDORA treatment.
- [x] Document asset provenance, changes, and exclusions for the expanded preview.

# MEDORA Final Film and Verified Audio — 2026-08-22
- [x] Re-read the required video, audio, and skill-authoring guidance; confirm final-format and audio-verification constraints before production.
- [x] Update and validate the reusable quota-aware cinematic-video Skill with the approved source-footage, audio, and final-QC workflow.
- [x] Create a final-cut treatment from user-authorized source video with advanced but non-deceptive visual effects and MEDORA-safe captions.
- [x] Generate or integrate an authorized Arabic male narration and a licensed soundtrack, then verify that the final MP4 contains a playable audio stream.
- [x] Inspect visual continuity, captions, duration, audio presence, codec metadata, and playback of the final high-quality deliverable.
- [x] Deliver the final film, production record, and reusable Skill without calling an unfinished or unsupported asset complete.
- [x] Audit the full user-authorized 150-second source for additional human-operated footage and document source-UI/text exclusions.
- [x] Assemble an extended horizontal master only from individually reframed, safe excerpts; use no repeated filler and do not inherit reference claims.
- [x] Produce, mix, and verify extended Arabic narration and original score segments for the expanded master.

# MEDORA Vertical Social Master — 2026-08-22
- [x] Re-read the current production guidance and define the 90-second 9:16, safe-title, and verified-audio constraints.
- [x] Extend and validate the reusable quota-aware cinematic-video Skill with safe vertical recomposition and social-export quality gates.
- [x] Select and reframe only source excerpts that remain coherent in 9:16 while excluding all inherited source UI, subtitles, audio, and unverified claims.
- [x] Create original Arabic male narration and instrumental score segments for the 90-second vertical edit.
- [x] Render and inspect a 1080×1920 MP4 with advanced but restrained visual finishing and a tested audio stream.
- [x] Deliver the vertical master, provenance record, and updated reusable Skill.

# MEDORA NDA Access Gate and Live-Action Campaign Refresh — 2026-08-22
- [x] Define the NDA acceptance scope, versioning, audit record, refusal flow, and limits across browser, mobile wrappers, local development, and source repositories.
- [x] Add a versioned Arabic/English NDA document, access gate, durable acceptance record, and signed-out/refusal route without exposing protected application data first.
- [x] Enforce the NDA gate across authenticated web routes and document equivalent native-wrapper and repository-access controls.
- [x] Add regression tests for first acceptance, renewed acceptance after NDA version change, refusal, organization isolation, and bypass resistance.
- [x] Audit user-authorized media and write a lively Live Action campaign blueprint with MEDORA logo placement, bilingual narration, and reciprocal subtitle tracks.
- [x] Produce an English-speaker version with Arabic subtitles using only authorized footage/assets and safe claims.
- [x] Produce an Arabic-speaker version with English subtitles using only authorized footage/assets and safe claims.
- [x] Verify both new films for live-action pacing, logo visibility, subtitle legibility, audio presence, playback integrity, and source-claim exclusions.
- [x] Deliver the NDA protection evidence, updated reusable Skill, bilingual campaign files, and limitations record.

# MEDORA Unified Cross-Platform Live-Motion Master — 2026-08-22
- [x] Inventory and visually audit the newly supplied, user-authorized media without executing any embedded files or workflows.
- [x] Select only lawful, claim-safe live-motion excerpts and author a single cross-platform master blueprint with MEDORA branding and safe framing.
- [x] Produce one device-responsive H.264/AAC master with original narration, reciprocal subtitle track, non-orchestral music, and visible MEDORA identity.
- [x] Verify full decode, audio presence, caption/logo legibility, responsive framing, and absence of inherited UI, text, unsupported claims, or private data.
- [x] Update and validate the reusable production skill, provenance record, and delivery package for the unified master.

# MEDORA Reels & TikTok Vertical Master — 2026-08-22
- [x] Create a native 1080×1920 editorial blueprint with vertical subject-safe crops, top and bottom UI-safe zones, and claim-safe live-motion selections.
- [x] Produce an independent 9:16 H.264/AAC export with Arabic male narration, English embedded captions, MEDORA identity, and original electronic/percussive music.
- [x] Verify vertical opening/midpoint/closing frames, caption/logo legibility, source-text exclusions, full decode, H.264/AAC metadata, and audible start/middle/end audio samples.
- [x] Record provenance, update the reusable production skill if needed, package the Reels/TikTok delivery, and publish a checkpoint.

# MEDORA Vertical Master Recovery — 2026-08-22
- [x] Diagnose the reported corrupt/failed playback condition of the prior video and document the actual container, codec, duration, and decode findings.
- [x] Replace the short-form concept with a materially longer native 9:16 live-motion narrative using only newly reviewed, safe human-action source windows and original MEDORA cards.
- [x] Run device-oriented playback, full decode, stream metadata, audible start/middle/end, and safe-frame/legibility checks before any replacement delivery.
- [x] Update provenance and the reusable production workflow with the corrective export gates, save a checkpoint, and package only the validated replacement.

# MEDORA Long Vertical English-Caption Revision — 2026-08-22
- [x] Create a conservative, time-aligned English caption track from the documented vertical editorial sequence without inventing claims or misrepresenting narration.
- [x] Burn the English captions into a new 1080×1920 H.264/AAC long vertical master while preserving title and platform-safe zones.
- [x] Verify caption timing and legibility alongside audio, safe claims, source exclusions, complete decode, and mobile-compatible metadata; then update provenance and checkpoint the revision.

# MEDORA Reels & TikTok Pre-Publish Review — 2026-08-22
- [x] Measure the delivered vertical master for frame size, aspect ratio, frame rate, codec, pixel format, audio stream, runtime, full decode, and representative audio levels.
- [x] Review representative frames for subtitle placement, MEDORA legibility, and practical Reels/TikTok overlay-safe spacing.
- [x] Export and verify a 30 fps Instagram-compatible derivative without synthetic motion or changes to the approved live-action edit.
- [x] Provide a non-destructive professional transition and background-music mixing recipe that preserves narration, captions, claims boundaries, and platform compatibility.

# Vertical Social Video QC Skill — 2026-08-22
- [x] Create a reusable skill structure for verified vertical Reels/TikTok delivery, including a deterministic metadata/decode/audio checker and a QC report template.
- [x] Write compact operational guidance for safe frame review, 30 fps remediation without synthetic motion, subtitle safe zones, narration-first music mixing, and transition choices.
- [x] Validate the new skill, mark the workflow complete, save a checkpoint, and deliver the packaged skill.

# MEDORA GitHub Mobile Presentation Refresh — 2026-08-22
- [x] Synchronize the MEDORA repository and audit the mobile-visible README hierarchy, repository description, homepage link, and stale ALDORA/old-domain references.
- [x] Rewrite the README opening and mobile-first identity section in polished bilingual MEDORA language, with concise hierarchy and responsive GitHub Markdown.
- [x] Update the repository description and homepage to approved MEDORA values where the actual published domain is available; otherwise document the exact owner action required for a custom MEDORA domain.
- [x] Validate links, branding, and mobile rendering, preserve source-control integrity through the integration-branch/PR workflow, and document the result.

# MEDORA CI Contract Recovery — 2026-08-22
- [x] Restore the explicitly tested fail-closed Arabic notice that automatic notifications are not sent before explicit scheduling, then rerun the focused integration contract test.

# MEDORA README Professional Visual Refresh — 2026-08-23
- [x] Redesign the GitHub README hero and first-screen hierarchy for a more distinctive MEDORA presentation on mobile without adding heavy or fragile assets.
- [x] Replace desktop-wide information blocks with compact, mobile-legible MEDORA capability and trust sections while preserving bilingual clarity and safe product claims.
- [x] Validate the refreshed Markdown and links on integration branch `integration/readme-responsive-refresh-20260823`; pull request #19 has successful required checks, and the observation record documents the rendered review.
- [x] Review the refreshed README against phone, tablet, laptop, and desktop viewport criteria, including bilingual line length, section hierarchy, table overflow avoidance, and link reachability.
- [x] Merge pull request #19 into `main` after explicit owner authorization; merged as commit `acf008ffea681db6983cf49faa4ffeb2899dc0e1` with no visibility, domain, or collaborator setting changes.

# MEDORA esbuild Dependabot Remediation — 2026-08-23
- [x] Diagnose the active Dependabot alert and resolve the exact `drizzle-kit` to `esbuild` dependency path on current `main`.
- [x] Apply the smallest safe dependency update or pnpm override on an integration branch without weakening the build toolchain.
- [x] Re-run dependency audit, TypeScript, tests, production build, smoke test, and end-to-end checks; open focused pull request #20 with successful MEDORA CI and CodeQL checks, while documenting the separate local preview branding-environment mismatch.
- [x] Merge pull request #20 after explicit owner authorization; merged at `9ae4286fa9012dbd81418e08f0aaf76d56e299ae`, with the resolved tree and production audit confirming `esbuild 0.25.0` and no known vulnerabilities.
- [ ] Confirm GitHub's displayed Dependabot-alert closure when an authorized GitHub security session or alert-read permission is available; current API access returns 403 and the available browser session is unauthenticated.

# MEDORA Mobile Assistant and Workspace Recovery — 2026-08-23
- [x] Diagnose the mobile assistant panel’s collapsed input/action layout and identify the component/CSS rules that cause the narrow, vertically broken composer.
- [ ] Diagnose the “failed to load workspace” state, including the exact query/API failure and branch-scope fallback behavior, without treating the error as a normal empty state.
- [x] Add a safe, local-only workspace-failure category that distinguishes likely lazy-module loading failures from generic subtree rendering failures without exposing raw errors, payloads, organization data, or changing scope.
- [x] Extract and unit-test the safe workspace-failure classifier for recognised lazy-module signatures and unknown failure fallback, without logging or rendering raw error details.
- [x] Implement accessible mobile-first assistant layout constraints and a recoverable workspace loading path with explicit retry and safe local fallback where justified.
- [x] Add focused regression tests for the assistant panel’s responsive structure and workspace-load error/retry behavior.
- [x] Verify the repaired assistant and workspace flows on phone, tablet, and desktop viewports, then publish a checkpoint with the exact results.
- [x] Add and verify one bounded local re-import of the MEDORA AI lazy workspace when its chunk cannot load after an application update, without changing authenticated organization/branch scope or reloading the page.
- [x] Add a semantic title and description to the MEDORA AI drawer and lock the accessibility requirement with a source-contract test.
- [x] Locate and verify the user, role, privilege, and permission administration panel route, navigation visibility, and required administrator authorization.
- [ ] Compare the user-provided Manus share replay with MEDORA project checkpoints and source history; document any verifiable project identity or delivery gap without assuming lost work.
- [x] Re-audit the administrator configuration, user-management navigation, role-assignment boundaries, and effective privilege enforcement; document verified gaps before any access-control change.
- [x] Add a standalone, authenticated Admin Console route that is reachable only to global administrators or organization members with `manage_members` in the selected organization.
- [x] Add a scope-safe edit dialog for existing employees that can change only an allowed organization role and active branch, using the already enforced server update procedure.
- [x] Add a read-only organization-role capability matrix that clearly distinguishes fixed role-derived privileges from unsupported per-user overrides.
- [x] Add focused server and UI regression contracts for route gating, role/branch editing, prohibited privileged-role assignment, and matrix read-only behavior.
- [x] Run TypeScript, focused and full Vitest suites, production build, and responsive authenticated verification before publishing the administration-console update.
- [x] Create and validate a reusable secure-admin-console skill covering fail-closed organization gating, protected-role boundaries, scoped employee editing, read-only capability matrices, and release checks.
- [x] Add client-side advanced employee-list search by name, email, and username, plus role and branch filters, without expanding the directory data returned by the scoped server procedure.
- [x] Add accessible filter controls, result count, no-result state, and a clear-filter action for the employee administration workspace.
- [x] Add regression contracts for directory filtering and ensure TypeScript, full Vitest, production build, and responsive verification pass before publishing.
- [x] Add a server-side, organization-scoped paginated employee-directory contract with bounded page size, stable ordering, total count, and no cross-organization disclosure.
- [x] Integrate the employee search and role/branch filters with the paginated directory without requesting unrestricted employee records.
- [x] Add accessible previous/next pagination controls, page status, and appropriate reset behavior when organization or filters change.
- [x] Add pagination and tenant-isolation regression tests, then validate TypeScript, full Vitest, production build, and responsive administrator views before publishing.
- [x] Define an approved employee-directory export schema that includes only scoped operational fields and explicitly excludes credentials, password metadata, and unrelated organization data.
- [x] Add a manager-gated, organization-scoped CSV export procedure that reuses the active search, role, and branch filters with a bounded export limit and audit-safe filename metadata.
- [x] Add an accessible export action to the Admin Console that exports the currently filtered directory and clearly states the selected scope and record count.
- [x] Add export privacy, CSV escaping, filter-scope, authorization, and responsive UI regression tests; validate TypeScript, full Vitest, production build, and administrator preview before publishing.
- [x] Audit the existing Test/demo identity, showcase organization, fixture data, and write paths without exposing or copying administrator credentials, sessions, or production tenant data.
- [x] Define a fail-closed Test demonstration policy that mirrors the administrator feature surface and navigation but confines reads to a demo tenant and prevents durable writes, privileged identity changes, and external side effects.
- [x] Implement scoped Test-mode authorization and non-persistent operation handling across applicable tRPC write procedures, preserving ordinary administrator behavior outside the Test identity.
- [x] Provide a clearly marked Test-mode experience with administrator-equivalent feature access only where mock-safe, while withholding secrets, ownership transfer, privileged user provisioning, and external integration execution.
- [x] Add regression tests for tenant isolation, write non-persistence, blocked sensitive actions, and unchanged administrator behavior; validate TypeScript, full Vitest, production build, and role-based previews before publishing.
- [x] Add a prominent, accessible read-only banner at the top of every isolated showcase/Test workspace, derived from trusted server session state and without altering production sessions.
- [x] Add regression contracts for the read-only banner visibility, copy, scope source, and absence from ordinary production sessions; then run TypeScript, full Vitest, production build, and responsive verification.
- [x] Create, validate, and deliver a reusable skill for implementing and verifying server-derived read-only session banners without client-side authorization assumptions.
- [x] Add an accessible, server-safe action in the showcase read-only banner that routes a user to authentication or a legitimate permission-request path without changing session authority.
- [x] Add regression coverage for the banner action, including its restricted-session-only visibility and absence of self-escalation, then validate TypeScript, Vitest, production build, and responsive interaction before publishing.
- [x] Build a role-and-workflow acceptance matrix covering Test/showcase, pharmacist, cashier, purchasing, sales, customer care, warehouse, physician, manager, decision-maker, and administrator pathways, with explicit boundaries for unconfigured external services and physical devices.
- [x] Execute reproducible contract, route, permission, and responsive UI checks for the matrix inside isolated/safe environments; record evidence, failures, and unsupported live-only scenarios without using production identities or data.
- [x] Diagnose and correct only reproducible defects uncovered by the role-based audit, with focused regression coverage and no dilution of tenant isolation, regulated controls, or immutable audit boundaries. No new reproducible functional defect was found in this audit.
- [x] Re-run full regression, build, and relevant role-based visual checks; publish a concise acceptance-audit record that distinguishes verified coverage from integration/device work still requiring authorized live validation.

# Full Revision & GitHub Resynchronization — 2026-08-23
- [x] Audit local project health, repository topology, remote reachability, and the GitHub default branch before changing code or pushing commits.
- [x] Identify and implement only reproducible, scope-safe improvements uncovered by the full review, with focused regression coverage.
- [x] Run complete validation and record review evidence, including any environment-gated or permission-gated limitation.
- [ ] Synchronize approved, validated changes to the GitHub repository using the protected-branch workflow available to this project, without force pushes or history rewrites.
- [x] Replace stale ALDORA CI identity and deterministic CI-only secrets; add the existing fail-closed isolated-database lifecycle contract to the CI workflow, then verify workflow formatting and safety gates.
- [x] Correct public repository and governance identity references to MEDORA | ميدورا while preserving intentional legacy internal identifiers and the current managed deployment URL.
- [x] Remove the reproducible Express `clearCookie` deprecation warning without changing session-scope, logout, or showcase authorization behavior; add a focused regression test.
- [x] Remove literal test-password values from GitHub-sync candidate sources and retain only environment-backed test configuration with regression coverage.
- [x] Make the existing Playwright E2E specification runnable and CI-enforced with a declared test-runner dependency and browser setup, while retaining unauthenticated and non-destructive coverage only.
