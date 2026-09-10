# MEDORA Source Integrity and Release Evidence

## Purpose and scope

This release-evidence record complements the proprietary `LICENSE`, `NOTICE`, Git history, checkpoint history, and owner-held archives. The checked-in integrity manifest records SHA-256 values for the selected ownership, protection, scope, migration, and policy files that comprise the MEDORA content-protection surface.

> A matching digest demonstrates only that the selected file bytes match this recorded manifest. It does **not** establish copyright ownership, trademark ownership, legal registration, authorship, or an enforceable licence on its own.

## Reproducible verification

Run the focused contract from the repository root:

```bash
pnpm vitest run server/source-integrity.contract.test.ts
```

The contract reads `docs/security/source-integrity-manifest.json`, computes SHA-256 for every listed relative path, rejects path traversal and symlinks, and fails when any digest differs. It does not inspect, send, or store production records, credentials, clinical data, clipboard data, or device identifiers.

## Release-evidence set

| Evidence | Custody and verification role | Explicit limit |
| --- | --- | --- |
| Proprietary `LICENSE` and `NOTICE` | State the intended reservation of rights in the repository. | They are not a legal registration. |
| Source-integrity manifest and contract | Detect byte-level divergence in the selected release surface. | It covers only the listed files and must be refreshed deliberately after an approved change. |
| Managed checkpoint and deployment version | Preserve a restorable deployed source state. | A checkpoint is not an independent legal escrow service. |
| Owner-held source archive and Git history | Preserve provenance outside the running application. | Retention, access control, and legal preservation are owner responsibilities. |
| Test, type, build, and acceptance records | Demonstrate engineering verification of a specific release. | They do not validate legal title or physical-device behavior not actually tested. |

## Controlled update procedure

When an approved change affects a listed file, regenerate its SHA-256 value, update the manifest in the same review, run the focused integrity contract plus the full verification suite, and save a new checkpoint. Do not replace a digest to conceal an unexplained change. Preserve the preceding checkpoint, release result, and the owner-held archive.

The native-control plan and physical-device acceptance matrix are maintained separately in `docs/security/native-device-protection-research.md`. Their completion requires a signed wrapper build and device evidence; browser checks are not substituted for those records.
