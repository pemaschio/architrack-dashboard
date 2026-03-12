'use client'

import { useState, useTransition, useCallback } from 'react'
import { fetchProjectDetail, type ProjectDetail } from '@/app/actions/details'
import { ProjectDetailPanel } from '@/components/shared/project-detail-panel'

type ProjectStatus = 'active' | 'paused' | 'completed' | 'cancelled'

const statusConfig: Record<ProjectStatus, { label: string; className: string }> = {
  active:    { label: 'Ativo',     className: 'bg-green-100 text-green-700' },
  paused:    { label: 'Pausado',   className: 'bg-yellow-100 text-yellow-700' },
  completed: { label: 'Concluído', className: 'bg-blue-100 text-blue-700' },
  cancelled: { label: 'Cancelado', className: 'bg-red-100 text-red-700' },
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
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                {['Projeto', 'Cliente', 'Etapa', 'Status', 'Horas realizadas', 'Orçado', '%'].map(
                  (h) => (
                    <th
                      key={h}
                      className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide"
                    >
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {projects.map((project) => {
                const s = statusConfig[project.status] ?? statusConfig.active
                const isOverAlert =
                  project.percentage !== null &&
                  project.percentage >= project.alert_threshold

                return (
                  <tr
                    key={project.id}
                    onClick={() => handleRowClick(project.id)}
                    className="border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <td className="px-5 py-3 font-medium text-gray-900">{project.name}</td>
                    <td className="px-5 py-3 text-gray-500">{project.client_name || '—'}</td>
                    <td className="px-5 py-3 text-gray-500">
                      {project.project_phases?.name || '—'}
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${s.className}`}
                      >
                        {s.label}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-gray-900">{project.total_hours}h</td>
                    <td className="px-5 py-3 text-gray-500">
                      {project.budget_hours ? `${project.budget_hours}h` : '—'}
                    </td>
                    <td className="px-5 py-3">
                      {project.percentage !== null ? (
                        <span
                          className={
                            isOverAlert ? 'text-amber-600 font-semibold' : 'text-gray-700'
                          }
                        >
                          {project.percentage}%{isOverAlert && ' ⚠️'}
                        </span>
                      ) : (
                        '—'
                      )}
                    </td>
                  </tr>
                )
              })}
              {projects.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center text-gray-400 text-sm">
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
