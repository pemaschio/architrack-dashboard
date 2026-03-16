'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

const ORG_ID = '00000000-0000-0000-0000-000000000001'

export interface EntryFormData {
  users: { id: string; name: string }[]
  projects: { id: string; name: string }[]
  activityTypes: { id: string; name: string }[]
}

export async function fetchEntryFormData(): Promise<EntryFormData> {
  const supabase = createAdminClient()

  const [{ data: users }, { data: projects }, { data: activityTypes }] = await Promise.all([
    supabase
      .from('users')
      .select('id, name')
      .eq('is_active', true)
      .order('name'),
    supabase
      .from('projects')
      .select('id, name')
      .eq('is_deleted', false)
      .in('status', ['active', 'paused'])
      .order('name'),
    supabase
      .from('activity_types')
      .select('id, name')
      .eq('org_id', ORG_ID)
      .order('name'),
  ])

  return {
    users: users || [],
    projects: projects || [],
    activityTypes: activityTypes || [],
  }
}

export async function createTimeEntry(
  formData: FormData,
): Promise<{ error: string | null }> {
  const userId = formData.get('user_id') as string
  const projectId = formData.get('project_id') as string
  const hours = parseInt((formData.get('hours') as string) || '0', 10)
  const minutes = parseInt((formData.get('minutes') as string) || '0', 10)
  const durationMin = hours * 60 + minutes
  const date = formData.get('date') as string
  const description = (formData.get('description') as string)?.trim() || null
  const activityTypeId = (formData.get('activity_type_id') as string) || null

  if (!userId) return { error: 'Selecione um arquiteto.' }
  if (!projectId) return { error: 'Selecione um projeto.' }
  if (durationMin <= 0) return { error: 'A duração deve ser maior que zero.' }
  if (!date) return { error: 'Informe a data do lançamento.' }

  // Combine date with noon time to avoid timezone issues
  const startedAt = new Date(`${date}T12:00:00`)

  try {
    const supabase = createAdminClient()

    const { error } = await supabase.from('time_entries').insert({
      org_id: ORG_ID,
      user_id: userId,
      project_id: projectId,
      activity_type_id: activityTypeId || null,
      started_at: startedAt.toISOString(),
      duration_min: durationMin,
      description,
      source: 'dashboard',
      is_deleted: false,
    })

    if (error) {
      console.error('createTimeEntry error:', error)
      return { error: 'Erro ao salvar lançamento. Tente novamente.' }
    }

    revalidatePath('/overview')
    revalidatePath('/projects')
    return { error: null }
  } catch (err) {
    console.error('createTimeEntry exception:', err)
    return { error: 'Erro inesperado. Tente novamente.' }
  }
}
