import { db } from './index';
import { sql } from 'drizzle-orm';

async function main() {
  try {
    await db.execute(sql`ALTER TABLE "markets" ADD COLUMN "option_a" text DEFAULT 'YES' NOT NULL;`);
    await db.execute(sql`ALTER TABLE "markets" ADD COLUMN "option_b" text DEFAULT 'NO' NOT NULL;`);
    console.log('Migration complete');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    process.exit(0);
  }
}
main();
