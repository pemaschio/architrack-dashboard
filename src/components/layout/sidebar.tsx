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
