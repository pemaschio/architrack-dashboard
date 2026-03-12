'use client'

import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'
import type { UserDetail } from '@/app/actions/details'

const roleLabels: Record<string, string> = {
  architect: 'Arquiteto',
  director: 'Diretor',
  admin: 'Admin',
}

const roleColors: Record<string, string> = {
  architect: 'bg-violet-100 text-violet-700',
  director: 'bg-sky-100 text-sky-700',
  admin: 'bg-amber-100 text-amber-700',
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

function fmtMin(min: number) {
  if (min < 60) return `${min}min`
  const h = Math.floor(min / 60)
  const m = min % 60
  return m > 0 ? `${h}h ${m}min` : `${h}h`
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
}

function fmtShortDate(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
}

interface Props {
  user: UserDetail | null
  loading: boolean
  onClose: () => void
}

export function UserDetailPanel({ user, loading, onClose }: Props) {
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const isVisible = loading || user !== null

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black/20 backdrop-blur-[1px] transition-opacity duration-300 ${
          isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        ref={panelRef}
        className={`fixed right-0 top-0 h-full z-50 w-full max-w-md bg-white shadow-2xl transition-transform duration-300 ease-out flex flex-col ${
          isVisible ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <span className="text-xs font-semibold tracking-[0.15em] uppercase text-gray-400">
            Perfil do Membro
          </span>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {loading && !user && (
            <div className="flex items-center justify-center h-48">
              <div className="flex gap-1.5">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="w-2 h-2 rounded-full bg-gray-300 animate-bounce"
                    style={{ animationDelay: `${i * 120}ms` }}
                  />
                ))}
              </div>
            </div>
          )}

          {user && (
            <>
              {/* Identity block */}
              <div className="px-6 py-6 border-b border-gray-100">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gray-900 flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-lg tracking-wide">
                      {initials(user.name)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-xl font-semibold text-gray-900 leading-tight">
                      {user.name}
                    </h2>
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                          roleColors[user.role] ?? 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {roleLabels[user.role] ?? user.role}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${
                          user.is_active
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            user.is_active ? 'bg-emerald-500' : 'bg-gray-400'
                          }`}
                        />
                        {user.is_active ? 'Ativo' : 'Inativo'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 font-mono mt-2">{user.phone}</p>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="px-6 py-5 border-b border-gray-100">
                <p className="text-xs font-semibold tracking-[0.12em] uppercase text-gray-400 mb-3">
                  Resumo
                </p>
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-gray-50 rounded-xl p-3 text-center">
                    <p className="text-lg font-bold text-gray-900">
                      {Math.round((user.totalMinutes / 60) * 10) / 10}h
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">Total</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3 text-center">
                    <p className="text-lg font-bold text-gray-900">{user.projectCount}</p>
                    <p className="text-xs text-gray-500 mt-0.5">Projetos</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3 text-center">
                    <p className="text-lg font-bold text-gray-900">
                      {user.hourly_rate
                        ? `R$\u00a0${user.hourly_rate.toFixed(0)}`
                        : '—'}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">Hora</p>
                  </div>
                </div>
              </div>

              {/* Top projects */}
              {user.projectSummary.length > 0 && (
                <div className="px-6 py-5 border-b border-gray-100">
                  <p className="text-xs font-semibold tracking-[0.12em] uppercase text-gray-400 mb-3">
                    Principais Projetos
                  </p>
                  <div className="space-y-2.5">
                    {user.projectSummary.map((p) => {
                      const pct =
                        user.totalMinutes > 0
                          ? Math.round((p.total_min / user.totalMinutes) * 100)
                          : 0
                      return (
                        <div key={p.project_id}>
                          <div className="flex justify-between items-baseline mb-1">
                            <span className="text-sm text-gray-700 truncate max-w-[180px]">
                              {p.project_name}
                            </span>
                            <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
                              {fmtMin(p.total_min)}
                            </span>
                          </div>
                          <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gray-800 rounded-full transition-all duration-700"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Recent entries */}
              {user.recentEntries.length > 0 && (
                <div className="px-6 py-5">
                  <p className="text-xs font-semibold tracking-[0.12em] uppercase text-gray-400 mb-3">
                    Últimos Lançamentos
                  </p>
                  <div className="space-y-px">
                    {user.recentEntries.map((e) => (
                      <div
                        key={e.id}
                        className="flex items-start justify-between py-2.5 border-b border-gray-50 last:border-0 group"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-800 truncate">
                            {e.description || e.project_name || '—'}
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5">{e.project_name}</p>
                        </div>
                        <div className="text-right ml-3 flex-shrink-0">
                          <p className="text-sm font-medium text-gray-700">
                            {e.duration_min ? fmtMin(e.duration_min) : '—'}
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {fmtShortDate(e.started_at)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {user.recentEntries.length === 0 && (
                <div className="px-6 py-10 text-center text-gray-400 text-sm">
                  Nenhum lançamento encontrado.
                </div>
              )}

              {/* Footer */}
              <div className="px-6 py-4 border-t border-gray-100 mt-auto">
                <p className="text-xs text-gray-400">
                  Cadastrado em {fmtDate(user.created_at)}
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  )
}
