import { createClient } from '@/lib/supabase/server'
import { UserCardList } from '@/components/team/user-card-list'
import { AddUserDialog } from '@/components/settings/add-user-dialog'

export default async function TeamPage() {
  const supabase = await createClient()

  const { data: users } = await supabase
    .from('users')
    .select('id, name, phone, role, is_active, hourly_rate')
    .eq('is_active', true)
    .order('name')

  const total = users?.length || 0
  const architects = users?.filter((u) => u.role === 'architect').length || 0
  const directors = users?.filter((u) => u.role === 'director').length || 0

  return (
    <div className="flex flex-col gap-5">
      {/* Page header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <h1 className="text-page-title">
              Equipe
            </h1>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-terra-subtle text-terra">
              {total} membros
            </span>
          </div>
          <p className="text-xs text-stone-400">
            {architects > 0 && `${architects} arquiteto${architects !== 1 ? 's' : ''}`}
            {architects > 0 && directors > 0 && ' · '}
            {directors > 0 && `${directors} diretor${directors !== 1 ? 'es' : ''}`}
            {' · Clique em um membro para ver detalhes'}
          </p>
        </div>

        <AddUserDialog />
      </div>

      <UserCardList users={users || []} />
    </div>
  )
}
