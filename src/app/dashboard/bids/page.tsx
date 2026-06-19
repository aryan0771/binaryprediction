import { auth } from "@/auth";
import { db } from "@/db";
import { bets, markets } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { redirect } from "next/navigation";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default async function BidHistoryPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');
  
  const userId = parseInt(session.user.id);

  // Fetch all user bets
  const userBets = await db.select().from(bets).where(eq(bets.userId, userId)).orderBy(desc(bets.createdAt));
  const allMarkets = await db.select().from(markets);

  return (
    <div className="container mx-auto p-4 md:p-8 max-w-5xl flex flex-col gap-8">
      <h1 className="text-3xl font-bold tracking-tight">Bid History</h1>

      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle>All Placed Bets</CardTitle>
          <CardDescription>A comprehensive history of every prediction you've made.</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Market</TableHead>
                <TableHead>Prediction</TableHead>
                <TableHead>Wager</TableHead>
                <TableHead>Result</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {userBets.map(bet => {
                const market = allMarkets.find(m => m.id === bet.marketId);
                return (
                  <TableRow key={bet.id}>
                    <TableCell className="text-muted-foreground whitespace-nowrap">
                      {new Intl.DateTimeFormat('en-US', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(bet.createdAt))}
                    </TableCell>
                    <TableCell className="font-medium max-w-[250px] truncate" title={market?.question}>
                      {market?.question || `Market #${bet.marketId}`}
                    </TableCell>
                    <TableCell>
                      <span className="font-bold text-primary">
                        {bet.option}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="flex items-center gap-1 text-blue-400">♦ {bet.diamonds}</span>
                    </TableCell>
                    <TableCell>
                      {bet.payout === null ? (
                        <span className="text-muted-foreground">Pending</span>
                      ) : bet.payout > 0 ? (
                        <span className="text-green-500 font-semibold">Won {bet.payout}</span>
                      ) : (
                        <span className="text-red-500 font-semibold">Lost</span>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
              {userBets.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                    No bids found. Start predicting!
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
