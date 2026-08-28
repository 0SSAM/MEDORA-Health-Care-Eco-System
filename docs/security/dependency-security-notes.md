# Dependency Security Notes

## esbuild development-server advisory

GitHub Security Advisory **GHSA-67mh-4wv8-2f99** documents that esbuild versions **0.24.2 and earlier** could allow an arbitrary website to send requests to a local development server and read its response through default CORS behaviour. The advisory states that the issue is patched in **esbuild 0.25.0 and later**.[^1]

MEDORA keeps this note as release evidence for the Dependabot alert remediation. The remediation requirement is that every resolved `esbuild` instance in the lockfile must be at least `0.25.0`; the project policy pins the current approved maintenance release instead of relying on a vulnerable nested tool dependency.

[^1]: GitHub Security Advisory, [GHSA-67mh-4wv8-2f99](https://github.com/evanw/esbuild/security/advisories/GHSA-67mh-4wv8-2f99), accessed 2026-08-20.
