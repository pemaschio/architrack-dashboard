import Link from 'next/link'
import { Clock, FolderOpen, Activity, ArrowRight } from 'lucide-react'

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
      border: 'hover:border-blue-300',
      href: null,
      cta: null,
    },
    {
      label: 'Projetos ativos',
      value: String(activeProjects),
      icon: FolderOpen,
      color: 'text-green-600',
      bg: 'bg-green-50',
      border: 'hover:border-green-300',
      href: '/projects',
      cta: 'Ver projetos',
    },
    {
      label: 'Registros (7 dias)',
      value: String(totalEntries),
      icon: Activity,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
      border: 'hover:border-purple-300',
      href: null,
      cta: null,
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {kpis.map(({ label, value, icon: Icon, color, bg, border, href, cta }) => {
        const inner = (
          <div className={`bg-white rounded-lg border border-gray-200 p-5 transition-all ${border} ${href ? 'cursor-pointer group' : ''}`}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-500">{label}</span>
              <div className={`${bg} p-2 rounded-md`}>
                <Icon className={`w-4 h-4 ${color}`} />
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900">{value}</div>
            {cta && (
              <div className={`mt-3 flex items-center gap-1 text-xs font-medium ${color} opacity-0 group-hover:opacity-100 transition-opacity`}>
                {cta}
                <ArrowRight className="w-3 h-3" />
              </div>
            )}
          </div>
        )

        return href ? (
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          <Link key={label} href={href as any}>
            {inner}
          </Link>
        ) : (
          <div key={label}>{inner}</div>
        )
      })}
    </div>
  )
}
