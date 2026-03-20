'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { MailCheck } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const PHONE_REGEX = /^55\d{10,11}$/

const URL_ERRORS: Record<string, string> = {
  phone_in_use: 'Este telefone já está cadastrado. Use outro número.',
  invalid_phone: 'Formato de telefone inválido. Use: 5511999999999',
  unknown: 'Erro ao criar conta. Tente novamente.',
}

export function SignupForm() {
  const searchParams = useSearchParams()
  const urlError = searchParams.get('error')

  const [form, setForm] = useState({
    name: '',
    phone: '',
    org_name: '',
    role: 'architect' as 'architect' | 'director',
    email: '',
    password: '',
  })
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(
    urlError ? (URL_ERRORS[urlError] ?? URL_ERRORS.unknown) : null
  )
  const supabase = createClient()

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    const phone = form.phone.replace(/\D/g, '')
    if (!PHONE_REGEX.test(phone)) {
      setError('Telefone inválido. Use o formato: 5511999999999')
      return
    }

    if (form.password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.')
      return
    }

    setLoading(true)
    const { error: signUpError } = await supabase.auth.signUp({
      email: form.email.trim(),
      password: form.password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/confirm`,
        data: {
          name: form.name.trim(),
          phone,
          org_name: form.org_name.trim(),
          role: form.role,
        },
      },
    })

    if (signUpError) {
      if (signUpError.message?.includes('already registered')) {
        setError('Este e-mail já está cadastrado. Faça login.')
      } else {
        setError('Erro ao criar conta. Tente novamente.')
      }
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
        <h2
          style={{
            fontSize: 15,
            fontWeight: 600,
            color: '#0A0A0B',
            marginBottom: 8,
            letterSpacing: '-0.015em',
          }}
        >
          Verifique seu e-mail!
        </h2>
        <p
          style={{
            fontSize: 13,
            color: 'rgba(10,10,11,0.50)',
            lineHeight: 1.65,
            margin: 0,
          }}
        >
          Enviamos um link de confirmação para{' '}
          <strong style={{ color: '#0A0A0B', fontWeight: 500 }}>
            {form.email}
          </strong>
          . Confirme seu e-mail para ativar a conta.
        </p>
        <button
          onClick={() => {
            setSent(false)
            setError(null)
          }}
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
    boxSizing: 'border-box',
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

  function onFocus(
    e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    e.currentTarget.style.borderColor = '#B5614A'
    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(181,97,74,0.10)'
  }
  function onBlur(
    e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    e.currentTarget.style.borderColor = 'rgba(10,10,11,0.14)'
    e.currentTarget.style.boxShadow = 'none'
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
      <h2
        style={{
          fontSize: 16,
          fontWeight: 600,
          color: '#0A0A0B',
          marginBottom: 4,
          letterSpacing: '-0.02em',
        }}
      >
        Criar conta
      </h2>
      <p
        style={{
          fontSize: 13,
          color: 'rgba(10,10,11,0.45)',
          marginBottom: 24,
          lineHeight: 1.5,
        }}
      >
        Preencha os dados para criar seu acesso ao ArchiTrack.
      </p>

      <form
        onSubmit={handleSubmit}
        style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
      >
        <div>
          <label htmlFor="name" style={labelStyle}>
            Nome completo
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            value={form.name}
            onChange={handleChange}
            placeholder="Ana Silva"
            style={inputStyle}
            onFocus={onFocus}
            onBlur={onBlur}
          />
        </div>

        <div>
          <label htmlFor="email" style={labelStyle}>
            E-mail
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            value={form.email}
            onChange={handleChange}
            placeholder="ana@escritorio.com"
            style={inputStyle}
            onFocus={onFocus}
            onBlur={onBlur}
          />
        </div>

        <div>
          <label htmlFor="password" style={labelStyle}>
            Senha
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            minLength={6}
            value={form.password}
            onChange={handleChange}
            placeholder="Mínimo 6 caracteres"
            style={inputStyle}
            onFocus={onFocus}
            onBlur={onBlur}
          />
        </div>

        <div>
          <label htmlFor="phone" style={labelStyle}>
            Telefone WhatsApp
          </label>
          <input
            id="phone"
            name="phone"
            type="text"
            required
            value={form.phone}
            onChange={handleChange}
            placeholder="5511999999999"
            style={inputStyle}
            onFocus={onFocus}
            onBlur={onBlur}
          />
          <p
            style={{
              fontSize: 11,
              color: 'rgba(10,10,11,0.35)',
              marginTop: 4,
            }}
          >
            Código do país + DDD + número (ex: 5511999999999)
          </p>
        </div>

        <div>
          <label htmlFor="org_name" style={labelStyle}>
            Nome do escritório / organização
          </label>
          <input
            id="org_name"
            name="org_name"
            type="text"
            required
            value={form.org_name}
            onChange={handleChange}
            placeholder="Meu Escritório"
            style={inputStyle}
            onFocus={onFocus}
            onBlur={onBlur}
          />
        </div>

        <div>
          <label htmlFor="role" style={labelStyle}>
            Cargo
          </label>
          <select
            id="role"
            name="role"
            required
            value={form.role}
            onChange={handleChange}
            style={{ ...inputStyle, cursor: 'pointer' }}
            onFocus={onFocus}
            onBlur={onBlur}
          >
            <option value="architect">Arquiteto</option>
            <option value="director">Gestor</option>
          </select>
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
          onMouseEnter={(e) => {
            if (!loading)
              (e.currentTarget as HTMLButtonElement).style.background = '#A0503A'
          }}
          onMouseLeave={(e) => {
            if (!loading)
              (e.currentTarget as HTMLButtonElement).style.background = '#B5614A'
          }}
        >
          {loading ? 'Criando conta...' : 'Criar conta'}
        </button>
      </form>
    </div>
  )
}
