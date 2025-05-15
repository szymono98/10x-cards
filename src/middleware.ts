import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  // Early return for static assets
  if (
    req.nextUrl.pathname.startsWith('/_next/static') ||
    req.nextUrl.pathname.startsWith('/api') ||
    req.nextUrl.pathname.match(/\.(ico|png|jpg|jpeg|svg)$/)
  ) {
    return NextResponse.next();
  }

  try {
    const res = NextResponse.next();
    const supabase = createMiddlewareClient({ req, res });

    // Handle data route requests first
    if (req.nextUrl.pathname.includes('/_next/data/')) {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          res.headers.set('x-session-user', session.user.id);
          res.headers.set('x-session-token', session.access_token);
        }
      } catch (error) {
        console.error('Error fetching session for data route:', error);
      }
      return res;
    }

    // Get session for other routes
    const { data: { session } } = await supabase.auth.getSession();
    
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
  } catch (error) {
    console.error('Error in middleware:', error);
    return NextResponse.next();
  }
}

// Configure middleware matcher
export const config = {
  matcher: [
    '/',
    '/generate',
    '/my-collection/:path*',
    '/auth/:path*',
    '/_next/data/:path*'
  ]
};
