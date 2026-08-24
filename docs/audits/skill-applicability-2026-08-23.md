# MEDORA | ميدورا — Skill Applicability Register

**Date / التاريخ:** 2026-08-23
**Scope / النطاق:** Full revision, security remediation, validation, and protected GitHub synchronization.

> **Decision / القرار:** A skill is a reviewed operating method, not application code to import wholesale. MEDORA applies a skill only when its prerequisites, security boundary, and output match an evidenced project need. This preserves tenant isolation, regulated-workflow controls, and reproducible delivery.

| Skill / المهارة | Status / الحالة | Applied scope / نطاق التطبيق | Safety boundary / حد الأمان |
|---|---|---|---|
| `medora-repo-ops` | Applied | Integration branch, source-only overlay, PR-only GitHub workflow, CI log review | No direct `main` push, force push, merge, or protection bypass |
| `secure-healthcare-platform-delivery` | Applied | Security review, CodeQL remediation, tenant/session and showcase safeguards | No scope broadening, production data, external provider action, or regulated mutation |
| `webdev-readme-fullstack` | Applied | React/tRPC/Vitest architecture, validation and managed-service conventions | No framework-core or secret modification without an evidenced need |
| `automation-and-scheduling` | Evaluated; not activated | No new recurring job, webhook, or background-process requirement was found in this review | Do not introduce automation infrastructure merely because a skill exists |
| `persistent-computing` | Evaluated; not activated | Local E2E reused the active service under sandbox memory limits | No persistent VM/Docker/service migration without a hard deployment requirement |
| `webdev-custom-dockerfile` | Excluded | No production system binary or alternate runtime requirement was evidenced | No Dockerfile is added |
| Media, slides, SEO, finance, commerce, and unrelated skills | Excluded | Outside the current CI/security/GitHub synchronization objective | Not imported into the healthcare runtime or repository |

## Applied outcomes / النتائج المطبقة

The applied methods produced a source-only, reviewable GitHub delta; a protected pull request; reproducible TypeScript, Vitest, build, smoke, dependency-audit, and public E2E gates; and focused remediation of high-severity CodeQL findings. The changes preserve server-enforced organization, branch, jurisdiction, session, and Test/showcase boundaries.

## Deferred capabilities / القدرات المؤجلة

Scheduling, persistent infrastructure, and external adapter operations remain deferred because their required approvals, production integration evidence, or operational need are not part of this request. They can be evaluated separately when a concrete requirement is authorized.
