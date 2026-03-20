# Light Glass Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign ArchiTrack Dashboard with Light Glass theme (editorial stone + glassmorphism), migrating all inline styles to Tailwind CSS.

**Architecture:** Update design tokens in globals.css and tailwind.config.ts first, then rewrite each component from core outward (layout → pages → components). Each task produces a visually verifiable result. No tests exist in this project — verify with `npm run build` and visual inspection.

**Tech Stack:** Next.js 15, React 19, Tailwind CSS 3.4, Inter font (Google Fonts)

**Spec:** `docs/superpowers/specs/2026-03-20-light-glass-redesign-design.md`

---

### Task 1: Design Tokens — globals.css

**Files:**
- Modify: `src/app/globals.css`

- [ ] **Step 1: Replace CSS variables and add glass utilities**

Replace the entire contents of `src/app/globals.css` with:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 40 8% 91%;
    --foreground: 0 0% 11%;
    --card: 0 0% 100%;
    --card-foreground: 0 0% 11%;
    --popover: 0 0% 100%;
    --popover-foreground: 0 0% 11%;
    --primary: 16 40% 50%;
    --primary-foreground: 0 0% 100%;
    --secondary: 30 5% 80%;
    --secondary-foreground: 0 0% 20%;
    --muted: 30 5% 80%;
    --muted-foreground: 25 5% 47%;
    --accent: 30 5% 80%;
    --accent-foreground: 0 0% 20%;
    --destructive: 0 72% 51%;
    --destructive-foreground: 0 0% 100%;
    --border: 30 8% 66%;
    --input: 30 8% 66%;
    --ring: 16 40% 50%;
    --radius: 0.75rem;
  }
}

