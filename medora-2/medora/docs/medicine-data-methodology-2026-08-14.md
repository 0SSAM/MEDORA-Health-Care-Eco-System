# Egyptian Medicine Data Workbook — Methodology and Coverage Status

**Project:** ميدورا | منظومة الرعاية الصحية المتكاملة
**Review date:** 2026-08-14  
**Status:** Pending source-backed workbook delivery

## Purpose

This document defines the required structure and verification method for an Egyptian medicine-register workbook. It is a methodology and limitations record; it is **not** a medicine register and does not claim complete coverage.

## Required record fields

A verified workbook may contain only records obtained from an accessible authoritative source and should preserve the source URL, retrieval timestamp, Arabic and English product names where available, active ingredient, strength, dosage form, manufacturer, registration or authorization identifier, status, and any source-specific notes. Missing fields must remain blank and must not be inferred.

## Verification method

Each row must retain provenance to the original official record. The process must validate source accessibility, country and product relevance, identifier uniqueness, duplicate handling, date normalization, Arabic/English field fidelity, and the source's stated terms of use. Any record requiring manual interpretation must be flagged for human review rather than silently normalized.

## Current coverage statement

A file-system inventory of the project and available upload directory found **no `.xlsx`, `.xls`, or `.csv` workbook** that can be safely delivered as a verified Egyptian medicine register. Direct access to the official EDA portal was not sufficiently available during this review to support a reproducible bulk extraction. Therefore, no complete workbook has been generated, seeded, or represented as official.

The project retains the source-triage documentation and the coverage limitation in `docs/regulatory-prerequisites.md` and the quality-audit report. The clinical-trials archive request remains skipped according to the user instruction; this document concerns medicines only.

## Activation gate

Workbook delivery remains blocked until an accessible, legally usable, authoritative medicine source is available and its effective date, coverage, and terms of use can be recorded. After that gate is satisfied, the workbook and a concise source register can be generated and independently checked before being exposed in the application.
