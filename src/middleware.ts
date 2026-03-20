import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl
  const isAuthRoute =
    pathname.startsWith('/login') ||
    pathname.startsWith('/signup') ||
    pathname.startsWith('/reset-password') ||
    pathname.startsWith('/update-password')
  const isDashboardRoute =
    pathname.startsWith('/overview') ||
    pathname.startsWith('/projects') ||
    pathname.startsWith('/settings') ||
    pathname.startsWith('/team')

  // Unauthenticated user trying to access dashboard → login
  if (!user && isDashboardRoute) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Authenticated user on auth route → dashboard (except update-password)
  if (user && isAuthRoute && !pathname.startsWith('/update-password')) {
    return NextResponse.redirect(new URL('/overview', request.url))
  }

  // Authenticated user on dashboard → verify public.users record exists
  // Uses auth_id (FK column), NOT users.id (own PK)
  if (user && isDashboardRoute) {
    const { data: userRecord } = await supabase
      .from('users')
      .select('id')
      .eq('auth_id', user.id)
      .single()

    if (!userRecord) {
      // Sign out first to clear session cookie and prevent redirect loop
      await supabase.auth.signOut()
      return NextResponse.redirect(
        new URL('/login?error=pending_confirmation', request.url)
      )
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api).*)'],
}
