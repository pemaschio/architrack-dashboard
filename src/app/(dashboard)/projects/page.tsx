import { createAdminClient } from '@/lib/supabase/admin'
import { ProjectsTable } from '@/components/projects/projects-table'

export default async function ProjectsPage() {
  const supabase = createAdminClient()

  const { data: projects } = await supabase
    .from('projects')
    .select(`
      id, name, client_name, status, budget_hours, alert_threshold, created_at,
      project_phases(name),
      time_entries(duration_min, is_deleted)
    `)
    .eq('is_deleted', false)
    .order('created_at', { ascending: false })

  const projectsWithHours = (projects || []).map((p) => {
    const entries = (p.time_entries as { duration_min: number; is_deleted: boolean }[]) || []
    const validEntries = entries.filter((e) => !e.is_deleted)
    const totalMin = validEntries.reduce((sum, e) => sum + (e.duration_min || 0), 0)
    const totalHours = Math.round((totalMin / 60) * 10) / 10
    const percentage = p.budget_hours
      ? Math.round((totalHours / p.budget_hours) * 100)
      : null
    return { ...p, total_hours: totalHours, percentage }
  })

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Projetos</h1>
      </div>
      <ProjectsTable projects={projectsWithHours} />
    </div>
  )
}
