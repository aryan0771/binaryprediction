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
  const options = market.options || ['YES', 'NO'];
  const [betAmount, setBetAmount] = useState('');
  const [selectedOption, setSelectedOption] = useState<string>(options[0]);
  const [isPending, setIsPending] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();
  const router = useRouter();

  const poolData = market.pool?.poolData || {};
  const totalPool = Object.values(poolData).reduce((sum: number, val: any) => sum + (val as number), 0);

  const multipliers = options.map((opt: string) => {
    const pool = poolData[opt] || 0;
    if (totalPool === 0) return { opt, mult: 1.8 };
    const safePool = pool === 0 ? 1 : pool;
    const losingPool = totalPool - pool;
    const mult = Math.max(1.0, (pool + (losingPool * 0.8)) / safePool);
    return { opt, mult };
  });

  // Dynamic Multiplier Calculation
  const parsedBetAmount = parseFloat(betAmount || '0');
  const prospectivePoolData = { ...poolData };
  prospectivePoolData[selectedOption] = (prospectivePoolData[selectedOption] || 0) + parsedBetAmount;
  const prospectiveTotalPool = totalPool + parsedBetAmount;
  
  const prospectiveOptionPool = prospectivePoolData[selectedOption] || 0;
  const prospectiveSafePool = prospectiveOptionPool === 0 ? 1 : prospectiveOptionPool;
  const prospectiveLosingPool = prospectiveTotalPool - prospectiveOptionPool;
  const prospectiveMult = prospectiveTotalPool === 0 ? 1.8 : Math.max(1.0, (prospectiveOptionPool + (prospectiveLosingPool * 0.8)) / prospectiveSafePool);

  const colors = [
    { bg: 'bg-green-500/10', border: 'border-green-500/20', text: 'text-green-500', multText: 'text-green-400', btn: 'bg-green-600 hover:bg-green-700' },
    { bg: 'bg-red-500/10', border: 'border-red-500/20', text: 'text-red-500', multText: 'text-red-400', btn: 'bg-red-600 hover:bg-red-700' },
    { bg: 'bg-blue-500/10', border: 'border-blue-500/20', text: 'text-blue-500', multText: 'text-blue-400', btn: 'bg-blue-600 hover:bg-blue-700' },
    { bg: 'bg-purple-500/10', border: 'border-purple-500/20', text: 'text-purple-500', multText: 'text-purple-400', btn: 'bg-purple-600 hover:bg-purple-700' },
  ];

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
      toast.success(`Bet placed on ${selectedOption} successfully!`);
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
        <div className={`grid gap-4 ${options.length === 2 ? 'grid-cols-2' : options.length === 3 ? 'grid-cols-3' : 'grid-cols-2'}`}>
          {multipliers.map((m: any, i: number) => {
            const color = colors[i % 4];
            return (
              <div key={m.opt} className={`flex flex-col items-center p-3 rounded-lg ${color.bg} border ${color.border} text-center`}>
                <span className={`text-sm font-semibold ${color.text} mb-1 leading-tight`}>{m.opt}</span>
                <span className={`font-mono font-bold ${color.multText}`}>{m.mult.toFixed(2)}x</span>
              </div>
            );
          })}
        </div>

        <div className="mt-4 flex flex-col gap-2">
          {!isLoggedIn ? (
            <a href="/login" className="w-full">
              <Button className="w-full bg-primary/10 hover:bg-primary/20 text-primary">Login to Trade</Button>
            </a>
          ) : (
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <div className={`grid gap-2 ${options.length === 2 ? 'grid-cols-2' : options.length === 3 ? 'grid-cols-3' : 'grid-cols-2'}`}>
                {options.map((opt: string, i: number) => (
                  <Button key={opt} className={`w-full ${colors[i % 4].btn} text-white`} onClick={() => { setSelectedOption(opt); setIsOpen(true); }}>
                    Bet {opt}
                  </Button>
                ))}
              </div>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Place Prediction</DialogTitle>
                  <DialogDescription>
                    Enter the amount of diamonds you want to bet on this outcome.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="flex flex-col gap-1 text-sm font-medium">
                    <div className="flex justify-between">
                      <span>Selected: <span className="font-bold">{selectedOption}</span></span>
                      <span>Potential Payout: <span className="text-blue-500">♦ {(parsedBetAmount * prospectiveMult).toFixed(0)}</span></span>
                    </div>
                    {parsedBetAmount > 0 && (
                      <div className="text-right text-xs text-muted-foreground">
                        Pool multiplier adjusts to {prospectiveMult.toFixed(2)}x
                      </div>
                    )}
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
