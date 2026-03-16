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

const sourceConfig: Record<string, { label: string; color: string; bg: string; Icon: React.ElementType }> = {
  whatsapp_direct: { label: 'WhatsApp', color: '#15803d', bg: '#dcfce7', Icon: MessageCircle },
  whatsapp_timer:  { label: 'Timer',    color: '#1d4ed8', bg: '#dbeafe', Icon: Timer },
  dashboard:       { label: 'Dashboard', color: '#6b7280', bg: '#f3f4f6', Icon: Monitor },
}

const TH: React.CSSProperties = {
  fontSize: 10, fontWeight: 600, letterSpacing: '0.08em',
  textTransform: 'uppercase', color: 'rgba(10,10,11,0.38)',
  textAlign: 'left', padding: '10px 16px', whiteSpace: 'nowrap',
}

export function TimeEntriesTable({ entries, filterProject, onClearFilter }: Props) {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const filtered = filterProject
    ? entries.filter((e) => e.projects?.name === filterProject)
    : entries

  const displayed = filtered.slice(0, 20)
  const hasMore = filtered.length > 20

  return (
    <div style={{
      background: '#ffffff', borderRadius: 12,
      boxShadow: '0 1px 4px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.05)',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 20px', borderBottom: '1px solid rgba(10,10,11,0.06)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: '#0A0A0B' }}>
            Registros recentes
          </span>

          {filterProject && (
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              fontSize: 11, fontWeight: 600,
              background: 'rgba(10,10,11,0.05)', color: '#0A0A0B',
              borderRadius: 999, padding: '3px 8px 3px 6px',
              border: '1px solid rgba(10,10,11,0.08)',
            }}>
              <span style={{
                width: 6, height: 6, borderRadius: '50%',
                background: projectColor(filterProject), display: 'inline-block', flexShrink: 0,
              }} />
              {filterProject}
              {onClearFilter && (
                <button
                  onClick={onClearFilter}
                  style={{
                    marginLeft: 1, display: 'flex', border: 'none',
                    background: 'none', cursor: 'pointer', padding: 0, color: 'inherit', opacity: 0.55,
                  }}
                  aria-label="Remover filtro"
                >
                  <X style={{ width: 11, height: 11 }} />
                </button>
              )}
            </span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 11, color: 'rgba(10,10,11,0.32)', fontWeight: 500 }}>
            {filtered.length} registro{filtered.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(10,10,11,0.05)', background: 'rgba(10,10,11,0.015)' }}>
              <th style={{ ...TH, width: 20, padding: '10px 8px 10px 20px' }} />
              <th style={TH}>Arquiteto</th>
              <th style={TH}>Projeto</th>
              <th style={TH}>Atividade</th>
              <th style={TH}>Duração</th>
              <th style={TH}>Origem</th>
              <th style={TH}>Quando</th>
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
              const src = sourceConfig[entry.source]

              return (
                <Fragment key={entry.id}>
                  <tr
                    style={{
                      borderBottom: isLast && !isExpanded ? 'none' : '1px solid rgba(10,10,11,0.04)',
                      background: isExpanded ? 'rgba(10,10,11,0.018)' : 'transparent',
                      cursor: hasDescription ? 'pointer' : 'default',
                      transition: 'background 0.1s ease',
                    }}
                    onMouseEnter={(e) => {
                      if (!isExpanded)
                        (e.currentTarget as HTMLTableRowElement).style.background = 'rgba(10,10,11,0.02)'
                    }}
                    onMouseLeave={(e) => {
                      if (!isExpanded)
                        (e.currentTarget as HTMLTableRowElement).style.background = 'transparent'
                    }}
                    onClick={() => hasDescription && setExpandedId(isExpanded ? null : entry.id)}
                  >
                    {/* Chevron */}
                    <td style={{ padding: '11px 8px 11px 20px', width: 20 }}>
                      {hasDescription
                        ? isExpanded
                          ? <ChevronDown style={{ width: 12, height: 12, color: '#0066CC' }} />
                          : <ChevronRight style={{ width: 12, height: 12, color: 'rgba(10,10,11,0.22)' }} />
                        : null}
                    </td>

                    {/* Architect + avatar */}
                    <td style={{ padding: '10px 16px', whiteSpace: 'nowrap' }}>
                      {userName ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          {av && (
                            <div style={{
                              width: 26, height: 26, borderRadius: '50%', flexShrink: 0,
                              background: av.bg, color: av.fg,
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: 9, fontWeight: 800,
                            }}>
                              {initials(userName)}
                            </div>
                          )}
                          <span style={{ fontSize: 13, fontWeight: 500, color: '#0A0A0B' }}>{userName}</span>
                        </div>
                      ) : (
                        <span style={{ fontSize: 13, color: 'rgba(10,10,11,0.30)' }}>—</span>
                      )}
                    </td>

                    {/* Project */}
                    <td style={{ padding: '10px 16px', whiteSpace: 'nowrap' }}>
                      {projName ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <div style={{
                            width: 6, height: 6, borderRadius: '50%',
                            background: projectColor(projName), flexShrink: 0,
                          }} />
                          <span style={{ fontSize: 13, color: 'rgba(10,10,11,0.65)', fontWeight: 500 }}>
                            {projName}
                          </span>
                        </div>
                      ) : (
                        <span style={{ fontSize: 13, color: 'rgba(10,10,11,0.24)' }}>—</span>
                      )}
                    </td>

                    {/* Activity */}
                    <td style={{ padding: '10px 16px', fontSize: 12, color: 'rgba(10,10,11,0.48)' }}>
                      {entry.activity_types?.name ?? '—'}
                    </td>

                    {/* Duration */}
                    <td style={{ padding: '10px 16px', whiteSpace: 'nowrap' }}>
                      {entry.duration_min ? (
                        <span style={{
                          display: 'inline-block',
                          padding: '2px 8px', borderRadius: 999,
                          background: '#f0f9ff', border: '1px solid #bae6fd',
                          fontSize: 12, fontWeight: 700, color: '#0369a1',
                        }}>
                          {formatDuration(entry.duration_min)}
                        </span>
                      ) : (
                        <span style={{ fontSize: 13, color: 'rgba(10,10,11,0.30)' }}>—</span>
                      )}
                    </td>

                    {/* Source badge */}
                    <td style={{ padding: '10px 16px' }}>
                      {src ? (
                        <div style={{
                          display: 'inline-flex', alignItems: 'center', gap: 4,
                          padding: '3px 8px', borderRadius: 999,
                          background: src.bg, fontSize: 11, fontWeight: 600, color: src.color,
                          whiteSpace: 'nowrap',
                        }}>
                          <src.Icon style={{ width: 10, height: 10 }} />
                          {src.label}
                        </div>
                      ) : (
                        <span style={{ fontSize: 12, color: 'rgba(10,10,11,0.38)' }}>
                          {entry.source}
                        </span>
                      )}
                    </td>

                    {/* When */}
                    <td style={{ padding: '10px 16px', fontSize: 11, color: 'rgba(10,10,11,0.32)', whiteSpace: 'nowrap' }}>
                      {formatDistanceToNow(new Date(entry.started_at), { addSuffix: true, locale: ptBR })}
                    </td>
                  </tr>

                  {isExpanded && entry.description && (
                    <tr style={{
                      borderBottom: '1px solid rgba(10,10,11,0.04)',
                      background: 'rgba(10,10,11,0.015)',
                    }}>
                      <td colSpan={7} style={{ padding: '8px 20px 12px 60px' }}>
                        <p style={{
                          fontSize: 12, color: 'rgba(10,10,11,0.52)',
                          fontStyle: 'italic', lineHeight: 1.6, margin: 0,
                          padding: '8px 12px', background: '#f8fafc',
                          borderRadius: 8, borderLeft: '2px solid #e2e8f0',
                        }}>
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
                <td colSpan={7} style={{
                  padding: '48px 20px', textAlign: 'center',
                  fontSize: 13, color: 'rgba(10,10,11,0.28)',
                }}>
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
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '10px 20px', borderTop: '1px solid rgba(10,10,11,0.05)',
          background: 'rgba(10,10,11,0.012)',
        }}>
          {hasMore ? (
            <span style={{ fontSize: 11, color: 'rgba(10,10,11,0.32)' }}>
              Mostrando 20 de {filtered.length} registros
            </span>
          ) : (
            <span />
          )}
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          <Link
            href={'/projects' as any}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              fontSize: 12, fontWeight: 600, color: '#0066CC',
              textDecoration: 'none',
              padding: '5px 12px', borderRadius: 8,
              border: '1px solid rgba(0,102,204,0.20)',
              background: 'rgba(0,102,204,0.04)',
              transition: 'all 0.15s',
            }}
          >
            Ver projetos completos
            <ArrowRight style={{ width: 12, height: 12 }} />
          </Link>
        </div>
      )}
    </div>
  )
}
