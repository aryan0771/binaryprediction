'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { placeBetAction } from '@/actions/market';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';

export default function MarketCard({ market, isLoggedIn }: { market: any, isLoggedIn: boolean }) {
  const [betAmount, setBetAmount] = useState('');
  const [option, setOption] = useState<'YES'|'NO'>('YES');
  const [isPending, setIsPending] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();
  const router = useRouter();

  const yesPool = market.pool?.yesPool || 0;
  const noPool = market.pool?.noPool || 0;
  const totalPool = yesPool + noPool;
  
  const yesMult = yesPool === 0 && noPool === 0 ? 1.8 : Math.max(1.0, (yesPool + (noPool * 0.8)) / (yesPool || 1));
  const noMult = yesPool === 0 && noPool === 0 ? 1.8 : Math.max(1.0, (noPool + (yesPool * 0.8)) / (noPool || 1));

  async function handleBet(e: React.FormEvent) {
    e.preventDefault();
    setIsPending(true);
    const amount = parseInt(betAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid amount');
      setIsPending(false);
      return;
    }

    const res = await placeBetAction({ marketId: market.id, option, amount });
    if (res.success) {
      toast.success(`Bet placed on ${option} successfully!`);
      queryClient.invalidateQueries({ queryKey: ['markets'] });
      router.refresh();
      setIsOpen(false);
      setBetAmount('');
    } else {
      toast.error(res.error);
    }
    setIsPending(false);
  }

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 border-border/50 hover:border-primary/50 flex flex-col">
      <CardHeader>
        <CardTitle className="text-lg leading-snug">{market.question}</CardTitle>
        <CardDescription>
          Total Pool: <span className="text-blue-400">♦</span> {totalPool.toLocaleString()}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 flex-1">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col items-center p-3 rounded-lg bg-green-500/10 border border-green-500/20">
            <span className="text-sm font-semibold text-green-500 mb-1">YES</span>
            <span className="text-xs text-muted-foreground mb-1">Pool: {yesPool}</span>
            <span className="font-mono font-bold text-green-400">{yesMult.toFixed(2)}x</span>
          </div>
          <div className="flex flex-col items-center p-3 rounded-lg bg-red-500/10 border border-red-500/20">
            <span className="text-sm font-semibold text-red-500 mb-1">NO</span>
            <span className="text-xs text-muted-foreground mb-1">Pool: {noPool}</span>
            <span className="font-mono font-bold text-red-400">{noMult.toFixed(2)}x</span>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        {isLoggedIn ? (
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger className="w-full inline-flex items-center justify-center rounded-lg bg-primary h-9 px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors">
              Place Bet
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Place Bet</DialogTitle>
                <DialogDescription>
                  {market.question}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleBet} className="space-y-6 py-4">
                <div className="space-y-4">
                  <div className="flex justify-center gap-4">
                    <Button 
                      type="button"
                      variant={option === 'YES' ? 'default' : 'outline'}
                      className={option === 'YES' ? 'bg-green-600 hover:bg-green-700 w-24' : 'w-24 text-green-500 border-green-500/50'}
                      onClick={() => setOption('YES')}
                    >
                      YES ({yesMult.toFixed(2)}x)
                    </Button>
                    <Button 
                      type="button"
                      variant={option === 'NO' ? 'default' : 'outline'}
                      className={option === 'NO' ? 'bg-red-600 hover:bg-red-700 w-24' : 'w-24 text-red-500 border-red-500/50'}
                      onClick={() => setOption('NO')}
                    >
                      NO ({noMult.toFixed(2)}x)
                    </Button>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="amount">Bet Amount (Diamonds)</Label>
                    <Input 
                      id="amount" 
                      type="number" 
                      min="1" 
                      value={betAmount} 
                      onChange={(e) => setBetAmount(e.target.value)} 
                      placeholder="100" 
                      required 
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={isPending || !betAmount}>
                    {isPending ? 'Processing...' : 'Confirm Bet'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        ) : (
          <a href="/login" className="w-full">
            <Button variant="secondary" className="w-full" type="button">Login to Bet</Button>
          </a>
        )}
      </CardFooter>
    </Card>
  );
}
