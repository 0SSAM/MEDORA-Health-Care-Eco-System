/**
 * medora-delivery-schema.ts — وحدة التوصيل (Delivery): مناطق + سائقون + طلبات + سجل تتبع
 * حزمة MEDORA 2026-08-28 — السياسة: organizationId فقط، بلا branches.
 */
import { mysqlTable, int, varchar, decimal, boolean, datetime, text, index, uniqueIndex } from "drizzle-orm/mysql-core";
import { sql } from "drizzle-orm";

export const deliveryZones = mysqlTable("delivery_zones", {
  id: int("id").autoincrement().primaryKey(),
  organizationId: int("organization_id").notNull(),
  nameAr: varchar("name_ar", { length: 120 }).notNull(),
  nameEn: varchar("name_en", { length: 120 }).notNull(),
  feeEgp: decimal("fee_egp", { precision: 10, scale: 2 }).notNull().default("0"),
  minOrderEgp: decimal("min_order_egp", { precision: 10, scale: 2 }).notNull().default("0"),
  deliveryTimeMin: int("delivery_time_min").notNull().default(45),
  active: boolean("active").notNull().default(true),
  createdAt: datetime("created_at", { mode: "date" }).default(sql`CURRENT_TIMESTAMP`),
}, (t) => [index("delivery_zones_org_idx").on(t.organizationId)]);

export const deliveryDrivers = mysqlTable("delivery_drivers", {
  id: int("id").autoincrement().primaryKey(),
  organizationId: int("organization_id").notNull(),
  userId: int("user_id"),
  nameAr: varchar("name_ar", { length: 120 }).notNull(),
  phone: varchar("phone", { length: 20 }).notNull(),
  vehicleType: varchar("vehicle_type", { length: 32 }).notNull().default("motorcycle"),
  status: varchar("status", { length: 16 }).notNull().default("offline"), // available | busy | offline
  active: boolean("active").notNull().default(true),
  createdAt: datetime("created_at", { mode: "date" }).default(sql`CURRENT_TIMESTAMP`),
}, (t) => [index("delivery_drivers_org_idx").on(t.organizationId)]);

export const deliveryOrders = mysqlTable("delivery_orders", {
  id: int("id").autoincrement().primaryKey(),
  organizationId: int("organization_id").notNull(),
  orderId: int("order_id"),
  customerName: varchar("customer_name", { length: 120 }).notNull(),
  customerPhone: varchar("customer_phone", { length: 20 }).notNull(),
  addressText: varchar("address_text", { length: 255 }).notNull(),
  zoneId: int("zone_id"),
  feeEgp: decimal("fee_egp", { precision: 10, scale: 2 }).notNull().default("0"),
  status: varchar("status", { length: 20 }).notNull().default("created"), // created|assigned|picked_up|in_transit|delivered|cancelled|failed
  driverId: int("driver_id"),
  scheduledAt: datetime("scheduled_at", { mode: "date" }),
  completedAt: datetime("completed_at", { mode: "date" }),
  notes: varchar("notes", { length: 255 }),
  createdAt: datetime("created_at", { mode: "date" }).default(sql`CURRENT_TIMESTAMP`),
}, (t) => [
  index("delivery_orders_org_status_idx").on(t.organizationId, t.status),
  index("delivery_orders_org_driver_idx").on(t.organizationId, t.driverId),
]);

export const deliveryTrackingEvents = mysqlTable("delivery_tracking_events", {
  id: int("id").autoincrement().primaryKey(),
  deliveryId: int("delivery_id").notNull(),
  eventType: varchar("event_type", { length: 20 }).notNull(), // created|assigned|picked_up|in_transit|delivered|cancelled|failed|note
  noteAr: varchar("note_ar", { length: 255 }),
  lat: decimal("lat", { precision: 10, scale: 6 }),
  lng: decimal("lng", { precision: 10, scale: 6 }),
  createdAt: datetime("created_at", { mode: "date" }).default(sql`CURRENT_TIMESTAMP`),
}, (t) => [index("delivery_tracking_delivery_idx").on(t.deliveryId)]);

/** محاور انتقال صالحة في آلة الحالة */
export const DELIVERY_TRANSITIONS: Record<string, string[]> = {
  created: ["assigned", "cancelled", "failed"],
  assigned: ["picked_up", "cancelled", "failed"],
  picked_up: ["in_transit", "failed"],
  in_transit: ["delivered", "failed"],
  delivered: [],
  cancelled: [],
  failed: [],
};
