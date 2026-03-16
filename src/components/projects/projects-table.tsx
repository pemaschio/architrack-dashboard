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

const TH: React.CSSProperties = {
  fontSize: 10, fontWeight: 600, letterSpacing: '0.08em',
  textTransform: 'uppercase', color: 'rgba(10,10,11,0.38)',
  textAlign: 'left', padding: '10px 16px', whiteSpace: 'nowrap',
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
      <div style={{
        background: '#ffffff', borderRadius: 12,
        boxShadow: '0 1px 4px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.05)',
        overflow: 'hidden',
      }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(10,10,11,0.06)', background: 'rgba(10,10,11,0.015)' }}>
                <th style={{ ...TH, width: 32, paddingRight: 0 }} />
                <th style={TH}>Projeto</th>
                <th style={TH}>Cliente</th>
                <th style={TH}>Etapa</th>
                <th style={TH}>Status</th>
                <th style={TH}>Horas</th>
                <th style={TH}>Orçado</th>
                <th style={TH}>Uso</th>
                <th style={{ ...TH, width: 32 }} />
              </tr>
            </thead>
            <tbody>
              {projects.map((project, idx) => {
                const s = statusConfig[project.status] ?? statusConfig.active
                const StatusIcon = s.Icon
                const isOverAlert = project.percentage !== null && project.percentage >= project.alert_threshold
                const isOver = project.percentage !== null && project.percentage >= 100
                const dot = projectColor(project.name)
                const isLast = idx === projects.length - 1
                const isActive = activeId === project.id

                return (
                  <tr
                    key={project.id}
                    onClick={() => handleRowClick(project.id)}
                    style={{
                      borderBottom: isLast ? 'none' : '1px solid rgba(10,10,11,0.04)',
                      cursor: 'pointer',
                      background: isActive ? 'rgba(10,10,11,0.03)' : 'transparent',
                      transition: 'background 0.1s ease',
                      borderLeft: isActive ? `3px solid ${dot}` : '3px solid transparent',
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive)
                        (e.currentTarget as HTMLTableRowElement).style.background = 'rgba(10,10,11,0.02)'
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive)
                        (e.currentTarget as HTMLTableRowElement).style.background = 'transparent'
                    }}
                  >
                    {/* Color dot */}
                    <td style={{ padding: '12px 4px 12px 16px', width: 28 }}>
                      <div style={{
                        width: 8, height: 8, borderRadius: '50%',
                        background: dot, flexShrink: 0,
                      }} />
                    </td>

                    {/* Name */}
                    <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: '#0A0A0B', margin: 0 }}>
                        {project.name}
                      </p>
                    </td>

                    {/* Client */}
                    <td style={{ padding: '12px 16px', fontSize: 13, color: 'rgba(10,10,11,0.52)' }}>
                      {project.client_name || '—'}
                    </td>

                    {/* Phase */}
                    <td style={{ padding: '12px 16px' }}>
                      {project.project_phases?.name ? (
                        <span style={{
                          display: 'inline-block',
                          padding: '2px 8px', borderRadius: 999,
                          background: 'rgba(10,10,11,0.05)',
                          fontSize: 11, fontWeight: 600, color: 'rgba(10,10,11,0.55)',
                          whiteSpace: 'nowrap',
                        }}>
                          {project.project_phases.name}
                        </span>
                      ) : (
                        <span style={{ fontSize: 13, color: 'rgba(10,10,11,0.28)' }}>—</span>
                      )}
                    </td>

                    {/* Status badge */}
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{
                        display: 'inline-flex', alignItems: 'center', gap: 5,
                        padding: '3px 8px', borderRadius: 999,
                        background: s.bg, fontSize: 11, fontWeight: 700, color: s.color,
                        whiteSpace: 'nowrap',
                      }}>
                        <StatusIcon style={{ width: 10, height: 10 }} />
                        {s.label}
                      </div>
                    </td>

                    {/* Hours */}
                    <td style={{
                      padding: '12px 16px', fontSize: 13, fontWeight: 600,
                      color: '#0A0A0B', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap',
                    }}>
                      {project.total_hours}h
                    </td>

                    {/* Budget */}
                    <td style={{
                      padding: '12px 16px', fontSize: 13,
                      color: 'rgba(10,10,11,0.40)', fontVariantNumeric: 'tabular-nums',
                    }}>
                      {project.budget_hours ? `${project.budget_hours}h` : '—'}
                    </td>

                    {/* Usage: bar + % */}
                    <td style={{ padding: '12px 16px', minWidth: 120 }}>
                      {project.percentage !== null ? (
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                            <span style={{
                              fontSize: 12, fontVariantNumeric: 'tabular-nums',
                              fontWeight: isOverAlert ? 700 : 500,
                              color: isOver ? '#dc2626' : isOverAlert ? '#d97706' : 'rgba(10,10,11,0.55)',
                            }}>
                              {project.percentage}%
                            </span>
                            {isOver && <AlertTriangle style={{ width: 10, height: 10, color: '#dc2626' }} />}
                          </div>
                          <div style={{
                            width: '100%', height: 5, borderRadius: 3,
                            background: 'rgba(10,10,11,0.07)', overflow: 'hidden',
                          }}>
                            <div style={{
                              height: '100%', borderRadius: 3,
                              width: `${Math.min(project.percentage, 100)}%`,
                              background: isOver ? '#ef4444' : isOverAlert ? '#f59e0b' : dot,
                              transition: 'width 0.4s ease',
                            }} />
                          </div>
                        </div>
                      ) : (
                        <span style={{ color: 'rgba(10,10,11,0.22)', fontSize: 13 }}>—</span>
                      )}
                    </td>

                    {/* Arrow indicator */}
                    <td style={{ padding: '12px 12px 12px 4px' }}>
                      <ChevronRight style={{
                        width: 14, height: 14,
                        color: isActive ? dot : 'rgba(10,10,11,0.18)',
                      }} />
                    </td>
                  </tr>
                )
              })}

              {projects.length === 0 && (
                <tr>
                  <td colSpan={9} style={{
                    padding: '48px 20px', textAlign: 'center',
                    fontSize: 13, color: 'rgba(10,10,11,0.28)',
                  }}>
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
