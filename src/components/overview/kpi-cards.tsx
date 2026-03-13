'use client'

import Link from 'next/link'

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
}

function KpiCard({ label, value, subtext, href }: KpiCardProps) {
  const inner = (
    <div
      style={{
        background: '#ffffff',
        borderRadius: 8,
        padding: '20px 22px 18px',
        boxShadow: '0 1px 2px rgba(0,0,0,0.06), 0 0 0 0.5px rgba(0,0,0,0.05)',
        transition: 'box-shadow 0.15s ease',
        cursor: href ? 'pointer' : 'default',
      }}
      onMouseEnter={(e) => {
        if (href)
          (e.currentTarget as HTMLDivElement).style.boxShadow =
            '0 2px 8px rgba(0,0,0,0.08), 0 0 0 0.5px rgba(0,0,0,0.06)'
      }}
      onMouseLeave={(e) => {
        if (href)
          (e.currentTarget as HTMLDivElement).style.boxShadow =
            '0 1px 2px rgba(0,0,0,0.06), 0 0 0 0.5px rgba(0,0,0,0.05)'
      }}
    >
      {/* Label */}
      <div
        style={{
          fontSize: 10,
          fontWeight: 500,
          letterSpacing: '0.07em',
          textTransform: 'uppercase',
          color: 'rgba(10,10,11,0.38)',
          marginBottom: 12,
        }}
      >
        {label}
      </div>

      {/* Value */}
      <div
        style={{
          fontSize: 42,
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
          color: 'rgba(10,10,11,0.32)',
          fontWeight: 400,
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
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
      <KpiCard
        label="Horas — 7 dias"
        value={`${totalHours}h`}
        subtext="Total de horas registradas"
      />
      <KpiCard
        label="Projetos ativos"
        value={String(activeProjects)}
        subtext="Em andamento agora"
        href="/projects"
      />
      <KpiCard
        label="Registros — 7 dias"
        value={String(totalEntries)}
        subtext="Via WhatsApp e dashboard"
      />
    </div>
  )
}
