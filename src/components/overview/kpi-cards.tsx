'use client'

import Link from 'next/link'
import { Clock, FolderOpen, ClipboardList, ArrowUpRight, TrendingUp } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

interface Props {
  totalHours: number
  activeProjects: number
  totalEntries: number
}

interface KpiCardProps {
  label: string
  value: string
  unit?: string
  subtext: string
  href?: string
  icon: LucideIcon
  accentColor: string
  accentBg: string
  trend?: string
}

function KpiCard({ label, value, unit, subtext, href, icon: Icon, accentColor, accentBg, trend }: KpiCardProps) {
  const inner = (
    <div
      style={{
        background: '#ffffff',
        borderRadius: 12,
        padding: '20px 22px 18px',
        boxShadow: '0 1px 4px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.05)',
        transition: 'box-shadow 0.2s ease, transform 0.2s ease',
        cursor: href ? 'pointer' : 'default',
        position: 'relative',
        overflow: 'hidden',
        height: '100%',
        boxSizing: 'border-box',
      }}
      onMouseEnter={(e) => {
        if (href) {
          const el = e.currentTarget as HTMLDivElement
          el.style.boxShadow = '0 6px 20px rgba(0,0,0,0.10), 0 0 0 1px rgba(0,0,0,0.06)'
          el.style.transform = 'translateY(-2px)'
        }
      }}
      onMouseLeave={(e) => {
        if (href) {
          const el = e.currentTarget as HTMLDivElement
          el.style.boxShadow = '0 1px 4px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.05)'
          el.style.transform = 'translateY(0)'
        }
      }}
    >
      {/* Accent bar */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 3,
        background: accentColor, borderRadius: '12px 12px 0 0',
      }} />

      {/* Icon + Arrow */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          background: accentBg,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon style={{ width: 17, height: 17, color: accentColor }} />
        </div>
        {href && (
          <ArrowUpRight style={{ width: 15, height: 15, color: accentColor, opacity: 0.5 }} />
        )}
      </div>

      {/* Label */}
      <p style={{
        fontSize: 11, fontWeight: 600, letterSpacing: '0.07em',
        textTransform: 'uppercase', color: 'rgba(10,10,11,0.40)',
        marginBottom: 6,
      }}>
        {label}
      </p>

      {/* Value */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 8 }}>
        <span style={{
          fontSize: 38, fontWeight: 700, letterSpacing: '-0.04em',
          lineHeight: 1, color: '#0A0A0B', fontVariantNumeric: 'tabular-nums',
        }}>
          {value}
        </span>
        {unit && (
          <span style={{ fontSize: 16, fontWeight: 500, color: 'rgba(10,10,11,0.35)' }}>{unit}</span>
        )}
      </div>

      {/* Subtext + Trend */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <p style={{ fontSize: 11, color: 'rgba(10,10,11,0.38)', fontWeight: 400 }}>
          {subtext}
        </p>
        {trend && (
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 3,
            padding: '2px 6px', borderRadius: 999,
            background: '#f0fdf4', color: '#16a34a',
            fontSize: 10, fontWeight: 700,
          }}>
            <TrendingUp style={{ width: 9, height: 9 }} />
            {trend}
          </div>
        )}
      </div>
    </div>
  )

  if (href) {
    return (
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      <Link href={href as any} style={{ display: 'block', textDecoration: 'none' }}>
        {inner}
      </Link>
    )
  }

  return inner
}

export function KpiCards({ totalHours, activeProjects, totalEntries }: Props) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
      <KpiCard
        label="Horas — 7 dias"
        value={String(totalHours)}
        unit="h"
        subtext="Total de horas registradas"
        icon={Clock}
        accentColor="#B5614A"
        accentBg="rgba(181,97,74,0.10)"
      />
      <KpiCard
        label="Projetos ativos"
        value={String(activeProjects)}
        subtext="Clique para ver todos"
        href="/projects"
        icon={FolderOpen}
        accentColor="#0066CC"
        accentBg="rgba(0,102,204,0.10)"
      />
      <KpiCard
        label="Registros — 7 dias"
        value={String(totalEntries)}
        subtext="Via WhatsApp e dashboard"
        icon={ClipboardList}
        accentColor="#16A34A"
        accentBg="rgba(22,163,74,0.10)"
      />
    </div>
  )
}
