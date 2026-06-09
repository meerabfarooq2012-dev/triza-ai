'use client'

/**
 * useSupabaseNotifications — Drop-in replacement for useRealtimeNotifications
 * that uses Supabase Realtime instead of Socket.io. Designed for Vercel
 * deployments where persistent WebSocket servers are not available.
 *
 * Interface matches useRealtimeNotifications exactly.
 */

import { useEffect, useRef, useCallback, useState } from 'react'
import { useMarketplaceStore } from '@/store/use-marketplace-store'
import { toast } from 'sonner'
import type { Notification } from '@/types'
import {
  SupabaseRealtimeManager,
  type NotificationPayload,
} from '@/lib/supabase-realtime'

// ─── Hook ───────────────────────────────────────────────────────────────────

export function useSupabaseNotifications() {
  const { currentUser, setUnreadNotifications } = useMarketplaceStore()
  const [latestNotification, setLatestNotification] = useState<Notification | null>(null)
  const managerRef = useRef<SupabaseRealtimeManager | null>(null)
  const subscribedRef = useRef(false)

  // ── Initialize and subscribe ────────────────────────────────────────
  useEffect(() => {
    if (!currentUser) {
      subscribedRef.current = false
      return
    }

    // Avoid double-subscribe
    if (subscribedRef.current) return

    try {
      const manager = SupabaseRealtimeManager.getInstance()
      managerRef.current = manager

      // Convert Supabase notification payload to app Notification type
      const handleNewNotification = (payload: NotificationPayload) => {
        // Map the Supabase Realtime payload to our Notification type
        const notification: Notification = {
          id: payload.id,
          userId: payload.userId,
          title: payload.title,
          message: payload.message,
          type: payload.type as Notification['type'],
          category: payload.category as Notification['category'],
          link: payload.link,
          image: payload.image,
          priority: payload.priority as Notification['priority'],
          metadata: payload.metadata,
          isRead: payload.isRead,
          createdAt: payload.createdAt,
        }

        setLatestNotification(notification)

        // Update unread count
        const currentCount = useMarketplaceStore.getState().unreadNotifications
        setUnreadNotifications(currentCount + 1)

        // Show toast notification (same UI as the Socket.io version)
        const categoryIcons: Record<string, string> = {
          order: '🛒',
          payment: '💳',
          message: '💬',
          review: '⭐',
          shop: '🏪',
          promotion: '🏷️',
          system: '🔔',
        }

        const icon = categoryIcons[notification.category] || '🔔'

        toast.custom(
          (t) => (
            <div
              className="bg-background border border-border rounded-xl shadow-lg p-4 max-w-sm w-full cursor-pointer hover:bg-accent/50 transition-colors"
              onClick={() => {
                toast.dismiss(t)
                // Navigate based on link
                if (notification.link) {
                  const link = notification.link
                  const { setCurrentView } = useMarketplaceStore.getState()
                  if (link.includes('/product')) {
                    const id = link.split('/').pop()
                    if (id) setCurrentView('product-detail', { productId: id })
                  } else if (link.includes('/shop')) {
                    const slug = link.split('/').pop()
                    if (slug) setCurrentView('shop-view', { shopSlug: slug })
                  } else if (link.includes('/order')) {
                    setCurrentView('order-tracking')
                  } else if (link.includes('/message')) {
                    setCurrentView('messages')
                  }
                }
              }}
            >
              <div className="flex items-start gap-3">
                <span className="text-xl flex-shrink-0">{icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm">{notification.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                    {notification.message}
                  </p>
                </div>
              </div>
            </div>
          ),
          {
            duration: 5000,
            position: 'top-right',
          }
        )
      }

      // Subscribe to new notifications for this user via Postgres Changes
      manager.subscribeToNotifications(currentUser.id, handleNewNotification)
      subscribedRef.current = true

      console.log('[SupabaseNotifications] Subscribed for user:', currentUser.id)
    } catch (err) {
      console.warn('[SupabaseNotifications] Failed to subscribe:', err)
    }

    return () => {
      // Cleanup on user change or unmount
      if (managerRef.current && subscribedRef.current) {
        managerRef.current.unsubscribe(`notifications:${currentUser.id}`)
        subscribedRef.current = false
      }
    }
  }, [currentUser, setUnreadNotifications])

  // ── Fetch initial unread count (same as Socket.io version) ──────────
  const fetchUnreadCount = useCallback(async () => {
    if (!currentUser) return
    try {
      const res = await fetch(`/api/notifications/unread-count?userId=${currentUser.id}`)
      const data = await res.json()
      if (data.success) {
        setUnreadNotifications(data.data.count)
      }
    } catch {
      // silent
    }
  }, [currentUser, setUnreadNotifications])

  // Poll unread count as fallback (same as Socket.io version)
  useEffect(() => {
    fetchUnreadCount()
    const interval = setInterval(fetchUnreadCount, 60000) // Poll every 60s
    return () => clearInterval(interval)
  }, [fetchUnreadCount])

  // ── Cleanup on unmount ──────────────────────────────────────────────
  useEffect(() => {
    return () => {
      if (managerRef.current && !useMarketplaceStore.getState().isAuthenticated) {
        managerRef.current.unsubscribeAll()
        managerRef.current = null
      }
    }
  }, [])

  // ── Return hook API (matches useRealtimeNotifications) ──────────────
  return { latestNotification, fetchUnreadCount }
}
