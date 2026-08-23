# MEDORA Production Hardware Integration Plan

## Scope

This plan prepares MEDORA for approved receipt printers, label printers, office printers, barcode scanners, and Data Matrix scanners without claiming that a physical device is already connected or accepted. The browser/PWA remains functional through print preview/PDF, camera decoding when the device grants permission, manual entry, and keyboard-wedge input.

## Provider-neutral architecture

| Capability | Prepared path | Production gate |
|---|---|---|
| Receipt printing | Scoped receipt payload → approved local bridge or approved network IPPS adapter | Vendor/model approval, certificate or local trust policy, paper-width acceptance test |
| Label printing | Scoped label payload → approved ZPL-capable bridge or IPPS adapter | Label language confirmation, printer profile, Data Matrix readability test |
| Office printing | Browser print/PDF fallback or approved IPPS adapter | OS queue and PDF layout acceptance |
| Barcode/Data Matrix scanning | Camera, keyboard-wedge, or approved local bridge | Symbology profile, permission policy, duplicate-scan behavior, audit evidence |
| USB/Bluetooth | Never directly opened by the browser in the current preparation | Approved bridge/agent, device identity, signed configuration, rollback path |

## Safety and tenancy rules

Every print request must carry the current organization, branch, and jurisdiction scope. The server-side production adapter must re-check that scope and authorization before dispatch. No client-provided network endpoint, arbitrary USB identifier, Bluetooth address, or raw production payload may be trusted without an approved adapter configuration. Demo catalog edits and trial invoices remain confined to showcase scope; hardware capability itself is not Test-only.

## Prepared application contracts

`client/src/lib/hardwareIntegration.ts` contains provider-neutral capability types, scoped receipt validation, printer/scanner approval states, direct-browser transport rejection, and the preserved browser fallback list. The contracts intentionally stop before device I/O. This keeps the current deployment safe until a named vendor, adapter, and device policy are approved.

## Required activation inputs

Before enabling a real connector, provide the printer/scanner vendor and exact model, transport (local bridge, IPPS, USB, or Bluetooth through a bridge), operating systems, receipt or label media, supported symbologies, network and certificate policy, adapter deployment model, and the organization/branch rollout scope. The acceptance record must include print legibility, paper width, Data Matrix decoding, duplicate handling, permission denial behavior, offline behavior, audit records, and rollback.

## Current status

The integration boundary is prepared and tested at the contract level. Direct browser USB/Bluetooth/network access remains closed, and no physical-device acceptance is claimed. Enabling a connector should be a separate, vendor-specific change with credentials or certificates managed through the project secret/configuration flow rather than source code.
