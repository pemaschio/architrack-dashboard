'use client'

import { useState, useTransition, useRef } from 'react'
import { createProject } from '@/app/actions/projects'

interface Phase {
  id: string
  name: string
  display_order: number
}

interface Props {
  phases: Phase[]
}

export function AddProjectDialog({ phases }: Props) {
  const [open, setOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const formRef = useRef<HTMLFormElement>(null)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const formData = new FormData(e.currentTarget)
    startTransition(async () => {
      const result = await createProject(formData)
      if (result.error) {
        setError(result.error)
      } else {
        setOpen(false)
        formRef.current?.reset()
      }
    })
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 px-4 py-2 bg-stone-900 text-white text-sm font-medium rounded-lg hover:bg-[#292524] transition-colors"
      >
        + Novo Projeto
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 glass-backdrop"
            onClick={() => !isPending && setOpen(false)}
          />
          <div className="relative glass-modal p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-semibold text-stone-900 mb-1">Novo Projeto</h2>
            <p className="text-sm text-stone-400 mb-5">
              Preencha os dados do projeto. Campos marcados com{' '}
              <span className="text-red-500">*</span> são obrigatórios.
            </p>

            <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-stone-500 mb-1">
                  Nome do projeto <span className="text-red-500">*</span>
                </label>
                <input
                  name="name"
                  required
                  placeholder="Residência Silva"
                  className="w-full px-3 py-2 text-sm rounded-lg glass-input"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-500 mb-1">Cliente</label>
                <input
                  name="client_name"
                  placeholder="João Silva"
                  className="w-full px-3 py-2 text-sm rounded-lg glass-input"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-stone-500 mb-1">Status</label>
                  <select
                    name="status"
                    defaultValue="active"
                    className="w-full px-3 py-2 text-sm rounded-lg glass-input"
                  >
                    <option value="active">Ativo</option>
                    <option value="paused">Pausado</option>
                    <option value="completed">Concluído</option>
                    <option value="cancelled">Cancelado</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-stone-500 mb-1">Etapa</label>
                  <select
                    name="phase_id"
                    className="w-full px-3 py-2 text-sm rounded-lg glass-input"
                  >
                    <option value="">— Sem etapa —</option>
                    {phases.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-stone-500 mb-1">
                    Orçado (horas)
                  </label>
                  <input
                    name="budget_hours"
                    type="number"
                    step="1"
                    min="0"
                    placeholder="120"
                    className="w-full px-3 py-2 text-sm rounded-lg glass-input"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-stone-500 mb-1">
                    Orçado (R$)
                  </label>
                  <input
                    name="budget_value"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="50000,00"
                    className="w-full px-3 py-2 text-sm rounded-lg glass-input"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-stone-500 mb-1">
                    Data de início
                  </label>
                  <input
                    name="start_date"
                    type="date"
                    className="w-full px-3 py-2 text-sm rounded-lg glass-input"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-stone-500 mb-1">Prazo</label>
                  <input
                    name="deadline"
                    type="date"
                    className="w-full px-3 py-2 text-sm rounded-lg glass-input"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-500 mb-1">
                  Alerta de horas (%)
                </label>
                <input
                  name="alert_threshold"
                  type="number"
                  min="0"
                  max="100"
                  defaultValue="80"
                  className="w-full px-3 py-2 text-sm rounded-lg glass-input"
                />
                <p className="text-xs text-stone-400 mt-1">
                  Alerta será disparado quando % das horas orçadas for atingida
                </p>
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
