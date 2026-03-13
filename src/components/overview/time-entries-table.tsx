'use client'

import { Fragment, useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import Link from 'next/link'
import { ChevronDown, ChevronRight, X, ExternalLink } from 'lucide-react'
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
  return h > 0 ? `${h}h${m > 0 ? `${m}min` : ''}` : `${m}min`
}

const sourceLabels: Record<string, string> = {
  whatsapp_direct: 'WhatsApp',
  whatsapp_timer:  'Timer',
  dashboard:       'Dashboard',
}

const sourceDots: Record<string, string> = {
  whatsapp_direct: '#16A34A',
  whatsapp_timer:  '#0066CC',
  dashboard:       'rgba(10,10,11,0.28)',
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
  paddingLeft: 16,
  paddingRight: 16,
  whiteSpace: 'nowrap',
}

export function TimeEntriesTable({ entries, filterProject, onClearFilter }: Props) {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const filtered = filterProject
    ? entries.filter((e) => e.projects?.name === filterProject)
    : entries

  const displayed = filtered.slice(0, 20)
  const hasMore = filtered.length > 20

  return (
    <div
      style={{
        background: '#ffffff',
        borderRadius: 8,
        boxShadow: '0 1px 2px rgba(0,0,0,0.06), 0 0 0 0.5px rgba(0,0,0,0.05)',
        overflow: 'hidden',
      }}
    >
      {/* Section header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 20px',
          borderBottom: '1px solid rgba(10,10,11,0.06)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 13, fontWeight: 500, color: '#0A0A0B' }}>
            Registros recentes
          </span>

          {filterProject && (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                fontSize: 11,
                fontWeight: 500,
                background: 'rgba(10,10,11,0.06)',
                color: '#0A0A0B',
                borderRadius: 4,
                padding: '2px 8px 2px 6px',
              }}
            >
              <span
                style={{
                  width: 5,
                  height: 5,
                  borderRadius: '50%',
                  background: projectColor(filterProject),
                  display: 'inline-block',
                }}
              />
              {filterProject}
              {onClearFilter && (
                <button
                  onClick={onClearFilter}
                  style={{
                    marginLeft: 2,
                    opacity: 0.45,
                    display: 'flex',
                    border: 'none',
                    background: 'none',
                    cursor: 'pointer',
                    padding: 0,
                  }}
                  aria-label="Remover filtro"
                >
                  <X style={{ width: 10, height: 10 }} />
                </button>
              )}
            </span>
          )}
        </div>

        <span style={{ fontSize: 11, color: 'rgba(10,10,11,0.32)' }}>
          {filtered.length} registro{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(10,10,11,0.05)' }}>
              <th style={{ ...TH_STYLE, width: 24, padding: '10px 8px 10px 20px' }} />
              <th style={TH_STYLE}>Arquiteto</th>
              <th style={TH_STYLE}>Projeto</th>
              <th style={TH_STYLE}>Atividade</th>
              <th style={TH_STYLE}>Duração</th>
              <th style={TH_STYLE}>Origem</th>
              <th style={TH_STYLE}>Quando</th>
            </tr>
          </thead>
          <tbody>
            {displayed.map((entry, idx) => {
              const isExpanded = expandedId === entry.id
              const hasDescription = !!entry.description
              const isLast = idx === displayed.length - 1
              const projName = entry.projects?.name ?? ''

              return (
                <Fragment key={entry.id}>
                  <tr
                    style={{
                      borderBottom:
                        isLast && !isExpanded ? 'none' : '1px solid rgba(10,10,11,0.04)',
                      background: isExpanded ? 'rgba(10,10,11,0.02)' : 'transparent',
                      cursor: hasDescription ? 'pointer' : 'default',
                      transition: 'background 0.1s ease',
                    }}
                    onMouseEnter={(e) => {
                      if (!isExpanded)
                        (e.currentTarget as HTMLTableRowElement).style.background =
                          'rgba(10,10,11,0.02)'
                    }}
                    onMouseLeave={(e) => {
                      if (!isExpanded)
                        (e.currentTarget as HTMLTableRowElement).style.background = 'transparent'
                    }}
                    onClick={() =>
                      hasDescription && setExpandedId(isExpanded ? null : entry.id)
                    }
                  >
                    {/* Chevron */}
                    <td style={{ padding: '11px 8px 11px 20px', width: 24 }}>
                      {hasDescription ? (
                        isExpanded ? (
                          <ChevronDown
                            style={{ width: 11, height: 11, color: '#0066CC', opacity: 0.85 }}
                          />
                        ) : (
                          <ChevronRight
                            style={{ width: 11, height: 11, color: 'rgba(10,10,11,0.22)' }}
                          />
                        )
                      ) : null}
                    </td>

                    {/* Architect */}
                    <td
                      style={{
                        padding: '11px 16px',
                        fontSize: 13,
                        fontWeight: 500,
                        color: '#0A0A0B',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {entry.users?.name ?? '—'}
                    </td>

                    {/* Project with identity dot */}
                    <td style={{ padding: '11px 16px', whiteSpace: 'nowrap' }}>
                      {projName ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <div
                            style={{
                              width: 5,
                              height: 5,
                              borderRadius: '50%',
                              background: projectColor(projName),
                              flexShrink: 0,
                            }}
                          />
                          <span style={{ fontSize: 13, color: 'rgba(10,10,11,0.62)' }}>
                            {projName}
                          </span>
                        </div>
                      ) : (
                        <span style={{ fontSize: 13, color: 'rgba(10,10,11,0.24)' }}>—</span>
                      )}
                    </td>

                    {/* Activity */}
                    <td
                      style={{
                        padding: '11px 16px',
                        fontSize: 13,
                        color: 'rgba(10,10,11,0.48)',
                      }}
                    >
                      {entry.activity_types?.name ?? '—'}
                    </td>

                    {/* Duration */}
                    <td
                      style={{
                        padding: '11px 16px',
                        fontSize: 13,
                        color: '#0A0A0B',
                        fontVariantNumeric: 'tabular-nums',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {formatDuration(entry.duration_min)}
                    </td>

                    {/* Source */}
                    <td style={{ padding: '11px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        <div
                          style={{
                            width: 4,
                            height: 4,
                            borderRadius: '50%',
                            background: sourceDots[entry.source] ?? 'rgba(10,10,11,0.24)',
                            flexShrink: 0,
                          }}
                        />
                        <span
                          style={{
                            fontSize: 12,
                            color: 'rgba(10,10,11,0.42)',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {sourceLabels[entry.source] ?? entry.source}
                        </span>
                      </div>
                    </td>

                    {/* When */}
                    <td
                      style={{
                        padding: '11px 16px',
                        fontSize: 11,
                        color: 'rgba(10,10,11,0.28)',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {formatDistanceToNow(new Date(entry.started_at), {
                        addSuffix: true,
                        locale: ptBR,
                      })}
                    </td>
                  </tr>

                  {isExpanded && entry.description && (
                    <tr
                      style={{
                        borderBottom: '1px solid rgba(10,10,11,0.04)',
                        background: 'rgba(10,10,11,0.015)',
                      }}
                    >
                      <td colSpan={7} style={{ padding: '8px 20px 12px 48px' }}>
                        <p
                          style={{
                            fontSize: 12,
                            color: 'rgba(10,10,11,0.48)',
                            fontStyle: 'italic',
                            lineHeight: 1.6,
                            margin: 0,
                          }}
                        >
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
                <td
                  colSpan={7}
                  style={{
                    padding: '48px 20px',
                    textAlign: 'center',
                    fontSize: 13,
                    color: 'rgba(10,10,11,0.28)',
                  }}
                >
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
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '10px 20px',
            borderTop: '1px solid rgba(10,10,11,0.05)',
          }}
        >
          {hasMore ? (
            <span style={{ fontSize: 11, color: 'rgba(10,10,11,0.30)' }}>
              Mostrando 20 de {filtered.length} registros
            </span>
          ) : (
            <span />
          )}
          <Link
            href="/projects"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              fontSize: 12,
              fontWeight: 500,
              color: '#0066CC',
              textDecoration: 'none',
            }}
          >
            Ver projetos completos
            <ExternalLink style={{ width: 11, height: 11 }} />
          </Link>
        </div>
      )}
    </div>
  )
}
