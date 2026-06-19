import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Toaster } from "@/components/ui/sonner";
import { auth } from "@/auth";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "Prediction Markets Platform",
  description: "Enterprise-grade prediction market platform.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased bg-background text-foreground`} suppressHydrationWarning>
        <Providers>
          <div className="min-h-screen flex flex-col">
            <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <div className="container flex h-14 items-center justify-between">
                <div className="font-bold text-xl tracking-tight bg-gradient-to-r from-blue-500 to-teal-400 bg-clip-text text-transparent">
                  Predictify
                </div>
                <nav className="flex items-center gap-4">
                  {session ? (
                    <>
                      <span className="text-sm text-muted-foreground">{session.user?.email}</span>
                      <form action="/api/auth/signout" method="POST">
                        <button className="text-sm font-medium hover:underline">Logout</button>
                      </form>
                    </>
                  ) : (
                    <a href="/login" className="text-sm font-medium hover:underline">Login</a>
                  )}
                </nav>
              </div>
            </header>
            <main className="flex-1 flex flex-col">
              {children}
            </main>
          </div>
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
