# Official Integration Source Notes

**Audit date:** 14 August 2026. These notes record source discovery only; they do not constitute legal advice, regulatory approval, certification, or proof that MEDORA is authorized to connect.

| Jurisdiction / domain | Official source finding | Engineering implication |
|---|---|---|
| Egypt — ETA | The Egyptian Tax Authority developer API page describes taxpayer-system authentication, protected APIs, document types and versions, notifications, ERP ping, and published-code workflows.[1] | ETA integration needs taxpayer-system identity, authentication, document-version handling, ERP callback reachability, code mapping, and production credentials. Local invoice validation is not submission. |
| Egypt — EDA | The Egyptian Drug Authority public site is an official regulatory information portal and publishes authority news and services.[2] | EDA catalog, registration, licensing, and product-verification workflows require an identified official service/API and approved credentials; the public homepage alone is not a machine-integration contract. |
| Saudi Arabia — ZATCA | ZATCA publishes an E-Invoicing Developer Portal / Systems Developers area on its official government domain.[3] | Saudi fiscal integration requires a country-specific adapter, current technical specifications, taxpayer/device identity, certificates or signing material, test/production endpoints, and acceptance testing. |
| UAE — MOHAP Riayati | MOHAP states that the e-Claims Post Office through Riayati exchanges insurance data between providers and payers in the Northern Emirates and supports eligibility, authorization, claims, e-prescriptions, responses, manuals, standards, code lists, and technical specifications.[4] | UAE insurance must be jurisdiction-specific; the Northern Emirates workflow cannot be generalized to every emirate or payer. Adapter activation requires provider registration, payer/channel agreement, credentials, code-set mapping, test cases, and privacy approval. |

## Source interpretation

The sources confirm that official portals and technical exchange surfaces exist, but they do not provide MEDORA with credentials, facility registration, contractual authority, or a universal API. The project therefore keeps government and payer connectors disabled and exposes only policy boundaries until the responsible organization supplies the required approvals and secrets.

## References

[1]: https://sdk.invoicing.eta.gov.eg/api/ "Egyptian Tax Authority — Application Programming Interface"

[2]: https://edaegypt.gov.eg/en/ "Egyptian Drug Authority — Official site"

[3]: https://zatca.gov.sa/en/E-Invoicing/SystemsDevelopers/Pages/default.aspx "ZATCA — E-Invoicing Systems Developers"

[4]: https://mohap.gov.ae/en/riayati/e-claims-post-office "UAE Ministry of Health and Prevention — E-claims Post Office"
