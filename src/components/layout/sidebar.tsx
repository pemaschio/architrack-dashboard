'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, FolderOpen, Users, Settings, LogOut } from 'lucide-react'
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
        width: 200,
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        background: 'rgba(246,246,247,0.9)',
        borderRight: '1px solid rgba(10,10,11,0.08)',
      }}
    >
      {/* Logo mark */}
      <div
        style={{
          height: 52,
          display: 'flex',
          alignItems: 'center',
          paddingLeft: 16,
          paddingRight: 16,
          borderBottom: '1px solid rgba(10,10,11,0.06)',
          flexShrink: 0,
        }}
      >
        <div>
          <div
            style={{
              fontSize: 13,
              fontWeight: 600,
              letterSpacing: '-0.025em',
              color: '#B5614A',
              lineHeight: 1,
            }}
          >
            ArchiTrack
          </div>
          <div
            style={{
              fontSize: 9.5,
              fontWeight: 500,
              letterSpacing: '0.06em',
              color: 'rgba(10,10,11,0.32)',
              marginTop: 3,
              textTransform: 'uppercase',
            }}
          >
            Gestão de Escritório
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: 10 }}>
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
                height: 32,
                paddingLeft: isActive ? 8 : 10,
                paddingRight: 10,
                borderRadius: 5,
                marginBottom: 1,
                fontSize: 13,
                fontWeight: isActive ? 500 : 400,
                color: isActive ? '#0A0A0B' : 'rgba(10,10,11,0.52)',
                background: isActive ? 'rgba(181,97,74,0.07)' : 'transparent',
                borderLeft: isActive ? '2px solid #B5614A' : '2px solid transparent',
                textDecoration: 'none',
                transition: 'background 0.1s ease, color 0.1s ease',
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  const el = e.currentTarget as HTMLAnchorElement
                  el.style.background = 'rgba(10,10,11,0.035)'
                  el.style.color = '#0A0A0B'
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  const el = e.currentTarget as HTMLAnchorElement
                  el.style.background = 'transparent'
                  el.style.color = 'rgba(10,10,11,0.52)'
                }
              }}
            >
              <Icon
                style={{
                  width: 14,
                  height: 14,
                  flexShrink: 0,
                  opacity: isActive ? 0.85 : 0.45,
                }}
              />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Sign out */}
      <div style={{ padding: 10, borderTop: '1px solid rgba(10,10,11,0.06)' }}>
        <button
          onClick={handleSignOut}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 9,
            width: '100%',
            height: 32,
            paddingLeft: 10,
            paddingRight: 10,
            borderRadius: 5,
            fontSize: 13,
            fontWeight: 400,
            color: 'rgba(10,10,11,0.40)',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            transition: 'background 0.1s ease, color 0.1s ease',
          }}
          onMouseEnter={(e) => {
            const el = e.currentTarget as HTMLButtonElement
            el.style.background = 'rgba(10,10,11,0.035)'
            el.style.color = '#0A0A0B'
          }}
          onMouseLeave={(e) => {
            const el = e.currentTarget as HTMLButtonElement
            el.style.background = 'transparent'
            el.style.color = 'rgba(10,10,11,0.40)'
          }}
        >
          <LogOut style={{ width: 13, height: 13, flexShrink: 0, opacity: 0.5 }} />
          Sair
        </button>
      </div>
    </aside>
  )
}
