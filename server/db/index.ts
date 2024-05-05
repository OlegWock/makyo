import { drizzle } from "drizzle-orm/bun-sqlite";
import { Database } from "bun:sqlite";
import { resolve } from "node:path"
import * as schema from './schema';

if (!process.env.KATUKO_DB_PATH) {
  console.error('You must set KATUKO_DB_PATH env variable');
  process.exit(1);
}

if (process.env.KATUKO_MACOS_HOMEBREW_SQLITE_PATH) {
  Database.setCustomSQLite(process.env.KATUKO_MACOS_HOMEBREW_SQLITE_PATH);
}
const sqlite = new Database(resolve(process.cwd(), process.env.KATUKO_DB_PATH));
sqlite.loadExtension(resolve(process.cwd(), `server/db/sqlite/${process.platform}-${process.arch}/define`));
sqlite.loadExtension(resolve(process.cwd(), `server/db/sqlite/${process.platform}-${process.arch}/fuzzy`));
sqlite.loadExtension(resolve(process.cwd(), `server/db/sqlite/${process.platform}-${process.arch}/regexp`));
sqlite.loadExtension(resolve(process.cwd(), `server/db/sqlite/${process.platform}-${process.arch}/text`));
sqlite.loadExtension(resolve(process.cwd(), `server/db/sqlite/${process.platform}-${process.arch}/unicode`));
export const db = drizzle(sqlite, { schema });
