// icd11-schema.ts — ICD-11 codes table (reference). جدول رموز التصنيف الدولي للأمراض الإصدار 11.
import {
  mysqlTable,
  varchar,
  int,
  tinyint,
  date,
  datetime,
  index,
} from "drizzle-orm/mysql-core";

export const Icd11Codes = mysqlTable(
  "icd11_codes",
  {
    id: int("id").autoincrement().primaryKey(),
    code: varchar("code", { length: 16 }).notNull().unique(),
    titleEn: varchar("title_en", { length: 512 }).notNull(),
    titleAr: varchar("title_ar", { length: 512 }),
    chapter: varchar("chapter", { length: 32 }),
    parentCode: varchar("parent_code", { length: 16 }),
    version: varchar("version", { length: 128 }).notNull(),
    releaseDate: date("release_date"),
    source: varchar("source", { length: 128 }),
    isStarter: tinyint("is_starter").notNull().default(1),
    createdAt: datetime("created_at").notNull(),
  },
  (t) => [index("idx_icd11_title").on(t.titleEn), index("idx_icd11_code").on(t.code)],
);
