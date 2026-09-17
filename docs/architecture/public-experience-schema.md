# Public experience schema

The MEDORA public-facing experience is now driven by a reusable schema file:

- Source: `client/src/lib/publicExperienceSchema.ts`
- Primary consumer: `client/src/pages/Welcome.tsx`
- Deployment mirror: `deploy/website-static/index.html`

## Purpose
The schema separates product narrative from component structure so the landing experience can evolve without scattering brand logic through multiple JSX blocks.

## Content domains covered
- brand identity
- hero copy and conversion paths
- trust and governance language
- product-domain feature cards
- experience-model explanation
- bilingual CTA content

## Design rules
1. Keep English and Arabic parity.
2. Preserve explicit governance language such as human review and integration-gated readiness.
3. Do not overstate regulatory or external connector status.
4. Use the schema as the single source for public messaging when building future landing surfaces.

## Why this matters
MEDORA is broad: operations, pharmacy, finance, delivery, compliance, quality, and AI. Without a schema, the landing page tends to drift into duplicated strings and inconsistent claims. With a schema, interface, copy, and deployment artifacts stay aligned.
