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

  const inputStyle: React.CSSProperties = {
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
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#F4F2EF',
        backgroundImage: `
          linear-gradient(rgba(181,97,74,0.04) 1px, transparent 1px),
          linear-gradient(90deg, rgba(181,97,74,0.04) 1px, transparent 1px)
        `,
        backgroundSize: '40px 40px',
      }}
    >
      <div style={{ width: '100%', maxWidth: 400, padding: '0 20px' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 13,
              background: '#B5614A',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 14px',
              boxShadow: '0 4px 14px rgba(181,97,74,0.30)',
            }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 20h9"/>
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
            </svg>
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.04em', color: '#1A1714', lineHeight: 1, margin: 0 }}>
            ArchiTrack
          </h1>
          <p style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(10,10,11,0.34)', marginTop: 6 }}>
            Gestão de Escritório
          </p>
        </div>

        {sent ? (
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
              E-mail enviado!
            </h2>
            <p style={{ fontSize: 13, color: 'rgba(10,10,11,0.50)', lineHeight: 1.65, margin: 0 }}>
              Verifique seu e-mail <strong style={{ color: '#0A0A0B', fontWeight: 500 }}>{email}</strong> e
              clique no link para redefinir sua senha.
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
              }}
            >
              Usar outro e-mail
            </button>
          </div>
        ) : (
          <div
            style={{
              background: '#fff',
              borderRadius: 12,
              boxShadow: '0 1px 3px rgba(0,0,0,0.07), 0 0 0 1px rgba(0,0,0,0.04)',
              padding: '32px 28px',
            }}
          >
            <h2 style={{ fontSize: 16, fontWeight: 600, color: '#0A0A0B', marginBottom: 4, letterSpacing: '-0.02em' }}>
              Redefinir senha
            </h2>
            <p style={{ fontSize: 13, color: 'rgba(10,10,11,0.45)', marginBottom: 24, lineHeight: 1.5 }}>
              Informe seu e-mail para receber o link de redefinição.
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
                  style={inputStyle}
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
                {loading ? 'Enviando...' : 'Enviar link de redefinição'}
              </button>
            </form>
          </div>
        )}

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 12, color: 'rgba(10,10,11,0.40)' }}>
          Lembrou a senha?{' '}
          <Link href="/login" style={{ color: '#B5614A', fontWeight: 500, textDecoration: 'none' }}>
            Voltar ao login
          </Link>
        </p>
      </div>
    </div>
  )
}
