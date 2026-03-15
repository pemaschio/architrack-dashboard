'use client'

import { useState } from 'react'
import { MailCheck } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export function LoginForm() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/confirm`,
      },
    })

    if (error) {
      setError('Erro ao enviar o link. Tente novamente.')
    } else {
      setSent(true)
    }
    setLoading(false)
  }

  if (sent) {
    return (
      <div
        style={{
          background: '#fff',
          borderRadius: 12,
          boxShadow: '0 1px 3px rgba(0,0,0,0.07), 0 0 0 1px rgba(0,0,0,0.04)',
          padding: '36px 28px',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: 14,
            background: 'rgba(181,97,74,0.10)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
          }}
        >
          <MailCheck style={{ width: 22, height: 22, color: '#B5614A' }} />
        </div>
        <h2 style={{ fontSize: 15, fontWeight: 600, color: '#0A0A0B', marginBottom: 8, letterSpacing: '-0.015em' }}>
          Link enviado!
        </h2>
        <p style={{ fontSize: 13, color: 'rgba(10,10,11,0.50)', lineHeight: 1.65, margin: 0 }}>
          Verifique seu e-mail <strong style={{ color: '#0A0A0B', fontWeight: 500 }}>{email}</strong> e
          clique no link para entrar.
        </p>
        <button
          onClick={() => { setSent(false); setEmail('') }}
          style={{
            marginTop: 20,
            fontSize: 12,
            color: '#B5614A',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontFamily: 'inherit',
            fontWeight: 500,
            letterSpacing: '0.01em',
          }}
        >
          Usar outro e-mail
        </button>
      </div>
    )
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
        Informe seu e-mail para receber o link de acesso.
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
          {loading ? 'Enviando...' : 'Enviar link de acesso'}
        </button>
      </form>
    </div>
  )
}
