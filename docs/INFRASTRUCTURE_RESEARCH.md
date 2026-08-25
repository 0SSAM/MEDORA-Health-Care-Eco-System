# MEDORA | ميدورا — Infrastructure Research Findings
# Copyright (c) 2026 Hossam Naeim Osman. All rights reserved.

## 1. Resource Requirements Analysis
Based on the `package.json` and system architecture:
- **Backend**: Node.js (Express + tRPC) requires a runtime with sufficient memory for concurrent connections and background jobs (e.g., audit hashing, reports).
- **Frontend**: React 19 static build can be served via CDN or Nginx.
- **Database**: MySQL 8 (Drizzle ORM) requires high availability and ACID compliance for healthcare data.
- **Security**: HIPAA/HITRUST compliance is a primary requirement for healthcare operations.

## 2. Cloud Provider Comparison (Healthcare Focus)

| Feature | AWS (Amazon Web Services) | GCP (Google Cloud Platform) |
| :--- | :--- | :--- |
| **Healthcare Focus** | Broad services, established compliance (BAA). | Deep AI/ML integration, Healthcare API (FHIR/HL7). [1] |
| **Compute** | EC2, ECS (Fargate), EKS (Kubernetes). | Compute Engine, Cloud Run, GKE. [2] |
| **Database** | RDS (MySQL/Aurora). | Cloud SQL (MySQL). [2] |
| **Compliance** | FedRAMP High, HITRUST, SOC 1/2/3. | HITRUST, FedRAMP High, HIPAA-ready. [1] |
| **Pricing** | Reserved Instances (up to 72% savings). | Sustained Use Discounts, transparent pricing. [1] [3] |

## 3. Scaling Strategies
- **Vertical Scaling**: Increasing instance size (CPU/RAM) for monolithic backend components.
- **Horizontal Scaling**: Using Load Balancers (ALB on AWS, Cloud Load Balancing on GCP) with Auto Scaling Groups or GKE clusters. [2] [4]
- **Database Scaling**: Read replicas for reports/audit logs; multi-AZ for high availability. [4]

## 4. References
- [1] [Why Healthcare Providers Are Choosing Google Cloud Over AWS in 2025](https://hipaavault.medium.com/why-healthcare-providers-are-choosing-google-cloud-over-aws-in-2025-1dd6dd6d8b01)
- [2] [GCP Healthcare: Secure & Scalable Solutions](https://statusneo.com/gcp-healthcare-secure-scalable-solutions/)
- [3] [GCP vs. AWS: Which One to Choose?](https://www.fivetran.com/learn/gcp-vs-aws)
- [4] [Building a Full AWS 3-Tier Application](https://medium.com/@lilsharkszn/building-a-full-aws-3-tier-application-node-js-react-and-rds-behind-an-alb-18dfb2b0fc8d)
