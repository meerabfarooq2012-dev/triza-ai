// =============================================================================
// TRIZA - usePushNotifications Hook
// Manages browser push notification subscription lifecycle
// =============================================================================

'use client'

import { useState, useCallback } from 'react'
import { useMarketplaceStore } from '@/store/use-marketplace-store'

interface PushNotificationsState {
  isSupported: boolean
  permission: NotificationPermission
  isSubscribed: boolean
  isLoading: boolean
  error: string | null
}

function getInitialPushState(): PushNotificationsState {
  if (typeof window === 'undefined') {
    return {
      isSupported: false,
      permission: 'default' as NotificationPermission,
      isSubscribed: false,
      isLoading: false,
      error: null,
    }
  }

  const isSupported =
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window

  return {
    isSupported,
    permission: isSupported ? Notification.permission : ('default' as NotificationPermission),
    isSubscribed: false,
    isLoading: false,
    error: null,
  }
}

export function usePushNotifications() {
  const { currentUser, authToken } = useMarketplaceStore()
  const [state, setState] = useState<PushNotificationsState>(getInitialPushState)

  /**
   * Check if the user is already subscribed
   * Call this from event handlers (e.g., when popover opens)
   */
  const checkSubscription = useCallback(async () => {
    if (typeof window === 'undefined') return
    const supported =
      'serviceWorker' in navigator &&
      'PushManager' in window
    if (!supported || !currentUser) return

    try {
      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.getSubscription()

      setState(prev => ({
        ...prev,
        isSubscribed: !!subscription,
        permission: Notification.permission as NotificationPermission,
      }))
    } catch {
      // Service worker not ready yet — that's fine
    }
  }, [currentUser])

  /**
   * Request notification permission and subscribe to push notifications
   */
  const requestPermissionAndSubscribe = useCallback(async () => {
    const supported =
      typeof window !== 'undefined' &&
      'serviceWorker' in navigator &&
      'PushManager' in window &&
      'Notification' in window

    if (!supported || !currentUser) {
      setState(prev => ({
        ...prev,
        error: !currentUser
          ? 'Please log in to enable push notifications'
          : 'Push notifications are not supported in this browser',
      }))
      return false
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }))

    try {
      // Step 1: Request permission
      const permission = await Notification.requestPermission()
      setState(prev => ({ ...prev, permission }))

      if (permission !== 'granted') {
        setState(prev => ({
          ...prev,
          isLoading: false,
          isSubscribed: false,
          error: permission === 'denied'
            ? 'Notifications are blocked. Please enable them in your browser settings.'
            : 'Permission not granted',
        }))
        return false
      }

      // Step 2: Get VAPID public key from server
      const keyResponse = await fetch('/api/push/vapid-key')
      const keyData = await keyResponse.json()

      if (!keyData.success || !keyData.data?.publicKey) {
        // Check if it's a "not configured" error vs other errors
        const isNotConfigured = keyData.code === 'VAPID_NOT_CONFIGURED' || keyResponse.status === 503
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: isNotConfigured
            ? 'Push notifications not configured yet. Please set VAPID keys in server settings.'
            : (keyData.error || 'Push notifications are not configured on the server'),
        }))
        return false
      }

      const vapidPublicKey = keyData.data.publicKey

      // Step 3: Subscribe via Push API
      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
      })

      // Step 4: Send subscription to backend with auth token
      const subscriptionJson = subscription.toJSON()
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      }
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`
      }

      const subscribeResponse = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          endpoint: subscriptionJson.endpoint,
          keys: {
            p256dh: subscriptionJson.keys?.p256dh,
            auth: subscriptionJson.keys?.auth,
          },
        }),
      })

      const subscribeData = await subscribeResponse.json()

      if (!subscribeData.success) {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: subscribeData.error || 'Failed to save subscription',
        }))
        return false
      }

      setState(prev => ({
        ...prev,
        isLoading: false,
        isSubscribed: true,
        error: null,
      }))

      return true
    } catch (error) {
      console.error('Push subscription error:', error)
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Failed to subscribe to push notifications',
      }))
      return false
    }
  }, [currentUser, authToken])

  /**
   * Unsubscribe from push notifications
   */
  const unsubscribe = useCallback(async () => {
    const supported =
      typeof window !== 'undefined' &&
      'serviceWorker' in navigator

    if (!supported) return false

    setState(prev => ({ ...prev, isLoading: true, error: null }))

    try {
      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.getSubscription()

      if (subscription) {
        // Unsubscribe from push service
        await subscription.unsubscribe()

        // Remove from backend with auth token
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
        }
        if (authToken) {
          headers['Authorization'] = `Bearer ${authToken}`
        }

        await fetch('/api/push/unsubscribe', {
          method: 'POST',
          headers,
          body: JSON.stringify({ endpoint: subscription.endpoint }),
        })
      }

      setState(prev => ({
        ...prev,
        isLoading: false,
        isSubscribed: false,
        error: null,
      }))

      return true
    } catch (error) {
      console.error('Push unsubscribe error:', error)
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Failed to unsubscribe from push notifications',
      }))
      return false
    }
  }, [authToken])

  /**
   * Send a test push notification
   */
  const sendTestNotification = useCallback(async () => {
    if (!state.isSubscribed || !currentUser) return false

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      }
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`
      }

      const response = await fetch('/api/push/test', {
        method: 'POST',
        headers,
      })
      const data = await response.json()
      return data.success
    } catch {
      return false
    }
  }, [state.isSubscribed, currentUser, authToken])

  return {
    ...state,
    requestPermissionAndSubscribe,
    unsubscribe,
    sendTestNotification,
    checkSubscription,
  }
}

/**
 * Convert a base64-encoded VAPID key to a Uint8Array
 * Required format for the Push API's applicationServerKey parameter
 */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')

  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }

  return outputArray
}
