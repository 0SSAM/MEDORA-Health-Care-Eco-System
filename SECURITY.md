# Security Policy — سياسة الأمان

- **Reporting:** create a private disclosure via GitHub Security Advisories, or email the maintainers (see repo About). Never open a public issue with PHI or credentials.
- **Supported:** latest `main` only.
- **Baseline hardening (verified in code):**
  - scrypt password hashing (`server/domain/internal-auth.ts`, N=16384, r=8, p=1) + per-account lockout & hashed sessions.
  - `assertSessionScope` + optional RBAC `assertPermission` on every sensitive procedure.
  - zod validation on all inputs; append-only audit logs; signed audit records.
- **Deployment requirements:** TLS 1.2+, `HttpOnly`+`Secure`+`SameSite` cookies, secrets via env only, encrypted backups with quarterly restore tests, de-identified exports to Google Sheets (no BAA on free tier), NPHIES/PDPL compliance review for Saudi deployments.
