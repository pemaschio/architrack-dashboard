import { createAdminClient } from '@/lib/supabase/admin'
import { KpiCards } from '@/components/overview/kpi-cards'
import { OverviewClient } from '@/components/overview/overview-client'
import { RefreshCw } from 'lucide-react'

export default async function OverviewPage() {
  const supabase = createAdminClient()

  const weekStart = new Date()
  weekStart.setDate(weekStart.getDate() - 7)
  weekStart.setHours(0, 0, 0, 0)

  const [
    { data: timeEntries },
    { data: projectsRaw },
    { data: allTimeEntries },
  ] = await Promise.all([
    // 7-day entries for the table
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

    // Active projects with full budget data
    supabase
      .from('projects')
      .select('id, name, client_name, status, budget_hours, budget_value, alert_threshold')
      .eq('status', 'active')
      .eq('is_deleted', false),

    // All-time entries for project consumption (project_id + duration only)
    supabase
      .from('time_entries')
      .select('project_id, duration_min')
      .eq('is_deleted', false)
      .not('project_id', 'is', null),
  ])

  // Aggregate all-time minutes per project_id
  const minutesByProjectId: Record<string, number> = {}
  for (const e of allTimeEntries || []) {
    if (e.project_id) {
      minutesByProjectId[e.project_id] = (minutesByProjectId[e.project_id] || 0) + (e.duration_min || 0)
    }
  }

  const projectsWithStats = (projectsRaw || []).map((p) => ({
    id: p.id,
    name: p.name,
    client_name: p.client_name,
    budget_hours: p.budget_hours,
    budget_value: p.budget_value,
    alert_threshold: p.alert_threshold ?? 80,
    total_minutes: minutesByProjectId[p.id] || 0,
  }))

  const totalMinutes = timeEntries?.reduce((sum, e) => sum + (e.duration_min || 0), 0) || 0
  const totalHours = Math.round((totalMinutes / 60) * 10) / 10

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
        activeProjects={projectsWithStats.length}
        totalEntries={timeEntries?.length || 0}
      />

      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      <OverviewClient entries={(timeEntries || []) as any} projectsWithStats={projectsWithStats} />
    </div>
  )
}
