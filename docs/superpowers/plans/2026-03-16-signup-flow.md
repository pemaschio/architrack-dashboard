# Signup Flow Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Users can self-register on `/signup` with name, phone, organization (text), and role (architect/director), receive a magic link, and gain immediate dashboard access after confirmation.

**Architecture:** `signInWithOtp` passes form data as `user_metadata`. `/auth/confirm` detects new users (no `public.users` record for their `auth_id`), creates the organization if needed, and inserts the user record with `is_active: true`. Middleware guards dashboard routes and signs out orphaned sessions.

**Tech Stack:** Next.js 15 App Router, Supabase Auth (magic link/OTP), `@supabase/ssr`, inline styles (no Tailwind — matching existing codebase), `createAdminClient` (service role) for DB writes in route handlers.

> **Schema note:** `public.users.id` is its own `gen_random_uuid()` PK. The FK to `auth.users` is the separate `auth_id UUID` column (added in `006_multitenant_auth.sql`). All queries linking auth sessions to user records must use `.eq('auth_id', user.id)` — NOT `.eq('id', user.id)`.

---

## Chunk 1: Database Migration

### Task 1: Add UNIQUE constraint + upsert function + RLS SELECT policy

**Files:**
- Create: `architrack-supabase/migrations/007_signup_flow.sql`

> **Note:** Existing migrations go up to `006_multitenant_auth.sql` — use `007`. The spec mentioned `005_unique_org_name.sql` which is outdated (conflicts with existing `005_mock_data.sql`).

- [ ] **Step 1: Create migration file**

```sql
-- migrations/007_signup_flow.sql
-- Habilita auto-cadastro de usuários via página de signup.
--
-- O que muda:
-- 1. UNIQUE constraint em organizations.name (evita duplicatas em cadastros simultâneos)
-- 2. Função upsert_org_by_name para INSERT ... ON CONFLICT garantindo RETURNING id
-- 3. RLS SELECT policy para usuário ler seu próprio registro (necessário no middleware)

-- ============================================================
-- 1. UNIQUE constraint em organizations.name
-- ============================================================
ALTER TABLE organizations
  ADD CONSTRAINT organizations_name_unique UNIQUE (name);

-- ============================================================
-- 2. Função upsert_org_by_name
-- ============================================================
CREATE OR REPLACE FUNCTION upsert_org_by_name(p_name TEXT)
RETURNS TABLE(id UUID) AS $$
  INSERT INTO organizations (name)
  VALUES (p_name)
  ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
  RETURNING organizations.id;
$$ LANGUAGE sql SECURITY DEFINER;

-- ============================================================
-- 3. RLS: usuário pode ler seu próprio registro em users
--    (necessário para o middleware verificar auth_id = auth.uid())
-- ============================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'users'
      AND policyname = 'users_select_own'
  ) THEN
    EXECUTE $policy$
      CREATE POLICY "users_select_own" ON public.users
        FOR SELECT
        USING (auth_id = auth.uid())
    $policy$;
  END IF;
END$$;
```

- [ ] **Step 2: Apply migration to Supabase**

Apply via Supabase MCP (`apply_migration`) or paste into Supabase SQL Editor → Run.

Expected: No errors.

- [ ] **Step 3: Verify**

```sql
-- Confirm unique constraint
SELECT constraint_name FROM information_schema.table_constraints
WHERE table_name = 'organizations' AND constraint_type = 'UNIQUE';
-- Expected: organizations_name_unique

-- Confirm function exists
SELECT proname FROM pg_proc WHERE proname = 'upsert_org_by_name';

-- Confirm RLS policy exists
SELECT policyname FROM pg_policies WHERE tablename = 'users';
-- Expected: includes 'users_select_own'
```

---

## Chunk 2: Signup Form Component

### Task 2: Create `signup-form.tsx`

**Files:**
- Create: `src/components/auth/signup-form.tsx`

