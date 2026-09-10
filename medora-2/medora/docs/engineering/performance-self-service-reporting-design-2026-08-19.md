# MEDORA: Performance, Employee Self-Service, and Report Delivery Design

**Author:** Manus AI
**Status:** Approved implementation design
**Date:** 2026-08-19

## Purpose and non-negotiable boundaries

This change set improves first-load performance, provides a deliberately narrow employee self-service surface, and completes scheduled report delivery through the already configured production sender channel. It does not alter clinical workflows, grant staff access to management procedures, relax organization/branch/jurisdiction isolation, or introduce automatic AI decisions.

| Workstream | Decision | Security or performance boundary |
|---|---|---|
| First-load performance | Split the two remaining eager workspace imports at the Home workspace boundary. | The loading and error boundary already used for the other workspaces remains the only rendering change. |
| Employee self-service | Add a separate `operations.selfService` namespace rather than changing `operations.people.*`. | Employee-owned reads and writes are tied to `ctx.user.id`, exact active scope, and the linked employee profile. |
| Report email | Use the configured sender credentials (`RESEND_API_KEY` and `REPORT_FROM_EMAIL`) through the approved server-side transport. | Recipient authorization is re-checked at delivery time; failures are recorded but never terminate the scheduler process. |

The two workspace modules that still enter the Home shell eagerly are `PointOfSaleWorkspace` and `BranchAnalyticsDashboard`; the rest of the shell already establishes the project pattern of `lazy()` imports inside `LazyWorkspace`.[1]

## Bundle-splitting contract

`PointOfSaleWorkspace` and `BranchAnalyticsDashboard` will be converted to named-export lazy imports. Every usage site will be wrapped in the existing `<LazyWorkspace resetKey={buildWorkspaceResetKey(...) }>` boundary. This preserves the localized loading card, recovery behavior, role/scope gating, and reset-on-scope-change behavior already used by the other modules.

No route or authorization decision will be moved into the lazy module. The Home shell remains responsible for selecting permitted workspaces before React begins fetching their chunk. The production build will be compared before and after the change; the acceptance criterion is that those first-party workspaces no longer reside in the initial Home bundle. A chunk-size warning may remain for a genuinely large deferred workspace, but it must no longer block first paint of the application shell.

## Employee self-service policy

The existing management-only `people.*` procedures remain management-only. The new `selfService.*` procedures are an independent, narrower contract and never reuse a management guard as an authorization substitute. An employee must satisfy all of the following conditions on every call.

| Required proof | Enforcement rule | Failure behavior |
|---|---|---|
| Authenticated identity | The request uses `ctx.user.id`; clients never submit an employee identifier for authority. | Reject unauthenticated access through `protectedProcedure`. |
| Organization membership | The user has active membership in the requested organization. | Return `FORBIDDEN`. |
| Branch and jurisdiction assignment | The requested branch is active for that organization; the user is an active branch member; the requested jurisdiction is assigned to that branch. Jurisdiction `0` remains valid. | Return `FORBIDDEN` or `PRECONDITION_FAILED` before data reads. |
| HR ownership | A single employee profile matches `organizationId`, `branchId`, `jurisdictionId`, and `userId === ctx.user.id`. | Return `NOT_FOUND` without exposing whether another employee owns a profile. |

The initial procedures are intentionally limited to the following operations.

| Procedure | Permitted behavior | Explicit exclusions |
|---|---|---|
| `myProfile` | Return the caller's scoped employment profile only. | No employee directory, profile editing, user-link reassignment, or manager metadata. |
| `myAttendance` | Return the caller's own bounded attendance history for a selected date interval. | No clock adjustment, attendance creation, approval, or access to another employee's attendance. |
| `myLeaveRequests` | Return the caller's own leave requests in the selected scope. | No team leave list, approval decision, or access to another employee's reason/status. |
| `submitLeaveRequest` | Create a `submitted` leave request for the caller's linked profile when the end date is not before the start date. | No submitted employee ID, no auto-approval, and no free-text sensitive HR reason in this first safe slice. |
| `cancelLeaveRequest` | Cancel only a request owned by the caller and still in `submitted` status. | No cancellation of approved, rejected, or another employee's request. |

