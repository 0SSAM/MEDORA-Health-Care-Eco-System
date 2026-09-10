# MEDORA | Proposal

## منظومة الرعاية الصحية المتكاملة — Integrated Health System

**Prepared for:** Healthcare operators, pharmacy groups, distributors, hospitals, laboratories, rehabilitation centers, insurers, and public-sector stakeholders  
**Prepared by:** MEDORA product team  
**Date:** 2026-08-15  
**Status:** Non-binding product and implementation proposal

## 1. Vision

MEDORA proposes a secure, modular operating foundation for healthcare organizations that need pharmacy-grade inventory and sales controls together with patient-facing, clinical-adjacent, customer-care, and integration-readiness workflows.

تقدم MEDORA أساساً تشغيلياً آمناً ومركباً للمؤسسات الصحية التي تحتاج إلى ضبط المخزون والمبيعات على مستوى الصيدلية، مع مسارات وصفة إلكترونية وخدمة عملاء وعمليات تكميلية، واستعداد منظم للتكاملات الرسمية.

## 2. Problem

Healthcare organizations often operate across disconnected systems, spreadsheets, branch-specific databases, and informal approval channels. This creates duplicate records, weak traceability, unclear ownership, and unsafe assumptions about government or insurer connectivity.

تواجه المؤسسات الصحية تشتتاً بين أنظمة متعددة وملفات Excel وقواعد بيانات للفروع وقنوات اعتماد غير رسمية. ينتج عن ذلك التكرار، ضعف التتبع، غموض الملكية، وافتراضات خطرة حول التكامل الحكومي أو التأميني.

## 3. Proposed solution

MEDORA brings scope-aware modules into one controlled workspace: ERP/POS, inventory and batches, local returns and tax invoices, catalog provenance and review, e-prescription, customer care, call-centre foundations, notifications, audit evidence, and connector readiness. Regulated connectors remain fail-closed until the target authority provides specifications, credentials, test access, and acceptance evidence.

## 4. Differentiators

| Area | MEDORA approach |
|---|---|
| Safety | Server-authoritative scope and role checks |
| Locality | Versioned country and jurisdiction policy boundaries |
| Transparency | Implemented, partial, blocked, and deferred statuses |
| Traceability | Provenance, audit, source fingerprints, and review gates |
| Adoption | Role-based workspace and visible shortcut help |
| Resilience | Draft-only offline behavior for non-regulated work |
| Extensibility | Controlled tRPC/domain boundaries and import contracts |

## 5. Delivery model

The recommended delivery is staged. Stage 1 confirms the organization, branches, users, jurisdiction, catalog policy, and data ownership. Stage 2 configures POS, inventory, returns, tax invoice templates, and operational roles. Stage 3 runs migration dry-runs and acceptance testing. Stage 4 connects approved official or payer channels only after the receiving entity supplies formal requirements and test evidence.

## 6. Migration and backup assurance

Migration is performed through profiling, field mapping, dry-run, conflict quarantine, signed confirmation, idempotent import batches, and reconciliation. Backups are encrypted, versioned, and restored in an isolated environment before production use. The customer retains custody of its approved encryption and recovery procedures.

## 7. Security and compliance posture

MEDORA is designed with least privilege, tenant isolation, audit evidence, secret separation, security headers, rate limits, and fail-closed external integration boundaries. It should be presented as a security-focused product foundation, not as a substitute for a formal penetration test, legal review, country certification, or government acceptance.

## 8. Commercial discovery questions

Before a binding commercial offer, the implementation team should confirm the number of organizations, branches, users, catalog records, historical years, required paper printers and scanners, offline expectations, hosting requirements, data-residency requirements, support hours, and the official integration roadmap.

## 9. Success measures

| Measure | Acceptance direction |
|---|---|
| Scope safety | No cross-organization or cross-branch response in test matrix |
| Operational speed | POS and catalog search remain usable on target devices |
| Migration quality | Reconciled totals and zero unreviewed conflicts in committed batch |
| Recovery | Successful isolated restore with audit and file verification |
| Adoption | Role users can find core actions through navigation and shortcuts |
| Governance | Blocked integrations remain visibly blocked until evidence exists |

## 10. Closing

MEDORA offers a credible path from pharmacy operations to a broader healthcare ecosystem while keeping official integrations, legal claims, and regulated mutations governed by evidence. The next step is a controlled discovery workshop and a customer-owned acceptance plan.

## References

1. [MEDORA product description](MEDORA-product-description-ar-en.md)
2. [MEDORA comprehensive audit](comprehensive-platform-audit-2026-08-15.md)
3. [MEDORA IT/admin/owner guide](MEDORA-it-admin-owner-guide-ar-en.md)
