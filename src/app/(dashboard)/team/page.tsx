import { createAdminClient } from '@/lib/supabase/admin'
import { UserCardList } from '@/components/team/user-card-list'

export default async function TeamPage() {
  const supabase = createAdminClient()

  const { data: users } = await supabase
    .from('users')
    .select('id, name, phone, role, is_active, hourly_rate')
    .eq('is_active', true)
    .order('name')

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Equipe</h1>
      <UserCardList users={users || []} />
    </div>
  )
}
