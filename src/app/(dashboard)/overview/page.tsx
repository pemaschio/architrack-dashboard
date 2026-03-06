import { createClient } from '@/lib/supabase/server'
import { KpiCards } from '@/components/overview/kpi-cards'
import { TimeEntriesTable } from '@/components/overview/time-entries-table'
import { HoursBarChart } from '@/components/overview/hours-bar-chart'

export default async function OverviewPage() {
  const supabase = await createClient()

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
      .limit(50),

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
    const name = (entry.projects as { name: string } | null)?.name ?? 'Sem projeto'
    hoursByProject[name] = (hoursByProject[name] || 0) + (entry.duration_min || 0) / 60
  }

  const chartData = Object.entries(hoursByProject)
    .map(([name, hours]) => ({ name, horas: Math.round(hours * 10) / 10 }))
    .sort((a, b) => b.horas - a.horas)
    .slice(0, 10)

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Painel</h1>

      <KpiCards
        totalHours={totalHours}
        activeProjects={projects?.length || 0}
        totalEntries={timeEntries?.length || 0}
      />

      <div className="grid grid-cols-1 gap-6">
        <HoursBarChart data={chartData} />
        <TimeEntriesTable entries={timeEntries || []} />
      </div>
    </div>
  )
}
