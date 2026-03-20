'use client'

import { useState } from 'react'
import Link from 'next/link'
import { MailCheck } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/confirm`,
    })

    if (error) {
      setError('Erro ao enviar o e-mail. Tente novamente.')
    } else {
      setSent(true)
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

        {sent ? (
          <div className="glass-modal p-9 text-center">
            <div className="w-12 h-12 rounded-[14px] bg-terra/10 flex items-center justify-center mx-auto mb-4">
              <MailCheck className="w-[22px] h-[22px] text-terra" />
            </div>
            <h2 className="text-[15px] font-semibold text-stone-900 mb-2 tracking-[-0.015em]">
              E-mail enviado!
            </h2>
            <p className="text-[13px] text-stone-400 leading-[1.65] m-0">
              Verifique seu e-mail <strong className="text-stone-900 font-medium">{email}</strong> e
              clique no link para redefinir sua senha.
            </p>
            <button
              onClick={() => { setSent(false); setEmail('') }}
              className="mt-5 text-xs text-terra bg-transparent border-none cursor-pointer font-sans font-medium"
            >
              Usar outro e-mail
            </button>
          </div>
        ) : (
          <div className="glass-modal p-7">
            <h2 className="text-base font-semibold text-stone-900 mb-1 tracking-[-0.02em]">
              Redefinir senha
            </h2>
            <p className="text-[13px] text-stone-400 mb-6 leading-relaxed">
              Informe seu e-mail para receber o link de redefinição.
            </p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label htmlFor="email" className="text-label block mb-1.5">
                  E-mail
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="carlos@escritorio.com"
                  required
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
                {loading ? 'Enviando...' : 'Enviar link de redefinição'}
              </button>
            </form>
          </div>
        )}

        <p className="text-center mt-5 text-xs text-stone-400">
          Lembrou a senha?{' '}
          <Link href="/login" className="text-terra font-medium no-underline hover:underline">
            Voltar ao login
          </Link>
        </p>
      </div>
    </div>
  )
}