Each successful mutating operation writes the existing tamper-evident audit record. The self-service list/read procedures deliberately return the minimum employee-owned fields necessary for the workflow; they do not turn the HR directory into a personal-data API.

The underlying ownership link is already represented by `employee_profiles.userId`, while attendance and leave rows point to the employee-profile primary key.[2] The schema also provides a defined leave-state transition set, so the self-service cancellation rule can be enforced without inventing another status.[2]

## Production report-email design

The report scheduler currently produces a scoped aggregate output and records an in-app delivery attempt. It deliberately rejects non-in-app delivery, so the transport change belongs in the scheduled execution path rather than in the client export UI.[3] The reports router already requires an approved report compliance pack, organization management access for definition/schedule changes, and configured sender credentials before an email definition is scheduled.[4]

The implementation will retain those gates and apply the following delivery rules.

| Stage | Design rule |
|---|---|
| Definition creation | Only existing management users may define delivery. A recipient user must be an active organization member. The configured sender remains server-side only. |
| Run execution | The existing allowlisted query and scoped report run are executed first. No raw database rows or clinical data are included in the email. |
| Recipient resolution | At delivery time, resolve only active, organization-authorized recipients with a valid account email and scope access to the report jurisdiction. De-duplicate addresses. A missing or unauthorized recipient produces a bounded skipped attempt rather than a send. |
| Message content | Send a concise, escaped plaintext/HTML aggregate summary with report name, covered period, and approved aggregate values. The email contains neither login secrets nor employee/patient records. It directs recipients to the authenticated reports workspace for further review. |
| Transport | Call the configured server-side sender API with `RESEND_API_KEY` and `REPORT_FROM_EMAIL`; use a per-run idempotency key and do not expose either value to the browser or persist it in a definition.[6] |
| Auditability | Write one `report_delivery_attempts` row for success, skip, or failure, including a bounded error code and completion time. The persisted attempt is the delivery audit record. |
| Failure handling | Catch transport and recipient-resolution failures, persist a `failed` attempt with a stable error code, log only a safe error label, and return the completed report run with delivery status rather than throwing from the scheduler. |

The owner-notification helper remains reserved for project-owner operational alerts and is not repurposed as an end-user mail transport.[5] This avoids treating the internal notification endpoint as an undocumented general-email API.

## Verification contract

Implementation is not complete until focused tests prove all of the following claims.

| Area | Required regression evidence |
|---|---|
| Lazy loading | The two named workspaces are declared with `lazy()` and rendered under the standard `LazyWorkspace`; access and reset keys remain present. |
| Ownership isolation | A non-management employee can retrieve only the profile, attendance, and leave requests whose `userId` matches the session; an attempt to target another employee cannot succeed. |
| Scope isolation | Missing organization, inactive branch membership, unassigned jurisdiction, and a mismatched employee profile are rejected; jurisdiction `0` remains accepted where assigned. |
| Leave controls | Submission uses the authenticated employee profile and a valid date range; only the caller's submitted request can be cancelled. |
| Email transport | A valid resolved recipient triggers the configured sender call and a delivered attempt. A rejected HTTP response or transport exception produces a failed attempt and does not make `reportExecutionHandler` crash. |
| Release checks | TypeScript, complete Vitest, production build, and desktop/mobile visual checks pass before checkpointing. |

## References

[1]: ../../client/src/pages/Home.tsx "Home workspace import and lazy-boundary implementation"
[2]: ../../drizzle/schema.ts "Employee profile, attendance, and leave-request schema"
[3]: ../../server/scheduled/reports.ts "Scheduled report execution and current delivery-audit implementation"
[4]: ../../server/routers/reports.ts "Scoped report definition, scheduling, and reporting access contract"
[5]: ../../server/_core/notification.ts "Owner-notification helper contract"
[6]: https://resend.com/docs/api-reference/emails/send-email "Resend Send Email API"
