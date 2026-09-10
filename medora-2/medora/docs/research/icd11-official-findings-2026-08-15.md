# WHO ICD-11 Official Findings

**Research date:** 2026-08-15

## Verified source and access model

The official WHO ICD-11 API is an HTTP REST API hosted at `https://id.who.int/`. API v2 requires the `API-Version: v2` request header. WHO documents OAuth 2 client-credentials authentication through the ICD API portal, with the token endpoint at `https://icdaccessmanagement.who.int/connect/token`. The API returns JSON/JSON-LD and supports `Accept-Language` content negotiation.

The official API covers the Foundation Component, ICD-11 linearizations such as MMS, and ICD-10. For systems that need codes and the structure presented in the ICD-11 release, WHO directs implementers to linearization endpoints with `linearizationname=mms`; the Foundation is a multidimensional ontology and does not itself contain codes or residual categories in the same way as a linearization.

## Licensing and provenance

WHO states that ICD-11 is licensed under the Creative Commons Attribution-NoDerivs 3.0 IGO license (CC BY-ND 3.0 IGO). MEDORA must preserve attribution and must not modify or create an adapted copy of the WHO classification. Local data should therefore store WHO identifiers, release/version, language, source URI, retrieval time, and local metadata separately. Any cached or synchronized representation must remain traceable to the official source and license terms.

## Languages

The official supported-classifications documentation lists Arabic with ISO 639-1 code `ar` and English with `en`, among other languages. MEDORA can provide Arabic/English search through WHO language negotiation while retaining the source language and release metadata.

## Versioning and maintenance

WHO describes ICD-11 as an actively maintained classification with ongoing updates and releases. The application must not silently replace an active version. It should stage new releases, require evidence and human approval, preserve the active version for existing clinical records, and fail closed when a required version is stale or unavailable.

## Clinical and reporting boundaries

ICD-11 can support clinical recording, reporting, and extension codes. WHO states that ICD-10-to-ICD-11 mapping tables are for comparison and transition support, not automatic one-to-one conversion. MEDORA should never silently derive a final ICD-11 diagnosis or financial outcome from a crosswalk. Diagnosis selection requires a qualified user, explicit status, and audit history.

## External prerequisites

A production WHO API connector requires a WHO ICD API account and client credentials. No such credentials are currently configured in the project. Until credentials and an approved test/production integration path are supplied, MEDORA must keep external synchronization fail-closed and may implement only the catalog contract, UI, and controlled local test fixtures that are explicitly marked as non-production.

## Sources

1. WHO ICD-11 License: https://icd.who.int/docs/icd-api/license/
2. WHO ICD-API v2 documentation: https://icd.who.int/docs/icd-api/APIDoc-Version2/
3. WHO supported classifications, versions, and languages: https://icd.who.int/docs/icd-api/SupportedClassifications/
4. WHO ICD-11 implementation FAQ: https://www.who.int/standards/classifications/frequently-asked-questions/icd-11-implementation
