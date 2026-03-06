import { Clock, FolderOpen, Activity } from 'lucide-react'

interface Props {
  totalHours: number
  activeProjects: number
  totalEntries: number
}

export function KpiCards({ totalHours, activeProjects, totalEntries }: Props) {
  const kpis = [
    {
      label: 'Horas (7 dias)',
      value: `${totalHours}h`,
      icon: Clock,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      label: 'Projetos ativos',
      value: String(activeProjects),
      icon: FolderOpen,
      color: 'text-green-600',
      bg: 'bg-green-50',
    },
    {
      label: 'Registros (7 dias)',
      value: String(totalEntries),
      icon: Activity,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {kpis.map(({ label, value, icon: Icon, color, bg }) => (
        <div key={label} className="bg-white rounded-lg border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-500">{label}</span>
            <div className={`${bg} p-2 rounded-md`}>
              <Icon className={`w-4 h-4 ${color}`} />
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900">{value}</div>
        </div>
      ))}
    </div>
  )
}
