# MEDORA System Requirements and Comprehensive Usage Guide

## Introduction
The **MEDORA Integrated Health System** is a professional-grade, multi-country healthcare operations platform designed for high-trust environments. This document outlines the technical requirements for deployment and provides comprehensive instructions for end-users and administrators.

---

## 1. System Requirements

### 1.1. Infrastructure Requirements
To ensure optimal performance and compliance with healthcare standards, the following infrastructure is required:

| Component | Minimum Specification | Recommended Specification |
|-----------|-----------------------|---------------------------|
| **CPU** | 2 vCPUs | 4+ vCPUs |
| **RAM** | 4 GB | 8+ GB |
| **Storage** | 50 GB SSD | 100+ GB SSD (RAID-10 preferred) |
| **Network** | 100 Mbps | 1 Gbps+ (with DDoS protection) |
| **Database** | MySQL 8.0.x | Amazon RDS or GCP Cloud SQL (HA) |

### 1.2. Client-Side Requirements
Users accessing the web interface should meet the following criteria:
- **Browser**: Chrome 110+, Safari 16+, or Firefox 110+.
- **Display**: Minimum resolution of 1280x720 for optimal RTL layout rendering.
- **Connectivity**: Stable internet connection for real-time data synchronization.

---

## 2. Administrator "How-To" Guides

### 2.1. Initial System Setup
1. **Environment Configuration**: Copy `.env.example` to `.env` and configure the database and security keys.
2. **Database Migration**: Run `pnpm db:push` to initialize the schema.
3. **Admin Provisioning**: Create the initial organization and owner account through the controlled production provisioning procedure. Do not use test-account seed scripts or reuse test credentials.

### 2.2. Managing Organizations and Branches
- **Create Organization**: Navigate to the **Admin Dashboard** and select "Organization Management."
- **Branch Setup**: Each organization can have multiple branches. Ensure unique identifiers are used for cross-branch inventory transfers.

### 2.3. Security and Audit Management
- **Audit Logs**: All sensitive actions are logged. Access these via the **Audit Workspace** to review user activities.
- **Rate Limiting**: The system automatically limits requests. Adjust `RATE_LIMIT_MAX` in `.env` if legitimate traffic is being blocked.

---

## 3. End-User "How-To" Guides

### 3.1. Using the Finance and Accounting Workspace
- **Viewing Reports**: Access the "Finance" section from the sidebar. You can filter reports by date, branch, or organization.
- **Expense Tracking**: Use the "Miscellaneous Expenses" module to record non-inventory costs.

### 3.2. HR and Employee Management
- **Employee Onboarding**: Add new staff in the "HR Workspace." Ensure their roles are correctly assigned for RBAC enforcement.
- **Attendance**: Employees can record attendance via the **Employee Dashboard**.

### 3.3. Procurement and Inventory
- **Purchasing**: Create purchase orders in the "Procurement" section.
- **Inventory Transfers**: Use the "Inventory Management" module to move stock between branches safely.

---

## 4. Troubleshooting and Support

### 4.1. Common Issues
- **Login Failure**: Verify that the `.env` JWT secrets match and the user has been correctly provisioned in the production database. Check the server logs for specific authentication errors.
- **RTL Layout Glitches**: Clear the browser cache or update to the latest supported browser version.

### 4.2. Contacting Support
For critical technical issues, please refer to the internal **SOP** or contact the system administrator.

---
*Document Version: 1.0.0 (August 2026)*
*Engineering Team*
