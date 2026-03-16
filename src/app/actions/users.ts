'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getAuthUserRecord } from '@/lib/supabase/get-auth-user'
import { revalidatePath } from 'next/cache'

export async function createUser(formData: FormData) {
  const name = formData.get('name') as string
  const phone = formData.get('phone') as string
  const role = formData.get('role') as string
  const hourlyRateRaw = formData.get('hourly_rate') as string
  const email = (formData.get('email') as string)?.trim() || null

  if (!name || !phone || !role) {
    throw new Error('Nome, telefone e perfil são obrigatórios.')
  }

  if ((role === 'director' || role === 'admin') && !email) {
    throw new Error('E-mail é obrigatório para Diretores e Admins (acesso ao dashboard).')
  }

  const authUser = await getAuthUserRecord()
  const supabase = await createClient()

  // Para diretores/admins: cria conta no Supabase Auth e vincula auth_id
  let authId: string | null = null
  if (email && (role === 'director' || role === 'admin')) {
    const adminClient = createAdminClient()
    const { data: authData, error: authError } = await adminClient.auth.admin.inviteUserByEmail(
      email,
      {
        data: { name, org_id: authUser.org_id, role },
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL ?? ''}/auth/confirm`,
      }
    )
    if (authError) {
      throw new Error(`Erro ao enviar convite: ${authError.message}`)
    }
    authId = authData.user.id
  }

  const { error } = await supabase.from('users').insert({
    org_id: authUser.org_id,
    name: name.trim(),
    phone: phone.trim().replace(/\D/g, ''),
    email,
    role,
    hourly_rate: hourlyRateRaw ? parseFloat(hourlyRateRaw) : null,
    is_active: false,
    auth_id: authId,
  })

  if (error) {
    if (error.code === '23505') throw new Error('Este telefone já está cadastrado.')
    throw new Error(error.message)
  }

  revalidatePath('/settings/users')
}
