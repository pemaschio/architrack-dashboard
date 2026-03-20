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
      <div className="glass-modal p-9 text-center">
        <div className="w-12 h-12 rounded-[14px] bg-terra/10 flex items-center justify-center mx-auto mb-4">
          <MailCheck className="w-[22px] h-[22px] text-terra" />
        </div>
        <h2 className="text-[15px] font-semibold text-stone-900 mb-2 tracking-[-0.015em]">
          Verifique seu e-mail!
        </h2>
        <p className="text-[13px] text-stone-400 leading-[1.65] m-0">
          Enviamos um link de confirmação para{' '}
          <strong className="text-stone-900 font-medium">
            {form.email}
          </strong>
          . Confirme seu e-mail para ativar a conta.
        </p>
        <button
          onClick={() => {
            setSent(false)
            setError(null)
          }}
          className="mt-5 text-xs text-terra bg-transparent border-none cursor-pointer font-sans font-medium tracking-[0.01em]"
        >
          Usar outro e-mail
        </button>
      </div>
    )
  }

  return (
    <div className="glass-modal p-7">
      <h2 className="text-base font-semibold text-stone-900 mb-1 tracking-[-0.02em]">
        Criar conta
      </h2>
      <p className="text-[13px] text-stone-400 mb-6 leading-relaxed">
        Preencha os dados para criar seu acesso ao ArchiTrack.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label htmlFor="name" className="text-label block mb-1.5">
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
            className="w-full px-3 py-2 text-[13px] text-stone-900 font-sans glass-input glass-input-terra"
          />
        </div>

        <div>
          <label htmlFor="email" className="text-label block mb-1.5">
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
            className="w-full px-3 py-2 text-[13px] text-stone-900 font-sans glass-input glass-input-terra"
          />
        </div>

        <div>
          <label htmlFor="password" className="text-label block mb-1.5">
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
            className="w-full px-3 py-2 text-[13px] text-stone-900 font-sans glass-input glass-input-terra"
          />
        </div>

        <div>
          <label htmlFor="phone" className="text-label block mb-1.5">
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
            className="w-full px-3 py-2 text-[13px] text-stone-900 font-sans glass-input glass-input-terra"
          />
          <p className="text-[11px] text-stone-400 mt-1">
            Código do país + DDD + número (ex: 5511999999999)
          </p>
        </div>

        <div>
          <label htmlFor="org_name" className="text-label block mb-1.5">
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
            className="w-full px-3 py-2 text-[13px] text-stone-900 font-sans glass-input glass-input-terra"
          />
        </div>

        <div>
          <label htmlFor="role" className="text-label block mb-1.5">
            Cargo
          </label>
          <select
            id="role"
            name="role"
            required
            value={form.role}
            onChange={handleChange}
            className="w-full px-3 py-2 text-[13px] text-stone-900 font-sans glass-input glass-input-terra cursor-pointer"
          >
            <option value="architect">Arquiteto</option>
            <option value="director">Gestor</option>
          </select>
        </div>

        {error && (
          <p className="text-xs text-red-600">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 px-4 bg-stone-900 text-white rounded-lg text-[13px] font-medium tracking-[-0.01em] transition-colors hover:bg-[#292524] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Criando conta...' : 'Criar conta'}
        </button>
      </form>
    </div>
  )
}
