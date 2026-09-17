# Audit Procedures

Detailed reference for the full PR revision audit and the post-deployment vulnerability + performance audit. Read when performing any audit pass.

## Full PR revision audit

1. Build the changed-file list: `git diff --name-status origin/main...HEAD` or `gh pr diff <n> --name-only`. Expect large PRs (100+ files); 22 added / 89 modified / 13 renamed is typical for enrichment PRs.
2. Save context notes before compaction (branch state, commit list, known issues, validation status) — a sandbox reset loses everything not on disk or in GitHub.
3. Chunk the file list (5 chunks of ~25 files) and prepare concatenated audit inputs per chunk; for `pnpm-lock.yaml` extract only diff-relevant regions (new/updated package entries), never the whole file.
4. Audit each chunk for: correctness, brand consistency (MEDORA, env namespaces), secrets hygiene, documentation quality, CI/Docker/test integrity.
5. Consolidate findings into an audit file with a verdict table (issue, severity, resolution, status).
6. Re-run the full local validation gate on the branch.
7. Check remote CI programmatically; distinguish repo-level failures from GitHub platform errors (e.g., "Code Scanning AI" failing with internal 400s — not a code failure).
8. Deliver a bilingual findings report with verdict.

## Post-deployment vulnerability audit

```bash
pnpm audit --prod            # production gate — must be 0 known vulnerabilities
pnpm audit                   # full tree; classify each advisory dev-only vs prod
pnpm why <pkg>               # confirm which packages pull vulnerable versions
grep -rniE '(AKIA|BEGIN PRIVATE KEY|ghp_|github_pat_|long literal passwords)' . \
  --exclude-dir=node_modules --exclude-dir=.git --exclude=pnpm-lock.yaml
grep -rn '\beval(' server/; grep -rn 'child_process' server/
grep -rn 'readFileSync\|writeFileSync' server/ --exclude-dir=test
```

Proven findings from this repo: 3 sweep hits were all synthetic (CI-only showcase password in `ci.yml`, twin in `server/test.setup.ts`, fixture password in `server/domain/internal-auth.test.ts`). No `eval`, `child_process`, or unsafe fs writes in runtime code. Auth middleware (`requireAuth`/`authorize`) covers routers; rate limiting in `server/_core/security.ts`. Known gaps to re-check: no helmet security-headers middleware; expected `OAUTH_SERVER_URL` startup warning when the OAuth connector is not configured — document it.

## Post-deployment performance audit

Baseline figures for this repo (production build on `dist/`, `NODE_ENV=production`):

| Metric | Baseline |
|---|---|
| Build | dist/ ~2.7 MB; server bundle 481 KB; client code-split (vendor-core 460 KB, vendor-documents 330 KB, vendor-react 199 KB, Home 120 KB) |
| Cold boot to `/api/health` | ~13 ms |
| Idle RSS | ~180 MB |
| `/api/health` under load | p50 ~13 ms, p95 ~20 ms, 0 errors (10 workers × 40 req) |
| `/` static HTML | warm ~2.5 ms; cold-render tail p95 ~327 ms |
| Playwright E2E | 3/3 in ~3 s |

Load-test script: `scripts/load_test.py <base_url> [routes]` (10 workers, per-route latency percentiles). Measure with `curl -w`, `ps -o rss=`, and nanosecond `date +%s%N` timers. Report with a severity table and CI status line.

## Remote CI verification

```bash
gh api "repos/OWNER/REPO/actions/workflows/ci.yml/runs?per_page=1" \
  --jq '(.workflow_runs[0].head_sha[0:7]) + " " + .workflow_runs[0].conclusion'
```

If runs are in progress, `sleep 120-240` and retry. If a job failed, fetch job names and conclusions, then annotations or logs for the failing job (`references/merge-and-ci-playbook.md` has the exact queries).
