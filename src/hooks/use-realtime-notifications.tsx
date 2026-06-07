'use client'

import { useEffect, useRef, useCallback, useState } from 'react'
import { io, Socket } from 'socket.io-client'
import { useMarketplaceStore } from '@/store/use-marketplace-store'
import { toast } from 'sonner'
import type { Notification } from '@/types'

// Singleton socket instance
let notifSocket: Socket | null = null
let socketConnected = false

function getNotificationSocket(authToken?: string | null): Socket | null {
  if (typeof window === 'undefined') return null

  if (!notifSocket) {
    notifSocket = io('/?XTransformPort=3004', {
      transports: ['websocket', 'polling'],
      autoConnect: false,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
      auth: {
        token: authToken || undefined,
      },
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
      console.warn('[Notifications] Connection error:', err.message)
    })
  }

  return notifSocket
}

export function useRealtimeNotifications() {
  const { currentUser, authToken, setUnreadNotifications } = useMarketplaceStore()
  const [latestNotification, setLatestNotification] = useState<Notification | null>(null)
  const registeredRef = useRef(false)

  // Register user with socket when they log in
  useEffect(() => {
    if (!currentUser) {
      registeredRef.current = false
      return
    }

    const socket = getNotificationSocket(authToken)
    if (!socket) return

    // Update auth token on the socket if it changed
    if (socket.auth && typeof socket.auth === 'object') {
      (socket.auth as Record<string, unknown>).token = authToken || undefined
    }

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
  }, [currentUser])

  // Listen for new notifications
  useEffect(() => {
    const socket = getNotificationSocket()
    if (!socket) return

    const handleNewNotification = (data: Notification) => {
      setLatestNotification(data)

      // Update unread count
      const currentCount = useMarketplaceStore.getState().unreadNotifications
      setUnreadNotifications(currentCount + 1)

      // Show toast notification
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
            // Navigate based on link
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
      // If a notification was marked as read, decrement count
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
  }, [setUnreadNotifications])

  // Fetch initial unread count on mount
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
    const interval = setInterval(fetchUnreadCount, 60000) // Poll every 60s as fallback
    return () => clearInterval(interval)
  }, [fetchUnreadCount])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (notifSocket && !useMarketplaceStore.getState().isAuthenticated) {
        notifSocket.disconnect()
        notifSocket = null
        socketConnected = false
      }
    }
  }, [])

  return { latestNotification, fetchUnreadCount }
}
