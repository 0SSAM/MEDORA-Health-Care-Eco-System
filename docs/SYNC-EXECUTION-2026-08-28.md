# Sync Execution — تنفيذ المزامنة (كود فعلي)

**2026-08-28** — تحويل تصميم `docs/SYNC-DESIGN-2026-08-28.md` إلى كود.

| المكوّن | الملف |
|---|---|
| محرك المزامنة المشترك (Outbox + LWW) | `shared/sync-engine.ts` (`ConflictResolver`, `SyncEngine`) |
| جداول المزامنة | `drizzle/sync-schema.ts` (`sync_outbox`, `sync_meta`) |
| موجّه tRPC | `server/routers/sync.ts` (`pullChanges`, `pushChanges`, `stats`) |
| ضمان الجداول | `scripts/seed-sync.mjs` |

## الانسجام مع النظام
- نفس نمط الموجّهات المحمية (protectedProcedure) والتحقق بـ Zod.
- `pullChanges` لا يعيد تغييرات الجهاز المرسل نفسه (يمنع الحلقات).
- `pushChanges` يطبّق LWW عبر `ON DUPLICATE KEY UPDATE id=id` (المفتاح: entity+device+ts).
- `SyncEngine.merge` يدمج محلي/بعيد بـ LWW ويُرجع قائمة مرتبة زمنيًا.

## الاستخدام
```bash
DATABASE_URL="mysql://user:pass@127.0.0.1:3306/medora" node scripts/seed-sync.mjs
# عبر العميل (مثال):
#   const engine = new SyncEngine("device-1", async (b) => { await call("sync.pushChanges", { deviceId:"device-1", changes:b }); });
#   engine.enqueue("customer","42","upsert",{name:"…"}); await engine.push();
#   const remote = await call("sync.pullChanges", { deviceId:"device-1", since:0 });
#   const merged = engine.merge(engine.pending, remote);
```

**لم يُنفَّذ بعد (معلن بصدق)**: ربط واجهة المستخدم الرسومية بمناطق محددة (يُضاف لكل منطقة عند الحاجة)، وناقل نشر حقيقي (WebSocket/SSE) — التصميم جاهز في `SYNC-DESIGN`.