**Context:**
- Client component (`'use client'`)
- Uses `createClient` from `@/lib/supabase/client`
- Uses `useSearchParams()` to display server-side errors redirected from `/auth/confirm` (e.g. `?error=phone_in_use`)
- `useSearchParams()` requires this component to be wrapped in `<Suspense>` on the page
- Phone validation: regex `/^55\d{10,11}$/`
- Role options: `architect` (Arquiteto) / `director` (Gestor) — no `admin`
- Inline styles only — same tokens as `login-form.tsx`: `#B5614A`, `#0A0A0B`, `#FAFAFA`

- [ ] **Step 1: Create the component**

```tsx
'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { MailCheck } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const PHONE_REGEX = /^55\d{10,11}$/

const URL_ERRORS: Record<string, string> = {
  phone_in_use: 'Este telefone já está cadastrado. Use outro número.',
  invalid_phone: 'Formato de telefone inválido. Use: 5511999999999',
  unknown: 'Erro ao criar conta. Tente novamente.',
}

export function SignupForm() {
  const searchParams = useSearchParams()
  const urlError = searchParams.get('error')

  const [form, setForm] = useState({
    name: '',
    phone: '',
    org_name: '',
    role: 'architect' as 'architect' | 'director',
    email: '',
  })
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(
    urlError ? (URL_ERRORS[urlError] ?? URL_ERRORS.unknown) : null
  )
  const supabase = createClient()

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    const phone = form.phone.replace(/\D/g, '')
    if (!PHONE_REGEX.test(phone)) {
      setError('Telefone inválido. Use o formato: 5511999999999')
      return
    }

    setLoading(true)
    const { error: otpError } = await supabase.auth.signInWithOtp({
      email: form.email.trim(),
      options: {
        shouldCreateUser: true,
        emailRedirectTo: `${window.location.origin}/auth/confirm`,
        data: {
          name: form.name.trim(),
          phone,
          org_name: form.org_name.trim(),
          role: form.role,
        },
      },
    })

    if (otpError) {
      setError('Erro ao criar conta. Tente novamente.')
    } else {
      setSent(true)
    }
    setLoading(false)
  }

  if (sent) {
    return (
      <div
        style={{
          background: '#fff',
          borderRadius: 12,
          boxShadow: '0 1px 3px rgba(0,0,0,0.07), 0 0 0 1px rgba(0,0,0,0.04)',
          padding: '36px 28px',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: 14,
            background: 'rgba(181,97,74,0.10)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
          }}
        >
          <MailCheck style={{ width: 22, height: 22, color: '#B5614A' }} />
        </div>
        <h2
          style={{
            fontSize: 15,
            fontWeight: 600,
            color: '#0A0A0B',
            marginBottom: 8,
            letterSpacing: '-0.015em',
          }}
        >
          Verifique seu e-mail!
        </h2>
        <p
          style={{
            fontSize: 13,
            color: 'rgba(10,10,11,0.50)',
            lineHeight: 1.65,
            margin: 0,
          }}
        >
          Enviamos um link de acesso para{' '}
          <strong style={{ color: '#0A0A0B', fontWeight: 500 }}>
            {form.email}
          </strong>
          . Clique no link para entrar.
        </p>
        <button
          onClick={() => {
            setSent(false)
            setError(null)
          }}
          style={{
            marginTop: 20,
            fontSize: 12,
            color: '#B5614A',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontFamily: 'inherit',
            fontWeight: 500,
            letterSpacing: '0.01em',
          }}
        >
          Usar outro e-mail
        </button>
      </div>
    )
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '9px 12px',
    border: '1px solid rgba(10,10,11,0.14)',
    borderRadius: 6,
    fontSize: 13,
    color: '#0A0A0B',
    outline: 'none',
    fontFamily: 'inherit',
    background: '#FAFAFA',
    transition: 'border-color 0.15s ease',
    boxSizing: 'border-box',
  }

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: 11,
    fontWeight: 500,
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
    color: 'rgba(10,10,11,0.40)',
    marginBottom: 6,
  }

  function onFocus(
    e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    e.currentTarget.style.borderColor = '#B5614A'
    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(181,97,74,0.10)'
  }
  function onBlur(
    e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    e.currentTarget.style.borderColor = 'rgba(10,10,11,0.14)'
    e.currentTarget.style.boxShadow = 'none'
  }

  return (
    <div
      style={{
        background: '#fff',
        borderRadius: 12,
        boxShadow: '0 1px 3px rgba(0,0,0,0.07), 0 0 0 1px rgba(0,0,0,0.04)',
        padding: '32px 28px',
      }}
    >
      <h2
        style={{
          fontSize: 16,
          fontWeight: 600,
          color: '#0A0A0B',
          marginBottom: 4,
          letterSpacing: '-0.02em',
        }}
      >
        Criar conta
      </h2>
      <p
        style={{
          fontSize: 13,
          color: 'rgba(10,10,11,0.45)',
          marginBottom: 24,
          lineHeight: 1.5,
        }}
      >
        Preencha os dados para criar seu acesso ao ArchiTrack.
      </p>

      <form
        onSubmit={handleSubmit}
        style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
      >
        <div>
          <label htmlFor="name" style={labelStyle}>
            Nome completo
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            value={form.name}
            onChange={handleChange}
            placeholder="Ana Silva"
            style={inputStyle}
            onFocus={onFocus}
            onBlur={onBlur}
          />
        </div>

        <div>
          <label htmlFor="email" style={labelStyle}>
            E-mail
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            value={form.email}
            onChange={handleChange}
            placeholder="ana@escritorio.com"
            style={inputStyle}
            onFocus={onFocus}
            onBlur={onBlur}
          />
        </div>

        <div>
          <label htmlFor="phone" style={labelStyle}>
            Telefone WhatsApp
          </label>
          <input
            id="phone"
            name="phone"
            type="text"
            required
            value={form.phone}
            onChange={handleChange}
            placeholder="5511999999999"
            style={inputStyle}
            onFocus={onFocus}
            onBlur={onBlur}
          />
          <p
            style={{
              fontSize: 11,
              color: 'rgba(10,10,11,0.35)',
              marginTop: 4,
            }}
          >
            Código do país + DDD + número (ex: 5511999999999)
          </p>
        </div>

        <div>
          <label htmlFor="org_name" style={labelStyle}>
            Nome do escritório / organização
          </label>
          <input
            id="org_name"
            name="org_name"
            type="text"
            required
            value={form.org_name}
            onChange={handleChange}
            placeholder="Zé Arquitetos"
            style={inputStyle}
            onFocus={onFocus}
            onBlur={onBlur}
          />
        </div>

        <div>
          <label htmlFor="role" style={labelStyle}>
            Cargo
          </label>
          <select
            id="role"
            name="role"
            required
            value={form.role}
            onChange={handleChange}
            style={{ ...inputStyle, cursor: 'pointer' }}
            onFocus={onFocus}
            onBlur={onBlur}
          >
            <option value="architect">Arquiteto</option>
            <option value="director">Gestor</option>
          </select>
        </div>

        {error && (
          <p style={{ fontSize: 12, color: '#DC2626' }}>{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '10px 16px',
            background: loading ? 'rgba(181,97,74,0.55)' : '#B5614A',
            color: '#fff',
            border: 'none',
            borderRadius: 6,
            fontSize: 13,
            fontWeight: 500,
            cursor: loading ? 'not-allowed' : 'pointer',
            fontFamily: 'inherit',
            letterSpacing: '-0.01em',
            transition: 'background 0.15s ease',
          }}
          onMouseEnter={(e) => {
            if (!loading)
              (e.currentTarget as HTMLButtonElement).style.background =
                '#A0503A'
          }}
          onMouseLeave={(e) => {
            if (!loading)
              (e.currentTarget as HTMLButtonElement).style.background =
                '#B5614A'
          }}
        >
          {loading ? 'Criando conta...' : 'Criar conta'}
        </button>
      </form>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/auth/signup-form.tsx
git commit -m "feat: add SignupForm component"
```

