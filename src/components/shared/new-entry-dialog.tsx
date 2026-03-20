'use client'

import { useState, useTransition, useRef, useEffect } from 'react'
import { X, Clock, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'
import { fetchEntryFormData, createTimeEntry, type EntryFormData } from '@/app/actions/entries'

interface Props {
  open: boolean
  onClose: () => void
  /** Pré-selecionar projeto ao abrir pelo painel de projeto */
  defaultProjectId?: string
  defaultProjectName?: string
}

export function NewEntryDialog({ open, onClose, defaultProjectId, defaultProjectName }: Props) {
  const [formData, setFormData] = useState<EntryFormData | null>(null)
  const [loadingData, setLoadingData] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isPending, startTransition] = useTransition()
  const formRef = useRef<HTMLFormElement>(null)

  // Load users/projects/activity_types when dialog opens
  useEffect(() => {
    if (!open) return
    setError(null)
    setSuccess(false)
    setLoadingData(true)
    fetchEntryFormData().then((data) => {
      setFormData(data)
      setLoadingData(false)
    })
  }, [open])

  // Today's date for default
  const today = new Date().toISOString().split('T')[0]

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const data = new FormData(e.currentTarget)
    startTransition(async () => {
      const result = await createTimeEntry(data)
      if (result.error) {
        setError(result.error)
      } else {
        setSuccess(true)
        formRef.current?.reset()
        setTimeout(() => {
          setSuccess(false)
          onClose()
        }, 1200)
      }
    })
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 glass-backdrop"
        onClick={() => !isPending && onClose()}
      />

      {/* Modal */}
      <div className="relative glass-modal w-full max-w-[520px] mx-4 max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-[22px] pt-[18px] pb-4 flex items-start justify-between shrink-0">
          <div>
            <div className="flex items-center gap-2 mb-[3px]">
              <div className="w-8 h-8 rounded-[9px] bg-blue-700/10 flex items-center justify-center">
                <Clock className="w-4 h-4 text-blue-700" />
              </div>
              <h2 className="text-base font-bold text-slate-900">
                Novo Lançamento
              </h2>
            </div>
            <p className="text-xs text-stone-400 ml-10">
              {defaultProjectName
                ? `Registrando horas em: ${defaultProjectName}`
                : 'Registre horas trabalhadas diretamente pelo dashboard'}
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={isPending}
            className="w-[30px] h-[30px] rounded-full bg-stone-300/15 text-stone-500 flex items-center justify-center transition-colors hover:bg-stone-300/25 border-none cursor-pointer shrink-0"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Gradient divider */}
        <div className="gradient-divider" />

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-[22px] py-5">
          {/* Loading state */}
          {loadingData && (
            <div className="flex items-center justify-center h-40 gap-2.5 text-stone-400">
              <Loader2 className="w-[18px] h-[18px] animate-spin" />
              <span className="text-[13px]">Carregando dados...</span>
            </div>
          )}

          {/* Success state */}
          {success && (
            <div className="flex flex-col items-center justify-center h-40 gap-2.5">
              <CheckCircle2 className="w-10 h-10 text-green-600" />
              <p className="text-[15px] font-semibold text-gray-900">Lançamento registrado!</p>
              <p className="text-xs text-stone-400">O dashboard será atualizado automaticamente.</p>
            </div>
          )}

          {/* Form */}
          {!loadingData && !success && formData && (
            <form ref={formRef} onSubmit={handleSubmit}>
              <div className="flex flex-col gap-4">

                {/* Arquiteto */}
                <div>
                  <label className="block text-xs font-semibold text-stone-500 mb-1.5">
                    Arquiteto <span className="text-red-500">*</span>
                  </label>
                  <select name="user_id" required className="w-full px-3 py-2 text-[13px] text-stone-900 font-sans glass-input">
                    <option value="">— Selecione —</option>
                    {formData.users.map((u) => (
                      <option key={u.id} value={u.id}>{u.name}</option>
                    ))}
                  </select>
                </div>

                {/* Projeto */}
                <div>
                  <label className="block text-xs font-semibold text-stone-500 mb-1.5">
                    Projeto <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="project_id"
                    required
                    defaultValue={defaultProjectId || ''}
                    className="w-full px-3 py-2 text-[13px] text-stone-900 font-sans glass-input"
                  >
                    <option value="">— Selecione —</option>
                    {formData.projects.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>

                {/* Tipo de atividade */}
                {formData.activityTypes.length > 0 && (
                  <div>
                    <label className="block text-xs font-semibold text-stone-500 mb-1.5">Tipo de atividade</label>
                    <select
                      name="activity_type_id"
                      className="w-full px-3 py-2 text-[13px] text-stone-900 font-sans glass-input"
                    >
                      <option value="">— Sem tipo —</option>
                      {formData.activityTypes.map((a) => (
                        <option key={a.id} value={a.id}>{a.name}</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Data */}
                <div>
                  <label className="block text-xs font-semibold text-stone-500 mb-1.5">
                    Data <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="date"
                    type="date"
                    required
                    defaultValue={today}
                    className="w-full px-3 py-2 text-[13px] text-stone-900 font-sans glass-input"
                  />
                </div>

                {/* Duração */}
                <div>
                  <label className="block text-xs font-semibold text-stone-500 mb-1.5">
                    Duração <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="relative">
                      <input
                        name="hours"
                        type="number"
                        min="0"
                        max="23"
                        defaultValue="1"
                        placeholder="0"
                        className="w-full px-3 py-2 pr-9 text-[13px] text-stone-900 font-sans glass-input"
                      />
                      <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[11px] font-semibold text-stone-400 pointer-events-none">h</span>
                    </div>
                    <div className="relative">
                      <input
                        name="minutes"
                        type="number"
                        min="0"
                        max="59"
                        defaultValue="0"
                        placeholder="0"
                        className="w-full px-3 py-2 pr-10 text-[13px] text-stone-900 font-sans glass-input"
                      />
                      <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[11px] font-semibold text-stone-400 pointer-events-none">min</span>
                    </div>
                  </div>
                </div>

                {/* Descrição */}
                <div>
                  <label className="block text-xs font-semibold text-stone-500 mb-1.5">Descrição</label>
                  <textarea
                    name="description"
                    placeholder="Ex: Detalhamento de cozinha, revisão de projeto..."
                    rows={3}
                    className="w-full px-3 py-2 text-[13px] text-stone-900 font-sans glass-input resize-y leading-relaxed"
                  />
                </div>

                {/* Error */}
                {error && (
                  <div className="flex items-center gap-2 p-2.5 px-3 rounded-lg bg-red-500/[0.08] border border-red-200 text-[13px] text-red-600">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    {error}
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2.5 justify-end pt-1">
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={isPending}
                    className="px-[18px] py-[9px] rounded-[9px] glass glass-hover text-[13px] font-semibold text-stone-500 border-none cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isPending}
                    className="px-[22px] py-[9px] rounded-[9px] bg-stone-900 text-white text-[13px] font-semibold border-none cursor-pointer transition-colors hover:bg-[#292524] disabled:opacity-50 flex items-center gap-[7px]"
                  >
                    {isPending && <Loader2 className="w-[13px] h-[13px] animate-spin" />}
                    {isPending ? 'Salvando...' : 'Registrar horas'}
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
