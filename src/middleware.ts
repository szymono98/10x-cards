import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  // Early return for static assets and API routes
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

    // Try to get the session
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError) {
      console.error('Session error:', sessionError);
      // Na błąd sesji, przekieruj do logowania
      if (req.nextUrl.pathname !== '/auth/login') {
        return NextResponse.redirect(new URL('/auth/login', req.url));
      }
      return res;
    }

    // Dodaj nagłówki sesji do odpowiedzi
    if (session) {
      res.headers.set('x-session-user', session.user.id);
      res.headers.set('x-session-token', session.access_token);
    }

    // Protected paths logic
    const protectedPaths = ['/my-collection', '/generate'];
    const isProtectedPath = protectedPaths.some((path) => 
      req.nextUrl.pathname.startsWith(path)
    );

    if (!session && isProtectedPath) {
      const redirectUrl = new URL('/auth/login', req.url);
      redirectUrl.searchParams.set('returnTo', req.nextUrl.pathname);
      return NextResponse.redirect(redirectUrl);
    }

    // Przekierowanie zalogowanych użytkowników z auth pages
    if (session && req.nextUrl.pathname.startsWith('/auth/')) {
      return NextResponse.redirect(new URL('/generate', req.url));
    }

    // Przekierowanie z root path
    if (req.nextUrl.pathname === '/') {
      return NextResponse.redirect(new URL('/generate', req.url));
    }

    return res;
  } catch (error) {
    console.error('Middleware critical error:', error);
    // W przypadku krytycznego błędu, przekieruj do strony logowania
    if (req.nextUrl.pathname !== '/auth/login') {
      return NextResponse.redirect(new URL('/auth/login', req.url));
    }
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
