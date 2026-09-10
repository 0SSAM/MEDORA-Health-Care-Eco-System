# UI UX Pro Max package — inspection & adopted patterns

Source: `ui-ux-pro-max-skill-main.zip` (user attachment, 664 files / 23 MB). It is a **UI/UX design-intelligence skill**, not a customer-care system.

## Inventory (deep)
- `.claude/skills/`: design-system, brand, design, slides, ui-styling, banner-design, ui-ux-pro-max (each SKILL.md + references: token architecture, typography, 79 searchable UI styles, 192 reasoning rules).
- `gallery/`: Next.js showcase — ColorPalette, FilterBar, StyleCard, StyleDetailModal, PhoneMockup, MetadataBadges, UIControlsShowcase, SearchInput, InteractiveChecklist.
- `cli/`: install/update/uninstall commands (Node); `data/`: google-fonts.csv, phosphor-icons-upstream.json, font licenses.
- `projects/healthcare-dashboard/`: a single `index.html` (not a module).

## What Medora adopts (documented, non-invasive)
1. **Three-layer token architecture** (primitive → semantic → component) to be applied when styling the comms center UI.
2. **Component-state discipline** (empty/loading/error/success states; metadata badges; searchable filter bars) as the spec for the future customer-care & call-centre UI shells.
3. **Font & icon catalogues** (WorkSans/IBMPlexSerif pairs, Phosphor icons, Google Fonts CSV) referenced for Arabic-UI-compatible pairing.

Nothing from the package is runtime code Medora needs; the value is design-system guidance for the next UI pass.