@layer base {
  * {
    @apply border-border;
    box-sizing: border-box;
  }
  body {
    background-color: #EAEAE5;
    color: #1C1C1C;
    font-feature-settings: 'cv11', 'ss01';
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
  table {
    border-collapse: collapse;
  }
}

@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

@layer utilities {
  /* ── Glass Surfaces ── */
  .glass {
    background: rgba(255,255,255,0.55);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border: 1px solid rgba(168,162,158,0.3);
    border-radius: 12px;
  }
  .glass-hover:hover {
    background: rgba(255,255,255,0.72);
    border-color: rgba(168,162,158,0.5);
  }
  .glass-dark {
    background: rgba(28,28,28,0.94);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border: 1px solid rgba(255,255,255,0.06);
  }
  .glass-modal {
    background: rgba(255,255,255,0.55);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border: 1px solid rgba(168,162,158,0.35);
    border-radius: 16px;
    box-shadow: 0 24px 64px rgba(0,0,0,0.12);
  }
  .glass-backdrop {
    background: rgba(234,234,229,0.7);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
  }
  .glass-input {
    background: rgba(255,255,255,0.4);
    border: 1px solid rgba(168,162,158,0.3);
    border-radius: 8px;
    transition: border-color 0.15s, box-shadow 0.15s;
  }
  .glass-input:focus {
    border-color: #78716c;
    box-shadow: 0 0 0 3px rgba(120,113,108,0.10);
    outline: none;
  }
  .glass-input-terra:focus {
    border-color: #B5614A;
    box-shadow: 0 0 0 3px rgba(181,97,74,0.10);
    outline: none;
  }
  .glass-row:hover {
    background: rgba(255,255,255,0.3);
  }

  /* ── Gradient Accents ── */
  .accent-terra { background: linear-gradient(90deg, #B5614A, transparent); }
  .accent-stone-500 { background: linear-gradient(90deg, #78716c, transparent); }
  .accent-stone-400 { background: linear-gradient(90deg, #a8a29e, transparent); }
  .gradient-divider {
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(168,162,158,0.3) 20%, rgba(168,162,158,0.3) 80%, transparent);
  }

  /* ── Typography ── */
  .text-page-title {
    font-size: 24px;
    font-weight: 600;
    letter-spacing: -0.03em;
    color: #1C1C1C;
  }
  .text-section-title {
    font-size: 14px;
    font-weight: 600;
    color: #1C1C1C;
  }
  .text-kpi {
    font-size: 32px;
    font-weight: 300;
    letter-spacing: -0.04em;
    line-height: 1;
    color: #1C1C1C;
    font-variant-numeric: tabular-nums;
  }
  .text-label {
    font-size: 9px;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #78716c;
  }
  .text-meta {
    font-size: 11px;
    font-weight: 500;
    color: #a8a29e;
  }

  /* ── Ink Scale ── */
  .ink { color: #1C1C1C; }
  .ink-60 { color: rgba(28,28,28,0.60); }
  .ink-40 { color: rgba(28,28,28,0.40); }
  .ink-24 { color: rgba(28,28,28,0.24); }

  /* ── Brand ── */
  .text-terra { color: #B5614A; }
  .bg-terra { background-color: #B5614A; }
  .bg-terra-subtle { background-color: rgba(181,97,74,0.10); }

  /* ── Skeleton ── */
  .skeleton {
    background: linear-gradient(90deg, #e4dfda 25%, #dbd5cf 50%, #e4dfda 75%);
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite;
    border-radius: 4px;
  }
}
```

- [ ] **Step 2: Verify build**

Run: `cd architrack-dashboard && npm run build`
Expected: Build succeeds (pages may look different due to new variables)

- [ ] **Step 3: Commit**

```bash
git add src/app/globals.css
git commit -m "style: replace design tokens with Light Glass theme utilities"
```

---

### Task 2: Tailwind Config + Font

**Files:**
- Modify: `tailwind.config.ts`
- Modify: `src/app/layout.tsx`

- [ ] **Step 1: Update tailwind.config.ts**

Replace the entire `theme.extend.colors` and add font config:

```typescript
import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        stone: {
          900: '#1C1C1C',
          500: '#78716c',
          400: '#a8a29e',
          300: '#d6d3d1',
          200: '#e7e5e4',
        },
        terra: {
          DEFAULT: '#B5614A',
          subtle: 'rgba(181,97,74,0.10)',
        },
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}

export default config
```

- [ ] **Step 2: Change font to Inter in layout.tsx**

Replace the entire `src/app/layout.tsx`:

```tsx
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-sans',
})

export const metadata: Metadata = {
  title: 'ArchiTrack — Gestão para escritórios de arquitetura',
  description: 'Dashboard de gestão operacional do ArchiTrack',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" className={inter.variable}>
      <body className="font-sans antialiased">
        {children}
      </body>
    </html>
  )
}
```

- [ ] **Step 3: Verify build**

Run: `cd architrack-dashboard && npm run build`
Expected: Build succeeds, Inter font is referenced

- [ ] **Step 4: Commit**

```bash
git add tailwind.config.ts src/app/layout.tsx
git commit -m "style: configure Inter font and updated Tailwind tokens"
```

---

### Task 3: Dashboard Layout + Sidebar

**Files:**
- Modify: `src/app/(dashboard)/layout.tsx`
- Modify: `src/components/layout/sidebar.tsx`

- [ ] **Step 1: Update dashboard layout**

Replace `src/app/(dashboard)/layout.tsx`:

```tsx
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Sidebar } from '@/components/layout/sidebar'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  return (
    <div className="flex h-screen bg-[#EAEAE5]">
      <Sidebar />
      <main className="flex-1 overflow-auto p-8">
        {children}
      </main>
    </div>
  )
}
```

- [ ] **Step 2: Rewrite sidebar with Tailwind + dark glass**

Replace `src/components/layout/sidebar.tsx`:

```tsx
'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard, FolderOpen, Users, Settings,
  LogOut, PenSquare,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const navItems = [
  { href: '/overview',  label: 'Painel',         icon: LayoutDashboard },
  { href: '/projects',  label: 'Projetos',        icon: FolderOpen },
  { href: '/team',      label: 'Equipe',          icon: Users },
  { href: '/settings',  label: 'Configurações',   icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <aside className="w-[220px] flex-shrink-0 flex flex-col glass-dark border-r border-white/[0.06]">
      {/* Logo */}
      <div className="h-[60px] flex items-center px-4 gap-2.5 shrink-0 border-b border-white/[0.06]">
        <div className="w-8 h-8 rounded-[9px] bg-terra flex items-center justify-center shrink-0 shadow-[0_2px_8px_rgba(181,97,74,0.4)]">
          <PenSquare className="w-4 h-4 text-white" />
        </div>
        <div>
          <div className="text-sm font-bold tracking-[-0.03em] text-[#f8fafc] leading-none">
            ArchiTrack
          </div>
          <div className="text-[8px] font-medium tracking-[0.10em] text-white/[0.25] mt-[3px] uppercase">
            Gestão de Escritório
          </div>
        </div>
      </div>

      {/* Nav section label */}
      <div className="px-4 pt-5 pb-2">
        <p className="text-[8px] font-bold tracking-[0.12em] uppercase text-white/[0.20]">
          Menu principal
        </p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 flex flex-col gap-0.5">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href as never}
              className={`flex items-center gap-2.5 h-[38px] px-2.5 rounded-lg text-[13px] transition-all border-l-2 ${
                isActive
                  ? 'bg-[rgba(181,97,74,0.18)] border-l-terra text-[#f8fafc] font-semibold'
                  : 'border-l-transparent text-white/[0.45] hover:bg-white/[0.06] hover:text-white/[0.75]'
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-terra' : 'opacity-70'}`} />
              {label}
              {isActive && (
                <span className="ml-auto w-[5px] h-[5px] rounded-full bg-terra shrink-0 shadow-[0_0_6px_rgba(181,97,74,0.6)]" />
              )}
            </Link>
          )
        })}
      </nav>

      {/* Bottom section */}
      <div className="px-2 py-3 border-t border-white/[0.06]">
        <button
          onClick={handleSignOut}
          className="flex items-center gap-2.5 w-full h-[38px] px-2.5 rounded-lg text-[13px] text-white/[0.35] bg-transparent border-none cursor-pointer transition-all hover:bg-red-500/10 hover:text-red-300"
        >
          <LogOut className="w-[15px] h-[15px] shrink-0" />
          Sair
        </button>
      </div>
    </aside>
  )
}
```

- [ ] **Step 3: Verify build**

Run: `cd architrack-dashboard && npm run build`
Expected: Build succeeds

- [ ] **Step 4: Commit**

```bash
git add src/app/\(dashboard\)/layout.tsx src/components/layout/sidebar.tsx
git commit -m "style: dark glass sidebar + updated dashboard layout"
```

---

### Task 4: Login + Auth Pages

**Files:**
- Modify: `src/app/login/page.tsx`
- Modify: `src/components/auth/login-form.tsx`
- Modify: `src/app/signup/page.tsx`
- Modify: `src/components/auth/signup-form.tsx`
- Modify: `src/app/reset-password/page.tsx`
- Modify: `src/app/update-password/page.tsx`

- [ ] **Step 1: Rewrite login page**

Replace `src/app/login/page.tsx`:

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
    <div className="min-h-screen flex items-center justify-center bg-[#EAEAE5] bg-[linear-gradient(rgba(168,162,158,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(168,162,158,0.08)_1px,transparent_1px)] bg-[length:40px_40px]">
      <div className="w-full max-w-[400px] px-5">
        <div className="text-center mb-8">
          <div className="w-11 h-11 rounded-[13px] bg-terra flex items-center justify-center mx-auto mb-3.5 shadow-[0_4px_14px_rgba(181,97,74,0.3)]">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 20h9"/>
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
            </svg>
          </div>
          <h1 className="text-[22px] font-bold tracking-[-0.04em] text-stone-900 leading-none">
            ArchiTrack
          </h1>
          <p className="text-[11px] font-medium tracking-[0.08em] uppercase text-stone-400 mt-1.5">
            Gestão de Escritório
          </p>
        </div>

        <Suspense fallback={null}>
          <LoginForm />
        </Suspense>

        {params.error === 'pending_confirmation' && (
          <p className="text-center text-xs text-red-600 mt-3">
            Sua conta ainda não foi confirmada. Verifique seu e-mail.
          </p>
        )}

        <p className="text-center mt-5 text-xs text-stone-400">
          Ainda não tem conta?{' '}
          <Link href="/signup" className="text-terra font-medium no-underline hover:underline">
            Criar conta
          </Link>
        </p>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Rewrite login form**

Replace `src/components/auth/login-form.tsx`:

```tsx
'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      if (error.message === 'Invalid login credentials') {
        setError('E-mail ou senha incorretos.')
      } else if (error.message === 'Email not confirmed') {
        setError('Confirme seu e-mail antes de entrar. Verifique sua caixa de entrada.')
      } else {
        setError('Erro ao entrar. Tente novamente.')
      }
    } else {
      router.push('/overview')
    }
    setLoading(false)
  }

  return (
    <div className="glass-modal p-7">
      <h2 className="text-base font-semibold text-stone-900 mb-1 tracking-[-0.02em]">
        Entrar
      </h2>
      <p className="text-[13px] text-stone-400 mb-6 leading-relaxed">
        Informe seu e-mail e senha para acessar.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label htmlFor="email" className="text-label block mb-1.5">E-mail</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="carlos@escritorio.com"
            required
            className="w-full px-3 py-2 text-[13px] text-stone-900 font-sans glass-input glass-input-terra"
          />
        </div>

        <div>
          <label htmlFor="password" className="text-label block mb-1.5">Senha</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            minLength={6}
            className="w-full px-3 py-2 text-[13px] text-stone-900 font-sans glass-input glass-input-terra"
          />
        </div>

        {error && <p className="text-xs text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 px-4 bg-stone-900 text-white rounded-lg text-[13px] font-medium tracking-[-0.01em] transition-colors hover:bg-[#292524] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Entrando...' : 'Entrar'}
        </button>

        <div className="text-center mt-1">
          <a href="/reset-password" className="text-xs text-terra font-medium no-underline hover:underline">
            Esqueci minha senha
          </a>
        </div>
      </form>
    </div>
  )
}
```

- [ ] **Step 3: Update signup page with same glass pattern**

Replace the wrapper div in `src/app/signup/page.tsx` — change `background: '#F4F2EF'` and inline styles to match login page pattern: `className="min-h-screen flex items-center justify-center bg-[#EAEAE5] bg-[linear-gradient(...)]"` with the same logo block using Tailwind. Keep `<SignupForm />` as-is for now.

- [ ] **Step 4: Update signup-form.tsx**

Replace all inline `style={{}}` objects with glass utility classes:
- Card wrapper: `className="glass-modal p-7"` replacing `style={{ background: '#fff', ... }}`
- Input fields: `className="w-full px-3 py-2 text-[13px] text-stone-900 font-sans glass-input glass-input-terra"` replacing `style={inputStyle}`
- Labels: `className="text-label block mb-1.5"` replacing `style={labelStyle}`
- Submit button: `className="w-full py-2.5 px-4 bg-stone-900 text-white rounded-lg text-[13px] font-medium ..."` replacing inline style
- Success state card: `className="glass-modal p-9 text-center"` replacing inline style
- Remove all `onFocus`/`onBlur` inline handlers (replaced by CSS `.glass-input-terra:focus`)
- Remove `onMouseEnter`/`onMouseLeave` handlers (replaced by CSS `hover:`)

- [ ] **Step 5: Update reset-password page**

Same pattern as login — replace all inline styles:
- Wrapper: `className="min-h-screen flex items-center justify-center bg-[#EAEAE5] bg-[linear-gradient(...)]"`
- Logo block: same Tailwind classes as login
- Form card: `className="glass-modal p-7"`
- Inputs: `className="w-full px-3 py-2 text-[13px] text-stone-900 font-sans glass-input glass-input-terra"`
- Labels: `className="text-label block mb-1.5"`
- Success card: `className="glass-modal p-9 text-center"`
- Button: `className="w-full py-2.5 px-4 bg-stone-900 text-white rounded-lg text-[13px] font-medium transition-colors hover:bg-[#292524] disabled:opacity-50"`
- Remove all `inputStyle` variable and inline focus/blur handlers

- [ ] **Step 6: Update update-password page**

Same pattern — replace inline styles with Tailwind glass classes. Remove `inputStyle`/`labelStyle` variables and inline event handlers.

- [ ] **Step 7: Verify build**

Run: `cd architrack-dashboard && npm run build`
Expected: Build succeeds

- [ ] **Step 8: Commit**

```bash
git add src/app/login/ src/app/signup/ src/app/reset-password/ src/app/update-password/ src/components/auth/
git commit -m "style: glass-modal auth pages with Inter + stone palette"
```

---

### Task 5: Overview Page + KPI Cards

**Files:**
- Modify: `src/app/(dashboard)/overview/page.tsx`
- Modify: `src/components/overview/kpi-cards.tsx`

- [ ] **Step 1: Update overview page header**

In `src/app/(dashboard)/overview/page.tsx`, replace all inline `style={{}}` on the page header and button with Tailwind classes:
- Container: `className="flex flex-col gap-5"`
- Header wrapper: `className="flex items-start justify-between"`
- H1: `className="text-page-title mb-1"`
- Date subtitle: `className="text-label"` (remove `textTransform: 'capitalize'` — label class handles it)
- Refresh button: `className="inline-flex items-center gap-1.5 px-3 py-[7px] rounded-lg cursor-pointer glass glass-hover text-xs font-medium text-stone-500 border-none"`

- [ ] **Step 2: Rewrite KPI cards**

Replace `src/components/overview/kpi-cards.tsx`:

```tsx
'use client'

