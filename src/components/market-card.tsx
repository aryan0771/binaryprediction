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
  const [selectedOption, setSelectedOption] = useState<'YES'|'NO'>('YES');
  const [isPending, setIsPending] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();
  const router = useRouter();

  const yesPool = market.pool?.yesPool || 0;
  const noPool = market.pool?.noPool || 0;
  const totalPool = yesPool + noPool;
  
  const yesMult = yesPool === 0 && noPool === 0 ? 1.8 : Math.max(1.0, (yesPool + (noPool * 0.8)) / (yesPool || 1));
  const noMult = yesPool === 0 && noPool === 0 ? 1.8 : Math.max(1.0, (noPool + (yesPool * 0.8)) / (noPool || 1));

  async function handleBet() {
    setIsPending(true);
    const amount = parseInt(betAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid amount');
      setIsPending(false);
      return;
    }

    const res = await placeBetAction({ marketId: market.id, option: selectedOption, amount });
    if (res.success) {
      const optionLabel = selectedOption === 'YES' ? market.optionA || 'YES' : market.optionB || 'NO';
      toast.success(`Bet placed on ${optionLabel} successfully!`);
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
        <div className="flex items-center justify-between mb-2">
          <span className="px-2 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-md">
            {market.category || 'GENERAL'}
          </span>
          <span className="text-sm font-medium text-muted-foreground">{totalPool} ♦ Pool</span>
        </div>
        <CardTitle className="text-xl leading-snug">{market.question}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 flex-1">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col items-center p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-center">
            <span className="text-sm font-semibold text-green-500 mb-1 leading-tight">{market.optionA || 'YES'}</span>
            <span className="font-mono font-bold text-green-400">{yesMult.toFixed(2)}x</span>
          </div>
          <div className="flex flex-col items-center p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-center">
            <span className="text-sm font-semibold text-red-500 mb-1 leading-tight">{market.optionB || 'NO'}</span>
            <span className="font-mono font-bold text-red-400">{noMult.toFixed(2)}x</span>
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-2">
          {!isLoggedIn ? (
            <a href="/login" className="w-full">
              <Button className="w-full bg-primary/10 hover:bg-primary/20 text-primary">Login to Trade</Button>
            </a>
          ) : (
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <div className="flex gap-2">
                <Button className="flex-1 bg-green-600 hover:bg-green-700 text-white" onClick={() => { setSelectedOption('YES'); setIsOpen(true); }}>Bet {market.optionA || 'YES'}</Button>
                <Button className="flex-1 bg-red-600 hover:bg-red-700 text-white" onClick={() => { setSelectedOption('NO'); setIsOpen(true); }}>Bet {market.optionB || 'NO'}</Button>
              </div>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Place Prediction</DialogTitle>
                  <DialogDescription>
                    Enter the amount of diamonds you want to bet on this outcome.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="flex justify-between text-sm font-medium">
                    <span>Selected: <span className={selectedOption === 'YES' ? 'text-green-500' : 'text-red-500'}>{selectedOption === 'YES' ? market.optionA || 'YES' : market.optionB || 'NO'}</span></span>
                    <span>Potential Payout: <span className="text-blue-500">♦ {(parseFloat(betAmount || '0') * (selectedOption === 'YES' ? yesMult : noMult)).toFixed(0)}</span></span>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="betAmount">Amount (♦)</Label>
                    <Input 
                      id="betAmount" 
                      type="number" 
                      value={betAmount} 
                      onChange={(e) => setBetAmount(e.target.value)} 
                      placeholder="e.g. 100" 
                      min={1} 
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isPending}>Cancel</Button>
                  <Button onClick={() => handleBet()} disabled={!betAmount || isPending || parseInt(betAmount) <= 0}>
                    {isPending ? 'Confirming...' : 'Confirm Bet'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
          
          <a href={`/dashboard/market/${market.id}`} className="w-full">
            <Button variant="outline" className="w-full">View Details</Button>
          </a>
        </div>
      </CardContent>
    </Card>
  );
}
