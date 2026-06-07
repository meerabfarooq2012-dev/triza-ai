'use client'

import { useEffect, useRef, useCallback, useState, useMemo } from 'react'
import { io, Socket } from 'socket.io-client'
import { useMarketplaceStore } from '@/store/use-marketplace-store'
import { toast } from 'sonner'
import type { Notification } from '@/types'
import { getRealtimeStrategy, type RealtimeStrategy } from '@/lib/realtime-strategy'
import {
  SupabaseRealtimeManager,
  type NotificationPayload,
} from '@/lib/supabase-realtime'

// Singleton socket instance (Socket.io — used for local dev)
let notifSocket: Socket | null = null
let socketConnected = false

function getNotificationSocket(): Socket | null {
  if (typeof window === 'undefined') return null

  // On Vercel (or any environment without the notification service), skip socket creation
  const isVercel = typeof window !== 'undefined' && (
    window.location.hostname.endsWith('.vercel.app') ||
    window.location.hostname.endsWith('.app') ||
    !window.location.hostname.includes('localhost')
  )

  // Allow explicit override
  const socketDisabled = typeof window !== 'undefined' &&
    (window as unknown as { __SOCKET_DISABLED__?: boolean }).__SOCKET_DISABLED__

  if (socketDisabled) return null

  if (!notifSocket) {
    const socketUrl = isVercel ? '' : undefined

    notifSocket = io(socketUrl ?? '/?XTransformPort=3004', {
      transports: ['websocket', 'polling'],
      autoConnect: false,
      reconnection: true,
      reconnectionAttempts: isVercel ? 3 : 10,
      reconnectionDelay: 2000,
      timeout: isVercel ? 5000 : 20000,
    })

    notifSocket.on('connect', () => {
      socketConnected = true
      console.log('[Notifications] Socket connected:', notifSocket?.id)
    })

    notifSocket.on('disconnect', () => {
      socketConnected = false
      console.log('[Notifications] Socket disconnected')
    })

    notifSocket.on('connect_error', (err) => {
      if (isVercel) {
        console.log('[Notifications] Socket not available (expected on Vercel) — using REST fallback')
        notifSocket?.disconnect()
      } else {
        console.warn('[Notifications] Connection error:', err.message)
      }
    })
  }

  return notifSocket
}

// =============================================================================
// useRealtimeNotifications Hook — Strategy-aware
// =============================================================================

