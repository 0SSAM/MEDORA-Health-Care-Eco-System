import { pgTable, uuid, text, timestamp, jsonb, index } from 'drizzle-orm/pg-core';
import type { DemoRecord, Preferences } from '@/lib/demo';

export const demoSessions = pgTable('demo_sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  preferences: jsonb('preferences').$type<Preferences>().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  expiresAt: timestamp('expires_at').notNull(),
});

export const demoRecords = pgTable('demo_records', {
  id: uuid('id').primaryKey().defaultRandom(),
  sessionId: uuid('session_id').notNull().references(() => demoSessions.id, { onDelete: 'cascade' }),
  module: text('module').notNull(),
  data: jsonb('data').$type<Omit<DemoRecord, 'id' | 'module'>>().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [index('demo_records_session_idx').on(table.sessionId)]);
