'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Package,
  Truck,
  Plus,
  Pencil,
  Trash2,
  Globe,
  Clock,
  DollarSign,
  MapPin,
  AlertCircle,
  Loader2,
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from 'sonner'
import { useMarketplaceStore } from '@/store/use-marketplace-store'
import type { ShippingZone, ShippingRate, ShippingMethod } from '@/types'

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface ShippingSettingsProps {
  shopId?: string
  userId?: string
}

// ---------------------------------------------------------------------------
// Countries — exact 14 from the spec
// ---------------------------------------------------------------------------

const COUNTRIES = [
  { code: 'PK', name: 'Pakistan' },
  { code: 'US', name: 'United States' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'AE', name: 'UAE' },
  { code: 'SA', name: 'Saudi Arabia' },
  { code: 'IN', name: 'India' },
  { code: 'CN', name: 'China' },
  { code: 'TR', name: 'Turkey' },
  { code: 'MY', name: 'Malaysia' },
  { code: 'DE', name: 'Germany' },
  { code: 'FR', name: 'France' },
  { code: 'CA', name: 'Canada' },
  { code: 'AU', name: 'Australia' },
  { code: 'JP', name: 'Japan' },
]

const METHOD_OPTIONS: { value: ShippingMethod; label: string }[] = [
  { value: 'standard', label: 'Standard Shipping' },
  { value: 'express', label: 'Express Delivery' },
  { value: 'overnight', label: 'Overnight/Next Day' },
  { value: 'pickup', label: 'Local Pickup' },
]

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function parseJsonArray(raw: string | string[]): string[] {
  if (Array.isArray(raw)) return raw
  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function countryName(code: string): string {
  return COUNTRIES.find((c) => c.code === code)?.name ?? code
}

// ---------------------------------------------------------------------------
// Zone Dialog (Create / Edit)
// ---------------------------------------------------------------------------

function ZoneDialog({
  shopId,
  editItem,
  open,
  onOpenChange,
  onSaved,
}: {
  shopId: string
  editItem: ShippingZone | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSaved: () => void
}) {
  const [name, setName] = useState('')
  const [selectedCountries, setSelectedCountries] = useState<string[]>(['PK'])
  const [saving, setSaving] = useState(false)

  const isEditing = !!editItem

  useEffect(() => {
    if (open) {
      if (editItem) {
        setName(editItem.name)
        setSelectedCountries(parseJsonArray(editItem.countries))
      } else {
        setName('')
        setSelectedCountries(['PK'])
      }
    }
  }, [open, editItem])

  const toggleCountry = (code: string) => {
    setSelectedCountries((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    )
  }

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error('Please enter a zone name')
      return
    }
    if (selectedCountries.length === 0) {
      toast.error('Please select at least one country')
      return
    }

    setSaving(true)
    try {
      const url = isEditing ? `/api/shipping/zones/${editItem.id}` : '/api/shipping/zones'
      const method = isEditing ? 'PUT' : 'POST'
      const body: Record<string, unknown> = {
        shopId,
        name: name.trim(),
        countries: selectedCountries,
        isActive: true,
      }

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const json = await res.json()
      if (json.success) {
        toast.success(isEditing ? 'Zone updated!' : 'Zone created!')
        onSaved()
        onOpenChange(false)
      } else {
        toast.error(json.error || 'Failed to save zone')
      }
    } catch {
      toast.error('Network error. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isEditing ? (
              <Pencil className="h-5 w-5 text-emerald-600" />
            ) : (
              <Plus className="h-5 w-5 text-emerald-600" />
            )}
            {isEditing ? 'Edit Zone' : 'Create Shipping Zone'}
          </DialogTitle>
          <CardDescription>
            {isEditing
              ? 'Update zone details and countries'
              : 'Define a new shipping zone with target countries'}
          </CardDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="zone-name">Zone Name *</Label>
            <Input
              id="zone-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Pakistan Domestic, International"
            />
          </div>

          <div className="space-y-2">
            <Label>Countries *</Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto p-2 border rounded-lg">
              {COUNTRIES.map((c) => (
                <div key={c.code} className="flex items-center gap-2">
                  <Checkbox
                    id={`country-${c.code}`}
                    checked={selectedCountries.includes(c.code)}
                    onCheckedChange={() => toggleCountry(c.code)}
                    className="data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
                  />
                  <Label htmlFor={`country-${c.code}`} className="text-xs cursor-pointer">
                    {c.name} ({c.code})
                  </Label>
                </div>
              ))}
            </div>
            <p className="text-[11px] text-muted-foreground">
              {selectedCountries.length} country(ies) selected
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            className="bg-emerald-600 hover:bg-emerald-700"
            onClick={handleSave}
            disabled={saving}
          >
            {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            {isEditing ? 'Update Zone' : 'Create Zone'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ---------------------------------------------------------------------------
// Rate Dialog (Create / Edit)
// ---------------------------------------------------------------------------

function RateDialog({
  zoneId,
  editItem,
  open,
  onOpenChange,
  onSaved,
}: {
  zoneId: string
  editItem: ShippingRate | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSaved: () => void
}) {
  const [name, setName] = useState('')
  const [method, setMethod] = useState<ShippingMethod>('standard')
  const [minDays, setMinDays] = useState(3)
  const [maxDays, setMaxDays] = useState(7)
  const [price, setPrice] = useState(0)
  const [freeAbove, setFreeAbove] = useState('')
  const [weightLimit, setWeightLimit] = useState('')
  const [saving, setSaving] = useState(false)

  const isEditing = !!editItem

  useEffect(() => {
    if (open) {
      if (editItem) {
        setName(editItem.name)
        setMethod(editItem.method)
        setMinDays(editItem.minDays)
        setMaxDays(editItem.maxDays)
        setPrice(editItem.price)
        setFreeAbove(editItem.freeAbove?.toString() ?? '')
        setWeightLimit(editItem.weightLimit?.toString() ?? '')
      } else {
        setName('')
        setMethod('standard')
        setMinDays(3)
        setMaxDays(7)
        setPrice(0)
        setFreeAbove('')
        setWeightLimit('')
      }
    }
  }, [open, editItem])

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error('Please enter a rate name')
      return
    }
    if (price < 0) {
      toast.error('Price cannot be negative')
      return
    }
    if (minDays > maxDays) {
      toast.error('Min days cannot exceed max days')
      return
    }

    setSaving(true)
    try {
      const url = isEditing ? `/api/shipping/rates/${editItem.id}` : '/api/shipping/rates'
      const httpMethod = isEditing ? 'PUT' : 'POST'
      const body = {
        zoneId,
        name: name.trim(),
        method,
        minDays,
        maxDays,
        price,
        freeAbove: freeAbove ? parseFloat(freeAbove) : null,
        weightLimit: weightLimit ? parseFloat(weightLimit) : null,
        isActive: true,
      }

      const res = await fetch(url, {
        method: httpMethod,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const json = await res.json()
      if (json.success) {
        toast.success(isEditing ? 'Rate updated!' : 'Rate added!')
        onSaved()
        onOpenChange(false)
      } else {
        toast.error(json.error || 'Failed to save rate')
      }
    } catch {
      toast.error('Network error. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isEditing ? (
              <Pencil className="h-5 w-5 text-emerald-600" />
            ) : (
              <Plus className="h-5 w-5 text-emerald-600" />
            )}
            {isEditing ? 'Edit Rate' : 'Add Shipping Rate'}
          </DialogTitle>
          <CardDescription>
            {isEditing
              ? 'Update rate details, pricing, and delivery time'
              : 'Define pricing and delivery time for this zone'}
          </CardDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Rate Name *</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Standard Shipping"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Shipping Method *</Label>
              <Select value={method} onValueChange={(v) => setMethod(v as ShippingMethod)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {METHOD_OPTIONS.map((m) => (
                    <SelectItem key={m.value} value={m.value}>
                      {m.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" /> Min Days
              </Label>
              <Input
                type="number"
                min={1}
                value={minDays}
                onChange={(e) => setMinDays(parseInt(e.target.value) || 1)}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" /> Max Days
              </Label>
              <Input
                type="number"
                min={1}
                value={maxDays}
                onChange={(e) => setMaxDays(parseInt(e.target.value) || 1)}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1">
                <DollarSign className="h-3.5 w-3.5" /> Price
              </Label>
              <Input
                type="number"
                min={0}
                step={0.01}
                value={price}
                onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1">
                <DollarSign className="h-3.5 w-3.5" /> Free Above
              </Label>
              <Input
                type="number"
                min={0}
                step={0.01}
                value={freeAbove}
                onChange={(e) => setFreeAbove(e.target.value)}
                placeholder="Optional"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="flex items-center gap-1">
              <Package className="h-3.5 w-3.5" /> Weight Limit (kg)
            </Label>
            <Input
              type="number"
              min={0}
              step={0.1}
              value={weightLimit}
              onChange={(e) => setWeightLimit(e.target.value)}
              placeholder="Leave empty for unlimited"
            />
            <p className="text-[11px] text-muted-foreground">
              Maximum package weight. Leave empty for no limit.
            </p>
          </div>

          {freeAbove && parseFloat(freeAbove) > 0 && (
            <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3 flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
              <p className="text-xs text-emerald-700">
                Free shipping will apply when order total exceeds{' '}
                <span className="font-semibold">{parseFloat(freeAbove).toLocaleString()}</span>
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            className="bg-emerald-600 hover:bg-emerald-700"
            onClick={handleSave}
            disabled={saving}
          >
            {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            {isEditing ? 'Update Rate' : 'Add Rate'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ---------------------------------------------------------------------------
// Delete Confirmation Dialog
// ---------------------------------------------------------------------------

function DeleteConfirmDialog({
  title,
  description,
  onConfirm,
  children,
}: {
  title: string
  description: string
  onConfirm: () => void
  children: React.ReactNode
}) {
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertCircle className="h-5 w-5" />
            {title}
          </DialogTitle>
          <CardDescription>{description}</CardDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={(e) => e.stopPropagation()}>
            Cancel
          </Button>
          <Button
            className="bg-red-600 hover:bg-red-700"
            onClick={(e) => {
              e.stopPropagation()
              onConfirm()
            }}
          >
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ---------------------------------------------------------------------------
// Main ShippingSettings Component
// ---------------------------------------------------------------------------

export function ShippingSettings({ shopId: propShopId, userId }: ShippingSettingsProps) {
  const { currentUser } = useMarketplaceStore()
  const [resolvedShopId, setResolvedShopId] = useState<string | null>(propShopId || currentUser?.shop?.id || null)
  const [resolvingShop, setResolvingShop] = useState(!resolvedShopId)
  const [zones, setZones] = useState<(ShippingZone & { rates?: ShippingRate[] })[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('zones')

  // Zone dialog
  const [zoneDialogOpen, setZoneDialogOpen] = useState(false)
  const [editingZone, setEditingZone] = useState<ShippingZone | null>(null)

  // Rate dialog
  const [rateDialogOpen, setRateDialogOpen] = useState(false)
  const [editingRate, setEditingRate] = useState<ShippingRate | null>(null)
  const [selectedZoneId, setSelectedZoneId] = useState<string>('')

  // Deleting states
  const [deletingZoneId, setDeletingZoneId] = useState<string | null>(null)
  const [deletingRateId, setDeletingRateId] = useState<string | null>(null)

  // Toggling states
  const [togglingId, setTogglingId] = useState<string | null>(null)

  // -----------------------------------------------------------------------
  // Resolve shopId if not provided
  // -----------------------------------------------------------------------

  useEffect(() => {
    if (resolvedShopId) return

    const uid = userId || currentUser?.id
    if (!uid) {
      setResolvingShop(false)
      setError('No user found. Please log in again.')
      setLoading(false)
      return
    }

    let cancelled = false
    async function resolveShopId() {
      try {
        const res = await fetch(`/api/auth/me?userId=${uid}`)
        const json = await res.json()
        if (cancelled) return

        if (json.success && json.data?.shop?.id) {
          setResolvedShopId(json.data.shop.id)
          // Also update the store with fresh user data
          useMarketplaceStore.getState().login(json.data)
        } else {
          setError('No shop found. Please create a shop first.')
          setLoading(false)
        }
      } catch {
        setError('Failed to load shop data. Please refresh.')
        setLoading(false)
      } finally {
        if (!cancelled) setResolvingShop(false)
      }
    }
    resolveShopId()
    return () => { cancelled = true }
  }, [resolvedShopId, userId, currentUser?.id])

  // -----------------------------------------------------------------------
  // Fetch zones
  // -----------------------------------------------------------------------

  const shopId = resolvedShopId

  const fetchZones = useCallback(async () => {
    if (!shopId) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/shipping/zones?shopId=${shopId}`)
      const json = await res.json()
      if (json.success) {
        const rawZones = json.data?.zones ?? json.data ?? []
        // Ensure countries is always an array
        const parsed = (Array.isArray(rawZones) ? rawZones : []).map((z: Record<string, unknown>) => ({
          ...z,
          countries: Array.isArray(z.countries) ? z.countries : parseJsonArray(z.countries as string),
          rates: (Array.isArray(z.rates) ? z.rates : []).map((r: Record<string, unknown>) => ({
            ...r,
            method: r.method || 'standard',
          })),
        }))
        setZones(parsed)
      } else {
        setError(json.error || 'Failed to load shipping zones')
      }
    } catch {
      setError('Failed to fetch shipping zones. Please check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }, [shopId])

  useEffect(() => {
    if (shopId) fetchZones()
  }, [shopId, fetchZones])

  // -----------------------------------------------------------------------
  // Zone actions
  // -----------------------------------------------------------------------

  const handleToggleZoneActive = async (id: string, isActive: boolean) => {
    setTogglingId(id)
    try {
      const res = await fetch(`/api/shipping/zones/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shopId, isActive }),
      })
      const json = await res.json()
      if (json.success) {
        toast.success(isActive ? 'Zone activated' : 'Zone deactivated')
        fetchZones()
      } else {
        toast.error(json.error || 'Failed to update zone')
      }
    } catch {
      toast.error('Network error')
    } finally {
      setTogglingId(null)
    }
  }

  const handleDeleteZone = async (id: string) => {
    setDeletingZoneId(id)
    try {
      const res = await fetch(`/api/shipping/zones/${id}?shopId=${shopId}`, { method: 'DELETE' })
      const json = await res.json()
      if (json.success) {
        toast.success('Zone deleted')
        fetchZones()
      } else {
        toast.error(json.error || 'Failed to delete zone')
      }
    } catch {
      toast.error('Network error')
    } finally {
      setDeletingZoneId(null)
    }
  }

  // -----------------------------------------------------------------------
  // Rate actions
  // -----------------------------------------------------------------------

  const handleToggleRateActive = async (id: string, isActive: boolean) => {
    setTogglingId(id)
    try {
      const res = await fetch(`/api/shipping/rates/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive }),
      })
      const json = await res.json()
      if (json.success) {
        toast.success(isActive ? 'Rate activated' : 'Rate deactivated')
        fetchZones()
      } else {
        toast.error(json.error || 'Failed to update rate')
      }
    } catch {
      toast.error('Network error')
    } finally {
      setTogglingId(null)
    }
  }

  const handleDeleteRate = async (id: string) => {
    setDeletingRateId(id)
    try {
      const res = await fetch(`/api/shipping/rates/${id}`, { method: 'DELETE' })
      const json = await res.json()
      if (json.success) {
        toast.success('Rate deleted')
        fetchZones()
      } else {
        toast.error(json.error || 'Failed to delete rate')
      }
    } catch {
      toast.error('Network error')
    } finally {
      setDeletingRateId(null)
    }
  }

  const openAddRate = (zoneId: string) => {
    setSelectedZoneId(zoneId)
    setEditingRate(null)
    setRateDialogOpen(true)
  }

  const openEditRate = (rate: ShippingRate) => {
    setSelectedZoneId(rate.zoneId)
    setEditingRate(rate)
    setRateDialogOpen(true)
  }

  // -----------------------------------------------------------------------
  // Derived data
  // -----------------------------------------------------------------------

  const totalRates = zones.reduce((acc, z) => acc + (z.rates?.length ?? 0), 0)
  const activeZones = zones.filter((z) => z.isActive).length
  const selectedZone = zones.find((z) => z.id === selectedZoneId)
  const selectedZoneRates = selectedZone?.rates ?? []

  // -----------------------------------------------------------------------
  // Loading
  // -----------------------------------------------------------------------

  if ((loading || resolvingShop) && zones.length === 0 && !error) {
    return (
      <div className="space-y-6 p-4 sm:p-6">
        <div className="flex items-center justify-between">
          <div className="h-8 w-56 animate-pulse rounded bg-muted" />
          <div className="h-9 w-36 animate-pulse rounded bg-muted" />
        </div>
        <div className="grid grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-16 rounded bg-muted" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card className="animate-pulse">
          <CardContent className="p-6">
            <div className="h-48 rounded bg-muted" />
          </CardContent>
        </Card>
      </div>
    )
  }

  // -----------------------------------------------------------------------
  // Render
  // -----------------------------------------------------------------------

  return (
    <div className="space-y-6 p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
            <Truck className="h-6 w-6 text-emerald-600" />
            Shipping Settings
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Configure shipping zones and rates for your shop
          </p>
        </div>
        <Button
          size="sm"
          className="bg-emerald-600 hover:bg-emerald-700 w-fit"
          onClick={() => {
            setEditingZone(null)
            setZoneDialogOpen(true)
          }}
        >
          <Plus className="h-4 w-4 mr-1.5" />
          Add Zone
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        <Card className="border-0 shadow-sm bg-gradient-to-br from-emerald-50 to-teal-50">
          <CardContent className="p-4 sm:p-6 text-center">
            <Globe className="h-5 w-5 text-emerald-600 mx-auto mb-1.5" />
            <p className="text-2xl font-bold text-emerald-700">{zones.length}</p>
            <p className="text-xs text-emerald-600 font-medium">Total Zones</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-indigo-50">
          <CardContent className="p-4 sm:p-6 text-center">
            <Package className="h-5 w-5 text-blue-600 mx-auto mb-1.5" />
            <p className="text-2xl font-bold text-blue-700">{totalRates}</p>
            <p className="text-xs text-blue-600 font-medium">Total Rates</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm bg-gradient-to-br from-amber-50 to-orange-50">
          <CardContent className="p-4 sm:p-6 text-center">
            <MapPin className="h-5 w-5 text-amber-600 mx-auto mb-1.5" />
            <p className="text-2xl font-bold text-amber-700">{activeZones}</p>
            <p className="text-xs text-amber-600 font-medium">Active Zones</p>
          </CardContent>
        </Card>
      </div>

      {/* Error state */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-8 w-8 text-red-400 mx-auto mb-2" />
            <p className="text-sm text-red-700">{error}</p>
            <Button variant="outline" size="sm" className="mt-3" onClick={fetchZones}>
              Retry
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="zones" className="flex items-center gap-1.5">
            <Globe className="h-4 w-4" />
            Shipping Zones
          </TabsTrigger>
          <TabsTrigger value="rates" className="flex items-center gap-1.5">
            <Package className="h-4 w-4" />
            Shipping Rates
          </TabsTrigger>
        </TabsList>

        {/* ----------------------------------------------------------------- */}
        {/* ZONES TAB */}
        {/* ----------------------------------------------------------------- */}
        <TabsContent value="zones" className="mt-4 space-y-4">
          {zones.length === 0 && !error ? (
            <Card className="border-0 shadow-sm">
              <CardContent className="py-16 text-center">
                <div className="flex justify-center mb-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50">
                    <Globe className="h-8 w-8 text-emerald-400" />
                  </div>
                </div>
                <h3 className="text-lg font-semibold mb-1">No shipping zones</h3>
                <p className="text-sm text-muted-foreground max-w-sm mx-auto mb-4">
                  Create your first shipping zone to start offering delivery options to buyers.
                </p>
                <Button
                  size="sm"
                  className="bg-emerald-600 hover:bg-emerald-700"
                  onClick={() => {
                    setEditingZone(null)
                    setZoneDialogOpen(true)
                  }}
                >
                  <Plus className="h-4 w-4 mr-1.5" />
                  Create Your First Zone
                </Button>
              </CardContent>
            </Card>
          ) : (
            zones.map((zone) => {
              const countries = parseJsonArray(zone.countries)
              const rates = zone.rates ?? []
              return (
                <Card
                  key={zone.id}
                  className={`border-0 shadow-sm transition-shadow hover:shadow-md ${
                    !zone.isActive ? 'opacity-60' : ''
                  }`}
                >
                  <CardContent className="p-4 sm:p-6">
                    {/* Zone header */}
                    <div className="flex items-start gap-3">
                      <div
                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                          zone.isActive ? 'bg-emerald-50' : 'bg-muted'
                        }`}
                      >
                        <Globe
                          className={`h-5 w-5 ${
                            zone.isActive ? 'text-emerald-600' : 'text-muted-foreground'
                          }`}
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold truncate">{zone.name}</span>
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0 shrink-0">
                            {countries.length} {countries.length === 1 ? 'country' : 'countries'}
                          </Badge>
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0 shrink-0">
                            {rates.length} {rates.length === 1 ? 'rate' : 'rates'}
                          </Badge>
                          {!zone.isActive && (
                            <Badge className="bg-muted text-muted-foreground text-[10px] px-1.5 py-0">
                              Inactive
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-1 flex-wrap mt-1.5">
                          {countries.slice(0, 5).map((code) => (
                            <Badge
                              key={code}
                              variant="secondary"
                              className="text-[10px] px-1.5 py-0"
                            >
                              {countryName(code)}
                            </Badge>
                          ))}
                          {countries.length > 5 && (
                            <span className="text-[10px] text-muted-foreground">
                              +{countries.length - 5} more
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Zone actions */}
                      <div className="flex items-center gap-1 shrink-0">
                        <div className="flex items-center gap-2">
                          <Label
                            htmlFor={`zone-active-${zone.id}`}
                            className="text-[11px] text-muted-foreground hidden sm:block"
                          >
                            {zone.isActive ? 'Active' : 'Inactive'}
                          </Label>
                          <Switch
                            id={`zone-active-${zone.id}`}
                            checked={zone.isActive}
                            onCheckedChange={(checked) =>
                              handleToggleZoneActive(zone.id, checked)
                            }
                            disabled={togglingId === zone.id}
                          />
                        </div>

                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-emerald-600 hover:bg-emerald-50"
                          onClick={() => {
                            setEditingZone(zone)
                            setZoneDialogOpen(true)
                          }}
                          title="Edit zone"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>

                        <DeleteConfirmDialog
                          title="Delete Shipping Zone"
                          description={`Delete "${zone.name}" and all its shipping rates? This action cannot be undone.`}
                          onConfirm={() => handleDeleteZone(zone.id)}
                        >
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-red-600 hover:bg-red-50"
                            disabled={deletingZoneId === zone.id}
                            title="Delete zone"
                          >
                            {deletingZoneId === zone.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </Button>
                        </DeleteConfirmDialog>
                      </div>
                    </div>

                    {/* Rates preview in zone card */}
                    {rates.length > 0 && (
                      <>
                        <Separator className="my-3" />
                        <div className="space-y-2">
                          {rates.map((rate) => {
                            const methodLabel =
                              METHOD_OPTIONS.find((m) => m.value === rate.method)?.label ??
                              rate.method
                            return (
                              <div
                                key={rate.id}
                                className={`flex items-center gap-3 rounded-lg border p-3 transition-colors ${
                                  rate.isActive
                                    ? 'bg-card border-border'
                                    : 'bg-muted/30 border-muted opacity-60'
                                }`}
                              >
                                <div
                                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                                    rate.isActive ? 'bg-emerald-50' : 'bg-muted'
                                  }`}
                                >
                                  {rate.method === 'pickup' ? (
                                    <Package
                                      className={`h-4 w-4 ${
                                        rate.isActive
                                          ? 'text-emerald-600'
                                          : 'text-muted-foreground'
                                      }`}
                                    />
                                  ) : (
                                    <Truck
                                      className={`h-4 w-4 ${
                                        rate.isActive
                                          ? 'text-emerald-600'
                                          : 'text-muted-foreground'
                                      }`}
                                    />
                                  )}
                                </div>

                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="text-sm font-medium truncate">
                                      {rate.name}
                                    </span>
                                    <Badge
                                      variant="outline"
                                      className="text-[10px] px-1.5 py-0 capitalize shrink-0"
                                    >
                                      {methodLabel}
                                    </Badge>
                                    {!rate.isActive && (
                                      <Badge className="bg-muted text-muted-foreground text-[10px] px-1.5 py-0">
                                        Inactive
                                      </Badge>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-3 mt-0.5 text-xs text-muted-foreground flex-wrap">
                                    <span className="flex items-center gap-0.5">
                                      <Clock className="h-3 w-3" />
                                      {rate.minDays}-{rate.maxDays} days
                                    </span>
                                    <span className="flex items-center gap-0.5">
                                      <DollarSign className="h-3 w-3" />
                                      {rate.price.toLocaleString()}
                                    </span>
                                    {rate.freeAbove && (
                                      <span className="text-emerald-600 font-medium">
                                        Free above {rate.freeAbove.toLocaleString()}
                                      </span>
                                    )}
                                    {rate.weightLimit && <span>Up to {rate.weightLimit}kg</span>}
                                  </div>
                                </div>

                                <div className="flex items-center gap-1 shrink-0">
                                  <Switch
                                    checked={rate.isActive}
                                    onCheckedChange={(checked) =>
                                      handleToggleRateActive(rate.id, checked)
                                    }
                                    disabled={togglingId === rate.id}
                                  />
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 text-muted-foreground hover:text-emerald-600 hover:bg-emerald-50"
                                    onClick={() => openEditRate(rate)}
                                  >
                                    <Pencil className="h-3.5 w-3.5" />
                                  </Button>
                                  <DeleteConfirmDialog
                                    title="Delete Rate"
                                    description={`Delete "${rate.name}"? This action cannot be undone.`}
                                    onConfirm={() => handleDeleteRate(rate.id)}
                                  >
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-7 w-7 text-muted-foreground hover:text-red-600 hover:bg-red-50"
                                      disabled={deletingRateId === rate.id}
                                    >
                                      {deletingRateId === rate.id ? (
                                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                      ) : (
                                        <Trash2 className="h-3.5 w-3.5" />
                                      )}
                                    </Button>
                                  </DeleteConfirmDialog>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </>
                    )}

                    {rates.length === 0 && (
                      <>
                        <Separator className="my-3" />
                        <div className="text-center py-4">
                          <Truck className="h-5 w-5 text-muted-foreground mx-auto mb-1.5" />
                          <p className="text-xs text-muted-foreground mb-2">No rates added yet</p>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 px-2.5 text-xs"
                            onClick={() => openAddRate(zone.id)}
                          >
                            <Plus className="h-3 w-3 mr-1" />
                            Add Rate
                          </Button>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              )
            })
          )}
        </TabsContent>

        {/* ----------------------------------------------------------------- */}
        {/* RATES TAB */}
        {/* ----------------------------------------------------------------- */}
        <TabsContent value="rates" className="mt-4 space-y-4">
          {/* Zone selector */}
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <div className="flex-1 w-full sm:w-auto">
                  <Label className="mb-1.5 block">Select Zone</Label>
                  <Select
                    value={selectedZoneId}
                    onValueChange={setSelectedZoneId}
                  >
                    <SelectTrigger className="w-full sm:w-64">
                      <SelectValue placeholder="Choose a shipping zone..." />
                    </SelectTrigger>
                    <SelectContent>
                      {zones.map((z) => (
                        <SelectItem key={z.id} value={z.id}>
                          {z.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedZoneId && (
                  <Button
                    size="sm"
                    className="bg-emerald-600 hover:bg-emerald-700 mt-auto"
                    onClick={() => openAddRate(selectedZoneId)}
                  >
                    <Plus className="h-4 w-4 mr-1.5" />
                    Add Rate
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* No zone selected */}
          {!selectedZoneId && (
            <Card className="border-0 shadow-sm">
              <CardContent className="py-16 text-center">
                <MapPin className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
                <h3 className="text-lg font-semibold mb-1">Select a zone</h3>
                <p className="text-sm text-muted-foreground">
                  Choose a shipping zone above to view and manage its rates
                </p>
              </CardContent>
            </Card>
          )}

          {/* Zone selected — no rates */}
          {selectedZoneId && selectedZoneRates.length === 0 && (
            <Card className="border-0 shadow-sm">
              <CardContent className="py-16 text-center">
                <Package className="h-10 w-10 text-emerald-400 mx-auto mb-3" />
                <h3 className="text-lg font-semibold mb-1">No rates for this zone</h3>
                <p className="text-sm text-muted-foreground max-w-sm mx-auto mb-4">
                  Add shipping rates to &quot;{selectedZone?.name}&quot; so buyers can see delivery
                  options.
                </p>
                <Button
                  size="sm"
                  className="bg-emerald-600 hover:bg-emerald-700"
                  onClick={() => openAddRate(selectedZoneId)}
                >
                  <Plus className="h-4 w-4 mr-1.5" />
                  Add First Rate
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Rate list */}
          {selectedZoneId && selectedZoneRates.length > 0 && (
            <div className="space-y-3">
              {selectedZoneRates.map((rate) => {
                const methodLabel =
                  METHOD_OPTIONS.find((m) => m.value === rate.method)?.label ?? rate.method
                return (
                  <Card
                    key={rate.id}
                    className={`border-0 shadow-sm transition-shadow hover:shadow-md ${
                      !rate.isActive ? 'opacity-60' : ''
                    }`}
                  >
                    <CardContent className="p-4 sm:p-6">
                      <div className="flex items-start gap-4">
                        {/* Icon */}
                        <div
                          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${
                            rate.isActive ? 'bg-emerald-50' : 'bg-muted'
                          }`}
                        >
                          {rate.method === 'standard' && (
                            <Truck
                              className={`h-6 w-6 ${
                                rate.isActive ? 'text-emerald-600' : 'text-muted-foreground'
                              }`}
                            />
                          )}
                          {rate.method === 'express' && (
                            <Truck
                              className={`h-6 w-6 ${
                                rate.isActive ? 'text-amber-600' : 'text-muted-foreground'
                              }`}
                            />
                          )}
                          {rate.method === 'overnight' && (
                            <Clock
                              className={`h-6 w-6 ${
                                rate.isActive ? 'text-amber-600' : 'text-muted-foreground'
                              }`}
                            />
                          )}
                          {rate.method === 'pickup' && (
                            <Package
                              className={`h-6 w-6 ${
                                rate.isActive ? 'text-teal-600' : 'text-muted-foreground'
                              }`}
                            />
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold">{rate.name}</span>
                            <Badge
                              variant="outline"
                              className="text-[10px] px-1.5 py-0 capitalize"
                            >
                              {methodLabel}
                            </Badge>
                            {!rate.isActive && (
                              <Badge className="bg-muted text-muted-foreground text-[10px] px-1.5 py-0">
                                Inactive
                              </Badge>
                            )}
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-1 mt-2">
                            <div className="flex items-center gap-1.5 text-sm">
                              <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                              <span>
                                {rate.minDays}-{rate.maxDays} days
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 text-sm">
                              <DollarSign className="h-3.5 w-3.5 text-muted-foreground" />
                              <span className="font-medium">{rate.price.toLocaleString()}</span>
                            </div>
                            {rate.freeAbove ? (
                              <div className="flex items-center gap-1.5 text-sm text-emerald-600 font-medium">
                                <DollarSign className="h-3.5 w-3.5" />
                                Free above {rate.freeAbove.toLocaleString()}
                              </div>
                            ) : (
                              <div />
                            )}
                            {rate.weightLimit ? (
                              <div className="flex items-center gap-1.5 text-sm">
                                <Package className="h-3.5 w-3.5 text-muted-foreground" />
                                Up to {rate.weightLimit}kg
                              </div>
                            ) : (
                              <div />
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 shrink-0">
                          <div className="flex items-center gap-2">
                            <Label
                              htmlFor={`rate-active-${rate.id}`}
                              className="text-[11px] text-muted-foreground hidden sm:block"
                            >
                              {rate.isActive ? 'Active' : 'Inactive'}
                            </Label>
                            <Switch
                              id={`rate-active-${rate.id}`}
                              checked={rate.isActive}
                              onCheckedChange={(checked) =>
                                handleToggleRateActive(rate.id, checked)
                              }
                              disabled={togglingId === rate.id}
                            />
                          </div>

                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-emerald-600 hover:bg-emerald-50"
                            onClick={() => openEditRate(rate)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>

                          <DeleteConfirmDialog
                            title="Delete Rate"
                            description={`Delete "${rate.name}"? This action cannot be undone.`}
                            onConfirm={() => handleDeleteRate(rate.id)}
                          >
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-red-600 hover:bg-red-50"
                              disabled={deletingRateId === rate.id}
                            >
                              {deletingRateId === rate.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                            </Button>
                          </DeleteConfirmDialog>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Zone Dialog */}
      <ZoneDialog
        shopId={shopId}
        editItem={editingZone}
        open={zoneDialogOpen}
        onOpenChange={setZoneDialogOpen}
        onSaved={fetchZones}
      />

      {/* Rate Dialog */}
      <RateDialog
        zoneId={selectedZoneId}
        editItem={editingRate}
        open={rateDialogOpen}
        onOpenChange={setRateDialogOpen}
        onSaved={fetchZones}
      />
    </div>
  )
}
