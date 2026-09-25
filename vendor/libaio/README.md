# Vendored Linux runtime libraries

These shared objects allow the zero-setup embedded MySQL used by MEDORA to run
on Linux systems where `libaio1` / `libnuma1` are not installed system-wide.
They are loaded via `LD_LIBRARY_PATH` at runtime (see
`server/_core/embedded-database.ts`) and are never installed system-wide.

| File | Source | License |
|---|---|---|
| `libaio.so.1.0.1` | Ubuntu 22.04 package `libaio1_0.3.112-13build1_amd64.deb` (launchpad.net/ubuntu/+archive/primary/+files/) | LGPL-2.1 (libaio) |
| `libnuma.so.1.0.0` | Ubuntu 22.04 package `libnuma1_2.0.14-3ubuntu2_amd64.deb` (launchpad.net/ubuntu/+archive/primary/+files/) | LGPL-2.1 (libnuma) |

Both libraries are redistributed unmodified. Their upstream sources are
available from the Ubuntu archive URLs above and from
https://sources.debian.org/. On non-Linux platforms (macOS, Windows) these
files are unused and the embedded database works without them.
