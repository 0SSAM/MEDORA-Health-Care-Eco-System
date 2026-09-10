# سجل أدلة الامتثال الإقليمي

## Saudi Arabia — initial official evidence

The Saudi Food and Drug Authority (SFDA) official Laws and Regulations page identifies the authority's regulatory material for food, drugs, and related products, and shows an update timestamp of 09/08/2026 Saudi Arabia time. Source: https://www.sfda.gov.sa/en/regulations

The SFDA official site also exposes a Drugs List and pharmaceutical pricing rules as first-party regulatory/catalog boundaries. Sources: https://www.sfda.gov.sa/en/drugs-list and https://www.sfda.gov.sa/en/regulations/66357

The Zakat, Tax and Customs Authority (ZATCA) official E-Invoice Specifications page states that taxpayers must meet the authority's business and technical requirements, electronic invoice data dictionary, XML implementation standard, and related resolution requirements. The page lists the data dictionary and XML implementation standard dated 19 May 2023 and was last updated 12 January 2026 Saudi Arabia time. Source: https://zatca.gov.sa/en/E-Invoicing/SystemsDevelopers/Pages/E-Invoice-specifications.aspx

## Implementation implication

The application must not treat Saudi compliance as a single tax flag. Its jurisdiction pack needs separate evidence entries for medicine/product regulation, pricing, controlled or monitored medicines, and ZATCA invoice data and technical rules, each with source URL, effective date, review date, version, approval state, and an emergency stale/blocked state.

## Limitation

These sources establish authoritative boundaries; they do not by themselves prove that the application is legally certified or that every operational rule has been fully implemented. Each country must pass the same source-and-approval workflow before being marked enabled for regulated transactions.

## Egypt — initial official evidence

The Egyptian Drug Authority (EDA) official regulatory reference provides a Laws and Executive Regulations section for the pharmaceutical market and medical products. Source: https://edaegypt.gov.eg/en/the-regulatory-reference-of-the-egyptian-drug-authority-eda/laws-and-executive-regulations/

The Egyptian Tax Authority's official eInvoicing and eReceipt SDK states that its platform is used by taxpayers to register issued documents and receive issuance events, and exposes API and integration-toolkit documentation for ERP and POS systems. Source: https://sdk.invoicing.eta.gov.eg/

## Implementation implication

Egypt requires separate EDA product and controlled-medicine evidence from ETA invoice/eReceipt evidence. The existing Egypt 7% pricing/discount rule remains a domain rule only where its legal basis and effective pack are approved; it must not be copied into other country packs.
