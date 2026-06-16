'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CreditCard,
  Search,
  RefreshCw,
  Loader2,
  ShieldAlert,
  CheckCircle2,
  Clock,
  ToggleLeft,
  Zap,
  ChevronDown,
  ChevronRight,
  ExternalLink,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { useMarketplaceStore } from '@/store/use-marketplace-store'
import { api, ApiError } from '@/lib/api'
import { getPaymentCategoryOrder, getPaymentMethodsByCategory, type PaymentMethodId } from '@/lib/payment-methods'
import { toast } from 'sonner'

// ─── Types ──────────────────────────────────────────────────────────────────

interface MethodOverride {
  active: boolean
  reason?: string
}

interface AdminMethodDetail {
  id: PaymentMethodId
  name: string
  icon: string
  category: string
  description: string
  active: boolean
  baseActive: boolean
  overridden: boolean
  reason?: string
  popular?: boolean
  requiresApi?: boolean
  walletField?: string
}

interface PaymentMethodsStats {
  total: number
  active: number
  comingSoon: number
  overridden: number
}

interface PaymentMethodsResponse {
  success: boolean
  data: {
    methods: AdminMethodDetail[]
    stats: PaymentMethodsStats
    categories: {
      byCategory: Record<string, PaymentMethodId[]>
      order: string[]
    }
  }
}

// ─── Animation variants ─────────────────────────────────────────────────────

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.03 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0 },
}

// ─── Component ──────────────────────────────────────────────────────────────

