// =============================================================================
// Thiora - VAPID Keys Manager
// Auto-generates and persists VAPID keys for push notifications
// When env vars aren't set, generates keys and saves to a local file
// =============================================================================

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs'
import { join } from 'path'
import webpush from 'web-push'

// Path to the persisted VAPID keys file
const VAPID_KEYS_FILE = join(process.cwd(), 'src', 'lib', '.vapid-keys.json')

// In-memory cache for current session
let _cachedKeys: { publicKey: string; privateKey: string } | null = null

/**
 * Get or generate VAPID keys.
 * Priority:
 * 1. Environment variables (VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY)
 * 2. Cached keys from this session
 * 3. Keys from the persisted file (.vapid-keys.json)
 * 4. Auto-generate new keys
 */
export function getVapidKeys(): { publicKey: string; privateKey: string } {
  // 1. Check environment variables first
  const envPublicKey = process.env.VAPID_PUBLIC_KEY
  const envPrivateKey = process.env.VAPID_PRIVATE_KEY

  if (envPublicKey && envPrivateKey && envPublicKey.length > 10 && envPrivateKey.length > 10) {
    // Validate that these aren't placeholder values
    if (!envPublicKey.startsWith('PLACEHOLDER') && !envPrivateKey.startsWith('PLACEHOLDER')) {
      return { publicKey: envPublicKey, privateKey: envPrivateKey }
    }
  }

  // 2. Check in-memory cache
  if (_cachedKeys) {
    return _cachedKeys
  }

  // 3. Try to read from persisted file
  if (existsSync(VAPID_KEYS_FILE)) {
    try {
      const fileContent = readFileSync(VAPID_KEYS_FILE, 'utf-8')
      const keys = JSON.parse(fileContent)

      if (keys.publicKey && keys.privateKey) {
        _cachedKeys = keys
        return keys
      }
    } catch (error) {
      console.warn('[VAPID] Failed to read keys file, generating new ones:', error)
    }
  }

  // 4. Generate new keys
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
 * Check if VAPID keys are available (either from env or auto-generated)
 */
export function areVapidKeysAvailable(): boolean {
  try {
    const keys = getVapidKeys()
    return !!(keys.publicKey && keys.privateKey)
  } catch {
    return false
  }
}

/**
 * Regenerate VAPID keys (use with caution — existing subscriptions will break)
 */
export function regenerateVapidKeys(): { publicKey: string; privateKey: string } {
  const newKeys = webpush.generateVAPIDKeys()

  // Update cache
  _cachedKeys = newKeys

  // Persist
  try {
    writeFileSync(VAPID_KEYS_FILE, JSON.stringify(newKeys, null, 2), 'utf-8')
  } catch (error) {
    console.warn('[VAPID] Failed to save regenerated keys:', error)
  }

  return newKeys
}
