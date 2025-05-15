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

  const res = NextResponse.next();

  try {
    const supabase = createMiddlewareClient({ req, res });
    const { data: { session } } = await supabase.auth.getSession();

    // Protected paths
    const protectedPaths = ['/my-collection', '/generate'];
    const isProtectedPath = protectedPaths.some((path) => req.nextUrl.pathname.startsWith(path));

    // Handle auth redirects
    if (!session && isProtectedPath) {
      const redirectUrl = new URL('/auth/login', req.url);
      redirectUrl.searchParams.set('returnTo', req.nextUrl.pathname);
      return NextResponse.redirect(redirectUrl);
    }

    if (session) {
      // Add session headers for data routes
      if (req.nextUrl.pathname.includes('/_next/data/')) {
        res.headers.set('x-session-user', session.user.id);
        res.headers.set('x-session-token', session.access_token);
      }

      // Redirect logged-in users from auth pages to generate
      if (req.nextUrl.pathname.startsWith('/auth/')) {
        return NextResponse.redirect(new URL('/generate', req.url));
      }
    }

    return res;
  } catch (error) {
    console.error('Middleware error:', error);
    // W przypadku błędu, pozwól na kontynuację żądania
    // Edge runtime będzie mógł obsłużyć błąd na poziomie strony
    return res;
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
