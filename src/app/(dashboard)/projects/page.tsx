import { createClient } from '@/lib/supabase/server'
import { ProjectsTable } from '@/components/projects/projects-table'
import { AddProjectDialog } from '@/components/settings/add-project-dialog'
import { FolderOpen } from 'lucide-react'

export default async function ProjectsPage() {
  const supabase = await createClient()

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
    <div className="flex flex-col gap-5">
      {/* Page header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <h1 className="text-page-title">
              Projetos
            </h1>
            {/* Count badges */}
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-600/[0.08] text-green-700 text-[11px] font-bold">
              <span className="inline-block w-[5px] h-[5px] rounded-full" style={{ background: '#16A34A' }} />
              {activeCount} ativos
            </span>
            <span className="text-[11px] font-semibold text-stone-400 px-[7px] py-0.5 bg-stone-300/15 rounded-full">
              {totalCount} total
            </span>
          </div>
          <p className="text-xs text-stone-400">
            Clique em um projeto para ver os detalhes
          </p>
        </div>

        <div className="flex items-center gap-2">
          <AddProjectDialog phases={phases || []} />
        </div>
      </div>

      <ProjectsTable projects={projectsWithHours} />

      {/* Empty state hint */}
      {projectsWithHours.length === 0 && (
        <div className="flex flex-col items-center gap-3 py-[60px] px-5 text-center">
          <FolderOpen className="w-10 h-10 text-slate-200" />
          <p className="text-[15px] font-semibold text-gray-700">Nenhum projeto ainda</p>
          <p className="text-[13px] text-gray-400">Crie seu primeiro projeto usando o botão acima.</p>
        </div>
      )}
    </div>
  )
}
