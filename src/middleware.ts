import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function middleware(req: NextRequest) {
  try {
    const res = NextResponse.next();
    const supabase = createMiddlewareClient({ req, res });
    const {
      data: { session },
    } = await supabase.auth.getSession();

    // Protected paths
    const protectedPaths = ['/my-collection'];
    const isProtectedPath = protectedPaths.some((path) => req.nextUrl.pathname.startsWith(path));

    // Redirect from protected paths to login
    if (isProtectedPath && !session) {
      const redirectUrl = new URL('/auth/login', req.url);
      return NextResponse.redirect(redirectUrl);
    }

    // Handle /auth/login redirect only when user is logged in
    if (req.nextUrl.pathname === '/auth/login' && session) {
      const { user } = session;
      const isRegistering = user.user_metadata?.registration === true;

      if (!isRegistering) {
        const redirectUrl = new URL('/generate', req.url);
        return NextResponse.redirect(redirectUrl);
      }
    }

    return res;
  } catch (error) {
    console.error('Middleware error:', error);
    return NextResponse.next();
  }
}

// Update matcher to be more specific and Cloudflare-compatible
export const config = {
  matcher: [
    '/',
    '/generate',
    '/my-collection/:path*',
    '/auth/:path*'
  ]
};
