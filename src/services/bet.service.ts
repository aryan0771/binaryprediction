import { db } from '@/db';
import { bets, marketPools, markets } from '@/db/schema';
import { eq, sql } from 'drizzle-orm';
import { WalletService } from './wallet.service';

export class BetService {
  static calculateMultipliers(poolData: Record<string, number>) {
    const totalPool = Object.values(poolData).reduce((sum, val) => sum + val, 0);
    const multipliers: Record<string, number> = {};

    for (const [option, pool] of Object.entries(poolData)) {
      if (totalPool === 0) {
        multipliers[option] = 1.8;
      } else {
        const optionPoolSafe = pool === 0 ? 1 : pool;
        const losingPool = totalPool - pool;
        const mult = (pool + (losingPool * 0.8)) / optionPoolSafe;
        multipliers[option] = Math.max(1.0, mult);
      }
    }
    return multipliers;
  }

  static async placeBet(userId: number, marketId: number, option: string, amount: number) {
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

      const pools = poolRes[0].pool_data as Record<string, number>;
      const newPoolData = { ...pools };
      newPoolData[option] = (newPoolData[option] || 0) + amount;

      await tx
        .update(marketPools)
        .set({ poolData: newPoolData })
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
        newPools: newPoolData,
        multipliers: this.calculateMultipliers(newPoolData),
      };
    });
  }
}