export function useRealtimeNotifications() {
  const { currentUser, setUnreadNotifications } = useMarketplaceStore()
  const [latestNotification, setLatestNotification] = useState<Notification | null>(null)

  // Determine the realtime strategy once
  const strategy = useMemo<RealtimeStrategy>(() => {
    if (typeof window === 'undefined') return 'polling'
    return getRealtimeStrategy()
  }, [])

  const registeredRef = useRef(false)

  // ── Supabase-specific refs ──────────────────────────────────────────
  const supabaseManagerRef = useRef<SupabaseRealtimeManager | null>(null)
  const supabaseSubscribedRef = useRef(false)

  // ── SOCKET.IO PATH ─────────────────────────────────────────────────

  // Register user with Socket.io when they log in
  useEffect(() => {
    if (strategy !== 'socketio') return
    if (!currentUser) {
      registeredRef.current = false
      return
    }

    const socket = getNotificationSocket()
    if (!socket) return

    if (!socket.connected) {
      socket.connect()
    }

    const registerUser = () => {
      socket.emit('register-user', { userId: currentUser.id })
      registeredRef.current = true
    }

    if (socket.connected) {
      registerUser()
    } else {
      socket.on('connect', registerUser)
    }

    return () => {
      socket.off('connect', registerUser)
    }
  }, [currentUser, strategy])

  // Listen for Socket.io notifications
  useEffect(() => {
    if (strategy !== 'socketio') return

    const socket = getNotificationSocket()
    if (!socket) return

    const handleNewNotification = (data: Notification) => {
      setLatestNotification(data)

      const currentCount = useMarketplaceStore.getState().unreadNotifications
      setUnreadNotifications(currentCount + 1)

      const categoryIcons: Record<string, string> = {
        order: '🛒',
        payment: '💳',
        message: '💬',
        review: '⭐',
        shop: '🏪',
        promotion: '🏷️',
        system: '🔔',
      }

      const icon = categoryIcons[data.category] || '🔔'

      toast.custom((t) => (
        <div
          className="bg-background border border-border rounded-xl shadow-lg p-4 max-w-sm w-full cursor-pointer hover:bg-accent/50 transition-colors"
          onClick={() => {
            toast.dismiss(t)
            if (data.link) {
              const link = data.link
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
              <p className="font-semibold text-sm">{data.title}</p>
              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{data.message}</p>
            </div>
          </div>
        </div>
      ), {
        duration: 5000,
        position: 'top-right',
      })
    }

    const handleAllRead = () => {
      setUnreadNotifications(0)
    }

    const handleNotificationUpdated = (data: { notificationId: string; isRead: boolean }) => {
      if (data.isRead) {
        const currentCount = useMarketplaceStore.getState().unreadNotifications
        if (currentCount > 0) {
          setUnreadNotifications(currentCount - 1)
        }
      }
    }

    const handleUnreadCount = (data: { count: number }) => {
      setUnreadNotifications(data.count)
    }

    socket.on('new-notification', handleNewNotification)
    socket.on('all-read', handleAllRead)
    socket.on('notification-updated', handleNotificationUpdated)
    socket.on('unread-count', handleUnreadCount)

    return () => {
      socket.off('new-notification', handleNewNotification)
      socket.off('all-read', handleAllRead)
      socket.off('notification-updated', handleNotificationUpdated)
      socket.off('unread-count', handleUnreadCount)
    }
  }, [setUnreadNotifications, strategy])

  // Socket.io cleanup on unmount
  useEffect(() => {
    if (strategy !== 'socketio') return
    return () => {
      if (notifSocket && !useMarketplaceStore.getState().isAuthenticated) {
        notifSocket.disconnect()
        notifSocket = null
        socketConnected = false
      }
    }
  }, [strategy])

  // ── SUPABASE REALTIME PATH ─────────────────────────────────────────

  useEffect(() => {
    if (strategy !== 'supabase') return
    if (!currentUser) {
      supabaseSubscribedRef.current = false
      return
    }

    if (supabaseSubscribedRef.current) return

    try {
      const manager = SupabaseRealtimeManager.getInstance()
      supabaseManagerRef.current = manager

      // Convert Supabase notification payload to app Notification type
      const handleNewNotification = (payload: NotificationPayload) => {
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
      supabaseSubscribedRef.current = true

      console.log('[Notifications] Using Supabase Realtime strategy for user:', currentUser.id)
    } catch (err) {
      console.warn('[Notifications] Supabase Realtime init failed, falling back to polling:', err)
    }

    return () => {
      if (supabaseManagerRef.current && supabaseSubscribedRef.current && currentUser) {
        supabaseManagerRef.current.unsubscribe(`notifications:${currentUser.id}`)
        supabaseSubscribedRef.current = false
      }
    }
  }, [currentUser, setUnreadNotifications, strategy])

  // ── SHARED: Fetch initial unread count + polling fallback ───────────

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

  useEffect(() => {
    fetchUnreadCount()
    // Poll every 60s as fallback (for all strategies)
    const interval = setInterval(fetchUnreadCount, 60000)
    return () => clearInterval(interval)
  }, [fetchUnreadCount])

  // ── Cleanup on unmount (all strategies) ─────────────────────────────

  useEffect(() => {
    return () => {
      if (supabaseManagerRef.current && !useMarketplaceStore.getState().isAuthenticated) {
        supabaseManagerRef.current.unsubscribeAll()
        supabaseManagerRef.current = null
      }
    }
  }, [])

  // ── Return hook API ─────────────────────────────────────────────────

  return {
    latestNotification,
    fetchUnreadCount,
    // Expose strategy for debugging
    _strategy: strategy,
  }
}
