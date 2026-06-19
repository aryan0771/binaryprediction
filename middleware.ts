import NextAuth from "next-auth"
import { authConfig } from "@/auth.config"
import { NextResponse } from "next/server"

const { auth } = NextAuth(authConfig)

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const isApiAuthRoute = req.nextUrl.pathname.startsWith('/api/auth');
  const isPublicRoute = req.nextUrl.pathname === '/login' || req.nextUrl.pathname === '/register';
  const isAdminRoute = req.nextUrl.pathname.startsWith('/admin');

  if (isApiAuthRoute) {
    return NextResponse.next();
  }

  if (!isLoggedIn && !isPublicRoute) {
    return NextResponse.redirect(new URL('/login', req.nextUrl));
  }

  if (isLoggedIn && isPublicRoute) {
    return NextResponse.redirect(new URL('/', req.nextUrl));
  }

  if (isAdminRoute && req.auth?.user?.role !== 'ADMIN') {
    return NextResponse.redirect(new URL('/', req.nextUrl));
  }

  return NextResponse.next();
})

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
