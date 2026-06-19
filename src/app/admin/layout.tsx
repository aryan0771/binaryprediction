import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { LayoutDashboard, Store, Users, CircleDollarSign } from "lucide-react";

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  
  if (session?.user?.role !== 'ADMIN') {
    redirect('/');
  }

  return (
    <div className="container mx-auto p-4 md:p-8 flex flex-col md:flex-row gap-6 md:gap-8 pb-20 md:pb-8">
      {/* Sidebar Navigation */}
      <aside className="md:w-64 flex-shrink-0">
        {/* Mobile Bottom Navigation */}
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-xl border-t border-border/50 flex flex-row justify-around items-center h-16 pb-safe px-2 sm:hidden shadow-[0_-10px_40px_rgba(0,0,0,0.1)]">
          <a href="/admin" className="flex flex-col items-center justify-center w-full h-full text-muted-foreground hover:text-primary transition-colors">
            <LayoutDashboard className="h-5 w-5 mb-1" />
            <span className="text-[10px] font-medium tracking-wide">Overview</span>
          </a>
          <a href="/admin/markets" className="flex flex-col items-center justify-center w-full h-full text-muted-foreground hover:text-primary transition-colors">
            <Store className="h-5 w-5 mb-1" />
            <span className="text-[10px] font-medium tracking-wide">Markets</span>
          </a>
          <a href="/admin/users" className="flex flex-col items-center justify-center w-full h-full text-muted-foreground hover:text-primary transition-colors">
            <Users className="h-5 w-5 mb-1" />
            <span className="text-[10px] font-medium tracking-wide">Users</span>
          </a>
          <a href="/admin/bids" className="flex flex-col items-center justify-center w-full h-full text-muted-foreground hover:text-primary transition-colors">
            <CircleDollarSign className="h-5 w-5 mb-1" />
            <span className="text-[10px] font-medium tracking-wide">Bids</span>
          </a>
        </nav>

        {/* Desktop Sidebar Navigation */}
        <nav className="hidden sm:flex flex-col gap-2 sticky top-20">
          <a href="/admin" className="px-4 py-3 rounded-lg hover:bg-muted font-medium transition-colors">
            Overview
          </a>
          <a href="/admin/markets" className="px-4 py-3 rounded-lg hover:bg-muted font-medium transition-colors">
            Markets Management
          </a>
          <a href="/admin/users" className="px-4 py-3 rounded-lg hover:bg-muted font-medium transition-colors">
            Users Management
          </a>
          <a href="/admin/bids" className="px-4 py-3 rounded-lg hover:bg-muted font-medium transition-colors">
            Global Bids & Revenue
          </a>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}
