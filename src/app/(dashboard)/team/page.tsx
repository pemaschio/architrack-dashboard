import { createClient } from '@/lib/supabase/server'

export default async function TeamPage() {
  const supabase = await createClient()

  const { data: users } = await supabase
    .from('users')
    .select('id, name, phone, role, is_active, hourly_rate')
    .eq('is_active', true)
    .order('name')

  const roleLabels: Record<string, string> = {
    architect: 'Arquiteto',
    director: 'Diretor',
    admin: 'Admin',
  }

  const roleColors: Record<string, string> = {
    architect: 'bg-purple-100 text-purple-700',
    director: 'bg-blue-100 text-blue-700',
    admin: 'bg-orange-100 text-orange-700',
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Equipe</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {(users || []).map((user) => (
          <div
            key={user.id}
            className="bg-white rounded-lg border border-gray-200 p-5"
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <h2 className="font-medium text-gray-900">{user.name}</h2>
                <p className="text-xs text-gray-400 font-mono mt-0.5">{user.phone}</p>
              </div>
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                  roleColors[user.role] ?? 'bg-gray-100 text-gray-700'
                }`}
              >
                {roleLabels[user.role] ?? user.role}
              </span>
            </div>
            <div className="text-sm text-gray-500">
              {user.hourly_rate
                ? `R$ ${user.hourly_rate.toFixed(2).replace('.', ',')}/hora`
                : 'Valor/hora não definido'}
            </div>
          </div>
        ))}
        {(!users || users.length === 0) && (
          <div className="col-span-3 text-center text-gray-400 py-10">
            Nenhum membro ativo.
          </div>
        )}
      </div>
    </div>
  )
}
