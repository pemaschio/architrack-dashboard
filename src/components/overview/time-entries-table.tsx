'use client'

import { Fragment, useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import Link from 'next/link'
import { ChevronDown, ChevronRight, X, ArrowRight, MessageCircle, Timer, Monitor } from 'lucide-react'
import { projectColor } from '@/lib/project-colors'

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
  return h > 0 ? `${h}h${m > 0 ? ` ${m}min` : ''}` : `${m}min`
}

function initials(name: string) {
  return name.split(' ').filter(Boolean).slice(0, 2).map((n) => n[0]).join('').toUpperCase()
}

const AVATAR_BG = ['#ede9fe', '#dbeafe', '#d1fae5', '#fed7aa', '#fce7f3', '#e0f2fe']
const AVATAR_FG = ['#5b21b6', '#1e40af', '#065f46', '#9a3412', '#9d174d', '#075985']

// Deterministic avatar color by name
function avatarStyle(name: string) {
  let h = 0
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) & 0xffffffff
  const idx = Math.abs(h) % AVATAR_BG.length
  return { bg: AVATAR_BG[idx], fg: AVATAR_FG[idx] }
}

const sourceIcon: Record<string, React.ElementType> = {
  whatsapp_direct: MessageCircle,
  whatsapp_timer: Timer,
  dashboard: Monitor,
}

const sourceMeta: Record<string, { label: string; className: string }> = {
  whatsapp_direct: {
    label: 'WhatsApp',
    className: 'inline-flex items-center gap-1 px-2 py-[3px] rounded-full text-[10px] font-semibold bg-green-600/[0.08] text-green-700',
  },
  whatsapp_timer: {
    label: 'Timer',
    className: 'inline-flex items-center gap-1 px-2 py-[3px] rounded-full text-[10px] font-semibold bg-blue-600/[0.08] text-blue-700',
  },
  dashboard: {
    label: 'Dashboard',
    className: 'inline-flex items-center gap-1 px-2 py-[3px] rounded-full text-[10px] font-semibold bg-stone-500/[0.08] text-stone-500',
  },
}

