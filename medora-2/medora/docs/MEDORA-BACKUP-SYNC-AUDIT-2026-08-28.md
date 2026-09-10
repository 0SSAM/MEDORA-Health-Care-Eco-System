# تدقيق النسخ الاحتياطي والمزامنة — MEDORA (2026-08-28)
# Backup & Sync Audit

> من قراءة فعلية لملفات الجلسة. الوضع حسب الأدلة فقط.

## النسخ الاحتياطي — يُعدّ **مكتملًا** ✅

| العنصر | المسار الفعلي | الحالة |
|---|---|---|
| سياسات جدولة | `backup_policies`, `backup_runs` (جداول في `drizzle/schema.ts`) | ✅ |
| موجه tRPC | `server/routers/backup.ts` — `validateBackupCron` (6 حقول، ثانية=0، حد أدنى 15 دقيقة)، إجراءات policy/run/restore/audit | ✅ |
| منفّذ مجدول | `server/scheduled/backups.ts` + ربط بالقلب `server/_core/index.ts` (`/api/scheduled/...` مع `scheduledCallbackRateLimit`) | ✅ |
| نبض خارجي (heartbeat) | `server/_core/heartbeat.ts` (createHeartbeatJob) — إنتاجي فقط | ✅ |
| تخزين | `server/storage.ts` (Forge/S3 presigned + تجزئة أسماء الملفات) | ✅ |
| سجل التدقيق | `audit_logs` عام | ✅ |

## المزامنة — **جزئية** 🟡

| العنصر | المسار الفعلي | الحالة |
|---|---|---|
| مزامنة الكتالوج (عناصر) | `catalog_sync_queue` (جدول) + `server/routers/operations.ts` إشارات | ✅ جزئية (قائمة انتظار فقط) |
| مزامنة غير متصلة (Offline-first) | لا يوجد كود replication/conflict/offline في `server/` | ⚠️ غير موجود |
| حل تعارضات | لا يوجد | ⚠️ غير موجود |
| P2P بين الفروع | لا يوجد (ومخالف لسياسة "لا فروع") | ⚠️ غير موجود |

## الخلاصة
- النسخ الاحتياطي مكتمل الشكل ويحتاج فقط تهيئة سياسة cron فعلية + اختبار استرجاع شهري.
- المزامنة الحالية تقتصر على قائمة انتظار مزامنة الكتالوج؛ **المزامنة غير المتصلة + حل التعارضات طريقٌ مفتوح للمساهمة** (انظر CONTRIBUTING).
