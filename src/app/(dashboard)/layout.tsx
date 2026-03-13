import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Sidebar } from '@/components/layout/sidebar'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  let user = null
  try {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.getUser()
    if (error) console.error('[layout] auth.getUser error:', error)
    user = data?.user ?? null
  } catch (e) {
    console.error('[layout] createClient/getUser threw:', e)
  }

  if (!user) redirect('/login')

  return (
    <div className="flex h-screen" style={{ background: '#F6F6F7' }}>
      <Sidebar />
      <main className="flex-1 overflow-auto" style={{ padding: '28px 28px' }}>
        {children}
      </main>
    </div>
  )
}
