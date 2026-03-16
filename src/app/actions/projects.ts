'use server'

import { createClient } from '@/lib/supabase/server'
import { getAuthUserRecord } from '@/lib/supabase/get-auth-user'
import { revalidatePath } from 'next/cache'

export async function createProject(
  formData: FormData,
): Promise<{ error: string | null }> {
  const name = formData.get('name') as string

  if (!name) {
    return { error: 'Nome do projeto é obrigatório.' }
  }

  const budgetHoursRaw = formData.get('budget_hours') as string
  const budgetValueRaw = formData.get('budget_value') as string
  const alertThresholdRaw = formData.get('alert_threshold') as string
  const phaseId = formData.get('phase_id') as string
  const startDate = formData.get('start_date') as string
  const deadline = formData.get('deadline') as string

  try {
    const authUser = await getAuthUserRecord()
    const supabase = await createClient()

    const { error } = await supabase.from('projects').insert({
      org_id: authUser.org_id,
      name: name.trim(),
      client_name: (formData.get('client_name') as string)?.trim() || null,
      status: (formData.get('status') as string) || 'active',
      budget_hours: budgetHoursRaw ? parseInt(budgetHoursRaw, 10) : null,
      budget_value: budgetValueRaw ? parseFloat(budgetValueRaw) : null,
      alert_threshold: alertThresholdRaw ? parseInt(alertThresholdRaw) : 80,
      phase_id: phaseId || null,
      start_date: startDate || null,
      deadline: deadline || null,
      is_deleted: false,
    })

    if (error) {
      return { error: error.message }
    }

    revalidatePath('/settings/projects')
    revalidatePath('/projects')
    return { error: null }
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Erro inesperado ao salvar projeto.' }
  }
}
