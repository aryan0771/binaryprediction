import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Toaster } from "@/components/ui/sonner";
import { auth } from "@/auth";
import Image from "next/image";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User, List, Wallet, LogOut, Settings } from "lucide-react";

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
              <div className="container flex h-16 sm:h-20 items-center justify-between">
                <a href={session ? "/dashboard" : "/"} className="flex items-center gap-2 ml-2 hover:opacity-80 transition-opacity">
                  <Image src="/logo.png" alt="Predictify Logo" width={800} height={300} className="object-contain w-40 h-auto sm:w-56" priority />
                </a>
                <nav className="flex items-center gap-4">
                  {session ? (
                    <>
                      <a href="/dashboard" className="text-sm font-medium hover:text-blue-400 transition-colors mr-2 hidden sm:block">Dashboard</a>
                      <DropdownMenu>
                        <DropdownMenuTrigger className="focus:outline-none mr-4">
                          <Avatar className="h-8 w-8 bg-blue-600/20 text-blue-500 hover:bg-blue-600/30 transition-colors">
                            <AvatarFallback>
                              <User className="h-4 w-4" />
                            </AvatarFallback>
                          </Avatar>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                          <DropdownMenuGroup>
                            <DropdownMenuLabel>My Account</DropdownMenuLabel>
                          </DropdownMenuGroup>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem asChild>
                            <a href="/dashboard/profile" className="cursor-pointer flex items-center w-full">
                              <Settings className="mr-2 h-4 w-4" />
                              <span>Profile Settings</span>
                            </a>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <a href="/dashboard/wallet" className="cursor-pointer flex items-center w-full">
                              <Wallet className="mr-2 h-4 w-4" />
                              <span>Wallet Ledger</span>
                            </a>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <a href="/dashboard/bids" className="cursor-pointer flex items-center w-full">
                              <List className="mr-2 h-4 w-4" />
                              <span>Bid History</span>
                            </a>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem asChild>
                            <form action="/api/auth/signout" method="POST" className="w-full">
                              <button className="flex items-center w-full text-red-400 cursor-pointer">
                                <LogOut className="mr-2 h-4 w-4" />
                                <span>Logout</span>
                              </button>
                            </form>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
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
