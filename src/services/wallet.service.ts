import { db } from '@/db';
import { users, transactions } from '@/db/schema';
import { eq, sql } from 'drizzle-orm';

export class WalletService {
  /**
   * Modifies a user's balance safely using a database transaction and row-level lock.
   */
  static async modifyBalance({
    userId,
    amount, // positive for credit, negative for debit
    type,
    description,
    referenceId,
    tx, // Optional transaction if called within a larger transaction
  }: {
    userId: number;
    amount: number;
    type: string;
    description: string;
    referenceId?: number;
    tx?: any;
  }) {
    const execute = async (dbTx: any) => {
      // 1. Lock the user row to prevent concurrent modifications
      const userRes = await dbTx.execute(
        sql`SELECT * FROM users WHERE id = ${userId} FOR UPDATE`
      );

      if (userRes.length === 0) {
        throw new Error('User not found');
      }

      const user = userRes[0];
      const balanceBefore = user.diamond_balance;
      const balanceAfter = balanceBefore + amount;

      // 2. Prevent negative balance
      if (balanceAfter < 0) {
        throw new Error('Insufficient diamond balance');
      }

      // 3. Update user balance
      await dbTx
        .update(users)
        .set({ diamondBalance: balanceAfter })
        .where(eq(users.id, userId));

      // 4. Create transaction log
      await dbTx.insert(transactions).values({
        userId,
        type,
        amount,
        balanceBefore,
        balanceAfter,
        description,
        referenceId,
      });

      return { balanceBefore, balanceAfter };
    };

    if (tx) {
      return execute(tx);
    } else {
      return db.transaction(execute);
    }
  }

  static async creditAdmin(adminId: number, targetUserId: number, amount: number) {
    if (amount <= 0) throw new Error('Amount must be positive');
    
    return this.modifyBalance({
      userId: targetUserId,
      amount,
      type: 'ADMIN_CREDIT',
      description: `Credited by Admin ID ${adminId}`,
    });
  }

  static async debitAdmin(adminId: number, targetUserId: number, amount: number) {
    if (amount <= 0) throw new Error('Amount must be positive');

    return this.modifyBalance({
      userId: targetUserId,
      amount: -amount,
      type: 'ADMIN_DEBIT',
      description: `Debited by Admin ID ${adminId}`,
    });
  }
}
