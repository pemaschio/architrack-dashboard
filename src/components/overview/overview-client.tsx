'use client'

import { useState, useTransition, useCallback } from 'react'
import { TimeEntriesTable } from './time-entries-table'
import { NewEntryDialog } from '@/components/shared/new-entry-dialog'
import { ProjectDetailPanel } from '@/components/shared/project-detail-panel'
import { fetchProjectDetail, type ProjectDetail } from '@/app/actions/details'
import { projectColor } from '@/lib/project-colors'
import { Plus, Wallet, AlertTriangle, Clock, PieChart } from 'lucide-react'

interface TimeEntry {
  id: string
  duration_min: number | null
  started_at: string
  description: string | null
  source: string
  users: { name: string } | null
  projects: { name: string } | null
  activity_types: { name: string } | null
}

export interface ProjectStat {
  id: string
  name: string
  client_name: string | null
  budget_hours: number | null
  budget_value: number | null
  alert_threshold: number
  total_minutes: number
}

interface Props {
  entries: TimeEntry[]
  projectsWithStats: ProjectStat[]
}

/* ─── Donut SVG ──────────────────────────────────────────────────── */
function ProjectDonut({
  pct, color, isOver, isAlert, totalHours, budgetH, loading,
}: {
  pct: number
  color: string
  isOver: boolean
  isAlert: boolean
  totalHours: number
  budgetH: number | null
  loading?: boolean
}) {
  const r = 44
  const stroke = 8
  const circ = 2 * Math.PI * r
  const hasBudget = budgetH !== null && budgetH > 0
  const clampedPct = Math.min(pct, 100)
  const dash = (clampedPct / 100) * circ
  const fillColor = isOver ? '#ef4444' : isAlert ? '#f59e0b' : color

  return (
    <div style={{ position: 'relative', width: 108, height: 108, flexShrink: 0 }}>
      <svg width="108" height="108" viewBox="0 0 108 108">
        {/* Shadow / depth ring */}
        <circle cx="54" cy="54" r={r + 4} fill="none" stroke={color} strokeWidth="1" strokeOpacity="0.07" />
        {/* Track */}
        <circle cx="54" cy="54" r={r} fill="none" stroke="#f1f5f9" strokeWidth={stroke} />
        {/* Progress arc */}
        {hasBudget ? (
          <circle
            cx="54" cy="54" r={r}
            fill="none"
            stroke={fillColor}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={`${dash} ${circ}`}
            transform="rotate(-90 54 54)"
            style={{ transition: 'stroke-dasharray 1s cubic-bezier(0.4,0,0.2,1)' }}
          />
        ) : (
          /* No budget: solid tinted ring */
          <circle
            cx="54" cy="54" r={r}
            fill="none"
            stroke={color}
            strokeWidth={stroke}
            strokeOpacity="0.55"
          />
        )}
        {/* Overbudget overflow indicator */}
        {isOver && (
          <circle
            cx="54" cy="54" r={r - stroke - 2}
            fill="none"
            stroke="#ef4444"
            strokeWidth="1.5"
            strokeOpacity="0.20"
            strokeDasharray="3 4"
          />
        )}
      </svg>

      {/* Center content */}
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        pointerEvents: 'none',
      }}>
        {loading ? (
          <div style={{ width: 16, height: 16, borderRadius: '50%', border: `2px solid ${color}`, borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }} />
        ) : hasBudget ? (
          <>
            <span style={{ fontSize: 17, fontWeight: 800, color: fillColor, lineHeight: 1, letterSpacing: '-0.02em' }}>
              {clampedPct}%
            </span>
            <span style={{ fontSize: 9, color: '#9ca3af', marginTop: 3, fontWeight: 500 }}>
              {totalHours}h de {budgetH}h
            </span>
          </>
        ) : (
          <>
            <span style={{ fontSize: 17, fontWeight: 800, color: color, lineHeight: 1, letterSpacing: '-0.02em' }}>
              {totalHours}h
            </span>
            <span style={{ fontSize: 9, color: '#9ca3af', marginTop: 3 }}>registradas</span>
          </>
        )}
      </div>
    </div>
  )
}

