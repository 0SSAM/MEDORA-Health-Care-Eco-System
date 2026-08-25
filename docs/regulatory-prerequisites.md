# ميدورا | منظومة الرعاية الصحية المتكاملة — Regulatory Prerequisites Register

> **Status:** working register, not a legal or regulatory certification. I am an AI, not a lawyer or regulatory affairs professional; a qualified local counsel, pharmacist, data-protection officer, and competent authority must review each country pack before production activation.

## Purpose and activation rule

This register defines the evidence that must exist before a jurisdiction profile is marked active. A country profile must not be treated as a complete compliance implementation merely because a public source or a general standard exists. The system should keep the profile in `UNSET` or `PENDING_REVIEW` until the operator records the competent authority, source URL, effective date, version, applicability, evidence file, reviewer, and review due date.

The minimum evidence categories are: organization licensing; pharmacy, hospital, laboratory, radiology, insurer, distributor, or rehabilitation permissions; medicine and medical-device registration; cosmetics and medical-supply classification; controlled-substance handling; prescription and dispensing rules; pricing and tax; e-invoicing or fiscal reporting; insurance claims and payer identifiers; health-data privacy, consent, retention, hosting, and transfer; localization, language, timezone, currency, and numbering; audit retention; incident response; interoperability; and credentials or acceptance-test access for every governmental adapter.

## Official source register currently verified

