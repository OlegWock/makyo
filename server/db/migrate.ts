import { resolve } from 'path';
import { migrate } from "drizzle-orm/bun-sqlite/migrator";
import { db } from "./index";


await migrate(db, { migrationsFolder: resolve(process.cwd(), 'server/db/drizzle') });
