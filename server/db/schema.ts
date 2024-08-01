import { sql } from "drizzle-orm";
import { type AnySQLiteColumn, index, integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

// TODO: will be nice to use FTS5 to optimize search (instead of using LIKE)

export const chat = sqliteTable('chat', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  title: text('title').notNull(),
  providerId: text('providerId').notNull(),
  modelId: text('modelId').notNull(),
  isStarred: integer('isStarred', { mode: 'boolean' }).notNull().default(false),
  system: text('system'),
  temperature: real('temperature'),
  personaId: integer('personaId').references((): AnySQLiteColumn => persona.id, { onDelete: 'cascade' }),
  createdAt: integer('createdAt', { mode: 'timestamp_ms' }).notNull().default(sql`(unixepoch() * 1000)`),
});

export const message = sqliteTable('message', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  text: text('text').notNull(),
  error: text('error'),
  isGenerating: integer('isGenerating', { mode: 'boolean' }).notNull().default(false),
  sender: text('sender', { enum: ['user', 'ai'] }).notNull(),
  senderName: text('senderName').notNull(),
  providerId: text('providerId'),
  chatId: integer('chatId').references((): AnySQLiteColumn => chat.id, { onDelete: 'cascade' }).notNull(),
  parentId: integer('parentId').references((): AnySQLiteColumn => message.id, { onDelete: 'cascade' }),
  createdAt: integer('createdAt', { mode: 'timestamp_ms' }).notNull().default(sql`(unixepoch() * 1000)`),
}, (table) => {
  return {
    parentIdx: index("parentIdx").on(table.parentId),
    chatIdx: index("chatIdx").on(table.chatId),
    createdAtx: index("createdAtx").on(table.createdAt),
  };
});

export const snippet = sqliteTable('snippet', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  shortcut: text('shortcut').notNull(),
  text: text('text').notNull(),
  createdAt: integer('createdAt', { mode: 'timestamp_ms' }).notNull().default(sql`(unixepoch() * 1000)`),
});

export const persona = sqliteTable('persona', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  isDefault: integer('isStarred', { mode: 'boolean' }).notNull().default(false),
  name: text('name').notNull(),
  avatar: text('avatar').notNull(),
  providerId: text('providerId'),
  modelId: text('modelId'),
  system: text('system'),
  temperature: real('temperature'),
  createdAt: integer('createdAt', { mode: 'timestamp_ms' }).notNull().default(sql`(unixepoch() * 1000)`),
});