export function TimeEntriesTable({ entries, filterProject, onClearFilter }: Props) {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const filtered = filterProject
    ? entries.filter((e) => e.projects?.name === filterProject)
    : entries

  const displayed = filtered.slice(0, 20)
  const hasMore = filtered.length > 20

  return (
    <div className="glass overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-[18px] py-3.5 border-b border-stone-300/20">
        <div className="flex items-center gap-2.5">
          <span className="text-section-title">
            Registros recentes
          </span>

          {filterProject && (
            <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold bg-stone-300/15 text-stone-800 rounded-full py-[3px] px-2 pl-1.5 border border-stone-300/20">
              <span
                className="w-1.5 h-1.5 rounded-full inline-block shrink-0"
                style={{ background: projectColor(filterProject) }}
              />
              {filterProject}
              {onClearFilter && (
                <button
                  onClick={onClearFilter}
                  className="ml-0.5 flex border-none bg-transparent cursor-pointer p-0 text-inherit opacity-55"
                  aria-label="Remover filtro"
                >
                  <X className="w-[11px] h-[11px]" />
                </button>
              )}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2.5">
          <span className="text-label">
            {filtered.length} registro{filtered.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-stone-300/15 bg-white/[0.03]">
              <th className="text-label text-left py-2.5 pl-5 pr-2 w-5" />
              <th className="text-label text-left px-4 py-2.5 whitespace-nowrap">Arquiteto</th>
              <th className="text-label text-left px-4 py-2.5 whitespace-nowrap">Projeto</th>
              <th className="text-label text-left px-4 py-2.5 whitespace-nowrap">Atividade</th>
              <th className="text-label text-left px-4 py-2.5 whitespace-nowrap">Duração</th>
              <th className="text-label text-left px-4 py-2.5 whitespace-nowrap">Origem</th>
              <th className="text-label text-left px-4 py-2.5 whitespace-nowrap">Quando</th>
            </tr>
          </thead>
          <tbody>
            {displayed.map((entry, idx) => {
              const isExpanded = expandedId === entry.id
              const hasDescription = !!entry.description
              const isLast = idx === displayed.length - 1
              const projName = entry.projects?.name ?? ''
              const userName = entry.users?.name ?? ''
              const av = userName ? avatarStyle(userName) : null
              const src = sourceMeta[entry.source]
              const SrcIcon = sourceIcon[entry.source]

              return (
                <Fragment key={entry.id}>
                  <tr
                    className={[
                      'transition-colors',
                      isLast && !isExpanded ? '' : 'border-b border-stone-300/[0.12]',
                      isExpanded ? 'bg-white/20' : 'hover:bg-white/30',
                      hasDescription ? 'cursor-pointer' : 'cursor-default',
                    ].join(' ')}
                    onClick={() => hasDescription && setExpandedId(isExpanded ? null : entry.id)}
                  >
                    {/* Chevron */}
                    <td className="py-[11px] pl-5 pr-2 w-5">
                      {hasDescription
                        ? isExpanded
                          ? <ChevronDown className="w-3 h-3 text-[#0066CC]" />
                          : <ChevronRight className="w-3 h-3 text-stone-400" />
                        : null}
                    </td>

                    {/* Architect + avatar */}
                    <td className="px-4 py-2.5 whitespace-nowrap">
                      {userName ? (
                        <div className="flex items-center gap-2">
                          {av && (
                            <div
                              className="w-[26px] h-[26px] rounded-full shrink-0 flex items-center justify-center text-[9px] font-extrabold"
                              style={{ background: av.bg, color: av.fg }}
                            >
                              {initials(userName)}
                            </div>
                          )}
                          <span className="text-[13px] font-medium text-stone-800">{userName}</span>
                        </div>
                      ) : (
                        <span className="text-[13px] text-stone-400">—</span>
                      )}
                    </td>

                    {/* Project */}
                    <td className="px-4 py-2.5 whitespace-nowrap">
                      {projName ? (
                        <div className="flex items-center gap-1.5">
                          <div
                            className="w-1.5 h-1.5 rounded-full shrink-0"
                            style={{ background: projectColor(projName) }}
                          />
                          <span className="text-[13px] text-stone-500 font-medium">
                            {projName}
                          </span>
                        </div>
                      ) : (
                        <span className="text-[13px] text-stone-300">—</span>
                      )}
                    </td>

                    {/* Activity */}
                    <td className="px-4 py-2.5 text-xs text-stone-400">
                      {entry.activity_types?.name ?? '—'}
                    </td>

                    {/* Duration */}
                    <td className="px-4 py-2.5 whitespace-nowrap">
                      {entry.duration_min ? (
                        <span className="inline-block px-2 py-0.5 rounded-full bg-stone-300/15 text-xs font-semibold text-[#57534e]">
                          {formatDuration(entry.duration_min)}
                        </span>
                      ) : (
                        <span className="text-[13px] text-stone-400">—</span>
                      )}
                    </td>

                    {/* Source badge */}
                    <td className="px-4 py-2.5">
                      {src ? (
                        <div className={src.className}>
                          {SrcIcon && <SrcIcon className="w-2.5 h-2.5" />}
                          {src.label}
                        </div>
                      ) : (
                        <span className="text-xs text-stone-400">
                          {entry.source}
                        </span>
                      )}
                    </td>

                    {/* When */}
                    <td className="px-4 py-2.5 text-[10px] text-stone-400 whitespace-nowrap">
                      {formatDistanceToNow(new Date(entry.started_at), { addSuffix: true, locale: ptBR })}
                    </td>
                  </tr>

                  {isExpanded && entry.description && (
                    <tr className="border-b border-stone-300/[0.12] bg-white/[0.02]">
                      <td colSpan={7} className="py-2 px-5 pl-[60px]">
                        <p className="text-xs text-stone-500 italic leading-relaxed m-0 p-2 px-3 bg-white/20 rounded-lg border-l-2 border-stone-300">
                          &ldquo;{entry.description}&rdquo;
                        </p>
                      </td>
                    </tr>
                  )}
                </Fragment>
              )
            })}

            {displayed.length === 0 && (
              <tr>
                <td colSpan={7} className="py-12 px-5 text-center text-[13px] text-stone-300">
                  {filterProject
                    ? `Nenhum registro para "${filterProject}" nos últimos 7 dias.`
                    : 'Nenhum registro nos últimos 7 dias.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      {(hasMore || displayed.length > 0) && (
        <div className="flex items-center justify-between px-[18px] py-2.5 border-t border-stone-300/15 bg-white/[0.02]">
          {hasMore ? (
            <span className="text-[11px] text-stone-400">
              Mostrando 20 de {filtered.length} registros
            </span>
          ) : (
            <span />
          )}
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          <Link
            href={'/projects' as any}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-500 no-underline px-3 py-1.5 rounded-lg glass glass-hover"
          >
            Ver projetos completos
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      )}
    </div>
  )
}
