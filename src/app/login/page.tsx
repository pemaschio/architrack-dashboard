import { Suspense } from 'react'
import Link from 'next/link'
import { LoginForm } from '@/components/auth/login-form'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const params = await searchParams

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

        <Suspense fallback={null}>
          <LoginForm />
        </Suspense>

        {params.error === 'pending_confirmation' && (
          <p className="text-center text-xs text-red-600 mt-3">
            Sua conta ainda não foi confirmada. Verifique seu e-mail.
          </p>
        )}

        <p className="text-center mt-5 text-xs text-stone-400">
          Ainda não tem conta?{' '}
          <Link href="/signup" className="text-terra font-medium no-underline hover:underline">
            Criar conta
          </Link>
        </p>
      </div>
    </div>
  )
}
