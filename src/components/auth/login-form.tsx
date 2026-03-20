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
    <div
      style={{
        background: '#fff',
        borderRadius: 12,
        boxShadow: '0 1px 3px rgba(0,0,0,0.07), 0 0 0 1px rgba(0,0,0,0.04)',
        padding: '32px 28px',
      }}
    >
      <h2 style={{ fontSize: 16, fontWeight: 600, color: '#0A0A0B', marginBottom: 4, letterSpacing: '-0.02em' }}>
        Entrar
      </h2>
      <p style={{ fontSize: 13, color: 'rgba(10,10,11,0.45)', marginBottom: 24, lineHeight: 1.5 }}>
        Informe seu e-mail e senha para acessar.
      </p>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <label
            htmlFor="email"
            style={{
              display: 'block',
              fontSize: 11,
              fontWeight: 500,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              color: 'rgba(10,10,11,0.40)',
              marginBottom: 6,
            }}
          >
            E-mail
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="carlos@escritorio.com"
            required
            style={{
              width: '100%',
              padding: '9px 12px',
              border: '1px solid rgba(10,10,11,0.14)',
              borderRadius: 6,
              fontSize: 13,
              color: '#0A0A0B',
              outline: 'none',
              fontFamily: 'inherit',
              background: '#FAFAFA',
              transition: 'border-color 0.15s ease',
            }}
            onFocus={(e) => { e.currentTarget.style.borderColor = '#B5614A'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(181,97,74,0.10)'; }}
            onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(10,10,11,0.14)'; e.currentTarget.style.boxShadow = 'none'; }}
          />
        </div>

        <div>
          <label
            htmlFor="password"
            style={{
              display: 'block',
              fontSize: 11,
              fontWeight: 500,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              color: 'rgba(10,10,11,0.40)',
              marginBottom: 6,
            }}
          >
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
            style={{
              width: '100%',
              padding: '9px 12px',
              border: '1px solid rgba(10,10,11,0.14)',
              borderRadius: 6,
              fontSize: 13,
              color: '#0A0A0B',
              outline: 'none',
              fontFamily: 'inherit',
              background: '#FAFAFA',
              transition: 'border-color 0.15s ease',
            }}
            onFocus={(e) => { e.currentTarget.style.borderColor = '#B5614A'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(181,97,74,0.10)'; }}
            onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(10,10,11,0.14)'; e.currentTarget.style.boxShadow = 'none'; }}
          />
        </div>

        {error && (
          <p style={{ fontSize: 12, color: '#DC2626' }}>{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '10px 16px',
            background: loading ? 'rgba(181,97,74,0.55)' : '#B5614A',
            color: '#fff',
            border: 'none',
            borderRadius: 6,
            fontSize: 13,
            fontWeight: 500,
            cursor: loading ? 'not-allowed' : 'pointer',
            fontFamily: 'inherit',
            letterSpacing: '-0.01em',
            transition: 'background 0.15s ease',
          }}
          onMouseEnter={(e) => { if (!loading) (e.currentTarget as HTMLButtonElement).style.background = '#A0503A'; }}
          onMouseLeave={(e) => { if (!loading) (e.currentTarget as HTMLButtonElement).style.background = '#B5614A'; }}
        >
          {loading ? 'Entrando...' : 'Entrar'}
        </button>

        <div style={{ textAlign: 'center', marginTop: 4 }}>
          <a
            href="/reset-password"
            style={{
              fontSize: 12,
              color: '#B5614A',
              textDecoration: 'none',
              fontWeight: 500,
              fontFamily: 'inherit',
            }}
          >
            Esqueci minha senha
          </a>
        </div>
      </form>
    </div>
  )
}
