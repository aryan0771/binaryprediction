import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { markets, bets, users, commissionLogs } from "@/db/schema";
import { eq, desc, sql } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function AdminMarketDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (session?.user?.role !== 'ADMIN') redirect('/');

  const { id } = await params;
  const marketId = parseInt(id);
  if (isNaN(marketId)) redirect('/admin/markets');

  // Fetch Market
  const [market] = await db.select().from(markets).where(eq(markets.id, marketId));
  if (!market) redirect('/admin/markets');

  // Fetch Stats
  const totalBidCountRes = await db.select({ count: sql<number>`count(*)` }).from(bets).where(eq(bets.marketId, marketId));
  const totalBidCount = totalBidCountRes[0].count;

  const totalDiamondsRes = await db.select({ total: sql<number>`SUM(diamonds)` }).from(bets).where(eq(bets.marketId, marketId));
  const totalDiamonds = totalDiamondsRes[0].total || 0;

  const totalAdminCutRes = await db.select({ total: sql<number>`SUM(amount)` }).from(commissionLogs).where(eq(commissionLogs.marketId, marketId));
  const totalAdminCut = totalAdminCutRes[0].total || 0;

  // Fetch Bid History
  const marketBets = await db
    .select({
      bet: bets,
      user: users,
    })
    .from(bets)
    .leftJoin(users, eq(bets.userId, users.id))
    .where(eq(bets.marketId, marketId))
    .orderBy(desc(bets.createdAt));

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Market Details</h1>
        <Link href="/admin/markets">
          <Button variant="outline">&larr; Back to Markets</Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-xl">{market.question}</CardTitle>
              <CardDescription className="mt-2">
                <span className="inline-block px-2 py-1 bg-muted rounded-md text-xs font-semibold mr-2">{market.category}</span>
                <span className={`inline-block px-2 py-1 rounded-md text-xs font-bold ${market.status === 'OPEN' ? 'bg-green-500/10 text-green-500' : 'bg-gray-500/10 text-gray-500'}`}>
                  {market.status}
                </span>
                {market.status === 'SETTLED' && (
                  <span className="inline-block px-2 py-1 bg-yellow-500/10 text-yellow-600 rounded-md text-xs font-bold ml-2">
                    WON: {market.winningOption === 'YES' ? market.optionA : market.optionB}
                  </span>
                )}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      <section className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Bid Count</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalBidCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Diamonds Bid (Pool)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-500">♦ {totalDiamonds.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-900/20 to-emerald-900/10 border-green-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-500">Total Admin Cut</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-400">♦ {totalAdminCut.toLocaleString()}</div>
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Market Bid History</CardTitle>
          <CardDescription>A complete ledger of every bet placed on this specific market.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Time</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Prediction</TableHead>
                <TableHead className="text-right">Wager</TableHead>
                <TableHead className="text-right">Result</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {marketBets.map(({ bet, user }) => (
                <TableRow key={bet.id}>
                  <TableCell className="text-muted-foreground text-xs whitespace-nowrap">
                    {new Intl.DateTimeFormat('en-US', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(bet.createdAt))}
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{user?.name}</div>
                    <div className="text-xs text-muted-foreground">{user?.email}</div>
                  </TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded text-xs font-bold ${bet.option === 'YES' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                      {bet.option === 'YES' ? market.optionA : market.optionB}
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
              {marketBets.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                    No bets have been placed on this market yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
