# Assistant production test observations

- Date: 2026-08-20.
- Target: published MEDORA workspace.
- Login path: `/login`.
- Test account supplied by the user: `test` (password intentionally omitted from this record).
- Result so far: employee login accepted and redirected to `/workspace`; the workspace page was still blank/loading at the first observation, so assistant interaction is not yet claimed as passed.
- Safety boundary: no patient, prescription, purchase, financial, or other operational mutation was submitted. No password or chat content is persisted in this note.
- Next observation required: wait for workspace hydration, confirm role/scope banner, open the floating assistant, send a non-clinical advisory question, and verify human-review language plus absence of execution controls.

## Manager visual attempt

After the manager workspace rendered and exposed the floating assistant trigger, clicking the trigger caused the application to show its generic fail-closed workspace error with diagnostic ID `fnv1a-b375f2b1`. No assistant message was sent and no mutation was attempted. This is a blocking UI/runtime defect for the production visual test and must be diagnosed before claiming the role test passed.
