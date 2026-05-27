'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Save,
  Globe,
  Percent,
  Wrench,
  Settings,
  CheckCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { PLATFORM_NAME, PLATFORM_FEE_PERCENT } from '@/lib/constants'

export default function AdminSettings() {
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  // Platform settings state
  const [platformName, setPlatformName] = useState(PLATFORM_NAME)
  const [tagline, setTagline] = useState('Your Marketplace, Your Way')
  const [description, setDescription] = useState(
    'Create your own customizable shop, sell digital & physical products, or offer freelance services — all in one place.'
  )
  const [feePercent, setFeePercent] = useState(String(PLATFORM_FEE_PERCENT))
  const [maintenanceMode, setMaintenanceMode] = useState(false)
  const [allowRegistration, setAllowRegistration] = useState(true)
  const [allowNewShops, setAllowNewShops] = useState(true)
  const [maxImagesPerProduct, setMaxImagesPerProduct] = useState('8')
  const [maxFileSize, setMaxFileSize] = useState('50')

  const handleSave = async () => {
    setSaving(true)
    // Simulate save delay
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
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
            'Saving...'
          ) : saved ? (
            <>
              <CheckCircle size={16} />
              Saved!
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
              <Label htmlFor="fee-percent">Platform Fee (%)</Label>
              <div className="flex items-center gap-3">
                <Input
                  id="fee-percent"
                  type="number"
                  min="0"
                  max="50"
                  value={feePercent}
                  onChange={(e) => setFeePercent(e.target.value)}
                  className="w-24"
                />
                <span className="text-sm text-muted-foreground">
                  Percentage taken from each transaction
                </span>
              </div>
              {Number(feePercent) > 20 && (
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
                checked={allowNewShops}
                onCheckedChange={setAllowNewShops}
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
                value={maxImagesPerProduct}
                onChange={(e) => setMaxImagesPerProduct(e.target.value)}
                className="w-24"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="max-file-size">Max File Size (MB)</Label>
              <Input
                id="max-file-size"
                type="number"
                min="1"
                max="500"
                value={maxFileSize}
                onChange={(e) => setMaxFileSize(e.target.value)}
                className="w-24"
              />
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
            'Saving...'
          ) : saved ? (
            <>
              <CheckCircle size={16} />
              Settings Saved!
            </>
          ) : (
            <>
              <Save size={16} />
              Save All Settings
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
