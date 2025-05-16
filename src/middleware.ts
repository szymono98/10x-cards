import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  // Debug logging
  console.log('[Middleware] Request details:', {
    pathname: req.nextUrl.pathname,
    method: req.method,
    host: req.headers.get('host'),
    userAgent: req.headers.get('user-agent'),
    referer: req.headers.get('referer')
  });
  
  // Early return for static assets and API routes
  if (
    req.nextUrl.pathname.startsWith('/_next') ||
    req.nextUrl.pathname.startsWith('/api') ||
    req.nextUrl.pathname.match(/\.(ico|png|jpg|jpeg|svg)$/)
  ) {
    console.log('[Middleware] Early return for static asset:', req.nextUrl.pathname);
    return NextResponse.next();
  }

  // Handle root path early
  if (req.nextUrl.pathname === '/') {
    console.log('[Middleware] Redirecting root path to /generate');
    return NextResponse.redirect(new URL('/generate', req.url));
  }

  const res = NextResponse.next();

  try {
    console.log('[Middleware] Creating Supabase client');
    const supabase = createMiddlewareClient({ 
      req, 
      res,
    });

    // Try to get the session
    console.log('[Middleware] Fetching session');
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError) {
      console.error('[Middleware] Session error:', sessionError);
      // W przypadku błędu sesji, pozwól na dostęp do wszystkich ścieżek oprócz chronionych
      if (req.nextUrl.pathname === '/my-collection') {
        console.log('[Middleware] Redirecting to login due to session error');
        return NextResponse.redirect(new URL('/auth/login', req.url));
      }
      return res;
    }

    // Log session status
    console.log('[Middleware] Session status:', session ? 'Authenticated' : 'Not authenticated');

    // Protected paths logic - tylko /my-collection wymaga autentykacji
    const protectedPaths = ['/my-collection'];
    const isProtectedPath = protectedPaths.some((path) => 
      req.nextUrl.pathname.startsWith(path)
    );

    if (!session && isProtectedPath) {
      console.log('[Middleware] Unauthorized access to protected path');
      const redirectUrl = new URL('/auth/login', req.url);
      redirectUrl.searchParams.set('returnTo', req.nextUrl.pathname);
      return NextResponse.redirect(redirectUrl);
    }

    // Przekierowanie zalogowanych użytkowników z auth pages
    if (session && req.nextUrl.pathname.startsWith('/auth/')) {
      console.log('[Middleware] Redirecting authenticated user from auth page');
      return NextResponse.redirect(new URL('/generate', req.url));
    }

    // Dodaj nagłówki diagnostyczne
    res.headers.set('x-middleware-cache', 'no-cache');
    res.headers.set('x-middleware-handled', 'true');
    res.headers.set('x-environment', process.env.NODE_ENV || 'development');
    if (session) {
      res.headers.set('x-session-user', session.user.id);
    }

    console.log('[Middleware] Request processed successfully');
    return res;
  } catch (error) {
    console.error('[Middleware] Critical error:', error);
    
    // W przypadku krytycznego błędu, pozwól na kontynuację dla statycznych assetów
    if (req.nextUrl.pathname.startsWith('/_next/static')) {
      return NextResponse.next();
    }
    
    // Dla pozostałych ścieżek, pozwól na kontynuację jeśli nie jest to chroniona ścieżka
    const isProtectedPath = ['/my-collection'].some(path => 
      req.nextUrl.pathname.startsWith(path)
    );
    
    if (isProtectedPath) {
      return NextResponse.redirect(new URL('/auth/login', req.url));
    }
    
    return res;
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
