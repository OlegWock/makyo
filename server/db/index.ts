import { drizzle } from "drizzle-orm/bun-sqlite";
import { Database } from "bun:sqlite";
import { join } from "node:path"
import * as schema from './schema';

if (!process.env.KATUKO_DB_PATH) {
  console.error('You must set KATUKO_DB_PATH env variable');
  process.exit(1);
}

if (process.env.KATUKO_MACOS_HOMEBREW_SQLITE_PATH) {
  Database.setCustomSQLite(process.env.KATUKO_MACOS_HOMEBREW_SQLITE_PATH);
}
const sqlite = new Database(process.env.KATUKO_DB_PATH);
sqlite.loadExtension(join(import.meta.dir, 'sqlite', 'define'));
sqlite.loadExtension(join(import.meta.dir, 'sqlite', 'fuzzy'));
sqlite.loadExtension(join(import.meta.dir, 'sqlite', 'regexp'));
sqlite.loadExtension(join(import.meta.dir, 'sqlite', 'text'));
sqlite.loadExtension(join(import.meta.dir, 'sqlite', 'unicode'));
export const db = drizzle(sqlite, { schema });
