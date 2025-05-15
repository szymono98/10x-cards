import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  // Skip middleware for static files and API routes
  if (
    req.nextUrl.pathname.startsWith('/_next') ||
    req.nextUrl.pathname.startsWith('/api')
  ) {
    return NextResponse.next();
  }

  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const pathname = req.nextUrl.pathname;

  // Protected paths
  const protectedPaths = ['/my-collection'];
  const isProtectedPath = protectedPaths.some((path) => pathname.startsWith(path));

  // Redirect from protected paths to login
  if (isProtectedPath && !session) {
    const redirectUrl = new URL('/auth/login', req.url);
    return NextResponse.redirect(redirectUrl);
  }

  // Handle /auth/login redirect only when user is logged in and not registering
  if (pathname === '/auth/login' && session) {
    const { user } = session;
    const isRegistering = user.user_metadata?.registration === true;

    if (!isRegistering) {
      const redirectUrl = new URL('/generate', req.url);
      return NextResponse.redirect(redirectUrl);
    }
  }

  return res;
}

// Configure middleware matcher
export const config = {
  matcher: [
    '/',
    '/generate',
    '/my-collection/:path*',
    '/auth/:path*'
  ]
};
