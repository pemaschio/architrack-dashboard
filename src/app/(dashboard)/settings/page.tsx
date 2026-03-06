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
      <h1 className="text-2xl font-bold text-gray-900">Configurações</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {settingsLinks.map(({ href, label, description, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="bg-white rounded-lg border border-gray-200 p-5 hover:border-blue-300 hover:shadow-sm transition-all group"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-blue-50 p-2 rounded-md group-hover:bg-blue-100 transition-colors">
                <Icon className="w-5 h-5 text-blue-600" />
              </div>
              <h2 className="font-medium text-gray-900">{label}</h2>
            </div>
            <p className="text-sm text-gray-500">{description}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
