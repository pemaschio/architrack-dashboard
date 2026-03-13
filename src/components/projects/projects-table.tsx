'use client'

import { useState, useTransition, useCallback } from 'react'
import { fetchProjectDetail, type ProjectDetail } from '@/app/actions/details'
import { ProjectDetailPanel } from '@/components/shared/project-detail-panel'
import { projectColor } from '@/lib/project-colors'

type ProjectStatus = 'active' | 'paused' | 'completed' | 'cancelled'

const statusConfig: Record<ProjectStatus, { label: string; dot: string }> = {
  active:    { label: 'Ativo',     dot: '#16A34A' },
  paused:    { label: 'Pausado',   dot: '#D97706' },
  completed: { label: 'Concluído', dot: '#2563EB' },
  cancelled: { label: 'Cancelado', dot: '#DC2626' },
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

const TH_STYLE: React.CSSProperties = {
  fontSize: 10,
  fontWeight: 500,
  letterSpacing: '0.07em',
  textTransform: 'uppercase',
  color: 'rgba(10,10,11,0.38)',
  textAlign: 'left',
  paddingTop: 10,
  paddingBottom: 10,
  paddingLeft: 20,
  paddingRight: 20,
  whiteSpace: 'nowrap',
}

export function ProjectsTable({ projects }: Props) {
  const [selectedProject, setSelectedProject] = useState<ProjectDetail | null>(null)
  const [isPending, startTransition] = useTransition()

  const handleRowClick = useCallback((projectId: string) => {
    setSelectedProject(null)
    startTransition(async () => {
      const detail = await fetchProjectDetail(projectId)
      setSelectedProject(detail)
    })
  }, [])

  const handleClose = useCallback(() => {
    setSelectedProject(null)
  }, [])

  return (
    <>
      <div
        style={{
          background: '#ffffff',
          borderRadius: 8,
          boxShadow: '0 1px 2px rgba(0,0,0,0.06), 0 0 0 0.5px rgba(0,0,0,0.05)',
          overflow: 'hidden',
        }}
      >
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(10,10,11,0.06)' }}>
                <th style={{ ...TH_STYLE, width: 32, paddingRight: 0 }} />
                <th style={TH_STYLE}>Projeto</th>
                <th style={TH_STYLE}>Cliente</th>
                <th style={TH_STYLE}>Etapa</th>
                <th style={TH_STYLE}>Status</th>
                <th style={TH_STYLE}>Horas</th>
                <th style={TH_STYLE}>Orçado</th>
                <th style={TH_STYLE}>Uso</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((project, idx) => {
                const s = statusConfig[project.status] ?? statusConfig.active
                const isOverAlert =
                  project.percentage !== null &&
                  project.percentage >= project.alert_threshold
                const dot = projectColor(project.name)
                const isLast = idx === projects.length - 1

                return (
                  <tr
                    key={project.id}
                    onClick={() => handleRowClick(project.id)}
                    style={{
                      borderBottom: isLast ? 'none' : '1px solid rgba(10,10,11,0.04)',
                      cursor: 'pointer',
                      transition: 'background 0.1s ease',
                    }}
                    onMouseEnter={(e) => {
                      ;(e.currentTarget as HTMLTableRowElement).style.background =
                        'rgba(10,10,11,0.025)'
                    }}
                    onMouseLeave={(e) => {
                      ;(e.currentTarget as HTMLTableRowElement).style.background = 'transparent'
                    }}
                  >
                    {/* Project identity dot */}
                    <td style={{ padding: '11px 0 11px 20px', width: 32 }}>
                      <div
                        style={{
                          width: 7,
                          height: 7,
                          borderRadius: '50%',
                          background: dot,
                          flexShrink: 0,
                        }}
                      />
                    </td>

                    {/* Name */}
                    <td
                      style={{
                        padding: '11px 20px',
                        fontSize: 13,
                        fontWeight: 500,
                        color: '#0A0A0B',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {project.name}
                    </td>

                    {/* Client */}
                    <td
                      style={{
                        padding: '11px 20px',
                        fontSize: 13,
                        color: 'rgba(10,10,11,0.48)',
                      }}
                    >
                      {project.client_name || '—'}
                    </td>

                    {/* Phase */}
                    <td
                      style={{
                        padding: '11px 20px',
                        fontSize: 13,
                        color: 'rgba(10,10,11,0.48)',
                      }}
                    >
                      {project.project_phases?.name || '—'}
                    </td>

                    {/* Status */}
                    <td style={{ padding: '11px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div
                          style={{
                            width: 5,
                            height: 5,
                            borderRadius: '50%',
                            background: s.dot,
                            flexShrink: 0,
                          }}
                        />
                        <span
                          style={{
                            fontSize: 12,
                            color: 'rgba(10,10,11,0.52)',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {s.label}
                        </span>
                      </div>
                    </td>

                    {/* Hours */}
                    <td
                      style={{
                        padding: '11px 20px',
                        fontSize: 13,
                        color: '#0A0A0B',
                        fontVariantNumeric: 'tabular-nums',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {project.total_hours}h
                    </td>

                    {/* Budget */}
                    <td
                      style={{
                        padding: '11px 20px',
                        fontSize: 13,
                        color: 'rgba(10,10,11,0.38)',
                        fontVariantNumeric: 'tabular-nums',
                      }}
                    >
                      {project.budget_hours ? `${project.budget_hours}h` : '—'}
                    </td>

                    {/* Usage: 3px progress bar + % */}
                    <td style={{ padding: '11px 20px', minWidth: 110 }}>
                      {project.percentage !== null ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          {/* 3px bar */}
                          <div
                            style={{
                              width: 60,
                              height: 3,
                              borderRadius: 2,
                              background: 'rgba(10,10,11,0.08)',
                              overflow: 'hidden',
                              flexShrink: 0,
                            }}
                          >
                            <div
                              style={{
                                height: '100%',
                                width: `${Math.min(project.percentage, 100)}%`,
                                borderRadius: 2,
                                background: isOverAlert ? '#DC2626' : dot,
                              }}
                            />
                          </div>
                          <span
                            style={{
                              fontSize: 12,
                              fontVariantNumeric: 'tabular-nums',
                              fontWeight: isOverAlert ? 500 : 400,
                              color: isOverAlert ? '#DC2626' : 'rgba(10,10,11,0.48)',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {project.percentage}%
                          </span>
                        </div>
                      ) : (
                        <span style={{ color: 'rgba(10,10,11,0.22)', fontSize: 13 }}>—</span>
                      )}
                    </td>
                  </tr>
                )
              })}

              {projects.length === 0 && (
                <tr>
                  <td
                    colSpan={8}
                    style={{
                      padding: '48px 20px',
                      textAlign: 'center',
                      fontSize: 13,
                      color: 'rgba(10,10,11,0.28)',
                    }}
                  >
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
