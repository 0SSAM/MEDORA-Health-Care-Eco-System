# MEDORA | ميدورا — AWS Infrastructure and Scaling Strategy
# Copyright (c) 2026 Hossam Naeim Osman. All rights reserved.

## 1. Compute Layer: AWS ECS on Fargate
For the MEDORA backend, **AWS ECS on Fargate** is recommended due to its serverless nature, which eliminates the need to manage EC2 instances while providing robust scaling capabilities. [1]

| Environment | Instance Size | Scaling Policy |
| :--- | :--- | :--- |
| **Development** | 0.5 vCPU / 1GB RAM | Manual |
| **Production (Small)** | 1 vCPU / 2GB RAM | Auto Scaling (CPU > 70%) |
| **Production (Large)** | 2 vCPU / 4GB RAM | Auto Scaling (Target Tracking) |

## 2. Database Layer: Amazon RDS for MySQL
**Amazon RDS for MySQL** provides a managed, highly available database solution. [2]
- **Storage**: General Purpose SSD (gp3) with 20GB minimum.
- **High Availability**: Multi-AZ deployment for automatic failover.
- **Scaling**: Read Replicas for offloading reporting and audit log queries.

## 3. Frontend Delivery: S3 + CloudFront
The React frontend should be hosted as a static site on **Amazon S3** and served via **Amazon CloudFront**. [1]
- **Latency**: Global edge locations ensure fast loading times for multi-country users.
- **Security**: OAC (Origin Access Control) restricts S3 access to CloudFront only.

## 4. Networking and Security
- **VPC**: Isolated subnets for backend and database.
- **WAF**: Web Application Firewall to protect against common web exploits.
- **IAM**: Least-privilege access for application service roles.

## 5. References
- [1] [How to Deploy Node.js React App to AWS](https://gartsolutions.com/how-to-deploy-node-js-react-app-to-aws/)
- [2] [Building a Full AWS 3-Tier Application](https://medium.com/@lilsharkszn/building-a-full-aws-3-tier-application-node-js-react-and-rds-behind-an-alb-18dfb2b0fc8d)
