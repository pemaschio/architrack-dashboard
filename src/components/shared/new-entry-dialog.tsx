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

const INPUT = {
  width: '100%',
  border: '1px solid #e2e8f0',
  borderRadius: 8,
  padding: '8px 12px',
  fontSize: 13,
  color: '#111827',
  background: '#fff',
  outline: 'none',
  boxSizing: 'border-box' as const,
  transition: 'border-color 0.15s',
}

const LABEL = {
  display: 'block',
  fontSize: 12,
  fontWeight: 600,
  color: '#374151',
  marginBottom: 5,
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
    <div style={{
      position: 'fixed', inset: 0, zIndex: 60,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      {/* Backdrop */}
      <div
        style={{ position: 'absolute', inset: 0, background: 'rgba(15,23,42,0.45)', backdropFilter: 'blur(2px)' }}
        onClick={() => !isPending && onClose()}
      />

      {/* Modal */}
      <div style={{
        position: 'relative', background: '#fff', borderRadius: 16,
        width: '100%', maxWidth: 520, margin: '0 16px',
        boxShadow: '0 24px 64px rgba(0,0,0,0.20)',
        overflow: 'hidden', maxHeight: '90vh', display: 'flex', flexDirection: 'column',
      }}>
        {/* Header */}
        <div style={{
          padding: '18px 22px 16px',
          borderBottom: '1px solid #f1f5f9',
          display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
          flexShrink: 0,
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
              <div style={{
                width: 32, height: 32, borderRadius: 9,
                background: 'rgba(29,78,216,0.10)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Clock style={{ width: 16, height: 16, color: '#1d4ed8' }} />
              </div>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: 0 }}>
                Novo Lançamento
              </h2>
            </div>
            <p style={{ fontSize: 12, color: '#94a3b8', margin: 0, marginLeft: 40 }}>
              {defaultProjectName
                ? `Registrando horas em: ${defaultProjectName}`
                : 'Registre horas trabalhadas diretamente pelo dashboard'}
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={isPending}
            style={{
              width: 30, height: 30, borderRadius: '50%', border: 'none', cursor: 'pointer',
              background: '#f1f5f9', color: '#64748b',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.15s', flexShrink: 0,
            }}
          >
            <X style={{ width: 14, height: 14 }} />
          </button>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 22px' }}>
          {/* Loading state */}
          {loadingData && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 160, gap: 10, color: '#94a3b8' }}>
              <Loader2 style={{ width: 18, height: 18, animation: 'spin 1s linear infinite' }} />
              <span style={{ fontSize: 13 }}>Carregando dados...</span>
            </div>
          )}

          {/* Success state */}
          {success && (
            <div style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              justifyContent: 'center', height: 160, gap: 10,
            }}>
              <CheckCircle2 style={{ width: 40, height: 40, color: '#16a34a' }} />
              <p style={{ fontSize: 15, fontWeight: 600, color: '#111827' }}>Lançamento registrado!</p>
              <p style={{ fontSize: 12, color: '#94a3b8' }}>O dashboard será atualizado automaticamente.</p>
            </div>
          )}

          {/* Form */}
          {!loadingData && !success && formData && (
            <form ref={formRef} onSubmit={handleSubmit}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

                {/* Arquiteto */}
                <div>
                  <label style={LABEL}>
                    Arquiteto <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <select name="user_id" required style={INPUT}
                    onFocus={e => (e.target.style.borderColor = '#1d4ed8')}
                    onBlur={e => (e.target.style.borderColor = '#e2e8f0')}
                  >
                    <option value="">— Selecione —</option>
                    {formData.users.map((u) => (
                      <option key={u.id} value={u.id}>{u.name}</option>
                    ))}
                  </select>
                </div>

                {/* Projeto */}
                <div>
                  <label style={LABEL}>
                    Projeto <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <select
                    name="project_id"
                    required
                    defaultValue={defaultProjectId || ''}
                    style={INPUT}
                    onFocus={e => (e.target.style.borderColor = '#1d4ed8')}
                    onBlur={e => (e.target.style.borderColor = '#e2e8f0')}
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
                    <label style={LABEL}>Tipo de atividade</label>
                    <select
                      name="activity_type_id"
                      style={INPUT}
                      onFocus={e => (e.target.style.borderColor = '#1d4ed8')}
                      onBlur={e => (e.target.style.borderColor = '#e2e8f0')}
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
                  <label style={LABEL}>
                    Data <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    name="date"
                    type="date"
                    required
                    defaultValue={today}
                    style={INPUT}
                    onFocus={e => (e.target.style.borderColor = '#1d4ed8')}
                    onBlur={e => (e.target.style.borderColor = '#e2e8f0')}
                  />
                </div>

                {/* Duração */}
                <div>
                  <label style={LABEL}>
                    Duração <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    <div style={{ position: 'relative' }}>
                      <input
                        name="hours"
                        type="number"
                        min="0"
                        max="23"
                        defaultValue="1"
                        placeholder="0"
                        style={{ ...INPUT, paddingRight: 36 }}
                        onFocus={e => (e.target.style.borderColor = '#1d4ed8')}
                        onBlur={e => (e.target.style.borderColor = '#e2e8f0')}
                      />
                      <span style={{
                        position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                        fontSize: 11, fontWeight: 600, color: '#94a3b8', pointerEvents: 'none',
                      }}>h</span>
                    </div>
                    <div style={{ position: 'relative' }}>
                      <input
                        name="minutes"
                        type="number"
                        min="0"
                        max="59"
                        defaultValue="0"
                        placeholder="0"
                        style={{ ...INPUT, paddingRight: 40 }}
                        onFocus={e => (e.target.style.borderColor = '#1d4ed8')}
                        onBlur={e => (e.target.style.borderColor = '#e2e8f0')}
                      />
                      <span style={{
                        position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                        fontSize: 11, fontWeight: 600, color: '#94a3b8', pointerEvents: 'none',
                      }}>min</span>
                    </div>
                  </div>
                </div>

                {/* Descrição */}
                <div>
                  <label style={LABEL}>Descrição</label>
                  <textarea
                    name="description"
                    placeholder="Ex: Detalhamento de cozinha, revisão de projeto..."
                    rows={3}
                    style={{
                      ...INPUT, resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.5,
                    }}
                    onFocus={e => (e.target.style.borderColor = '#1d4ed8')}
                    onBlur={e => (e.target.style.borderColor = '#e2e8f0')}
                  />
                </div>

                {/* Error */}
                {error && (
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '10px 12px', borderRadius: 8,
                    background: '#fef2f2', border: '1px solid #fca5a5',
                    fontSize: 13, color: '#dc2626',
                  }}>
                    <AlertCircle style={{ width: 14, height: 14, flexShrink: 0 }} />
                    {error}
                  </div>
                )}

                {/* Actions */}
                <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', paddingTop: 4 }}>
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={isPending}
                    style={{
                      padding: '9px 18px', borderRadius: 9, border: '1px solid #e2e8f0',
                      background: '#fff', color: '#374151',
                      fontSize: 13, fontWeight: 600, cursor: 'pointer',
                      transition: 'all 0.15s',
                    }}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isPending}
                    style={{
                      padding: '9px 22px', borderRadius: 9, border: 'none',
                      background: isPending ? '#93c5fd' : '#1d4ed8', color: '#fff',
                      fontSize: 13, fontWeight: 600, cursor: isPending ? 'not-allowed' : 'pointer',
                      display: 'flex', alignItems: 'center', gap: 7,
                      transition: 'all 0.15s',
                    }}
                  >
                    {isPending && <Loader2 style={{ width: 13, height: 13, animation: 'spin 1s linear infinite' }} />}
                    {isPending ? 'Salvando...' : 'Registrar horas'}
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
