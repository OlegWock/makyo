import { drizzle } from "drizzle-orm/bun-sqlite";
import { Database } from "bun:sqlite";

if (!process.env.KATUKO_DB_PATH) {
  console.error('You must set KATUKO_DB_PATH env variable');
  process.exit(1);
}

const sqlite = new Database(process.env.KATUKO_DB_PATH);
export const db = drizzle(sqlite);
