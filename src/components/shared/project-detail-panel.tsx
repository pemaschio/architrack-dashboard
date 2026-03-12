'use client'

import { useEffect, useRef } from 'react'
import {
  X,
  Clock,
  Calendar,
  CalendarCheck,
  CalendarClock,
  Users,
  Wallet,
  AlertTriangle,
  TrendingUp,
  Layers,
  Building2,
  FileText,
  Timer,
  CheckCircle2,
  PauseCircle,
  XCircle,
  Activity,
} from 'lucide-react'
import type { ProjectDetail } from '@/app/actions/details'

const statusConfig: Record<
  string,
  { label: string; dot: string; badge: string; Icon: React.ElementType }
> = {
  active:    { label: 'Ativo',     dot: 'bg-emerald-500', badge: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200', Icon: Activity },
  paused:    { label: 'Pausado',   dot: 'bg-amber-500',   badge: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',       Icon: PauseCircle },
  completed: { label: 'Concluído', dot: 'bg-sky-500',     badge: 'bg-sky-50 text-sky-700 ring-1 ring-sky-200',             Icon: CheckCircle2 },
  cancelled: { label: 'Cancelado', dot: 'bg-rose-500',    badge: 'bg-rose-50 text-rose-700 ring-1 ring-rose-200',          Icon: XCircle },
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

function daysUntilInfo(iso: string): { label: string; urgent: boolean; overdue: boolean } {
  const diff = Math.ceil((new Date(iso).getTime() - Date.now()) / 86400000)
  if (diff < 0) return { label: `${Math.abs(diff)} dias em atraso`, urgent: false, overdue: true }
  if (diff === 0) return { label: 'Vence hoje', urgent: true, overdue: false }
  if (diff === 1) return { label: 'Vence amanhã', urgent: true, overdue: false }
  if (diff <= 7) return { label: `em ${diff} dias`, urgent: true, overdue: false }
  return { label: `em ${diff} dias`, urgent: false, overdue: false }
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

const AVATAR_COLORS = [
  'bg-violet-100 text-violet-700',
  'bg-blue-100 text-blue-700',
  'bg-emerald-100 text-emerald-700',
  'bg-orange-100 text-orange-700',
  'bg-rose-100 text-rose-700',
  'bg-sky-100 text-sky-700',
]

const BAR_COLORS = [
  'bg-violet-400',
  'bg-blue-400',
  'bg-emerald-400',
  'bg-orange-400',
  'bg-rose-400',
  'bg-sky-400',
]

function avatarColor(index: number) {
  return AVATAR_COLORS[index % AVATAR_COLORS.length]
}

function barColor(index: number) {
  return BAR_COLORS[index % BAR_COLORS.length]
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
        className={`fixed right-0 top-0 h-full z-50 w-full max-w-[440px] bg-white shadow-2xl transition-transform duration-300 ease-out flex flex-col ${
          isVisible ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
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
            const isAlertZone = budgetH > 0 && totalHours >= budgetH * (project.alert_threshold / 100)
            const isOver = budgetH > 0 && totalHours >= budgetH
            const remainingH = budgetH > 0 ? Math.max(Math.round((budgetH - totalHours) * 10) / 10, 0) : null
            const s = statusConfig[project.status] ?? statusConfig.active
            const StatusIcon = s.Icon
            const deadlineInfo = project.deadline ? daysUntilInfo(project.deadline) : null
            const maxTeamMin = project.teamSummary[0]?.total_min ?? 1

            return (
              <>
                {/* ── Identity ────────────────────────────────────── */}
                <div className="px-6 pt-6 pb-5 border-b border-gray-100">
                  {/* Badges row */}
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold ${s.badge}`}>
                      <StatusIcon className="w-3 h-3" />
                      {s.label}
                    </span>
                    {project.phase_name && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-gray-100 text-gray-600 ring-1 ring-gray-200">
                        <Layers className="w-3 h-3" />
                        {project.phase_name}
                      </span>
                    )}
                  </div>

                  {/* Project name */}
                  <h2 className="text-xl font-bold text-gray-900 leading-tight mb-1">
                    {project.name}
                  </h2>

                  {/* Client */}
                  {project.client_name && (
                    <div className="flex items-center gap-1.5 text-sm text-gray-500">
                      <Building2 className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>{project.client_name}</span>
                    </div>
                  )}
                </div>

                {/* ── Quick stats ─────────────────────────────────── */}
                <div className="px-6 py-4 border-b border-gray-100">
                  <div className="grid grid-cols-3 gap-3">
                    {/* Total hours */}
                    <div className="bg-gray-50 rounded-xl p-3 text-center">
                      <Clock className="w-4 h-4 text-gray-400 mx-auto mb-1" />
                      <p className="text-base font-bold text-gray-900">{totalHours}h</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">Total horas</p>
                    </div>
                    {/* Entries count */}
                    <div className="bg-gray-50 rounded-xl p-3 text-center">
                      <FileText className="w-4 h-4 text-gray-400 mx-auto mb-1" />
                      <p className="text-base font-bold text-gray-900">
                        {project.recentEntries.length === 8 ? '8+' : project.recentEntries.length}
                      </p>
                      <p className="text-[10px] text-gray-400 mt-0.5">Lançamentos</p>
                    </div>
                    {/* Team size */}
                    <div className="bg-gray-50 rounded-xl p-3 text-center">
                      <Users className="w-4 h-4 text-gray-400 mx-auto mb-1" />
                      <p className="text-base font-bold text-gray-900">{project.teamSummary.length}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">Membros</p>
                    </div>
                  </div>
                </div>

                {/* ── Budget / Hours ───────────────────────────────── */}
                <div className="px-6 py-5 border-b border-gray-100">
                  <div className="flex items-center gap-2 mb-3">
                    <TrendingUp className="w-4 h-4 text-gray-400" />
                    <p className="text-xs font-semibold tracking-[0.12em] uppercase text-gray-400">
                      Progresso de Horas
                    </p>
                  </div>

                  {/* Alert banner */}
                  {(isAlertZone || isOver) && budgetH > 0 && (
                    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg mb-3 text-xs font-medium ${
                      isOver
                        ? 'bg-rose-50 text-rose-700 ring-1 ring-rose-200'
                        : 'bg-amber-50 text-amber-700 ring-1 ring-amber-200'
                    }`}>
                      <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                      {isOver
                        ? `Orçamento esgotado (${pct}% consumido)`
                        : `Alerta: ${pct}% do orçamento consumido (limite: ${project.alert_threshold}%)`}
                    </div>
                  )}

                  {budgetH > 0 ? (
                    <>
                      <div className="flex justify-between items-baseline mb-2">
                        <span className={`text-2xl font-bold ${isOver ? 'text-rose-600' : isAlertZone ? 'text-amber-600' : 'text-gray-900'}`}>
                          {totalHours}h
                        </span>
                        <span className="text-sm text-gray-400">de {budgetH}h orçadas</span>
                      </div>
                      <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-700 ${
                            isOver ? 'bg-rose-500' : isAlertZone ? 'bg-amber-500' : 'bg-gray-800'
                          }`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <div className="flex justify-between mt-1.5">
                        <span className={`text-xs font-semibold ${isOver ? 'text-rose-600' : isAlertZone ? 'text-amber-600' : 'text-gray-500'}`}>
                          {pct}% usado
                        </span>
                        {remainingH !== null && remainingH > 0 && (
                          <span className="text-xs text-gray-400">{remainingH}h restantes</span>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold text-gray-900">{totalHours}h</span>
                      <span className="text-sm text-gray-400">registradas</span>
                    </div>
                  )}

                  {/* Budget value */}
                  {project.budget_value && (
                    <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-2">
                      <Wallet className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                      <span className="text-xs text-gray-500 flex-1">Valor orçado</span>
                      <span className="text-sm font-bold text-gray-800">
                        R$ {project.budget_value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  )}
                </div>

                {/* ── Dates ────────────────────────────────────────── */}
                {(project.start_date || project.deadline) && (
                  <div className="px-6 py-5 border-b border-gray-100">
                    <div className="flex items-center gap-2 mb-3">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <p className="text-xs font-semibold tracking-[0.12em] uppercase text-gray-400">
                        Datas
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {project.start_date && (
                        <div className="bg-gray-50 rounded-xl px-4 py-3">
                          <div className="flex items-center gap-1.5 mb-1">
                            <CalendarCheck className="w-3.5 h-3.5 text-gray-400" />
                            <p className="text-xs text-gray-400">Início</p>
                          </div>
                          <p className="text-sm font-semibold text-gray-800">
                            {fmtDate(project.start_date)}
                          </p>
                        </div>
                      )}
                      {project.deadline && deadlineInfo && (
                        <div className={`rounded-xl px-4 py-3 ${
                          deadlineInfo.overdue
                            ? 'bg-rose-50 ring-1 ring-rose-200'
                            : deadlineInfo.urgent
                            ? 'bg-amber-50 ring-1 ring-amber-200'
                            : 'bg-gray-50'
                        }`}>
                          <div className="flex items-center gap-1.5 mb-1">
                            <CalendarClock className={`w-3.5 h-3.5 ${
                              deadlineInfo.overdue ? 'text-rose-500' : deadlineInfo.urgent ? 'text-amber-500' : 'text-gray-400'
                            }`} />
                            <p className={`text-xs ${
                              deadlineInfo.overdue ? 'text-rose-500' : deadlineInfo.urgent ? 'text-amber-500' : 'text-gray-400'
                            }`}>Prazo</p>
                          </div>
                          <p className={`text-sm font-semibold ${
                            deadlineInfo.overdue ? 'text-rose-700' : deadlineInfo.urgent ? 'text-amber-700' : 'text-gray-800'
                          }`}>
                            {fmtDate(project.deadline)}
                          </p>
                          <p className={`text-xs mt-0.5 font-medium ${
                            deadlineInfo.overdue ? 'text-rose-600' : deadlineInfo.urgent ? 'text-amber-600' : 'text-gray-400'
                          }`}>
                            {deadlineInfo.label}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* ── Team ─────────────────────────────────────────── */}
                {project.teamSummary.length > 0 && (
                  <div className="px-6 py-5 border-b border-gray-100">
                    <div className="flex items-center gap-2 mb-3">
                      <Users className="w-4 h-4 text-gray-400" />
                      <p className="text-xs font-semibold tracking-[0.12em] uppercase text-gray-400">
                        Equipe
                      </p>
                    </div>
                    <div className="space-y-3">
                      {project.teamSummary.map((m, idx) => {
                        const memberPct = Math.round((m.total_min / maxTeamMin) * 100)
                        return (
                          <div key={m.user_id}>
                            <div className="flex items-center gap-3 mb-1">
                              <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold ${avatarColor(idx)}`}>
                                {initials(m.user_name)}
                              </div>
                              <span className="text-sm text-gray-700 flex-1 truncate">{m.user_name}</span>
                              <span className="text-xs font-semibold text-gray-600 tabular-nums">
                                {fmtMin(m.total_min)}
                              </span>
                            </div>
                            <div className="ml-10 h-1 bg-gray-100 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${barColor(idx)}`}
                                style={{ width: `${memberPct}%` }}
                              />
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* ── Recent entries ───────────────────────────────── */}
                <div className="px-6 py-5">
                  <div className="flex items-center gap-2 mb-3">
                    <Timer className="w-4 h-4 text-gray-400" />
                    <p className="text-xs font-semibold tracking-[0.12em] uppercase text-gray-400">
                      Últimos Lançamentos
                    </p>
                  </div>

                  {project.recentEntries.length > 0 ? (
                    <div className="space-y-px">
                      {project.recentEntries.map((e) => (
                        <div
                          key={e.id}
                          className="flex items-start justify-between py-2.5 border-b border-gray-50 last:border-0"
                        >
                          <div className="flex items-start gap-2 flex-1 min-w-0">
                            <div className="w-1.5 h-1.5 rounded-full bg-gray-300 mt-1.5 flex-shrink-0" />
                            <div className="min-w-0">
                              <p className="text-sm text-gray-800 truncate">
                                {e.description || '(sem descrição)'}
                              </p>
                              <p className="text-xs text-gray-400 mt-0.5">{e.user_name ?? '—'}</p>
                            </div>
                          </div>
                          <div className="text-right ml-3 flex-shrink-0">
                            <p className="text-sm font-semibold text-gray-700 tabular-nums">
                              {e.duration_min ? fmtMin(e.duration_min) : '—'}
                            </p>
                            <p className="text-xs text-gray-400 mt-0.5">
                              {fmtShortDate(e.started_at)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-8 text-center">
                      <FileText className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                      <p className="text-sm text-gray-400">Nenhum lançamento encontrado.</p>
                    </div>
                  )}
                </div>

                {/* ── Footer ────────────────────────────────────────── */}
                <div className="px-6 py-4 border-t border-gray-100 flex items-center gap-1.5 flex-shrink-0">
                  <Calendar className="w-3.5 h-3.5 text-gray-300" />
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
