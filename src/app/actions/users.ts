'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

const ORG_ID = '00000000-0000-0000-0000-000000000001'

export async function createUser(formData: FormData) {
  const name = formData.get('name') as string
  const phone = formData.get('phone') as string
  const role = formData.get('role') as string
  const hourlyRateRaw = formData.get('hourly_rate') as string

  if (!name || !phone || !role) {
    throw new Error('Nome, telefone e perfil são obrigatórios.')
  }

  const supabase = createAdminClient()

  const { error } = await supabase.from('users').insert({
    org_id: ORG_ID,
    name: name.trim(),
    phone: phone.trim().replace(/\D/g, ''),
    role,
    hourly_rate: hourlyRateRaw ? parseFloat(hourlyRateRaw) : null,
    is_active: false,
  })

  if (error) {
    if (error.code === '23505') throw new Error('Este telefone já está cadastrado.')
    throw new Error(error.message)
  }

  revalidatePath('/settings/users')
}