---

### Task 3: Create signup page

**Files:**
- Create: `src/app/signup/page.tsx`

**Context:**
- Mirror layout of `src/app/login/page.tsx` exactly
- `SignupForm` uses `useSearchParams()` → must be wrapped in `<Suspense>`

- [ ] **Step 1: Create the page**

```tsx
import { Suspense } from 'react'
import Link from 'next/link'
import { SignupForm } from '@/components/auth/signup-form'

export default function SignupPage() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#F4F2EF',
        backgroundImage: `
          linear-gradient(rgba(181,97,74,0.04) 1px, transparent 1px),
          linear-gradient(90deg, rgba(181,97,74,0.04) 1px, transparent 1px)
        `,
        backgroundSize: '40px 40px',
      }}
    >
      <div style={{ width: '100%', maxWidth: 400, padding: '0 20px' }}>
        {/* Brand mark */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 13,
              background: '#B5614A',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 14px',
              boxShadow: '0 4px 14px rgba(181,97,74,0.30)',
            }}
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 20h9" />
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
            </svg>
          </div>
          <h1
            style={{
              fontSize: 22,
              fontWeight: 700,
              letterSpacing: '-0.04em',
              color: '#1A1714',
              lineHeight: 1,
              margin: 0,
            }}
          >
            ArchiTrack
          </h1>
          <p
            style={{
              fontSize: 11,
              fontWeight: 500,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: 'rgba(10,10,11,0.34)',
              marginTop: 6,
            }}
          >
            Gestão de Escritório
          </p>
        </div>

        <Suspense fallback={null}>
          <SignupForm />
        </Suspense>

        <p
          style={{
            textAlign: 'center',
            marginTop: 20,
            fontSize: 12,
            color: 'rgba(10,10,11,0.40)',
          }}
        >
          Já tem conta?{' '}
          <Link
            href="/login"
            style={{ color: '#B5614A', fontWeight: 500, textDecoration: 'none' }}
          >
            Entrar
          </Link>
        </p>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/signup/page.tsx
git commit -m "feat: add /signup page"
```