| Jurisdiction | Official source | What it establishes | What it does **not** establish |
|---|---|---|---|
| Saudi Arabia | [Saudi Food and Drug Authority](https://www.sfda.gov.sa/en) | SFDA is the competent national authority website for food, drugs, and medical devices. | It does not by itself provide a complete pharmacy, hospital, insurer, privacy, tax, or e-invoicing implementation specification. |
| Saudi Arabia | [Saudi Drug Registration system](https://esdr.sfda.gov.sa/?culture=en-GB) | The official electronic registration channel for medicinal, herbal, and health products. | Registration access or a product listing is not a substitute for a verified organization licence, dispensing rule, or production credential. |
| Egypt | [Egyptian Drug Authority](https://edaegypt.gov.eg/en/) | EDA is the national regulatory authority website for organizing, implementing, and monitoring pharmaceutical regulation. | It does not by itself prove that a specific product, facility, prescription, insurance, privacy, or tax workflow is approved for MEDORA. |
| Egypt | [Egypt National Drug Policy](https://edaegypt.gov.eg/media/iwlh50hn/egypt-national-drug-policy_2026.pdf) | Official national-policy reference published by EDA; version and effective date must be retained with the country pack. | A policy document is not a complete API, credential, e-invoice, retention, or facility-licensing specification. |
| United Arab Emirates | [MOHAP open-data portal](https://mohap.gov.ae/en/open-data) | Official MOHAP public data and portal source. | UAE health regulation is distributed across federal and emirate-level authorities; this source alone is not a complete UAE-wide compliance pack. |
| United Arab Emirates | [MOHAP Tatmeen announcement](https://mohap.gov.ae/en/w/uae-health-authorities-officially-launch-national-drug-tracking-system-tatmeen-) | Official source confirming the national drug-tracking context. | It does not provide all facility, product, controlled-substance, privacy, tax, or integration credentials needed by a deployment. |
| International baseline | [WHO regulatory-system maturity announcement for Egypt](https://www.who.int/news/item/20-12-2024-egypt-s-regulatory-system-reaches-who-maturity-level-3-in-medicines-regulation) | A useful international reference about medicines-regulatory maturity. | WHO material is not a national licence, legal opinion, or permission to activate an MEDORA country profile. |

## Country-pack acceptance checklist

Before activating a jurisdiction profile, the reviewer must attach primary sources for each applicable category, record the responsible authority and effective date, and document any uncertainty. The pack must include a tested decision table for product classification, prescription status, controlled-substance status, dispensing restrictions, price/tax treatment, invoice requirements, data retention, consent, data hosting and transfer, incident reporting, and audit access. Any rule without a primary source must remain explicitly marked `UNVERIFIED` and must not silently default to another country.

A deployment must also record whether the organization is a pharmacy, chain, distributor, hospital, laboratory, radiology center, insurer, rehabilitation center, or government entity. Different organization types require separate licensing and data-access evidence even when they operate in the same country. UAE deployments additionally require an authority map for the relevant emirate; Egypt deployments require EDA and any applicable health, tax, e-invoice, and data-protection sources; Saudi deployments require SFDA plus the applicable health, tax, e-invoicing, privacy, and facility authorities.

## Non-negotiable implementation boundary

MEDORA may provide configuration, evidence tracking, authorization gates, audit records, and adapter interfaces. It must not claim that the platform itself guarantees compliance with every Arab country. No adapter should be enabled with production credentials until the competent authority's current technical specification, credential process, test environment, acceptance criteria, and data-processing requirements have been reviewed and recorded in the country pack.

**Review metadata:** prepared 14 August 2026; links must be revalidated before each production activation and whenever a jurisdiction pack reaches its review date.


## Additional source status — Jordan and Qatar

| Jurisdiction | Source status | Safe implementation interpretation |
|---|---|---|
| Jordan | [Jordan Food and Drug Administration](https://www.jfda.jo/Default/Ar) is an official authority portal exposing medicine registration, medicine-price search, medicine information/leaflets, medical-device and supplies directorates, electronic services, and legislation areas. | Use the JFDA authority and linked services as discovery and evidence sources. Do not activate a Jordan pack until product registration, facility and professional licensing, controlled medicines, tax/e-invoicing, privacy, retention, and integration credentials are separately verified. |
| Qatar | The official MoPH service URL was opened but presented a human-verification challenge in this session: [pharmaceutical-facility service](https://www.moph.gov.qa/english/OurServices/advancedsearch/Pages/servicesdetails.aspx?serviceId=228). | Qatar remains `PENDING_REVIEW`; no detailed requirement is inferred from the blocked page or third-party summaries. Obtain and verify the current official service details, licences, privacy/hosting requirements, fiscal interfaces, and acceptance credentials before activation. |

These entries expand source discovery only. They do not represent legal advice, licensing approval, or a claim that MEDORA is compliant in Jordan or Qatar.


| Morocco | [Ministry of Health and Social Protection — health-product regulations](https://www.sante.gov.ma/Reglementation/Pages/REGLEMENTATION-APPLICABLE-AU-PRODUITS-DE-SANTE.aspx) | Official page listing primary laws and decrees for medicines/pharmacy, in-vitro diagnostic reagents, medical devices, poisonous substances, generic bioequivalence, and human-medicine marketing authorization. | The page is not a complete facility-licensing, privacy, tax/e-invoicing, insurance, payroll, or integration-credential specification and does not authorize an MEDORA production activation. |

Morocco remains `PENDING_REVIEW` until the applicable authority, effective legal versions, organization-specific licences, product evidence, privacy/hosting requirements, fiscal interfaces, and acceptance credentials are independently recorded in a country pack.


## Organization-type evidence matrix

The following matrix is an activation checklist, not a statement that any licence has been obtained. Each enabled country pack must attach the current authority, legal source, effective date, responsible reviewer, retention period, privacy/hosting decision, interoperability specification, and acceptance credentials for the applicable row.

| Organization type | Minimum evidence categories before activation | Current MEDORA status |
|---|---|---|
| Government entity | Public-sector authority, procurement/hosting approval, data classification, retention, audit, incident response, and inter-agency exchange requirements | Configuration and evidence tracking only; country-specific approval pending |
| Independent pharmacy or pharmacy chain | Facility and professional licences, product registration, controlled-medicine rules, dispensing/prescription rules, pricing/tax/e-invoice, recalls, and branch jurisdiction | Core branch and jurisdiction gates exist; local licences and adapters pending |
| Distributor | Wholesale/distribution licence, warehouse and cold-chain controls, batch/recall/track-and-trace rules, transport permissions, tax/e-invoice, and supplier/customer identifiers | Inventory and FEFO foundations exist; distributor-specific country evidence pending |
| Hospital | Facility licence, clinical-data access roles, prescribing/dispensing boundaries, laboratory/imaging interoperability, retention, consent, incident response, and payer exchange | Sensitive-data policy exists; hospital credentials and interoperability tests pending |
| Laboratory | Laboratory accreditation, test catalogue, specimen/diagnostic retention, result privacy, referral and interoperability rules, and professional access evidence | Diagnostic category is modeled; laboratory pack and integrations pending |
| Radiology center | Facility and modality permissions, imaging retention/hosting, report/signature controls, access logging, referral exchange, and radiation-safety evidence | Imaging category is modeled; radiology pack and integrations pending |
| Insurer | Payer licence, claims/benefit rules, member identifiers, consent and minimum-necessary access, retention, fraud/audit, and clearinghouse credentials | Insurance policy foundations exist; payer-specific evidence and adapters pending |
| Rehabilitation/physiotherapy center | Facility/professional permissions, treatment records, consent, referral, retention, payer rules, and safeguarding requirements | Organization type is modeled; country-specific evidence pending |

No row may be marked production-ready solely because the corresponding software workspace exists. The activation decision belongs to the designated local reviewer and must remain auditable in the regulatory-pack lifecycle.
