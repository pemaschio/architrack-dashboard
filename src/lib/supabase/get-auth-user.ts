'use server'

import { createClient } from './server'
import { redirect } from 'next/navigation'

export interface AuthUserRecord {
  id: string
  org_id: string
  role: 'architect' | 'director' | 'admin'
  name: string
}

/**
 * Retorna o registro do usuário logado na tabela `users`.
 * Lança redirect para /login se não autenticado.
 * Lança erro se o perfil não existir (auth_id não vinculado).
 */
export async function getAuthUserRecord(): Promise<AuthUserRecord> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data, error } = await supabase
    .from('users')
    .select('id, org_id, role, name')
    .eq('auth_id', user.id)
    .single()

  if (error || !data) {
    throw new Error(
      'Perfil de usuário não encontrado. Contate o administrador para vincular sua conta.'
    )
  }

  return data as AuthUserRecord
}
