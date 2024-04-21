import { join } from 'path';
import { migrate } from "drizzle-orm/bun-sqlite/migrator";
import { db } from "./index";


await migrate(db, { migrationsFolder: join(import.meta.dir, 'drizzle') });