---

### Task 4: Add signup link + error message to login page

**Files:**
- Modify: `src/app/login/page.tsx`

**Context:**
- Add `Link` import
- Login page is a Server Component in Next.js 15: `searchParams` is `Promise<{error?: string}>` and must be `await`-ed
- Show error message for `?error=pending_confirmation`
- Replace "Acesso exclusivo para colaboradores" footer with signup link

- [ ] **Step 1: Update `login/page.tsx`**

```tsx
import { Suspense } from 'react'
import Link from 'next/link'
import { LoginForm } from '@/components/auth/login-form'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const params = await searchParams

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#F4F2EF',
        backgroundImage: `
          linear-gradient(rgba(181,97,74,0.04) 1px, transparent 1px),
          linear-gradient(90deg, rgba(181,97,74,0.04) 1px, transparent 1px)
        `,
        backgroundSize: '40px 40px',
      }}
    >
      <div style={{ width: '100%', maxWidth: 400, padding: '0 20px' }}>
        {/* Brand mark */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 13,
              background: '#B5614A',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 14px',
              boxShadow: '0 4px 14px rgba(181,97,74,0.30)',
            }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 20h9"/>
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
            </svg>
          </div>
          <h1
            style={{
              fontSize: 22,
              fontWeight: 700,
              letterSpacing: '-0.04em',
              color: '#1A1714',
              lineHeight: 1,
              margin: 0,
            }}
          >
            ArchiTrack
          </h1>
          <p
            style={{
              fontSize: 11,
              fontWeight: 500,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: 'rgba(10,10,11,0.34)',
              marginTop: 6,
            }}
          >
            Gestão de Escritório
          </p>
        </div>

        <Suspense fallback={null}>
          <LoginForm />
        </Suspense>

        {params.error === 'pending_confirmation' && (
          <p style={{ textAlign: 'center', fontSize: 12, color: '#DC2626', marginTop: 12 }}>
            Sua conta ainda não foi confirmada. Verifique seu e-mail.
          </p>
        )}

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 12, color: 'rgba(10,10,11,0.40)' }}>
          Ainda não tem conta?{' '}
          <Link href="/signup" style={{ color: '#B5614A', fontWeight: 500, textDecoration: 'none' }}>
            Criar conta
          </Link>
        </p>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/login/page.tsx
git commit -m "feat: add signup link and error message to login page"
```

