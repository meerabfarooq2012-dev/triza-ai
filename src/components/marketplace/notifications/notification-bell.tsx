'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Bell,
  ShoppingCart,
  CreditCard,
  MessageSquare,
  Star,
  Store,
  Tag,
  Settings,
  CheckCheck,
  Trash2,
  ExternalLink,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { useMarketplaceStore } from '@/store/use-marketplace-store'
import { NOTIFICATION_CATEGORY_LABELS, NOTIFICATION_CATEGORY_COLORS } from '@/lib/constants'
import { cn } from '@/lib/utils'
import type { Notification, NotificationCategory, ViewMode } from '@/types'

function NotificationCategoryIcon({ category }: { category: string }) {
  const props = { size: 16 }
  switch (category) {
    case 'order': return <ShoppingCart {...props} className="text-purple-500" />
    case 'payment': return <CreditCard {...props} className="text-emerald-500" />
    case 'message': return <MessageSquare {...props} className="text-cyan-500" />
    case 'review': return <Star {...props} className="text-amber-500" />
    case 'shop': return <Store {...props} className="text-pink-500" />
    case 'promotion': return <Tag {...props} className="text-orange-500" />
    case 'system': return <Settings {...props} className="text-gray-500" />
    default: return <Bell {...props} className="text-gray-500" />
  }
}

function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m`
  if (diffHours < 24) return `${diffHours}h`
  const diffDays = Math.floor(diffHours / 24)
  if (diffDays < 7) return `${diffDays}d`
  return date.toLocaleDateString()
}

export function NotificationBell() {
  const { currentUser, unreadNotifications, setUnreadNotifications, setCurrentView } = useMarketplaceStore()
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(false)

  const fetchNotifications = useCallback(async () => {
    if (!currentUser) return
    setLoading(true)
    try {
      const res = await fetch(`/api/notifications?userId=${currentUser.id}&limit=10`)
      const data = await res.json()
      if (data.success) {
        setNotifications(data.data.notifications || [])
      }
    } catch {
      setNotifications([])
    } finally {
      setLoading(false)
    }
  }, [currentUser])

  useEffect(() => {
    if (open && currentUser) {
      fetchNotifications()
    }
  }, [open, currentUser, fetchNotifications])

  const handleMarkAsRead = async (notificationId: string, e?: React.MouseEvent) => {
    e?.stopPropagation()
    try {
      await fetch('/api/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationId }),
      })
      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
      )
      const newCount = Math.max(0, unreadNotifications - 1)
      setUnreadNotifications(newCount)
    } catch {
      // silent
    }
  }

  const handleMarkAllRead = async () => {
    if (!currentUser) return
    try {
      await fetch('/api/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAll: true, userId: currentUser.id }),
      })
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
      setUnreadNotifications(0)
    } catch {
      // silent
    }
  }

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      handleMarkAsRead(notification.id)
    }
    setOpen(false)
    if (notification.link) {
      const link = notification.link
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
  }

  const handleViewAll = () => {
    setOpen(false)
    setCurrentView('notifications')
  }

  const unreadInList = notifications.filter(n => !n.isRead).length

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 relative"
        >
          <Bell className={cn("h-[18px] w-[18px]", unreadNotifications > 0 && "animate-bounce")} style={{ animationDuration: '1s', animationIterationCount: '3' }} />
          {unreadNotifications > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 min-w-[20px] p-0 flex items-center justify-center text-[10px] font-bold bg-gradient-to-r from-red-500 to-pink-500 text-white border-0 shadow-sm">
              {unreadNotifications > 99 ? '99+' : unreadNotifications}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[380px] p-0" align="end" sideOffset={8}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 pb-3">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-sm">Notifications</h3>
            {unreadInList > 0 && (
              <Badge variant="secondary" className="text-[10px] h-5">
                {unreadInList} new
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-1">
            {unreadInList > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs gap-1 text-muted-foreground hover:text-foreground"
                onClick={handleMarkAllRead}
              >
                <CheckCheck size={13} />
                Mark all read
              </Button>
            )}
          </div>
        </div>
        <Separator />

        {/* Notifications List */}
        {loading ? (
          <div className="p-4 space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-start gap-3">
                <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-3.5 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-8 text-center">
            <Bell size={32} className="mx-auto text-muted-foreground/40 mb-3" />
            <p className="text-sm font-medium text-muted-foreground">No notifications yet</p>
            <p className="text-xs text-muted-foreground/70 mt-1">
              We&apos;ll notify you about orders, payments, and more
            </p>
          </div>
        ) : (
          <ScrollArea className="max-h-[400px]">
            <AnimatePresence>
              {notifications.map((notification) => (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.15 }}
                  className={cn(
                    "flex items-start gap-3 p-3 cursor-pointer hover:bg-accent/50 transition-colors border-b last:border-0",
                    !notification.isRead && 'bg-primary/[0.03]'
                  )}
                  onClick={() => handleNotificationClick(notification)}
                >
                  {/* Category Icon */}
                  <div className={cn(
                    "h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0",
                    NOTIFICATION_CATEGORY_COLORS[notification.category] || 'bg-gray-100'
                  )}>
                    <NotificationCategoryIcon category={notification.category} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={cn(
                        "text-sm leading-tight",
                        !notification.isRead ? "font-semibold" : "font-medium text-muted-foreground"
                      )}>
                        {notification.title}
                      </p>
                      <span className="text-[10px] text-muted-foreground whitespace-nowrap flex-shrink-0">
                        {formatRelativeTime(notification.createdAt)}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                      {notification.message}
                    </p>
                    {!notification.isRead && (
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary mt-1.5" />
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </ScrollArea>
        )}

        {/* Footer */}
        {notifications.length > 0 && (
          <>
            <Separator />
            <div className="p-2">
              <Button
                variant="ghost"
                className="w-full text-xs justify-center gap-1.5 h-8 text-muted-foreground hover:text-foreground"
                onClick={handleViewAll}
              >
                View all notifications
                <ExternalLink size={12} />
              </Button>
            </div>
          </>
        )}
      </PopoverContent>
    </Popover>
  )
}
