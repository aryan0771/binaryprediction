'use client';

import { useQuery } from '@tanstack/react-query';
import { getActiveMarkets } from '@/actions/market';
import MarketCard from './market-card';

export default function MarketsList({ initialMarkets, isLoggedIn }: { initialMarkets: any[], isLoggedIn: boolean }) {
  const { data: markets } = useQuery({
    queryKey: ['markets'],
    queryFn: () => getActiveMarkets(),
    refetchInterval: 5000,
    initialData: initialMarkets,
  });

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {markets.map((market) => (
        <MarketCard key={market.id} market={market} isLoggedIn={isLoggedIn} />
      ))}
      {markets.length === 0 && (
        <div className="col-span-full py-12 text-center text-muted-foreground border border-dashed rounded-lg">
          No active markets available at the moment.
        </div>
      )}
    </div>
  );
}
