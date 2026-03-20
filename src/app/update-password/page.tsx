'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function UpdatePasswordPage() {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.')
      return
    }

    if (password !== confirm) {
      setError('As senhas não coincidem.')
      return
    }

    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password })

    if (error) {
      setError('Erro ao atualizar a senha. Tente novamente.')
    } else {
      router.push('/overview')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#EAEAE5] bg-[linear-gradient(rgba(168,162,158,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(168,162,158,0.08)_1px,transparent_1px)] bg-[length:40px_40px]">
      <div className="w-full max-w-[400px] px-5">
        <div className="text-center mb-8">
          <div className="w-11 h-11 rounded-[13px] bg-terra flex items-center justify-center mx-auto mb-3.5 shadow-[0_4px_14px_rgba(181,97,74,0.3)]">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 20h9"/>
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
            </svg>
          </div>
          <h1 className="text-[22px] font-bold tracking-[-0.04em] text-stone-900 leading-none">ArchiTrack</h1>
          <p className="text-[11px] font-medium tracking-[0.08em] uppercase text-stone-400 mt-1.5">Gestão de Escritório</p>
        </div>

        <div className="glass-modal p-7">
          <h2 className="text-base font-semibold text-stone-900 mb-1 tracking-[-0.02em]">
            Definir nova senha
          </h2>
          <p className="text-[13px] text-stone-400 mb-6 leading-relaxed">
            Escolha uma nova senha para sua conta.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label htmlFor="password" className="text-label block mb-1.5">Nova senha</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                required
                minLength={6}
                className="w-full px-3 py-2 text-[13px] text-stone-900 font-sans glass-input glass-input-terra"
              />
            </div>

            <div>
              <label htmlFor="confirm" className="text-label block mb-1.5">Confirmar senha</label>
              <input
                id="confirm"
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Repita a senha"
                required
                minLength={6}
                className="w-full px-3 py-2 text-[13px] text-stone-900 font-sans glass-input glass-input-terra"
              />
            </div>

            {error && (
              <p className="text-xs text-red-600">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-stone-900 text-white rounded-lg text-[13px] font-medium tracking-[-0.01em] transition-colors hover:bg-[#292524] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Salvando...' : 'Salvar nova senha'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