import Link from 'next/link'

interface Props {
  totalHours: number
  activeProjects: number
  totalEntries: number
}

interface KpiCardProps {
  label: string
  value: string
  unit?: string
  subtext: string
  href?: string
  accentClass: string
}

function KpiCard({ label, value, unit, subtext, href, accentClass }: KpiCardProps) {
  const inner = (
    <div className="glass glass-hover relative overflow-hidden h-full p-[18px_20px] transition-all">
      <div className={`absolute top-0 left-0 right-0 h-[2px] ${accentClass}`} />
      <p className="text-label mb-2.5">{label}</p>
      <div className="flex items-baseline gap-1 mb-1">
        <span className="text-kpi">{value}</span>
        {unit && <span className="text-sm text-stone-400">{unit}</span>}
      </div>
      <p className="text-[10px] text-stone-400">{subtext}</p>
    </div>
  )

  if (href) {
    return (
      <Link href={href as never} className="block no-underline">
        {inner}
      </Link>
    )
  }
  return inner
}

export function KpiCards({ totalHours, activeProjects, totalEntries }: Props) {
  return (
    <div className="grid grid-cols-3 gap-3">
      <KpiCard
        label="Horas — 7 dias"
        value={String(totalHours)}
        unit="h"
        subtext="Total de horas registradas"
        accentClass="accent-terra"
      />
      <KpiCard
        label="Projetos ativos"
        value={String(activeProjects)}
        subtext="Clique para ver todos"
        href="/projects"
        accentClass="accent-stone-500"
      />
      <KpiCard
        label="Registros — 7 dias"
        value={String(totalEntries)}
        subtext="Via WhatsApp e dashboard"
        accentClass="accent-stone-400"
      />
    </div>
  )
}
```

- [ ] **Step 3: Verify build**

Run: `cd architrack-dashboard && npm run build`

- [ ] **Step 4: Commit**

```bash
git add src/app/\(dashboard\)/overview/page.tsx src/components/overview/kpi-cards.tsx
git commit -m "style: glass KPI cards + editorial page header"
```

---

### Task 6: Time Entries Table

**Files:**
- Modify: `src/components/overview/time-entries-table.tsx`

- [ ] **Step 1: Migrate table to glass + Tailwind**

Replace all inline `style={{}}` in the component:
- Outer wrapper: `className="glass overflow-hidden"`
- Header bar: `className="flex items-center justify-between px-[18px] py-3.5 border-b border-stone-300/20"`
- Title: `className="text-section-title"`
- Count: `className="text-label"`
- Table headers `<th>`: `className="text-label text-left px-4 py-2.5 whitespace-nowrap"`
- Table header row: `className="border-b border-stone-300/15 bg-white/[0.03]"`
- Data rows: `className="border-b border-stone-300/12 glass-row transition-colors cursor-default"` (or `cursor-pointer` when expandable)
- Last row: no `border-b`
- Avatar: keep inline style for dynamic colors (bg/fg computed at runtime)
- Project dot: keep inline for dynamic `background: projectColor(...)`
- Duration badge: `className="inline-block px-2 py-0.5 rounded-full bg-stone-300/15 text-xs font-semibold text-[#57534e]"`
- Source badges: use Tailwind for static colors (`className="inline-flex items-center gap-1 px-2 py-[3px] rounded-full text-[10px] font-semibold"` + specific `bg-green-600/[0.08] text-green-700` etc.)
- "When" column: `className="text-[10px] text-stone-400 whitespace-nowrap"`
- Expanded description: `className="text-xs text-stone-500 italic leading-relaxed p-2 px-3 bg-white/20 rounded-lg border-l-2 border-stone-300"`
- Footer: `className="flex items-center justify-between px-[18px] py-2.5 border-t border-stone-300/15 bg-white/[0.02]"`
- "Ver projetos" link: `className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-500 no-underline px-3 py-1.5 rounded-lg glass glass-hover"`
- Remove ALL `onMouseEnter`/`onMouseLeave` handlers — replaced by CSS `glass-row:hover` and `hover:` classes

