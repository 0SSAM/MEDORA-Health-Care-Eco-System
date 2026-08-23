# MEDORA Mobile Assistant and Workspace Incident — 2026-08-23

## User-reported evidence

The user supplied two Android Chrome mobile screenshots and asked for the issues to be fixed. The source screenshots must not be reopened during this task. The relevant observed facts are recorded here for implementation and regression verification.

| Area | Visible defect | Required outcome |
| --- | --- | --- |
| `MEDORA AI` overlay | The composer and Smart Typing area collapse into extremely narrow vertical columns. The send button, suggestion control, and Arabic explanatory text no longer form a readable or touch-friendly mobile layout. | At phone width, preserve a full-width message field, a clearly sized send action, wrapping auxiliary controls, and RTL-readable copy without horizontal clipping or narrow word-by-word columns. |
| Workspace loading | The page displays `تعذر تحميل مساحة العمل الآن. أعد المحاولة أو اختر وحدة أخرى، ولن يتم تنفيذ أي عملية حساسة أثناء فشل التحميل.` with only a page-level reload affordance. The current scope is shown as an unspecified branch with production data. | Keep regulated actions fail-closed, expose an explicit reason-safe local retry that remounts only the failed workspace, and retain a truthful safe state rather than turning a failure into an empty/ready workspace. |

## Safety boundary

This incident concerns presentation and recoverability only. Any retry must preserve server-side organization, branch, jurisdiction, and authorization enforcement. It must not perform a sale, prescription, purchase, permission change, external message, or other regulated mutation.

## Remediation and verification

The assistant composer is now mobile-first: its container and Smart Typing controls have `min-w-0` constraints, the composer stacks as a full-width column below the `sm` breakpoint, and the send action spans the available mobile width before reverting to the compact row layout on larger screens. The overlay drawer now overrides the component's default three-quarter-width/mobile and 384px/tablet constraints, leaving a 1rem viewport gutter on phones and allowing a bounded 34rem drawer on wider screens.

Workspace recovery now remounts only the failed subtree through a retry version in `WorkspaceErrorBoundary`; the assistant overlay and assistant page both receive the boundary's `onRetry` callback. The retry path retains the same organization and branch identifiers, preserves `recordWorkspaceLoadFailure` telemetry, contains no page reload, and continues to show an explicit no-sensitive-actions notice. Development-only component error logging is intentionally local and does not transmit raw error content.

Because an application update combined with a stale client cache can also prevent a lazy UI chunk from loading, the MEDORA AI lazy module now performs at most one local re-import when the user selects the existing retry action. This is a bounded presentation-layer recovery only: it does not widen organization, branch, jurisdiction, or permission scope, does not submit any assistant request, and does not reload the page. It is a defence against a plausible class of stale-chunk failures, **not** a claim that the historical minified React exception had that cause.

| Verification | Result |
| --- | --- |
| Focused assistant/workspace contracts | 10 passing tests |
| Project test suite | 724 passing; 10 intentionally skipped |
| TypeScript and production build | Passed |
| Authenticated 390×844 phone simulation | Composer 297px, send action 297px, no horizontal overflow, Escape closes drawer |
| Authenticated 768×1024 and 1280×720 simulations | Composer 381px, 38px compact send action, no horizontal overflow, Escape closes drawer |

The prior client-render exception was only observable as a minified React recovery (`Ct`) in older logs and was not reproducible with a reliable original stack during this repair. An independent review found only low-confidence candidates, including a lazy-chunk/load failure or a runtime exception in the workspace subtree. It is therefore not attributed to a backend assistant endpoint. The local recovery and bounded re-import paths are verified; any recurrence should be diagnosed from the new development-only boundary log and the existing safe telemetry without exposing sensitive content.

## Supplementary evidence review

The current browser-delivered service worker was reviewed after the role-based acceptance audit. It uses a network-first navigation strategy with an offline fallback only when navigation itself fails, does not cache JavaScript workspace chunks in its application shell, calls `skipWaiting`, and removes named legacy caches during activation. This reduces the likelihood that the **current** service-worker policy alone serves an obsolete workspace chunk. It does not prove what a historical client, network interruption, browser extension, or runtime exception did at the time of the reported error.

The current `WorkspaceErrorBoundary` continues to provide a local subtree remount rather than a full-page reload, while the assistant has its separately bounded lazy re-import retry. The focused contracts for the Home module and service-worker policy passed (**13 tests across 2 files**) on 2026-08-23. No request, response, original stack trace, or reproducible branch-scope failure currently identifies the exact historical source of `failed to load workspace`; the unresolved TODO therefore remains open and must not be represented as a confirmed root cause or a completed production repair.

## Safe local failure categorisation — 2026-08-23

`WorkspaceErrorBoundary` now classifies only two local recovery categories: `lazy_module_load` for recognised browser lazy-module/chunk loading signatures and `subtree_render` for every other render-boundary failure. The category is used only in the existing development-only boundary log; the user-facing fallback remains reason-safe and raw error text, request data, organization identifiers, branch identifiers, jurisdiction identifiers, and server responses are not rendered or transmitted by this change. Retrying resets the category and remounts the same bounded subtree, without changing session authority or scope.

The focused Home contract passed **10/10** after this change. This improves evidence should a new reproducible failure occur, but it does **not** attribute the historical incident to a lazy chunk, an API endpoint, a scope failure, or any other single cause.

## Direct classifier coverage — 2026-08-23

The safe classifier now resides in `client/src/lib/workspaceFailureClassification.ts` and is covered by direct unit tests for recognised browser lazy-module signatures and the generic fallback for unknown or non-`Error` values. It emits only the bounded `lazy_module_load` or `subtree_render` category; it neither retains nor renders source error text. The focused tests passed **14/14**. The complete regression run then passed **240 files / 748 tests**, with **3 files / 10 tests intentionally skipped**; TypeScript and the production build passed. The production build retains its pre-existing large-bundle advisory only.

## Preview-root confirmation — 2026-08-23

After the classifier release, the unauthenticated preview root completed normally to the MEDORA landing page and presented the secured sign-in route. The prior checkpoint thumbnail showing a transient loading label therefore does not reproduce a route or access failure. No workspace request, protected workflow, or mutation was run during this read-only check.
