# Official source research notes — 2026-08-14

## Jordan Food and Drug Administration (JFDA)

Source: https://www.jfda.jo/Default/Ar

The official JFDA homepage identifies the institution and exposes a dedicated Directorate of Medicines, a Directorate of Medical Devices and Supplies, electronic services, legislation, regulations, instructions, guides, policies, and service directories. The page also links to official services for drug registration, public drug-price search, public drug information and leaflets, and information on drugs submitted for registration. These are discovery and activation-gate sources; they do not by themselves establish that MEDORA is compliant or licensed.

Official linked service URLs visible on the page:
- Drug registration workflow: https://workflow.jfda.jo/user/login
- Public drug price search: https://drugapplication.jfda.jo/PRep/publicDrugSearch
- Public drug information and leaflets: https://drugapplication.jfda.jo/PRep/publicDrugSearchWithLeaflets
- Drugs submitted for registration: https://services.jfda.jo/JFDA/registration/newdrugssearch.aspx

Implementation implication: a Jordan country pack should require a verified JFDA authority source, the applicable registration/licensing evidence, effective/review dates, and credentials/acceptance testing before enabling regulated catalog or dispensing workflows. The pack must keep prices, product registration, medical devices/supplies, and facility licensing as separate evidence domains.

## Evidence limitation

This note records only what was visible on the official page. It is not legal advice, does not verify current licensing requirements for a specific organization, and does not authorize production integrations.

## Qatar Ministry of Public Health (MoPH)

Source attempted: https://www.moph.gov.qa/english/OurServices/advancedsearch/Pages/servicesdetails.aspx?serviceId=228

The official page presented a human-verification challenge in the current browsing session, so its detailed service content was not independently verified. Search discovery identified the page as a Ministry of Public Health service concerning final assessment for pharmaceutical-facility licensing and registration/renewal of pharmaceutical-facility licences, but this discovery is not treated as sufficient legal evidence.

Implementation implication: keep Qatar licensing and facility-service activation disabled until the official service content, applicable requirements, current forms, credentials, and acceptance process are verified through an accessible official channel. Do not infer requirements from the blocked page or from third-party summaries.

## Morocco Ministry of Health and Social Protection

Source: https://www.sante.gov.ma/Reglementation/Pages/REGLEMENTATION-APPLICABLE-AU-PRODUITS-DE-SANTE.aspx

The official Ministry page titled “Reglementation appliqué au produits de santé” lists primary legal and regulatory materials for health products. It links, among others, to Law 11-08 on in-vitro diagnostic reagents, rules on poisonous substances, Law 84-12 on medical devices, Law 17-04 establishing the medicines and pharmacy code, and decrees concerning generic bioequivalence and marketing authorization for human medicines. The page also links to the Directorate of Medicines and Pharmacy / AMMPS portal.

Implementation implication: Morocco requires separate evidence domains for medicines and pharmacy, in-vitro diagnostics, medical devices, poisonous/controlled substances, and marketing authorization. The official page is a source register, not proof of a facility licence, product authorization, privacy compliance, tax/e-invoicing readiness, or production credential for MEDORA. A Morocco pack must retain the specific law/decree version, applicability, effective date, local authority evidence, reviewer, and acceptance criteria before activation.

## Qatar official source verification — follow-up

- URL: https://www.moph.gov.qa/english/departments/policyaffairs/pdc/regnpricing/Pages/ServiceDetails.aspx?ItemId=191
- Date checked: 2026-08-14.
- Result: The official Ministry of Public Health page presented a human-verification CAPTCHA instead of readable service requirements. It is retained as an official source lead only; no detailed licensing, pricing, registration, privacy, or credential requirement is inferred from it. Qatar remains `PENDING_REVIEW` until the requirements are independently verified from an accessible primary source or through an authorized local review.

## Search triage note — Oman

Search discovery surfaced an official Oman Ministry of Health Drug Safety Center page. It is not activated as a country pack from a search snippet alone; detailed requirements, effective dates, organization licences, privacy, fiscal rules, and integration credentials must be verified from the primary source before use.