- [ ] **Step 2: Verify build**

Run: `cd architrack-dashboard && npm run build`

- [ ] **Step 3: Commit**

```bash
git add src/components/overview/time-entries-table.tsx
git commit -m "style: glass time entries table with stone palette"
```

---

### Task 7: Overview Client (Donut Cards + Actions)

**Files:**
- Modify: `src/components/overview/overview-client.tsx`

- [ ] **Step 1: Migrate donut cards and actions**

Key changes:
- "Novo Lançamento" button: `className="inline-flex items-center gap-1.5 px-4 py-2 rounded-[9px] bg-stone-900 text-white text-[13px] font-semibold transition-colors hover:bg-[#292524] border-none cursor-pointer"`
- Section wrapper (projetos ativos): `className="glass p-5"` replacing white bg + shadow
- Section header icon box: `className="w-[30px] h-[30px] rounded-lg bg-terra-subtle flex items-center justify-center"`
- Section title: `className="text-section-title"`
- Donut grid: `className="grid grid-cols-[repeat(auto-fill,minmax(170px,1fr))] gap-3"`
- ProjectDonutCard: replace white bg + shadow with `className="glass glass-hover overflow-hidden cursor-pointer transition-all hover:-translate-y-[2px]"` and active state uses inline for dynamic project color border
- Donut SVG track: change `#f1f5f9` to `rgba(168,162,158,0.15)`
- Stats section in donut card: `className="flex flex-col gap-[5px] border-t border-stone-300/15 pt-2.5"`
- Remove ALL `onMouseEnter`/`onMouseLeave` handlers
- Empty state: `className="glass p-10 text-center"`

