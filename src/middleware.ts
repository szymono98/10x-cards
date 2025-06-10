import { createServerClient } from '@supabase/ssr';
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
    console.log('[Middleware] Redirecting root path to /generate');
    return NextResponse.redirect(new URL('/generate', req.url));
  }

  const response = NextResponse.next({
    request: {
      headers: req.headers,
    },
  });

  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return req.cookies.get(name)?.value;
          },
          set(name: string, value: string, options: Record<string, unknown>) {
            response.cookies.set({ name, value, ...options });
          },
          remove(name: string, options: Record<string, unknown>) {
            response.cookies.set({ name, value: '', ...options });
          },
        },
      }
    );

    const { data: { user }, error: sessionError } = await supabase.auth.getUser();

    if (sessionError) {
      if (req.nextUrl.pathname === '/my-collection') {
        return NextResponse.redirect(new URL('/auth/login', req.url));
      }
      return response;
    }

    // Protected paths logic - tylko /my-collection wymaga autentykacji
    const protectedPaths = ['/my-collection'];
    const isProtectedPath = protectedPaths.some((path) => 
      req.nextUrl.pathname.startsWith(path)
    );

    if (!user && isProtectedPath) {
      console.log('[Middleware] Unauthorized access to protected path');
      const redirectUrl = new URL('/auth/login', req.url);
      redirectUrl.searchParams.set('returnTo', req.nextUrl.pathname);
      return NextResponse.redirect(redirectUrl);
    }

    // Przekierowanie zalogowanych użytkowników z auth pages
    if (user && req.nextUrl.pathname.startsWith('/auth/')) {
      console.log('[Middleware] Redirecting authenticated user from auth page');
      return NextResponse.redirect(new URL('/generate', req.url));
    }

    // Dodaj nagłówki diagnostyczne
    response.headers.set('x-middleware-cache', 'no-cache');
    response.headers.set('x-middleware-handled', 'true');
    response.headers.set('x-environment', process.env.NODE_ENV || 'development');
    if (user) {
      response.headers.set('x-session-user', user.id);
    }

    console.log('[Middleware] Request processed successfully');
    return response;
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
    
    return response;
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
