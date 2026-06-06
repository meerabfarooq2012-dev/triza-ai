'use client'

import { useEffect, useState, useCallback } from 'react'
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
  Filter,
  Clock,
  Volume2,
  VolumeX,
  AlertCircle,
  ChevronDown,
  ExternalLink,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Switch } from '@/components/ui/switch'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useMarketplaceStore } from '@/store/use-marketplace-store'
import {
  NOTIFICATION_CATEGORY_LABELS,
  NOTIFICATION_CATEGORY_COLORS,
} from '@/lib/constants'
import { cn } from '@/lib/utils'
import type { Notification, NotificationCategory } from '@/types'

// ─── Icon per category ────────────────────────────────────────────────────

function CategoryIcon({ category, size = 20 }: { category: string; size?: number }) {
  const props = { size }
  switch (category) {
    case 'order': return <ShoppingCart {...props} className="text-amber-500" />
    case 'payment': return <CreditCard {...props} className="text-amber-500" />
    case 'message': return <MessageSquare {...props} className="text-orange-500" />
    case 'review': return <Star {...props} className="text-amber-500" />
    case 'shop': return <Store {...props} className="text-amber-500" />
    case 'promotion': return <Tag {...props} className="text-orange-500" />
    case 'system': return <Settings {...props} className="text-gray-500" />
    default: return <Bell {...props} className="text-gray-500" />
  }
}

// ─── Relative time formatter ──────────────────────────────────────────────

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
  if (diffDays < 7) return 'This Week'
  if (diffDays < 30) return 'This Month'
  return 'Earlier'
}

// ─── Priority badge ──────────────────────────────────────────────────────

function PriorityBadge({ priority }: { priority: string }) {
  if (priority === 'normal' || priority === 'low') return null
  return (
    <Badge
      variant="outline"
      className={cn(
        'text-[10px] h-4 px-1.5',
        priority === 'high' && 'border-amber-300 text-amber-600 bg-amber-50',
        priority === 'urgent' && 'border-red-300 text-red-600 bg-red-50'
      )}
    >
      {priority === 'high' ? 'High' : 'Urgent'}
    </Badge>
  )
}

// ─── Notification Preferences Dialog ──────────────────────────────────────

