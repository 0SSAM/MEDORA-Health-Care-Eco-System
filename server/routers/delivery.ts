/**
 * delivery.ts — وحدة التوصيل (Delivery Services) — حزمة MEDORA 2026-08-28.
 * مناطق + سائقون + طلبات + سجل تتبع + آلة حالات + صلاحيات RBAC (تدرّج آمن إن غابت جداول RBAC).
 * الدمج: سجّل deliveryRouter في server/routers.ts ثم drizzle-kit generate && migrate
 */
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { sql } from "drizzle-orm";
import { router, protectedProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { DELIVERY_TRANSITIONS } from "../../drizzle/medora-delivery-schema";

async function getDbOrThrow(): Promise<any> {
  const db = await getDb();
  if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "قاعدة البيانات غير متاحة." });
  return db;
}

/** عضوية منظمة فعّالة (أو مشرف منصة) */
async function dbWithOrgScope(ctx: { user: { id: number; role: string } }, organizationId: number) {
  const db = await getDbOrThrow();
  if (ctx.user.role === "admin") return db;
  const rows = (await db.execute(
    sql`SELECT id FROM organization_memberships WHERE organizationId=${organizationId} AND userId=${ctx.user.id} AND active=1 LIMIT 1`
  )) as any;
  if (!rows?.[0]?.[0]) throw new TRPCError({ code: "FORBIDDEN", message: "لا تملك عضوية فعّالة في هذه المنظمة." });
  return db;
}

/** RBAC اختياري: إن وُجدت جداول الصلاحيات تُستخدم، وإلا يُسمح للمدير/المشرف فقط. */
async function assertDeliveryPerm(db: any, ctx: { user: { id: number; role: string } }, organizationId: number, action: string) {
  if (ctx.user.role === "admin") return;
  try {
    const rows = (await db.execute(
      sql`SELECT DISTINCT p.code FROM rbac_user_roles ur
          JOIN rbac_role_permissions rp ON rp.role_id = ur.role_id
          JOIN rbac_permissions p ON p.id = rp.permission_id
          WHERE ur.organization_id=${organizationId} AND ur.user_id=${ctx.user.id}`
    )) as any;
    const codes = (rows?.[0] ?? []).map((r: any) => r.code as string);
    if (codes.includes("*") || codes.includes("delivery." + action) || codes.includes("admin." + action)) return;
    const members = (await db.execute(
      sql`SELECT organizationRole FROM organization_memberships WHERE organizationId=${organizationId} AND userId=${ctx.user.id} AND active=1 LIMIT 1`
    )) as any;
    const roleName = String(members?.[0]?.[0]?.organization_role ?? "");
    if (roleName === "manager" && ["create", "update", "view"].includes(action)) return;
    throw new TRPCError({ code: "FORBIDDEN", message: `الصلاحية مطلوبة: delivery.${action}` });
  } catch (e: any) {
    if (e instanceof TRPCError) throw e;
    // جداول RBAC غير موجودة → نسمح للمدير/المشرف فقط
    const members = (await db.execute(
      sql`SELECT organizationRole FROM organization_memberships WHERE organizationId=${organizationId} AND userId=${ctx.user.id} AND active=1 LIMIT 1`
    )) as any;
    const roleName = String(members?.[0]?.[0]?.organization_role ?? "");
    if (roleName !== "manager" && roleName !== "owner") throw new TRPCError({ code: "FORBIDDEN" });
  }
}

const zoneInput = z.object({
  nameAr: z.string().min(2).max(120),
  nameEn: z.string().min(2).max(120),
  feeEgp: z.number().nonnegative(),
  minOrderEgp: z.number().nonnegative().default(0),
  deliveryTimeMin: z.number().int().positive().default(45),
});
const driverInput = z.object({
  userId: z.number().int().positive().optional(),
  nameAr: z.string().min(2).max(120),
  phone: z.string().min(6).max(20),
  vehicleType: z.string().max(32).default("motorcycle"),
});
const orderInput = z.object({
  orderId: z.number().int().positive().optional(),
  customerName: z.string().min(2).max(120),
  customerPhone: z.string().min(6).max(20),
  addressText: z.string().min(4).max(255),
  zoneId: z.number().int().positive().optional(),
  feeEgp: z.number().nonnegative().default(0),
  scheduledAt: z.string().datetime().optional(),
  notes: z.string().max(255).optional(),
});