- [ ] **Step 2: Verify build**

Run: `cd architrack-dashboard && npm run build`

- [ ] **Step 3: Commit**

```bash
git add src/components/overview/overview-client.tsx
git commit -m "style: glass donut cards + editorial actions bar"
```

---

### Task 8: Projects Page + Table

**Files:**
- Modify: `src/app/(dashboard)/projects/page.tsx`
- Modify: `src/components/projects/projects-table.tsx`

- [ ] **Step 1: Update projects page header**

Replace inline styles:
- Container: `className="flex flex-col gap-5"`
- H1: `className="text-page-title"`
- Active badge: `className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-600/[0.08] text-green-700 text-[11px] font-bold"`
- Total badge: `className="text-[11px] font-semibold text-stone-400 px-[7px] py-0.5 bg-stone-300/15 rounded-full"`
- Subtitle: `className="text-xs text-stone-400"`

- [ ] **Step 2: Migrate projects table**

Same pattern as time-entries-table:
- Outer: `className="glass overflow-hidden"`
- Table headers: `className="text-label text-left px-4 py-2.5 whitespace-nowrap"`
- Rows: `className="border-b border-stone-300/12 glass-row transition-colors cursor-pointer"` + keep inline for dynamic `borderLeft` color
- Status badges: use Tailwind color classes
- Progress bar track: `className="w-full h-[5px] rounded bg-stone-300/15 overflow-hidden"`
- Remove ALL `onMouseEnter`/`onMouseLeave` handlers

