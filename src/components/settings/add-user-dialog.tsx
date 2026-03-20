'use client'

import { useState, useTransition, useRef } from 'react'
import { createUser } from '@/app/actions/users'

export function AddUserDialog() {
  const [open, setOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const [selectedRole, setSelectedRole] = useState('architect')
  const formRef = useRef<HTMLFormElement>(null)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const formData = new FormData(e.currentTarget)
    startTransition(async () => {
      try {
        await createUser(formData)
        setOpen(false)
        setSelectedRole('architect')
        formRef.current?.reset()
      } catch (err) {
        setError((err as Error).message)
      }
    })
  }

  const needsEmail = selectedRole === 'director' || selectedRole === 'admin'

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 px-4 py-2 bg-stone-900 text-white text-sm font-medium rounded-lg hover:bg-[#292524] transition-colors"
      >
        + Adicionar Membro
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 glass-backdrop"
            onClick={() => !isPending && setOpen(false)}
          />
          <div className="relative glass-modal p-6 w-full max-w-md mx-4">
            <h2 className="text-lg font-semibold text-stone-900 mb-1">Adicionar Membro</h2>
            <p className="text-sm text-stone-400 mb-5">
              Arquitetos são ativados via WhatsApp. Diretores e admins recebem um convite por
              e-mail para acessar o dashboard.
            </p>

            <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-stone-500 mb-1">
                  Nome <span className="text-red-500">*</span>
                </label>
                <input
                  name="name"
                  required
                  placeholder="Ana Souza"
                  className="w-full px-3 py-2 text-sm rounded-lg glass-input"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-500 mb-1">
                  Telefone WhatsApp <span className="text-red-500">*</span>
                </label>
                <input
                  name="phone"
                  required
                  placeholder="5511999990000"
                  className="w-full px-3 py-2 text-sm font-mono rounded-lg glass-input"
                />
                <p className="text-xs text-stone-400 mt-1">Formato: código do país + DDD + número</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-500 mb-1">
                  Perfil <span className="text-red-500">*</span>
                </label>
                <select
                  name="role"
                  required
                  defaultValue="architect"
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg glass-input"
                >
                  <option value="architect">Arquiteto</option>
                  <option value="director">Diretor</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              {needsEmail && (
                <div>
                  <label className="block text-sm font-medium text-stone-500 mb-1">
                    E-mail <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="email"
                    type="email"
                    required={needsEmail}
                    placeholder="carlos@exemplo.com"
                    className="w-full px-3 py-2 text-sm rounded-lg glass-input"
                  />
                  <p className="text-xs text-stone-400 mt-1">
                    Um convite de acesso ao dashboard será enviado para este e-mail.
                  </p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-stone-500 mb-1">
                  Valor/hora (R$)
                </label>
                <input
                  name="hourly_rate"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0,00"
                  className="w-full px-3 py-2 text-sm rounded-lg glass-input"
                />
              </div>

              {error && (
                <p className="text-sm text-red-600 bg-red-500/[0.08] border border-red-200 rounded-lg px-3 py-2">
                  {error}
                </p>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  disabled={isPending}
                  className="px-4 py-2 text-sm font-medium text-stone-500 hover:bg-stone-300/15 rounded-lg transition-colors disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-4 py-2 text-sm font-medium text-white bg-stone-900 rounded-lg hover:bg-[#292524] transition-colors disabled:opacity-50"
                >
                  {isPending ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
