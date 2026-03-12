'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

export async function createProject(formData: FormData) {
  const name = formData.get('name') as string

  if (!name) {
    throw new Error('Nome do projeto é obrigatório.')
  }

  const budgetHoursRaw = formData.get('budget_hours') as string
  const budgetValueRaw = formData.get('budget_value') as string
  const alertThresholdRaw = formData.get('alert_threshold') as string
  const phaseId = formData.get('phase_id') as string
  const startDate = formData.get('start_date') as string
  const deadline = formData.get('deadline') as string

  const supabase = createAdminClient()

  const { error } = await supabase.from('projects').insert({
    name: name.trim(),
    client_name: (formData.get('client_name') as string)?.trim() || null,
    status: (formData.get('status') as string) || 'active',
    budget_hours: budgetHoursRaw ? parseFloat(budgetHoursRaw) : null,
    budget_value: budgetValueRaw ? parseFloat(budgetValueRaw) : null,
    alert_threshold: alertThresholdRaw ? parseInt(alertThresholdRaw) : 80,
    phase_id: phaseId || null,
    start_date: startDate || null,
    deadline: deadline || null,
    is_deleted: false,
  })

  if (error) throw new Error(error.message)

  revalidatePath('/settings/projects')
  revalidatePath('/projects')
}
