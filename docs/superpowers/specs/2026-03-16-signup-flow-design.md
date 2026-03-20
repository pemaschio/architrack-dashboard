# Signup Flow — Design Spec
**Date:** 2026-03-16
**Status:** Approved

---

## Problem

Users attempting self-registration had no signup page. The only flow was admin pre-creation via settings. This caused failures (like jose@stageaec.com.br hitting email rate limits then getting "approval pending" because no `public.users` record existed).

## Goal

Users can self-register on the landing page, receive a confirmation email, and gain immediate access after clicking the link — with no admin intervention required.

---

## Scope

- New `/signup` page with registration form
- Extended `/auth/confirm` route to create org + user records on confirmation
- Middleware update to handle authenticated users without a `public.users` record
- Link from login page to signup page
- UNIQUE constraint on `organizations.name` (new migration)

**Known gap (out of scope):** LGPD consent capture — to be addressed in a follow-up ticket.

---

## Section 1: Signup Page

### Route
`/signup` — public route (no auth required)

### Files
- `src/app/signup/page.tsx` — page layout
- `src/components/auth/signup-form.tsx` — form component

### Form Fields
| Field | Type | Validation |
|-------|------|------------|
| Nome completo | text | required, non-empty |
| Telefone WhatsApp | text | required, regex `/^55\d{10,11}$/` |
| Nome da organização | text | required, non-empty |
| Cargo | dropdown | required, options: `architect` (Arquiteto) / `director` (Gestor) — `admin` not available |
| E-mail | email | required, valid email |

### Behavior
1. On submit, calls:
   ```ts
   supabase.auth.signInWithOtp({
     email,
     options: {
       shouldCreateUser: true,
       emailRedirectTo: `${window.location.origin}/auth/confirm`,
       data: { name, phone, org_name, role }
     }
   })
   ```
   This sends a magic link and stores the form data as `user_metadata` for new users.
2. On success (no error returned), shows "Verifique seu e-mail" confirmation screen (same page, conditional render). Note: `signInWithOtp` does not error for existing emails — the user simply receives a magic link.
3. On Supabase error, shows inline error message.

### Login Page Change
Add link: `"Ainda não tem conta? Criar conta"` pointing to `/signup`.

---

## Section 2: Auth Confirm Route Extension

### File
`src/app/auth/confirm/route.ts` — extend existing handler

### Flow After Token Verification

The existing route handles both `token_hash` (OTP/magic link) and `code` (PKCE/OAuth) flows. The org/user creation logic must be added **to both branches**, immediately after a successful `verifyOtp` / `exchangeCodeForSession` call.

```
verifyOtp() OR exchangeCodeForSession() success
  → const user = session.user
  → const meta = user.user_metadata  // { name, phone, org_name, role }
  → if meta?.name && meta?.phone && meta?.org_name && meta?.role:
      // Validate required fields
      if !isValidPhone(meta.phone):
        redirect to /signup?error=invalid_phone

      // Check if public.users already exists (re-confirmation of same user)
      const existing = SELECT id FROM public.users WHERE id = user.id
      if existing: skip creation, redirect to /overview

      // Upsert organization (handle race condition + duplicates)
      const org = INSERT INTO organizations (name)
                  VALUES (meta.org_name)
                  ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
                  RETURNING id

      // Insert user — id MUST equal auth user id (user.id from session)
      INSERT INTO public.users (id, org_id, name, phone, role, is_active)
      VALUES (user.id, org.id, meta.name, meta.phone, meta.role, true)

      on duplicate phone error (23505 on phone):
        redirect to /signup?error=phone_in_use
      on other error:
        redirect to /signup?error=unknown
  → redirect to /overview
```

### Key Implementation Notes
- Uses **service role Supabase client** for inserts (bypasses RLS)
- `user.id` from the session is the `auth.users.id` — this MUST be used as `public.users.id`
- The metadata check (`if meta?.name && ...`) ensures the **existing login flow** (OTP for users already in `public.users`) is unaffected — they have no `name`/`phone` metadata and skip the creation block entirely
- `isValidPhone`: simple regex `^55\d{10,11}$`
- UNIQUE constraint on `organizations.name` must be added via migration (see Section 4)

---

## Section 3: Middleware Update

### File
`src/middleware.ts`

### Change
After confirming a valid session, query `public.users` for the user's `id` using the **anon client** (middleware runs on Edge runtime — no service role). The RLS policy for `public.users` must allow `SELECT WHERE id = auth.uid()` (confirm this exists in `002_rls.sql`; add if missing).

```ts
const { data: userRecord } = await supabase
  .from('users')
  .select('id')
  .eq('id', session.user.id)
  .single()

if (!userRecord) {
  // Sign out to prevent infinite redirect loop, then redirect to login
  await supabase.auth.signOut()
  return NextResponse.redirect(new URL('/login?error=pending_confirmation', req.url))
}
```

**Critical:** Sign the user out before redirecting. Without this, the user has a valid session, gets sent to `/login`, the middleware detects the session and redirects back to `/overview`, which re-triggers the check → infinite loop.

### Public Routes (no auth check, no user record check)
`/login`, `/signup`, `/auth/confirm`

---

## Section 4: Database Migration

New migration file: `architrack-supabase/migrations/005_unique_org_name.sql`

```sql
ALTER TABLE organizations ADD CONSTRAINT organizations_name_unique UNIQUE (name);
```

Also verify `002_rls.sql` has a SELECT policy for users reading their own record:
```sql
-- Must exist (add if missing):
CREATE POLICY "users_select_own" ON public.users
  FOR SELECT USING (auth.uid() = id);
```

---

## Error States

| Scenario | Behavior |
|----------|----------|
| Phone already in use | Redirect to `/signup?error=phone_in_use` → show "Telefone já cadastrado" |
| Invalid phone format (server-side) | Redirect to `/signup?error=invalid_phone` → show "Formato de telefone inválido" |
| Email already registered | `signInWithOtp` sends magic link silently — user receives link and proceeds normally |
| User already in `public.users` (re-confirmation) | Skip creation, redirect to `/overview` |
| Unknown error on user creation | Redirect to `/signup?error=unknown` → show generic message |
| Session exists but no `public.users` | Sign out, redirect to `/login?error=pending_confirmation` |

---

## Out of Scope

- Admin approval workflow
- Email/password auth (stays OTP magic link)
- Organization management UI
- Invite-only signup
- LGPD consent capture (follow-up ticket)
