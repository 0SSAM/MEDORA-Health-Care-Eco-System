# Alternative Disease Classification Sources

**Research date:** 2026-08-15

## Executive conclusion

The simplest production-ready alternative for MEDORA is the U.S. National Library of Medicine (NLM) Clinical Table Search Service for **ICD-10-CM** lookup. It is free of charge, requires no API key in the documented endpoint, and exposes a small search API suitable for autocomplete. It is not ICD-11, not a global classification, and is U.S.-specific; it must therefore be offered as a jurisdiction-scoped reference rather than a replacement for WHO ICD-11 or Egypt's officially mandated coding rules.

A second option is the NLM **UMLS** API. It provides broader terminology and mappings, but it requires a UMLS/UTS account and license code. It is therefore more complex and should not be treated as an anonymous free API. SNOMED CT is clinically rich, but it is not automatically free for deployment in non-member territories; licensing, annual fees, and special permission may apply. It is not a low-complexity substitute for this project.

## Candidate comparison

| Candidate | Access and cost | Coverage and language | Integration complexity | MEDORA recommendation |
|---|---|---|---|---|
| NLM Clinical Table Search Service – ICD-10-CM | Free of charge; public HTTPS search endpoint; no API key shown in the documented basic flow | ICD-10-CM diagnosis codes and long descriptions; English/U.S.-specific | Low; query `terms`, optional `count`, `offset`, `df`, `sf`, `ef` | Recommended as an optional U.S. jurisdiction lookup/reference only |
| NLM Clinical Table Search Service – Medical Conditions | Public service with a curated list of medical conditions and suggested ICD-10-CM codes | Useful autocomplete layer, but smaller and not a complete national classification | Low | Suitable for search assistance, never final coding authority |
| NLM UMLS/UTS | API access requires a UMLS account, license code, and API key | Broad terminology/metathesaurus and mappings; language and source coverage vary | Medium/high; credentials and source-specific license review required | Future terminology bridge after legal and credential review |
| SNOMED CT | Free for some member-country use; non-member deployment requires an annual license and statement of usage, with fees depending on territory/use | Clinically rich terminology; not itself an ICD classification | Medium/high; licensing and distribution controls required | Do not activate as a free substitute; assess only with licensing approval |
| WHO ICD-11 API | Official source; OAuth client credentials required; CC BY-ND 3.0 IGO terms | ICD-11 Foundation/linearizations, multilingual including Arabic/English | Medium; official credentials and version governance required | Remains authoritative target; keep fail-closed until credentials exist |

## Verified NLM ICD-10-CM API details

The NLM endpoint is `https://clinicaltables.nlm.nih.gov/api/icd10cm/v3/search`. The `terms` parameter is required and supports a word or partial word; `count` and `offset` support bounded pagination, with a documented maximum count of 500 and a documented total retrieval limit of 7,500. Returned records expose a code and a long diagnosis description, with optional display and extra fields. NLM describes the service as provided “as is” and free of charge, so MEDORA should add timeouts, caching controls, health states, and a visible source/version label rather than treating availability as guaranteed.

The service currently identifies itself with the ICD-10-CM 2026 dataset in its page content. MEDORA must still record the retrieved release/version, source URL, retrieval timestamp, and jurisdiction. It must not silently combine NLM's U.S. ICD-10-CM data with Egypt, Jordan, Qatar, or Morocco coding rules.

## Safe integration decision

Implement a provider-neutral terminology adapter with explicit provider and jurisdiction fields. The first low-complexity adapter can be an NLM ICD-10-CM search provider behind a feature flag and scoped only to jurisdictions that explicitly permit or require ICD-10-CM reference data. The WHO ICD-11 adapter remains the authoritative provider for ICD-11 and must require official OAuth credentials before synchronization or activation.

Search results may assist a clinician, but only an authorized clinician can select and finalize a diagnosis. The application must store the provider, code system, release, source URI, selected display, language, and verification state on every clinical code. Crosswalks and AI suggestions must never automatically create a final diagnosis, alter a claim amount, or change a billing outcome.

## Sources

1. NLM Clinical Table Search Service – ICD-10-CM API: https://clinicaltables.nlm.nih.gov/apidoc/icd10cm/v3/doc.html
2. NLM Clinical Table Search Service: https://clinicaltables.nlm.nih.gov/
3. NLM UMLS: https://www.nlm.nih.gov/research/umls/index.html
4. NLM UMLS API authentication: https://documentation.uts.nlm.nih.gov/rest/authentication.html
5. SNOMED International licensing: https://www.snomed.org/licensing
6. WHO ICD-11 API v2 documentation: https://icd.who.int/docs/icd-api/APIDoc-Version2/
7. WHO ICD-11 license: https://icd.who.int/docs/icd-api/license/
