# Approved outbound automation events and repeated-failure notifications

## Purpose

MEDORA may emit a narrow operational summary to an **approved self-hosted Activepieces webhook** after an authenticated, tenant-scoped inventory automation run. The adapter is outbound-only and is not an execution channel. It never accepts instructions from Activepieces, creates an order, changes inventory, moves stock, changes a clinical record, approves a decision, or updates an SLA policy.

## Scope and activation

| Control | Rule |
| --- | --- |
| Tenant scope | Every event is bound to one persisted organization, branch, and jurisdiction job; jurisdiction `0` is valid. |
| Authorization | Only an authorized manager with the complete active scope can configure the workflow. |
| Activation | Events remain disabled unless both server-side endpoint and signing secret are configured and the scoped workflow is explicitly enabled. |
| Connector | Activepieces is a self-hosted, free downstream receiver. MEDORA uses a reviewed outbound webhook boundary rather than Activepieces API execution authority. |
| Fail-closed behavior | A missing credential, unsupported workflow, invalid scope, or delivery failure records a bounded failure outcome and never expands scope or retries without the scheduled job's next run. |

## Event contract

The adapter sends a signed JSON event using HMAC-SHA256 over the canonical serialized body. The receiver gets `x-medora-event-id`, `x-medora-event-type`, `x-medora-event-timestamp`, and `x-medora-signature` headers. The body is deliberately limited to:

```json
{
  "eventId": "inventory-automation:42:2026-08-19T00:00:00.000Z",
  "eventType": "inventory_automation.run_completed",
  "occurredAt": "2026-08-19T00:00:00.000Z",
  "scope": { "organizationId": 7, "branchId": 12, "jurisdictionId": 0 },
  "summary": { "status": "succeeded", "batchesEvaluated": 34, "managerAlertsQueued": 6 }
}
```

It excludes patient, prescription, customer, employee, supplier, product, batch, price, document, reason, free-text, and raw error data. The event identifier is persisted under a unique index before delivery, so a retry cannot create a duplicate event.

## Repeated failure policy

Each scoped workflow retains a consecutive-failure count. A success resets the count. Once a run reaches its manager-configured threshold (default `3`, bounded `2–10`), MEDORA creates one deduplicated **in-app** notification for the authorized manager audience. The notification contains only the workflow label, scope-safe status, and a link direction to MEDORA; it does not include exception details. It is re-issued only if the failure count advances after the last notification. No email, SMS, push, external webhook, or autonomous remediation occurs.

## Audit and observability

Workflow configuration, notification creation, and delivery outcomes are append-only/auditable. The manager view shows whether outbound delivery is available, explicitly enabled, last delivery status, consecutive-failure count, and the current in-app notification threshold. Detailed delivery diagnostics and signature material are never returned to the browser or stored in notification copy.
