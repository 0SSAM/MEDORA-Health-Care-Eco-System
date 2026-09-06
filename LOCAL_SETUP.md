# MEDORA Local Setup | إعداد MEDORA محلياً

This is the canonical local-development guide for the current MEDORA repository. It intentionally keeps secrets and real production credentials out of source control.

هذا هو دليل التشغيل المحلي المعتمد للمستودع الحالي. يتعمد إبقاء الأسرار وبيانات اعتماد الإنتاج الحقيقية خارج المستودع.

## 1. Requirements | المتطلبات

Install:

- Node.js **22+**
- pnpm **10.34.5**
- Git
- MySQL 8, MariaDB, or TiDB

ثبّت:

- Node.js **22 أو أحدث**
- pnpm **10.34.5**
- Git
- MySQL 8 أو MariaDB أو TiDB

Verify:

```bash
node --version
pnpm --version
git --version
```

## 2. Clone | الاستنساخ

```bash
git clone https://github.com/0SSAM/MEDORA-Health-Care-Eco-System.git
cd MEDORA-Health-Care-Eco-System
```

**MEDORA repository rule:** work directly on `main`; do not create branches unless the repository owner explicitly changes this policy.

**قاعدة مستودع MEDORA:** اعمل مباشرة على `main`؛ لا تنشئ فروعاً إلا إذا غيّر مالك المستودع هذه السياسة صراحةً.

## 3. Install dependencies | تثبيت الاعتماديات

```bash
pnpm install --frozen-lockfile
```

This uses the committed lockfile exactly.

هذا يستخدم ملف القفل الملتزم به دون إعادة حل شجرة الاعتماديات.

## 4. Create a development database | إنشاء قاعدة بيانات للتطوير

**Never use the production database for local development.**

**لا تستخدم قاعدة بيانات الإنتاج للتشغيل المحلي مطلقاً.**

Example MySQL setup:

```sql
CREATE DATABASE medora_dev CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'medora_app'@'localhost' IDENTIFIED BY 'REPLACE_WITH_A_STRONG_LOCAL_PASSWORD';
GRANT ALL PRIVILEGES ON medora_dev.* TO 'medora_app'@'localhost';
FLUSH PRIVILEGES;
```

## 5. Configure `.env` | إعداد `.env`

Copy the template conceptually from `.env.example` and create a local `.env` in the repository root. **Never commit `.env`.**

انسخ القيم المطلوبة من `.env.example` وأنشئ ملف `.env` محلياً في جذر المستودع. **لا ترفع `.env` إلى Git.**

Minimum local configuration:

```dotenv
NODE_ENV=development
DATABASE_URL=mysql://medora_app:LOCAL_PASSWORD@127.0.0.1:3306/medora_dev
JWT_SECRET=GENERATE_A_LONG_RANDOM_VALUE
VITE_APP_ID=YOUR_OAUTH_APP_ID
OAUTH_SERVER_URL=YOUR_OAUTH_SERVER_URL
VITE_OAUTH_PORTAL_URL=YOUR_VITE_OAUTH_PORTAL_URL
OWNER_OPEN_ID=YOUR_OWNER_OPEN_ID
OWNER_NAME=MEDORA Owner
```

Optional integration variables may include:

```dotenv
BUILT_IN_FORGE_API_URL=...
BUILT_IN_FORGE_API_KEY=...
VITE_FRONTEND_FORGE_API_URL=...
VITE_FRONTEND_FORGE_API_KEY=...
```

Never place real secrets in source code, README files, screenshots, tests, issues, or commits.

لا تضع الأسرار الحقيقية في الكود أو README أو لقطات الشاشة أو الاختبارات أو Issues أو الـcommits.

## 6. Apply the database schema | تطبيق المخطط

```bash
pnpm db:push
```

The repository command generates the Drizzle migration material and applies it to the configured development database.

أمر المستودع يولد مواد ترحيل Drizzle ويطبقها على قاعدة بيانات التطوير المحددة.

## 7. Verify | التحقق

Run:

```bash
pnpm check
pnpm test
pnpm build
```

Security:

```bash
pnpm audit --prod --audit-level=high
```

Smoke verification:

```bash
bash scripts/ci-smoke.sh
```

## 8. Start | التشغيل

```bash
pnpm dev
```

Open:

```text
http://localhost:3000
```

For authenticated local development, configure your OAuth provider for the local callback:

```text
/api/oauth/callback
```

للتشغيل المحلي المصادق عليه، اضبط مزود OAuth للسماح بالـcallback المحلي أعلاه.

## 9. Public visitor sandbox | بيئة الزائر العامة

Open:

```text
http://localhost:3000/demo
```

The visitor experience requires **no username and no password**. It is a browser-side synthetic sandbox and is intentionally separated from production authentication.

تجربة الزائر لا تحتاج **اسم مستخدم ولا كلمة مرور**. وهي Sandbox اصطناعية داخل المتصفح ومنفصلة عمداً عن مصادقة الإنتاج.

The demo state uses `sessionStorage` and is cleared on page shutdown. It must contain synthetic data only. Do not enter real patient, employee, payment, credential, or production information.

تستخدم حالة التجربة `sessionStorage` ويتم تنظيفها عند إغلاق الصفحة. يجب أن تحتوي على بيانات اصطناعية فقط. لا تدخل بيانات مرضى أو موظفين أو دفع أو بيانات اعتماد أو معلومات إنتاج حقيقية.

The demo's “Admin-like” controls are a **capability simulation**, not an anonymous production-admin account and not a bypass of server-side authorization.

صلاحيات الـAdmin في التجربة هي **محاكاة لإمكانات المنتج** وليست حساب مسؤول إنتاج مجهولاً ولا تتجاوز صلاحيات الخادم.

## 10. Useful commands | أوامر سريعة

```bash
pnpm install --frozen-lockfile
pnpm db:push
pnpm check
pnpm test
pnpm build
pnpm dev
pnpm audit --prod --audit-level=high
bash scripts/ci-smoke.sh
```

Cloudflare build verification:

```bash
pnpm run build:cloudflare
pnpm dlx wrangler@4.129.0 deploy --dry-run
```

## Important files | ملفات مهمة

| Path | Purpose | الغرض |
|---|---|---|
| `package.json` | Scripts, dependencies and runtime requirements | الأوامر والاعتماديات ومتطلبات التشغيل |
| `pnpm-lock.yaml` | Reproducible dependency graph | شجرة اعتماديات قابلة لإعادة الإنتاج |
| `drizzle/schema.ts` | Database schema | مخطط قاعدة البيانات |
| `client/src/` | React UI | واجهة React |
| `server/` | API and server authorization | الـAPI وصلاحيات الخادم |
| `.github/workflows/` | CI and verification gates | بوابات CI والتحقق |
| `.env.example` | Environment template | قالب متغيرات البيئة |
| `scripts/ci-smoke.sh` | Post-build smoke verification | فحص الاستجابة بعد البناء |

## Security reminder | تذكير أمني

No legal or regulatory certification is claimed by the repository. External integrations require their applicable contracts, credentials, security review, acceptance evidence, and deployment approvals.

لا يدعي المستودع أي شهادة قانونية أو تنظيمية. تتطلب التكاملات الخارجية العقود والاعتمادات ومراجعة الأمان وأدلة القبول والموافقات اللازمة للنشر.
