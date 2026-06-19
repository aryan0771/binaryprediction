import 'dotenv/config';
import { db, client } from './index';
import { users } from './schema';
import bcrypt from 'bcryptjs';

async function main() {
  console.log('Seeding database...');
  
  const passwordHash = await bcrypt.hash('Admin@123', 10);
  
  await db.insert(users).values({
    name: 'Super Admin',
    email: 'admin@prediction.com',
    passwordHash,
    role: 'ADMIN',
    diamondBalance: 1000000, // Give admin a lot of diamonds for platform liquidity
  }).onConflictDoNothing({ target: users.email });

  console.log('Database seeded successfully.');
  
  // Close connection
  await client.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
