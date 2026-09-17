# MEDORA handover

This repository has been prepared locally for a clean `main`-only future state. Changes are **not pushed upstream yet**.

## Current local intent
- Keep one authoritative branch: `main`
- Preserve the refreshed public experience and static website package
- Preserve the API hardening changes (`/demo` hard 404, JSON `/api/health`)
- Hand over push-ready artifacts: repo zip, git bundle, and local patch file

## Recommended branch unification sequence
Run these commands from a writable clone after reviewing the delivered bundle/patch:

```bash
git checkout main
git pull --ff-only origin main

git checkout -B main

git branch -D dependabot/npm_and_yarn/development-dependencies-bb7f6c81ff 2>/dev/null || true
git push origin :dependabot/npm_and_yarn/development-dependencies-bb7f6c81ff || true

git push origin main --force-with-lease
```

## If applying from the delivered git bundle
```bash
git clone https://github.com/0SSAM/MEDORA-Health-Care-Eco-System.git
cd MEDORA-Health-Care-Eco-System

git bundle verify MEDORA-history.bundle
git fetch MEDORA-history.bundle main:medora-recovered-main
git checkout main
git merge --ff-only medora-recovered-main || git merge medora-recovered-main
```

## If applying from the delivered patch
```bash
git clone https://github.com/0SSAM/MEDORA-Health-Care-Eco-System.git
cd MEDORA-Health-Care-Eco-System

git apply MEDORA-redesign.patch
git add .
git commit -m "feat(public-experience): redesign MEDORA landing, docs, and deployment package"
```

## Verification checklist before push
- `pnpm install --frozen-lockfile`
- `pnpm check`
- `pnpm test`
- `pnpm e2e`
- `pnpm build`
- `curl http://127.0.0.1:4180/api/health`
- `curl -I http://127.0.0.1:4180/demo`

## Delivered redesign areas
- `client/src/pages/Welcome.tsx`
- `client/src/lib/publicExperienceSchema.ts`
- `deploy/website-static/`
- `README.md`
- `docs/architecture/public-experience-schema.md`

## Notes
- Upstream deletion of remote branches still requires repository write access.
- The delivered Windows package and static website package are build artifacts, not direct proof of upstream publish.
