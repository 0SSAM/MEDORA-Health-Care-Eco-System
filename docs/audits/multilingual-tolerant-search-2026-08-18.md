# MEDORA Multilingual Tolerant Smart Search — 2026-08-18

## Purpose and supported interface languages

This update improves **discovery only** in MEDORA's workspace smart search. It applies to the interface languages currently supported by the product: **Arabic and English**. It does not claim universal transliteration or linguistic correction for languages that the product does not currently present.

The input normalizer applies Unicode NFKC normalization, removes Arabic diacritics, normalizes common Arabic letter variants, lower-cases Latin text, and collapses punctuation and repeated whitespace. It also produces a bounded candidate for the Arabic/English keyboard layout mismatch commonly caused by typing while the opposite layout is active.

## Match order and user-facing behavior

| Rank | Match type | Rule | Purpose |
|---:|---|---|---|
| 1 | Exact | A whole normalized query equals the searchable text or one of its tokens. | Preserves the most intentional match. |
| 2 | Prefix | A searchable token begins with the normalized query. | Supports incomplete word entry. |
| 3 | Contains | The normalized phrase contains the normalized query. | Supports entry fragments in the middle of a label or alias. |
| 4 | Tolerant | Token-level bounded edit distance: one edit for 4–8 characters and two edits for 9+ characters. | Handles minor typing mistakes without broad fuzzy retrieval. |

Direct-layout matches receive a small deterministic priority over the keyboard-layout alternative at the same match quality. The system deliberately does not apply tolerant matching to queries shorter than four characters, avoiding broad or surprising result sets.

## Security and scope boundaries

> Smart search only ranks the caller-provided, already authorized action list. It does not fetch additional routes, records, permissions, organizations, branches, or jurisdictions.

The page continues to filter modules and actions by the existing role-aware catalogue before it calls the search helper. Search aliases—including the Arabic customer-follow-up aliases—are attached to the permitted operations/CRM entry only. The change does not alter authentication, authorization, API procedures, database queries, or tenant-scoping logic.

## Inline result dropdown and interaction contract

The page now renders up to eight ranked results in a localized dropdown visually anchored below the workspace search field. The dropdown is hidden when the query is blank and remains a presentation of the already filtered `allowedModules` catalogue; it is **not** an additional navigation source. A defensive authorization check is also repeated immediately before the selected result is activated.

| Interaction | Result |
|---|---|
| Typing a non-empty query | Opens the dropdown and announces the count of permitted results through a live region. |
| Exact, prefix, contains, or tolerant result | Shows the module name, searchable context, and a localized badge explaining the match quality. |
| Keyboard-layout recovery | Shows the same permitted result with a visually distinct **keyboard corrected** badge. |
| Arrow Down / Arrow Up | Moves the active option through the visible results, wrapping at each end. |
| Enter | Activates the selected result, clears the query, closes the dropdown, and takes the user to the permitted workspace. |
| Escape, focus leaving the field/list, or pointer interaction outside the field/list | Closes the dropdown without changing the selected workspace. |

The input receives the listbox relationship and active-option state while the dropdown is open. Positioning follows the rendered input in both RTL and LTR layouts and recalculates on viewport resize and scrolling.

## Regression coverage

The automated suite covers Arabic and English exact/prefix/contains queries, bounded English and Arabic character mistakes, keyboard-layout recovery in both directions, deterministic rank ordering, and the actual Home-page alias registration for **«متابعة العملاء»**. The additional Home dropdown regression test verifies the visible listbox contract, blank-query suppression, keyboard selection and dismissal, correction badges, and the preservation of the permitted-module-only search source. Focused tests passed before the full verification run.

## Acceptance checks

1. Search an accessible module using its Arabic or English full label.
2. Search with the beginning of a label, a middle fragment, and one minor typing error; confirm that the intended permitted action remains ranked first.
3. Enter a known Arabic/English layout-mismatch form; confirm that a keyboard-layout correction is used only when it yields a permitted candidate.
4. Search a short or unrelated fragment; confirm that search remains conservative and does not expose unlisted actions.
5. Repeat after language switching; labels and the action catalogue remain controlled by the active role and scope.
6. With a permitted result visible, use Arrow Down or Arrow Up and then Enter; verify the intended module opens and the query clears.
7. Press Escape, or tap/click outside the search control and its dropdown; verify the list closes without navigation.
