'use client'

import { useState, useTransition, useCallback } from 'react'
import { fetchUserDetail, type UserDetail } from '@/app/actions/details'
import { UserDetailPanel } from '@/components/shared/user-detail-panel'

type UserRole = 'architect' | 'director' | 'admin'

const roleLabels: Record<UserRole, string> = {
  architect: 'Arquiteto',
  director: 'Diretor',
  admin: 'Admin',
}

interface User {
  id: string
  name: string
  phone: string
  role: UserRole
  hourly_rate: number | null
  is_active: boolean
  created_at: string
}

interface Props {
  users: User[]
}

export function UsersTable({ users }: Props) {
  const [selectedUser, setSelectedUser] = useState<UserDetail | null>(null)
  const [isPending, startTransition] = useTransition()

  const handleRowClick = useCallback((userId: string) => {
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
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                {['Nome', 'Telefone', 'Perfil', 'Valor/hora', 'Status'].map((h) => (
                  <th
                    key={h}
                    className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr
                  key={user.id}
                  onClick={() => handleRowClick(user.id)}
                  className="border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <td className="px-5 py-3 font-medium text-gray-900">{user.name}</td>
                  <td className="px-5 py-3 text-gray-600 font-mono text-xs">{user.phone}</td>
                  <td className="px-5 py-3">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700">
                      {roleLabels[user.role] ?? user.role}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-gray-600">
                    {user.hourly_rate
                      ? `R$ ${user.hourly_rate.toFixed(2).replace('.', ',')}/h`
                      : '—'}
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        user.is_active
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {user.is_active ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-gray-400 text-sm">
                    Nenhum usuário cadastrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <UserDetailPanel
        user={selectedUser}
        loading={isPending}
        onClose={handleClose}
      />
    </>
  )
}
