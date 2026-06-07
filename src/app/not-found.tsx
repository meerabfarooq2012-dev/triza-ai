'use client'

import { useEffect, useState } from 'react'

/**
 * Custom 404 page — provides helpful debugging info for Vercel deployment issues.
 */
export default function NotFound() {
  const [deployInfo, setDeployInfo] = useState<Record<string, unknown> | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Fetch deployment info to help debug
    setLoading(true)
    fetch('/api/deploy-info')
      .then(res => res.json())
      .then(data => setDeployInfo(data))
      .catch(() => setDeployInfo(null))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <div className="max-w-lg w-full space-y-6 text-center">
        <div className="flex items-center justify-center w-20 h-20 rounded-full bg-amber-100 dark:bg-amber-950/50 mx-auto">
          <svg className="w-10 h-10 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>

        <div>
          <h1 className="text-4xl font-bold text-foreground mb-2">404</h1>
          <h2 className="text-xl font-semibold text-foreground mb-2">Page Not Found</h2>
          <p className="text-muted-foreground">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>
        </div>

        <div className="flex gap-3 justify-center">
          <button
            onClick={() => window.location.href = '/'}
            className="px-5 py-2.5 bg-amber-600 text-white rounded-lg hover:bg-amber-700 text-sm font-medium shadow-lg"
          >
            Go Home
          </button>
          <button
            onClick={() => window.location.reload()}
            className="px-5 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 text-sm font-medium"
          >
            Refresh
          </button>
        </div>

        {/* Deployment debugging info */}
        <details className="text-left">
          <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground">
            Deployment Info (for debugging)
          </summary>
          <div className="mt-2 bg-muted p-3 rounded-lg overflow-auto max-h-48">
            {loading ? (
              <p className="text-xs text-muted-foreground">Loading...</p>
            ) : deployInfo ? (
              <pre className="text-xs whitespace-pre-wrap break-all">
                {JSON.stringify(deployInfo, null, 2)}
              </pre>
            ) : (
              <p className="text-xs text-muted-foreground">Could not fetch deployment info.</p>
            )}
          </div>
        </details>
      </div>
    </div>
  )
}
