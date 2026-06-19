'use server';

import { auth } from '@/auth';
import { WalletService } from '@/services/wallet.service';
import { revalidatePath } from 'next/cache';

export async function modifyUserBalanceAction(targetUserId: number, amount: number, type: 'credit' | 'debit') {
  const session = await auth();
  if (session?.user?.role !== 'ADMIN') throw new Error('Unauthorized');

  try {
    const adminId = parseInt(session.user.id as string);
    if (type === 'credit') {
      await WalletService.creditAdmin(adminId, targetUserId, amount);
    } else {
      await WalletService.debitAdmin(adminId, targetUserId, amount);
    }
    revalidatePath('/admin/users');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to modify balance' };
  }
}
