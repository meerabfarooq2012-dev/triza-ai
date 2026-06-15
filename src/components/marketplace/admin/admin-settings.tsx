'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion } from 'framer-motion'
import {
  Save,
  Globe,
  Percent,
  Wrench,
  Settings,
  CheckCircle,
  Loader2,
  AlertCircle,
  Receipt,
  ShieldAlert,
  Database,
  RefreshCw,
  CreditCard,
  Check,
  Search,
  Clock,
  Lock,
  Zap,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { api } from '@/lib/api'
import { useMarketplaceStore } from '@/store/use-marketplace-store'
import { PAYMENT_METHODS, type PaymentMethodId, getPaymentMethodsByCategory, getPaymentCategoryOrder, searchPaymentMethods, getActivePaymentMethodIds, getComingSoonPaymentMethodIds } from '@/lib/payment-methods'

interface PlatformSettingsData {
  id: string
  platformName: string
  tagline: string | null
  description: string | null
  logoUrl: string | null
  primaryColor: string | null
  accentColor: string | null
  maintenanceMode: boolean
  allowRegistration: boolean
  allowSellerRegistration: boolean
  commissionRate: number
  minWithdrawalAmount: number
  supportEmail: string | null
  supportPhone: string | null
  socialLinks: string | null
  taxEnabled: boolean
  taxRate: number
  taxInclusive: boolean
  taxLabel: string
  enabledPaymentMethods: string
  createdAt: string
  updatedAt: string
}

export default function AdminSettings() {
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [authError, setAuthError] = useState(false)
  const isAuthenticated = useMarketplaceStore((s) => s.isAuthenticated)
  const currentUser = useMarketplaceStore((s) => s.currentUser)
  const setCurrentView = useMarketplaceStore((s) => s.setCurrentView)
  const authToken = useMarketplaceStore((s) => s.authToken)
  const isLoadingAuth = useMarketplaceStore((s) => s.isLoadingAuth)
  const prevIsLoadingAuthRef = useRef(isLoadingAuth)

  // Platform settings state
  const [platformName, setPlatformName] = useState('Thiora')
  const [tagline, setTagline] = useState('Freelance. Digital. Physical. One Platform.')
  const [description, setDescription] = useState(
    'Create your own customizable shop, sell digital & physical products, or offer freelance services — all in one place.'
  )
  const [commissionRate, setCommissionRate] = useState('10')
  const [maintenanceMode, setMaintenanceMode] = useState(false)
  const [allowRegistration, setAllowRegistration] = useState(true)
  const [allowSellerRegistration, setAllowSellerRegistration] = useState(true)

  // Tax settings state
  const [taxEnabled, setTaxEnabled] = useState(false)
  const [taxRate, setTaxRate] = useState('0')
  const [taxInclusive, setTaxInclusive] = useState(false)
  const [taxLabel, setTaxLabel] = useState('Tax')

  // Payment methods state
  const [enabledPaymentMethods, setEnabledPaymentMethods] = useState<PaymentMethodId[]>([])
  const [paymentSearch, setPaymentSearch] = useState('')

  // Sync Schema state
  const [syncingSchema, setSyncingSchema] = useState(false)
  const [syncResult, setSyncResult] = useState<{
    success: boolean
    summary?: { total: number; applied: number; skipped: number; errors: number }
    results?: { name: string; status: string; error?: string }[]
    newTables?: string[]
    output?: string
  } | null>(null)

  // Load settings from the database via API on mount
  // Uses the api client so the auth token and CSRF cookie are included automatically
  const fetchSettings = useCallback(async () => {
    // If the store is still rehydrating from localStorage, don't check auth yet —
    // authToken will be null on first render before rehydration completes.
    // Just return and wait; the useEffect below will re-trigger when rehydration finishes.
    if (isLoadingAuth) {
      return
    }

    setLoading(true)
    setError(null)
    setAuthError(false)

    // Check if user is authenticated and is admin
    // Use both isAuthenticated flag AND presence of authToken for reliability
    if (!isAuthenticated || !authToken || ((currentUser?.role as string) !== 'admin' && currentUser?.role !== 'both')) {
      // If we have an auth token but no user, try the API anyway — the token
      // may be valid even if the store hasn't fully rehydrated yet
      if (!authToken) {
        setAuthError(true)
        setLoading(false)
        return
      }
    }

    try {
      const data = await api.admin.getSettings()
      const s = ((data as any).settings || (data as any).data) as unknown as PlatformSettingsData

      setPlatformName(s.platformName || 'Thiora')
      setTagline(s.tagline || 'Freelance. Digital. Physical. One Platform.')
      setDescription(
        s.description ||
          'Create your own customizable shop, sell digital & physical products, or offer freelance services — all in one place.'
      )
      setCommissionRate(String(s.commissionRate ?? 10))
      setMaintenanceMode(s.maintenanceMode ?? false)
      setAllowRegistration(s.allowRegistration ?? true)
      setAllowSellerRegistration(s.allowSellerRegistration ?? true)
      setTaxEnabled(s.taxEnabled ?? false)
      setTaxRate(String(s.taxRate ?? 0))
      setTaxInclusive(s.taxInclusive ?? false)
      setTaxLabel(s.taxLabel ?? 'Tax')

      // Load enabled payment methods
      let methods: PaymentMethodId[] = []
      try {
        methods = JSON.parse(s.enabledPaymentMethods || '[]')
      } catch { methods = [] }
      setEnabledPaymentMethods(methods)
    } catch (err) {
      console.error('Failed to load admin settings:', err)
      // Check if it's an auth error
      const errMsg = err instanceof Error ? err.message : ''
      if (errMsg.includes('401') || errMsg.includes('Unauthorized') || errMsg.includes('Authentication')) {
        setAuthError(true)
      } else {
        setError('Failed to load settings. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated, authToken, currentUser?.role, isLoadingAuth])

  useEffect(() => {
    fetchSettings()
  }, [fetchSettings])

  // When isLoadingAuth transitions from true → false (rehydration complete),
  // trigger fetchSettings so we can now safely check the auth token.
  useEffect(() => {
    if (prevIsLoadingAuthRef.current && !isLoadingAuth) {
      fetchSettings()
    }
    prevIsLoadingAuthRef.current = isLoadingAuth
  }, [isLoadingAuth, fetchSettings])

  const handleSave = async () => {
    setSaving(true)
    try {
      // Use the api client so the auth token and CSRF token are included automatically
      await api.admin.updateSettings({
        platformName,
        tagline,
        description,
        commissionRate: parseFloat(commissionRate) || 10,
        maintenanceMode,
        allowRegistration,
        allowSellerRegistration,
        taxEnabled,
        taxRate: parseFloat(taxRate) || 0,
        taxInclusive,
        taxLabel: taxLabel || 'Tax',
        enabledPaymentMethods,
      })

      toast.success('Settings saved successfully')
    } catch (err) {
      console.error('Failed to save admin settings:', err)
      toast.error(err instanceof Error ? err.message : 'Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  const handleSyncSchema = async () => {
    setSyncingSchema(true)
    setSyncResult(null)
    try {
      // Use the api client's request helper so auth token and CSRF token are included
      const data = await api.request<{
        success: boolean
        summary?: { total: number; applied: number; skipped: number; errors: number }
        results?: { name: string; status: string; error?: string }[]
        newTables?: string[]
        output?: string
      }>('/admin/sync-schema', { method: 'POST' })
      setSyncResult(data)
      if (data.success) {
        const applied = data.summary?.applied || 0
        const skipped = data.summary?.skipped || 0
        const errors = data.summary?.errors || 0
        if (applied > 0) {
          toast.success(`Schema synced! ${applied} applied, ${skipped} already exist`)
        } else if (errors > 0) {
          toast.warning(`Schema sync completed with ${errors} error(s)`)
        } else {
          toast.success('Schema is already in sync — no changes needed')
        }
      } else {
        toast.error('Schema sync failed — check details below')
      }
    } catch (err) {
      console.error('Schema sync error:', err)
      toast.error('Failed to sync schema')
      setSyncResult({ success: false })
    } finally {
      setSyncingSchema(false)
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-3 text-muted-foreground">Loading settings...</span>
      </div>
    )
  }

  // Auth error state
  if (authError) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <ShieldAlert className="h-12 w-12 text-amber-500" />
        <h3 className="text-lg font-semibold">Authentication Required</h3>
        <p className="text-muted-foreground text-center max-w-md">
          Your session may have expired. Please sign in again to access admin settings.
        </p>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => setCurrentView('auth')}>
            Sign In
          </Button>
          <Button variant="outline" onClick={fetchSettings}>
            Retry
          </Button>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <AlertCircle className="h-10 w-10 text-destructive" />
        <p className="text-destructive font-medium">{error}</p>
        <Button variant="outline" onClick={fetchSettings}>
          Retry
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Platform Settings</h2>
          <p className="text-sm text-muted-foreground">
            Configure your marketplace platform
          </p>
        </div>
        <Button
          onClick={handleSave}
          disabled={saving}
          className="gap-2"
        >
          {saving ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save size={16} />
              Save Settings
            </>
          )}
        </Button>
      </div>

      {/* General Settings */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Globe size={18} className="text-primary" />
              General
            </CardTitle>
            <CardDescription>
              Basic platform configuration
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="platform-name">Platform Name</Label>
              <Input
                id="platform-name"
                value={platformName}
                onChange={(e) => setPlatformName(e.target.value)}
                placeholder="Your marketplace name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tagline">Tagline</Label>
              <Input
                id="tagline"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                placeholder="Your marketplace tagline"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Platform description"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Financial Settings */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, delay: 0.1 }}
      >
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Percent size={18} className="text-primary" />
              Financial
            </CardTitle>
            <CardDescription>
              Revenue and fee settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="commission-rate">Platform Fee (%)</Label>
              <div className="flex items-center gap-3">
                <Input
                  id="commission-rate"
                  type="number"
                  min="0"
                  max="50"
                  value={commissionRate}
                  onChange={(e) => setCommissionRate(e.target.value)}
                  className="w-24"
                />
                <span className="text-sm text-muted-foreground">
                  Percentage taken from each transaction
                </span>
              </div>
              {Number(commissionRate) > 20 && (
                <p className="text-xs text-yellow-600">
                  Warning: A fee above 20% may discourage sellers
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Payment Methods */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <CreditCard size={18} className="text-primary" />
              Payment Methods
            </CardTitle>
            <CardDescription>
              Enable payment methods that your platform supports. Sellers will only see enabled methods.
              Only enable methods where you have API keys configured.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search payment methods..."
                value={paymentSearch}
                onChange={(e) => setPaymentSearch(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Stats bar */}
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="gap-1">
                  <Check size={12} className="text-emerald-600" />
                  {enabledPaymentMethods.length} enabled
                </Badge>
                <Badge variant="outline" className="gap-1 bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800">
                  <Zap size={12} />
                  {getActivePaymentMethodIds().length} active
                </Badge>
                <Badge variant="outline" className="gap-1 bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800">
                  <Clock size={12} />
                  {getComingSoonPaymentMethodIds().length} coming soon
                </Badge>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs text-emerald-600"
                  onClick={() => setEnabledPaymentMethods(getActivePaymentMethodIds() as PaymentMethodId[])}
                >
                  Enable Active
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs text-red-500"
                  onClick={() => setEnabledPaymentMethods([])}
                >
                  Disable All
                </Button>
              </div>
            </div>

            {/* Payment methods grid */}
            <div className="max-h-[500px] overflow-y-auto space-y-1 border rounded-lg p-2">
              {(() => {
                const categoryOrder = getPaymentCategoryOrder()
                const methodsByCategory = getPaymentMethodsByCategory()
                const searchResults = paymentSearch.trim()
                  ? searchPaymentMethods(paymentSearch)
                  : null

                if (searchResults) {
                  if (searchResults.length === 0) {
                    return (
                      <div className="text-center text-sm text-muted-foreground py-4">
                        No payment method found
                      </div>
                    )
                  }
                  return searchResults.map((id) => {
                    const config = PAYMENT_METHODS[id]
                    if (!config) return null
                    const isEnabled = enabledPaymentMethods.includes(id)
                    const isActive = config.active
                    return (
                      <div
                        key={id}
                        className={`flex items-center gap-2 px-3 py-2 rounded-md cursor-pointer transition-colors text-sm ${
                          isEnabled
                            ? 'bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800'
                            : isActive
                              ? 'hover:bg-gray-50 dark:hover:bg-gray-800 border border-transparent'
                              : 'opacity-60 border border-transparent'
                        }`}
                        onClick={() => {
                          setEnabledPaymentMethods(
                            isEnabled
                              ? enabledPaymentMethods.filter((m) => m !== id)
                              : [...enabledPaymentMethods, id]
                          )
                        }}
                      >
                        <span className="text-lg">{config.icon}</span>
                        <div className="flex-1 min-w-0">
                          <div className={`flex items-center gap-1.5 font-medium ${isEnabled ? 'text-emerald-700 dark:text-emerald-400' : isActive ? 'text-gray-700 dark:text-gray-300' : 'text-gray-400 dark:text-gray-500'}`}>
                            {config.name}
                            {isActive ? (
                              <Badge className="text-[8px] h-3.5 px-1 bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 border-0">
                                Active
                              </Badge>
                            ) : (
                              <Badge className="text-[8px] h-3.5 px-1 bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400 border-0">
                                <Clock className="h-2 w-2 mr-0.5" />
                                Soon
                              </Badge>
                            )}
                          </div>
                          <div className="text-[10px] text-muted-foreground truncate">
                            {config.description}
                            {!isActive && config.reason && ` — ${config.reason}`}
                          </div>
                        </div>
                        {isEnabled ? (
                          <Check size={16} className="text-emerald-600 flex-shrink-0" />
                        ) : !isActive ? (
                          <Lock size={14} className="text-gray-400 flex-shrink-0" />
                        ) : (
                          <span className="inline-block h-4 w-4 rounded border border-gray-300 flex-shrink-0" />
                        )}
                      </div>
                    )
                  })
                }

                return categoryOrder.map((category) => {
                  const ids = methodsByCategory[category]
                  if (!ids?.length) return null

                  const activeIds = ids.filter((id) => PAYMENT_METHODS[id]?.active)
                  const comingSoonIds = ids.filter((id) => !PAYMENT_METHODS[id]?.active)

                  return (
                    <div key={category}>
                      <div className="px-2 pt-3 pb-1 first:pt-0">
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                          {category}
                        </span>
                      </div>
                      {/* Active methods in this category */}
                      {activeIds.map((id) => {
                        const config = PAYMENT_METHODS[id]
                        if (!config) return null
                        const isEnabled = enabledPaymentMethods.includes(id)
                        return (
                          <div
                            key={id}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-md cursor-pointer transition-colors text-sm ${
                              isEnabled
                                ? 'bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800'
                                : 'hover:bg-gray-50 dark:hover:bg-gray-800 border border-transparent'
                            }`}
                            onClick={() => {
                              setEnabledPaymentMethods(
                                isEnabled
                                  ? enabledPaymentMethods.filter((m) => m !== id)
                                  : [...enabledPaymentMethods, id]
                              )
                            }}
                          >
                            <span className="text-base">{config.icon}</span>
                            <span className={`flex-1 flex items-center gap-1.5 ${isEnabled ? 'font-medium text-emerald-700 dark:text-emerald-400' : 'text-gray-600 dark:text-gray-400'}`}>
                              {config.name}
                              <Badge className="text-[8px] h-3.5 px-1 bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 border-0">
                                Active
                              </Badge>
                            </span>
                            {isEnabled ? (
                              <Check size={14} className="text-emerald-600 flex-shrink-0" />
                            ) : (
                              <span className="inline-block h-3.5 w-3.5 rounded border border-gray-300 flex-shrink-0" />
                            )}
                          </div>
                        )
                      })}
                      {/* Coming soon methods in this category */}
                      {comingSoonIds.map((id) => {
                        const config = PAYMENT_METHODS[id]
                        if (!config) return null
                        const isEnabled = enabledPaymentMethods.includes(id)
                        return (
                          <div
                            key={id}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-md cursor-pointer transition-colors text-sm ${
                              isEnabled
                                ? 'bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800'
                                : 'opacity-50 border border-transparent'
                            }`}
                            onClick={() => {
                              setEnabledPaymentMethods(
                                isEnabled
                                  ? enabledPaymentMethods.filter((m) => m !== id)
                                  : [...enabledPaymentMethods, id]
                              )
                            }}
                          >
                            <span className="text-base">{config.icon}</span>
                            <span className={`flex-1 flex items-center gap-1.5 ${isEnabled ? 'font-medium text-amber-700 dark:text-amber-400' : 'text-gray-400 dark:text-gray-500'}`}>
                              {config.name}
                              <Badge className="text-[8px] h-3.5 px-1 bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400 border-0">
                                <Clock className="h-2 w-2 mr-0.5" />
                                Soon
                              </Badge>
                            </span>
                            {isEnabled ? (
                              <Check size={14} className="text-amber-600 flex-shrink-0" />
                            ) : (
                              <Lock size={12} className="text-gray-400 flex-shrink-0" />
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )
                })
              })()}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Tax Configuration */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, delay: 0.15 }}
      >
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Receipt size={18} className="text-primary" />
              Tax Configuration
            </CardTitle>
            <CardDescription>
              Configure tax settings for your marketplace
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Tax Enabled</Label>
                <p className="text-xs text-muted-foreground">
                  Enable tax calculation on orders
                </p>
              </div>
              <div className="flex items-center gap-2">
                {taxEnabled && (
                  <Badge className="text-xs bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                    Active
                  </Badge>
                )}
                <Switch
                  checked={taxEnabled}
                  onCheckedChange={setTaxEnabled}
                />
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label htmlFor="tax-rate">Tax Rate (%)</Label>
              <div className="flex items-center gap-3">
                <Input
                  id="tax-rate"
                  type="number"
                  min="0"
                  max="100"
                  value={taxRate}
                  onChange={(e) => setTaxRate(e.target.value)}
                  className="w-24"
                  disabled={!taxEnabled}
                />
                <span className="text-sm text-muted-foreground">
                  Percentage applied to order subtotal
                </span>
              </div>
              {Number(taxRate) > 30 && taxEnabled && (
                <p className="text-xs text-yellow-600">
                  Warning: A tax rate above 30% is unusually high
                </p>
              )}
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Tax Inclusive</Label>
                <p className="text-xs text-muted-foreground">
                  If enabled, tax is included in product prices. If disabled, tax is added at checkout.
                </p>
              </div>
              <Switch
                checked={taxInclusive}
                onCheckedChange={setTaxInclusive}
                disabled={!taxEnabled}
              />
            </div>

            <Separator />

            <div className="space-y-2">
              <Label htmlFor="tax-label">Tax Label</Label>
              <Input
                id="tax-label"
                value={taxLabel}
                onChange={(e) => setTaxLabel(e.target.value)}
                placeholder="e.g., Tax, VAT, GST"
                className="w-40"
                disabled={!taxEnabled}
              />
              <p className="text-xs text-muted-foreground">
                Display label shown to customers (e.g., &quot;Tax&quot;, &quot;VAT&quot;, &quot;GST&quot;)
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Operational Settings */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, delay: 0.2 }}
      >
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Wrench size={18} className="text-primary" />
              Operations
            </CardTitle>
            <CardDescription>
              Platform operation toggles
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Maintenance Mode</Label>
                <p className="text-xs text-muted-foreground">
                  Temporarily disable the marketplace for maintenance
                </p>
              </div>
              <div className="flex items-center gap-2">
                {maintenanceMode && (
                  <Badge variant="destructive" className="text-xs">
                    Active
                  </Badge>
                )}
                <Switch
                  checked={maintenanceMode}
                  onCheckedChange={setMaintenanceMode}
                />
              </div>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Allow New Registrations</Label>
                <p className="text-xs text-muted-foreground">
                  Enable or disable new user sign-ups
                </p>
              </div>
              <Switch
                checked={allowRegistration}
                onCheckedChange={setAllowRegistration}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Allow New Shop Creation</Label>
                <p className="text-xs text-muted-foreground">
                  Enable or disable sellers from creating new shops
                </p>
              </div>
              <Switch
                checked={allowSellerRegistration}
                onCheckedChange={setAllowSellerRegistration}
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Upload Settings */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, delay: 0.3 }}
      >
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Settings size={18} className="text-primary" />
              Upload Limits
            </CardTitle>
            <CardDescription>
              Configure file upload restrictions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="max-images">Max Images Per Product</Label>
              <Input
                id="max-images"
                type="number"
                min="1"
                max="20"
                defaultValue="8"
                className="w-24"
                disabled
              />
              <p className="text-xs text-muted-foreground">
                Configurable in a future update
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="max-file-size">Max File Size (MB)</Label>
              <Input
                id="max-file-size"
                type="number"
                min="1"
                max="500"
                defaultValue="50"
                className="w-24"
                disabled
              />
              <p className="text-xs text-muted-foreground">
                Configurable in a future update
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Database Schema Sync */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, delay: 0.35 }}
      >
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Database size={18} className="text-primary" />
              Database Schema
            </CardTitle>
            <CardDescription>
              Sync database tables with the latest schema (run after deployments)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              When new features are added (like Crypto Wallets), new database tables need to be created.
              Click the button below to sync the schema and create any missing tables.
            </p>
            <Button
              onClick={handleSyncSchema}
              disabled={syncingSchema}
              variant="outline"
              className="gap-2"
            >
              {syncingSchema ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Syncing Schema...
                </>
              ) : (
                <>
                  <RefreshCw size={16} />
                  Sync Schema
                </>
              )}
            </Button>

            {syncResult && (
              <div className={`p-3 rounded-lg text-sm ${syncResult.success ? 'bg-green-50 border border-green-200 dark:bg-green-950/50 dark:border-green-900' : 'bg-red-50 border border-red-200 dark:bg-red-950/50 dark:border-red-900'}`}>
                <p className={`font-medium ${syncResult.success ? 'text-green-800 dark:text-green-300' : 'text-red-800 dark:text-red-300'}`}>
                  {syncResult.success
                    ? (syncResult.summary?.applied || 0) > 0
                      ? '✓ Schema sync complete — changes applied'
                      : '✓ Schema is already in sync'
                    : '✗ Schema sync had errors'}
                </p>
                {syncResult.summary && (
                  <p className="text-xs mt-1 text-muted-foreground">
                    {syncResult.summary.applied} applied, {syncResult.summary.skipped} already exist, {syncResult.summary.errors} errors
                  </p>
                )}
                {syncResult.newTables && syncResult.newTables.length > 0 && (
                  <div className="mt-2">
                    <p className="text-xs font-medium text-green-700 dark:text-green-400">New tables created:</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {syncResult.newTables.map((t) => (
                        <Badge key={t} variant="outline" className="text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 border-green-300 dark:border-green-800">
                          {t}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                {syncResult.results && syncResult.results.filter(r => r.status === 'error').length > 0 && (
                  <div className="mt-2 space-y-1">
                    {syncResult.results.filter(r => r.status === 'error').map((r, i) => (
                      <p key={i} className="text-xs text-red-700 dark:text-red-400">
                        ✗ {r.name}: {r.error}
                      </p>
                    ))}
                  </div>
                )}
                {syncResult.output && (
                  <details className="mt-2">
                    <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground transition-colors">
                      View output log
                    </summary>
                    <pre className="mt-1 p-2 bg-black/5 dark:bg-white/5 rounded text-xs overflow-x-auto max-h-40 overflow-y-auto whitespace-pre-wrap">
                      {syncResult.output}
                    </pre>
                  </details>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Save button (bottom) */}
      <div className="flex justify-end pt-4">
        <Button
          onClick={handleSave}
          disabled={saving}
          size="lg"
          className="gap-2"
        >
          {saving ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Saving Settings...
            </>
          ) : (
            <>
              <CheckCircle size={16} />
              Save All Settings
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
