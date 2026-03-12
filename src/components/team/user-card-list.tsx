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

const roleColors: Record<string, string> = {
  architect: 'bg-purple-100 text-purple-700',
  director: 'bg-blue-100 text-blue-700',
  admin: 'bg-orange-100 text-orange-700',
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {users.map((user) => (
          <button
            key={user.id}
            onClick={() => handleCardClick(user.id)}
            className="bg-white rounded-lg border border-gray-200 p-5 text-left hover:border-gray-400 hover:shadow-sm transition-all duration-150 group"
          >
            <div className="flex items-start gap-3 mb-3">
              {/* Avatar */}
              <div className="w-10 h-10 rounded-xl bg-gray-900 flex items-center justify-center flex-shrink-0 group-hover:bg-gray-700 transition-colors">
                <span className="text-white font-semibold text-sm">{initials(user.name)}</span>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <h2 className="font-medium text-gray-900 truncate">{user.name}</h2>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium flex-shrink-0 ${
                      roleColors[user.role] ?? 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {roleLabels[user.role] ?? user.role}
                  </span>
                </div>
                <p className="text-xs text-gray-400 font-mono mt-0.5">{user.phone}</p>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">
                {user.hourly_rate
                  ? `R$ ${user.hourly_rate.toFixed(2).replace('.', ',')}/hora`
                  : 'Valor/hora não definido'}
              </span>
              <span
                className={`inline-flex items-center gap-1 text-xs ${
                  user.is_active ? 'text-emerald-600' : 'text-gray-400'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    user.is_active ? 'bg-emerald-500' : 'bg-gray-300'
                  }`}
                />
                {user.is_active ? 'Ativo' : 'Inativo'}
              </span>
            </div>
          </button>
        ))}

        {users.length === 0 && (
          <div className="col-span-3 text-center text-gray-400 py-10">Nenhum membro ativo.</div>
        )}
      </div>

      <UserDetailPanel user={selectedUser} loading={isPending} onClose={handleClose} />
    </>
  )
}
