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
  const [options, setOptions] = useState<string[]>(['YES', 'NO']);

  async function handleCreateMarket(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsPending(true);
    const formData = new FormData(e.currentTarget);
    const question = formData.get('question') as string;
    const category = formData.get('category') as string || 'GENERAL';
    
    // Ensure unique non-empty options
    const finalOptions = Array.from(new Set(options.map(o => o.trim()))).filter(Boolean);
    if (finalOptions.length < 2) {
      toast.error('Must have at least 2 distinct options');
      setIsPending(false);
      return;
    }

    const res = await createMarketAction(question, category, finalOptions);
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
              <div className="space-y-2">
                <Label>Market Options (Max 4)</Label>
                {options.map((opt, i) => (
                  <div key={i} className="flex gap-2">
                    <Input 
                      value={opt} 
                      onChange={(e) => {
                        const newOpts = [...options];
                        newOpts[i] = e.target.value;
                        setOptions(newOpts);
                      }} 
                      required 
                    />
                    {options.length > 2 && (
                      <Button type="button" variant="outline" onClick={() => setOptions(options.filter((_, idx) => idx !== i))}>X</Button>
                    )}
                  </div>
                ))}
                {options.length < 4 && (
                  <Button type="button" variant="secondary" className="w-full mt-2" onClick={() => setOptions([...options, `Option ${options.length + 1}`])}>+ Add Option</Button>
                )}
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
                          {market.options.map((opt: string) => (
                            <Button key={opt} size="sm" variant="outline" className="hover:bg-primary hover:text-primary-foreground" disabled={isPending} onClick={() => handleAction(settleMarketAction, market.id, opt)}>
                              Settle {opt}
                            </Button>
                          ))}
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
