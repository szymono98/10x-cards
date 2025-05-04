import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Ścieżki wymagające autoryzacji
  const protectedPaths = ['/sets', '/profile'];
  const isProtectedPath = protectedPaths.some((path) => req.nextUrl.pathname.startsWith(path));

  // Przekierowanie z chronionych ścieżek na login
  if (isProtectedPath && !session) {
    return NextResponse.redirect(new URL('/auth/login', req.url));
  }

  // Przekierowanie TYLKO z /auth/login (nie z register ani reset-password)
  // i tylko jeśli użytkownik jest zalogowany i nie ma flagi rejestracji
  if (req.nextUrl.pathname === '/auth/login' && session) {
    const { user } = session;
    const isRegistering = user.user_metadata?.registration === true;

    if (!isRegistering) {
      return NextResponse.redirect(new URL('/generate', req.url));
    }
  }

  return res;
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
