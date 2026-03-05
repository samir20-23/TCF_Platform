import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) => {
            supabaseResponse.cookies.set(name, value, {
              ...options,
              sameSite: 'lax',
              secure: process.env.NODE_ENV === 'production',
              httpOnly: false,
            });
          });
        },
      },
    }
  );

  const { data: { user }, error } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // Public routes — no auth required
  const publicRoutes = [
    '/',
    '/landing-page',
    '/pricing-plans',
    '/faq',
    '/contact',
    '/tcf-guide',
    '/privacy-policy',
    '/terms-of-service',
    '/user-login',
    '/user-registration',
    '/auth/callback',
    '/not-authorized',
  ];

  const isPublicRoute = publicRoutes.some(
    (route) => pathname === route || pathname.startsWith('/api/')
  );

  if (isPublicRoute && !pathname.startsWith('/admin') && !pathname.startsWith('/student')) {
    return supabaseResponse;
  }

  // Helper: get role from DB using service-role client (bypasses RLS)
  async function getUserRole(userId: string): Promise<string | null> {
    const serviceClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );
    const { data, error } = await serviceClient
      .from('users')
      .select('role')
      .eq('id', userId)
      .single();

    if (error || !data) return null;
    return data.role;
  }

  // Redirect logged-in users away from auth pages
  if (user && (pathname === '/user-login' || pathname === '/user-registration')) {
    const role = await getUserRole(user.id);
    const dashboard =
      role === 'admin'
        ? '/admin-dashboard'
        : '/student-dashboard';
    return NextResponse.redirect(new URL(dashboard, request.url));
  }

  // Protect Admin routes — CRITICAL SECURITY
  if (pathname.startsWith('/admin')) {
    if (!user) {
      const loginUrl = new URL('/user-login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Check role from DB using service-role client
    const role = await getUserRole(user.id);

    if (!role || role !== 'admin') {
      return NextResponse.redirect(new URL('/not-authorized', request.url));
    }
  }

  // Protect Student routes
  if (pathname.startsWith('/student')) {
    if (!user) {
      const loginUrl = new URL('/user-login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Protect user-profile page
  if (pathname === '/user-profile') {
    if (!user) {
      const loginUrl = new URL('/user-login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return supabaseResponse;
}
