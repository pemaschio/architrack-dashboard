'use client'

import Link from 'next/link'
import { Clock, FolderOpen, ClipboardList } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

interface Props {
  totalHours: number
  activeProjects: number
  totalEntries: number
}

interface KpiCardProps {
  label: string
  value: string
  subtext: string
  href?: string
  icon: LucideIcon
  accentColor?: string
}

function KpiCard({ label, value, subtext, href, icon: Icon, accentColor = '#B5614A' }: KpiCardProps) {
  const inner = (
    <div
      style={{
        background: '#ffffff',
        borderRadius: 10,
        padding: '22px 24px 20px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.07), 0 0 0 1px rgba(0,0,0,0.04)',
        transition: 'box-shadow 0.2s ease, transform 0.2s ease',
        cursor: href ? 'pointer' : 'default',
        position: 'relative',
        overflow: 'hidden',
      }}
      onMouseEnter={(e) => {
        if (href) {
          const el = e.currentTarget as HTMLDivElement
          el.style.boxShadow = '0 4px 12px rgba(0,0,0,0.09), 0 0 0 1px rgba(0,0,0,0.05)'
          el.style.transform = 'translateY(-1px)'
        }
      }}
      onMouseLeave={(e) => {
        if (href) {
          const el = e.currentTarget as HTMLDivElement
          el.style.boxShadow = '0 1px 3px rgba(0,0,0,0.07), 0 0 0 1px rgba(0,0,0,0.04)'
          el.style.transform = 'translateY(0)'
        }
      }}
    >
      {/* Accent bar */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 2,
          background: accentColor,
          opacity: 0.6,
          borderRadius: '10px 10px 0 0',
        }}
      />

      {/* Icon + Label row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <div
          style={{
            fontSize: 10,
            fontWeight: 600,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: 'rgba(10,10,11,0.38)',
          }}
        >
          {label}
        </div>
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: 7,
            background: `${accentColor}10`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon style={{ width: 14, height: 14, color: accentColor }} />
        </div>
      </div>

      {/* Value */}
      <div
        style={{
          fontSize: 40,
          fontWeight: 300,
          letterSpacing: '-0.04em',
          lineHeight: 1,
          color: '#0A0A0B',
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {value}
      </div>

      {/* Subtext */}
      <div
        style={{
          marginTop: 10,
          fontSize: 11,
          color: 'rgba(10,10,11,0.34)',
          fontWeight: 400,
          letterSpacing: '0.01em',
        }}
      >
        {subtext}
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
        value={`${totalHours}h`}
        subtext="Total de horas registradas"
        icon={Clock}
        accentColor="#B5614A"
      />
      <KpiCard
        label="Projetos ativos"
        value={String(activeProjects)}
        subtext="Em andamento agora"
        href="/projects"
        icon={FolderOpen}
        accentColor="#0066CC"
      />
      <KpiCard
        label="Registros — 7 dias"
        value={String(totalEntries)}
        subtext="Via WhatsApp e dashboard"
        icon={ClipboardList}
        accentColor="#16A34A"
      />
    </div>
  )
}