/* ─── Project donut card ─────────────────────────────────────────── */
function ProjectDonutCard({ project, onClick, isActive, loading }: {
  project: ProjectStat
  onClick: () => void
  isActive: boolean
  loading: boolean
}) {
  const color = projectColor(project.name)
  const totalHours = Math.round((project.total_minutes / 60) * 10) / 10
  const budgetH = project.budget_hours ?? null
  const hasBudget = budgetH !== null && budgetH > 0
  const pct = hasBudget ? Math.min(Math.round((totalHours / budgetH!) * 100), 100) : 0
  const isAlert = hasBudget && totalHours >= budgetH! * (project.alert_threshold / 100)
  const isOver = hasBudget && totalHours >= budgetH!

  const accentBorder = isActive ? `2px solid ${color}` : '1px solid rgba(10,10,11,0.06)'
  const cardShadow = isActive
    ? `0 0 0 3px ${color}22, 0 8px 24px rgba(0,0,0,0.10)`
    : '0 1px 4px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.05)'

  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}
      aria-pressed={isActive}
      style={{
        background: '#fff',
        borderRadius: 14,
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'box-shadow 0.2s ease, transform 0.18s ease',
        boxShadow: cardShadow,
        border: accentBorder,
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        userSelect: 'none',
      }}
      onMouseEnter={(e) => {
        if (!isActive) {
          (e.currentTarget as HTMLDivElement).style.boxShadow = '0 6px 20px rgba(0,0,0,0.10), 0 0 0 1px rgba(0,0,0,0.07)'
          ;(e.currentTarget as HTMLDivElement).style.transform = 'translateY(-3px)'
        }
      }}
      onMouseLeave={(e) => {
        if (!isActive) {
          (e.currentTarget as HTMLDivElement).style.boxShadow = '0 1px 4px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.05)'
          ;(e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)'
        }
      }}
    >
      {/* Accent bar */}
      <div style={{ height: 3, background: color, flexShrink: 0 }} />

      <div style={{ padding: '14px 16px 16px', flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>

        {/* Project name + alert badge */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 6 }}>
          <div style={{ minWidth: 0, flex: 1 }}>
            <p style={{
              fontSize: 13, fontWeight: 700, color: '#0A0A0B', margin: 0,
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              letterSpacing: '-0.01em',
            }}>
              {project.name}
            </p>
            {project.client_name && (
              <p style={{ fontSize: 10, color: 'rgba(10,10,11,0.38)', margin: '2px 0 0', fontWeight: 500 }}>
                {project.client_name}
              </p>
            )}
          </div>

          {isOver && (
            <div style={{
              flexShrink: 0, display: 'flex', alignItems: 'center', gap: 3,
              padding: '2px 6px', borderRadius: 999,
              background: '#fef2f2', border: '1px solid #fca5a5',
              fontSize: 9, fontWeight: 700, color: '#dc2626',
            }}>
              <AlertTriangle style={{ width: 8, height: 8 }} />
              EXTRA
            </div>
          )}
          {!isOver && isAlert && (
            <div style={{
              flexShrink: 0, display: 'flex', alignItems: 'center', gap: 3,
              padding: '2px 6px', borderRadius: 999,
              background: '#fffbeb', border: '1px solid #fde68a',
              fontSize: 9, fontWeight: 700, color: '#d97706',
            }}>
              <AlertTriangle style={{ width: 8, height: 8 }} />
              ALERTA
            </div>
          )}
        </div>

        {/* Donut */}
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <ProjectDonut
            pct={pct}
            color={color}
            isOver={isOver}
            isAlert={isAlert}
            totalHours={totalHours}
            budgetH={budgetH}
            loading={loading}
          />
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5, borderTop: '1px solid rgba(10,10,11,0.05)', paddingTop: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <Clock style={{ width: 10, height: 10, color: '#9ca3af', flexShrink: 0 }} />
              <span style={{ fontSize: 10, color: '#9ca3af', fontWeight: 500 }}>Horas</span>
            </div>
            <span style={{
              fontSize: 12, fontWeight: 700,
              color: isOver ? '#ef4444' : isAlert ? '#d97706' : '#0A0A0B',
              fontVariantNumeric: 'tabular-nums',
            }}>
              {totalHours}h{hasBudget ? ` / ${budgetH}h` : ''}
            </span>
          </div>

          {project.budget_value != null && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <Wallet style={{ width: 10, height: 10, color: '#9ca3af', flexShrink: 0 }} />
                <span style={{ fontSize: 10, color: '#9ca3af', fontWeight: 500 }}>Valor</span>
              </div>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#0A0A0B' }}>
                {project.budget_value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/* ─── Main client ────────────────────────────────────────────────── */
export function OverviewClient({ entries, projectsWithStats }: Props) {
  const [entryDialogOpen, setEntryDialogOpen] = useState(false)
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null)
  const [panelProject, setPanelProject] = useState<ProjectDetail | null>(null)
  const [isPending, startTransition] = useTransition()

  const handleDonutClick = useCallback((projectId: string) => {
    // Toggle: clicking the active project closes the panel
    if (activeProjectId === projectId) {
      setActiveProjectId(null)
      setPanelProject(null)
      return
    }

    setActiveProjectId(projectId)
    setPanelProject(null)
    startTransition(async () => {
      const detail = await fetchProjectDetail(projectId)
      setPanelProject(detail)
    })
  }, [activeProjectId])

  const handlePanelClose = useCallback(() => {
    setPanelProject(null)
    setActiveProjectId(null)
  }, [])

  return (
    <>
      {/* Action bar */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: -8 }}>
        <button
          onClick={() => setEntryDialogOpen(true)}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '8px 16px', borderRadius: 9,
            background: '#1d4ed8', color: '#fff',
            border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600,
            boxShadow: '0 2px 8px rgba(29,78,216,0.30)',
            transition: 'all 0.15s',
          }}
          onMouseEnter={e => (e.currentTarget.style.background = '#1e40af')}
          onMouseLeave={e => (e.currentTarget.style.background = '#1d4ed8')}
        >
          <Plus style={{ width: 14, height: 14 }} />
          Novo Lançamento
        </button>
      </div>

      {/* ── Hero: Project Donut Grid ── */}
      {projectsWithStats.length > 0 ? (
        <div style={{
          background: '#fff',
          borderRadius: 14,
          padding: '20px 22px 22px',
          boxShadow: '0 1px 4px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.05)',
        }}>
          {/* Section header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
            <div style={{
              width: 30, height: 30, borderRadius: 8,
              background: 'rgba(181,97,74,0.10)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <PieChart style={{ width: 15, height: 15, color: '#B5614A' }} />
            </div>
            <div>
              <h2 style={{ fontSize: 14, fontWeight: 700, color: '#0A0A0B', margin: 0, letterSpacing: '-0.01em' }}>
                Projetos ativos
              </h2>
              <p style={{ fontSize: 11, color: 'rgba(10,10,11,0.40)', margin: '2px 0 0' }}>
                Clique em um projeto para ver detalhes completos
              </p>
            </div>
            <div style={{ marginLeft: 'auto' }}>
              <span style={{
                fontSize: 10, fontWeight: 700, color: 'rgba(10,10,11,0.38)',
                padding: '3px 8px', background: 'rgba(10,10,11,0.04)', borderRadius: 999,
                letterSpacing: '0.06em', textTransform: 'uppercase',
              }}>
                {projectsWithStats.length} projeto{projectsWithStats.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>

          {/* Donut grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))',
            gap: 12,
          }}>
            {projectsWithStats.map((project) => (
              <ProjectDonutCard
                key={project.id}
                project={project}
                onClick={() => handleDonutClick(project.id)}
                isActive={activeProjectId === project.id}
                loading={isPending && activeProjectId === project.id}
              />
            ))}
          </div>
        </div>
      ) : (
        <div style={{
          background: '#fff',
          borderRadius: 14,
          padding: '40px 22px',
          boxShadow: '0 1px 4px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.05)',
          textAlign: 'center',
        }}>
          <PieChart style={{ width: 32, height: 32, color: '#e2e8f0', margin: '0 auto 10px' }} />
          <p style={{ fontSize: 13, color: 'rgba(10,10,11,0.32)' }}>Nenhum projeto ativo encontrado.</p>
        </div>
      )}

      {/* Recent entries table */}
      <div>
        <TimeEntriesTable entries={entries} filterProject={null} onClearFilter={() => {}} />
      </div>

      {/* Dialogs / Panels */}
      <NewEntryDialog open={entryDialogOpen} onClose={() => setEntryDialogOpen(false)} />

      <ProjectDetailPanel
        project={panelProject}
        loading={isPending && activeProjectId !== null}
        onClose={handlePanelClose}
      />

      {/* Spin keyframe for loading state */}
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </>
  )
}
