import { auth } from "@/auth";
import { db } from "@/db";
import { transactions } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { redirect } from "next/navigation";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default async function WalletLedgerPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');
  
  const userId = parseInt(session.user.id);

  // Fetch all user transactions
  const userTx = await db.select().from(transactions).where(eq(transactions.userId, userId)).orderBy(desc(transactions.createdAt));

  return (
    <div className="container mx-auto p-4 md:p-8 max-w-5xl flex flex-col gap-8">
      <h1 className="text-3xl font-bold tracking-tight">Wallet Ledger</h1>

      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
          <CardDescription>A detailed ledger of all your credits and debits.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-right">Balance After</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {userTx.map(tx => (
                <TableRow key={tx.id}>
                  <TableCell className="text-muted-foreground whitespace-nowrap">
                    {new Intl.DateTimeFormat('en-US', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(tx.createdAt))}
                  </TableCell>
                  <TableCell>
                    <span className="px-2 py-1 bg-muted rounded-md text-xs font-semibold">{tx.type}</span>
                  </TableCell>
                  <TableCell className="max-w-[300px] truncate" title={tx.description}>
                    {tx.description}
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    <span className={tx.amount > 0 ? "text-green-500" : "text-red-500"}>
                      {tx.amount > 0 ? '+' : ''}{tx.amount} ♦
                    </span>
                  </TableCell>
                  <TableCell className="text-right font-mono text-blue-400">
                    {tx.balanceAfter} ♦
                  </TableCell>
                </TableRow>
              ))}
              {userTx.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                    No transactions found.
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
