'use client'

import { useEffect, useRef, useCallback, useState } from 'react'
import { io, Socket } from 'socket.io-client'
import { useMarketplaceStore } from '@/store/use-marketplace-store'
import { toast } from 'sonner'
import type { Notification } from '@/types'

// Singleton socket instance
let notifSocket: Socket | null = null
let socketConnected = false

function getNotificationSocket(): Socket | null {
  if (typeof window === 'undefined') return null

  // On Vercel (or any environment without the notification service), skip socket creation
  // Notifications will fall back to polling via the notifications API routes
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
    // Determine socket URL based on environment
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
      // On Vercel, this is expected — no WebSocket server available
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

export function useRealtimeNotifications() {
  const { currentUser, setUnreadNotifications } = useMarketplaceStore()
  const [latestNotification, setLatestNotification] = useState<Notification | null>(null)
  const registeredRef = useRef(false)

  // Register user with socket when they log in
  useEffect(() => {
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
