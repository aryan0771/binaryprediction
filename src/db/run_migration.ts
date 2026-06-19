import { db } from './index';
import { sql } from 'drizzle-orm';

async function main() {
  try {
    await db.execute(sql`ALTER TABLE "markets" ADD COLUMN "category" text DEFAULT 'GENERAL' NOT NULL;`);
    console.log('Migration complete');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    process.exit(0);
  }
}
main();
