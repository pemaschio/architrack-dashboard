import type { Metadata } from 'next'
import { Plus_Jakarta_Sans } from 'next/font/google'
import './globals.css'

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-sans',
})

export const metadata: Metadata = {
  title: 'ArchiTrack — Gestão para escritórios de arquitetura',
  description: 'Dashboard de gestão operacional do ArchiTrack',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" className={plusJakartaSans.variable}>
      <body style={{ fontFamily: 'var(--font-sans), system-ui, sans-serif' }}>
        {children}
      </body>
    </html>
  )
}
