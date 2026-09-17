# MEDORA — حزمة التوصيل وإدارة اعتماديات الأدمن (2026-08-28)

**السياسة:** التطوير على `main` مباشرة — بلا فروع (No branches).

## 1) وحدة التوصيل (Delivery Services)

| الملف | الوظيفة |
|---|---|
| `drizzle/medora-delivery-schema.ts` | 4 جداول: `delivery_zones`, `delivery_drivers`, `delivery_orders`, `delivery_tracking_events` + آلة الانتقالات `DELIVERY_TRANSITIONS` |
| `server/routers/delivery.ts` | موجّه tRPC كامل: مناطق (4)، سائقون (3)، طلبات (6)، تتبع، إحصاءات — بوابات RBAC |
| `client/src/pages/Delivery.tsx` | لوحة واجهة عربية RTL: الطلبات/السائقون/المناطق/التتبع (fetch مباشر على tRPC) |
| `scripts/seed-delivery-zones.mjs` | بذرة 8 مناطق مصرية (القاهرة 45 ج.م، الجيزة 55… ) + سائق تجريبي — idempotent |

**آلة الحالات:** `created → assigned → picked_up → in_transit → delivered`، مع `cancelled` من created/assigned و `failed` من أي حالة نشطة. كل انتقال يُسجَّل في `delivery_tracking_events` ويحرّر السائق عند النهاية.

**التعيين التلقائي:** `assignDelivery {driverId:0}` يختار أول سائق `available` — أو يرجع "لا يوجد سائق متاح".

**RBAC:** إجراءات الكتابة تتطلب صلاحية `delivery.create/update/delete/assign` أو `admin.*`؛ مع تدرّج آمن: إن غابت جداول RBAC يُسمح لـ manager/owner فقط، وكلها خلف `assertSessionScope`-style (عضوية فعّالة).

## 2) تغيير اسم المستخدم وكلمة المرور (الأدمن فقط)

`server/routers/adminAccount.ts` — موجّه `adminAccount`:

- `changeUsername {organizationId, currentPassword, newUsername}` — يتحقق من كلمة المرور الحالية بدالة التطبيق `verifyInternalPassword`، يوحّد الاسم بـ `normalizeInternalUsername`، يمنع التكرار، **يلغي كل جلسات الحساب**.
- `changePassword {organizationId, currentPassword, newPassword}` — يتحقق من الحالية، يطبق `assertPasswordPolicy` (≥ 12 حرفًا)، يجزّئ الجديدة بـ `hashInternalPassword` (scrypt كما في التطبيق)، يصفّر `failed_attempts/locked_until`، **يلغي كل الجلسات** (إعادة دخول إلزامية).
- `passwordPolicyCheck` — مساعدة للواجهة (تحقق من القوة قبل الإرسال).
- الحرس: `ctx.user.role !== "admin"` → FORBIDDEN. لا يمكن تغيير الأدوار من هنا (لا رفع صلاحيات).

## 3) التركيب والتحقق (خطوات دقيقة)

```bash
# 1) استيراد السكيمات الجديدة في drizzle/schema.ts:
#    import "./medora-delivery-schema";   import "./medora-upgrade-schema";
npm run db:push          # أو drizzle-kit generate && drizzle-kit migrate

# 2) تسجيل الموجّهات في server/routers.ts:
#    delivery: deliveryRouter,   adminAccount: adminAccountRouter,
#    (rbac و aiReview من الحزمة السابقة)

# 3) البذور:
DATABASE_URL="mysql://medora:medora@127.0.0.1:3306/medora" \
  node scripts/seed-delivery-zones.mjs
DATABASE_URL="mysql://medora:medora@127.0.0.1:3306/medora" \
  node scripts/seed-rbac-and-roles.mjs

# 4) مسار الواجهة: أضِف في client/src/App.tsx
#    const DeliveryPage = lazy(() => import("./pages/Delivery"));
#    <Route path="/delivery" component={DeliveryPage} />

# 5) اختبار:
curl -X POST "http://localhost:3000/api/trpc/delivery.listZones?batch=1" \
  -H 'Content-Type: application/json' --data '{"0":{"json":{"organizationId":1}}}'
curl -X POST "http://localhost:3000/api/trpc/adminAccount.passwordPolicyCheck?batch=1" \
  -H 'Content-Type: application/json' --data '{"0":{"json":{"password":"StrongPass123!"}}}'
```

## 4) الملفات القابلة للتثبيت — الواقع بدقة

| الطلب | الحالة |
|---|---|
| **zip الكود الكامل** | ✅ يُبنى ويُرفع (يتضمن كل الحزم + التطبيق المبني `dist/`) |
| **.exe (ويندوز)** | ❌ لا يمكن بناؤه هنا: يتطلب Electron/Tauri في المشروع (غير موجود) + سلسلة أدوات Windows. |
| **.apk (أندرويد)** | ❌ لا يمكن بناؤه هنا: يتطلب Capacitor/Cordova مهيأ فعليًا + Android SDK/Java + توقيع. المجلد `native-wrapper-reference/android` مرجعي فقط (ليس مشروع Android حقيقي). |
| **.ipa (آيفون)** | ❌ مستحيل هنا: يتطلب macOS + Xcode + Apple signing. |

**البديل العملي المقدَّم:** zip شامل (كود + `dist/` الجاهز للنشر كموقع ثابت/PWA + سكربتات تثبيت `install.sh` و `install.bat` + docker-compose لقاعدة MariaDB + التطبيق). خطوات البناء الفعلية للأنظمة الثلاثة موثقة في `docs/BUILD-TARGETS.md`.

## 5) التحسينات الإضافية المضافة (طلبات "أضف ما ينقص")

- RBAC كامل (سابقًا) + وحدة التوصيل + إدارة اعتماديات الأدمن (هذه الحزمة).
- سجل تتبع append-only لكل توصيلة (تدقيق).
- تعيين تلقائي للسائق + تحرير تلقائي عند الإنهاء.
- بوابات صلاحيات على كل إجراء كتابة.
- لوحة واجهة عربية RTL مستقلة (لا تعتمد على خطافات داخلية).
