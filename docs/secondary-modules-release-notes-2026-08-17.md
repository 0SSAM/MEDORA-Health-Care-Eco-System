# MEDORA Secondary Modules — Release Notes

## Scope delivered

MEDORA now includes a shared, tenant-scoped data layer for CRM, HR, Call Center, and Customer Care. The migration is non-destructive and includes CRM contacts, opportunities, activities, HR contracts, shifts and reviews, call queues, queue members and interaction summaries, customer-care cases, tasks, and satisfaction records.

The tRPC router is registered in the application contract and applies organization, branch, jurisdiction, membership, role, and assignment guards where required. Mutating paths write audit events. State transitions are constrained by the shared secondary-module policy. The implementation does not store raw call recordings and does not authorize sensitive operations based on client-side checks alone.

A task-oriented Arabic RTL workspace is available from the main dashboard. It provides a unified entry point, live scoped lists, KPI summary cards, empty/loading/error states, responsive layouts, and a governed operational AI action. AI output is structured, conservative, explicitly marked as requiring human review, and cannot approve, contact, diagnose, move money, or change records autonomously.

## Verification evidence

TypeScript completed successfully. Focused contract tests for the secondary-module policies and employee management completed successfully: 7 tests passed. The production build completed successfully. Desktop and mobile RTL screenshots were captured for the public entry flow; authenticated workspace acceptance remains dependent on a valid tenant account and populated records.

## Explicit limitations

The current release is a secure operational foundation and not a claim that every enterprise connector is live. Finance/POS/procurement/notification integration is represented through scoped contracts and dashboard-ready data but still needs end-to-end acceptance against the corresponding live workflows. Telephony carrier integration, automatic queue routing, real recordings, email/SMS/WhatsApp delivery, payroll provider connectivity, external HR identity systems, advanced exports, and production restore drills require actual credentials, devices, providers, and an approved staging environment.

No customer reviews, ratings, testimonials, or fabricated operational records were added. Empty states remain honest when the active tenant has no records.