const VALID = ["created", "assigned", "picked_up", "in_transit", "delivered", "cancelled", "failed"] as const;

export const deliveryRouter = router({
  /* ================= المناطق ================= */
  listZones: protectedProcedure
    .input(z.object({ organizationId: z.number().int().positive() }))
    .query(async ({ ctx, input }) => {
      const db = await dbWithOrgScope(ctx as any, input.organizationId);
      const rows = (await db.execute(
        sql`SELECT id, name_ar, name_en, fee_egp, min_order_egp, delivery_time_min, active
            FROM delivery_zones WHERE organization_id=${input.organizationId} ORDER BY id`
      )) as any;
      return (rows?.[0] ?? []).map((z: any) => ({
        id: z.id, nameAr: z.name_ar, nameEn: z.name_en,
        feeEgp: Number(z.fee_egp ?? 0), minOrderEgp: Number(z.min_order_egp ?? 0),
        deliveryTimeMin: z.delivery_time_min, active: !!z.active,
      }));
    }),
  createZone: protectedProcedure
    .input(z.object({ organizationId: z.number().int().positive(), zone: zoneInput }))
    .mutation(async ({ ctx, input }) => {
      const db = await dbWithOrgScope(ctx as any, input.organizationId);
      await assertDeliveryPerm(db, ctx as any, input.organizationId, "create");
      const res = (await db.execute(
        sql`INSERT INTO delivery_zones (organization_id, name_ar, name_en, fee_egp, min_order_egp, delivery_time_min, active)
            VALUES (${input.organizationId}, ${input.zone.nameAr}, ${input.zone.nameEn}, ${input.zone.feeEgp},
                    ${input.zone.minOrderEgp}, ${input.zone.deliveryTimeMin}, 1)`
      )) as any;
      return { zoneId: Number(res?.[0]?.insertId ?? 0) };
    }),
  updateZone: protectedProcedure
    .input(z.object({ organizationId: z.number().int().positive(), zoneId: z.number().int().positive(), patch: zoneInput.partial() }))
    .mutation(async ({ ctx, input }) => {
      const db = await dbWithOrgScope(ctx as any, input.organizationId);
      await assertDeliveryPerm(db, ctx as any, input.organizationId, "update");
      const rows = (await db.execute(sql`SELECT organization_id FROM delivery_zones WHERE id=${input.zoneId}`)) as any;
      if (rows?.[0]?.[0]?.organization_id !== input.organizationId) throw new TRPCError({ code: "NOT_FOUND" });
      await db.execute(
        sql`UPDATE delivery_zones SET name_ar=${input.patch.nameAr ?? undefined}, name_en=${input.patch.nameEn ?? undefined},
            fee_egp=${input.patch.feeEgp ?? undefined}, min_order_egp=${input.patch.minOrderEgp ?? undefined},
            delivery_time_min=${input.patch.deliveryTimeMin ?? undefined} WHERE id=${input.zoneId}`
      );
      return { ok: true };
    }),
  deleteZone: protectedProcedure
    .input(z.object({ organizationId: z.number().int().positive(), zoneId: z.number().int().positive() }))
    .mutation(async ({ ctx, input }) => {
      const db = await dbWithOrgScope(ctx as any, input.organizationId);
      await assertDeliveryPerm(db, ctx as any, input.organizationId, "delete");
      await db.execute(sql`DELETE FROM delivery_zones WHERE id=${input.zoneId} AND organization_id=${input.organizationId}`);
      return { ok: true };
    }),

  /* ================= السائقون ================= */
  listDrivers: protectedProcedure
    .input(z.object({ organizationId: z.number().int().positive() }))
    .query(async ({ ctx, input }) => {
      const db = await dbWithOrgScope(ctx as any, input.organizationId);
      const rows = (await db.execute(
        sql`SELECT id, user_id, name_ar, phone, vehicle_type, status, active FROM delivery_drivers
            WHERE organization_id=${input.organizationId} ORDER BY id`
      )) as any;
      return (rows?.[0] ?? []).map((d: any) => ({
        id: d.id, userId: d.user_id, nameAr: d.name_ar, phone: d.phone,
        vehicleType: d.vehicle_type, status: d.status, active: !!d.active,
      }));
    }),
  registerDriver: protectedProcedure
    .input(z.object({ organizationId: z.number().int().positive(), driver: driverInput }))
    .mutation(async ({ ctx, input }) => {
      const db = await dbWithOrgScope(ctx as any, input.organizationId);
      await assertDeliveryPerm(db, ctx as any, input.organizationId, "create");
      const res = (await db.execute(
        sql`INSERT INTO delivery_drivers (organization_id, user_id, name_ar, phone, vehicle_type, status, active)
            VALUES (${input.organizationId}, ${input.driver.userId ?? null}, ${input.driver.nameAr}, ${input.driver.phone},
                    ${input.driver.vehicleType}, 'available', 1)`
      )) as any;
      return { driverId: Number(res?.[0]?.insertId ?? 0) };
    }),
  setDriverStatus: protectedProcedure
    .input(z.object({ organizationId: z.number().int().positive(), driverId: z.number().int().positive(), status: z.enum(["available", "busy", "offline"]) }))
    .mutation(async ({ ctx, input }) => {
      const db = await dbWithOrgScope(ctx as any, input.organizationId);
      await assertDeliveryPerm(db, ctx as any, input.organizationId, "update");
      await db.execute(sql`UPDATE delivery_drivers SET status=${input.status} WHERE id=${input.driverId} AND organization_id=${input.organizationId}`);
      return { ok: true };
    }),

  /* ================= الطلبات ================= */
  listOrders: protectedProcedure
    .input(z.object({ organizationId: z.number().int().positive(), status: z.enum(["created","assigned","picked_up","in_transit","delivered","cancelled","failed"]).optional(), limit: z.number().int().max(200).default(100) }))
    .query(async ({ ctx, input }) => {
      const db = await dbWithOrgScope(ctx as any, input.organizationId);
      const rows = (await db.execute(
        sql`SELECT o.id, o.order_id, o.customer_name, o.customer_phone, o.address_text, o.zone_id, o.fee_egp,
                   o.status, o.driver_id, o.scheduled_at, o.completed_at, o.notes, o.created_at,
                   d.name_ar AS driver_name, z.name_ar AS zone_name
            FROM delivery_orders o
            LEFT JOIN delivery_drivers d ON d.id = o.driver_id
            LEFT JOIN delivery_zones z ON z.id = o.zone_id
            WHERE o.organization_id=${input.organizationId} ${input.status ? sql`AND o.status=${input.status}` : sql``}
            ORDER BY o.id DESC LIMIT ${input.limit}`
      )) as any;
      return (rows?.[0] ?? []).map((o: any) => ({
        id: o.id, orderId: o.order_id, customerName: o.customer_name, customerPhone: o.customer_phone,
        addressText: o.address_text, zoneId: o.zone_id, feeEgp: Number(o.fee_egp ?? 0), status: o.status,
        driverId: o.driver_id, driverName: o.driver_name, zoneName: o.zone_name,
        scheduledAt: o.scheduled_at, completedAt: o.completed_at, notes: o.notes, createdAt: o.created_at,
      }));
    }),
  createDelivery: protectedProcedure
    .input(z.object({ organizationId: z.number().int().positive(), order: orderInput }))
    .mutation(async ({ ctx, input }) => {
      const db = await dbWithOrgScope(ctx as any, input.organizationId);
      await assertDeliveryPerm(db, ctx as any, input.organizationId, "create");
      const res = (await db.execute(
        sql`INSERT INTO delivery_orders (organization_id, order_id, customer_name, customer_phone, address_text,
                                         zone_id, fee_egp, status, scheduled_at, notes)
            VALUES (${input.organizationId}, ${input.order.orderId ?? null}, ${input.order.customerName}, ${input.order.customerPhone},
                    ${input.order.addressText}, ${input.order.zoneId ?? null}, ${input.order.feeEgp}, 'created',
                    ${input.order.scheduledAt ? new Date(input.order.scheduledAt) : null}, ${input.order.notes ?? null})`
      )) as any;
      const deliveryId = Number(res?.[0]?.insertId ?? 0);
      await db.execute(
        sql`INSERT INTO delivery_tracking_events (delivery_id, event_type, note_ar)
            VALUES (${deliveryId}, 'created', 'تم إنشاء طلب التوصيل')`
      );
      return { deliveryId };
    }),
  /** التعيين: driverId=0 → أول سائق متاح (تعيين تلقائي) */
  assignDelivery: protectedProcedure
    .input(z.object({ organizationId: z.number().int().positive(), deliveryId: z.number().int().positive(), driverId: z.number().int().nonnegative() }))
    .mutation(async ({ ctx, input }) => {
      const db = await dbWithOrgScope(ctx as any, input.organizationId);
      await assertDeliveryPerm(db, ctx as any, input.organizationId, "assign");
      const order = (await db.execute(
        sql`SELECT id, status FROM delivery_orders WHERE id=${input.deliveryId} AND organization_id=${input.organizationId}`
      )) as any;
      const o = order?.[0]?.[0];
      if (!o) throw new TRPCError({ code: "NOT_FOUND" });
      if (o.status !== "created") throw new TRPCError({ code: "BAD_REQUEST", message: "لا يمكن تعيين سائق إلا لطلب بحالة created" });
      let driverId = input.driverId;
      if (driverId === 0) {
        const free = (await db.execute(
          sql`SELECT id FROM delivery_drivers WHERE organization_id=${input.organizationId} AND status='available' AND active=1 ORDER BY id LIMIT 1`
        )) as any;
        driverId = Number(free?.[0]?.[0]?.id ?? 0);
        if (!driverId) throw new TRPCError({ code: "BAD_REQUEST", message: "لا يوجد سائق متاح" });
      }
      await db.execute(sql`UPDATE delivery_orders SET status='assigned', driver_id=${driverId} WHERE id=${input.deliveryId}`);
      await db.execute(sql`UPDATE delivery_drivers SET status='busy' WHERE id=${driverId}`);
      await db.execute(
        sql`INSERT INTO delivery_tracking_events (delivery_id, event_type, note_ar) VALUES (${input.deliveryId}, 'assigned', 'تم تعيين السائق')`
      );
      return { driverId };
    }),
  /** تحديث الحالة وفق آلة الانتقالات الصالحة */
  updateDeliveryStatus: protectedProcedure
    .input(z.object({ organizationId: z.number().int().positive(), deliveryId: z.number().int().positive(), status: z.enum(["created","assigned","picked_up","in_transit","delivered","cancelled","failed"]) }))
    .mutation(async ({ ctx, input }) => {
      const db = await dbWithOrgScope(ctx as any, input.organizationId);
      await assertDeliveryPerm(db, ctx as any, input.organizationId, "update");
      const order = (await db.execute(
        sql`SELECT id, status, driver_id FROM delivery_orders WHERE id=${input.deliveryId} AND organization_id=${input.organizationId}`
      )) as any;
      const o = order?.[0]?.[0];
      if (!o) throw new TRPCError({ code: "NOT_FOUND" });
      if (!DELIVERY_TRANSITIONS[o.status]?.includes(input.status)) {
        throw new TRPCError({ code: "BAD_REQUEST", message: `انتقال غير صالح: ${o.status} ← ${input.status}` });
      }
      const terminal = ["delivered", "cancelled", "failed"].includes(input.status);
      await db.execute(
        sql`UPDATE delivery_orders SET status=${input.status}, completed_at=${terminal ? sql`CURRENT_TIMESTAMP` : o.completed_at} WHERE id=${input.deliveryId}`
      );
      if (terminal && o.driver_id) await db.execute(sql`UPDATE delivery_drivers SET status='available' WHERE id=${o.driver_id}`);
      const note = {
        created: "تم إنشاء الطلب", assigned: "تم تعيين السائق",
        picked_up: "تم التقاط الشحنة", in_transit: "الشحنة في الطريق",
        delivered: "تم التسليم بنجاح", cancelled: "تم إلغاء الطلب", failed: "فشل التوصيل",
      }[input.status] ?? input.status;
      await db.execute(
        sql`INSERT INTO delivery_tracking_events (delivery_id, event_type, note_ar) VALUES (${input.deliveryId}, ${input.status}, ${note})`
      );
      return { ok: true };
    }),
  cancelDelivery: protectedProcedure
    .input(z.object({ organizationId: z.number().int().positive(), deliveryId: z.number().int().positive(), reason: z.string().max(255).optional() }))
    .mutation(async ({ ctx, input }) => {
      const db = await dbWithOrgScope(ctx as any, input.organizationId);
      await assertDeliveryPerm(db, ctx as any, input.organizationId, "update");
      const order = (await db.execute(
        sql`SELECT id, status, driver_id FROM delivery_orders WHERE id=${input.deliveryId} AND organization_id=${input.organizationId}`
      )) as any;
      const o = order?.[0]?.[0];
      if (!o) throw new TRPCError({ code: "NOT_FOUND" });
      if (!DELIVERY_TRANSITIONS[o.status]?.includes("cancelled")) throw new TRPCError({ code: "BAD_REQUEST", message: "لا يمكن إلغاء طلب بهذه الحالة" });
      await db.execute(sql`UPDATE delivery_orders SET status='cancelled', completed_at=CURRENT_TIMESTAMP WHERE id=${input.deliveryId}`);
      if (o.driver_id) await db.execute(sql`UPDATE delivery_drivers SET status='available' WHERE id=${o.driver_id}`);
      await db.execute(sql`INSERT INTO delivery_tracking_events (delivery_id, event_type, note_ar) VALUES (${input.deliveryId}, 'cancelled', ${input.reason ?? "أُلغي الطلب"})`);
      return { ok: true };
    }),
  trackDelivery: protectedProcedure
    .input(z.object({ organizationId: z.number().int().positive(), deliveryId: z.number().int().positive() }))
    .query(async ({ ctx, input }) => {
      const db = await dbWithOrgScope(ctx as any, input.organizationId);
      const o = (await db.execute(
        sql`SELECT o.id, o.status, o.customer_name, o.address_text, o.fee_egp, d.name_ar AS driver_name, d.phone AS driver_phone
            FROM delivery_orders o LEFT JOIN delivery_drivers d ON d.id = o.driver_id
            WHERE o.id=${input.deliveryId} AND o.organization_id=${input.organizationId}`
      )) as any;
      const order = o?.[0]?.[0];
      if (!order) throw new TRPCError({ code: "NOT_FOUND" });
      const ev = (await db.execute(
        sql`SELECT event_type, note_ar, lat, lng, created_at FROM delivery_tracking_events
            WHERE delivery_id=${input.deliveryId} ORDER BY id`
      )) as any;
      return {
        id: order.id, status: order.status, customerName: order.customer_name, addressText: order.address_text,
        feeEgp: Number(order.fee_egp ?? 0), driverName: order.driver_name, driverPhone: order.driver_phone,
        events: (ev?.[0] ?? []).map((e: any) => ({
          eventType: e.event_type, noteAr: e.note_ar, lat: e.lat ? Number(e.lat) : null, lng: e.lng ? Number(e.lng) : null, createdAt: e.created_at,
        })),
      };
    }),
  deliveryStats: protectedProcedure
    .input(z.object({ organizationId: z.number().int().positive() }))
    .query(async ({ ctx, input }) => {
      const db = await dbWithOrgScope(ctx as any, input.organizationId);
      const rows = (await db.execute(
        sql`SELECT status, COUNT(*) AS c FROM delivery_orders WHERE organization_id=${input.organizationId} GROUP BY status`
      )) as any;
      const map: Record<string, number> = {};
      for (const r of rows?.[0] ?? []) map[r.status] = Number(r.c);
      const drivers = (await db.execute(
        sql`SELECT status, COUNT(*) AS c FROM delivery_drivers WHERE organization_id=${input.organizationId} GROUP BY status`
      )) as any;
      const dmap: Record<string, number> = {};
      for (const r of drivers?.[0] ?? []) dmap[r.status] = Number(r.c);
      return { orders: map, drivers: dmap };
    }),
});
