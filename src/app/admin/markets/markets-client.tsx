'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createMarketAction, closeMarketAction, settleMarketAction } from '@/actions/market';
import { toast } from 'sonner';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import Link from 'next/link';

export default function AdminClient({ markets, auditLogs }: { markets: any[], auditLogs: any[] }) {
  const [isPending, setIsPending] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  async function handleCreateMarket(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsPending(true);
    const formData = new FormData(e.currentTarget);
    const question = formData.get('question') as string;
    const category = formData.get('category') as string || 'GENERAL';
    const optionA = formData.get('optionA') as string || 'YES';
    const optionB = formData.get('optionB') as string || 'NO';
    
    const res = await createMarketAction(question, category, optionA, optionB);
    if (res.success) {
      toast.success('Market created successfully');
      (e.target as HTMLFormElement).reset();
      setIsCreateOpen(false);
    } else {
      toast.error(res.error);
    }
    setIsPending(false);
  }

  async function handleAction(action: Function, ...args: any[]) {
    setIsPending(true);
    const res = await action(...args);
    if (res.success) {
      toast.success('Action successful');
    } else {
      toast.error(res.error || 'Action failed');
    }
    setIsPending(false);
  }

  return (
    <div className="grid gap-8">
      <div className="space-y-8">
        
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Market</DialogTitle>
              <DialogDescription>Define a new prediction market question and its options.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateMarket} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="question">Market Question</Label>
                <Input id="question" name="question" placeholder="Will X happen?" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Input id="category" name="category" placeholder="e.g., Cricket, Finance, Politics" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="optionA">Option 1 Label</Label>
                  <Input id="optionA" name="optionA" placeholder="YES" defaultValue="YES" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="optionB">Option 2 Label</Label>
                  <Input id="optionB" name="optionB" placeholder="NO" defaultValue="NO" />
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={isPending}>Create Market</Button>
            </form>
          </DialogContent>
        </Dialog>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Recent Markets</CardTitle>
              <Button onClick={() => setIsCreateOpen(true)}>+ Create Market</Button>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Question</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {markets.map(market => (
                  <TableRow key={market.id}>
                    <TableCell className="font-medium max-w-[200px] truncate" title={market.question}>
                      <Link href={`/admin/markets/${market.id}`} className="hover:underline text-blue-600 dark:text-blue-400">
                        {market.question}
                      </Link>
                    </TableCell>
                    <TableCell>{market.status}</TableCell>
                    <TableCell>
                      {market.status === 'OPEN' && (
                        <Button size="sm" variant="outline" disabled={isPending} onClick={() => handleAction(closeMarketAction, market.id)}>Close</Button>
                      )}
                      {market.status === 'CLOSED' && (
                        <div className="flex flex-col gap-2">
                          <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white" disabled={isPending} onClick={() => handleAction(settleMarketAction, market.id, 'YES')}>Settle {market.optionA}</Button>
                          <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white" disabled={isPending} onClick={() => handleAction(settleMarketAction, market.id, 'NO')}>Settle {market.optionB}</Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

    </div>
  );
}
