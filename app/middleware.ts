import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token    = request.cookies.get('token')?.value;
  const userCookie = request.cookies.get('user')?.value;
  const { pathname } = request.nextUrl;

  const role = userCookie ? JSON.parse(userCookie).role : null;

  if ((pathname === '/login' || pathname === '/register') && token) {
    if (role === 'applicant') {
      return NextResponse.redirect(new URL('/jobs', request.url));
    }
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  if (pathname.startsWith('/dashboard') && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (pathname.startsWith('/dashboard') && role === 'applicant') {
    return NextResponse.redirect(new URL('/jobs', request.url));
  }

  if (pathname.startsWith('/jobs') && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/login', '/register', '/dashboard/:path*', '/jobs/:path*'],
};