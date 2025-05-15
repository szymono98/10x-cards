import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  // Early return for static assets and API routes
  if (
    req.nextUrl.pathname.startsWith('/_next') ||
    req.nextUrl.pathname.startsWith('/api') ||
    req.nextUrl.pathname.match(/\.(ico|png|jpg|jpeg|svg)$/)
  ) {
    return NextResponse.next();
  }

  // Handle root path early
  if (req.nextUrl.pathname === '/') {
    return NextResponse.redirect(new URL('/generate', req.url));
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
      // W przypadku błędu sesji, pozwól na dostęp do publicznych ścieżek
      if (!req.nextUrl.pathname.startsWith('/auth/')) {
        return NextResponse.redirect(new URL('/auth/login', req.url));
      }
      return res;
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

    return res;
  } catch (error) {
    console.error('Middleware critical error:', error);
    
    // W przypadku krytycznego błędu, pozwól na kontynuację dla statycznych assetów
    if (req.nextUrl.pathname.startsWith('/_next/static')) {
      return NextResponse.next();
    }
    
    // Dla pozostałych ścieżek, przekieruj do logowania
    if (!req.nextUrl.pathname.startsWith('/auth/')) {
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
