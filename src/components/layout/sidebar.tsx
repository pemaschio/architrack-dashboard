'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, FolderOpen, Users, Settings, LogOut, PenSquare } from 'lucide-react'
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
    <aside
      style={{
        width: 220,
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        background: '#EFEDE9',
        borderRight: '1px solid rgba(10,10,11,0.07)',
      }}
    >
      {/* Logo mark */}
      <div
        style={{
          height: 60,
          display: 'flex',
          alignItems: 'center',
          paddingLeft: 18,
          paddingRight: 18,
          borderBottom: '1px solid rgba(10,10,11,0.06)',
          flexShrink: 0,
          gap: 10,
        }}
      >
        {/* Brand icon */}
        <div
          style={{
            width: 30,
            height: 30,
            borderRadius: 8,
            background: '#B5614A',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <PenSquare style={{ width: 15, height: 15, color: '#fff' }} />
        </div>

        <div>
          <div
            style={{
              fontSize: 13,
              fontWeight: 600,
              letterSpacing: '-0.03em',
              color: '#1A1714',
              lineHeight: 1,
            }}
          >
            ArchiTrack
          </div>
          <div
            style={{
              fontSize: 9,
              fontWeight: 500,
              letterSpacing: '0.08em',
              color: 'rgba(10,10,11,0.36)',
              marginTop: 3,
              textTransform: 'uppercase',
            }}
          >
            Gestão de Escritório
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '12px 10px' }}>
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname.startsWith(href)
          return (
            <Link
              key={href}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              href={href as any}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 9,
                height: 34,
                paddingLeft: 10,
                paddingRight: 10,
                borderRadius: 7,
                marginBottom: 2,
                fontSize: 13,
                fontWeight: isActive ? 500 : 400,
                color: isActive ? '#1A1714' : 'rgba(10,10,11,0.48)',
                background: isActive ? 'rgba(181,97,74,0.10)' : 'transparent',
                borderLeft: isActive ? '2px solid #B5614A' : '2px solid transparent',
                textDecoration: 'none',
                transition: 'background 0.15s ease, color 0.15s ease',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  const el = e.currentTarget as HTMLAnchorElement
                  el.style.background = 'rgba(10,10,11,0.05)'
                  el.style.color = '#1A1714'
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  const el = e.currentTarget as HTMLAnchorElement
                  el.style.background = 'transparent'
                  el.style.color = 'rgba(10,10,11,0.48)'
                }
              }}
            >
              <Icon
                style={{
                  width: 15,
                  height: 15,
                  flexShrink: 0,
                  color: isActive ? '#B5614A' : 'currentColor',
                  opacity: isActive ? 1 : 0.5,
                  transition: 'opacity 0.15s ease',
                }}
              />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Sign out */}
      <div style={{ padding: '10px 10px 14px', borderTop: '1px solid rgba(10,10,11,0.06)' }}>
        <button
          onClick={handleSignOut}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 9,
            width: '100%',
            height: 34,
            paddingLeft: 10,
            paddingRight: 10,
            borderRadius: 7,
            fontSize: 13,
            fontWeight: 400,
            color: 'rgba(10,10,11,0.38)',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            transition: 'background 0.15s ease, color 0.15s ease',
          }}
          onMouseEnter={(e) => {
            const el = e.currentTarget as HTMLButtonElement
            el.style.background = 'rgba(10,10,11,0.05)'
            el.style.color = '#1A1714'
          }}
          onMouseLeave={(e) => {
            const el = e.currentTarget as HTMLButtonElement
            el.style.background = 'transparent'
            el.style.color = 'rgba(10,10,11,0.38)'
          }}
        >
          <LogOut style={{ width: 14, height: 14, flexShrink: 0 }} />
          Sair
        </button>
      </div>
    </aside>
  )
}
