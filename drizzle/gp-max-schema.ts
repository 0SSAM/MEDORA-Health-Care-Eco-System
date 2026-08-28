// GP MAX — growth-audit module schema (scaffold stage: tables only, no router/UI wiring yet)
// Layers L0–L7, checkpoints, assessments, recommendations.
import {
  mysqlTable,
  varchar,
  text,
  int,
  tinyint,
  datetime,
  index,
} from "drizzle-orm/mysql-core";

export const GpMaxLayers = mysqlTable(
  "gp_max_layers",
  {
    id: int("id").autoincrement().primaryKey(),
    layerCode: varchar("layerCode", { length: 8 }).notNull().unique(),
    layerNameAr: varchar("layerNameAr", { length: 255 }).notNull(),
    layerNameEn: varchar("layerNameEn", { length: 255 }).notNull(),
    description: text("description"),
    sortOrder: int("sortOrder").notNull().default(0),
  },
);

export const GpMaxCheckpoints = mysqlTable(
  "gp_max_checkpoints",
  {
    id: int("id").autoincrement().primaryKey(),
    layerId: int("layerId").notNull(),
    code: varchar("code", { length: 32 }).notNull().unique(),
    titleAr: varchar("titleAr", { length: 255 }).notNull(),
    titleEn: varchar("titleEn", { length: 255 }).notNull(),
    category: varchar("category", { length: 64 }),
    weight: int("weight").notNull().default(1),
    passingCriteria: text("passingCriteria"),
    active: tinyint("active").notNull().default(1),
  },
  (t) => [index("gp_max_ckpt_layer_idx").on(t.layerId)],
);

export const GpMaxAssessments = mysqlTable(
  "gp_max_assessments",
  {
    id: int("id").autoincrement().primaryKey(),
    organizationId: int("organizationId").notNull(),
    layerCode: varchar("layerCode", { length: 8 }),
    status: varchar("status", { length: 16 }).notNull().default("draft"),
    score: int("score"),
    summary: text("summary"),
    createdAt: datetime("createdAt").notNull(),
    completedAt: datetime("completedAt"),
  },
  (t) => [index("gp_max_assmt_org_idx").on(t.organizationId)],
);

export const GpMaxRecommendations = mysqlTable(
  "gp_max_recommendations",
  {
    id: int("id").autoincrement().primaryKey(),
    assessmentId: int("assessmentId").notNull(),
    checkpointId: int("checkpointId"),
    priority: varchar("priority", { length: 4 }).notNull().default("P2"),
    recommendationAr: text("recommendationAr"),
    recommendationEn: text("recommendationEn"),
    resolved: tinyint("resolved").notNull().default(0),
  },
  (t) => [index("gp_max_rec_assmt_idx").on(t.assessmentId)],
);
