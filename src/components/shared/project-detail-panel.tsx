'use client'

import { useEffect, useRef, useCallback, useState } from 'react'
import { useRouter } from 'next/navigation'
import { NewEntryDialog } from './new-entry-dialog'
import {
  X,
  Clock,
  Calendar,
  CalendarCheck,
  CalendarClock,
  Users,
  Wallet,
  AlertTriangle,
  Layers,
  Building2,
  FileText,
  Timer,
  CheckCircle2,
  PauseCircle,
  XCircle,
  Activity,
  Edit3,
  BarChart2,
  ArrowRight,
  Zap,
} from 'lucide-react'
import type { ProjectDetail } from '@/app/actions/details'

/* ─── Status config ──────────────────────────────────────────────── */
const STATUS: Record<string, {
  label: string
  accent: string
  bg: string
  text: string
  ring: string
  Icon: React.ElementType
}> = {
  active:    { label: 'Ativo',     accent: '#10b981', bg: '#ecfdf5', text: '#065f46', ring: '#a7f3d0', Icon: Activity },
  paused:    { label: 'Pausado',   accent: '#f59e0b', bg: '#fffbeb', text: '#92400e', ring: '#fde68a', Icon: PauseCircle },
  completed: { label: 'Concluído', accent: '#0ea5e9', bg: '#f0f9ff', text: '#075985', ring: '#bae6fd', Icon: CheckCircle2 },
  cancelled: { label: 'Cancelado', accent: '#f43f5e', bg: '#fff1f2', text: '#9f1239', ring: '#fda4af', Icon: XCircle },
}

/* ─── Helpers ────────────────────────────────────────────────────── */
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
  if (diff < 0) return { label: `${Math.abs(diff)}d atraso`, urgent: false, overdue: true }
  if (diff === 0) return { label: 'Hoje', urgent: true, overdue: false }
  if (diff === 1) return { label: 'Amanhã', urgent: true, overdue: false }
  if (diff <= 7) return { label: `${diff} dias`, urgent: true, overdue: false }
  return { label: `${diff} dias`, urgent: false, overdue: false }
}

function initials(name: string) {
  return name.split(' ').filter(Boolean).slice(0, 2).map((n) => n[0]).join('').toUpperCase()
}

const AVATAR_BG = ['#ede9fe', '#dbeafe', '#d1fae5', '#fed7aa', '#ffe4e6', '#e0f2fe']
const AVATAR_FG = ['#5b21b6', '#1e40af', '#065f46', '#9a3412', '#9f1239', '#075985']
const BAR_HEX   = ['#8b5cf6', '#3b82f6', '#10b981', '#f97316', '#f43f5e', '#0ea5e9']

/* ─── Circular gauge ─────────────────────────────────────────────── */
interface GaugeProps { pct: number; isOver: boolean; isAlert: boolean; hours: number; budget: number }

