import { auth } from "@/auth";
import { getActiveMarkets, getUserProfile } from "@/actions/market";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import MarketsList from "@/components/markets-list";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await auth();
  if (!session) redirect('/login');

  const markets = await getActiveMarkets();
  const profile = await getUserProfile();

  if (!profile) return null;

  return (
    <div className="container mx-auto p-4 md:p-8 flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
      </div>

      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-to-br from-indigo-900/40 to-blue-900/20 border-indigo-500/20 shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Diamond Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold flex items-center gap-2">
              <span className="text-blue-400">♦</span>
              {profile.user.diamondBalance?.toLocaleString() || 0}
            </div>
          </CardContent>
        </Card>
        {/* Active Bets Stat */}
        <Card className="bg-card shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Bets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {profile.bets.filter(b => b.payout === null).length}
            </div>
          </CardContent>
        </Card>
      </section>

      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold tracking-tight">Active Markets</h2>
          {session.user.role === 'ADMIN' && (
            <a href="/admin">
              <Button variant="outline" type="button">Admin Dashboard</Button>
            </a>
          )}
        </div>
        <MarketsList initialMarkets={markets} isLoggedIn={true} />
      </section>

      <section className="mt-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold tracking-tight">Recent Bets</h2>
          <a href="/dashboard/bids">
            <Button variant="outline" size="sm">View All Bids</Button>
          </a>
        </div>
        <div className="space-y-4">
          {profile.bets.slice(0, 3).map(bet => {
            const market = markets.find(m => m.id === bet.marketId);
            return (
              <Card key={bet.id} className="border-border/50 hover:bg-muted/10 transition-colors">
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <div className="font-medium">{market?.question || `Market #${bet.marketId}`}</div>
                    <div className="text-sm text-muted-foreground">
                      Predicted: <strong className={bet.option === 'YES' ? 'text-green-500' : 'text-red-500'}>{bet.option}</strong>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold flex items-center justify-end gap-1">
                      <span className="text-blue-400 text-xs">♦</span> {bet.diamonds}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {bet.payout === null ? 'Pending' : bet.payout > 0 ? <span className="text-green-500">Won {bet.payout}</span> : <span className="text-red-500">Lost</span>}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
          {profile.bets.length === 0 && (
            <div className="text-muted-foreground text-sm">You haven't placed any bets yet.</div>
          )}
        </div>
      </section>
    </div>
  );
}
