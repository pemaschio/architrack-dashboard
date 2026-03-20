import { createClient } from '@/lib/supabase/server'
import { SettingsProjectsTable } from '@/components/settings/settings-projects-table'
import { AddProjectDialog } from '@/components/settings/add-project-dialog'

export default async function SettingsProjectsPage() {
  const supabase = await createClient()

  const [{ data: projects }, { data: phases }] = await Promise.all([
    supabase
      .from('projects')
      .select(`
        id, name, client_name, status, budget_hours, budget_value,
        alert_threshold, start_date, deadline, is_deleted,
        project_phases(name)
      `)
      .eq('is_deleted', false)
      .order('created_at', { ascending: false }),

    supabase
      .from('project_phases')
      .select('id, name, display_order')
      .eq('is_active', true)
      .order('display_order'),
  ])

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-page-title">Projetos</h1>
          <p className="text-sm text-stone-400 mt-1">
            Cadastre e edite os projetos da organização.
          </p>
        </div>
        <AddProjectDialog phases={phases || []} />
      </div>

      <SettingsProjectsTable projects={projects || []} phases={phases || []} />
    </div>
  )
}
