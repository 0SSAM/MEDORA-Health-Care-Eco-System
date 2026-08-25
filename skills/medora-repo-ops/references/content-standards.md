# Content and Documentation Standards

Detailed reference for bilingual content, README/docs conventions, investor presentation, and legal/security hardening. Read when creating or editing repository content.

## Bilingual (Arabic/English) content rules

Every user-facing document must be fully bilingual, structured as English sections followed by Arabic equivalents (or side-by-side per section). Arabic must be full sentences, not machine glosses of English. Section headers carry the Arabic translation, e.g. `## 1. Executive summary | الملخص التنفيذي`. Use the branding **MEDORA | ميدورا** everywhere; never reintroduce "MEDORA" branding. Legacy `MEDORA_*` env names and old service-worker cache names are historical and deliberately preserved — do not touch them again.

## Repository enrichment pack (apply on every enrichment pass)

The proven enrichment set: bilingual `README.md` (value proposition, product-promise table, architecture, quick-start, statistics), `CONTRIBUTING.md` (branch workflow, testing, security, RTL/i18n requirements), `SECURITY.md` (disclosure, supported versions, security model, incident response), `.github/PULL_REQUEST_TEMPLATE.md`, repository description, ~20 topics (healthcare, ERP, pharmacy, POS, Arabic, RTL, ...), homepage URL. Update README badges and clone URLs to the current repository slug so they survive renames.

## Repository metadata after rename

When GitHub renames the repo (e.g., `MEDORA-Integrated-Health-System` → `MEDORA-Health-Care-Eco-System`), both slugs work with `gh` CLI via redirect. Forward-proof by updating README badges (`gh-actions`/`code-size` badges use the repo slug), clone URLs, Dockerfile `LABEL org.opencontainers.image.source`, and demo badges to the new slug. Sweep with `grep -rni 'medora\|MEDORA\|MEDORA_' . --exclude-dir=node_modules --exclude-dir=.git --exclude=pnpm-lock.yaml`.

## Copyright and legal hardening pack

1. Inject a bilingual header into every `client/` and `server/` TS/TSX file (ownership, proprietary status, no unauthorized copying/reverse engineering, repo URL). Commit as one `chore` commit.
2. Add `LICENSE` (all-rights-reserved, bilingual).
3. `package.json`: `"license": "SEE LICENSE IN LICENSE"` + `"private": true` + `"copyright"` field.
4. SECURITY.md hardening: Supported Versions table; four-layer defense-in-depth Security Model (TLS/HSTS at the edge, server-side authz middleware, tenant-scoped parameterized queries, audit hash chains, non-root containers, fail-closed boundaries); Incident Response procedure (isolate → preserve evidence → rotate credentials → private notification).
5. `.gitignore` must cover `test-results/`, `dist/`, `node_modules/`, secrets.

## Investor presentation pack

Create a bilingual (Arabic/English) investor deck in `medora-investor-presentation/` (HTML slides, ~10 pages) plus `medora_investor_deck.md` outline. Keep it inside the repo so it ships with the codebase. Slides cover: thesis, problem, solution/product, market, traction/statistics, architecture, business model, roadmap, team/ask.

## Docs folder conventions

`docs/` holds bilingual guides: deployment (`docker-nginx-production-ar-en.md`), testing strategy (`testing-strategy-rtl-localization-ar-en.md`), delivery index (`MEDORA-delivery-index.md`). When replacing a legacy doc, delete the old file and add the bilingual successor rather than renaming in place when the content changes substantially. Keep internal links using relative paths.

## Content sweep checklist before delivery

- No stale MEDORA references in badges, labels, manifest, index.html.
- No merge markers (`<<<<<<<`).
- No secrets; only documented synthetic CI/test placeholders.
- README quick-start instructions work against current main.
- All docs reference the current repo slug and branch.
