# MEDORA Local Setup

هذا الملف يشرح تشغيل MEDORA محلياً. لا يحتوي الأرشيف على الأسرار أو ملفات البيئة الحقيقية عمداً.

## المتطلبات

ثبّت Node.js 22 أو إصداراً متوافقاً، وpnpm، وMySQL 8 أو MariaDB أو TiDB. أنشئ قاعدة تطوير منفصلة ولا تستخدم قاعدة الإنتاج.

## التثبيت

```bash
pnpm install --frozen-lockfile
```

## قاعدة البيانات

نفّذ من حساب إداري في MySQL:

```sql
CREATE DATABASE medora_dev CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'medora_app'@'localhost' IDENTIFIED BY 'ضع_كلمة_مرور_محلية_قوية';
GRANT ALL PRIVILEGES ON medora_dev.* TO 'medora_app'@'localhost';
FLUSH PRIVILEGES;
```

## متغيرات البيئة

أنشئ ملف `.env` محلياً في جذر المشروع، ولا ترفعه إلى GitHub. استخدم القيم التي يوفرها مدير الأسرار أو مزود OAuth الخاص بك. الحد الأدنى هو:

```dotenv
NODE_ENV=development
DATABASE_URL=mysql://medora_app:LOCAL_PASSWORD@127.0.0.1:3306/medora_dev
JWT_SECRET=GENERATE_A_LONG_RANDOM_VALUE
VITE_APP_ID=YOUR_OAUTH_APP_ID
OAUTH_SERVER_URL=YOUR_OAUTH_SERVER_URL
VITE_OAUTH_PORTAL_URL=YOUR_OAUTH_PORTAL_URL
OWNER_OPEN_ID=YOUR_OWNER_OPEN_ID
OWNER_NAME=MEDORA Owner
```

الخدمات المدمجة قد تحتاج أيضاً إلى `BUILT_IN_FORGE_API_URL` و`BUILT_IN_FORGE_API_KEY` و`VITE_FRONTEND_FORGE_API_URL` و`VITE_FRONTEND_FORGE_API_KEY`. لا تضع مفاتيح حقيقية في الكود أو في هذا الملف.

لا توجد حسابات عرض أو اختبارات ثابتة. استخدم هويات مؤقتة داخل قاعدة بيانات اختبار منفصلة عند الحاجة، ولا تحفظ كلمات المرور أو الرموز في المستودع.

## المخطط والتشغيل

بعد ضبط `.env` نفّذ:

```bash
pnpm db:push
pnpm check
pnpm test
pnpm build
pnpm dev
```

افتح `http://localhost:3000`. للمصادقة الكاملة يجب تسجيل callback المحلي `/api/oauth/callback` لدى مزود OAuth. لا تستخدم حسابات أو بيانات صحية حقيقية في بيئة التطوير.

## التحقق الأمني

```bash
pnpm audit --prod --audit-level=high
pnpm check
pnpm test
pnpm build
bash scripts/ci-smoke.sh
```

يجب مراجعة تغييرات Dependabot عبر Pull Request، وعدم دمج تحديثات كبرى أو تغييرات في الصلاحيات أو المخطط دون مراجعة واختبارات مناسبة.

## ملفات مهمة

| المسار | الغرض |
|---|---|
| `package.json` | أوامر المشروع والاعتماديات المباشرة |
| `pnpm-lock.yaml` | الإصدارات المثبتة القابلة لإعادة الإنتاج |
| `drizzle/schema.ts` | مخطط قاعدة البيانات |
| `.github/workflows/ci.yml` | فحوص TypeScript والاختبارات والبناء والأمن |
| `.github/dependabot.yml` | تحديثات الاعتماديات الأسبوعية |
| `scripts/ci-smoke.sh` | فحص استجابة آمن بعد البناء |
| `docs/security-automation-and-monitoring-policy.md` | سياسة الأمن والصيانة والمراقبة |
