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
    <div style={{ position: 'relative', width: 120, height: 120 }}>
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
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      }}>
        <span style={{ fontSize: 18, fontWeight: 800, lineHeight: 1, color: fillColor }}>{hours}h</span>
        <span style={{ fontSize: 10, color: '#9ca3af', marginTop: 2 }}>de {budget}h</span>
        <span style={{
          fontSize: 11, fontWeight: 700, color: fillColor,
          background: isOver ? '#fef2f2' : isAlert ? '#fffbeb' : '#eff6ff',
          padding: '1px 5px', borderRadius: 999, marginTop: 4,
        }}>{pct}%</span>
      </div>
    </div>
  )
}

/* ─── Stacked team bar ───────────────────────────────────────────── */
function TeamStackedBar({ team, totalMin }: { team: ProjectDetail['teamSummary']; totalMin: number }) {
  return (
    <div style={{ display: 'flex', height: 6, borderRadius: 999, overflow: 'hidden', background: '#f3f4f6', gap: 1 }}>
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

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const isVisible = loading || project !== null

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        style={{ background: 'rgba(15,23,42,0.35)', backdropFilter: 'blur(2px)' }}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        ref={panelRef}
        className={`fixed right-0 top-0 h-full z-50 flex flex-col transition-transform duration-300 ease-out ${isVisible ? 'translate-x-0' : 'translate-x-full'}`}
        style={{ width: 460, background: '#fafafa', boxShadow: '-4px 0 40px rgba(0,0,0,0.12)' }}
      >
        {/* ── Loading ── */}
        {loading && !project && (
          <div className="flex-1 flex items-center justify-center">
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
              <div style={{ display: 'flex', gap: 6 }}>
                {[0, 1, 2].map((i) => (
                  <div key={i} style={{
                    width: 8, height: 8, borderRadius: '50%', background: '#1d4ed8',
                    animation: 'bounce 1s infinite', animationDelay: `${i * 150}ms`,
                  }} />
                ))}
              </div>
              <p style={{ fontSize: 12, color: '#9ca3af' }}>Carregando dados...</p>
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
              <div style={{ background: '#0f172a', padding: '20px 24px 0', position: 'relative', flexShrink: 0 }}>
                {/* Status accent bar */}
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: s.accent }} />

                {/* Top row: label + actions */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                  <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.18em', color: '#475569', textTransform: 'uppercase' }}>
                    Painel do Projeto
                  </span>
                  <button
                    onClick={onClose}
                    style={{
                      width: 28, height: 28, borderRadius: '50%', border: 'none', cursor: 'pointer',
                      background: 'rgba(255,255,255,0.08)', color: '#94a3b8',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'all 0.15s',
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.15)'; (e.currentTarget as HTMLElement).style.color = '#fff' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.08)'; (e.currentTarget as HTMLElement).style.color = '#94a3b8' }}
                  >
                    <X style={{ width: 14, height: 14 }} />
                  </button>
                </div>

                {/* Project name */}
                <h2 style={{ fontSize: 20, fontWeight: 800, color: '#f8fafc', lineHeight: 1.2, marginBottom: 6 }}>
                  {project.name}
                </h2>

                {/* Client + Phase row */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                  {project.client_name && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#94a3b8' }}>
                      <Building2 style={{ width: 12, height: 12 }} />
                      <span style={{ fontSize: 13 }}>{project.client_name}</span>
                    </div>
                  )}
                  {project.phase_name && (
                    <>
                      <span style={{ color: '#334155', fontSize: 12 }}>·</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#64748b' }}>
                        <Layers style={{ width: 12, height: 12 }} />
                        <span style={{ fontSize: 13 }}>{project.phase_name}</span>
                      </div>
                    </>
                  )}
                </div>

                {/* Status badge + Action buttons */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingBottom: 20 }}>
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: 5,
                    padding: '4px 10px', borderRadius: 999,
                    background: s.bg, color: s.text,
                    fontSize: 11, fontWeight: 700,
                    border: `1px solid ${s.ring}`,
                  }}>
                    <StatusIcon style={{ width: 11, height: 11 }} />
                    {s.label}
                  </span>

                  <div style={{ flex: 1 }} />

                  <ActionButton icon={<Edit3 style={{ width: 11, height: 11 }} />} label="Editar" />
                  <ActionButton icon={<BarChart2 style={{ width: 11, height: 11 }} />} label="Relatório" />
                </div>
              </div>

              {/* ══ QUICK STATS ══════════════════════════════════════ */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 1, background: '#e2e8f0', borderBottom: '1px solid #e2e8f0' }}>
                <StatCard icon={<Clock style={{ width: 14, height: 14, color: '#1d4ed8' }} />}
                  value={`${totalHours}h`} label="Horas" bg="#fff" accent="#1d4ed8" />
                <StatCard icon={<FileText style={{ width: 14, height: 14, color: '#7c3aed' }} />}
                  value={project.recentEntries.length >= 8 ? '8+' : String(project.recentEntries.length)}
                  label="Lançamentos" bg="#fff" accent="#7c3aed" />
                <StatCard icon={<Users style={{ width: 14, height: 14, color: '#0891b2' }} />}
                  value={String(project.teamSummary.length)} label="Membros" bg="#fff" accent="#0891b2" />
              </div>

              {/* ══ BUDGET GAUGE ═════════════════════════════════════ */}
              <div style={{ background: '#fff', padding: '24px', borderBottom: '1px solid #f1f5f9' }}>
                <SectionLabel icon={<Zap style={{ width: 12, height: 12 }} />} label="Consumo de Horas" />

                {/* Alert banner */}
                {(isAlert || isOver) && budgetH > 0 && (
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '8px 12px', borderRadius: 8, marginBottom: 16,
                    background: isOver ? '#fef2f2' : '#fffbeb',
                    border: `1px solid ${isOver ? '#fca5a5' : '#fde68a'}`,
                    fontSize: 12, fontWeight: 600,
                    color: isOver ? '#dc2626' : '#d97706',
                  }}>
                    <AlertTriangle style={{ width: 13, height: 13, flexShrink: 0 }} />
                    {isOver
                      ? `Orçamento esgotado — ${pct}% consumido`
                      : `Alerta: ${pct}% consumido (limite ${project.alert_threshold}%)`}
                  </div>
                )}

                {budgetH > 0 ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                    {/* Gauge */}
                    <CircularGauge
                      pct={pct} isOver={isOver} isAlert={isAlert}
                      hours={totalHours} budget={budgetH}
                    />

                    {/* Right side info */}
                    <div style={{ flex: 1 }}>
                      <div style={{ marginBottom: 12 }}>
                        <p style={{ fontSize: 11, color: '#9ca3af', marginBottom: 2 }}>Horas utilizadas</p>
                        <p style={{ fontSize: 22, fontWeight: 800, color: isOver ? '#dc2626' : isAlert ? '#d97706' : '#111827', lineHeight: 1 }}>
                          {totalHours}h
                        </p>
                        <p style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>de {budgetH}h orçadas</p>
                      </div>

                      {remainingH !== null && remainingH > 0 && (
                        <div style={{
                          display: 'inline-flex', alignItems: 'center', gap: 6,
                          padding: '5px 10px', borderRadius: 8,
                          background: '#f0fdf4', border: '1px solid #bbf7d0',
                          fontSize: 12, fontWeight: 600, color: '#15803d',
                        }}>
                          <Clock style={{ width: 11, height: 11 }} />
                          {remainingH}h restantes
                        </div>
                      )}

                      {isOver && (
                        <div style={{
                          display: 'inline-flex', alignItems: 'center', gap: 6,
                          padding: '5px 10px', borderRadius: 8,
                          background: '#fef2f2', border: '1px solid #fca5a5',
                          fontSize: 12, fontWeight: 600, color: '#dc2626',
                        }}>
                          <AlertTriangle style={{ width: 11, height: 11 }} />
                          {Math.abs(remainingH ?? 0)}h excedido
                        </div>
                      )}

                      {project.budget_value && (
                        <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                          <Wallet style={{ width: 12, height: 12, color: '#9ca3af' }} />
                          <span style={{ fontSize: 12, color: '#6b7280' }}>Valor:</span>
                          <span style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>
                            R$ {project.budget_value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  /* No budget — just show hours */
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                    <span style={{ fontSize: 36, fontWeight: 800, color: '#111827', lineHeight: 1 }}>{totalHours}</span>
                    <span style={{ fontSize: 15, color: '#6b7280' }}>horas registradas</span>
                  </div>
                )}
              </div>

              {/* ══ DATES ════════════════════════════════════════════ */}
              {(project.start_date || project.deadline) && (
                <div style={{ background: '#fff', padding: '20px 24px', borderBottom: '1px solid #f1f5f9' }}>
                  <SectionLabel icon={<Calendar style={{ width: 12, height: 12 }} />} label="Cronograma" />
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    {project.start_date && (
                      <div style={{
                        padding: '12px 14px', borderRadius: 10,
                        background: '#f8fafc', border: '1px solid #e2e8f0',
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                          <CalendarCheck style={{ width: 12, height: 12, color: '#10b981' }} />
                          <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#6b7280' }}>Início</span>
                        </div>
                        <p style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>{fmtDate(project.start_date)}</p>
                      </div>
                    )}
                    {project.deadline && deadlineInfo && (
                      <div style={{
                        padding: '12px 14px', borderRadius: 10,
                        background: deadlineInfo.overdue ? '#fef2f2' : deadlineInfo.urgent ? '#fffbeb' : '#f8fafc',
                        border: `1px solid ${deadlineInfo.overdue ? '#fca5a5' : deadlineInfo.urgent ? '#fde68a' : '#e2e8f0'}`,
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                          <CalendarClock style={{
                            width: 12, height: 12,
                            color: deadlineInfo.overdue ? '#dc2626' : deadlineInfo.urgent ? '#d97706' : '#6b7280'
                          }} />
                          <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#6b7280' }}>Prazo</span>
                        </div>
                        <p style={{ fontSize: 13, fontWeight: 600, color: deadlineInfo.overdue ? '#dc2626' : deadlineInfo.urgent ? '#92400e' : '#111827' }}>
                          {fmtDate(project.deadline)}
                        </p>
                        <div style={{
                          marginTop: 5, display: 'inline-flex', alignItems: 'center',
                          padding: '2px 7px', borderRadius: 999,
                          background: deadlineInfo.overdue ? '#dc2626' : deadlineInfo.urgent ? '#f59e0b' : '#e2e8f0',
                          fontSize: 10, fontWeight: 700,
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
                <div style={{ background: '#fff', padding: '20px 24px', borderBottom: '1px solid #f1f5f9' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                    <SectionLabel icon={<Users style={{ width: 12, height: 12 }} />} label="Equipe" />
                    {/* Avatar stack */}
                    <div style={{ display: 'flex', gap: -4 }}>
                      {project.teamSummary.slice(0, 4).map((m, i) => (
                        <div key={m.user_id} style={{
                          width: 24, height: 24, borderRadius: '50%',
                          background: AVATAR_BG[i % AVATAR_BG.length],
                          color: AVATAR_FG[i % AVATAR_FG.length],
                          fontSize: 9, fontWeight: 800,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          border: '2px solid #fff',
                          marginLeft: i > 0 ? -6 : 0,
                          zIndex: project.teamSummary.length - i,
                          position: 'relative',
                        }}>
                          {initials(m.user_name)}
                        </div>
                      ))}
                      {project.teamSummary.length > 4 && (
                        <div style={{
                          width: 24, height: 24, borderRadius: '50%',
                          background: '#f1f5f9', color: '#64748b',
                          fontSize: 9, fontWeight: 700,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          border: '2px solid #fff', marginLeft: -6, position: 'relative',
                        }}>
                          +{project.teamSummary.length - 4}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Stacked distribution bar */}
                  <div style={{ marginBottom: 16 }}>
                    <TeamStackedBar team={project.teamSummary} totalMin={totalTeamMin} />
                    {/* Legend */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 12px', marginTop: 8 }}>
                      {project.teamSummary.map((m, i) => {
                        const pctMember = totalTeamMin > 0 ? Math.round((m.total_min / totalTeamMin) * 100) : 0
                        return (
                          <div key={m.user_id} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <div style={{ width: 8, height: 8, borderRadius: 2, background: BAR_HEX[i % BAR_HEX.length], flexShrink: 0 }} />
                            <span style={{ fontSize: 10, color: '#6b7280' }}>{m.user_name.split(' ')[0]} ({pctMember}%)</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Member list */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {project.teamSummary.map((m, idx) => {
                      const memberPct = totalTeamMin > 0 ? (m.total_min / totalTeamMin) * 100 : 0
                      return (
                        <div key={m.user_id} style={{
                          display: 'flex', alignItems: 'center', gap: 10,
                          padding: '8px 12px', borderRadius: 10,
                          background: '#f8fafc', border: '1px solid #f1f5f9',
                        }}>
                          {/* Avatar */}
                          <div style={{
                            width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                            background: AVATAR_BG[idx % AVATAR_BG.length],
                            color: AVATAR_FG[idx % AVATAR_FG.length],
                            fontSize: 11, fontWeight: 800,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}>
                            {initials(m.user_name)}
                          </div>
                          {/* Info */}
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ fontSize: 13, fontWeight: 600, color: '#111827', marginBottom: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {m.user_name}
                            </p>
                            {/* Mini progress bar */}
                            <div style={{ height: 3, background: '#e2e8f0', borderRadius: 999, overflow: 'hidden' }}>
                              <div style={{
                                height: '100%', borderRadius: 999,
                                background: BAR_HEX[idx % BAR_HEX.length],
                                width: `${memberPct}%`,
                                transition: 'width 0.6s ease',
                              }} />
                            </div>
                          </div>
                          {/* Hours + % */}
                          <div style={{ textAlign: 'right', flexShrink: 0 }}>
                            <p style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>{fmtMin(m.total_min)}</p>
                            <p style={{ fontSize: 10, color: '#9ca3af' }}>{Math.round(memberPct)}%</p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* ══ RECENT ENTRIES ════════════════════════════════════ */}
              <div style={{ background: '#fff', padding: '20px 24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                  <SectionLabel icon={<Timer style={{ width: 12, height: 12 }} />} label="Últimos Lançamentos" />
                  {project.recentEntries.length > 0 && (
                    <span style={{ fontSize: 11, color: '#9ca3af' }}>
                      {project.recentEntries.length >= 8 ? 'Últimos 8' : `${project.recentEntries.length} total`}
                    </span>
                  )}
                </div>

                {project.recentEntries.length > 0 ? (
                  <div style={{ position: 'relative' }}>
                    {/* Vertical timeline line */}
                    <div style={{
                      position: 'absolute', left: 9, top: 8, bottom: 8, width: 1,
                      background: 'linear-gradient(to bottom, #e2e8f0, transparent)',
                    }} />

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      {project.recentEntries.map((e, i) => (
                        <div key={e.id} style={{
                          display: 'flex', gap: 14, alignItems: 'flex-start',
                          padding: '8px 0',
                          borderBottom: i < project.recentEntries.length - 1 ? '1px solid #f8fafc' : 'none',
                        }}>
                          {/* Timeline dot */}
                          <div style={{
                            width: 18, height: 18, borderRadius: '50%', flexShrink: 0,
                            background: i === 0 ? '#1d4ed8' : '#f1f5f9',
                            border: `2px solid ${i === 0 ? '#bfdbfe' : '#e2e8f0'}`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            zIndex: 1, position: 'relative',
                          }}>
                            {i === 0 && <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#fff' }} />}
                          </div>

                          {/* Content */}
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{
                              fontSize: 13, color: '#374151', lineHeight: 1.4,
                              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                            }}>
                              {e.description || <span style={{ color: '#9ca3af', fontStyle: 'italic' }}>sem descrição</span>}
                            </p>
                            <p style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>
                              {e.user_name ?? '—'}  ·  {fmtShortDate(e.started_at)}
                            </p>
                          </div>

                          {/* Duration pill */}
                          {e.duration_min && (
                            <div style={{
                              flexShrink: 0, padding: '3px 8px', borderRadius: 999,
                              background: '#f0f9ff', border: '1px solid #bae6fd',
                              fontSize: 11, fontWeight: 700, color: '#0369a1',
                              whiteSpace: 'nowrap',
                            }}>
                              {fmtMin(e.duration_min)}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div style={{ padding: '32px 0', textAlign: 'center' }}>
                    <FileText style={{ width: 32, height: 32, color: '#e2e8f0', margin: '0 auto 8px' }} />
                    <p style={{ fontSize: 13, color: '#9ca3af' }}>Nenhum lançamento registrado.</p>
                  </div>
                )}
              </div>

              {/* ══ FOOTER CTA ════════════════════════════════════════ */}
              <div style={{
                padding: '16px 24px', background: '#f8fafc',
                borderTop: '1px solid #e2e8f0',
                display: 'flex', flexDirection: 'column', gap: 8,
              }}>
                <button
                  style={{
                    width: '100%', padding: '10px 16px',
                    background: '#0f172a', color: '#fff',
                    border: 'none', borderRadius: 10, cursor: 'pointer',
                    fontSize: 13, fontWeight: 600,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#1e293b')}
                  onMouseLeave={e => (e.currentTarget.style.background = '#0f172a')}
                >
                  <BarChart2 style={{ width: 14, height: 14 }} />
                  Ver relatório completo
                  <ArrowRight style={{ width: 13, height: 13 }} />
                </button>

                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    style={{
                      flex: 1, padding: '8px 14px',
                      background: '#fff', color: '#374151',
                      border: '1px solid #e2e8f0', borderRadius: 10, cursor: 'pointer',
                      fontSize: 12, fontWeight: 600,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                      transition: 'all 0.15s',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.borderColor = '#cbd5e1')}
                    onMouseLeave={e => (e.currentTarget.style.borderColor = '#e2e8f0')}
                  >
                    <Edit3 style={{ width: 12, height: 12 }} />
                    Editar Projeto
                  </button>
                  <button
                    style={{
                      flex: 1, padding: '8px 14px',
                      background: '#fff', color: '#374151',
                      border: '1px solid #e2e8f0', borderRadius: 10, cursor: 'pointer',
                      fontSize: 12, fontWeight: 600,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                      transition: 'all 0.15s',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.borderColor = '#cbd5e1')}
                    onMouseLeave={e => (e.currentTarget.style.borderColor = '#e2e8f0')}
                  >
                    <Timer style={{ width: 12, height: 12 }} />
                    Novo Lançamento
                  </button>
                </div>

                {/* Created at */}
                <p style={{ fontSize: 11, color: '#9ca3af', textAlign: 'center', marginTop: 2 }}>
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
function ActionButton({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <button
      style={{
        display: 'flex', alignItems: 'center', gap: 5,
        padding: '5px 10px', borderRadius: 7,
        background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)',
        color: '#94a3b8', fontSize: 11, fontWeight: 600, cursor: 'pointer',
        transition: 'all 0.15s',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.background = 'rgba(255,255,255,0.15)'
        e.currentTarget.style.color = '#e2e8f0'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = 'rgba(255,255,255,0.08)'
        e.currentTarget.style.color = '#94a3b8'
      }}
    >
      {icon}
      {label}
    </button>
  )
}

function StatCard({ icon, value, label, bg, accent }: {
  icon: React.ReactNode
  value: string
  label: string
  bg: string
  accent: string
}) {
  return (
    <div style={{
      background: bg, padding: '16px 12px', textAlign: 'center',
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
    }}>
      <div style={{
        width: 32, height: 32, borderRadius: 8, marginBottom: 2,
        background: `${accent}15`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {icon}
      </div>
      <p style={{ fontSize: 20, fontWeight: 800, color: '#111827', lineHeight: 1 }}>{value}</p>
      <p style={{ fontSize: 10, color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</p>
    </div>
  )
}

function SectionLabel({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 14 }}>
      <div style={{ color: '#6b7280' }}>{icon}</div>
      <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#6b7280' }}>
        {label}
      </p>
    </div>
  )
}
