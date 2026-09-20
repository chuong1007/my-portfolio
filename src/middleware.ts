import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  let user = null;
  let isPublished = true;
  
  try {
    // 1. Check session first (no network request, just reads cookies)
    const { data: { session } } = await supabase.auth.getSession();

    // 2. Fetch global_settings using REST API with caching to save Disk IO
    const settingsUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/site_content?id=eq.global_settings&select=data`;
    const res = await fetch(settingsUrl, {
      headers: {
        apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!}`
      },
      next: { revalidate: 60 } // Cache for 60s
    });
    
    if (res.ok) {
      const data = await res.json();
      if (data && data.length > 0) {
        isPublished = data[0]?.data?.isPublished !== false;
      }
    }

    // 3. Only verify user via DB if accessing /admin OR if site is offline and they have a session cookie
    const isProtectingAdmin = request.nextUrl.pathname.startsWith('/admin');
    const needsUserCheck = isProtectingAdmin || (!isPublished && session);

    if (needsUserCheck) {
      const authResult = await supabase.auth.getUser();
      user = authResult.data?.user;
    }
  } catch (err) {
    console.error("Middleware Supabase fetch error:", err);
  }

  // If site is unpublished, redirect non-admins to coming-soon (except /admin routes)
  if (!isPublished && !user && !request.nextUrl.pathname.startsWith('/admin') && request.nextUrl.pathname !== '/coming-soon') {
    const url = request.nextUrl.clone()
    url.pathname = '/coming-soon'
    return NextResponse.redirect(url)
  }

  // If site IS published, and they are on /coming-soon, redirect to home
  if (isPublished && request.nextUrl.pathname === '/coming-soon') {
    const url = request.nextUrl.clone()
    url.pathname = '/'
    return NextResponse.redirect(url)
  }

  // Protect all /admin routes
  if (request.nextUrl.pathname.startsWith('/admin')) {
    if (!user) {
      // Redirect to home if not authenticated
      const redirectUrl = request.nextUrl.clone()
      redirectUrl.pathname = '/'
      return NextResponse.redirect(redirectUrl)
    }
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
