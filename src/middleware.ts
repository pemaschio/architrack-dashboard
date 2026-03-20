import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { NextResponse, type NextRequest } from 'next/server'

const PHONE_REGEX = /^55\d{10,11}$/

/**
 * Fallback: creates org + public user from auth metadata.
 * Handles the case where PKCE code exchange fails (e.g., user opens
 * confirmation email in a different tab/browser) but email was confirmed
 * on Supabase's side, so handleSignupMetadata never ran.
 */
async function ensurePublicUser(authUserId: string, email: string | undefined, metadata: Record<string, string>) {
  const { name, phone, org_name, role } = metadata
  if (!org_name || !name || !phone || !role) return false
  if (!PHONE_REGEX.test(phone)) return false

  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )

  // Check if already exists
  const { data: existing } = await admin
    .from('users')
    .select('id')
    .eq('auth_id', authUserId)
    .single()
  if (existing) return true

  // Upsert org
  const { data: orgRows, error: orgError } = await admin.rpc(
    'upsert_org_by_name',
    { p_name: org_name.trim() }
  )
  if (orgError || !orgRows || (orgRows as { id: string }[]).length === 0) {
    console.error('[middleware] org upsert failed:', orgError)
    return false
  }
  const orgId = (orgRows as { id: string }[])[0].id

  // Insert user
  const { error: userError } = await admin.from('users').insert({
    auth_id: authUserId,
    org_id: orgId,
    name: name.trim(),
    phone: phone.trim(),
    email: email ?? null,
    role,
    is_active: true,
  })

  if (userError) {
    console.error('[middleware] user insert failed:', userError)
    return false
  }

  return true
}

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
  if (user && isDashboardRoute) {
    const { data: userRecord } = await supabase
      .from('users')
      .select('id')
      .eq('auth_id', user.id)
      .single()

    if (!userRecord) {
      // Fallback: try to create the public user from auth metadata
      // This handles the PKCE cookie-loss scenario
      const created = await ensurePublicUser(
        user.id,
        user.email,
        (user.user_metadata ?? {}) as Record<string, string>
      )

      if (!created) {
        await supabase.auth.signOut()
        return NextResponse.redirect(
          new URL('/login?error=pending_confirmation', request.url)
        )
      }
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api).*)'],
}
