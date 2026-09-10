# Egyptian Regulatory and Integration Boundaries

The system treats EDA, ETA, MOH, NFSA, UHIA, the Egyptian Pharmacists Syndicate, TPA providers, InstaPay, and Meeza as controlled integration boundaries. Local validation is deterministic and auditable, but it is not a substitute for an official response.

| Area | Local control implemented/planned | Production prerequisite |
|---|---|---|
| MOH pricing | Server-side 7% maximum discount cap and official-price validation boundary. | Current official price source and approved pharmacy operating policy. |
| ETA | Invoice fields and status model with fiscal workflow boundary. | ETA taxpayer credentials, signing certificate/device, and official submission endpoint. |
| EDA | Product and batch vocabulary supports regulated medicine synchronization. | EDA-approved API credentials and synchronization contract. |
| NFSA/UHIA | Compliance workspaces and insurer/claim status vocabulary. | Contract, eligibility, preauthorization, and approved exchange specification. |
| Syndicate | License fields and expiry status vocabulary. | Official verification endpoint or approved manual verification procedure. |
| TPA | 25 configured provider codes and claim lifecycle classification. | Per-provider API contracts, credentials, mapping, and test environment. |
| Payments | Meeza/InstaPay method fields and transaction audit boundary. | Acquirer or gateway contract, callback signing keys, and reconciliation rules. |

No regulatory, payment, insurance, or government response is fabricated in seed data. A status such as `PENDING` means that an external submission or credential is not yet connected, not that approval has occurred.
