# MEDORA — POS and language live verification

## Verified live state

On 17 August 2026, the authenticated **MEDORA Showcase User** session was opened in the isolated showcase organization and its permitted showcase branch. The Point of Sale workspace rendered three available, branch-scoped demo stock records after the FEFO batch-date ordering fix:

| Item | SKU | Batch | Available quantity | Price |
|---|---|---|---:|---:|
| Paracetamol 500mg (Demo) | `DEMO-PARACETAMOL-500` | `DEMO-BATCH-001` | 120 | EGP 35.00 |
| Vitamin C (Demo) | `DEMO-VITAMIN-C` | `DEMO-BATCH-002` | 8 | EGP 75.00 |
| Saline Solution (Demo) | `DEMO-SALINE` | `DEMO-BATCH-004` | 42 | EGP 25.00 |

The visible POS query is constrained by the authenticated organization, selected branch, and showcase jurisdiction. This is an isolated non-production simulation: its data does not alter production balances and it does not contact external government or insurance services.

The English workspace view also rendered the translated POS search, basket, payment, and stock labels, plus the translated installation notice in LTR direction. A residual page-wide localization sweep remains documented in the active task; transaction completion is verified separately after the controlled simulated sale.

## Controlled sale attempt

The showcase cash drawer was opened, and one `Paracetamol 500mg (Demo)` item was added successfully to the basket at EGP 35.00. The client then submitted the simulated cash-sale request. The server rejected completion and the UI correctly retained the basket while displaying: “The sale could not be completed; no inventory was deducted before server confirmation.” This establishes that product discovery and basket operations work, but sale completion has a remaining server-side failure to diagnose. No production data or external service was affected.
