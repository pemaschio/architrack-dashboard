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
    <div className="relative w-[108px] h-[108px] shrink-0">
      <svg width="108" height="108" viewBox="0 0 108 108">
        {/* Shadow / depth ring */}
        <circle cx="54" cy="54" r={r + 4} fill="none" stroke={color} strokeWidth="1" strokeOpacity="0.07" />
        {/* Track */}
        <circle cx="54" cy="54" r={r} fill="none" stroke="rgba(168,162,158,0.15)" strokeWidth={stroke} />
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
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        {loading ? (
          <div className="w-4 h-4 rounded-full animate-spin" style={{ border: `2px solid ${color}`, borderTopColor: 'transparent' }} />
        ) : hasBudget ? (
          <>
            <span className="text-[17px] font-extrabold leading-none tracking-tight" style={{ color: fillColor }}>
              {clampedPct}%
            </span>
            <span className="text-[9px] text-stone-400 mt-[3px] font-medium">
              {totalHours}h de {budgetH}h
            </span>
          </>
        ) : (
          <>
            <span className="text-[17px] font-extrabold leading-none tracking-tight" style={{ color }}>
              {totalHours}h
            </span>
            <span className="text-[9px] text-stone-400 mt-[3px]">registradas</span>
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

  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}
      aria-pressed={isActive}
      className="glass glass-hover overflow-hidden cursor-pointer transition-all hover:-translate-y-[2px] flex flex-col relative select-none"
      style={isActive ? {
        border: `2px solid ${color}`,
        boxShadow: `0 0 0 3px ${color}22`,
      } : undefined}
    >
      {/* Accent bar */}
      <div className="h-[3px] shrink-0" style={{ background: color }} />

      <div className="px-4 pt-3.5 pb-4 flex-1 flex flex-col gap-3">

        {/* Project name + alert badge */}
        <div className="flex items-start justify-between gap-1.5">
          <div className="min-w-0 flex-1">
            <p className="text-[13px] font-bold text-stone-900 overflow-hidden text-ellipsis whitespace-nowrap m-0 tracking-tight">
              {project.name}
            </p>
            {project.client_name && (
              <p className="text-[10px] text-stone-400 font-medium mt-0.5 m-0">
                {project.client_name}
              </p>
            )}
          </div>

          {isOver && (
            <div className="shrink-0 flex items-center gap-[3px] px-1.5 py-0.5 rounded-full bg-red-50 border border-red-300 text-[9px] font-bold text-red-600">
              <AlertTriangle className="w-2 h-2" />
              EXTRA
            </div>
          )}
          {!isOver && isAlert && (
            <div className="shrink-0 flex items-center gap-[3px] px-1.5 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-[9px] font-bold text-amber-600">
              <AlertTriangle className="w-2 h-2" />
              ALERTA
            </div>
          )}
        </div>

        {/* Donut */}
        <div className="flex justify-center">
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
        <div className="flex flex-col gap-[5px] border-t border-stone-300/15 pt-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <Clock className="w-2.5 h-2.5 text-stone-400 shrink-0" />
              <span className="text-[10px] text-stone-400 font-medium">Horas</span>
            </div>
            <span className={`text-xs font-bold tabular-nums ${
              isOver ? 'text-red-500' : isAlert ? 'text-amber-600' : 'text-stone-900'
            }`}>
              {totalHours}h{hasBudget ? ` / ${budgetH}h` : ''}
            </span>
          </div>

          {project.budget_value != null && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <Wallet className="w-2.5 h-2.5 text-stone-400 shrink-0" />
                <span className="text-[10px] text-stone-400 font-medium">Valor</span>
              </div>
              <span className="text-xs font-bold text-stone-900">
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
      <div className="flex justify-end -mt-2">
        <button
          onClick={() => setEntryDialogOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-[9px] bg-stone-900 text-white text-[13px] font-semibold transition-colors hover:bg-[#292524] border-none cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          Novo Lançamento
        </button>
      </div>

      {/* ── Hero: Project Donut Grid ── */}
      {projectsWithStats.length > 0 ? (
        <div className="glass p-5">
          {/* Section header */}
          <div className="flex items-center gap-2.5 mb-[18px]">
            <div className="w-[30px] h-[30px] rounded-lg bg-terra-subtle flex items-center justify-center">
              <PieChart className="w-[15px] h-[15px] text-[#B5614A]" />
            </div>
            <div>
              <h2 className="text-section-title">
                Projetos ativos
              </h2>
              <p className="text-[11px] text-stone-900/40 mt-0.5 m-0">
                Clique em um projeto para ver detalhes completos
              </p>
            </div>
            <div className="ml-auto">
              <span className="text-[10px] font-bold text-stone-900/[0.38] px-2 py-[3px] bg-stone-900/[0.04] rounded-full tracking-wider uppercase">
                {projectsWithStats.length} projeto{projectsWithStats.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>

          {/* Donut grid */}
          <div className="grid grid-cols-[repeat(auto-fill,minmax(170px,1fr))] gap-3">
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
        <div className="glass p-10 text-center">
          <PieChart className="w-8 h-8 text-stone-300 mx-auto mb-2.5" />
          <p className="text-[13px] text-stone-900/[0.32]">Nenhum projeto ativo encontrado.</p>
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
    </>
  )
}
