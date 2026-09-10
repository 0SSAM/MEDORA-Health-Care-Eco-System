# Egyptian Catalog Source Assessment

## Verified official entry points

The Egyptian Drug Authority provides a public registered-product search at [EDA Registered Drugs Search](http://eservices.edaegypt.gov.eg/EDASearch/SearchRegDrugs.aspx). The search page exposes categories including human pharmaceutical, biological, herbal medicine, veterinary, biocides, cosmetics, and complementary products, with fields such as trade name, registration number, applicant, and generic name.

The EDA website also publishes a [Databases service area](https://edaegypt.gov.eg/en/services/databases/) and identifies the authority as responsible for regulating the quality, effectiveness, and safety of pharmaceutical products and medical devices. The official EDA site includes a public announcement for a medical-device data inquiry service and a separate authenticated [EgyCosm portal](https://egycosma.edaegypt.gov.eg/) for cosmetics workflows.

## Product scope and provenance policy

The application must not claim to contain a complete Egyptian drug, cosmetic, or medical-supplies database until the official source provides an authorized bulk export or an approved API. Public web search is suitable for verified lookup and provenance capture, not for silently scraping and republishing an unlicensed complete catalog.

Each catalog record therefore requires a source authority, source URL or document identifier, retrieval timestamp in UTC, source record identifier, verification status, and reviewer identity. Imported records are read-only until an authorized reviewer approves them. Locally created records are marked `LOCAL_PENDING_REVIEW` and cannot be treated as regulatory approval.

## Planned catalog partitions

| Catalog | Primary authority boundary | Required provenance | Production prerequisite |
|---|---|---|---|
| Medicines | EDA registered-product search and authorized EDA data services | Registration number, trade/generic name, dosage form, source timestamp | Official export/API access and refresh agreement |
| Cosmetics | EDA cosmetics registration/EgyCosm workflows | Notification/registration reference, product/brand, source timestamp | Authorized EgyCosm/API or controlled import |
| Medical supplies | EDA medical-device registration/search services | Device registration/reference, manufacturer, class, source timestamp | Official device-data access and classification mapping |

## Safety boundary

The catalog feature is a controlled master-data workflow. It does not infer registration, availability, price, reimbursement, or legal status from a product name alone. Prices and regulatory status must be separately verified, and all externally sourced updates must preserve the previous value and audit history.

## References

[1]: http://eservices.edaegypt.gov.eg/EDASearch/SearchRegDrugs.aspx "EDA Registered Drugs Search"
[2]: https://edaegypt.gov.eg/en/services/databases/ "EDA Databases"
[3]: https://egycosma.edaegypt.gov.eg/ "EgyCosm official portal"
[4]: https://edaegypt.gov.eg/en/ "Egyptian Drug Authority official website"
