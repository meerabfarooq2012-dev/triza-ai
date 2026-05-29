'use client'

import { useEffect } from 'react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Global error:', error)
  }, [error])

  return (
    <html lang="en">
      <body>
        <div className="flex items-center justify-center min-h-screen p-4">
          <div className="max-w-md w-full space-y-4 text-center">
            <h2 className="text-2xl font-bold text-red-600">Something went wrong!</h2>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-left">
              <p className="text-sm text-red-800 font-mono break-all">{error.message}</p>
              {error.digest && (
                <p className="text-xs text-red-500 mt-2">Digest: {error.digest}</p>
              )}
              {error.stack && (
                <pre className="text-xs text-red-600 mt-2 whitespace-pre-wrap break-all max-h-48 overflow-y-auto">{error.stack}</pre>
              )}
            </div>
            <button
              onClick={reset}
              className="px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700"
            >
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}
