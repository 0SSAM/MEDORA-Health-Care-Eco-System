# MEDORA assistant role acceptance and release evidence

## Live showcase smoke

The managed showcase identities were tested against the local MEDORA server using the existing controlled password secret. No user, patient, prescription, inventory, purchase, or financial fixture was created.

| Role | Username | Organization | Branch | Jurisdiction | Login/session | Assistant mutation outcome |
|---|---|---:|---:|---:|---|---|
| Manager | `test` | 1 | 1 | 1 | Passed; showcase session | HTTP 403 simulation-only guard; no persistence |
| Pharmacist | `pharmacist.demo` | 1 | 1 | 1 | Passed; showcase session | HTTP 403 simulation-only guard; no persistence |
| Cashier | `cashier.demo` | 1 | 1 | 1 | Passed; showcase session | HTTP 403 simulation-only guard; no persistence |

The assistant role contract also passed with `SHOWCASE_LOGIN_SMOKE=1`: all three identities authenticated, returned the expected open ID and role, and produced a showcase session. The source-level contract confirms that the assistant surface is limited to the intended employee roles and that the bilingual advisory boundary and mandatory human-review wording remain present.

The `403 simulation-only` result is intentional for showcase accounts. It proves that a demo identity cannot persist assistant chat or trigger an operational mutation. It does not claim that a showcase account can exercise production LLM persistence. Production assistant execution remains advisory-only and human-reviewed.

## Release-build evidence

- `pnpm install --frozen-lockfile`: passed.
- `pnpm check`: passed.
- `pnpm build`: passed.
- Full Vitest suite: 228 files passed, 696 tests passed, 3 files and 10 tests intentionally skipped.
- The deployment failure was `ERR_PNPM_LOCKFILE_CONFIG_MISMATCH`; the duplicate esbuild workspace override was removed because the direct `esbuild` dev dependency is already pinned to `^0.28.2`, while the remaining workspace overrides are preserved. The lockfile was regenerated and frozen installation passed locally.

## Safety boundaries

The test uses only scoped authentication metadata and a non-clinical operational question. It never logs passwords, cookies, prompt content, patient data, device fingerprints, or audit payload content. Organization, branch, and jurisdiction isolation remains enforced, and legal jurisdiction `0` remains a valid value wherever scope is handled.
