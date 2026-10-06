import { getDb } from './server/db.ts';
import { settings } from './drizzle/schema.ts';
import { eq } from 'drizzle-orm';

async function main() {
  const db = await getDb();
  // build a query to inspect SQL
  const query = db.select().from(settings).where(eq(settings.category, 'company'));
  // some query builder versions have toSQL()
  // we'll try to access a `.toSQL` method or string representation
  if ((query as any).toSQL) {
    console.log('SQL', (query as any).toSQL());
  } else {
    console.log('Query object', query);
  }
}

main().catch(console.error);
