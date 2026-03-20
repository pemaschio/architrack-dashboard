import Link from 'next/link'
import { Users, FolderOpen } from 'lucide-react'

const settingsLinks = [
  {
    href: '/settings/users',
    label: 'Usuários',
    description: 'Gerencie membros da equipe e perfis de acesso',
    icon: Users,
  },
  {
    href: '/settings/projects',
    label: 'Projetos',
    description: 'Cadastre e configure projetos da organização',
    icon: FolderOpen,
  },
]

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-page-title">Configurações</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {settingsLinks.map(({ href, label, description, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="glass glass-hover p-5 group no-underline block"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-terra-subtle p-2 rounded-md">
                <Icon className="w-5 h-5 text-terra" />
              </div>
              <h2 className="font-medium text-stone-900">{label}</h2>
            </div>
            <p className="text-sm text-stone-400">{description}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
