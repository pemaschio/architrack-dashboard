import { createClient } from '@/lib/supabase/server'
import { UsersTable } from '@/components/settings/users-table'
import { AddUserDialog } from '@/components/settings/add-user-dialog'

export default async function SettingsUsersPage() {
  const supabase = await createClient()

  const { data: users } = await supabase
    .from('users')
    .select('id, name, phone, role, hourly_rate, is_active, created_at')
    .order('created_at', { ascending: true })

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Usuários</h1>
          <p className="text-sm text-gray-500 mt-1">
            Gerencie os membros da equipe e seus perfis de acesso.
          </p>
        </div>
        <AddUserDialog />
      </div>

      <UsersTable users={users || []} />

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-700">
        <strong>Onboarding via WhatsApp:</strong> Pré-cadastre o usuário aqui com{' '}
        <code className="bg-blue-100 px-1 rounded">is_active = false</code>. O WF-06 ativa
        automaticamente quando o número enviar a primeira mensagem.
      </div>
    </div>
  )
}
