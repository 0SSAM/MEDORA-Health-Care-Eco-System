# Egypt returns, consumer protection, and tax source notes

> Working implementation note — not legal or tax advice. The production compliance pack must be reviewed by qualified Egyptian legal/tax professionals and updated against current official releases before activation.

## Official Consumer Protection Agency source

Source: https://cpa.gov.eg/ar-EG/%D8%A7%D8%B3%D8%A6%D9%D9%84%D8%A9-%D9%85%D8%AA%D9%83%D8%B1%D8%B1%D8%A9

The Egyptian Consumer Protection Agency FAQ states that consumers may request an invoice without an additional charge and that the invoice should include the transaction/contract date, product price, specifications, nature, type, and quantity. It describes a 14-day exchange/return period from receipt without stating a reason, subject to listed exceptions such as perishable goods, goods returned in a materially changed condition due to the consumer, custom-made goods matching the requested specification, publications/software, jewellery, and certain unsealed garments. It also describes a 30-day exchange/return period for defective goods. For a defect case, the supplier is described as being required, upon consumer request, to exchange or refund without additional cost within one week, with the refund through the same payment method. Disputed defects may be escalated to the Agency.

The implementation must therefore model these as configurable policy rules, not hardcoded universal guarantees: receipt date, reason category, product category/exception, condition evidence, defect evidence, approval path, refund method, deadline tracking, and escalation/audit state. Pharmacy-specific public-health and controlled-product constraints require a separate approved policy pack and may be stricter; the system must not automatically authorize return of dispensed medicines merely from the general 14/30-day rules.

## Egyptian Tax Authority sources

Source: https://eta.gov.eg/ar/content/altsjyl-ly-mnzwmt-alfatwrt-alalktrwnyt

The ETA page provides registration material for the electronic invoicing system, including a registration PDF and self-registration steps. The page alone does not establish a complete implementation specification.

Source: https://eta.gov.eg/en/content/guides-dealing-electronic-invoices-system

The ETA guides page references taxpayer introductory material, readiness/registration guidance, integration and electronic-signature/codes guidance, and e-invoicing FAQs. The production integration remains fail-closed until the official technical specification, taxpayer credentials, certificates/signature requirements, sandbox, and acceptance evidence are available.

## Design boundaries

The MEDORA foundation should support jurisdiction-scoped tax profiles, effective dates, invoice numbering, taxable/non-taxable lines, tax breakdown, corrections/credit notes, immutable audit events, and pending/submission/rejected/accepted statuses. No ETA submission, tax calculation claim, or legal-compliance certification should be represented as active without approved Egyptian evidence and credentials.
