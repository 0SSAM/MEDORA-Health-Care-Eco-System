# pnpm override reference

The official pnpm dependency-resolution documentation states that `overrides` belongs at the project root and supports parent-child selectors separated by `>`; for example, `"qar@1>zoo": "2"`. This is the basis for testing a targeted selector such as `"@esbuild-kit/core-utils@3.3.2>esbuild": "0.28.2"`.

Source: https://pnpm.io/settings/dependency-resolution
Version-specific source: https://pnpm.io/10.x/settings

Observed MEDORA dependency chain before the targeted selector: `drizzle-kit@0.31.10 -> @esbuild-kit/esm-loader@2.6.5 -> @esbuild-kit/core-utils@3.3.2 -> esbuild@0.18.20`, while the direct Vite/build dependency was `esbuild@0.28.2`. The selector must be proven with `pnpm install --lockfile-only`, `pnpm install --frozen-lockfile`, and `pnpm why esbuild --recursive`; do not edit the lockfile manually.
