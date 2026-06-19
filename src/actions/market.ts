'use server';

import { auth } from '@/auth';
import { MarketService } from '@/services/market.service';
import { BetService } from '@/services/bet.service';
import { SettlementService } from '@/services/settlement.service';
import { WalletService } from '@/services/wallet.service';
import { db } from '@/db';
import { markets, marketPools, bets, users, transactions, auditLogs } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const betSchema = z.object({
  marketId: z.coerce.number(),
  option: z.enum(['YES', 'NO']),
  amount: z.coerce.number().positive(),
});

export async function placeBetAction(data: { marketId: number, option: 'YES'|'NO', amount: number }) {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Unauthorized');
  
  const validatedData = betSchema.parse(data);
  const userId = parseInt(session.user.id);

  try {
    const result = await BetService.placeBet(userId, validatedData.marketId, validatedData.option, validatedData.amount);
    revalidatePath('/');
    revalidatePath('/dashboard');
    return { success: true, data: result };
  } catch (error: any) {
    console.error('Bet error:', error);
    return { success: false, error: error.message || 'Failed to place bet' };
  }
}

export async function createMarketAction(question: string, category: string, optionA: string, optionB: string) {
  const session = await auth();
  if (session?.user?.role !== 'ADMIN') throw new Error('Unauthorized');

  try {
    const adminId = parseInt(session.user.id as string);
    const result = await MarketService.createMarket(adminId, question, category, optionA, optionB);
    revalidatePath('/admin');
    revalidatePath('/');
    return { success: true, data: result };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function closeMarketAction(marketId: number) {
  const session = await auth();
  if (session?.user?.role !== 'ADMIN') throw new Error('Unauthorized');

  try {
    const adminId = parseInt(session.user.id as string);
    const result = await MarketService.closeMarket(adminId, marketId);
    revalidatePath('/admin');
    revalidatePath('/');
    return { success: true, data: result };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function settleMarketAction(marketId: number, winningOption: 'YES' | 'NO') {
  const session = await auth();
  if (session?.user?.role !== 'ADMIN') throw new Error('Unauthorized');

  try {
    const adminId = parseInt(session.user.id as string);
    const result = await SettlementService.settleMarket(adminId, marketId, winningOption);
    revalidatePath('/admin');
    revalidatePath('/');
    return { success: true, data: result };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// Queries
export async function getActiveMarkets() {
  const activeMarkets = await db.select().from(markets).where(eq(markets.status, 'OPEN')).orderBy(desc(markets.createdAt));
  const pools = await db.select().from(marketPools);
  
  return activeMarkets.map(m => {
    const pool = pools.find(p => p.marketId === m.id);
    return { ...m, pool };
  });
}

export async function getUserProfile() {
  const session = await auth();
  if (!session?.user?.id) return null;
  const userId = parseInt(session.user.id);

  const [user] = await db.select().from(users).where(eq(users.id, userId));
  const userBets = await db.select().from(bets).where(eq(bets.userId, userId)).orderBy(desc(bets.createdAt));
  const userTransactions = await db.select().from(transactions).where(eq(transactions.userId, userId)).orderBy(desc(transactions.createdAt)).limit(20);

  return { user, bets: userBets, transactions: userTransactions };
}
