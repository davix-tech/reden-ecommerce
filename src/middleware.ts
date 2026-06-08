import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from './lib/auth';

const protectedRoutes = ['/account', '/checkout', '/orders'];
const publicRoutes = ['/auth', '/'];

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const token = request.cookies.get('auth_token')?.value;

  const isProtectedRoute = protectedRoutes.some(route => path.startsWith(route));
  const isPublicRoute = publicRoutes.some(route => path.startsWith(route));

  if (isProtectedRoute) {
    if (!token) {
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }

    const verified = await verifyToken(token);
    if (!verified) {
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/account/:path*', '/checkout/:path*', '/orders/:path*', '/auth/:path*'],
};
