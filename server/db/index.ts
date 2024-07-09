import { drizzle } from "drizzle-orm/bun-sqlite";
import { Database } from "bun:sqlite";
import { resolve } from "node:path"
import * as schema from './schema';

if (!process.env.MAKYO_DATA_FOLDER) {
  console.error('You must set MAKYO_DATA_FOLDER env variable');
  process.exit(1);
}

if (process.env.MAKYO_MACOS_HOMEBREW_SQLITE_PATH) {
  Database.setCustomSQLite(process.env.MAKYO_MACOS_HOMEBREW_SQLITE_PATH);
}
const sqlite = new Database(resolve(process.cwd(), `${process.env.MAKYO_DATA_FOLDER}/makyo.db`));
sqlite.loadExtension(resolve(process.cwd(), `server/db/sqlite/${process.platform}-${process.arch}/define`));
sqlite.loadExtension(resolve(process.cwd(), `server/db/sqlite/${process.platform}-${process.arch}/fuzzy`));
sqlite.loadExtension(resolve(process.cwd(), `server/db/sqlite/${process.platform}-${process.arch}/regexp`));
sqlite.loadExtension(resolve(process.cwd(), `server/db/sqlite/${process.platform}-${process.arch}/text`));
sqlite.loadExtension(resolve(process.cwd(), `server/db/sqlite/${process.platform}-${process.arch}/unicode`));
export const db = drizzle(sqlite, { schema });
