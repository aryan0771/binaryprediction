import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { bets, users, markets, commissionLogs } from "@/db/schema";
import { desc, eq, sql } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default async function AdminBidsPage() {
  const session = await auth();
  
  if (session?.user?.role !== 'ADMIN') {
    redirect('/');
  }

  // Fetch all bets with user and market info
  const allBets = await db
    .select({
      bet: bets,
      user: users,
      market: markets,
    })
    .from(bets)
    .leftJoin(users, eq(bets.userId, users.id))
    .leftJoin(markets, eq(bets.marketId, markets.id))
    .orderBy(desc(bets.createdAt));

  // Calculate total platform commission earned
  const totalCommissionResult = await db.select({ total: sql<number>`SUM(amount)` }).from(commissionLogs);
  const totalCommission = totalCommissionResult[0]?.total || 0;

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
        </CardContent>
      </Card>
    </div>
  );
}
