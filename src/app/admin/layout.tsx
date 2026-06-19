import { auth } from "@/auth";
import { redirect } from "next/navigation";

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
    <div className="container mx-auto p-4 md:p-8 flex flex-col md:flex-row gap-8">
      {/* Sidebar Navigation */}
      <aside className="md:w-64 flex-shrink-0">
        <nav className="flex flex-col gap-2 sticky top-20">
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
