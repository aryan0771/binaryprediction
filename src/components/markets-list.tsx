'use client';

import { useQuery } from '@tanstack/react-query';
import { getActiveMarkets } from '@/actions/market';
import MarketCard from './market-card';
import { useState } from 'react';
import { Button } from './ui/button';

export default function MarketsList({ initialMarkets, isLoggedIn }: { initialMarkets: any[], isLoggedIn: boolean }) {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  
  const { data: markets } = useQuery({
    queryKey: ['markets'],
    queryFn: () => getActiveMarkets(),
    refetchInterval: 5000,
    initialData: initialMarkets,
  });

  const categories = Array.from(new Set(markets.map((m: any) => m.category || 'GENERAL')));
  const filteredMarkets = markets.filter((m: any) => selectedCategory === 'All' || (m.category || 'GENERAL') === selectedCategory);

  return (
    <div>
      <div className="mb-6 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
        <Button 
          variant={selectedCategory === 'All' ? 'default' : 'outline'} 
          onClick={() => setSelectedCategory('All')}
          className="rounded-full px-6"
        >
          All
        </Button>
        {categories.map(c => (
          <Button 
            key={c} 
            variant={selectedCategory === c ? 'default' : 'outline'} 
            onClick={() => setSelectedCategory(c)}
            className="rounded-full px-6"
          >
            {c}
          </Button>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredMarkets.map((market: any) => (
          <MarketCard key={market.id} market={market} isLoggedIn={isLoggedIn} />
        ))}
        {filteredMarkets.length === 0 && (
          <div className="col-span-full py-12 text-center text-muted-foreground border border-dashed rounded-lg">
            No active markets available in this category.
          </div>
        )}
      </div>
    </div>
  );
}
