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
  createdAt: string
  updatedAt: string
}

export default function AdminSettings() {
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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

  // Load settings from the database via API on mount
  const fetchSettings = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/settings')
      if (!res.ok) throw new Error('Failed to load settings')
      const data = await res.json()
      const s: PlatformSettingsData = data.settings

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
    } catch (err) {
      console.error('Failed to load admin settings:', err)
      setError('Failed to load settings. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchSettings()
  }, [fetchSettings])

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platformName,
          tagline,
          description,
          commissionRate: parseFloat(commissionRate) || 10,
          maintenanceMode,
          allowRegistration,
          allowSellerRegistration,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to save settings')
      }

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
