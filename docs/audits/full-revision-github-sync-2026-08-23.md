# MEDORA Full Revision and GitHub Resynchronization Record — 2026-08-23

## Scope and safety boundary

This record covers the owner-requested full review of the active MEDORA web project and a protected GitHub resynchronization. It does not authorize force pushes, history rewrites, copying production data, relaxing tenant or jurisdiction isolation, changing protected-branch settings, or treating a public repository clone as a deployment source.

## Initial repository evidence

| Evidence | Local active project | Fresh GitHub clone |
| --- | --- | --- |
| Repository path | `/home/ubuntu/ألدورا-|-منظومة-الرعاية-الصحية-المتكاملة` | `/home/ubuntu/medora-github-sync` |
| Branch | `main` | `main` |
| Observed HEAD | `36cef8c` — Dependabot access-boundary clarification | `9ae4286` — merged esbuild remediation PR #20 |
| Working-tree state at review start | Only the new revision/synchronization TODO entry was uncommitted | Fresh shallow clone |
| Sync conclusion | The active project contains later internal checkpoints/documentation and must be compared deliberately before any GitHub update. No pull, merge, rebase, force push, or remote mutation has been performed. |

## Initial findings

The active project has later audited application changes and checkpoint records than the fresh GitHub clone. This is a divergence to reconcile through a reviewed, test-validated commit path—not evidence that either side should overwrite the other. The GitHub clone exposes repository governance files and historical artifacts absent from the active project’s top-level listing, while the active project includes current build output and managed sandbox metadata that must not be synchronized blindly.

## Phase-one health and governance findings

| Area | Evidence | Finding | Disposition |
| --- | --- | --- |
| Working tree | `git status --short` | Only the current review tracker and audit record were uncommitted before review changes. | Preserved; no rollback or remote rewrite. |
| Repository topology | Active `origin` is a managed artifact remote; a separate shallow GitHub clone was prepared at `9ae4286`. | Repointing the managed remote would be unsafe and unnecessary. | Keep the remotes separate; use the GitHub clone only for the protected integration path. |
| Source hygiene | Tracked-file scan found no tracked secret-shaped filenames and no merge-marker content. | No reproducible source-hygiene defect was found. | Verify again during the final gate. |
| Production dependencies | `pnpm audit --prod --audit-level=high` returned `No known vulnerabilities found`. | No production dependency remediation was required. | Preserve the independent, permission-gated Dependabot-dashboard limitation. |
| CI identity and security | The active workflow and smoke script emitted ALDORA labels, used the legacy CI database name, and contained deterministic CI-only signing/showcase values. | This was a reproducible governance and identity gap, not an application authorization change. | Corrected with MEDORA labels, run-scoped random values, and `medora_ci` naming. |
| CI lifecycle gate | A fail-closed `server/integration/test-database-lifecycle.test.ts` contract already existed but was not a dedicated MySQL-service CI job. | The protected GitHub baseline contains an isolated MySQL job; the active workflow needed the same bounded gate. | Added the service-backed job, scoped only to `medora_ci` and `TEST_DATABASE_ISOLATED=true`. |
| Public repository identity | `README.md` cloned the retired ALDORA slug and `.github/CODEOWNERS` used the old public product name. | The canonical repository is MEDORA, while the managed preview URL still has a legacy subdomain. | Corrected the clone path and governance label; retained the working deployment URL and legacy internal references deliberately. |

## Focused verification after governance edits

`pnpm exec prettier --check .github/workflows`, `bash -n scripts/ci-smoke.sh`, and a package-metadata assertion passed. The database lifecycle contract passed in its default fail-closed local mode (`1 passed`, with two external-MySQL cases intentionally skipped because `TEST_DATABASE_URL` and `TEST_DATABASE_ISOLATED=true` were not supplied). The actual service-backed lifecycle path is confined to GitHub Actions’ ephemeral MySQL service and will be checked by that CI job after the protected pull request is opened.

## Runtime-warning remediation

