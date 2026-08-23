# MEDORA Investor and Tester Flow

## Purpose

This guide defines a repeatable, non-production demonstration path for **MEDORA Health Care Eco System**. It is intended for investors, evaluators, QA testers, and implementation partners who need to exercise the system without mixing synthetic Demo records with production data.

> Demo mode is an isolated operational workspace, not a mirror of a live pharmacy and not evidence of regulatory approval, government connectivity, financial settlement, or clinical authorization.

## 1. Entering the system

Open the published MEDORA domain and select **Secure Login**. After authentication, the application opens the protected workspace rather than treating the public welcome page as an authenticated session. If a tester opens `/workspace`, `/pos`, or `/operations` directly, each path now resolves to the authenticated application shell; unauthenticated visitors are redirected to the login boundary.

The current session indicator at the top of the workspace identifies the active organization, branch, jurisdiction, and whether the visible data is **Demo** or **Production**. A tester must verify this indicator before creating or reviewing any record. The Demo badge is not decorative: server procedures continue to enforce organization, branch, jurisdiction, role, and Demo-mode scope.

## 2. Recommended investor walkthrough

| Step | Action | Expected evidence |
|---|---|---|
| 1 | Open the Operations workspace | Task-oriented cards for sale, returns, prescription, inventory, and procurement are visible. |
| 2 | Open **New Sale** or POS | Product search, camera scan, USB/keyboard scan, Data Matrix boundary, cart, held invoices, and returns entry points are available. |
| 3 | Search or scan a synthetic item | The raw scan payload is preserved; the result remains bounded to the active organization, branch, jurisdiction, and Demo catalog. |
| 4 | Add an item and complete a Demo sale | The workflow exercises pricing, FEFO planning, role checks, audit evidence, and a non-production transaction boundary. |
| 5 | Open Operations Center | Branch, inventory, and cashier-shift indicators show loading, empty, error, and data-quality states without fabricated KPIs. |
| 6 | Open Procurement | A purchase order can move through scoped submission, independent approval, receiving, and idempotent inventory posting where the tester has permission. |
| 7 | Review balances | Supplier balances, customer credit, limits, approval thresholds, and audit outcomes are shown only within the current scope. |
| 8 | Switch display scope | The interface shows the new branch or Demo/Production display state and uses a loading transition; the server remains the final authorization boundary. |
| 9 | Sign out | The protected workspace is no longer available without a valid session. |

## 3. POS test sequence

Use a synthetic medicine or supply from the Demo catalog. Test product search first, then test camera scanning when the browser is secure and the device grants camera permission. If `BarcodeDetector` is unavailable, use the manual or USB/keyboard fallback. The scanner contract preserves the complete raw payload and records the source and symbology boundary rather than silently truncating a Data Matrix value.

Before completing a sale, verify the active branch and Demo label. Add a product, change quantity only within the role policy, inspect the calculated total, and submit the transaction. Demo settlement must remain synthetic. Test held invoices by suspending the cart and restoring it later. Test return entry only against an eligible Demo sale and verify that the server, not the client, applies the policy.

## 4. Procurement, receiving, and balances

A purchase order begins in draft and must be submitted before approval. The maker cannot approve their own order. Receiving is bounded by the approved order quantities and is protected by an idempotency key so a retry cannot post the same inventory delta twice. Cross-organization, cross-branch, cross-jurisdiction, and Demo-to-Production attempts must be rejected.

Supplier and customer credit operations require the configured role, scope, limit, and approval threshold. Every accepted or rejected financial mutation produces an auditable outcome. A recommendation from AI purchasing or decision support is advisory: a human reviewer must approve any regulated or financial mutation, and the model must not silently create a purchase, sale, dispense, or credit entry.

## 5. What is intentionally not live

| Area | Current status | Required prerequisite before activation |
|---|---|---|
| ETA electronic invoice exchange | Prepared boundary; fail-closed | Official specification, credentials, endpoint, acknowledgement contract, retry/idempotency rules, and acceptance evidence. |
| EDA/MOH or other government exchange | Prepared boundary; fail-closed | Written authority, approved connector contract, credentials, jurisdiction rules, and security review. |
| Insurance and payer exchange | Prepared boundary; fail-closed | Payer contracts, member/claim specifications, credentialed sandbox, and reconciliation evidence. |
| Payment gateways and settlement | Not simulated as real settlement | Provider agreement, keys, webhook verification, replay protection, and financial reconciliation. |
| National medicine catalog | No fabricated national source | Authoritative licensed source, provenance, refresh process, jurisdiction mapping, and approval owner. |
| Sensor/cold-chain feeds | Integration boundary only | Device identity, signed readings, timestamps, branch/batch mapping, connectivity, and escalation policy. |
| Native screenshot prevention | Web/PWA safeguards only | Native Android/iOS/HarmonyOS wrapper implementation and device-level validation; web browsers cannot guarantee prevention of external capture. |

## 6. Security and data-boundary checks

A tester must never use production-looking credentials or real patient, customer, supplier, or payment data in Demo mode. The server is the source of truth for organization, branch, jurisdiction, role, Demo, and approval checks. Client-side hiding of a menu is not treated as authorization. Audit records are append-oriented and tamper-evident; sensitive values are not placed in URLs or screenshots.

When testing an error, record the correlation identifier, active scope, role, operation, and time. Do not paste secrets, patient data, access tokens, or full financial records into issue reports. A failed fixture seed or temporary database lock must not destroy the Demo session; the user receives a bounded fallback state while the event remains diagnosable on the server.

## 7. Release evidence for this package

The current package includes the scoped procurement router, receiving and inventory-posting safeguards, supplier/customer balance and credit policies, maker-checker approval, unified operations indicators, Demo isolation, direct `/pos` and `/operations` aliases, and regression coverage. The latest verification recorded **136 passing test files and 438 passing tests with 8 authorized skips**, a successful TypeScript check, a successful production build, and successful mobile-route visual verification.

These results demonstrate implementation and test coverage; they do not constitute government certification, legal compliance, clinical validation, or a production payment/EDI acceptance.
