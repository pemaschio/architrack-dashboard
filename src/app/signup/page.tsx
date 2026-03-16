import { Suspense } from 'react'
import Link from 'next/link'
import { SignupForm } from '@/components/auth/signup-form'

export default function SignupPage() {
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
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 20h9" />
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
            </svg>
          </div>
          <h1
            style={{
              fontSize: 22,
              fontWeight: 700,
              letterSpacing: '-0.04em',
              color: '#1A1714',
              lineHeight: 1,
              margin: 0,
            }}
          >
            ArchiTrack
          </h1>
          <p
            style={{
              fontSize: 11,
              fontWeight: 500,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: 'rgba(10,10,11,0.34)',
              marginTop: 6,
            }}
          >
            Gestão de Escritório
          </p>
        </div>

        <Suspense fallback={null}>
          <SignupForm />
        </Suspense>

        <p
          style={{
            textAlign: 'center',
            marginTop: 20,
            fontSize: 12,
            color: 'rgba(10,10,11,0.40)',
          }}
        >
          Já tem conta?{' '}
          <Link
            href="/login"
            style={{ color: '#B5614A', fontWeight: 500, textDecoration: 'none' }}
          >
            Entrar
          </Link>
        </p>
      </div>
    </div>
  )
}
