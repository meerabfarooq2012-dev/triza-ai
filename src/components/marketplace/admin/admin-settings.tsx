'use client'

import { useState, useEffect, useCallback } from 'react'
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

  // Platform settings state
  const [platformName, setPlatformName] = useState('Marketo')
  const [tagline, setTagline] = useState('Your Marketplace, Your Way')
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

  // Load settings from the database via API on mount
  // Uses the api client so the auth token and CSRF cookie are included automatically
  const fetchSettings = useCallback(async () => {
    setLoading(true)
    setError(null)
    setAuthError(false)

    // Check if user is authenticated and is admin
    // Use both isAuthenticated flag AND presence of authToken for reliability
    if (!isAuthenticated || !authToken || (currentUser?.role !== 'admin' && currentUser?.role !== 'both')) {
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
      const s = data.settings as unknown as PlatformSettingsData

      setPlatformName(s.platformName || 'Marketo')
      setTagline(s.tagline || 'Your Marketplace, Your Way')
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
  }, [isAuthenticated, authToken, currentUser?.role])

  useEffect(() => {
    fetchSettings()
  }, [fetchSettings])

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
      })

      toast.success('Settings saved successfully')
    } catch (err) {
      console.error('Failed to save admin settings:', err)
      toast.error(err instanceof Error ? err.message : 'Failed to save settings')
    } finally {
      setSaving(false)
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
