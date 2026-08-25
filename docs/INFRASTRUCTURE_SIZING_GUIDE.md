# MEDORA | ميدورا — Infrastructure Sizing and Scaling Guide
# Copyright (c) 2026 Hossam Naeim Osman. All rights reserved.

## Executive Summary

The MEDORA Integrated Health System requires a robust, secure, and scalable infrastructure to support multi-country healthcare operations. This guide provides comprehensive sizing and scaling recommendations for two primary cloud providers: **Amazon Web Services (AWS)** and **Google Cloud Platform (GCP)**. The recommendations are based on a 3-tier architecture consisting of a React frontend, a Node.js backend, and a MySQL database, all optimized for healthcare compliance and performance. [1] [2]

## 1. Workload Analysis and Resource Requirements

The MEDORA platform is characterized by a mix of real-time transactional workloads (e.g., patient registration, prescriptions) and data-intensive reporting tasks (e.g., financial audits, performance metrics). [3]

| Component | Resource Intensity | Scaling Driver |
| :--- | :--- | :--- |
| **Frontend (React)** | Low (Static Assets) | Global user distribution |
| **Backend (Node.js)** | Medium to High | Concurrent user sessions, background jobs |
| **Database (MySQL)** | High (I/O & Memory) | Data volume, audit logging, complex queries |

## 2. AWS Infrastructure Sizing and Scaling

AWS offers a mature ecosystem with established healthcare compliance (BAA) and a wide range of compute and database options. [1] [4]

### 2.1 Compute: ECS on Fargate
**AWS ECS on Fargate** is recommended for the backend to eliminate server management overhead while ensuring seamless horizontal scaling. [1]

| Environment | Instance Configuration | Auto-Scaling Trigger |
| :--- | :--- | :--- |
| **Small (up to 50 users)** | 1 vCPU / 2GB RAM | CPU Utilization > 70% |
| **Medium (up to 200 users)** | 2 vCPU / 4GB RAM | Memory Utilization > 80% |
| **Large (200+ users)** | 4 vCPU / 8GB RAM | Target Tracking (Request Count) |

### 2.2 Database: RDS for MySQL
**Amazon RDS** provides high availability through Multi-AZ deployments and performance optimization via Read Replicas. [4]

- **Instance Type**: `db.t3.medium` for small deployments, `db.m5.large` for production.
- **Storage**: General Purpose SSD (gp3) with IOPS scaling.
- **Scaling**: Implement Read Replicas to offload audit log and financial reporting queries.

## 3. GCP Infrastructure Sizing and Scaling

GCP is distinguished by its deep integration of AI/ML tools and healthcare-specific APIs, making it an attractive choice for innovative healthcare providers. [2] [5]

### 3.1 Compute: Cloud Run
**Cloud Run** provides a highly efficient, request-based scaling model that can scale to zero during periods of inactivity. [2]

| Tier | vCPU / RAM | Max Concurrency |
| :--- | :--- | :--- |
| **Standard** | 1 vCPU / 2GB RAM | 80 requests/instance |
| **Performance** | 2 vCPU / 4GB RAM | 250 requests/instance |

### 3.2 Database: Cloud SQL
**Cloud SQL for MySQL** offers managed database services with automatic storage increases and regional failover. [2] [5]

- **Machine Type**: `db-n1-standard-1` for basic needs, `db-n1-standard-2` for production.
- **Availability**: Regional High Availability (HA) configuration.
- **Analytics**: Direct integration with **BigQuery** for population health and large-scale data analysis.

## 4. Scaling and Availability Matrix

Regardless of the provider, a multi-tier scaling strategy is essential for system stability. [1] [2]

| Strategy | AWS Service | GCP Service | Benefit |
| :--- | :--- | :--- | :--- |
| **Horizontal Scaling** | Auto Scaling Groups | Managed Instance Groups | Handles traffic spikes |
| **Global Delivery** | CloudFront (CDN) | Cloud CDN | Reduces latency for RTL UI |
| **Load Balancing** | Application Load Balancer | Cloud Load Balancing | Distributes traffic securely |
| **High Availability** | Multi-AZ Deployment | Regional HA | Ensures 99.9% uptime |

## 5. Security and Compliance Considerations

Healthcare data protection is non-negotiable. Both providers support HIPAA-eligible configurations. [2] [4]

> "Google Cloud is often noted for offering clearer documentation and tools that simplify compliance for healthcare IT teams. This clarity can be valuable when navigating audits or configuring access controls to protect PHI." [5]

- **Encryption**: Data must be encrypted at rest (KMS/Cloud KMS) and in transit (TLS 1.3).
- **Audit Logging**: Maintain signed, tamper-evident logs for all data access.
- **Networking**: Use private subnets and VPC peering to isolate sensitive data.

## 6. References
- [1] [How to Deploy Node.js React App to AWS](https://gartsolutions.com/how-to-deploy-node-js-react-app-to-aws/)
- [2] [GCP Healthcare: Secure & Scalable Solutions](https://statusneo.com/gcp-healthcare-secure-scalable-solutions/)
- [3] [MEDORA Integrated Health System - Technical Architecture](https://github.com/MEDORA-Health-Care-Eco-System/MEDORA-Health-Care-Eco-System)
- [4] [Building a Full AWS 3-Tier Application](https://medium.com/@lilsharkszn/building-a-full-aws-3-tier-application-node-js-react-and-rds-behind-an-alb-18dfb2b0fc8d)
- [5] [Why Healthcare Providers Are Choosing Google Cloud Over AWS in 2025](https://hipaavault.medium.com/why-healthcare-providers-are-choosing-google-cloud-over-aws-in-2025-1dd6dd6d8b01)
