import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'

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

interface Props {
  entries: TimeEntry[]
}

function formatDuration(minutes: number | null) {
  if (!minutes) return '—'
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return h > 0 ? `${h}h${m > 0 ? `${m}min` : ''}` : `${m}min`
}

const sourceLabels: Record<string, string> = {
  whatsapp_direct: 'WhatsApp',
  whatsapp_timer: 'Timer',
  dashboard: 'Dashboard',
}

export function TimeEntriesTable({ entries }: Props) {
  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="px-5 py-4 border-b border-gray-200">
        <h2 className="text-sm font-medium text-gray-700">Registros recentes</h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">
                Arquiteto
              </th>
              <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">
                Projeto
              </th>
              <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">
                Atividade
              </th>
              <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">
                Duração
              </th>
              <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">
                Origem
              </th>
              <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">
                Quando
              </th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry) => (
              <tr key={entry.id} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="px-5 py-3 font-medium text-gray-900">
                  {entry.users?.name ?? '—'}
                </td>
                <td className="px-5 py-3 text-gray-600">
                  {entry.projects?.name ?? '—'}
                </td>
                <td className="px-5 py-3 text-gray-600">
                  {entry.activity_types?.name ?? '—'}
                </td>
                <td className="px-5 py-3 font-medium text-gray-900">
                  {formatDuration(entry.duration_min)}
                </td>
                <td className="px-5 py-3">
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700">
                    {sourceLabels[entry.source] ?? entry.source}
                  </span>
                </td>
                <td className="px-5 py-3 text-gray-400 text-xs">
                  {formatDistanceToNow(new Date(entry.started_at), {
                    addSuffix: true,
                    locale: ptBR,
                  })}
                </td>
              </tr>
            ))}
            {entries.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-10 text-center text-gray-400 text-sm">
                  Nenhum registro nos últimos 7 dias.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
