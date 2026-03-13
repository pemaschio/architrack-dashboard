'use client'

export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html>
      <body style={{ fontFamily: 'monospace', padding: 32, background: '#fff' }}>
        <h2 style={{ color: '#DC2626', marginBottom: 8 }}>Server Error (debug)</h2>
        <p style={{ marginBottom: 4 }}><strong>Message:</strong> {error.message}</p>
        <p style={{ marginBottom: 4 }}><strong>Digest:</strong> {error.digest}</p>
        <pre style={{ background: '#F3F4F6', padding: 16, borderRadius: 6, overflow: 'auto', fontSize: 12 }}>
          {error.stack}
        </pre>
      </body>
    </html>
  )
}