function CircularGauge({ pct, isOver, isAlert, hours, budget }: GaugeProps) {
  const r = 48
  const stroke = 9
  const circ = 2 * Math.PI * r
  const clampedPct = Math.min(pct, 100)
  const dash = (clampedPct / 100) * circ
  const trackColor = '#f3f4f6'
  const fillColor = isOver ? '#ef4444' : isAlert ? '#f59e0b' : '#1d4ed8'

  return (
    <div className="relative w-[120px] h-[120px]">
      <svg width="120" height="120" viewBox="0 0 120 120">
        {/* track */}
        <circle cx="60" cy="60" r={r} fill="none" stroke={trackColor} strokeWidth={stroke} />
        {/* progress arc */}
        <circle
          cx="60" cy="60" r={r}
          fill="none"
          stroke={fillColor}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circ}`}
          transform="rotate(-90 60 60)"
          style={{ transition: 'stroke-dasharray 0.9s cubic-bezier(0.4,0,0.2,1)' }}
        />
        {/* inner glow ring */}
        {pct >= 85 && (
          <circle cx="60" cy="60" r={r - stroke / 2 - 2} fill="none"
            stroke={fillColor} strokeWidth="1" strokeOpacity="0.15" />
        )}
      </svg>
      {/* Center text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-lg font-extrabold leading-none" style={{ color: fillColor }}>{hours}h</span>
        <span className="text-[10px] text-stone-400 mt-0.5">de {budget}h</span>
        <span className="text-[11px] font-bold mt-1 px-[5px] py-px rounded-full" style={{
          color: fillColor,
          background: isOver ? '#fef2f2' : isAlert ? '#fffbeb' : '#eff6ff',
        }}>{pct}%</span>
      </div>
    </div>
  )
}

/* ─── Stacked team bar ───────────────────────────────────────────── */
function TeamStackedBar({ team, totalMin }: { team: ProjectDetail['teamSummary']; totalMin: number }) {
  return (
    <div className="flex h-1.5 rounded-full overflow-hidden bg-gray-100 gap-px">
      {team.map((m, i) => {
        const w = totalMin > 0 ? (m.total_min / totalMin) * 100 : 0
        return (
          <div key={m.user_id}
            title={`${m.user_name}: ${fmtMin(m.total_min)}`}
            style={{ width: `${w}%`, background: BAR_HEX[i % BAR_HEX.length], minWidth: w > 0 ? 3 : 0 }}
          />
        )
      })}
    </div>
  )
}

/* ─── Props ──────────────────────────────────────────────────────── */
interface Props {
  project: ProjectDetail | null
  loading: boolean
  onClose: () => void
}

/* ─── Component ──────────────────────────────────────────────────── */
export function ProjectDetailPanel({ project, loading, onClose }: Props) {
  const panelRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const [entryDialogOpen, setEntryDialogOpen] = useState(false)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const handleEdit = useCallback(() => {
    onClose()
    router.push('/settings/projects' as never)
  }, [onClose, router])

  const handlePrint = useCallback(() => {
    window.print()
  }, [])

  const handleNewEntry = useCallback(() => {
    setEntryDialogOpen(true)
  }, [])

  const isVisible = loading || project !== null

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 transition-opacity duration-300 glass-backdrop ${isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      {/* New Entry Dialog — sobrepõe o painel */}
      <NewEntryDialog
        open={entryDialogOpen}
        onClose={() => setEntryDialogOpen(false)}
        defaultProjectId={project?.id}
        defaultProjectName={project?.name}
      />

      {/* Panel */}
      <div
        ref={panelRef}
        className={`fixed right-0 top-0 h-full z-50 flex flex-col transition-transform duration-300 ease-out bg-white/[0.55] backdrop-blur-[16px] ${isVisible ? 'translate-x-0' : 'translate-x-full'}`}
        style={{ width: 460, boxShadow: '-4px 0 40px rgba(0,0,0,0.12)' }}
      >
        {/* ── Loading ── */}
        {loading && !project && (
          <div className="flex-1 flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="flex gap-1.5">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="w-2 h-2 rounded-full bg-blue-700" style={{
                    animation: 'bounce 1s infinite', animationDelay: `${i * 150}ms`,
                  }} />
                ))}
              </div>
              <p className="text-xs text-stone-400">Carregando dados...</p>
            </div>
          </div>
        )}

        {/* ── Content ── */}
        {project && (() => {
          const totalHours = Math.round((project.totalMinutes / 60) * 10) / 10
          const budgetH = project.budget_hours ?? 0
          const pct = budgetH > 0 ? Math.min(Math.round((totalHours / budgetH) * 100), 100) : 0
          const isAlert = budgetH > 0 && totalHours >= budgetH * (project.alert_threshold / 100)
          const isOver = budgetH > 0 && totalHours >= budgetH
          const remainingH = budgetH > 0 ? Math.max(Math.round((budgetH - totalHours) * 10) / 10, 0) : null
          const s = STATUS[project.status] ?? STATUS.active
          const StatusIcon = s.Icon
          const deadlineInfo = project.deadline ? daysUntil(project.deadline) : null
          const totalTeamMin = project.teamSummary.reduce((a, m) => a + m.total_min, 0)

          return (
            <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'thin', scrollbarColor: '#e5e7eb transparent' }}>

              {/* ══ HEADER ══════════════════════════════════════════ */}
              <div className="glass-dark p-5 pt-5 relative shrink-0">
                {/* Status accent bar */}
                <div className="absolute top-0 left-0 right-0 h-[3px]" style={{ background: s.accent }} />

                {/* Top row: label + actions */}
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] font-bold tracking-[0.18em] text-slate-600 uppercase">
                    Painel do Projeto
                  </span>
                  <button
                    onClick={onClose}
                    className="w-7 h-7 rounded-full bg-white/[0.08] text-stone-400 flex items-center justify-center transition-colors hover:bg-white/[0.15] hover:text-white border-none cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Project name */}
                <h2 className="text-xl font-extrabold text-slate-50 leading-tight mb-1.5">
                  {project.name}
                </h2>

                {/* Client + Phase row */}
                <div className="flex items-center gap-3 mb-4">
                  {project.client_name && (
                    <div className="flex items-center gap-[5px] text-stone-400">
                      <Building2 className="w-3 h-3" />
                      <span className="text-[13px]">{project.client_name}</span>
                    </div>
                  )}
                  {project.phase_name && (
                    <>
                      <span className="text-slate-700 text-xs">·</span>
                      <div className="flex items-center gap-[5px] text-slate-500">
                        <Layers className="w-3 h-3" />
                        <span className="text-[13px]">{project.phase_name}</span>
                      </div>
                    </>
                  )}
                </div>

                {/* Status badge + Action buttons */}
                <div className="flex items-center gap-2 pb-5">
                  <span className="inline-flex items-center gap-[5px] px-2.5 py-1 rounded-full text-[11px] font-bold" style={{
                    background: s.bg, color: s.text, border: `1px solid ${s.ring}`,
                  }}>
                    <StatusIcon className="w-[11px] h-[11px]" />
                    {s.label}
                  </span>

                  <div className="flex-1" />

                  <ActionButton icon={<Edit3 className="w-[11px] h-[11px]" />} label="Editar" onClick={handleEdit} />
                  <ActionButton icon={<BarChart2 className="w-[11px] h-[11px]" />} label="Relatório" onClick={handlePrint} />
                </div>
              </div>

              {/* ══ QUICK STATS ══════════════════════════════════════ */}
              <div className="grid grid-cols-3 gap-px bg-stone-300/20 border-b border-stone-300/20">
                <StatCard icon={<Clock className="w-3.5 h-3.5 text-blue-700" />}
                  value={`${totalHours}h`} label="Horas" accent="#1d4ed8" />
                <StatCard icon={<FileText className="w-3.5 h-3.5 text-violet-600" />}
                  value={project.recentEntries.length >= 8 ? '8+' : String(project.recentEntries.length)}
                  label="Lançamentos" accent="#7c3aed" />
                <StatCard icon={<Users className="w-3.5 h-3.5 text-cyan-600" />}
                  value={String(project.teamSummary.length)} label="Membros" accent="#0891b2" />
              </div>

              {/* ══ BUDGET GAUGE ═════════════════════════════════════ */}
              <div className="bg-white/[0.4] backdrop-blur-sm p-5 border-b border-stone-300/15">
                <SectionLabel icon={<Zap className="w-3 h-3" />} label="Consumo de Horas" />

                {/* Alert banner */}
                {(isAlert || isOver) && budgetH > 0 && (
                  <div className={`flex items-center gap-2 px-3 py-2 rounded-lg mb-4 text-xs font-semibold ${
                    isOver
                      ? 'bg-red-50 border border-red-300 text-red-600'
                      : 'bg-amber-50 border border-amber-200 text-amber-600'
                  }`}>
                    <AlertTriangle className="w-[13px] h-[13px] shrink-0" />
                    {isOver
                      ? `Orçamento esgotado — ${pct}% consumido`
                      : `Alerta: ${pct}% consumido (limite ${project.alert_threshold}%)`}
                  </div>
                )}

                {budgetH > 0 ? (
                  <div className="flex items-center gap-6">
                    {/* Gauge */}
                    <CircularGauge
                      pct={pct} isOver={isOver} isAlert={isAlert}
                      hours={totalHours} budget={budgetH}
                    />

                    {/* Right side info */}
                    <div className="flex-1">
                      <div className="mb-3">
                        <p className="text-[11px] text-stone-400 mb-0.5">Horas utilizadas</p>
                        <p className={`text-[22px] font-extrabold leading-none ${isOver ? 'text-red-600' : isAlert ? 'text-amber-600' : 'text-gray-900'}`}>
                          {totalHours}h
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">de {budgetH}h orçadas</p>
                      </div>

                      {remainingH !== null && remainingH > 0 && (
                        <div className="inline-flex items-center gap-1.5 py-[5px] px-2.5 rounded-lg bg-green-50 border border-green-200 text-xs font-semibold text-green-700">
                          <Clock className="w-[11px] h-[11px]" />
                          {remainingH}h restantes
                        </div>
                      )}

                      {isOver && (
                        <div className="inline-flex items-center gap-1.5 py-[5px] px-2.5 rounded-lg bg-red-50 border border-red-300 text-xs font-semibold text-red-600">
                          <AlertTriangle className="w-[11px] h-[11px]" />
                          {Math.abs(remainingH ?? 0)}h excedido
                        </div>
                      )}

                      {project.budget_value && (
                        <div className="mt-3 flex items-center gap-1.5">
                          <Wallet className="w-3 h-3 text-stone-400" />
                          <span className="text-xs text-gray-500">Valor:</span>
                          <span className="text-[13px] font-bold text-gray-900">
                            R$ {project.budget_value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  /* No budget — just show hours */
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-extrabold text-gray-900 leading-none">{totalHours}</span>
                    <span className="text-[15px] text-gray-500">horas registradas</span>
                  </div>
                )}
              </div>

              {/* ══ DATES ════════════════════════════════════════════ */}
              {(project.start_date || project.deadline) && (
                <div className="bg-white/[0.4] backdrop-blur-sm p-5 border-b border-stone-300/15">
                  <SectionLabel icon={<Calendar className="w-3 h-3" />} label="Cronograma" />
                  <div className="grid grid-cols-2 gap-2.5">
                    {project.start_date && (
                      <div className="p-3 rounded-[10px] bg-slate-50 border border-slate-200">
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <CalendarCheck className="w-3 h-3 text-emerald-500" />
                          <span className="text-[10px] font-bold uppercase tracking-[0.08em] text-gray-500">Início</span>
                        </div>
                        <p className="text-[13px] font-semibold text-gray-900">{fmtDate(project.start_date)}</p>
                      </div>
                    )}
                    {project.deadline && deadlineInfo && (
                      <div className="p-3 rounded-[10px]" style={{
                        background: deadlineInfo.overdue ? '#fef2f2' : deadlineInfo.urgent ? '#fffbeb' : '#f8fafc',
                        border: `1px solid ${deadlineInfo.overdue ? '#fca5a5' : deadlineInfo.urgent ? '#fde68a' : '#e2e8f0'}`,
                      }}>
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <CalendarClock className="w-3 h-3" style={{
                            color: deadlineInfo.overdue ? '#dc2626' : deadlineInfo.urgent ? '#d97706' : '#6b7280'
                          }} />
                          <span className="text-[10px] font-bold uppercase tracking-[0.08em] text-gray-500">Prazo</span>
                        </div>
                        <p className="text-[13px] font-semibold" style={{
                          color: deadlineInfo.overdue ? '#dc2626' : deadlineInfo.urgent ? '#92400e' : '#111827',
                        }}>
                          {fmtDate(project.deadline)}
                        </p>
                        <div className="mt-[5px] inline-flex items-center px-[7px] py-0.5 rounded-full text-[10px] font-bold" style={{
                          background: deadlineInfo.overdue ? '#dc2626' : deadlineInfo.urgent ? '#f59e0b' : '#e2e8f0',
                          color: deadlineInfo.overdue || deadlineInfo.urgent ? '#fff' : '#6b7280',
                        }}>
                          {deadlineInfo.label}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ══ TEAM ══════════════════════════════════════════════ */}
              {project.teamSummary.length > 0 && (
                <div className="bg-white/[0.4] backdrop-blur-sm p-5 border-b border-stone-300/15">
                  <div className="flex items-center justify-between mb-3.5">
                    <SectionLabel icon={<Users className="w-3 h-3" />} label="Equipe" />
                    {/* Avatar stack */}
                    <div className="flex">
                      {project.teamSummary.slice(0, 4).map((m, i) => (
                        <div key={m.user_id} className="w-6 h-6 rounded-full text-[9px] font-extrabold flex items-center justify-center border-2 border-white relative" style={{
                          background: AVATAR_BG[i % AVATAR_BG.length],
                          color: AVATAR_FG[i % AVATAR_FG.length],
                          marginLeft: i > 0 ? -6 : 0,
                          zIndex: project.teamSummary.length - i,
                        }}>
                          {initials(m.user_name)}
                        </div>
                      ))}
                      {project.teamSummary.length > 4 && (
                        <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-500 text-[9px] font-bold flex items-center justify-center border-2 border-white relative" style={{ marginLeft: -6 }}>
                          +{project.teamSummary.length - 4}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Stacked distribution bar */}
                  <div className="mb-4">
                    <TeamStackedBar team={project.teamSummary} totalMin={totalTeamMin} />
                    {/* Legend */}
                    <div className="flex flex-wrap gap-x-3 gap-y-1.5 mt-2">
                      {project.teamSummary.map((m, i) => {
                        const pctMember = totalTeamMin > 0 ? Math.round((m.total_min / totalTeamMin) * 100) : 0
                        return (
                          <div key={m.user_id} className="flex items-center gap-1">
                            <div className="w-2 h-2 rounded-sm shrink-0" style={{ background: BAR_HEX[i % BAR_HEX.length] }} />
                            <span className="text-[10px] text-gray-500">{m.user_name.split(' ')[0]} ({pctMember}%)</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Member list */}
                  <div className="flex flex-col gap-2">
                    {project.teamSummary.map((m, idx) => {
                      const memberPct = totalTeamMin > 0 ? (m.total_min / totalTeamMin) * 100 : 0
                      return (
                        <div key={m.user_id} className="flex items-center gap-2.5 p-2 px-3 rounded-[10px] bg-white/20 border border-stone-300/15">
                          {/* Avatar */}
                          <div className="w-8 h-8 rounded-full shrink-0 text-[11px] font-extrabold flex items-center justify-center" style={{
                            background: AVATAR_BG[idx % AVATAR_BG.length],
                            color: AVATAR_FG[idx % AVATAR_FG.length],
                          }}>
                            {initials(m.user_name)}
                          </div>
                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <p className="text-[13px] font-semibold text-gray-900 mb-[3px] overflow-hidden text-ellipsis whitespace-nowrap">
                              {m.user_name}
                            </p>
                            {/* Mini progress bar */}
                            <div className="h-[3px] bg-slate-200 rounded-full overflow-hidden">
                              <div className="h-full rounded-full transition-[width] duration-[600ms] ease-out" style={{
                                background: BAR_HEX[idx % BAR_HEX.length],
                                width: `${memberPct}%`,
                              }} />
                            </div>
                          </div>
                          {/* Hours + % */}
                          <div className="text-right shrink-0">
                            <p className="text-[13px] font-bold text-gray-900">{fmtMin(m.total_min)}</p>
                            <p className="text-[10px] text-stone-400">{Math.round(memberPct)}%</p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* ══ RECENT ENTRIES ════════════════════════════════════ */}
              <div className="bg-white/[0.4] backdrop-blur-sm p-5">
                <div className="flex items-center justify-between mb-3.5">
                  <SectionLabel icon={<Timer className="w-3 h-3" />} label="Últimos Lançamentos" />
                  {project.recentEntries.length > 0 && (
                    <span className="text-[11px] text-stone-400">
                      {project.recentEntries.length >= 8 ? 'Últimos 8' : `${project.recentEntries.length} total`}
                    </span>
                  )}
                </div>

                {project.recentEntries.length > 0 ? (
                  <div className="relative">
                    {/* Vertical timeline line */}
                    <div className="absolute left-[9px] top-2 bottom-2 w-px bg-gradient-to-b from-slate-200 to-transparent" />

                    <div className="flex flex-col gap-0.5">
                      {project.recentEntries.map((e, i) => (
                        <div key={e.id} className={`flex gap-3.5 items-start py-2 ${i < project.recentEntries.length - 1 ? 'border-b border-slate-50' : ''}`}>
                          {/* Timeline dot */}
                          <div className={`w-[18px] h-[18px] rounded-full shrink-0 flex items-center justify-center z-[1] relative ${
                            i === 0 ? 'bg-blue-700 border-2 border-blue-200' : 'bg-slate-100 border-2 border-slate-200'
                          }`}>
                            {i === 0 && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <p className="text-[13px] text-gray-700 leading-relaxed overflow-hidden text-ellipsis whitespace-nowrap">
                              {e.description || <span className="text-stone-400 italic">sem descrição</span>}
                            </p>
                            <p className="text-[11px] text-stone-400 mt-0.5">
                              {e.user_name ?? '—'}  ·  {fmtShortDate(e.started_at)}
                            </p>
                          </div>

                          {/* Duration pill */}
                          {e.duration_min && (
                            <div className="shrink-0 px-2 py-[3px] rounded-full bg-sky-50 border border-sky-200 text-[11px] font-bold text-sky-700 whitespace-nowrap">
                              {fmtMin(e.duration_min)}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="py-8 text-center">
                    <FileText className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                    <p className="text-[13px] text-stone-400">Nenhum lançamento registrado.</p>
                  </div>
                )}
              </div>

              {/* ══ FOOTER CTA ════════════════════════════════════════ */}
              <div className="p-4 px-6 bg-slate-50/60 border-t border-stone-300/20 flex flex-col gap-2">
                <button
                  onClick={handlePrint}
                  className="w-full py-2.5 px-4 bg-stone-900 text-white rounded-[10px] text-[13px] font-semibold flex items-center justify-center gap-2 border-none cursor-pointer transition-colors hover:bg-stone-800"
                >
                  <BarChart2 className="w-3.5 h-3.5" />
                  Ver relatório completo
                  <ArrowRight className="w-[13px] h-[13px]" />
                </button>

                <div className="flex gap-2">
                  <button
                    onClick={handleEdit}
                    className="flex-1 py-2 px-3.5 bg-white/40 text-stone-500 border border-stone-300/20 rounded-[10px] text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-colors hover:bg-white/60 hover:border-stone-300/40"
                  >
                    <Edit3 className="w-3 h-3" />
                    Editar Projeto
                  </button>
                  <button
                    onClick={handleNewEntry}
                    className="flex-1 py-2 px-3.5 bg-white/40 text-stone-500 border border-stone-300/20 rounded-[10px] text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-colors hover:bg-white/60 hover:border-stone-300/40"
                  >
                    <Timer className="w-3 h-3" />
                    Novo Lançamento
                  </button>
                </div>

                {/* Created at */}
                <p className="text-[11px] text-stone-400 text-center mt-0.5">
                  Criado em {fmtDate(project.created_at)}
                </p>
              </div>

            </div>
          )
        })()}
      </div>
    </>
  )
}

/* ─── Micro components ───────────────────────────────────────────── */
function ActionButton({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-[5px] px-2.5 py-[5px] rounded-[7px] bg-white/[0.08] border border-white/10 text-stone-400 text-[11px] font-semibold cursor-pointer transition-all hover:bg-white/[0.15] hover:text-stone-200"
    >
      {icon}
      {label}
    </button>
  )
}

function StatCard({ icon, value, label, accent }: {
  icon: React.ReactNode
  value: string
  label: string
  accent: string
}) {
  return (
    <div className="glass p-4 text-center flex flex-col items-center gap-1">
      <div className="w-8 h-8 rounded-lg mb-0.5 flex items-center justify-center" style={{ background: `${accent}15` }}>
        {icon}
      </div>
      <p className="text-xl font-extrabold text-gray-900 leading-none">{value}</p>
      <p className="text-[10px] text-stone-400 font-semibold uppercase tracking-[0.06em]">{label}</p>
    </div>
  )
}

function SectionLabel({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-1.5 mb-3.5">
      <div className="text-stone-500">{icon}</div>
      <p className="text-[11px] font-bold tracking-[0.12em] uppercase text-stone-500">
        {label}
      </p>
    </div>
  )
}
