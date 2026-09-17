# Contributing — المساهمة

MEDORA is free & open source (MIT). Contributions are welcome on the single default branch (`main`) — we do **not** use feature branches.

1. Fork the repo, clone, `npm ci`, copy `.env.example` → `.env`, run `npm run db:push`.
2. Make changes on your fork, then open a PR into `main`.
3. Keep TS strict-clean: `npx tsc --noEmit` must pass. Add/adjust contract tests in `server/*.contract.test.ts` where the existing pattern applies.
4. Keep Arabic-first UX (RTL) for every user-facing string.
5. Do not add PHI to Google Sheets; keep exports de-identified.

## Areas that need help
- Offline-first sync & conflict resolution (see backup/sync audit).
- Settlement (`التحصيل`) reporting for insurance claims.
- PWA/APK/IPA packaging shells (Capacitor/Tauri/Electron) — build targets doc included.
- More Egyptian benchmark data for GP MAX audit.
