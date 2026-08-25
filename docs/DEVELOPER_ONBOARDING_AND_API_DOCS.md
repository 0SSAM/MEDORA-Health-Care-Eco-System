# MEDORA Developer Onboarding and API Documentation

## 1. Developer Onboarding

### 1.1. Technology Stack
The MEDORA platform is built using a modern, type-safe stack:
- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS, Shadcn UI.
- **Backend**: Node.js, Express, tRPC (for type-safe API communication).
- **Database**: MySQL with Drizzle ORM.
- **Testing**: Vitest (Unit/Integration) and Playwright (E2E).

### 1.2. Local Development Setup
1. **Clone the Repository**: `git clone <repository-url>`
2. **Install Dependencies**: `pnpm install`
3. **Environment Setup**: Create a `.env` file based on `.env.example`.
4. **Start Development Server**: `pnpm dev`
5. **Run Tests**: `pnpm test` to verify the local environment.

### 1.3. Architecture Overview
- **`client/src/_core`**: Contains global hooks, contexts, and authentication logic.
- **`server/routers`**: Defines tRPC routers for different functional modules.
- **`shared/`**: Shared types and constants used by both client and server.
- **`drizzle/`**: Database schema definitions and migrations.

---

## 2. API Documentation (tRPC)

### 2.1. Authentication Router (`auth`)
- **`me` (Query)**: Returns the currently authenticated user session.
- **`login` (Mutation)**: Handles user authentication and session creation.
- **`logout` (Mutation)**: Terminates the user session.

### 2.2. Operations Router (`operations`)
- **`people.list` (Query)**: Retrieves a list of employees for the current organization.
- **`procurement.createOrder` (Mutation)**: Creates a new purchase order.
- **`crm.getContacts` (Query)**: Fetches customer relationship data.

### 2.3. ERP and Finance Router (`erp`)
- **`getFinanceReports` (Query)**: Retrieves aggregated financial data.
- **`createExpense` (Mutation)**: Records a new miscellaneous expense.

---

## 3. Contributing Guidelines
Developers contributing to MEDORA must adhere to the following standards:
- **Type Safety**: Avoid using `any`; always define proper TypeScript interfaces.
- **Security**: Never commit secrets or `.env` files. Use the provided security hardening tools.
- **Testing**: Every new feature must include corresponding unit or E2E tests.
- **RTL Support**: Ensure all UI components are compatible with Arabic (RTL) layouts.

---
*Document Version: 1.0.0 (August 2026)*
*Author: Manus AI*
