'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      if (error.message === 'Invalid login credentials') {
        setError('E-mail ou senha incorretos.')
      } else if (error.message === 'Email not confirmed') {
        setError('Confirme seu e-mail antes de entrar. Verifique sua caixa de entrada.')
      } else {
        setError('Erro ao entrar. Tente novamente.')
      }
    } else {
      router.push('/overview')
    }
    setLoading(false)
  }

  return (
    <div className="glass-modal p-7">
      <h2 className="text-base font-semibold text-stone-900 mb-1 tracking-[-0.02em]">
        Entrar
      </h2>
      <p className="text-[13px] text-stone-400 mb-6 leading-relaxed">
        Informe seu e-mail e senha para acessar.
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

        <div>
          <label htmlFor="password" className="text-label block mb-1.5">
            Senha
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
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
          {loading ? 'Entrando...' : 'Entrar'}
        </button>

        <div className="text-center mt-1">
          <a
            href="/reset-password"
            className="text-xs text-terra font-medium no-underline hover:underline"
          >
            Esqueci minha senha
          </a>
        </div>
      </form>
    </div>
  )
}
