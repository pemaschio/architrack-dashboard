type ProjectStatus = 'active' | 'paused' | 'completed' | 'cancelled'

const statusConfig: Record<ProjectStatus, { label: string; className: string }> = {
  active: { label: 'Ativo', className: 'bg-green-100 text-green-700' },
  paused: { label: 'Pausado', className: 'bg-yellow-100 text-yellow-700' },
  completed: { label: 'Concluído', className: 'bg-blue-100 text-blue-700' },
  cancelled: { label: 'Cancelado', className: 'bg-red-100 text-red-700' },
}

interface Project {
  id: string
  name: string
  client_name: string | null
  status: ProjectStatus
  budget_hours: number | null
  budget_value: number | null
  alert_threshold: number
  start_date: string | null
  deadline: string | null
  project_phases: { name: string } | null
}

interface Phase {
  id: string
  name: string
  display_order: number
}

interface Props {
  projects: Project[]
  phases: Phase[]
}

export function SettingsProjectsTable({ projects }: Props) {
  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              {[
                'Projeto',
                'Cliente',
                'Etapa',
                'Status',
                'Orçado (h)',
                'Orçado (R$)',
                'Alerta',
                'Prazo',
              ].map((h) => (
                <th
                  key={h}
                  className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {projects.map((project) => {
              const s = statusConfig[project.status] ?? statusConfig.active
              return (
                <tr key={project.id} className="border-b border-gray-50 hover:bg-gray-50">
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
                  <td className="px-5 py-3 text-gray-600">
                    {project.budget_hours ? `${project.budget_hours}h` : '—'}
                  </td>
                  <td className="px-5 py-3 text-gray-600">
                    {project.budget_value
                      ? `R$ ${project.budget_value.toLocaleString('pt-BR')}`
                      : '—'}
                  </td>
                  <td className="px-5 py-3 text-gray-600">{project.alert_threshold}%</td>
                  <td className="px-5 py-3 text-gray-500">
                    {project.deadline
                      ? new Date(project.deadline).toLocaleDateString('pt-BR')
                      : '—'}
                  </td>
                </tr>
              )
            })}
            {projects.length === 0 && (
              <tr>
                <td colSpan={8} className="px-5 py-10 text-center text-gray-400 text-sm">
                  Nenhum projeto cadastrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
