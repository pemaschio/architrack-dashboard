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

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: 11,
    fontWeight: 500,
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
    color: 'rgba(10,10,11,0.40)',
    marginBottom: 6,
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

        <div
          style={{
            background: '#fff',
            borderRadius: 12,
            boxShadow: '0 1px 3px rgba(0,0,0,0.07), 0 0 0 1px rgba(0,0,0,0.04)',
            padding: '32px 28px',
          }}
        >
          <h2 style={{ fontSize: 16, fontWeight: 600, color: '#0A0A0B', marginBottom: 4, letterSpacing: '-0.02em' }}>
            Definir nova senha
          </h2>
          <p style={{ fontSize: 13, color: 'rgba(10,10,11,0.45)', marginBottom: 24, lineHeight: 1.5 }}>
            Escolha uma nova senha para sua conta.
          </p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label htmlFor="password" style={labelStyle}>Nova senha</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                required
                minLength={6}
                style={inputStyle}
                onFocus={(e) => { e.currentTarget.style.borderColor = '#B5614A'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(181,97,74,0.10)'; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(10,10,11,0.14)'; e.currentTarget.style.boxShadow = 'none'; }}
              />
            </div>

            <div>
              <label htmlFor="confirm" style={labelStyle}>Confirmar senha</label>
              <input
                id="confirm"
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Repita a senha"
                required
                minLength={6}
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
              {loading ? 'Salvando...' : 'Salvar nova senha'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