The desktop loading review surfaced Express’s `res.clearCookie` deprecation warning: passing `maxAge` to a clear operation is no longer necessary because Express expires the cookie automatically. The only affected calls were the OAuth-cookie clear performed at internal login, the internal-session logout, and the external-session logout. Each now passes the same secure cookie options (`httpOnly`, `sameSite`, `secure`, and `path`) without `maxAge`; session issuance, session revocation, role scope, showcase policy, and tenant/jurisdiction evaluation were not changed.

Focused regression verification passed: `server/auth.logout.test.ts` and `server/internal-logout.test.ts` passed three assertions, TypeScript passed, and the tracked source has no remaining `clearCookie(...maxAge...)` call. A fresh full validation follows this targeted repair.

## Complete validation record

The final local gate completed successfully after the runtime-warning remediation. `pnpm install --frozen-lockfile` completed without lockfile change; `pnpm check` passed; `pnpm test` passed with **240 files / 748 tests**, with **3 files / 10 tests intentionally skipped** where live credentials, an isolated external database, or device/provider access is required; `pnpm build` passed; `scripts/ci-smoke.sh` passed; and `pnpm audit --prod --audit-level=high` reported no known production vulnerabilities. The build continues to emit the pre-existing non-blocking advisory for chunks above 500 kB; no bundle-splitting change was introduced in this constrained governance review.

The unauthenticated MEDORA landing route loaded normally at desktop and 390 px mobile widths. The retained server log records the old `clearCookie` warning at `2026-08-23T15:45:04.292Z`, before the correction; subsequent page review recorded only expected missing-session messages and no new occurrence. The install prompt shown by the landing page is the existing PWA affordance, not a test result or authorization change.

The following limits remain intentionally open and are not defects closed by this review: Pika requires an authenticated account and visible credits; the Dependabot-alert API remains permission-gated with HTTP 403; the historical workspace-load failure has no original reproducible trace; and the public Manus replay exposes no verified project/diff identity. No regulated external submission, provider activation, production-like data creation, or privileged showcase mutation was performed.

## GitHub synchronization hygiene

The source-only overlay for the protected GitHub integration branch contains application source, automated tests, human-readable documentation, configuration, and the lockfile. It explicitly excludes environment files, secrets, runtime metadata, dependency directories, builds, local logs, test output, media, and binary office artifacts. GitHub-only governance and historical reference files are preserved rather than bulk-deleted.

The pre-commit scan found no private-key or access-token signature and no forbidden tracked artifact. It did surface one literal demonstration password inside a negative source-contract regex. That literal was removed from `server/global-scope.contract.test.ts`; the test still proves production workspaces do not derive authority from `SHOWCASE_TEST_PASSWORD` or a Test username, and the focused contract passed **3/3**. The synchronization branch carries no literal instance of that password.

## Public E2E gate

The GitHub baseline included public Playwright specifications but did not declare the `@playwright/test` runner or install a browser in CI, so `playwright test` could not execute. The project now declares `@playwright/test@1.62.0`, an `e2e` package script, a Chromium install step in the existing CI workflow, and a single public E2E step after the build gate. The coverage is deliberately restricted to the unauthenticated Welcome surface: Arabic/English selection, `rtl`/`ltr` direction, language persistence, and stable RTL geometry. It does not use a test account, call a protected API, or execute a write.

On the constrained local sandbox, the initial standalone Playwright server competed with the running development service and exited under memory pressure. The configuration now accepts `PLAYWRIGHT_BASE_URL` so local validation reuses the already-running service; the CI path remains isolated and starts its own production server. After the adjustment, all three public E2E checks passed in **3.7 seconds**. The test assertions were aligned to the current visible Welcome branding (`MEDORA | منظومة الرعاية الصحية المتكاملة` / `MEDORA | Health Care Eco System`) rather than an outdated non-rendered localization string.

## Integration-branch validation

The reviewed source-only overlay was validated again inside the GitHub integration working tree after the E2E change. `pnpm install --frozen-lockfile`, `pnpm check`, the complete Vitest suite, `pnpm build`, `scripts/ci-smoke.sh`, the three public Chromium E2E checks, and `pnpm audit --prod --audit-level=high` all passed. The local E2E command reused only the already-running MEDORA service using `PLAYWRIGHT_BASE_URL`; no account, protected endpoint, regulated write, external adapter, or production database was used. The dedicated CI database job remains intentionally pending the protected GitHub Actions run and retains its explicit disposable-service and safety-flag gate.

