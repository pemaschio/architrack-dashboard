'use client'

import { useEffect } from 'react'

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center h-full gap-4 text-center p-8">
      <h2 className="text-lg font-semibold text-gray-900">Algo deu errado</h2>
      <p className="text-sm text-gray-500 max-w-sm">
        Ocorreu um erro inesperado. Tente novamente ou recarregue a página.
      </p>
      {error.digest && (
        <p className="text-xs text-gray-400 font-mono">Código: {error.digest}</p>
      )}
      <button
        onClick={reset}
        className="px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-700 transition-colors"
      >
        Tentar novamente
      </button>
    </div>
  )
}
