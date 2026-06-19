import { db } from '@/db';
import { markets, marketPools, auditLogs } from '@/db/schema';
import { eq } from 'drizzle-orm';

export class MarketService {
  static async createMarket(adminId: number, question: string) {
    return db.transaction(async (tx) => {
      const [newMarket] = await tx.insert(markets).values({
        question,
        status: 'OPEN',
      }).returning();

      await tx.insert(marketPools).values({
        marketId: newMarket.id,
        yesPool: 0,
        noPool: 0,
      });

      await tx.insert(auditLogs).values({
        adminId,
        action: 'CREATE_MARKET',
        entityType: 'MARKET',
        entityId: newMarket.id,
        newDataJson: newMarket,
      });

      return newMarket;
    });
  }

  static async closeMarket(adminId: number, marketId: number) {
    return db.transaction(async (tx) => {
      const market = await tx.query.markets.findFirst({ where: eq(markets.id, marketId) });
      if (!market) throw new Error('Market not found');
      if (market.status !== 'OPEN') throw new Error('Market must be OPEN to be closed');

      const [updatedMarket] = await tx.update(markets).set({
        status: 'CLOSED',
        closedAt: new Date(),
      }).where(eq(markets.id, marketId)).returning();

      await tx.insert(auditLogs).values({
        adminId,
        action: 'CLOSE_MARKET',
        entityType: 'MARKET',
        entityId: marketId,
        oldDataJson: market,
        newDataJson: updatedMarket,
      });

      return updatedMarket;
    });
  }
}