function NotificationPreferences() {
  const { currentUser } = useMarketplaceStore()
  const [prefs, setPrefs] = useState<Record<string, boolean>>({
    orderUpdates: true,
    paymentAlerts: true,
    newMessages: true,
    reviewNotifications: true,
    shopUpdates: true,
    promotions: true,
    systemAlerts: true,
    soundEnabled: true,
    desktopNotifications: false,
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!currentUser) return
    fetch(`/api/notifications/preferences?userId=${currentUser.id}`)
      .then(r => r.json())
      .then(data => {
        if (data.success && data.data.preferences) {
          const p = data.data.preferences
          setPrefs({
            orderUpdates: p.orderUpdates ?? true,
            paymentAlerts: p.paymentAlerts ?? true,
            newMessages: p.newMessages ?? true,
            reviewNotifications: p.reviewNotifications ?? true,
            shopUpdates: p.shopUpdates ?? true,
            promotions: p.promotions ?? true,
            systemAlerts: p.systemAlerts ?? true,
            soundEnabled: p.soundEnabled ?? true,
            desktopNotifications: p.desktopNotifications ?? false,
          })
        }
      })
      .catch(() => {})
  }, [currentUser])

  const handleToggle = async (key: string, value: boolean) => {
    setPrefs(prev => ({ ...prev, [key]: value }))
    if (!currentUser) return
    setSaving(true)
    try {
      await fetch('/api/notifications/preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser.id, [key]: value }),
      })
    } catch {
      // revert on error
      setPrefs(prev => ({ ...prev, [key]: !value }))
    } finally {
      setSaving(false)
    }
  }

  const prefItems = [
    { key: 'orderUpdates', label: 'Order Updates', icon: ShoppingCart, desc: 'Order status changes, shipping updates' },
    { key: 'paymentAlerts', label: 'Payment Alerts', icon: CreditCard, desc: 'Payment received, withdrawals, escrow' },
    { key: 'newMessages', label: 'New Messages', icon: MessageSquare, desc: 'Direct messages from buyers/sellers' },
    { key: 'reviewNotifications', label: 'Review Notifications', icon: Star, desc: 'New reviews on your products/shop' },
    { key: 'shopUpdates', label: 'Shop Updates', icon: Store, desc: 'Shop approval, product approvals' },
    { key: 'promotions', label: 'Promotions', icon: Tag, desc: 'Sales, discounts, featured opportunities' },
    { key: 'systemAlerts', label: 'System Alerts', icon: Settings, desc: 'Maintenance, policy changes, updates' },
  ]

  return (
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <Bell size={18} />
          Notification Preferences
        </DialogTitle>
      </DialogHeader>
      <div className="space-y-1 mt-2 max-h-[60vh] overflow-y-auto">
        {prefItems.map(item => (
          <div key={item.key} className="flex items-center justify-between p-3 rounded-lg hover:bg-accent/50 transition-colors">
            <div className="flex items-start gap-3">
              <item.icon size={16} className="mt-0.5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">{item.label}</p>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
            </div>
            <Switch
              checked={prefs[item.key] as boolean}
              onCheckedChange={(checked) => handleToggle(item.key, checked)}
              disabled={saving}
            />
          </div>
        ))}
        <Separator className="my-2" />
        <div className="flex items-center justify-between p-3 rounded-lg hover:bg-accent/50 transition-colors">
          <div className="flex items-start gap-3">
            {prefs.soundEnabled ? (
              <Volume2 size={16} className="mt-0.5 text-muted-foreground" />
            ) : (
              <VolumeX size={16} className="mt-0.5 text-muted-foreground" />
            )}
            <div>
              <p className="text-sm font-medium">Sound</p>
              <p className="text-xs text-muted-foreground">Play sound for new notifications</p>
            </div>
          </div>
          <Switch
            checked={prefs.soundEnabled}
            onCheckedChange={(checked) => handleToggle('soundEnabled', checked)}
            disabled={saving}
          />
        </div>
      </div>
    </DialogContent>
  )
}

// ─── Main Notifications Page ──────────────────────────────────────────────

