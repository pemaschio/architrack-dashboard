import { createServerClient } from '@supabase/ssr'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextRequest, NextResponse } from 'next/server'

const PHONE_REGEX = /^55\d{10,11}$/

async function handleSignupMetadata(
  authUserId: string,
  authUserEmail: string | undefined,
  metadata: Record<string, string>
): Promise<{ error?: string }> {
  const { name, phone, org_name, role } = metadata

  // Only handle self-signup (has org_name). Invited users have org_id and
  // already have a public.users record — they fall through without action.
  if (!org_name) return {}

  if (!name || !phone || !role) return { error: 'missing_fields' }
  if (!PHONE_REGEX.test(phone)) return { error: 'invalid_phone' }

  const admin = createAdminClient()

  // Guard: check if public.users already exists for this auth_id
  // (handles re-confirmation of same magic link)
  const { data: existing } = await admin
    .from('users')
    .select('id')
    .eq('auth_id', authUserId)  // auth_id is the FK column, NOT users.id
    .single()
  if (existing) return {}

  // Upsert org by name — ON CONFLICT returns existing row's id
  const { data: orgRows, error: orgError } = await admin.rpc(
    'upsert_org_by_name',
    { p_name: org_name.trim() }
  )
  if (orgError || !orgRows || orgRows.length === 0) {
    console.error('[signup] org upsert failed:', orgError)
    return { error: 'org_creation_failed' }
  }
  const orgId = (orgRows as { id: string }[])[0].id

  // Insert user — auth_id links to auth.users, id is auto-generated
  const { error: userError } = await admin.from('users').insert({
    auth_id: authUserId,   // FK to auth.users.id
    org_id: orgId,
    name: name.trim(),
    phone: phone.trim(),
    email: authUserEmail ?? null,
    role,
    is_active: true,
  })

  if (userError) {
    if (userError.code === '23505') return { error: 'phone_in_use' }
    console.error('[signup] user insert failed:', userError)
    return { error: 'unknown' }
  }

  return {}
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type') as 'email' | 'magiclink' | 'signup' | null

  const successUrl = new URL('/overview', request.url)

  function errorRedirect(reason: string) {
    return NextResponse.redirect(
      new URL(`/signup?error=${reason}`, request.url)
    )
  }

  function makeSupabase(response: NextResponse) {
    return createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => request.cookies.getAll(),
          setAll: (c) =>
            c.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            ),
        },
      }
    )
  }

  if (code) {
    const response = NextResponse.redirect(successUrl)
    const supabase = makeSupabase(response)
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error && data.user) {
      const { error: signupError } = await handleSignupMetadata(
        data.user.id,
        data.user.email,
        (data.user.user_metadata ?? {}) as Record<string, string>
      )
      if (signupError) return errorRedirect(signupError)
      return response
    }
  } else if (token_hash && type) {
    const response = NextResponse.redirect(successUrl)
    const supabase = makeSupabase(response)
    const { data, error } = await supabase.auth.verifyOtp({ type, token_hash })
    if (!error && data.user) {
      const { error: signupError } = await handleSignupMetadata(
        data.user.id,
        data.user.email,
        (data.user.user_metadata ?? {}) as Record<string, string>
      )
      if (signupError) return errorRedirect(signupError)
      return response
    }
  }

  return NextResponse.redirect(new URL('/login?error=invalid_link', request.url))
}
