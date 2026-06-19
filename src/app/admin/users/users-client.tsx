'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { modifyUserBalanceAction } from '@/actions/admin';
import { toast } from 'sonner';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function UsersClient({ users }: { users: any[] }) {
  const [isPending, setIsPending] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isCreditDialogOpen, setIsCreditDialogOpen] = useState(false);
  const [isDebitDialogOpen, setIsDebitDialogOpen] = useState(false);
  const [amount, setAmount] = useState('');

  async function handleModifyBalance(type: 'credit' | 'debit') {
    if (!selectedUser) return;
    const parsedAmount = parseInt(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    setIsPending(true);
    const res = await modifyUserBalanceAction(selectedUser.id, parsedAmount, type);
    if (res.success) {
      toast.success(`Successfully ${type === 'credit' ? 'credited' : 'debited'} ${parsedAmount} diamonds`);
      setIsCreditDialogOpen(false);
      setIsDebitDialogOpen(false);
      setAmount('');
    } else {
      toast.error(res.error || 'Action failed');
    }
    setIsPending(false);
  }

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
          <CardDescription>View user balances and add or deduct diamonds.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Diamond Balance</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map(user => (
                <TableRow key={user.id}>
                  <TableCell className="font-mono">#{user.id}</TableCell>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell className="font-mono font-bold text-blue-500">♦ {user.diamondBalance}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="text-green-500 hover:text-green-600 hover:bg-green-50"
                        onClick={() => { setSelectedUser(user); setIsCreditDialogOpen(true); }}
                      >
                        + Credit
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="text-red-500 hover:text-red-600 hover:bg-red-50"
                        onClick={() => { setSelectedUser(user); setIsDebitDialogOpen(true); }}
                      >
                        - Debit
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Credit Dialog */}
      <Dialog open={isCreditDialogOpen} onOpenChange={setIsCreditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Credit Diamonds</DialogTitle>
            <DialogDescription>
              Add diamonds to <strong>{selectedUser?.name}</strong>'s wallet.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-4">
            <Label htmlFor="creditAmount">Amount (♦)</Label>
            <Input id="creditAmount" type="number" min="1" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="e.g. 500" />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreditDialogOpen(false)} disabled={isPending}>Cancel</Button>
            <Button onClick={() => handleModifyBalance('credit')} disabled={isPending || !amount}>Confirm Credit</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Debit Dialog */}
      <Dialog open={isDebitDialogOpen} onOpenChange={setIsDebitDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Debit Diamonds</DialogTitle>
            <DialogDescription>
              Deduct diamonds from <strong>{selectedUser?.name}</strong>'s wallet.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-4">
            <Label htmlFor="debitAmount">Amount (♦)</Label>
            <Input id="debitAmount" type="number" min="1" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="e.g. 500" />
            <p className="text-xs text-muted-foreground">Current balance: ♦ {selectedUser?.diamondBalance}</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDebitDialogOpen(false)} disabled={isPending}>Cancel</Button>
            <Button variant="destructive" onClick={() => handleModifyBalance('debit')} disabled={isPending || !amount}>Confirm Debit</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
