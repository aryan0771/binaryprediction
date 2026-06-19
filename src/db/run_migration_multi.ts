import { db } from './index';
import { sql } from 'drizzle-orm';

async function main() {
  try {
    console.log('Starting Multi-Option Migration...');

    // 1. Add new JSON columns
    console.log('Adding JSON columns...');
    await db.execute(sql`ALTER TABLE "markets" ADD COLUMN IF NOT EXISTS "options" jsonb DEFAULT '["YES", "NO"]'::jsonb NOT NULL;`);
    await db.execute(sql`ALTER TABLE "market_pools" ADD COLUMN IF NOT EXISTS "pool_data" jsonb DEFAULT '{"YES": 0, "NO": 0}'::jsonb NOT NULL;`);

    // 2. Migrate Data
    console.log('Migrating existing data...');
    // We construct the JSON array using PostgreSQL jsonb_build_array
    await db.execute(sql`UPDATE "markets" SET "options" = jsonb_build_array("option_a", "option_b");`);
    
    // We construct the JSON object mapping option_a -> yes_pool and option_b -> no_pool
    // First, join markets to market_pools to get the option names for the keys
    await db.execute(sql`
      UPDATE "market_pools" mp
      SET "pool_data" = jsonb_build_object(
        m."option_a", mp."yes_pool",
        m."option_b", mp."no_pool"
      )
      FROM "markets" m
      WHERE mp."market_id" = m."id";
    `);

    // 3. Drop old columns
    console.log('Dropping old columns...');
    await db.execute(sql`ALTER TABLE "markets" DROP COLUMN IF EXISTS "option_a";`);
    await db.execute(sql`ALTER TABLE "markets" DROP COLUMN IF EXISTS "option_b";`);
    await db.execute(sql`ALTER TABLE "market_pools" DROP COLUMN IF EXISTS "yes_pool";`);
    await db.execute(sql`ALTER TABLE "market_pools" DROP COLUMN IF EXISTS "no_pool";`);

    console.log('Migration complete!');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    process.exit(0);
  }
}
main();
