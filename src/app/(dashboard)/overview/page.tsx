import { createClient } from '@/lib/supabase/server'
import { KpiCards } from '@/components/overview/kpi-cards'
import { OverviewClient } from '@/components/overview/overview-client'
import { RefreshCw } from 'lucide-react'

export default async function OverviewPage() {
  const supabase = await createClient()

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
    <div className="flex flex-col gap-5">
      {/* Page header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-page-title mb-1">
            Painel
          </h1>
          <p className="text-label capitalize">
            {dateStr} · últimos 7 dias
          </p>
        </div>

        <form action="" method="get">
          <button
            type="submit"
            className="inline-flex items-center gap-1.5 px-3 py-[7px] rounded-lg cursor-pointer glass glass-hover text-xs font-medium text-stone-500 border-none"
          >
            <RefreshCw className="w-[13px] h-[13px]" />
            Atualizar
          </button>
        </form>
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
