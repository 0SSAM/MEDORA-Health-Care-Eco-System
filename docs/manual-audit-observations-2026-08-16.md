# Manual Audit Observations — 2026-08-16

## Public page

URL: https://3000-i5aov69wzw75qujx7lotd-c01336b4.sg1.medora.local/

The public landing page loaded successfully in the browser. It displayed the bilingual MEDORA title, Arabic-first hero copy, language switcher, secure login link, and the message that access is limited to authorized employee or administrator accounts. No protected operational data was visible before authentication.

The initial desktop screenshot showed a coherent RTL layout with no visible overlap or broken controls. The primary login link and language switcher were visible and interactive.

## Automated checks

The chained test, TypeScript, and production-build steps completed before `pnpm audit` returned a non-zero result. The production-only audit reported no known vulnerabilities. The full audit reported vulnerabilities in development/tooling dependency paths, including the local pnpm package path; these require dependency maintenance rather than an application-runtime vulnerability claim.

## Login failure flow

The login page loaded with employee and administrator entry points, branch/organization authorization language, password privacy wording, and visible rate-limit/session safeguards. A deliberately invalid non-production username and password produced a generic Arabic error message and a retry-after indication without exposing authentication details. No protected workspace was granted.

## Unauthenticated workspace flow

Direct navigation to `/workspace` rendered a safe operational shell with empty-state metrics, explicit “login required” status, disabled/closed external integrations, and no live organizational data. The visible operational cards are informational; attempting the POS card without a session did not open a transaction or expose protected data. This is treated as a safe preview shell, while server-side protected procedures remain the authoritative enforcement point.

## Post-restart visual verification

After dependency and Vite chunking updates, the public landing page initially showed the expected loading state and then completed successfully. The final view rendered the Arabic/English landing experience, secure-login CTA, and privacy/security messaging without a visible error state. No browser console output was observed during the check.

## Full audit final findings

- `pnpm test`: 107 test files passed, 1 skipped; 352 tests passed and 5 skipped because they require an external integration database.
- `pnpm run check`: passed with no TypeScript errors.
- `pnpm run build`: passed after Vite manual chunk refinement; the largest reported client chunk is now below the 500 kB warning threshold for the main shared chunk (`vendor-core` approximately 471.5 kB).
- `pnpm audit --prod`: zero low, moderate, high, or critical findings.
- Development dependency audit still reports moderate/high findings through tooling paths involving Rollup, esbuild, picomatch, and pnpm; these are not present in the production dependency audit and should be addressed through future toolchain upgrades after compatibility testing.
- Manual browser checks covered the public landing page, login route, safe invalid-login behavior, direct protected workspace access without a session, and the post-restart landing page. No protected business data or sensitive action was exposed.
- Git histories are unrelated: the managed project history and the selected GitHub repository have different roots. A destructive force-push or implicit merge into GitHub `main` was not performed. The validated project will be synchronized to a separate GitHub branch to preserve the existing GitHub history.

## Pull Request and staging follow-up — 2026-08-16

A pull request was created at https://github.com/0SSAM/MEDORA-Integrated-Health-System/pull/8 from `medora/full-system-audit-pr-2026-08-16`. GitHub reports the PR as mergeable but blocked with `REVIEW_REQUIRED`; it must not be merged by bypassing the review gate.

The database-dependent integration run was executed safely without substituting the configured application `DATABASE_URL`: 9 tests passed and 5 remained skipped because `TEST_DATABASE_URL` and `TEST_DATABASE_ISOLATED` were not supplied. The five tests require an authorized isolated staging database and use temporary or transactional probes only.

The production dependency audit reported zero vulnerabilities. The full development-inclusive audit reported 14 moderate and 13 high findings, primarily in the local package-manager/toolchain path (`pnpm`) plus transitive development tooling such as `rollup`, `picomatch`, and an `esbuild` path requiring review. No production runtime vulnerability was identified by that audit.
