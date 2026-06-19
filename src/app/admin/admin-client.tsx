'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createMarketAction, closeMarketAction, settleMarketAction } from '@/actions/market';
import { toast } from 'sonner';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function AdminClient({ markets, auditLogs }: { markets: any[], auditLogs: any[] }) {
  const [isPending, setIsPending] = useState(false);

  async function handleCreateMarket(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsPending(true);
    const formData = new FormData(e.currentTarget);
    const question = formData.get('question') as string;
    const category = formData.get('category') as string || 'GENERAL';
    
    const res = await createMarketAction(question, category);
    if (res.success) {
      toast.success('Market created successfully');
      (e.target as HTMLFormElement).reset();
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
    <div className="grid gap-8 lg:grid-cols-2">
      <div className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Create New Market</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateMarket} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="question">Market Question</Label>
                <Input id="question" name="question" placeholder="Will X happen?" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Input id="category" name="category" placeholder="e.g., Cricket, Finance, Politics" />
              </div>
              <Button type="submit" disabled={isPending}>Create Market</Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Markets</CardTitle>
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
                    <TableCell className="font-medium max-w-[200px] truncate" title={market.question}>{market.question}</TableCell>
                    <TableCell>{market.status}</TableCell>
                    <TableCell>
                      {market.status === 'OPEN' && (
                        <Button size="sm" variant="outline" disabled={isPending} onClick={() => handleAction(closeMarketAction, market.id)}>Close</Button>
                      )}
                      {market.status === 'CLOSED' && (
                        <div className="flex gap-2">
                          <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white" disabled={isPending} onClick={() => handleAction(settleMarketAction, market.id, 'YES')}>Settle YES</Button>
                          <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white" disabled={isPending} onClick={() => handleAction(settleMarketAction, market.id, 'NO')}>Settle NO</Button>
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

      <div>
        <Card>
          <CardHeader>
            <CardTitle>Recent Audit Logs</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Action</TableHead>
                  <TableHead>Entity</TableHead>
                  <TableHead>Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {auditLogs.map(log => (
                  <TableRow key={log.id}>
                    <TableCell className="font-medium">{log.action}</TableCell>
                    <TableCell>{log.entityType} #{log.entityId}</TableCell>
                    <TableCell className="text-muted-foreground text-xs">{new Intl.DateTimeFormat('en-US', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(log.createdAt))}</TableCell>
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