- [ ] **Step 3: Verify build + Commit**

```bash
cd architrack-dashboard && npm run build
git add src/app/\(dashboard\)/projects/ src/components/projects/
git commit -m "style: glass projects page + table"
```

---

### Task 9: Team Page + User Cards

**Files:**
- Modify: `src/app/(dashboard)/team/page.tsx`
- Modify: `src/components/team/user-card-list.tsx`

- [ ] **Step 1: Update team page header**

Replace inline styles with same Tailwind pattern as projects page.

- [ ] **Step 2: Migrate user cards to glass**

Key changes:
- Card: `className="glass glass-hover overflow-hidden text-left cursor-pointer transition-all hover:-translate-y-[2px]"` replacing white bg + shadow
- Accent bar: keep inline for dynamic `background: role.accent`
- Avatar: keep inline for dynamic colors
- Role badge: keep inline for dynamic colors
- Remove `onMouseEnter`/`onMouseLeave` handlers
- Remove accent bar `<div>` inline style — use inline only for dynamic color

- [ ] **Step 3: Verify build + Commit**

```bash
cd architrack-dashboard && npm run build
git add src/app/\(dashboard\)/team/ src/components/team/
git commit -m "style: glass team page + user cards"
```

---

### Task 10: Shared Components (Detail Panel + New Entry Dialog)

