# MEDORA Health Care Eco System

> ميدورا — نظام رعاية صحية متكامل، مجاني ومفتوح المصدر (MIT) | Integrated, free & open-source healthcare platform.

## Safety boundaries — حدود السلامة (دوّنها بلا مبالغة)

- **Organization, branch, and jurisdiction**: every record is scoped to an organization, branch, and jurisdiction.
- **Jurisdiction ID `0` is a valid legal scope**: النظام يتعامل مع النطاق القانوني `0` كنطاق صالح (لا يُعامل كـ"غير محدد").
- **The AI assistant is advisory-only**: توصيات الذكاء الاصطناعي استشارية فقط ولا تُتخذ كقرار سريري أو قانوني.
- **Browser code is never claimed to prevent OS-level or physical capture absolutely**: حماية الشاشة في المتصفح لا تُزعم بأنها تمنع الالتقاط على مستوى النظام أو الفيزيائي بشكل مطلق.
- **No legal or regulatory certification is claimed**: لا يُدعى أي اعتماد قانوني أو تنظيمي (لا FDA/EMA ولا EDA/UPA إلا عبر الموصلات الرسمية عند التفعيل).

---

## Features & Modules — المكوّنات

| الوحدة | الوصف |
|---|---|
| CRM / ERP / HR / POS | إدارة العملاء، المحاسبة، الموارد البشرية، نقطة البيع |
| Egyptian drug catalog | قاعدة الأدوية المصرية (25,094 دواء) في `data/egyptian-drugs.csv` |
| e-Prescriptions | وصفات إلكترونية مربوطة بـ ICD-11 (`icd11_code`, `icd11_version`) |
| Delivery | خدمة التوصيل: مناطق (8)، طلبات، سائقون، تتبع |
| AI Review / GP MAX | مراجعة آلية للنمو (L0–L7, 96 نقطة) + حاسبة KPI وخطة 30 يومًا |
| RBAC | 73 صلاحية × 10 أدوار عبر حساب الأدمن |
| Offline sync | مزامنة عدم الاتصال (Outbox + LWW) — `shared/sync-engine.ts`, `server/routers/sync.ts` |
| PWA | تثبيت كتطبيق (manifest, service worker) على جميع الأجهزة |

## Requirements — المتطلبات

- Node.js ≥ 22، npm ≥ 10، MySQL/MariaDB (أو Docker).

## Quick start — التشغيل السريع

```bash
# Docker (الأسهل)
cp .env.example .env
docker compose up --build -d        # http://localhost:3000

# يدويًا
npm ci
cp .env.example .env                # عدّل DATABASE_URL
npm run db:push                     # ترحيل المخططات
node scripts/seed-rbac-and-roles.mjs
node scripts/seed-delivery-zones.mjs
node scripts/seed-gp-max.mjs
node scripts/seed-icd11.mjs         # 31 رمزًا ابتدائيًا (الخطية الكاملة عبر --data)
node scripts/seed-dispensing.mjs
node scripts/seed-sync.mjs
npm run dev                         # http://localhost:3000
```

**أول تسجيل دخول**: `admin / admin` (أنشأه سكربت التزويد: `node scripts/provision-medora.mjs --admin admin:admin`).

## Project structure — البنية

```
server/routers/   → tRPC endpoints (erp, crm, delivery, gp-max, icd11, sync, …)
drizzle/          → مخططات قاعدة البيانات
shared/           → كود مشترك (kpi, sync-engine)
client/src/pages/ → واجهات (Workspace, POS, Delivery, GpMax, Icd11, …)
scripts/          → زراعة البيانات والتهيئة
docs/             → التوثيق (audits, دليل التركيب، الأمان)
```

## Contributing — المساهمة

راجع [CONTRIBUTING.md](CONTRIBUTING.md)، [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md)، و[SECURITY.md](SECURITY.md). افتح Issue/PR عبر القوالب في `.github/`.

## License — الترخيص

MIT — انظر [LICENSE](LICENSE) و[NOTICE](NOTICE). المشروع مجاني بالكامل ومفتوح المصدر.
