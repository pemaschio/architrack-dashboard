'use client'

import { useState, useTransition, useCallback } from 'react'
import { fetchUserDetail, type UserDetail } from '@/app/actions/details'
import { UserDetailPanel } from '@/components/shared/user-detail-panel'

type UserRole = 'architect' | 'director' | 'admin'

const roleLabels: Record<string, string> = {
  architect: 'Arquiteto',
  director: 'Diretor',
  admin: 'Admin',
}

const roleStyles: Record<string, { background: string; color: string }> = {
  architect: { background: 'rgba(181,97,74,0.08)', color: '#B5614A' },
  director:  { background: 'rgba(0,102,204,0.08)', color: '#0066CC' },
  admin:     { background: 'rgba(10,10,11,0.07)', color: 'rgba(10,10,11,0.60)' },
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
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
}

export function UserCardList({ users }: Props) {
  const [selectedUser, setSelectedUser] = useState<UserDetail | null>(null)
  const [isPending, startTransition] = useTransition()

  const handleCardClick = useCallback((userId: string) => {
    setSelectedUser(null)
    startTransition(async () => {
      const detail = await fetchUserDetail(userId)
      setSelectedUser(detail)
    })
  }, [])

  const handleClose = useCallback(() => {
    setSelectedUser(null)
  }, [])

  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
        {users.map((user) => {
          const roleSt = roleStyles[user.role] ?? { background: 'rgba(10,10,11,0.06)', color: 'rgba(10,10,11,0.55)' }
          return (
            <button
              key={user.id}
              onClick={() => handleCardClick(user.id)}
              style={{
                background: '#ffffff',
                borderRadius: 10,
                padding: '20px',
                textAlign: 'left',
                border: 'none',
                boxShadow: '0 1px 3px rgba(0,0,0,0.07), 0 0 0 1px rgba(0,0,0,0.04)',
                cursor: 'pointer',
                transition: 'box-shadow 0.2s ease, transform 0.2s ease',
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLButtonElement
                el.style.boxShadow = '0 4px 12px rgba(0,0,0,0.09), 0 0 0 1px rgba(0,0,0,0.05)'
                el.style.transform = 'translateY(-1px)'
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLButtonElement
                el.style.boxShadow = '0 1px 3px rgba(0,0,0,0.07), 0 0 0 1px rgba(0,0,0,0.04)'
                el.style.transform = 'translateY(0)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 14 }}>
                {/* Avatar */}
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 10,
                    background: '#1A1714',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <span style={{ color: '#fff', fontWeight: 600, fontSize: 13 }}>{initials(user.name)}</span>
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                    <h2 style={{ fontWeight: 500, color: '#0A0A0B', fontSize: 13, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {user.name}
                    </h2>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        padding: '2px 7px',
                        borderRadius: 5,
                        fontSize: 10.5,
                        fontWeight: 600,
                        letterSpacing: '0.02em',
                        flexShrink: 0,
                        ...roleSt,
                      }}
                    >
                      {roleLabels[user.role] ?? user.role}
                    </span>
                  </div>
                  <p style={{ fontSize: 11, color: 'rgba(10,10,11,0.36)', fontFamily: 'monospace', marginTop: 3 }}>
                    {user.phone}
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 12, color: 'rgba(10,10,11,0.50)' }}>
                  {user.hourly_rate
                    ? `R$ ${user.hourly_rate.toFixed(2).replace('.', ',')}/h`
                    : 'Sem valor/hora'}
                </span>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 5,
                    fontSize: 11,
                    color: user.is_active ? '#16A34A' : 'rgba(10,10,11,0.32)',
                  }}
                >
                  <span
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      background: user.is_active ? '#16A34A' : 'rgba(10,10,11,0.20)',
                    }}
                  />
                  {user.is_active ? 'Ativo' : 'Inativo'}
                </span>
              </div>
            </button>
          )
        })}

        {users.length === 0 && (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', color: 'rgba(10,10,11,0.32)', padding: '40px 20px', fontSize: 13 }}>
            Nenhum membro ativo.
          </div>
        )}
      </div>

      <UserDetailPanel user={selectedUser} loading={isPending} onClose={handleClose} />
    </>
  )
}