**Files:**
- Modify: `src/components/shared/project-detail-panel.tsx`
- Modify: `src/components/shared/new-entry-dialog.tsx`

- [ ] **Step 1: Migrate project detail panel**

Key changes:
- Backdrop: `className="fixed inset-0 z-40 transition-opacity duration-300 glass-backdrop"` replacing inline style
- Panel: replace `background: '#fafafa'` with glass surface — `className="... bg-white/[0.55] backdrop-blur-[16px]"` and `style={{ width: 460 }}`
- Header dark section: `className="glass-dark"` with padding via Tailwind
- Stat cards: `className="glass"` replacing white bg
- Section backgrounds: replace `background: '#fff'` with `className="bg-white/[0.4] backdrop-blur-sm"`
- Close button: `className="w-7 h-7 rounded-full bg-white/[0.08] text-stone-400 flex items-center justify-center transition-colors hover:bg-white/[0.15] hover:text-white border-none cursor-pointer"`
- Action buttons: similar glass pattern
- Remove ALL inline `onMouseEnter`/`onMouseLeave` handlers
- Keep inline styles only for dynamic colors and computed values

- [ ] **Step 2: Migrate new entry dialog**

Key changes:
- Backdrop: `className="absolute inset-0 glass-backdrop"`
- Modal container: `className="relative glass-modal w-full max-w-[520px] mx-4 max-h-[90vh] flex flex-col overflow-hidden"`
- Header: replace bg white with transparent + gradient-divider below
- Inputs: `className="w-full px-3 py-2 text-[13px] text-stone-900 font-sans glass-input"`
- Labels: `className="block text-xs font-semibold text-stone-500 mb-1.5"`
- Cancel button: `className="px-[18px] py-[9px] rounded-[9px] glass glass-hover text-[13px] font-semibold text-stone-500 border-none cursor-pointer"`
- Submit button: `className="px-[22px] py-[9px] rounded-[9px] bg-stone-900 text-white text-[13px] font-semibold border-none cursor-pointer transition-colors hover:bg-[#292524] disabled:opacity-50 flex items-center gap-[7px]"`
- Remove `INPUT`/`LABEL` style constants
- Remove inline focus/blur handlers

- [ ] **Step 3: Verify build + Commit**

```bash
cd architrack-dashboard && npm run build
git add src/components/shared/
git commit -m "style: glass detail panel + modal dialog"
```

---

### Task 11: Settings Pages + Dialogs

