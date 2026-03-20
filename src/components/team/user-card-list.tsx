'use client'

import { useState, useTransition, useCallback } from 'react'
import { fetchUserDetail, type UserDetail } from '@/app/actions/details'
import { UserDetailPanel } from '@/components/shared/user-detail-panel'
import { Phone, ChevronRight, Briefcase, ShieldCheck, Crown } from 'lucide-react'

type UserRole = 'architect' | 'director' | 'admin'

const roleConfig: Record<string, {
  label: string
  color: string
  bg: string
  accent: string
  Icon: React.ElementType
}> = {
  architect: { label: 'Arquiteto', color: '#B5614A', bg: 'rgba(181,97,74,0.09)', accent: '#B5614A', Icon: Briefcase },
  director:  { label: 'Diretor',   color: '#0066CC', bg: 'rgba(0,102,204,0.09)', accent: '#0066CC', Icon: Crown },
  admin:     { label: 'Admin',     color: '#6b7280', bg: 'rgba(107,114,128,0.09)', accent: '#9ca3af', Icon: ShieldCheck },
}

interface User {
  id: string
  name: string
  phone: string
  role: UserRole
  hourly_rate: number | null
  is_active: boolean
}

interface Props {
  users: User[]
}

function initials(name: string) {
  return name.split(' ').filter(Boolean).slice(0, 2).map((n) => n[0]).join('').toUpperCase()
}

const AVATAR_BG = ['#ede9fe', '#dbeafe', '#d1fae5', '#fed7aa', '#fce7f3', '#e0f2fe']
const AVATAR_FG = ['#5b21b6', '#1e40af', '#065f46', '#9a3412', '#9d174d', '#075985']

function avatarStyle(name: string) {
  let h = 0
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) & 0xffffffff
  const idx = Math.abs(h) % AVATAR_BG.length
  return { bg: AVATAR_BG[idx], fg: AVATAR_FG[idx] }
}

function formatPhone(phone: string) {
  const digits = phone.replace(/\D/g, '')
  if (digits.length === 13) return `+${digits.slice(0, 2)} (${digits.slice(2, 4)}) ${digits.slice(4, 9)}-${digits.slice(9)}`
  if (digits.length === 11) return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
  return phone
}

export function UserCardList({ users }: Props) {
  const [selectedUser, setSelectedUser] = useState<UserDetail | null>(null)
  const [isPending, startTransition] = useTransition()
  const [activeId, setActiveId] = useState<string | null>(null)

  const handleCardClick = useCallback((userId: string) => {
    setActiveId(userId)
    setSelectedUser(null)
    startTransition(async () => {
      const detail = await fetchUserDetail(userId)
      setSelectedUser(detail)
    })
  }, [])

  const handleClose = useCallback(() => {
    setSelectedUser(null)
    setActiveId(null)
  }, [])

  return (
    <>
      <div className="grid grid-cols-3 gap-3.5">
        {users.map((user) => {
          const role = roleConfig[user.role] ?? roleConfig.architect
          const RoleIcon = role.Icon
          const av = avatarStyle(user.name)
          const isActive = activeId === user.id

          return (
            <button
              key={user.id}
              onClick={() => handleCardClick(user.id)}
              className="glass glass-hover overflow-hidden text-left cursor-pointer transition-all hover:-translate-y-[2px] relative"
              style={isActive ? {
                border: `1px solid ${role.accent}`,
                boxShadow: `0 4px 16px rgba(0,0,0,0.10), 0 0 0 2px ${role.accent}20`,
              } : undefined}
            >
              {/* Role accent top bar */}
              <div className="h-[3px] w-full" style={{ background: role.accent }} />

              <div className="p-4 pt-3.5">
                {/* Avatar + Name + Role */}
                <div className="flex items-start gap-3 mb-3.5">
                  {/* Avatar */}
                  <div
                    className="w-11 h-11 rounded-xl shrink-0 flex items-center justify-center text-[15px] font-extrabold tracking-tight"
                    style={{ background: av.bg, color: av.fg }}
                  >
                    {initials(user.name)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-1.5 mb-1">
                      <h2 className="font-bold text-stone-900 text-sm overflow-hidden text-ellipsis whitespace-nowrap">
                        {user.name}
                      </h2>
                      <ChevronRight className="w-3.5 h-3.5 text-stone-300 shrink-0 mt-0.5" />
                    </div>

                    {/* Role badge */}
                    <div
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold"
                      style={{ background: role.bg, color: role.color }}
                    >
                      <RoleIcon className="w-[9px] h-[9px]" />
                      {role.label}
                    </div>
                  </div>
                </div>

                {/* Divider */}
                <div className="h-px bg-stone-300/15 mb-3" />

                {/* Phone */}
                <div className="flex items-center gap-1.5 mb-2.5">
                  <Phone className="w-3 h-3 text-stone-300 shrink-0" />
                  <span className="text-xs text-stone-400 font-mono tracking-[0.01em]">
                    {formatPhone(user.phone)}
                  </span>
                </div>

                {/* Rate + Status */}
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-semibold ${user.hourly_rate ? 'text-stone-900' : 'text-stone-300'}`}>
                    {user.hourly_rate
                      ? `R$ ${user.hourly_rate.toFixed(2).replace('.', ',')}/h`
                      : 'Sem valor/hora'}
                  </span>

                  {/* Status indicator */}
                  {user.is_active ? (
                    <div className="inline-flex items-center gap-1.5 px-2 py-[3px] rounded-full bg-green-50 border border-green-200 text-[11px] font-semibold text-green-700">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-600 shadow-[0_0_0_2px_rgba(22,163,74,0.20)]" />
                      Ativo
                    </div>
                  ) : (
                    <div className="inline-flex items-center gap-1.5 px-2 py-[3px] rounded-full bg-gray-50 border border-gray-200 text-[11px] font-semibold text-stone-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-stone-300" />
                      Inativo
                    </div>
                  )}
                </div>
              </div>
            </button>
          )
        })}

        {users.length === 0 && (
          <div className="col-span-full text-center text-stone-300 py-12 text-[13px]">
            Nenhum membro ativo.
          </div>
        )}
      </div>

      <UserDetailPanel user={selectedUser} loading={isPending} onClose={handleClose} />
    </>
  )
}