export default function NotificationsPage() {
  const { currentUser, setUnreadNotifications, setCurrentView } = useMarketplaceStore()

  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [markingAllRead, setMarkingAllRead] = useState(false)
  const [activeCategory, setActiveCategory] = useState<string>('all')
  const [showUnreadOnly, setShowUnreadOnly] = useState(false)
  const [totalCount, setTotalCount] = useState(0)

  const categories = [
    { key: 'all', label: 'All', icon: Bell },
    { key: 'order', label: 'Orders', icon: ShoppingCart },
    { key: 'payment', label: 'Payments', icon: CreditCard },
    { key: 'message', label: 'Messages', icon: MessageSquare },
    { key: 'review', label: 'Reviews', icon: Star },
    { key: 'shop', label: 'Shop', icon: Store },
    { key: 'system', label: 'System', icon: Settings },
  ]

  const fetchNotifications = useCallback(async () => {
    if (!currentUser) return
    setLoading(true)
    try {
      const params = new URLSearchParams({
        userId: currentUser.id,
        limit: '100',
      })
      if (activeCategory !== 'all') params.set('category', activeCategory)
      if (showUnreadOnly) params.set('unreadOnly', 'true')

      const res = await fetch(`/api/notifications?${params}`)
      const data = await res.json()
      if (data.success) {
        setNotifications(Array.isArray(data.data.notifications) ? data.data.notifications : [])
        setTotalCount(data.data.totalCount || 0)
      }
    } catch {
      setNotifications([])
    } finally {
      setLoading(false)
    }
  }, [currentUser, activeCategory, showUnreadOnly])

  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await fetch('/api/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationId }),
      })
      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
      )
      const currentCount = useMarketplaceStore.getState().unreadNotifications
      if (currentCount > 0) setUnreadNotifications(currentCount - 1)
    } catch {
      // silent
    }
  }

  const handleMarkAllRead = async () => {
    if (!currentUser) return
    setMarkingAllRead(true)
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
    } finally {
      setMarkingAllRead(false)
    }
  }

  const handleDelete = async (notificationId: string, e?: React.MouseEvent) => {
    e?.stopPropagation()
    try {
      await fetch('/api/notifications', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationId }),
      })
      setNotifications(prev => prev.filter(n => n.id !== notificationId))
    } catch {
      // silent
    }
  }

  const handleClearRead = async () => {
    if (!currentUser) return
    try {
      await fetch('/api/notifications', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser.id }),
      })
      setNotifications(prev => prev.filter(n => !n.isRead))
    } catch {
      // silent
    }
  }

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      handleMarkAsRead(notification.id)
    }
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

  const unreadCount = notifications.filter(n => !n.isRead).length

  // Group notifications by date
  const groupedNotifications: Record<string, Notification[]> = {}
  (Array.isArray(notifications) ? notifications : []).forEach(n => {
    const group = getDateGroup(n.createdAt)
    if (!groupedNotifications[group]) groupedNotifications[group] = []
    groupedNotifications[group].push(n)
  })

  const dateGroupOrder = ['Today', 'Yesterday', 'This Week', 'This Month', 'Earlier']

  // ─── Not authenticated ────────────────────────────────────────────────

  if (!currentUser) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <Bell size={64} className="mx-auto text-muted-foreground/40 mb-4" />
        <h2 className="text-xl font-bold mb-2">Sign in to see notifications</h2>
        <p className="text-muted-foreground">
          Log in to stay updated on your orders, messages, and more.
        </p>
      </div>
    )
  }

  // ─── Page ─────────────────────────────────────────────────────────────

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 md:py-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            Notifications
            {unreadCount > 0 && (
              <Badge variant="destructive" className="text-xs">
                {unreadCount} new
              </Badge>
            )}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {totalCount} total notification{totalCount !== 1 ? 's' : ''}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Preferences Dialog */}
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                <Settings size={14} />
                Preferences
              </Button>
            </DialogTrigger>
            <NotificationPreferences />
          </Dialog>

          {/* More Actions Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                More
                <ChevronDown size={12} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {unreadCount > 0 && (
                <DropdownMenuItem onClick={handleMarkAllRead} disabled={markingAllRead}>
                  <CheckCheck className="mr-2 h-4 w-4" />
                  Mark all as read
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={handleClearRead}>
                <Trash2 className="mr-2 h-4 w-4" />
                Clear read notifications
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex items-center gap-1.5 mb-4 overflow-x-auto pb-2 scrollbar-none">
        {categories.map(cat => {
          const isActive = activeCategory === cat.key
          return (
            <Button
              key={cat.key}
              variant={isActive ? 'secondary' : 'ghost'}
              size="sm"
              className={cn(
                'gap-1.5 text-xs whitespace-nowrap flex-shrink-0',
                isActive && 'shadow-sm'
              )}
              onClick={() => setActiveCategory(cat.key)}
            >
              <cat.icon size={14} />
              {cat.label}
            </Button>
          )
        })}

        <div className="ml-auto flex-shrink-0">
          <Button
            variant={showUnreadOnly ? 'secondary' : 'ghost'}
            size="sm"
            className="gap-1.5 text-xs"
            onClick={() => setShowUnreadOnly(!showUnreadOnly)}
          >
            <Filter size={14} />
            Unread only
          </Button>
        </div>
      </div>

      {/* Loading state */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-start gap-3 p-4">
              <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
                <Skeleton className="h-3 w-1/4" />
              </div>
            </div>
          ))}
        </div>
      ) : notifications.length === 0 ? (
        /* Empty state */
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-16"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
            <Bell size={28} className="text-muted-foreground" />
          </div>
          <h2 className="text-xl font-bold mb-2">
            {activeCategory !== 'all'
              ? `No ${NOTIFICATION_CATEGORY_LABELS[activeCategory] || ''} notifications`
              : showUnreadOnly
              ? 'No unread notifications'
              : 'No Notifications'}
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            {activeCategory !== 'all'
              ? `You don't have any ${NOTIFICATION_CATEGORY_LABELS[activeCategory]?.toLowerCase() || ''} notifications right now.`
              : "You're all caught up! Notifications about your orders, messages, and account activity will appear here."}
          </p>
        </motion.div>
      ) : (
        /* Grouped notifications */
        <ScrollArea className="max-h-[calc(100vh-280px)]">
          <AnimatePresence mode="popLayout">
            {dateGroupOrder.map(group => {
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
                  {/* Date group header */}
                  <div className="flex items-center gap-2 mb-2 px-1">
                    <Clock size={12} className="text-muted-foreground" />
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      {group}
                    </h3>
                    <div className="flex-1 h-px bg-border" />
                  </div>

                  {/* Notification cards */}
                  <div className="space-y-1">
                    {groupNotifications.map((notification, index) => (
                      <motion.div
                        key={notification.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10, height: 0 }}
                        transition={{ duration: 0.15, delay: index * 0.03 }}
                        whileHover={{ scale: 1.005 }}
                        whileTap={{ scale: 0.995 }}
                      >
                        <Card
                          className={cn(
                            "cursor-pointer border-0 shadow-sm transition-all hover:shadow-md group",
                            !notification.isRead && 'bg-primary/[0.04] border-l-2 border-l-primary'
                          )}
                          onClick={() => handleNotificationClick(notification)}
                        >
                          <CardContent className="p-3 sm:p-4">
                            <div className="flex items-start gap-3">
                              {/* Category icon with colored background */}
                              <div className={cn(
                                "h-9 w-9 rounded-full flex items-center justify-center flex-shrink-0",
                                NOTIFICATION_CATEGORY_COLORS[notification.category] || 'bg-gray-100'
                              )}>
                                <CategoryIcon category={notification.category} size={16} />
                              </div>

                              {/* Content */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <h4 className={cn(
                                        "text-sm",
                                        !notification.isRead ? "font-semibold" : "font-medium text-muted-foreground"
                                      )}>
                                        {notification.title}
                                      </h4>
                                      {!notification.isRead && (
                                        <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                                      )}
                                      <PriorityBadge priority={notification.priority} />
                                    </div>
                                    <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">
                                      {notification.message}
                                    </p>
                                  </div>

                                  {/* Time & actions */}
                                  <div className="flex items-center gap-1 flex-shrink-0">
                                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                                      {formatRelativeTime(notification.createdAt)}
                                    </span>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                                      onClick={(e) => handleDelete(notification.id, e)}
                                    >
                                      <Trash2 size={13} className="text-muted-foreground hover:text-red-500" />
                                    </Button>
                                  </div>
                                </div>

                                {/* Category badge */}
                                <div className="flex items-center gap-2 mt-2">
                                  <Badge
                                    variant="outline"
                                    className={cn(
                                      'text-[10px] h-5',
                                      NOTIFICATION_CATEGORY_COLORS[notification.category]
                                    )}
                                  >
                                    {NOTIFICATION_CATEGORY_LABELS[notification.category] || notification.category}
                                  </Badge>
                                  {notification.link && (
                                    <span className="text-[10px] text-primary flex items-center gap-0.5">
                                      View <ExternalLink size={10} />
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </ScrollArea>
      )}

      {/* Bottom action bar */}
      {!loading && notifications.length > 0 && unreadCount > 0 && (
        <div className="mt-4 flex items-center justify-center">
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 text-xs"
            onClick={handleMarkAllRead}
            disabled={markingAllRead}
          >
            <CheckCheck size={14} />
            {markingAllRead ? 'Marking...' : `Mark ${unreadCount} as read`}
          </Button>
        </div>
      )}
    </div>
  )
}