**Files:**
- Modify: `src/app/(dashboard)/settings/page.tsx`
- Modify: `src/app/(dashboard)/settings/users/page.tsx`
- Modify: `src/app/(dashboard)/settings/projects/page.tsx`
- Modify: `src/components/settings/add-project-dialog.tsx`
- Modify: `src/components/settings/add-user-dialog.tsx`

- [ ] **Step 1: Update settings index page**

Replace existing Tailwind gray classes with stone/glass:
- H1: `className="text-page-title"`
- Link cards: `className="glass glass-hover p-5 group no-underline block"` replacing `bg-white rounded-lg border border-gray-200`
- Icon box: `className="bg-terra-subtle p-2 rounded-md"` replacing blue
- Icon: `className="w-5 h-5 text-terra"` replacing blue
- Label: `className="font-medium text-stone-900"`
- Description: `className="text-sm text-stone-400"`

- [ ] **Step 2: Update settings/users page**

- H1: `className="text-page-title"`
- Subtitle: `className="text-sm text-stone-400 mt-1"`
- Info box: `className="glass p-4 text-sm text-stone-500"` replacing blue bg

- [ ] **Step 3: Update settings/projects page**

- H1: `className="text-page-title"`
- Subtitle: `className="text-sm text-stone-400 mt-1"`

- [ ] **Step 4: Migrate add-project-dialog**

Replace `bg-white rounded-xl shadow-xl` with `glass-modal`:
- Trigger button: `className="inline-flex items-center gap-2 px-4 py-2 bg-stone-900 text-white text-sm font-medium rounded-lg hover:bg-[#292524] transition-colors"`
- Backdrop: `className="absolute inset-0 glass-backdrop"`
- Modal: `className="relative glass-modal p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto"`
- Title: `className="text-lg font-semibold text-stone-900 mb-1"`
- Subtitle: `className="text-sm text-stone-400 mb-5"`
- Labels: `className="block text-sm font-medium text-stone-500 mb-1"`
- Inputs: `className="w-full px-3 py-2 text-sm rounded-lg glass-input"` replacing gray borders
- Focus rings: remove `focus:ring-2 focus:ring-gray-900` → handled by `.glass-input:focus` CSS
- Error: `className="text-sm text-red-600 bg-red-500/[0.08] border border-red-200 rounded-lg px-3 py-2"`
- Cancel: `className="px-4 py-2 text-sm font-medium text-stone-500 hover:bg-stone-300/15 rounded-lg transition-colors disabled:opacity-50"`
- Submit: `className="px-4 py-2 text-sm font-medium text-white bg-stone-900 rounded-lg hover:bg-[#292524] transition-colors disabled:opacity-50"`

- [ ] **Step 5: Migrate add-user-dialog**

Same pattern as add-project-dialog.

- [ ] **Step 6: Verify build + Commit**

```bash
cd architrack-dashboard && npm run build
git add src/app/\(dashboard\)/settings/ src/components/settings/
git commit -m "style: glass settings pages + modal dialogs"
```

---

### Task 12: Final Verification

**Files:** None (verification only)

- [ ] **Step 1: Full build check**

Run: `cd architrack-dashboard && npm run build`
Expected: Zero errors

- [ ] **Step 2: Check for remaining inline styles**

Search for `style={{` across all tsx files. Only dynamic values (computed colors, widths) should remain. No hardcoded visual styles.

Run: `grep -rn 'style={{' src/ --include='*.tsx' | grep -v 'node_modules' | head -50`

Review each remaining instance — ensure it's a dynamic value that can't be a Tailwind class.

- [ ] **Step 3: Start dev server and visually inspect**

Run: `cd architrack-dashboard && npm run dev`

Check each page:
1. `/login` — glass modal, stone bg, Inter font
2. `/overview` — glass KPIs, glass table, dark glass sidebar
3. `/projects` — glass table, glass hover
4. `/team` — glass user cards
5. `/settings` — glass link cards
6. Any dialog/modal — glass-modal surface with backdrop blur

- [ ] **Step 4: Final commit if any fixes needed**

```bash
git add -A
git commit -m "style: final Light Glass redesign polish"
```
