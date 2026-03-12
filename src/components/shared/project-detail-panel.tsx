'use client'

import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'
import type { ProjectDetail } from '@/app/actions/details'

const statusConfig: Record<string, { label: string; dot: string; text: string }> = {
  active:    { label: 'Ativo',     dot: 'bg-emerald-500', text: 'text-emerald-700' },
  paused:    { label: 'Pausado',   dot: 'bg-amber-500',   text: 'text-amber-700' },
  completed: { label: 'Concluído', dot: 'bg-sky-500',     text: 'text-sky-700' },
  cancelled: { label: 'Cancelado', dot: 'bg-rose-500',    text: 'text-rose-700' },
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

function daysUntil(iso: string) {
  const diff = Math.ceil((new Date(iso).getTime() - Date.now()) / 86400000)
  if (diff < 0) return `${Math.abs(diff)} dias atrasado`
  if (diff === 0) return 'Hoje'
  if (diff === 1) return 'Amanhã'
  return `em ${diff} dias`
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

interface Props {
  project: ProjectDetail | null
  loading: boolean
  onClose: () => void
}

export function ProjectDetailPanel({ project, loading, onClose }: Props) {
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const isVisible = loading || project !== null

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
            Detalhes do Projeto
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
          {loading && !project && (
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

          {project && (() => {
            const totalHours = Math.round((project.totalMinutes / 60) * 10) / 10
            const budgetH = project.budget_hours ?? 0
            const pct = budgetH > 0 ? Math.min(Math.round((totalHours / budgetH) * 100), 100) : 0
            const isOver = budgetH > 0 && totalHours >= budgetH * (project.alert_threshold / 100)
            const s = statusConfig[project.status] ?? statusConfig.active

            return (
              <>
                {/* Identity */}
                <div className="px-6 py-6 border-b border-gray-100">
                  <div className="flex items-start gap-3 mb-3">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${
                        project.status === 'active'
                          ? 'bg-emerald-50 text-emerald-700'
                          : project.status === 'paused'
                          ? 'bg-amber-50 text-amber-700'
                          : project.status === 'completed'
                          ? 'bg-sky-50 text-sky-700'
                          : 'bg-rose-50 text-rose-700'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                      {s.label}
                    </span>
                    {project.phase_name && (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-gray-100 text-gray-600">
                        {project.phase_name}
                      </span>
                    )}
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900 leading-tight">
                    {project.name}
                  </h2>
                  {project.client_name && (
                    <p className="text-sm text-gray-500 mt-1">{project.client_name}</p>
                  )}
                </div>

                {/* Budget progress */}
                <div className="px-6 py-5 border-b border-gray-100">
                  <p className="text-xs font-semibold tracking-[0.12em] uppercase text-gray-400 mb-3">
                    Progresso de Horas
                  </p>
                  {budgetH > 0 ? (
                    <>
                      <div className="flex justify-between items-baseline mb-2">
                        <span className={`text-2xl font-bold ${isOver ? 'text-amber-600' : 'text-gray-900'}`}>
                          {totalHours}h
                        </span>
                        <span className="text-sm text-gray-400">de {budgetH}h orçadas</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-700 ${
                            pct >= 100
                              ? 'bg-rose-500'
                              : isOver
                              ? 'bg-amber-500'
                              : 'bg-gray-800'
                          }`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <div className="flex justify-between mt-1.5">
                        <span
                          className={`text-xs font-medium ${
                            isOver ? 'text-amber-600' : 'text-gray-500'
                          }`}
                        >
                          {pct}% {isOver && pct < 100 ? `— alerta (${project.alert_threshold}%)` : ''}
                          {pct >= 100 ? ' — LIMITE ATINGIDO' : ''}
                        </span>
                        <span className="text-xs text-gray-400">
                          {budgetH > 0 && totalHours < budgetH
                            ? `${Math.round((budgetH - totalHours) * 10) / 10}h restantes`
                            : ''}
                        </span>
                      </div>
                    </>
                  ) : (
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold text-gray-900">{totalHours}h</span>
                      <span className="text-sm text-gray-400">registradas (sem orçamento definido)</span>
                    </div>
                  )}

                  {project.budget_value && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-500">Valor orçado</span>
                        <span className="text-sm font-semibold text-gray-800">
                          R$ {project.budget_value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Dates */}
                {(project.start_date || project.deadline) && (
                  <div className="px-6 py-5 border-b border-gray-100">
                    <p className="text-xs font-semibold tracking-[0.12em] uppercase text-gray-400 mb-3">
                      Datas
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                      {project.start_date && (
                        <div>
                          <p className="text-xs text-gray-400 mb-0.5">Início</p>
                          <p className="text-sm font-medium text-gray-800">
                            {fmtDate(project.start_date)}
                          </p>
                        </div>
                      )}
                      {project.deadline && (
                        <div>
                          <p className="text-xs text-gray-400 mb-0.5">Prazo</p>
                          <p className="text-sm font-medium text-gray-800">
                            {fmtDate(project.deadline)}
                          </p>
                          <p
                            className={`text-xs mt-0.5 ${
                              daysUntil(project.deadline).includes('atrasado')
                                ? 'text-rose-600 font-medium'
                                : 'text-gray-400'
                            }`}
                          >
                            {daysUntil(project.deadline)}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Team */}
                {project.teamSummary.length > 0 && (
                  <div className="px-6 py-5 border-b border-gray-100">
                    <p className="text-xs font-semibold tracking-[0.12em] uppercase text-gray-400 mb-3">
                      Equipe
                    </p>
                    <div className="space-y-2">
                      {project.teamSummary.map((m) => (
                        <div key={m.user_id} className="flex items-center gap-3">
                          <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                            <span className="text-xs font-semibold text-gray-600">
                              {initials(m.user_name)}
                            </span>
                          </div>
                          <span className="text-sm text-gray-700 flex-1 truncate">{m.user_name}</span>
                          <span className="text-xs font-medium text-gray-500">
                            {fmtMin(m.total_min)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recent entries */}
                {project.recentEntries.length > 0 && (
                  <div className="px-6 py-5">
                    <p className="text-xs font-semibold tracking-[0.12em] uppercase text-gray-400 mb-3">
                      Últimos Lançamentos
                    </p>
                    <div className="space-y-px">
                      {project.recentEntries.map((e) => (
                        <div
                          key={e.id}
                          className="flex items-start justify-between py-2.5 border-b border-gray-50 last:border-0"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-gray-800 truncate">
                              {e.description || e.user_name || '—'}
                            </p>
                            <p className="text-xs text-gray-400 mt-0.5">{e.user_name}</p>
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

                {project.recentEntries.length === 0 && (
                  <div className="px-6 py-10 text-center text-gray-400 text-sm">
                    Nenhum lançamento encontrado.
                  </div>
                )}

                {/* Footer */}
                <div className="px-6 py-4 border-t border-gray-100">
                  <p className="text-xs text-gray-400">
                    Criado em {fmtDate(project.created_at)}
                  </p>
                </div>
              </>
            )
          })()}
        </div>
      </div>
    </>
  )
}
