# MEDORA | ميدورا — GCP Infrastructure and Scaling Strategy
# Copyright (c) 2026 Hossam Naeim Osman. All rights reserved.

## 1. Compute Layer: Cloud Run
**Cloud Run** is the recommended compute platform for the MEDORA backend on GCP due to its ability to scale to zero and handle request-based concurrency efficiently. [1]

| Tier | Configuration | Concurrency |
| :--- | :--- | :--- |
| **Basic** | 1 vCPU / 2GB RAM | 80 requests/instance |
| **Enterprise** | 2 vCPU / 4GB RAM | 250 requests/instance |

## 2. Database Layer: Cloud SQL for MySQL
**Cloud SQL** offers a managed MySQL service with built-in healthcare compliance features. [1] [2]
- **Storage**: Automatic storage increases to prevent downtime.
- **Availability**: Regional availability with automatic failover.
- **Analytics**: Integration with BigQuery for large-scale data analysis.

## 3. Frontend Delivery: Cloud Storage + Cloud CDN
Static assets for the React application are stored in **Cloud Storage** and distributed globally via **Cloud CDN**. [1]
- **Performance**: Edge caching reduces latency for global healthcare operations.

## 4. Healthcare-Specific Services
- **Cloud Healthcare API**: Provides FHIR, HL7v2, and DICOM support for interoperability. [2]
- **IAM**: Granular role-based access control (RBAC) integrated with organization-level policies.

## 5. References
- [1] [GCP Healthcare: Secure & Scalable Solutions](https://statusneo.com/gcp-healthcare-secure-scalable-solutions/)
- [2] [Why Healthcare Providers Are Choosing Google Cloud Over AWS in 2025](https://hipaavault.medium.com/why-healthcare-providers-are-choosing-google-cloud-over-aws-in-2025-1dd6dd6d8b01)
