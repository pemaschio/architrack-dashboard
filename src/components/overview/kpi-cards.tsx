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
  unit?: string
  subtext: string
  href?: string
  accentClass: string
}

function KpiCard({ label, value, unit, subtext, href, accentClass }: KpiCardProps) {
  const inner = (
    <div className="glass glass-hover relative overflow-hidden h-full p-[18px_20px] transition-all">
      <div className={`absolute top-0 left-0 right-0 h-[2px] ${accentClass}`} />
      <p className="text-label mb-2.5">{label}</p>
      <div className="flex items-baseline gap-1 mb-1">
        <span className="text-kpi">{value}</span>
        {unit && <span className="text-sm text-stone-400">{unit}</span>}
      </div>
      <p className="text-[10px] text-stone-400">{subtext}</p>
    </div>
  )

  if (href) {
    return (
      <Link href={href as never} className="block no-underline">
        {inner}
      </Link>
    )
  }
  return inner
}

export function KpiCards({ totalHours, activeProjects, totalEntries }: Props) {
  return (
    <div className="grid grid-cols-3 gap-3">
      <KpiCard
        label="Horas — 7 dias"
        value={String(totalHours)}
        unit="h"
        subtext="Total de horas registradas"
        accentClass="accent-terra"
      />
      <KpiCard
        label="Projetos ativos"
        value={String(activeProjects)}
        subtext="Clique para ver todos"
        href="/projects"
        accentClass="accent-stone-500"
      />
      <KpiCard
        label="Registros — 7 dias"
        value={String(totalEntries)}
        subtext="Via WhatsApp e dashboard"
        accentClass="accent-stone-400"
      />
    </div>
  )
}
