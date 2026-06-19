import { db } from '@/db';
import { markets, marketPools, bets, commissionLogs, auditLogs } from '@/db/schema';
import { eq, and, sql } from 'drizzle-orm';
import { WalletService } from './wallet.service';

export class SettlementService {
  static async settleMarket(adminId: number, marketId: number, winningOption: 'YES' | 'NO') {
    return db.transaction(async (tx) => {
      // 1. Lock the market
      const marketRes = await tx.execute(
        sql`SELECT * FROM markets WHERE id = ${marketId} FOR UPDATE`
      );

      if (marketRes.length === 0) throw new Error('Market not found');
      
      const market = marketRes[0];
      
      // Idempotency: Prevent double settlement
      if (market.status === 'SETTLED') {
        throw new Error('Market is already settled');
      }

      // 2. Lock and get pools
      const poolRes = await tx.execute(
        sql`SELECT * FROM market_pools WHERE market_id = ${marketId} FOR UPDATE`
      );
      
      if (poolRes.length === 0) throw new Error('Market pools not found');
      
      const pools = poolRes[0] as any;
      
      // 3. Calculate Pools & Commission
      const winningPool = winningOption === 'YES' ? pools.yes_pool : pools.no_pool;
      const losingPool = winningOption === 'YES' ? pools.no_pool : pools.yes_pool;
      
      // 20% commission on the losing pool
      const commission = Math.floor(losingPool * 0.20);
      const remainingLosingPool = losingPool - commission;
      const totalPayoutPool = winningPool + remainingLosingPool;

      // Avoid division by zero if winning pool is 0
      const multiplier = winningPool > 0 ? totalPayoutPool / winningPool : 1;

      // 4. Record Commission
      if (commission > 0) {
        await tx.insert(commissionLogs).values({
          marketId,
          amount: commission,
        });
      }

      // 5. Find winning bets and process payouts
      const winningBets = await tx.query.bets.findMany({
        where: and(eq(bets.marketId, marketId), eq(bets.option, winningOption)),
      });

      for (const bet of winningBets) {
        const payout = Math.floor(bet.diamonds * multiplier);
        
        // Update bet record
        await tx.update(bets).set({ payout }).where(eq(bets.id, bet.id));

        // Credit user wallet
        if (payout > 0) {
          await WalletService.modifyBalance({
            userId: bet.userId,
            amount: payout,
            type: 'WINNING_PAYOUT',
            description: `Payout for market ${marketId} (${winningOption})`,
            referenceId: bet.id,
            tx,
          });
        }
      }

      // Find losing bets to just update their payout to 0 (optional but good for tracking)
      const losingOption = winningOption === 'YES' ? 'NO' : 'YES';
      await tx.update(bets).set({ payout: 0 }).where(and(eq(bets.marketId, marketId), eq(bets.option, losingOption)));

      // 6. Update Market Status
      const [updatedMarket] = await tx.update(markets).set({
        status: 'SETTLED',
        winningOption,
        settledAt: new Date(),
      }).where(eq(markets.id, marketId)).returning();

      // 7. Audit log
      await tx.insert(auditLogs).values({
        adminId,
        action: 'SETTLE_MARKET',
        entityType: 'MARKET',
        entityId: marketId,
        oldDataJson: market,
        newDataJson: { ...updatedMarket, commission, multiplier },
      });

      return {
        market: updatedMarket,
        commission,
        multiplier,
        winnersCount: winningBets.length,
      };
    });
  }
}
