'use client'

import { useState, useTransition, useCallback } from 'react'
import { fetchProjectDetail, type ProjectDetail } from '@/app/actions/details'
import { ProjectDetailPanel } from '@/components/shared/project-detail-panel'
import { projectColor } from '@/lib/project-colors'
import { Activity, PauseCircle, CheckCircle2, XCircle, ChevronRight, AlertTriangle } from 'lucide-react'

type ProjectStatus = 'active' | 'paused' | 'completed' | 'cancelled'

const statusConfig: Record<ProjectStatus, {
  label: string
  color: string
  bg: string
  Icon: React.ElementType
}> = {
  active:    { label: 'Ativo',     color: '#15803d', bg: '#dcfce7', Icon: Activity },
  paused:    { label: 'Pausado',   color: '#b45309', bg: '#fef3c7', Icon: PauseCircle },
  completed: { label: 'Concluído', color: '#1d4ed8', bg: '#dbeafe', Icon: CheckCircle2 },
  cancelled: { label: 'Cancelado', color: '#dc2626', bg: '#fee2e2', Icon: XCircle },
}

interface Project {
  id: string
  name: string
  client_name: string | null
  status: ProjectStatus
  budget_hours: number | null
  alert_threshold: number
  total_hours: number
  percentage: number | null
  project_phases: { name: string } | null
}

interface Props {
  projects: Project[]
}

export function ProjectsTable({ projects }: Props) {
  const [selectedProject, setSelectedProject] = useState<ProjectDetail | null>(null)
  const [isPending, startTransition] = useTransition()
  const [activeId, setActiveId] = useState<string | null>(null)

  const handleRowClick = useCallback((projectId: string) => {
    setActiveId(projectId)
    setSelectedProject(null)
    startTransition(async () => {
      const detail = await fetchProjectDetail(projectId)
      setSelectedProject(detail)
    })
  }, [])

  const handleClose = useCallback(() => {
    setSelectedProject(null)
    setActiveId(null)
  }, [])

  return (
    <>
      <div className="glass overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-stone-300/15 bg-white/[0.03]">
                <th className="text-label text-left px-4 py-2.5 whitespace-nowrap w-8 pr-0" />
                <th className="text-label text-left px-4 py-2.5 whitespace-nowrap">Projeto</th>
                <th className="text-label text-left px-4 py-2.5 whitespace-nowrap">Cliente</th>
                <th className="text-label text-left px-4 py-2.5 whitespace-nowrap">Etapa</th>
                <th className="text-label text-left px-4 py-2.5 whitespace-nowrap">Status</th>
                <th className="text-label text-left px-4 py-2.5 whitespace-nowrap">Horas</th>
                <th className="text-label text-left px-4 py-2.5 whitespace-nowrap">Orçado</th>
                <th className="text-label text-left px-4 py-2.5 whitespace-nowrap">Uso</th>
                <th className="text-label text-left px-4 py-2.5 whitespace-nowrap w-8" />
              </tr>
            </thead>
            <tbody>
              {projects.map((project) => {
                const s = statusConfig[project.status] ?? statusConfig.active
                const StatusIcon = s.Icon
                const isOverAlert = project.percentage !== null && project.percentage >= project.alert_threshold
                const isOver = project.percentage !== null && project.percentage >= 100
                const dot = projectColor(project.name)
                const isActive = activeId === project.id

                return (
                  <tr
                    key={project.id}
                    onClick={() => handleRowClick(project.id)}
                    className="border-b border-stone-300/[0.12] transition-colors hover:bg-white/30 cursor-pointer"
                    style={{
                      borderLeft: isActive ? `3px solid ${dot}` : '3px solid transparent',
                      background: isActive ? 'rgba(10,10,11,0.03)' : undefined,
                    }}
                  >
                    {/* Color dot */}
                    <td className="py-3 pl-4 pr-1 w-7">
                      <div
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ background: dot }}
                      />
                    </td>

                    {/* Name */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <p className="text-[13px] font-semibold text-stone-900 m-0">
                        {project.name}
                      </p>
                    </td>

                    {/* Client */}
                    <td className="px-4 py-3 text-[13px] text-stone-500">
                      {project.client_name || '—'}
                    </td>

                    {/* Phase */}
                    <td className="px-4 py-3">
                      {project.project_phases?.name ? (
                        <span className="inline-block px-2 py-0.5 rounded-full bg-stone-300/15 text-[11px] font-semibold text-stone-500 whitespace-nowrap">
                          {project.project_phases.name}
                        </span>
                      ) : (
                        <span className="text-[13px] text-stone-300">—</span>
                      )}
                    </td>

                    {/* Status badge */}
                    <td className="px-4 py-3">
                      <div
                        className="inline-flex items-center gap-[5px] px-2 py-[3px] rounded-full text-[11px] font-bold whitespace-nowrap"
                        style={{ background: s.bg, color: s.color }}
                      >
                        <StatusIcon className="w-[10px] h-[10px]" />
                        {s.label}
                      </div>
                    </td>

                    {/* Hours */}
                    <td className="px-4 py-3 text-[13px] font-semibold text-stone-900 tabular-nums whitespace-nowrap">
                      {project.total_hours}h
                    </td>

                    {/* Budget */}
                    <td className="px-4 py-3 text-[13px] text-stone-400 tabular-nums">
                      {project.budget_hours ? `${project.budget_hours}h` : '—'}
                    </td>

                    {/* Usage: bar + % */}
                    <td className="px-4 py-3 min-w-[120px]">
                      {project.percentage !== null ? (
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span
                              className="text-xs tabular-nums"
                              style={{
                                fontWeight: isOverAlert ? 700 : 500,
                                color: isOver ? '#dc2626' : isOverAlert ? '#d97706' : 'rgba(10,10,11,0.55)',
                              }}
                            >
                              {project.percentage}%
                            </span>
                            {isOver && <AlertTriangle className="w-[10px] h-[10px] text-red-600" />}
                          </div>
                          <div className="w-full h-[5px] rounded bg-stone-300/15 overflow-hidden">
                            <div
                              className="h-full rounded transition-[width] duration-400 ease-out"
                              style={{
                                width: `${Math.min(project.percentage, 100)}%`,
                                background: isOver ? '#ef4444' : isOverAlert ? '#f59e0b' : dot,
                              }}
                            />
                          </div>
                        </div>
                      ) : (
                        <span className="text-stone-300 text-[13px]">—</span>
                      )}
                    </td>

                    {/* Arrow indicator */}
                    <td className="py-3 pr-3 pl-1">
                      <ChevronRight
                        className="w-3.5 h-3.5"
                        style={{ color: isActive ? dot : 'rgba(10,10,11,0.18)' }}
                      />
                    </td>
                  </tr>
                )
              })}

              {projects.length === 0 && (
                <tr>
                  <td colSpan={9} className="py-12 px-5 text-center text-[13px] text-stone-300">
                    Nenhum projeto encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ProjectDetailPanel
        project={selectedProject}
        loading={isPending}
        onClose={handleClose}
      />
    </>
  )
}
