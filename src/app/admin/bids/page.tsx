import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { bets, users, markets, commissionLogs } from "@/db/schema";
import { desc, eq, sql } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function AdminBidsPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const session = await auth();
  
  if (session?.user?.role !== 'ADMIN') {
    redirect('/');
  }

  // Pagination logic
  const { page } = await searchParams;
  const currentPage = parseInt(page || '1') || 1;
  const itemsPerPage = 20;
  const offset = (currentPage - 1) * itemsPerPage;

  const totalBetsRes = await db.select({ count: sql<number>`count(*)` }).from(bets);
  const totalBetsCount = totalBetsRes[0]?.count || 0;
  const totalPages = Math.ceil(totalBetsCount / itemsPerPage);

  // Fetch paginated bets with user and market info
  const allBets = await db
    .select({
      bet: bets,
      user: users,
      market: markets,
    })
    .from(bets)
    .leftJoin(users, eq(bets.userId, users.id))
    .leftJoin(markets, eq(bets.marketId, markets.id))
    .orderBy(desc(bets.createdAt))
    .limit(itemsPerPage)
    .offset(offset);

  // Calculate total platform commission earned
  const allCommissionLogs = await db.select().from(commissionLogs);
  const totalCommission = allCommissionLogs.reduce((sum, log) => sum + log.amount, 0);

  // Calculate Revenue By Market
  const allMarkets = await db.select().from(markets).orderBy(desc(markets.createdAt));
  const revenueByMarket = allMarkets.map(m => {
    const marketBets = allBets.filter(b => b.bet.marketId === m.id);
    const totalPool = marketBets.reduce((sum, b) => sum + b.bet.diamonds, 0);
    const adminEarnings = allCommissionLogs.filter(c => c.marketId === m.id).reduce((sum, c) => sum + c.amount, 0);
    return { market: m, totalPool, adminEarnings };
  }).filter(m => m.totalPool > 0);

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-3xl font-bold tracking-tight">Global Bids & Revenue</h1>
      
      <section className="grid gap-4 md:grid-cols-3">
        <Card className="bg-gradient-to-br from-green-900/40 to-emerald-900/20 border-green-500/20 shadow-lg md:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Commission Earned</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold flex items-center gap-2 text-green-400">
              <span className="text-blue-400">♦</span>
              {totalCommission.toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Revenue by Market</CardTitle>
          <CardDescription>Breakdown of betting pools and admin earnings per market.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Market</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Total Pool</TableHead>
                <TableHead className="text-right">Admin Earnings</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {revenueByMarket.map(({ market, totalPool, adminEarnings }) => (
                <TableRow key={market.id}>
                  <TableCell className="font-medium max-w-[200px] truncate" title={market.question}>
                    {market.question}
                  </TableCell>
                  <TableCell>
                    <span className="px-2 py-1 bg-muted rounded-md text-xs font-semibold">{market.category}</span>
                  </TableCell>
                  <TableCell>{market.status}</TableCell>
                  <TableCell className="text-right font-mono text-blue-500 font-bold">
                    ♦ {totalPool.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right font-mono text-green-500 font-bold">
                    ♦ {adminEarnings.toLocaleString()}
                  </TableCell>
                </TableRow>
              ))}
              {revenueByMarket.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                    No betting activity found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Platform Bid History</CardTitle>
          <CardDescription>Every single prediction placed on the platform.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Time</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Market</TableHead>
                <TableHead>Prediction</TableHead>
                <TableHead className="text-right">Wager</TableHead>
                <TableHead className="text-right">Result</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {allBets.map(({ bet, user, market }) => (
                <TableRow key={bet.id}>
                  <TableCell className="text-muted-foreground text-xs whitespace-nowrap">
                    {new Intl.DateTimeFormat('en-US', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(bet.createdAt))}
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{user?.name}</div>
                    <div className="text-xs text-muted-foreground">{user?.email}</div>
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate" title={market?.question}>
                    {market?.question || `Market #${bet.marketId}`}
                  </TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded text-xs font-bold ${bet.option === 'YES' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                      {bet.option === 'YES' ? market?.optionA || 'YES' : market?.optionB || 'NO'}
                    </span>
                  </TableCell>
                  <TableCell className="text-right font-mono text-blue-400 font-bold">
                    ♦ {bet.diamonds}
                  </TableCell>
                  <TableCell className="text-right">
                    {bet.payout === null ? (
                      <span className="text-muted-foreground text-sm">Pending</span>
                    ) : bet.payout > 0 ? (
                      <span className="text-green-500 font-semibold text-sm">Won {bet.payout}</span>
                    ) : (
                      <span className="text-red-500 font-semibold text-sm">Lost</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {allBets.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    No bets have been placed on the platform yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-between items-center mt-6">
              <div className="text-sm text-muted-foreground">
                Showing page {currentPage} of {totalPages} ({totalBetsCount} total bids)
              </div>
              <div className="flex gap-2">
                <Button variant="outline" disabled={currentPage <= 1} asChild={currentPage > 1}>
                  {currentPage > 1 ? <Link href={`/admin/bids?page=${currentPage - 1}`}>Previous</Link> : <span>Previous</span>}
                </Button>
                <Button variant="outline" disabled={currentPage >= totalPages} asChild={currentPage < totalPages}>
                  {currentPage < totalPages ? <Link href={`/admin/bids?page=${currentPage + 1}`}>Next</Link> : <span>Next</span>}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
