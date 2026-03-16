import { createAdminClient } from '@/lib/supabase/admin'
import { ProjectsTable } from '@/components/projects/projects-table'
import { AddProjectDialog } from '@/components/settings/add-project-dialog'
import { FolderOpen } from 'lucide-react'

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
    const raw = p.time_entries
    const entries: { duration_min: number; is_deleted: boolean }[] = Array.isArray(raw) ? raw : []
    const validEntries = entries.filter((e) => !e.is_deleted)
    const totalMin = validEntries.reduce((sum, e) => sum + (e.duration_min || 0), 0)
    const totalHours = Math.round((totalMin / 60) * 10) / 10
    const percentage = p.budget_hours
      ? Math.round((totalHours / p.budget_hours) * 100)
      : null
    return { ...p, total_hours: totalHours, percentage }
  })

  const activeCount = projectsWithHours.filter((p) => p.status === 'active').length
  const totalCount = projectsWithHours.length

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Page header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <h1 style={{
              fontSize: 22, fontWeight: 700, letterSpacing: '-0.025em',
              color: '#0A0A0B', margin: 0,
            }}>
              Projetos
            </h1>
            {/* Count badges */}
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 4,
              padding: '2px 8px', borderRadius: 999,
              background: '#dcfce7', color: '#15803d',
              fontSize: 11, fontWeight: 700,
            }}>
              <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#16A34A', display: 'inline-block' }} />
              {activeCount} ativos
            </span>
            <span style={{
              fontSize: 11, fontWeight: 600, color: 'rgba(10,10,11,0.38)',
              padding: '2px 7px', background: 'rgba(10,10,11,0.05)', borderRadius: 999,
            }}>
              {totalCount} total
            </span>
          </div>
          <p style={{ fontSize: 12, color: 'rgba(10,10,11,0.40)', margin: 0 }}>
            Clique em um projeto para ver os detalhes
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <AddProjectDialog phases={phases || []} />
        </div>
      </div>

      <ProjectsTable projects={projectsWithHours} />

      {/* Empty state hint */}
      {projectsWithHours.length === 0 && (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          gap: 12, padding: '60px 20px', textAlign: 'center',
        }}>
          <FolderOpen style={{ width: 40, height: 40, color: '#e2e8f0' }} />
          <p style={{ fontSize: 15, fontWeight: 600, color: '#374151' }}>Nenhum projeto ainda</p>
          <p style={{ fontSize: 13, color: '#9ca3af' }}>Crie seu primeiro projeto usando o botão acima.</p>
        </div>
      )}
    </div>
  )
}
