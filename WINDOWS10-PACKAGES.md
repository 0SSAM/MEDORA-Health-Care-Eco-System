# MEDORA Windows 10 Packages

This repository builds three Windows 10 x64 distribution formats from the MEDORA application:

1. **Installer EXE** — NSIS installer with desktop/start-menu shortcuts.
2. **Portable EXE** — standalone Electron portable executable; no installation required.
3. **CMD package** — self-contained ZIP containing the Windows launcher, production MEDORA build, bundled Node.js runtime, bundled MariaDB runtime, migrations, and production dependencies.

## System manager

Fresh desktop databases are provisioned with exactly one initial system-manager account:

- Username: `admin`
- Password: `admin`
- Role: `admin`
- Demo user: **not created**

The bootstrap credential is a one-time desktop initialization exception. Normal password changes use the application's password policy.

Existing desktop installations are not reset on every launch.

## Package behavior

All local desktop database traffic is bound to `127.0.0.1`. The Windows package does not require a separately installed Node.js or MariaDB runtime.

The build workflow is:

`.github/workflows/windows-medora-packages.yml`

Application packaging configuration:

`medora-2/medora/electron-builder.yml`

Electron desktop bootstrap:

`medora-2/medora/electron/main.cjs`

System-manager provisioning:

`medora-2/medora/electron/provision-admin.cjs`

CMD launcher:

`medora-2/medora/MEDORA-START-WINDOWS10.cmd`

## Important

EXE and CMD distribution binaries are generated as GitHub Actions artifacts rather than committed to Git. This avoids placing large generated Windows binaries in the source repository.

A package is considered deliverable only after its Windows workflow completes successfully and the resulting artifact has been verified by the workflow.
