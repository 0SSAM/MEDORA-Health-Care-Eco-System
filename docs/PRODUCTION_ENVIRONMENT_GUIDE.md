# MEDORA | ميدورا — Production Environment Configuration Guide
# Copyright (c) 2026 Hossam Naeim Osman. All rights reserved.

This guide details the environment variables and configuration required for a secure production deployment of the MEDORA Integrated Health System.

## 1. Core System Variables

| Variable | Description | Security Requirement |
| :--- | :--- | :--- |
| `DATABASE_URL` | MySQL connection string: `mysql://user:pass@host:3306/db` | **High**: Must be a private, encrypted connection. |
| `JWT_SECRET` | Secret key for signing authentication tokens. | **Critical**: Minimum 64-character random string. |
| `AUDIT_SIGNING_KEY` | Key used to sign tamper-evident audit logs. | **Critical**: Must be unique and rotated annually. |
| `NODE_ENV` | Set to `production` to enable optimizations. | **Required** |
| `PORT` | The internal port the application listens on (default: 3000). | **Optional** |

## 2. Organization & Owner Setup

These variables define the root owner of the platform during initial deployment.

| Variable | Description |
| :--- | :--- |
| `OWNER_OPEN_ID` | The external OpenID of the platform owner. |
| `OWNER_NAME` | The display name for the platform owner. |

## 3. External Integrations (Optional)

| Variable | Description |
| :--- | :--- |
| `OAUTH_SERVER_URL` | The URL of the central OAuth identity provider. |
| `VITE_MEDORA_SALES_CONTACT_URL` | The public URL for sales and support inquiries. |
| `VITE_ANALYTICS_ENDPOINT` | The endpoint for privacy-preserving analytics (e.g., Umami). |
| `VITE_ANALYTICS_WEBSITE_ID` | The unique site ID for the analytics tracker. |
| `VITE_APP_ID` | The unique application identifier. |
| `VITE_APP_TITLE` | The visible title of the application (e.g., MEDORA). |
| `VITE_APP_LOGO` | The path or URL to the application logo. |
| `SHOWCASE_TEST_PASSWORD` | The password used for the automated showcase/test account. |

## 4. Security Best Practices

1.  **File Permissions**: Ensure the `.env` file is owned by the `medora` user and has `600` permissions (`chmod 600 .env`).
2.  **Database Access**: The database should NOT be accessible from the public internet. Use Docker internal networking or a VPC.
3.  **Secrets Management**: Never commit `.env` files to version control. Use a secret manager (e.g., AWS Secrets Manager, HashiCorp Vault) for enterprise deployments.
4.  **Audit Logs**: Audit logs are signed using `AUDIT_SIGNING_KEY`. If this key is lost, existing log signatures cannot be verified.

## 5. Deployment Checklist

- [ ] Docker and Docker Compose installed.
- [ ] SSL certificates generated (Let's Encrypt / Certbot).
- [ ] Nginx configured as a reverse proxy with HSTS enabled.
- [ ] Database backups scheduled and tested.
- [ ] `pnpm drizzle-kit push` executed to synchronize production schema.