## Protected-CI regression follow-up

The initial GitHub Actions run on PR #23 correctly exercised GitHub-only legacy contracts that were not present in the active source-only overlay. It failed without reaching a product behaviour defect because: the ownership identity contract assumed an English-only title while the configured title is the approved Arabic MEDORA title; the Operations component contract expected a removed `section` API rather than the current `focus` API; and the GitHub tree had a newer `LICENSE` than the local source-integrity manifest while omitting the existing local `NOTICE` file.

The correction preserves and strengthens the intended controls. The identity test now permits exactly the approved English or Arabic product title and continues rejecting contact data. The Operations test now verifies the actual allowed focus values (`people`, `procurement`, `crm`), persistence of a supplied focus, bilingual scoped titles, and the absence of the retired always-on dashboard. The verified proprietary `LICENSE` and bilingual `NOTICE` are layered together so the IP and integrity contracts agree. Focused verification in the integration tree passed **4 files / 10 tests**; a complete integration-tree validation and a new protected CI run remain required before merge review.

## Final CI artifact alignment

The subsequent integration-tree gate surfaced three remaining GitHub-only artifact mismatches. The provider-free branding contract expected MEDORA labels while the active debug collector still exposed the legacy ALDO label; the native-wrapper contract was present but its three reference adapters had been omitted from the source overlay; and the showcase-secret unit test attempted a live request to an unstarted local server. These were test and reference-asset delivery defects, not regulated workflow defects.

The collector now presents **MEDORA** in its visible diagnostics while retaining its existing data-minimisation logic. The Android, iOS, and HarmonyOS reference adapters are included as reference material only; the release gate still states that web delivery is not native activation evidence. The showcase-secret test now verifies that a supplied secret is non-trivial without issuing a network call; internal login behaviour remains tested by the authenticated server contracts. Focused verification of the three affected suites passed **3 files / 7 tests** with a transient environment-only value. The full integration-tree gate and a fresh protected CI run are the remaining validation steps.

## Final integration gate and brand-contract closure

The final GitHub integration-tree validation passed with CI-equivalent, transient configuration values. `pnpm test` passed **241 files / 750 tests**, with **3 files / 10 tests intentionally skipped** for credential-, provider-, device-, or isolated-database-bound paths. Production audit reported no known vulnerabilities; the production build completed with only the existing non-blocking large-chunk advisory; the smoke check passed; and all three unauthenticated Chromium E2E checks passed in **3.2 seconds**.

The last local failure was configuration-only: a deliberately invalid temporary logo value did not satisfy the existing `/manus-storage/` logo contract. Re-running with the same valid managed-logo path shape used by CI passed, so no product or authorization code was weakened. The final source alignment permits either approved MEDORA title (Arabic or English), restores the reviewed display-only shared brand module, and makes the PWA manifest reference the same managed MEDORA mark.

## Portable-contract closure and final re-gate

The first post-fix GitHub run showed that three brand contracts still embedded the sandbox-specific `/home/ubuntu/ألدورا-|-منظومة-الرعاية-الصحية-المتكاملة` path, which cannot exist on a GitHub runner. The tests now resolve repository files relative to their own modules. The Vitest default logo was also changed from an old ALDORA placeholder to the approved managed MEDORA mark, matching the CI environment. This preserves the assertions while removing both the workspace-path dependency and legacy visible branding.

The full protected-branch gate then passed again from the integration working tree: frozen install, `pnpm check`, **241 files / 750 Vitest tests passed** with **3 files / 10 intentional skips**, production build, smoke check, three unauthenticated Chromium E2E tests in **3.7 seconds**, and the production dependency audit with no known vulnerabilities. The build-size advisory remains non-blocking. This validation used no real account, protected mutation, regulated submission, provider activation, production database, or external secret. The integration branch is ready for a normal PR-only update; final GitHub Actions confirmation remains required, and no merge or branch-protection bypass is authorized.

