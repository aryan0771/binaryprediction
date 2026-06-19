import { db } from '@/db';
import { bets, marketPools, markets } from '@/db/schema';
import { eq, sql } from 'drizzle-orm';
import { WalletService } from './wallet.service';

export class BetService {
  static calculateMultipliers(yesPool: number, noPool: number) {
    // If a pool is 0, the math might break or result in Infinity. Handle gracefully.
    // If pool is 0, let's treat it as if a small amount is there, or just return basic 2.0 multiplier for starting point.
    if (yesPool === 0 && noPool === 0) {
      return { yesMultiplier: 1.8, noMultiplier: 1.8 };
    }

    const yesSafe = yesPool === 0 ? 1 : yesPool;
    const noSafe = noPool === 0 ? 1 : noPool;

    const yesMultiplier = (yesPool + (noPool * 0.8)) / yesSafe;
    const noMultiplier = (noPool + (yesPool * 0.8)) / noSafe;

    return {
      yesMultiplier: Math.max(1.0, yesMultiplier),
      noMultiplier: Math.max(1.0, noMultiplier),
    };
  }

  static async placeBet(userId: number, marketId: number, option: 'YES' | 'NO', amount: number) {
    if (amount <= 0) throw new Error('Bet amount must be greater than zero');

    return db.transaction(async (tx) => {
      // 1. Lock market to check if it's OPEN
      const marketRes = await tx.execute(
        sql`SELECT * FROM markets WHERE id = ${marketId} FOR UPDATE`
      );

      if (marketRes.length === 0) throw new Error('Market not found');
      if (marketRes[0].status !== 'OPEN') throw new Error('Market is not open for betting');

      // 2. Lock and update market pools
      const poolRes = await tx.execute(
        sql`SELECT * FROM market_pools WHERE market_id = ${marketId} FOR UPDATE`
      );

      if (poolRes.length === 0) throw new Error('Market pool not found');

      const pools = poolRes[0] as any;
      const newYesPool = option === 'YES' ? pools.yes_pool + amount : pools.yes_pool;
      const newNoPool = option === 'NO' ? pools.no_pool + amount : pools.no_pool;

      await tx
        .update(marketPools)
        .set({ yesPool: newYesPool, noPool: newNoPool })
        .where(eq(marketPools.marketId, marketId));

      // 3. Deduct from wallet
      await WalletService.modifyBalance({
        userId,
        amount: -amount,
        type: 'BET_PLACED',
        description: `Placed bet on market ${marketId} for ${option}`,
        tx, // Pass the transaction
      });

      // 4. Create the bet record
      const [newBet] = await tx
        .insert(bets)
        .values({
          userId,
          marketId,
          option,
          diamonds: amount,
        })
        .returning();

      // Return updated state
      return {
        bet: newBet,
        newPools: { yesPool: newYesPool, noPool: newNoPool },
        multipliers: this.calculateMultipliers(newYesPool, newNoPool),
      };
    });
  }
}
