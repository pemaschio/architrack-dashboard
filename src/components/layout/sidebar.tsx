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
    <aside style={{
      width: 220, flexShrink: 0,
      display: 'flex', flexDirection: 'column',
      background: '#1a1714',
      borderRight: '1px solid rgba(255,255,255,0.06)',
    }}>
      {/* Logo */}
      <div style={{
        height: 60, display: 'flex', alignItems: 'center',
        padding: '0 16px', flexShrink: 0,
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        gap: 10,
      }}>
        <div style={{
          width: 32, height: 32, borderRadius: 9,
          background: '#B5614A',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          boxShadow: '0 2px 8px rgba(181,97,74,0.40)',
        }}>
          <PenSquare style={{ width: 16, height: 16, color: '#fff' }} />
        </div>

        <div>
          <div style={{
            fontSize: 14, fontWeight: 700, letterSpacing: '-0.03em',
            color: '#f8fafc', lineHeight: 1,
          }}>
            ArchiTrack
          </div>
          <div style={{
            fontSize: 9, fontWeight: 500, letterSpacing: '0.10em',
            color: 'rgba(255,255,255,0.30)', marginTop: 3, textTransform: 'uppercase',
          }}>
            Gestão de Escritório
          </div>
        </div>
      </div>

      {/* Nav section label */}
      <div style={{ padding: '20px 16px 8px' }}>
        <p style={{
          fontSize: 9, fontWeight: 700, letterSpacing: '0.12em',
          textTransform: 'uppercase', color: 'rgba(255,255,255,0.22)', margin: 0,
        }}>
          Menu principal
        </p>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '0 8px' }}>
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname.startsWith(href)
          return (
            <Link
              key={href}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              href={href as any}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                height: 38, paddingLeft: 10, paddingRight: 10,
                borderRadius: 8, marginBottom: 2, fontSize: 13, fontWeight: isActive ? 600 : 400,
                color: isActive ? '#f8fafc' : 'rgba(255,255,255,0.45)',
                background: isActive ? 'rgba(181,97,74,0.18)' : 'transparent',
                borderLeft: isActive ? '2px solid #B5614A' : '2px solid transparent',
                textDecoration: 'none', transition: 'all 0.15s ease', cursor: 'pointer',
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  const el = e.currentTarget as HTMLAnchorElement
                  el.style.background = 'rgba(255,255,255,0.06)'
                  el.style.color = 'rgba(255,255,255,0.75)'
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  const el = e.currentTarget as HTMLAnchorElement
                  el.style.background = 'transparent'
                  el.style.color = 'rgba(255,255,255,0.45)'
                }
              }}
            >
              <Icon style={{
                width: 16, height: 16, flexShrink: 0,
                color: isActive ? '#B5614A' : 'currentColor',
                opacity: isActive ? 1 : 0.7,
              }} />
              {label}

              {/* Active dot */}
              {isActive && (
                <span style={{
                  marginLeft: 'auto', width: 5, height: 5, borderRadius: '50%',
                  background: '#B5614A', flexShrink: 0,
                  boxShadow: '0 0 6px rgba(181,97,74,0.60)',
                }} />
              )}
            </Link>
          )
        })}
      </nav>

      {/* Bottom section */}
      <div style={{
        padding: '12px 8px 14px',
        borderTop: '1px solid rgba(255,255,255,0.06)',
      }}>
        <button
          onClick={handleSignOut}
          style={{
            display: 'flex', alignItems: 'center', gap: 10,
            width: '100%', height: 38, paddingLeft: 10, paddingRight: 10,
            borderRadius: 8, fontSize: 13, fontWeight: 400,
            color: 'rgba(255,255,255,0.35)',
            background: 'transparent', border: 'none', cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={(e) => {
            const el = e.currentTarget as HTMLButtonElement
            el.style.background = 'rgba(239,68,68,0.10)'
            el.style.color = '#fca5a5'
          }}
          onMouseLeave={(e) => {
            const el = e.currentTarget as HTMLButtonElement
            el.style.background = 'transparent'
            el.style.color = 'rgba(255,255,255,0.35)'
          }}
        >
          <LogOut style={{ width: 15, height: 15, flexShrink: 0 }} />
          Sair
        </button>
      </div>
    </aside>
  )
}