## CodeQL high-severity remediation

GitHub CodeQL surfaced four high-severity alerts on the integration branch: direct interpretation of dynamic HTML in the POS and tax-invoice print flows, and missing rate-limit coverage for two authorization-handler paths. The print flows now use a small shared document-builder that creates elements and assigns user-controlled values only through text-node APIs; it does not call `innerHTML`, `document.write`, `insertAdjacentHTML`, or string-to-DOM parsers. POS receipt and tax invoice content, quantities, and totals are therefore rendered as text rather than executable markup.

The existing bounded rate limiter is now applied before the OAuth handler accepts both `GET` and mutation requests, with denial occurring before authorization work. This does not change token validation, cookie scope, organisation/branch/jurisdiction scope, showcase policy, or any regulated mutation. Focused verification passed: TypeScript plus the DOM-print and rate-limit contracts. Source scans found no remaining risky HTML-interpreter pattern in either workspace and confirmed rate-limit coverage of the authorization handler. A fresh full integration gate and GitHub Actions/CodeQL confirmation remain required; no alert was dismissed, suppressed, or bypassed.

## Successor CodeQL branch after PR #23
GitHub reports PR #23 as merged, but the current `origin/main` subsequently resolves to commit `3bbd7ab` with a different ancestry from the old integration tip. This is a repository-state observation, not permission to rewrite history or revive the merged branch. A fresh branch, `manus/codeql-print-rate-limit`, was created directly from the current `origin/main`; no direct push to `main`, force push, branch-protection change, or merge was performed.

The current main tree no longer has the former standalone POS workspace, so the successor applies only the still-reproducible tax-invoice print finding and the OAuth callback rate-limit finding. Tax-invoice printing now constructs its local popup with DOM elements and `textContent` through a shared helper; the existing local-only export guard, organization/branch/jurisdiction-scoped invoice calls, and ETA fail-closed notice are unchanged. The rate limiter now classifies `/api/oauth/callback` as an authentication route before the GET/mutation distinction, preserving origin, token, cookie, and authorization behaviour.

Focused successor verification passed on 2026-08-24: `pnpm check` and `pnpm vitest run server/print-dom-security.contract.test.ts server/_core/security.test.ts`, reporting **2 files / 6 tests**. Source scans confirm the tax-invoice workspace contains no `document.write` or `.innerHTML =` assignment, and the security test asserts the OAuth GET callback receives the authentication limit. A complete isolated integration gate and GitHub Actions/CodeQL confirmation remain required. No alert has been dismissed, suppressed, or represented as closed pending that independent confirmation.

## Successor full validation — 2026-08-24

The fresh successor branch completed its local source-only gate. `pnpm install --frozen-lockfile`, `pnpm check`, and `pnpm build` passed. The complete Vitest suite passed **121 files / 386 tests**, with **3 files / 9 tests intentionally skipped** only for live credentials, an isolated database, or an external device/provider boundary. `scripts/ci-smoke.sh` passed. The production dependency audit (`pnpm audit --prod --audit-level=high`) reported **No known vulnerabilities found**.

The public Chromium suite also passed **5 tests**, with **1 intentional environment-gated login test skip**. Its first run exposed stale assertions for the owner-approved bilingual identity now rendered by current `main`; the tests were aligned to the actual accessible Arabic and English MEDORA labels while retaining checks for Arabic/English selection, RTL/LTR direction, persistence, RTL layout geometry, and showcase-login feedback. The correction did not alter authentication, tenant scope, regulated workflows, or any external adapter. Generated `test-results/` and `playwright-report/` artifacts remain excluded from the source delta.

These local outcomes validate the successor implementation, not a GitHub CodeQL disposition. GitHub Actions and CodeQL remain the independent authority for alert closure; no alert was dismissed, suppressed, or bypassed.

## Next review steps
1. Scan the staged source-only delta for secrets, generated output, and merge markers, then commit the validated successor.
2. Push only the successor branch, and open a bilingual pull request targeting `main` without merging it.
3. Await the required GitHub Actions and CodeQL outcomes; do not merge, force-push, rewrite history, alter branch protection, or transfer the managed internal remote.
