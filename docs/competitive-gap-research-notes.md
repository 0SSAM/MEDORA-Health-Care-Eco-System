# Competitive Gap Research Notes

## Scope and method

This research compares publicly documented product capabilities with capabilities evidenced in the MEDORA repository, schema, routers, UI, documentation, and tests. A competitor capability is not treated as a gap solely because a marketing page names it; it is classified as **absent**, **partial**, **deferred/integration-gated**, or **not comparable**.

## Oracle Fusion Cloud ERP — official source

Source: https://www.oracle.com/erp/

Oracle describes Fusion Cloud ERP as a complete cloud ERP suite with AI-assisted finance, real-time analytics, and automatic updates. Its listed application families include Finance and Accounting, Financial Management, Project Management, Procurement, Enterprise Performance Management, Supply Chain and Manufacturing, Product Lifecycle Management, Supply Chain Planning, Supply Chain Execution, Order Management, and Logistics. The source also frames ERP as connecting finance/accounting, HR, SCM, customer experience, and other departments.

Implications for MEDORA comparison: Oracle publicly documents enterprise-grade project management, EPM/planning, product lifecycle, supply-chain planning/execution, order management, logistics, automatic cloud updates, and broader cross-department integration. MEDORA has finance, procurement, inventory, POS, CRM/HR foundations, dashboards, and AI safety foundations, but several of these Oracle families are not evidenced as complete first-class modules in the current repository and must be verified against the code before classifying.

## Odoo — official source

Source: https://www.odoo.com/

Odoo presents an integrated open-source suite. Its official application list includes Accounting, Knowledge, Sign, CRM, Studio, Subscriptions, AI, Point of Sale, Discuss, Documents, Project, Timesheets, Field Service, Planning, Helpdesk, eCommerce, Website, Email Marketing, Purchase, Inventory, Manufacturing, Sales, HR, and Dashboard.

Implications for MEDORA comparison: Odoo publicly documents broad general-purpose coverage beyond MEDORA's healthcare/POS core, especially Knowledge, e-signature, subscriptions, collaboration/chat, document management, project/timesheet, field service, helpdesk, eCommerce, website, email marketing, manufacturing, and Studio-style customization. MEDORA's differentiators are healthcare controls, Arabic RTL, jurisdiction/organization/branch isolation, Demo isolation, FEFO/pharmacy flows, prescription safeguards, and healthcare compliance boundaries; these should not be judged missing merely because Odoo has broader horizontal apps.

## Research status

Official Arabic/region-specific pages for Daftra and Erteqa, plus official SAP and Microsoft Dynamics capability pages, remain to be collected. MEDORA evidence inventory remains to be cross-checked systematically against the repository and prior checkpoints.

## Daftra — official source

Source: https://www.daftra.com/en

Daftra's official modules list documents billing/invoicing, POS, offers/discounts, installments, sales targets/commissions, insurance management, general accounting, chart of accounts, expenses, asset management, cost centers, cheque cycle, inventory, product management, purchases and suppliers, purchase cycle, requisitions, stocktaking, employee management, organizational structure, attendance/leaves, contracts, payroll, requests, manufacturing, work orders, bookings, rental/unit management, time tracking, CRM/client follow-up, memberships, points/credits, and mobile apps including POS, expense scanner, ESS, and stocktaking. It also lists medical, logistics, hospitality, fitness, learning, automotive, transportation, and real-estate/construction industry solutions.

Implications for MEDORA comparison: Daftra publicly documents several horizontal operational features not evidenced as complete in MEDORA, including installment sales, sales targets/commissions, cheque-cycle management, asset management, requisitions, stocktaking app, expense-scanner app, bookings, rental/unit management, manufacturing/work orders, memberships and loyalty credits, and broader industry workflows. MEDORA has supplier credit/terms, procurement, POS, accounting, cost centers, expenses, branch isolation, and healthcare-specific controls, so the comparison must distinguish Daftra-only breadth from healthcare safety requirements.

## SAP Cloud ERP / S/4HANA — official source

Source: https://www.sap.com/products/erp/s4hana.html

SAP describes S/4HANA Cloud Public Edition as a modular ERP with embedded AI across finance, supply chain, HR, and sales. The official page highlights preconfigured industry best practices, subscription cloud delivery, extensibility by modules/users, AI-enabled automation, embedded AI insights, synchronized production/logistics/maintenance, and core HR, time, and global payroll self-service. It also exposes dedicated finance, supply-chain, and HR feature areas, localization capabilities, extensions, technical/security resources, and a broad implementation/support ecosystem.

Implications for MEDORA comparison: SAP capabilities that are not evidenced as complete first-class MEDORA modules include production/manufacturing orchestration, maintenance, global payroll/self-service, SAP-style localization packages, embedded enterprise AI across end-to-end operations, extensibility/partner ecosystem, and packaged best-practice implementations. MEDORA has AI safety gates and healthcare workflows but should not claim SAP-level enterprise implementation breadth.

## Microsoft Dynamics — source-status note

The first attempted product URL, https://www.microsoft.com/en-us/dynamics-365/products, returned a Microsoft 404 page and therefore was not used as evidence. A replacement official Microsoft Learn or Dynamics product page is required before making source-backed claims about Dynamics 365 capabilities.

## Microsoft Dynamics 365 — official sources

Sources: https://www.microsoft.com/en-us/dynamics-365 ; https://www.microsoft.com/en-us/dynamics-365/products/supply-chain-management ; https://learn.microsoft.com/en-us/dynamics365/get-started/intro-crossapp-index

Microsoft describes Dynamics 365 as a set of intelligent business applications spanning sales, marketing, customer service, finance, supply chain, and operations, designed to work together and with existing systems. The official Supply Chain Management page adds AI agents, procurement-agent automation, custom agents through Copilot Studio, demand planning, process mining, handheld warehouse/manufacturing UX, supplier/customer collaboration, sustainability management, security/reliability, extensibility with 5,000+ developer extension points, and partner/implementation ecosystem.

Implications for MEDORA comparison: capabilities not evidenced as complete in MEDORA include agentic Copilot-style extensibility, process mining, AI demand planning, sustainability management, broad supplier/customer collaboration, 5,000+ platform extension points, and a large partner/app ecosystem. MEDORA has AI decision-support foundations, safe diagnostics, healthcare controls, and production integration contracts, but not the same general-purpose platform ecosystem.

## Erteqa — source qualification

Source found: https://www.erteqa.org/

The official site returned a very small set of project content, including a Hospital Management System training project for Kabul Mental Health Hospital. It did not provide a public, structured ERP product catalogue or sufficient authoritative feature documentation for a like-for-like comparison. Search snippets referenced custom ERP work in finance, HR, procurement, and reporting, but snippets are not treated as definitive evidence. Therefore, any Erteqa comparison must be labeled **low-confidence / insufficient public documentation** until the user identifies the exact Erteqa product or supplies its feature catalogue. It is not scientifically valid to claim precise missing features from the current public source alone.
