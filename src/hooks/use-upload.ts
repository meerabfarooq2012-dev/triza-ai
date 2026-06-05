'use client'

import { useState, useCallback, useRef } from 'react'
import { toast } from 'sonner'

// =============================================================================
// useUpload — Reusable hook for uploading files via /api/upload
// =============================================================================

const ALLOWED_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
])

const ALLOWED_FOLDERS = new Set([
  'products',
  'avatars',
  'shops',
  'reviews',
  'evidence',
  'stories',
  'general',
])

const DEFAULT_MAX_SIZE = 5 * 1024 * 1024 // 5MB
const AVATAR_MAX_SIZE = 2 * 1024 * 1024 // 2MB

interface UseUploadOptions {
  /** Storage folder — must be one of: products, avatars, shops, reviews, evidence, stories, general */
  folder?: string
  /** Max file size in bytes (default: 5MB, 2MB for avatars) */
  maxSize?: number
}

interface UseUploadReturn {
  /** Upload a single file. Returns the public URL on success, or null on failure. */
  upload: (file: File, folderOverride?: string) => Promise<string | null>
  /** Whether an upload is currently in progress */
  uploading: boolean
  /** Upload progress percentage (0–100) */
  progress: number
  /** Last error message (reset on next upload) */
  error: string | null
}

export function useUpload(options: UseUploadOptions = {}): UseUploadReturn {
  const { folder: defaultFolder = 'general', maxSize: customMaxSize } = options

  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)

  // Use a ref for the XMLHttpRequest so we can abort if needed
  const xhrRef = useRef<XMLHttpRequest | null>(null)

  const upload = useCallback(
    async (file: File, folderOverride?: string): Promise<string | null> => {
      const folder = folderOverride || defaultFolder

      // ---- Client-side validation ----

      // File type
      if (!ALLOWED_TYPES.has(file.type)) {
        const msg = `Invalid file type "${file.type || 'unknown'}". Allowed: JPG, PNG, WebP, GIF.`
        setError(msg)
        toast.error(msg)
        return null
      }

      // Folder
      if (!ALLOWED_FOLDERS.has(folder)) {
        const msg = `Invalid folder "${folder}".`
        setError(msg)
        toast.error(msg)
        return null
      }

      // File size
      const maxForFolder = customMaxSize ?? (folder === 'avatars' ? AVATAR_MAX_SIZE : DEFAULT_MAX_SIZE)
      if (file.size > maxForFolder) {
        const maxLabel = folder === 'avatars' ? '2MB' : '5MB'
        const msg = `File too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Maximum: ${maxLabel}.`
        setError(msg)
        toast.error(msg)
        return null
      }

      // ---- Upload ----

      setUploading(true)
      setProgress(0)
      setError(null)

      return new Promise<string | null>((resolve) => {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('folder', folder)

        const xhr = new XMLHttpRequest()
        xhrRef.current = xhr

        // Track progress
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            const pct = Math.round((e.loaded / e.total) * 100)
            setProgress(pct)
          }
        })

        xhr.addEventListener('load', () => {
          setUploading(false)
          xhrRef.current = null

          try {
            const data = JSON.parse(xhr.responseText)

            if (xhr.status >= 200 && xhr.status < 300 && data.success && data.url) {
              setProgress(100)
              resolve(data.url as string)
            } else {
              const msg = data.error || `Upload failed (HTTP ${xhr.status}).`
              setError(msg)
              toast.error(msg)
              resolve(null)
            }
          } catch {
            const msg = 'Failed to parse upload response.'
            setError(msg)
            toast.error(msg)
            resolve(null)
          }
        })

        xhr.addEventListener('error', () => {
          setUploading(false)
          xhrRef.current = null
          const msg = 'Network error during upload. Please check your connection.'
          setError(msg)
          toast.error(msg)
          resolve(null)
        })

        xhr.addEventListener('abort', () => {
          setUploading(false)
          xhrRef.current = null
          setError('Upload was cancelled.')
          resolve(null)
        })

        xhr.open('POST', '/api/upload')
        xhr.send(formData)
      })
    },
    [defaultFolder, customMaxSize]
  )

  return { upload, uploading, progress, error }
}
