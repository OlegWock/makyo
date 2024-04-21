import { db } from './index';
import * as schema from './schema';

await db.insert(schema.settings).values([
  {
    key: 'username',
    value: 'Katuko'
  },
]);

console.log(`Seeding complete.`);
