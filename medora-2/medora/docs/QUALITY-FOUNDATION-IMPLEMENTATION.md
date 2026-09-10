# MEDORA Quality Foundation — Implementation Contract

This document records the transaction boundary now implemented on `medora/quality-foundation`.

## Persistent objects

- `quality_inspections`: scoped inspection lifecycle, sample counts, disposition, maker/checker identities.
- `quality_holds`: active/released inventory reservations created by a quality hold.
- `quality_events`: append-only operational event trail for inspection transitions and hold release.

## Transaction rules

1. Every quality procedure requires the authenticated organization/branch/jurisdiction scope to match the request.
2. A quality inspection is created as `draft` and can only be started by its inspector.
3. Results can only be recorded by the original inspector while the inspection is `in_review`.
4. Disposition is checker-controlled; the inspector cannot approve their own inspection.
5. Release is blocked when rejected units exist.
6. Hold/reject/rework states contribute no available inventory.
7. An active quality hold is enforced at the stock-movement boundary; outbound and transfer-out movements cannot consume held quantity.
8. Hold release is checker-controlled and persisted atomically with the hold state and quality event.
9. Outbound movement for an expired identified batch is rejected.
10. Quality state changes and inventory state changes use database transactions where atomicity is required.

## Deliberate scope

This is a real QMS transaction foundation, not a claim of a complete enterprise QMS. Full CAPA, NCR workflows, inspection plans, measurement specifications, supplier quality, and a dedicated polished UI remain separate implementation work.