export default function AdminPaymentMethods() {
  const { currentUser } = useMarketplaceStore()
  const [methods, setMethods] = useState<AdminMethodDetail[]>([])
  const [stats, setStats] = useState<PaymentMethodsStats>({ total: 0, active: 0, comingSoon: 0, overridden: 0 })
  const [categoryOrder, setCategoryOrder] = useState<string[]>([])
  const [byCategory, setByCategory] = useState<Record<string, PaymentMethodId[]>>({})
  const [loading, setLoading] = useState(true)
  const [authError, setAuthError] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [togglingId, setTogglingId] = useState<string | null>(null)
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({})

  // ─── Fetch methods ──────────────────────────────────────────────────────

  const fetchMethods = useCallback(async () => {
    setLoading(true)
    setAuthError(false)
    try {
      const res = await api.request<PaymentMethodsResponse>('/admin/payment-methods')
      if (res.success && res.data) {
        setMethods(res.data.methods)
        setStats(res.data.stats)
        setCategoryOrder(res.data.categories.order)
        setByCategory(res.data.categories.byCategory)
        // Expand all categories by default
        const expanded: Record<string, boolean> = {}
        for (const cat of res.data.categories.order) {
          expanded[cat] = true
        }
        setExpandedCategories(expanded)
      }
    } catch (err) {
      if (err instanceof ApiError && (err.status === 401 || err.status === 403)) {
        setAuthError(true)
      } else {
        toast.error('Failed to load payment methods', {
          description: err instanceof Error ? err.message : 'Unknown error',
        })
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchMethods()
  }, [fetchMethods])

  // ─── Toggle method ─────────────────────────────────────────────────────

  const handleToggle = async (methodId: PaymentMethodId, newActive: boolean) => {
    setTogglingId(methodId)
    try {
      const res = await api.request<PaymentMethodsResponse>('/admin/payment-methods', {
        method: 'PATCH',
        body: JSON.stringify({ methodId, active: newActive }),
      })
      if (res.success && res.data) {
        setMethods(res.data.methods)
        setStats(res.data.stats)
        const method = res.data.methods.find((m) => m.id === methodId)
        toast.success(
          newActive
            ? `${method?.name || methodId} activated`
            : `${method?.name || methodId} deactivated`,
          {
            description: newActive
              ? 'This payment method is now available on the platform.'
              : 'This payment method is now hidden from the platform.',
          }
        )
      }
    } catch (err) {
      toast.error('Failed to update payment method', {
        description: err instanceof Error ? err.message : 'Unknown error',
      })
    } finally {
      setTogglingId(null)
    }
  }

  // ─── Search filter ─────────────────────────────────────────────────────

  const filteredMethods = searchQuery.trim()
    ? methods.filter(
        (m) =>
          m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          m.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          m.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
          m.id.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : methods

  const activeMethods = filteredMethods.filter((m) => m.active)
  const comingSoonMethods = filteredMethods.filter((m) => !m.active)

  // ─── Category toggle ───────────────────────────────────────────────────

  const toggleCategory = (cat: string) => {
    setExpandedCategories((prev) => ({ ...prev, [cat]: !prev[cat] }))
  }

  // ─── Group methods by category within a list ──────────────────────────

  const groupByCategory = (methodList: AdminMethodDetail[]) => {
    const groups: Record<string, AdminMethodDetail[]> = {}
    for (const method of methodList) {
      if (!groups[method.category]) {
        groups[method.category] = []
      }
      groups[method.category].push(method)
    }
    return groups
  }

  const activeByCategory = groupByCategory(activeMethods)
  const comingSoonByCategory = groupByCategory(comingSoonMethods)

  // ─── Render ────────────────────────────────────────────────────────────

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary mb-4" />
          <p className="text-muted-foreground">Loading payment methods...</p>
        </div>
      </div>
    )
  }

  // Auth error state
  if (authError) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="p-8 text-center max-w-md">
          <ShieldAlert className="h-12 w-12 mx-auto text-destructive mb-4" />
          <h3 className="text-lg font-semibold mb-2">Authentication Required</h3>
          <p className="text-muted-foreground mb-4">
            You need to be logged in as an admin to manage payment methods.
          </p>
          <Button onClick={fetchMethods} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <CreditCard className="h-6 w-6 text-primary" />
            Payment Methods
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage platform payment methods, toggle availability, and activate coming-soon methods.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchMethods}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </motion.div>

      {/* Stats bar */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-muted">
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-xs text-muted-foreground">Total Methods</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.active}</p>
                <p className="text-xs text-muted-foreground">Active</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/10">
                <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.comingSoon}</p>
                <p className="text-xs text-muted-foreground">Coming Soon</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/10">
                <ToggleLeft className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.overridden}</p>
                <p className="text-xs text-muted-foreground">Overridden</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Search bar */}
      <motion.div variants={itemVariants}>
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search payment methods..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </motion.div>

      {/* Active Payment Methods */}
      <motion.div variants={itemVariants}>
        <div className="flex items-center gap-2 mb-4">
          <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
          <h2 className="text-lg font-semibold">Active Payment Methods</h2>
          <Badge variant="secondary" className="ml-1">{activeMethods.length}</Badge>
        </div>

        {activeMethods.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              {searchQuery ? 'No active methods match your search.' : 'No active payment methods.'}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {categoryOrder.map((category) => {
              const catMethods = activeByCategory[category]
              if (!catMethods || catMethods.length === 0) return null

              const isExpanded = expandedCategories[category] !== false
              return (
                <Card key={category}>
                  <CardHeader
                    className="p-4 cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => toggleCategory(category)}
                  >
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        )}
                        {category}
                        <Badge variant="outline" className="text-xs">{catMethods.length}</Badge>
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <CardContent className="px-4 pb-4 pt-0 space-y-2">
                          {catMethods.map((method) => (
                            <div
                              key={method.id}
                              className="flex items-center justify-between gap-3 p-3 rounded-lg border bg-background hover:bg-muted/30 transition-colors"
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <span className="text-xl shrink-0" role="img" aria-label={method.name}>
                                  {method.icon}
                                </span>
                                <div className="min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="font-medium text-sm">{method.name}</span>
                                    {method.popular && (
                                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                                        <Zap className="h-2.5 w-2.5 mr-0.5" />
                                        Popular
                                      </Badge>
                                    )}
                                    {method.overridden && (
                                      <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-purple-400 text-purple-600 dark:text-purple-400">
                                        Override
                                      </Badge>
                                    )}
                                    {method.requiresApi && (
                                      <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                                        API
                                      </Badge>
                                    )}
                                    <Badge className="text-[10px] px-1.5 py-0 bg-green-500/10 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800">
                                      <CheckCircle2 className="h-2.5 w-2.5 mr-0.5" />
                                      Active
                                    </Badge>
                                  </div>
                                  <p className="text-xs text-muted-foreground mt-0.5 truncate">
                                    {method.description}
                                  </p>
                                </div>
                              </div>
                              <div className="shrink-0 flex items-center">
                                {togglingId === method.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                                ) : (
                                  <Switch
                                    checked={method.active}
                                    onCheckedChange={(checked) => handleToggle(method.id, checked)}
                                    aria-label={`Toggle ${method.name}`}
                                  />
                                )}
                              </div>
                            </div>
                          ))}
                        </CardContent>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Card>
              )
            })}
          </div>
        )}
      </motion.div>

      <Separator />

      {/* Coming Soon Payment Methods */}
      <motion.div variants={itemVariants}>
        <div className="flex items-center gap-2 mb-4">
          <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          <h2 className="text-lg font-semibold">Coming Soon Payment Methods</h2>
          <Badge variant="secondary" className="ml-1">{comingSoonMethods.length}</Badge>
        </div>

        {comingSoonMethods.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              {searchQuery ? 'No coming-soon methods match your search.' : 'All payment methods are active!'}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {categoryOrder.map((category) => {
              const catMethods = comingSoonByCategory[category]
              if (!catMethods || catMethods.length === 0) return null

              const isExpanded = expandedCategories[`cs-${category}`] !== false
              return (
                <Card key={`cs-${category}`} className="border-dashed">
                  <CardHeader
                    className="p-4 cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => toggleCategory(`cs-${category}`)}
                  >
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        )}
                        {category}
                        <Badge variant="outline" className="text-xs">{catMethods.length}</Badge>
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <CardContent className="px-4 pb-4 pt-0 space-y-2">
                          {catMethods.map((method) => (
                            <div
                              key={method.id}
                              className="flex items-center justify-between gap-3 p-3 rounded-lg border border-dashed bg-muted/20 hover:bg-muted/30 transition-colors"
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <span className="text-xl shrink-0 opacity-60" role="img" aria-label={method.name}>
                                  {method.icon}
                                </span>
                                <div className="min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="font-medium text-sm">{method.name}</span>
                                    {method.popular && (
                                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                                        <Zap className="h-2.5 w-2.5 mr-0.5" />
                                        Popular
                                      </Badge>
                                    )}
                                    {method.requiresApi && (
                                      <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                                        API
                                      </Badge>
                                    )}
                                    <Badge className="text-[10px] px-1.5 py-0 bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800">
                                      <Clock className="h-2.5 w-2.5 mr-0.5" />
                                      Coming Soon
                                    </Badge>
                                  </div>
                                  <p className="text-xs text-muted-foreground mt-0.5 truncate">
                                    {method.description}
                                  </p>
                                  {method.reason && (
                                    <p className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">
                                      Reason: {method.reason}
                                    </p>
                                  )}
                                </div>
                              </div>
                              <div className="shrink-0">
                                {togglingId === method.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                                ) : (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleToggle(method.id, true)}
                                    className="gap-1.5 text-xs"
                                  >
                                    <ExternalLink className="h-3 w-3" />
                                    Activate
                                  </Button>
                                )}
                              </div>
                            </div>
                          ))}
                        </CardContent>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Card>
              )
            })}
          </div>
        )}
      </motion.div>

      {/* Footer info */}
      <motion.div variants={itemVariants}>
        <p className="text-xs text-muted-foreground text-center">
          Payment method configuration is managed via <code className="px-1 py-0.5 bg-muted rounded text-[10px]">paymentMethodOverrides</code> in platform settings.
          Changes take effect immediately across the platform.
        </p>
      </motion.div>
    </motion.div>
  )
}
