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
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
        {users.map((user) => {
          const role = roleConfig[user.role] ?? roleConfig.architect
          const RoleIcon = role.Icon
          const av = avatarStyle(user.name)
          const isActive = activeId === user.id

          return (
            <button
              key={user.id}
              onClick={() => handleCardClick(user.id)}
              style={{
                background: '#ffffff',
                borderRadius: 12,
                padding: 0,
                textAlign: 'left',
                border: isActive
                  ? `1px solid ${role.accent}`
                  : '1px solid rgba(10,10,11,0.07)',
                boxShadow: isActive
                  ? `0 4px 16px rgba(0,0,0,0.10), 0 0 0 2px ${role.accent}20`
                  : '0 1px 4px rgba(0,0,0,0.06)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                overflow: 'hidden',
                position: 'relative',
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  const el = e.currentTarget as HTMLButtonElement
                  el.style.boxShadow = '0 6px 20px rgba(0,0,0,0.10), 0 0 0 1px rgba(0,0,0,0.06)'
                  el.style.transform = 'translateY(-2px)'
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  const el = e.currentTarget as HTMLButtonElement
                  el.style.boxShadow = '0 1px 4px rgba(0,0,0,0.06)'
                  el.style.transform = 'translateY(0)'
                }
              }}
            >
              {/* Role accent top bar */}
              <div style={{ height: 3, background: role.accent, width: '100%' }} />

              <div style={{ padding: '16px 18px 14px' }}>
                {/* Avatar + Name + Role */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 14 }}>
                  {/* Avatar */}
                  <div style={{
                    width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                    background: av.bg, color: av.fg,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 15, fontWeight: 800, letterSpacing: '-0.02em',
                  }}>
                    {initials(user.name)}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 6, marginBottom: 4 }}>
                      <h2 style={{
                        fontWeight: 700, color: '#0A0A0B', fontSize: 14,
                        margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>
                        {user.name}
                      </h2>
                      <ChevronRight style={{ width: 14, height: 14, color: 'rgba(10,10,11,0.25)', flexShrink: 0, marginTop: 2 }} />
                    </div>

                    {/* Role badge */}
                    <div style={{
                      display: 'inline-flex', alignItems: 'center', gap: 4,
                      padding: '2px 8px', borderRadius: 999,
                      background: role.bg, fontSize: 10, fontWeight: 700, color: role.color,
                    }}>
                      <RoleIcon style={{ width: 9, height: 9 }} />
                      {role.label}
                    </div>
                  </div>
                </div>

                {/* Divider */}
                <div style={{ height: 1, background: 'rgba(10,10,11,0.05)', marginBottom: 12 }} />

                {/* Phone */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                  <Phone style={{ width: 12, height: 12, color: 'rgba(10,10,11,0.30)', flexShrink: 0 }} />
                  <span style={{
                    fontSize: 12, color: 'rgba(10,10,11,0.50)',
                    fontFamily: 'ui-monospace, monospace', letterSpacing: '0.01em',
                  }}>
                    {formatPhone(user.phone)}
                  </span>
                </div>

                {/* Rate + Status */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{
                    fontSize: 12, fontWeight: 600,
                    color: user.hourly_rate ? '#0A0A0B' : 'rgba(10,10,11,0.30)',
                  }}>
                    {user.hourly_rate
                      ? `R$ ${user.hourly_rate.toFixed(2).replace('.', ',')}/h`
                      : 'Sem valor/hora'}
                  </span>

                  {/* Status indicator */}
                  <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: 5,
                    padding: '3px 8px', borderRadius: 999,
                    background: user.is_active ? '#f0fdf4' : '#f9fafb',
                    border: `1px solid ${user.is_active ? '#bbf7d0' : '#e5e7eb'}`,
                    fontSize: 11, fontWeight: 600,
                    color: user.is_active ? '#15803d' : 'rgba(10,10,11,0.38)',
                  }}>
                    <span style={{
                      width: 6, height: 6, borderRadius: '50%',
                      background: user.is_active ? '#16A34A' : 'rgba(10,10,11,0.20)',
                      boxShadow: user.is_active ? '0 0 0 2px rgba(22,163,74,0.20)' : 'none',
                    }} />
                    {user.is_active ? 'Ativo' : 'Inativo'}
                  </div>
                </div>
              </div>
            </button>
          )
        })}

        {users.length === 0 && (
          <div style={{
            gridColumn: '1/-1', textAlign: 'center',
            color: 'rgba(10,10,11,0.32)', padding: '48px 20px', fontSize: 13,
          }}>
            Nenhum membro ativo.
          </div>
        )}
      </div>

      <UserDetailPanel user={selectedUser} loading={isPending} onClose={handleClose} />
    </>
  )
}
