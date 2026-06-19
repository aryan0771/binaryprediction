import { auth } from "@/auth";
import { db } from "@/db";
import { markets, marketPools, bets, users } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { redirect } from "next/navigation";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import MarketCard from "@/components/market-card";

export default async function MarketDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) redirect('/login');
  
  const { id } = await params;
  const marketId = parseInt(id);

  // Fetch the specific market and pool
  const [market] = await db.select().from(markets).where(eq(markets.id, marketId));
  if (!market) {
    return <div className="p-8 text-center">Market not found.</div>;
  }
  
  const [pool] = await db.select().from(marketPools).where(eq(marketPools.marketId, marketId));
  const marketWithPool = { ...market, pool };

  // Fetch all bets on this market along with masked user emails
  const allBets = await db
    .select({
      bet: bets,
      user: users,
    })
    .from(bets)
    .where(eq(bets.marketId, marketId))
    .leftJoin(users, eq(bets.userId, users.id))
    .orderBy(desc(bets.createdAt));

  return (
    <div className="container mx-auto p-4 md:p-8 max-w-5xl flex flex-col gap-8">
      <h1 className="text-3xl font-bold tracking-tight">Market Details</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <MarketCard market={marketWithPool} isLoggedIn={true} />
        </div>

        <div className="lg:col-span-2 min-w-0">
          <Card className="overflow-hidden">
            <CardHeader>
              <CardTitle>All Predictions</CardTitle>
              <CardDescription>Real-time view of everyone's bets on this market.</CardDescription>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Prediction</TableHead>
                    <TableHead className="text-right">Amount (♦)</TableHead>
                    <TableHead className="text-right">Time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allBets.map(({ bet, user }) => {
                    const maskedEmail = user ? `${user.email.substring(0, 3)}***@${user.email.split('@')[1]}` : 'Unknown';
                    return (
                      <TableRow key={bet.id}>
                        <TableCell className="font-medium">
                          {maskedEmail}
                        </TableCell>
                        <TableCell>
                          <span className="px-2 py-1 rounded text-xs font-bold bg-primary/10 text-primary">
                            {bet.option}
                          </span>
                        </TableCell>
                        <TableCell className="text-right font-mono text-blue-400">
                          {bet.diamonds}
                        </TableCell>
                        <TableCell className="text-right text-muted-foreground text-xs whitespace-nowrap">
                          {new Intl.DateTimeFormat('en-US', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(bet.createdAt))}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {allBets.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                        No predictions have been made on this market yet.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
