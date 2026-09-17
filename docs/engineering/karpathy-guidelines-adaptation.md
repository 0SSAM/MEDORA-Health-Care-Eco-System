# Karpathy Guidelines Adaptation for MEDORA

## Decision

The user-provided repository, [multica-ai/andrej-karpathy-skills](https://github.com/multica-ai/andrej-karpathy-skills), contains behavioral guidance for coding agents rather than application modules. MEDORA will use the compatible practices as an engineering decision record and review discipline. It will **not** import the repository as runtime code, a plugin, or an executable dependency.

> “The models make wrong assumptions on your behalf and just run along with them without checking.” — repository README, quoting the source observation [1]

## Selected practices

| Practice | MEDORA adaptation | Verification boundary |
|---|---|---|
| Think before coding | State assumptions, ambiguity, and tradeoffs in acceptance or engineering records before non-trivial changes. | No silent expansion of scope; unclear clinical, legal, or tenant behavior remains blocked until resolved. |
| Simplicity first | Prefer the smallest implementation that satisfies the request and existing contracts. | No speculative feature, abstraction, or data fixture is added merely because it may be useful later. |
| Surgical changes | Change only the files and behavior required by the request or a reproduced defect. | Preserve existing roles, routes, compliance logic, audit behavior, and organization/branch/jurisdiction predicates. |
| Goal-driven execution | Convert each defect or feature into a testable success criterion and run the relevant verification loop. | Focused tests, full regression tests, TypeScript, build, and applicable browser evidence are required before release. |

## MEDORA-specific precedence

The external guidance does not override MEDORA's healthcare controls. The project-specific rules remain authoritative: sensitive procedures use protected authorization; every business operation is scoped by organization, branch, and jurisdiction; clinical and AI recommendations require human review; Demo records must be synthetic and isolated; and failure must be fail-closed. The guidance also does not authorize real clinical data, production transactions, regulatory claims, or credential changes.

No executable code was copied from the repository. The repository's installation instructions for Claude Code and Cursor are not applied to the deployed application because they would add tool-specific behavior rather than improve the MEDORA runtime. The adaptation is intentionally documentation-level and therefore does not require a new dependency, secret, connector, database migration, or API change.

## Success criteria

The adaptation is successful when the project records assumptions before non-trivial changes, keeps changes narrow, adds regression coverage for reproduced defects, documents evidence limits, and completes the existing release checks before checkpointing. These criteria are now reflected in the MEDORA TODO history and acceptance documentation.

## 2026-08-19 ground-up review operating contract

The requested ground-up review applies the four compatible principles to **every review decision**: each finding must cite an observed route, procedure, test, schema rule, visual state, or log; each proposed redesign must state the smallest safe alternative; each code change must trace to a specific finding; and each closure must have reproducible verification. The review is not permission for a blind rewrite. A rebuild is justified only where the existing contract cannot be safely repaired or where evidence demonstrates that a smaller change would preserve a material defect.

For MEDORA, “simplicity” means fewer user decisions and clearer task flows, **not** fewer authorization predicates, scope checks, audit events, human-review gates, or clinical-data controls. “Surgical” means preserving proven tenant boundaries while simplifying the surrounding implementation and experience. This contract continues to exclude executable imports, external plugins, runtime dependencies, synthetic clinical fixtures, or changes to production credentials.

## References

[1]: https://github.com/multica-ai/andrej-karpathy-skills "multica-ai/andrej-karpathy-skills repository and README"
[2]: https://github.com/multica-ai/andrej-karpathy-skills/blob/main/skills/karpathy-guidelines/SKILL.md "Karpathy Guidelines skill file"
