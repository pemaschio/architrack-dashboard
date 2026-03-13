import { createAdminClient } from '@/lib/supabase/admin'
import { ProjectsTable } from '@/components/projects/projects-table'
import { AddProjectDialog } from '@/components/settings/add-project-dialog'

export default async function ProjectsPage() {
  const supabase = createAdminClient()

  const [{ data: projects }, { data: phases }] = await Promise.all([
    supabase
      .from('projects')
      .select(`
        id, name, client_name, status, budget_hours, alert_threshold, created_at,
        project_phases(name),
        time_entries(duration_min, is_deleted)
      `)
      .eq('is_deleted', false)
      .order('created_at', { ascending: false }),
    supabase
      .from('project_phases')
      .select('id, name, display_order')
      .order('display_order', { ascending: true }),
  ])

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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h1
          style={{
            fontSize: 20,
            fontWeight: 500,
            letterSpacing: '-0.02em',
            color: '#0A0A0B',
            margin: 0,
          }}
        >
          Projetos
        </h1>
        <AddProjectDialog phases={phases || []} />
      </div>
      <ProjectsTable projects={projectsWithHours} />
    </div>
  )
}
