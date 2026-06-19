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
          <DialogContent className="sm:max-w-lg bg-card/90 backdrop-blur-2xl border-border/50 shadow-2xl overflow-hidden">
            <div className="absolute -top-20 -left-20 w-60 h-60 bg-green-500/10 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute -bottom-20 -right-20 w-60 h-60 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />

            <DialogHeader className="relative z-10">
              <DialogTitle className="text-2xl font-bold tracking-tight">Create New Market</DialogTitle>
              <DialogDescription>Define a new prediction market question and its dynamic options.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateMarket} className="space-y-6 relative z-10 mt-2">
              <div className="space-y-2">
                <Label htmlFor="question" className="text-muted-foreground font-semibold">Market Question</Label>
                <Input id="question" name="question" placeholder="e.g. Will SpaceX reach Mars by 2030?" required className="bg-background/50 shadow-inner border-border/50 focus-visible:ring-primary/50 h-10" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category" className="text-muted-foreground font-semibold">Category</Label>
                <Input id="category" name="category" placeholder="e.g., Space, Finance, Politics" className="bg-background/50 shadow-inner border-border/50 focus-visible:ring-primary/50" />
              </div>
              
              <div className="space-y-3 p-4 rounded-xl bg-muted/20 border border-border/50 shadow-inner">
                <Label className="text-muted-foreground font-semibold">Market Options (Min 2, Max 4)</Label>
                <div className="flex flex-col gap-3 mt-2">
                  {options.map((opt, i) => (
                    <div key={i} className="flex gap-2 items-center">
                      <span className="text-xs font-mono text-muted-foreground w-4">{i+1}.</span>
                      <Input 
                        value={opt} 
                        onChange={(e) => {
                          const newOpts = [...options];
                          newOpts[i] = e.target.value;
                          setOptions(newOpts);
                        }} 
                        required
                        className="bg-background/80 shadow-sm"
                      />
                      {options.length > 2 && (
                        <Button type="button" variant="ghost" size="icon" className="text-red-500/70 hover:text-red-500 hover:bg-red-500/10 shrink-0" onClick={() => setOptions(options.filter((_, idx) => idx !== i))}>
                          ✕
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
                {options.length < 4 && (
                  <Button type="button" variant="secondary" className="w-full mt-4 border-dashed border-2 bg-transparent hover:bg-muted/50 text-muted-foreground shadow-sm" onClick={() => setOptions([...options, `Option ${options.length + 1}`])}>
                    + Add Another Option
                  </Button>
                )}
              </div>
              
              <Button type="submit" className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg shadow-green-500/20 h-12 text-lg font-medium transition-all active:scale-95 mt-4" disabled={isPending}>
                {isPending ? 'Deploying...' : 'Deploy Market'}
              </Button>
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
