import { sql } from "drizzle-orm";
import { AnySQLiteColumn, integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

// TODO: need to add indexes too

export const setting = sqliteTable('setting', {
  key: text('key').primaryKey(),
  value: text('value'),
});

export const chat = sqliteTable('chat', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  title: text('title').notNull(),
  providerId: text('providerId').notNull(),
  modelId: text('modelId').notNull(),
  system: text('system'),
  temperature: real('temperature'),
  createdAt: integer('createdAt', { mode: 'timestamp_ms' }).notNull().default(sql`(unixepoch() * 1000)`),
});

export const message = sqliteTable('message', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  text: text('text').notNull(),
  error: text('error'),
  isGenerating: integer('isGenerating', { mode: 'boolean' }).notNull().default(false),
  sender: text('sender', { enum: ['user', 'ai'] }).notNull(),
  chatId: integer('chatId').references((): AnySQLiteColumn => chat.id, { onDelete: 'cascade' }).notNull(),
  parentId: integer('parentId').references((): AnySQLiteColumn => message.id, { onDelete: 'cascade' }),
  createdAt: integer('createdAt', { mode: 'timestamp_ms' }).notNull().default(sql`(unixepoch() * 1000)`),
});
