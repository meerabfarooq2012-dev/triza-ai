'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Bell,
  Info,
  CheckCircle,
  AlertTriangle,
  XCircle,
  ShoppingCart,
  MessageSquare,
  CheckCheck,
  Clock,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useMarketplaceStore } from '@/store/use-marketplace-store'
import { api } from '@/lib/api'
import { NOTIFICATION_TYPE_LABELS, NOTIFICATION_TYPE_COLORS } from '@/lib/constants'
import type { Notification, NotificationType } from '@/types'

function NotificationIcon({ type }: { type: NotificationType }) {
  const iconProps = { size: 20 }
  switch (type) {
    case 'info':
      return <Info {...iconProps} className="text-blue-500" />
    case 'success':
      return <CheckCircle {...iconProps} className="text-green-500" />
    case 'warning':
      return <AlertTriangle {...iconProps} className="text-yellow-500" />
    case 'error':
      return <XCircle {...iconProps} className="text-red-500" />
    case 'order':
      return <ShoppingCart {...iconProps} className="text-purple-500" />
    case 'message':
      return <MessageSquare {...iconProps} className="text-cyan-500" />
    default:
      return <Bell {...iconProps} className="text-gray-500" />
  }
}

function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString()
}

function getDateGroup(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  return 'Earlier'
}

export default function NotificationsPage() {
  const { currentUser, setUnreadNotifications, setCurrentView } = useMarketplaceStore()

  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [markingAllRead, setMarkingAllRead] = useState(false)

  const fetchNotifications = useCallback(async () => {
    if (!currentUser) return
    setLoading(true)
    try {
      const res = await api.notifications.getNotifications({ limit: 50 })
      if (res.data) {
        const items = 'items' in res.data ? res.data.items : (res.data as unknown as Notification[])
        setNotifications(Array.isArray(items) ? items : [])
      }
    } catch {
      setNotifications([])
    } finally {
      setLoading(false)
    }
  }, [currentUser])

  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await api.notifications.markNotificationRead(notificationId)
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notificationId ? { ...n, isRead: true } : n
        )
      )
      // Update unread count
      const unreadCount = notifications.filter(
        (n) => !n.isRead && n.id !== notificationId
      ).length
      setUnreadNotifications(unreadCount)
    } catch {
      // silent fail
    }
  }

  const handleMarkAllRead = async () => {
    if (!currentUser) return
    setMarkingAllRead(true)
    try {
      await api.notifications.markAllNotificationsRead()
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
      setUnreadNotifications(0)
    } catch {
      // silent fail
    } finally {
      setMarkingAllRead(false)
    }
  }

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      handleMarkAsRead(notification.id)
    }
    if (notification.link) {
      // Parse link to navigate - links might be like /product/123 or /order/456
      const link = notification.link
      if (link.includes('/product')) {
        const id = link.split('/').pop()
        if (id) setCurrentView('product-detail', { productId: id })
      } else if (link.includes('/shop')) {
        const slug = link.split('/').pop()
        if (slug) setCurrentView('shop-view', { shopSlug: slug })
      } else if (link.includes('/order')) {
        setCurrentView('orders')
      }
    }
  }

  const unreadCount = notifications.filter((n) => !n.isRead).length

  // Group notifications by date
  const groupedNotifications: Record<string, Notification[]> = {}
  notifications.forEach((n) => {
    const group = getDateGroup(n.createdAt)
    if (!groupedNotifications[group]) groupedNotifications[group] = []
    groupedNotifications[group].push(n)
  })

  const dateGroupOrder = ['Today', 'Yesterday', 'Earlier']

  if (!currentUser) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <Bell size={64} className="mx-auto text-muted-foreground mb-4" />
        <h2 className="text-xl font-bold mb-2">Sign in to see notifications</h2>
        <p className="text-muted-foreground">
          Log in to stay updated on your orders, messages, and more.
        </p>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 md:py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold">Notifications</h1>
          {unreadCount > 0 && (
            <Badge variant="destructive" className="text-xs">
              {unreadCount} new
            </Badge>
          )}
        </div>
        {unreadCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleMarkAllRead}
            disabled={markingAllRead}
            className="gap-1 text-xs"
          >
            <CheckCheck size={14} />
            {markingAllRead ? 'Marking...' : 'Mark All Read'}
          </Button>
        )}
      </div>

      {/* Loading state */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
      ) : notifications.length === 0 ? (
        /* Empty state */
        <div className="text-center py-16">
          <Bell size={64} className="mx-auto text-muted-foreground mb-4" />
          <h2 className="text-xl font-bold mb-2">No Notifications</h2>
          <p className="text-muted-foreground">
            You&apos;re all caught up! Notifications about your orders, messages,
            and account activity will appear here.
          </p>
        </div>
      ) : (
        /* Grouped notifications */
        <ScrollArea className="max-h-[calc(100vh-200px)]">
          <AnimatePresence>
            {dateGroupOrder.map((group) => {
              const groupNotifications = groupedNotifications[group]
              if (!groupNotifications || groupNotifications.length === 0) return null

              return (
                <motion.div
                  key={group}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className="mb-6"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <Clock size={14} className="text-muted-foreground" />
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                      {group}
                    </h3>
                  </div>

                  <div className="space-y-2">
                    {groupNotifications.map((notification) => (
                      <motion.div
                        key={notification.id}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        transition={{ duration: 0.1 }}
                      >
                        <Card
                          className={`cursor-pointer border-0 shadow-sm transition-all hover:shadow-md ${
                            !notification.isRead ? 'bg-primary/5' : ''
                          }`}
                          onClick={() => handleNotificationClick(notification)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                              {/* Icon */}
                              <div className="flex-shrink-0 mt-0.5">
                                <NotificationIcon type={notification.type} />
                              </div>

                              {/* Content */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                      <h4 className="font-medium text-sm">
                                        {notification.title}
                                      </h4>
                                      {!notification.isRead && (
                                        <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                                      )}
                                    </div>
                                    <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">
                                      {notification.message}
                                    </p>
                                  </div>
                                  <span className="text-xs text-muted-foreground whitespace-nowrap flex-shrink-0">
                                    {formatRelativeTime(notification.createdAt)}
                                  </span>
                                </div>

                                {/* Type badge */}
                                <div className="mt-2">
                                  <Badge
                                    variant="outline"
                                    className={`text-xs ${
                                      NOTIFICATION_TYPE_COLORS[notification.type]
                                    }`}
                                  >
                                    {NOTIFICATION_TYPE_LABELS[notification.type]}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>

                  {group !== 'Earlier' && <Separator className="mt-4" />}
                </motion.div>
              )
            })}
          </AnimatePresence>
        </ScrollArea>
      )}
    </div>
  )
}