---

## Chunk 3: Auth Confirm Route + Middleware

### Task 5: Extend `/auth/confirm` to create user on self-signup

**Files:**
- Modify: `src/app/auth/confirm/route.ts`

**Context:**
- `public.users.id` is its own UUID (`gen_random_uuid()`). The auth link is `auth_id UUID` (FK to `auth.users.id`). Always use `auth_id: user.id` in inserts — never `id: user.id`.
- Self-signup metadata: `{ name, phone, org_name, role }` → `org_name` present
- Invited users: metadata `{ name, org_id, role }` → `org_id` present, `public.users` record already exists
- Check existing record via `.eq('auth_id', authUserId)` — if found, skip all creation
- Use `admin.rpc('upsert_org_by_name', { p_name })` to upsert org; returns `[{ id: uuid }]`
- Both `code` and `token_hash` branches need the metadata handler
- `createAdminClient()` is available in route handlers (Node.js runtime)

- [ ] **Step 1: Rewrite the route**

```ts
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
  const type = searchParams.get('type') as 'email' | 'magiclink' | null

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
```

- [ ] **Step 2: Commit**

```bash
git add src/app/auth/confirm/route.ts
git commit -m "feat: create org + user in auth/confirm for self-signup"
```

---

### Task 6: Update middleware

**Files:**
- Modify: `src/middleware.ts`

**Context:**
- Add `/signup` to public routes
- For authenticated users on dashboard routes: query `public.users WHERE auth_id = user.id` (NOT `WHERE id = user.id` — `id` is the table's own PK)
- `users_select_own` policy (Task 1) allows anon client with valid session to read own record via `auth_id = auth.uid()`
- Sign out BEFORE redirecting to clear session cookie → prevents infinite redirect loop

- [ ] **Step 1: Update middleware**

```ts
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
    pathname.startsWith('/login') || pathname.startsWith('/signup')
  const isDashboardRoute =
    pathname.startsWith('/overview') ||
    pathname.startsWith('/projects') ||
    pathname.startsWith('/settings') ||
    pathname.startsWith('/team')

  // Unauthenticated user trying to access dashboard → login
  if (!user && isDashboardRoute) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Authenticated user on auth route → dashboard
  if (user && isAuthRoute) {
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
```

- [ ] **Step 2: Commit**

```bash
git add src/middleware.ts
git commit -m "feat: guard orphaned sessions in middleware"
```

---

## Chunk 4: End-to-End Verification

### Task 7: Manual E2E test

- [ ] **Step 1: Run the development server**

```bash
cd architrack-dashboard
npm run dev
```

- [ ] **Step 2: Test self-signup flow**

1. Open `http://localhost:3000/login` — confirm "Criar conta" link is visible
2. Click "Criar conta" → `/signup` page opens with form
3. Fill all fields: Nome, E-mail (use a real inbox), Telefone = `5511900000001`, Organização = `Org Teste XYZ`, Cargo = Arquiteto
4. Submit → "Verifique seu e-mail" screen appears
5. Click link in email → redirected to `/overview`
6. Expected: logged in, dashboard visible

- [ ] **Step 3: Verify DB records were created**

```sql
SELECT id, name FROM organizations WHERE name = 'Org Teste XYZ';

SELECT auth_id, org_id, name, phone, role, is_active
FROM users
WHERE name = 'Teste ArchiTrack';
-- Expected: is_active = true, auth_id = <non-null uuid>
```

- [ ] **Step 4: Test duplicate phone error**

Repeat signup with same phone number, different email.
Expected: redirect to `/signup?error=phone_in_use` with "Este telefone já está cadastrado" message visible in form.

- [ ] **Step 5: Regression — existing user login**

Existing user (e.g. `jose@stageaec.com.br`) uses `/login` → receives magic link → clicks → reaches `/overview` without errors.
Expected: no new DB records created (metadata has no `org_name`, so `handleSignupMetadata` returns `{}` immediately).

- [ ] **Step 6: Deploy to Vercel**

```bash
git push origin main
```

Verify Vercel build passes and prod URL works end-to-end.
