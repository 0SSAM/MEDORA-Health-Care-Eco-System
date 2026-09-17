#!/usr/bin/env node
/**
 * seed-delivery-zones.mjs — بذرة مناطق التوصيل المصرية + سائق تجريبي
 * حزمة MEDORA 2026-08-28 — idempotent.
 * الاستخدام: DATABASE_URL="mysql://..." node scripts/seed-delivery-zones.mjs
 */
import mysql from "mysql2/promise";

const db = await mysql.createConnection(
  process.env.DATABASE_URL || "mysql://medora:medora@127.0.0.1:3306/medora"
);

const ZONES = [
  { ar: "القاهرة", en: "Cairo", fee: 45, min: 150, minutes: 45 },
  { ar: "الجيزة", en: "Giza", fee: 55, min: 200, minutes: 50 },
  { ar: "الإسكندرية", en: "Alexandria", fee: 60, min: 200, minutes: 60 },
  { ar: "المنصورة", en: "Mansoura", fee: 40, min: 100, minutes: 40 },
  { ar: "طنطا", en: "Tanta", fee: 40, min: 100, minutes: 40 },
  { ar: "أسيوط", en: "Assiut", fee: 35, min: 100, minutes: 45 },
  { ar: "الأقصر", en: "Luxor", fee: 35, min: 100, minutes: 45 },
  { ar: "الغردقة", en: "Hurghada", fee: 60, min: 250, minutes: 60 },
];

const [orgs] = await db.query("SELECT id FROM organizations");
if (!orgs.length) {
  console.log("[zones] لا منشآت — تخطّي");
  await db.end();
  process.exit(0);
}
let z = 0;
for (const o of orgs) {
  for (const zone of ZONES) {
    const [exist] = await db.query("SELECT id FROM delivery_zones WHERE organization_id=? AND name_ar=?", [o.id, zone.ar]);
    if (!exist.length) {
      await db.query(
        "INSERT INTO delivery_zones (organization_id,name_ar,name_en,fee_egp,min_order_egp,delivery_time_min,active) VALUES (?,?,?,?,?,?,1)",
        [o.id, zone.ar, zone.en, zone.fee, zone.min, zone.minutes]
      );
      z++;
    }
  }
  const [d] = await db.query("SELECT id FROM delivery_drivers WHERE organization_id=? AND phone='01000000000'", [o.id]);
  if (!d.length) {
    await db.query(
      "INSERT INTO delivery_drivers (organization_id,name_ar,phone,vehicle_type,status,active) VALUES (?,?,?,?,?,1)",
      [o.id, "سائق التوصيل التجريبي", "01000000000", "motorcycle", "available"]
    );
  }
}
console.log(`[done] مناطق جديدة: ${z} — لكل منشأة ${ZONES.length} منطقة + سائق تجريبي`);
await db.end();
