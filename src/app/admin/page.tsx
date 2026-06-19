import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { users, markets, bets, transactions, auditLogs } from "@/db/schema";
import { desc, eq, sql } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AdminClient from "./admin-client";

export default async function AdminDashboard() {
  const session = await auth();
  
  if (session?.user?.role !== 'ADMIN') {
    redirect('/');
  }

  // Fetch stats
  const totalUsers = await db.select({ count: sql<number>`count(*)` }).from(users);
  const totalMarkets = await db.select({ count: sql<number>`count(*)` }).from(markets);
  const totalBets = await db.select({ count: sql<number>`count(*)` }).from(bets);
  
  // Fetch lists
  const recentMarkets = await db.query.markets.findMany({
    orderBy: [desc(markets.createdAt)],
    limit: 10,
    with: { pools: true }
  });

  const recentAudits = await db.query.auditLogs.findMany({
    orderBy: [desc(auditLogs.createdAt)],
    limit: 10,
  });

  return (
    <div className="container mx-auto p-4 md:p-8 flex flex-col gap-8">
      <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
      
      <section className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers[0].count}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Markets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalMarkets[0].count}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Bets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalBets[0].count}</div>
          </CardContent>
        </Card>
      </section>

      <AdminClient markets={recentMarkets} auditLogs={recentAudits} />
    </div>
  );
}
