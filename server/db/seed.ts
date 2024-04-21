import { db } from './index';
import * as schema from './schema';

await db.insert(schema.settings).values([
  {
    key: 'openai',
    value: ''
  },
  {
    key: 'anthropic',
    value: ''
  },
]);

console.log(`Seeding complete.`);
