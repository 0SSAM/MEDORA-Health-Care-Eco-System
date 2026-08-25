# MEDORA | ميدورا — Project Status Audit (Aug 2026)

## Inventory & Stock Management
- **Inter-Branch Transfer**: Implemented backend logic and bilingual UI for stock movement between branches. Includes actual stock mutation in `inventoryBatches` during dispatch and receipt.
- **Inventory Adjustments**: Added a comprehensive workflow for handling **expired, damaged, lost, or found** medications. Includes manager approval and actual stock updates.
- **Schema**: Added `inventory_transfers`, `inventory_transfer_lines`, and `inventory_adjustments` to `drizzle/schema.ts`.
- **Domain Policies**: Defined state machines and validation rules in `server/domain/inventory-transfer-policy.ts` and `inventory-adjustment-policy.ts`.

## Financial Operations
- **Miscellaneous Expenses**: Integrated an operational expense management system for tracking utilities, rent, supplies, and other branch costs.
- **Schema**: Added `miscellaneous_expenses` table.
- **UI**: Developed `MiscellaneousExpenseWorkspace.tsx` for bilingual expense tracking and status updates.

## Security & Operations
- **RBAC (Role-Based Access Control)**: Implemented a centralized permission system in `server/domain/organization-access.ts`. Defines granular capabilities for transfers, adjustments, and expenses.
- **Admin Provisioning**: Broken `server/bootstrap.ts` removed. `medora-ops` skill updated to use `server/reset-owner.ts` for secure setup.
- **Docker**: `docker-compose.yml` hardened (no static credentials, no host DB port). `backup-db.sh` fixed.
- **Detailed Audit Trail**: Centralized `writeDetailedAudit` logic ensures every approval, rejection, and adjustment is recorded with a tamper-evident hash linked to the specific entity.
- **Manager Notifications**: Instant alerts (`emitManagerNotification`) generated for managers and admins upon successful approvals or **unauthorized access attempts**.
- **Time-Guard Synchronization**: Strict server-side UTC verification prevents system usage if client time is tampered with. Includes a blocking UI and immediate manager alerts.
- **Employee Self-Service Attendance**: Mobile-friendly attendance system with GPS geofencing, device verification, and **Biometric Authentication (WebAuthn/Passkeys)**.
- **Payroll & Shift Management**: Integrated workforce management with shift definitions, automated lateness/overtime calculation logic, and centralized reporting capabilities.
- **Assistant**: `AssistantSidebar.tsx` revised to reflect truthful status; performance metrics are placeholders until connected to live aggregate queries.

## Remaining Gaps
- **Live Database**: No `DATABASE_URL` configured in sandbox; migrations and live tests pending.
- **WhatsApp/VoIP**: Frontend readiness UI only; backend connectors are fail-closed/blocked.
