'use client'

import { useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import Link from 'next/link'
import { ChevronDown, ChevronRight, X, ExternalLink } from 'lucide-react'

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
  filterProject?: string | null
  onClearFilter?: () => void
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

const sourceBadgeColors: Record<string, string> = {
  whatsapp_direct: 'bg-green-50 text-green-700',
  whatsapp_timer: 'bg-blue-50 text-blue-700',
  dashboard: 'bg-gray-100 text-gray-700',
}

export function TimeEntriesTable({ entries, filterProject, onClearFilter }: Props) {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const filtered = filterProject
    ? entries.filter((e) => e.projects?.name === filterProject)
    : entries

  const displayed = filtered.slice(0, 20)
  const hasMore = filtered.length > 20

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-sm font-medium text-gray-700">Registros recentes</h2>
          {filterProject && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
              {filterProject}
              {onClearFilter && (
                <button
                  onClick={onClearFilter}
                  className="ml-0.5 hover:text-blue-900 transition-colors"
                  aria-label="Remover filtro"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </span>
          )}
        </div>
        <span className="text-xs text-gray-400">
          {filtered.length} registro{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/50">
              <th className="w-8 px-3 py-3" />
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">
                Arquiteto
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">
                Projeto
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">
                Atividade
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">
                Duração
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">
                Origem
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">
                Quando
              </th>
            </tr>
          </thead>
          <tbody>
            {displayed.map((entry) => {
              const isExpanded = expandedId === entry.id
              const hasDescription = !!entry.description

              return (
                <>
                  <tr
                    key={entry.id}
                    className={`border-b border-gray-50 transition-colors ${hasDescription ? 'cursor-pointer hover:bg-gray-50' : 'hover:bg-gray-50'} ${isExpanded ? 'bg-blue-50/30' : ''}`}
                    onClick={() => hasDescription && setExpandedId(isExpanded ? null : entry.id)}
                  >
                    <td className="px-3 py-3 text-gray-300">
                      {hasDescription ? (
                        isExpanded ? (
                          <ChevronDown className="w-3.5 h-3.5 text-blue-500" />
                        ) : (
                          <ChevronRight className="w-3.5 h-3.5" />
                        )
                      ) : null}
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {entry.users?.name ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {entry.projects?.name ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {entry.activity_types?.name ?? '—'}
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-900 tabular-nums">
                      {formatDuration(entry.duration_min)}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${sourceBadgeColors[entry.source] ?? 'bg-gray-100 text-gray-700'}`}>
                        {sourceLabels[entry.source] ?? entry.source}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">
                      {formatDistanceToNow(new Date(entry.started_at), {
                        addSuffix: true,
                        locale: ptBR,
                      })}
                    </td>
                  </tr>

                  {isExpanded && entry.description && (
                    <tr key={`${entry.id}-desc`} className="bg-blue-50/20 border-b border-gray-50">
                      <td colSpan={7} className="px-6 py-3">
                        <p className="text-xs text-gray-600 italic">
                          &ldquo;{entry.description}&rdquo;
                        </p>
                      </td>
                    </tr>
                  )}
                </>
              )
            })}

            {displayed.length === 0 && (
              <tr>
                <td colSpan={7} className="px-5 py-10 text-center text-gray-400 text-sm">
                  {filterProject
                    ? `Nenhum registro para "${filterProject}" nos últimos 7 dias.`
                    : 'Nenhum registro nos últimos 7 dias.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {(hasMore || displayed.length > 0) && (
        <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between">
          {hasMore && (
            <span className="text-xs text-gray-400">
              Mostrando 20 de {filtered.length} registros
            </span>
          )}
          <Link
            href="/projects"
            className="ml-auto flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors"
          >
            Ver projetos completos
            <ExternalLink className="w-3 h-3" />
          </Link>
        </div>
      )}
    </div>
  )
}
