import { createAdminClient } from '@/lib/supabase/admin'
import { KpiCards } from '@/components/overview/kpi-cards'
import { OverviewClient } from '@/components/overview/overview-client'
import { RefreshCw } from 'lucide-react'

export default async function OverviewPage() {
  const supabase = createAdminClient()

  const weekStart = new Date()
  weekStart.setDate(weekStart.getDate() - 7)
  weekStart.setHours(0, 0, 0, 0)

  const [{ data: timeEntries }, { data: projects }] = await Promise.all([
    supabase
      .from('time_entries')
      .select(`
        id, duration_min, started_at, description, source,
        users(name),
        projects(name),
        activity_types(name)
      `)
      .gte('started_at', weekStart.toISOString())
      .eq('is_deleted', false)
      .order('started_at', { ascending: false })
      .limit(100),

    supabase
      .from('projects')
      .select('id, name')
      .eq('status', 'active')
      .eq('is_deleted', false),
  ])

  const totalMinutes =
    timeEntries?.reduce((sum, e) => sum + (e.duration_min || 0), 0) || 0
  const totalHours = Math.round((totalMinutes / 60) * 10) / 10

  const hoursByProject: Record<string, number> = {}
  for (const entry of timeEntries || []) {
    const name = (entry.projects as unknown as { name: string } | null)?.name ?? 'Sem projeto'
    hoursByProject[name] = (hoursByProject[name] || 0) + (entry.duration_min || 0) / 60
  }

  const chartData = Object.entries(hoursByProject)
    .map(([name, hours]) => ({ name, horas: Math.round(hours * 10) / 10 }))
    .sort((a, b) => b.horas - a.horas)
    .slice(0, 10)

  const now = new Date()
  const dateStr = now.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Page header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{
            fontSize: 22, fontWeight: 700, letterSpacing: '-0.025em',
            color: '#0A0A0B', margin: 0, marginBottom: 4,
          }}>
            Painel
          </h1>
          <p style={{ fontSize: 12, color: 'rgba(10,10,11,0.40)', margin: 0, textTransform: 'capitalize' }}>
            {dateStr} · últimos 7 dias
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* Refresh hint */}
          <form action="" method="get">
            <button
              type="submit"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '7px 13px', borderRadius: 8, cursor: 'pointer',
                background: '#fff', border: '1px solid rgba(10,10,11,0.10)',
                fontSize: 12, fontWeight: 500, color: 'rgba(10,10,11,0.55)',
                boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                transition: 'all 0.15s',
              }}
            >
              <RefreshCw style={{ width: 13, height: 13 }} />
              Atualizar
            </button>
          </form>
        </div>
      </div>

      <KpiCards
        totalHours={totalHours}
        activeProjects={projects?.length || 0}
        totalEntries={timeEntries?.length || 0}
      />

      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      <OverviewClient chartData={chartData} entries={(timeEntries || []) as any} />
    </div>
  )
}
