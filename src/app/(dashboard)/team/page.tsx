import { createAdminClient } from '@/lib/supabase/admin'
import { UserCardList } from '@/components/team/user-card-list'
import { AddUserDialog } from '@/components/settings/add-user-dialog'

export default async function TeamPage() {
  const supabase = createAdminClient()

  const { data: users } = await supabase
    .from('users')
    .select('id, name, phone, role, is_active, hourly_rate')
    .eq('is_active', true)
    .order('name')

  const total = users?.length || 0
  const architects = users?.filter((u) => u.role === 'architect').length || 0
  const directors = users?.filter((u) => u.role === 'director').length || 0

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Page header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <h1 style={{
              fontSize: 22, fontWeight: 700, letterSpacing: '-0.025em',
              color: '#0A0A0B', margin: 0,
            }}>
              Equipe
            </h1>
            <span style={{
              fontSize: 11, fontWeight: 700,
              padding: '2px 8px', borderRadius: 999,
              background: 'rgba(181,97,74,0.10)', color: '#B5614A',
            }}>
              {total} membros
            </span>
          </div>
          <p style={{ fontSize: 12, color: 'rgba(10,10,11,0.40)', margin: 0 }}>
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
