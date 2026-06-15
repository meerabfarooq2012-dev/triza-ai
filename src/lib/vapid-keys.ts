// =============================================================================
// Thiora - VAPID Keys Manager
// Auto-generates and persists VAPID keys for push notifications
//
// Priority on Vercel (serverless):
//   1. Environment variables (VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY) — REQUIRED
//   2. In-memory cache (only works within same function invocation)
//
// Priority on Local (development):
//   1. Environment variables (VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY)
//   2. In-memory cache
//   3. Keys from the persisted file (.vapid-keys.json)
//   4. Auto-generate new keys and save to file
//
// ⚠️ On Vercel, VAPID env vars are REQUIRED because:
//    - Filesystem is read-only (can't persist generated keys)
//    - Serverless functions have separate memory (keys regenerate each cold start)
//    - Different keys = all existing subscriptions break
// =============================================================================

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs'
import { join } from 'path'
import webpush from 'web-push'

// Detect if running on Vercel
const IS_VERCEL = !!process.env.VERCEL || !!process.env.VERCEL_ENV

// Path to the persisted VAPID keys file (local dev only)
const VAPID_KEYS_FILE = join(process.cwd(), 'src', 'lib', '.vapid-keys.json')

// In-memory cache for current session
let _cachedKeys: { publicKey: string; privateKey: string } | null = null

/**
 * Get or generate VAPID keys.
 * On Vercel: Env vars are REQUIRED (no file/memory persistence across cold starts)
 * On Local: Falls back to file-based persistence and auto-generation
 */
export function getVapidKeys(): { publicKey: string; privateKey: string } {
  // 1. Check environment variables first (works everywhere)
  const envPublicKey = process.env.VAPID_PUBLIC_KEY
  const envPrivateKey = process.env.VAPID_PRIVATE_KEY

  if (envPublicKey && envPrivateKey && envPublicKey.length > 10 && envPrivateKey.length > 10) {
    // Validate that these aren't placeholder values
    if (!envPublicKey.startsWith('PLACEHOLDER') && !envPrivateKey.startsWith('PLACEHOLDER')) {
      return { publicKey: envPublicKey, privateKey: envPrivateKey }
    }
  }

  // On Vercel without env vars — push notifications CANNOT work reliably
  if (IS_VERCEL) {
    if (_cachedKeys) return _cachedKeys

    console.error(
      '[VAPID] ⚠️ CRITICAL: VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY environment variables are NOT set on Vercel!\n' +
      '   Push notifications will break on every serverless cold start.\n' +
      '   Generate keys: npx web-push generate-vapid-keys\n' +
      '   Then add them in Vercel Dashboard → Project Settings → Environment Variables'
    )

    // Generate temporary keys for this invocation only (subscriptions will break on next cold start)
    const tempKeys = webpush.generateVAPIDKeys()
    _cachedKeys = tempKeys
    return tempKeys
  }

  // 2. Check in-memory cache
  if (_cachedKeys) {
    return _cachedKeys
  }

  // 3. Try to read from persisted file (local dev only)
  try {
    if (existsSync(VAPID_KEYS_FILE)) {
      const fileContent = readFileSync(VAPID_KEYS_FILE, 'utf-8')
      const keys = JSON.parse(fileContent)

      if (keys.publicKey && keys.privateKey) {
        _cachedKeys = keys
        return keys
      }
    }
  } catch (error) {
    console.warn('[VAPID] Failed to read keys file, generating new ones:', error)
  }

  // 4. Generate new keys (local dev only — can persist to file)
  console.log('[VAPID] Generating new VAPID keys...')
  const newKeys = webpush.generateVAPIDKeys()

  // Cache in memory
  _cachedKeys = newKeys

  // Persist to file for future sessions
  try {
    const dir = join(process.cwd(), 'src', 'lib')
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true })
    }
    writeFileSync(VAPID_KEYS_FILE, JSON.stringify(newKeys, null, 2), 'utf-8')
    console.log('[VAPID] New keys generated and saved to', VAPID_KEYS_FILE)
  } catch (error) {
    console.warn('[VAPID] Failed to save keys file (keys work for this session only):', error)
  }

  return newKeys
}

/**
 * Get the VAPID public key (safe for client-side use)
 */
export function getVapidPublicKey(): string {
  return getVapidKeys().publicKey
}

/**
 * Get the VAPID private key (server-side only!)
 */
export function getVapidPrivateKey(): string {
  return getVapidKeys().privateKey
}

/**
 * Check if VAPID keys are properly configured (env vars set)
 * Returns false if keys are auto-generated (unreliable on serverless)
 */
export function areVapidKeysAvailable(): boolean {
  // On Vercel, only env vars are reliable
  if (IS_VERCEL) {
    const envPublicKey = process.env.VAPID_PUBLIC_KEY
    const envPrivateKey = process.env.VAPID_PRIVATE_KEY
    return !!(envPublicKey && envPrivateKey && envPublicKey.length > 10 && envPrivateKey.length > 10)
  }

  // On local, any available keys work
  try {
    const keys = getVapidKeys()
    return !!(keys.publicKey && keys.privateKey)
  } catch {
    return false
  }
}

/**
 * Check if VAPID keys are from env vars (stable) vs auto-generated (unstable)
 */
export function areVapidKeysStable(): boolean {
  const envPublicKey = process.env.VAPID_PUBLIC_KEY
  const envPrivateKey = process.env.VAPID_PRIVATE_KEY
  return !!(envPublicKey && envPrivateKey && envPublicKey.length > 10 && envPrivateKey.length > 10)
}

/**
 * Regenerate VAPID keys (use with caution — existing subscriptions will break)
 */
export function regenerateVapidKeys(): { publicKey: string; privateKey: string } {
  const newKeys = webpush.generateVAPIDKeys()

  // Update cache
  _cachedKeys = newKeys

  // Persist (local dev only)
  if (!IS_VERCEL) {
    try {
      writeFileSync(VAPID_KEYS_FILE, JSON.stringify(newKeys, null, 2), 'utf-8')
    } catch (error) {
      console.warn('[VAPID] Failed to save regenerated keys:', error)
    }
  }

  return newKeys
}
