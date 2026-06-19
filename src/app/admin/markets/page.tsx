import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { markets, auditLogs } from "@/db/schema";
import { desc } from "drizzle-orm";
import MarketsClient from "./markets-client";

export default async function AdminMarketsPage() {
  const session = await auth();
  
  if (session?.user?.role !== 'ADMIN') {
    redirect('/');
  }

  // Fetch lists
  const recentMarkets = await db.query.markets.findMany({
    orderBy: [desc(markets.createdAt)],
    limit: 50,
    with: { pools: true }
  });

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-3xl font-bold tracking-tight">Market Management</h1>
      <MarketsClient markets={recentMarkets} auditLogs={[]} />
    </div>
  );
}
