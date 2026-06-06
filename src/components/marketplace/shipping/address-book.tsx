'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MapPin,
  Plus,
  Edit2,
  Trash2,
  Star,
  StarOff,
  CheckCircle2,
  Loader2,
  Phone,
  User,
  Globe,
  Home,
  Building2,
  Warehouse,
  ArrowRight,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { toast } from 'sonner'
import type { DeliveryAddress } from '@/types'

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface AddressBookProps {
  userId: string
  onSelectAddress?: (address: DeliveryAddress) => void
}

// ---------------------------------------------------------------------------
// Country list — Pakistan first, then common countries
// ---------------------------------------------------------------------------

const COUNTRIES = [
  { code: 'PK', name: 'Pakistan' },
  { code: 'AE', name: 'United Arab Emirates' },
  { code: 'SA', name: 'Saudi Arabia' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'US', name: 'United States' },
  { code: 'CA', name: 'Canada' },
  { code: 'AU', name: 'Australia' },
  { code: 'DE', name: 'Germany' },
  { code: 'FR', name: 'France' },
  { code: 'IN', name: 'India' },
  { code: 'CN', name: 'China' },
  { code: 'TR', name: 'Turkey' },
  { code: 'MY', name: 'Malaysia' },
  { code: 'QA', name: 'Qatar' },
  { code: 'KW', name: 'Kuwait' },
  { code: 'BH', name: 'Bahrain' },
  { code: 'OM', name: 'Oman' },
  { code: 'NL', name: 'Netherlands' },
  { code: 'IT', name: 'Italy' },
  { code: 'ES', name: 'Spain' },
]

const PK_STATES = [
  'Punjab', 'Sindh', 'Khyber Pakhtunkhwa', 'Balochistan',
  'Islamabad Capital Territory', 'Gilgit-Baltistan', 'Azad Jammu and Kashmir',
]

// ---------------------------------------------------------------------------
// Label icon mapping
// ---------------------------------------------------------------------------

function getLabelIcon(label: string) {
  const lower = label.toLowerCase()
  if (lower.includes('office') || lower.includes('work')) return Building2
  if (lower.includes('warehouse') || lower.includes('godown')) return Warehouse
  return Home
}

// ---------------------------------------------------------------------------
// Animation variants
// ---------------------------------------------------------------------------

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
}

// ---------------------------------------------------------------------------
// Address Form Component
// ---------------------------------------------------------------------------

function AddressForm({
  userId,
  editItem,
  onSaved,
  onCancel,
}: {
  userId: string
  editItem: DeliveryAddress | null
  onSaved: () => void
  onCancel: () => void
}) {
  const [label, setLabel] = useState(editItem?.label || '')
  const [fullName, setFullName] = useState(editItem?.fullName || '')
  const [phone, setPhone] = useState(editItem?.phone || '')
  const [address, setAddress] = useState(editItem?.address || '')
  const [city, setCity] = useState(editItem?.city || '')
  const [state, setState] = useState(editItem?.state || '')
  const [zipCode, setZipCode] = useState(editItem?.zipCode || '')
  const [country, setCountry] = useState(editItem?.country || 'PK')
  const [isDefault, setIsDefault] = useState(editItem?.isDefault || false)
  const [saving, setSaving] = useState(false)

  const isEditing = !!editItem

  const validate = (): string | null => {
    if (!label.trim()) return 'Please provide a label (e.g., Home, Office)'
    if (!fullName.trim()) return 'Please enter the full name'
    if (!phone.trim()) return 'Please enter a phone number'
    if (!address.trim()) return 'Please enter the street address'
    if (!city.trim()) return 'Please enter the city'
    if (country === 'PK' && !state.trim()) return 'Please select a province'
    return null
  }

  const handleSave = async () => {
    const validationError = validate()
    if (validationError) {
      toast.error(validationError)
      return
    }

    setSaving(true)
    try {
      const url = isEditing ? `/api/shipping/addresses/${editItem.id}` : '/api/shipping/addresses'
      const method = isEditing ? 'PUT' : 'POST'
      const body = {
        userId,
        label: label.trim(),
        fullName: fullName.trim(),
        phone: phone.trim(),
        address: address.trim(),
        city: city.trim(),
        state: state.trim() || null,
        zipCode: zipCode.trim() || null,
        country,
        isDefault,
      }

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      const json = await res.json()
      if (json.success) {
        toast.success(isEditing ? 'Address updated!' : 'Address saved!')
        onSaved()
      } else {
        toast.error(json.error || 'Failed to save address')
      }
    } catch {
      toast.error('Network error. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Label */}
      <div className="space-y-1.5">
        <Label htmlFor="addr-label">Label *</Label>
        <div className="flex gap-2">
          <Input
            id="addr-label"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="e.g., Home, Office, Warehouse"
            className="flex-1"
          />
          <div className="flex gap-1">
            {['Home', 'Office', 'Warehouse'].map((preset) => {
              const Icon = getLabelIcon(preset)
              return (
                <Button
                  key={preset}
                  type="button"
                  variant={label === preset ? 'default' : 'outline'}
                  size="sm"
                  className={`h-9 px-2.5 ${label === preset ? 'bg-amber-600 hover:bg-amber-700' : ''}`}
                  onClick={() => setLabel(preset)}
                >
                  <Icon className="h-3.5 w-3.5 mr-1" />
                  <span className="text-xs">{preset}</span>
                </Button>
              )
            })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Full Name */}
        <div className="space-y-1.5">
          <Label htmlFor="addr-name">Full Name *</Label>
          <Input
            id="addr-name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Recipient name"
          />
        </div>

        {/* Phone */}
        <div className="space-y-1.5">
          <Label htmlFor="addr-phone">Phone Number *</Label>
          <Input
            id="addr-phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+92 300 1234567"
            inputMode="tel"
          />
        </div>
      </div>

      {/* Address */}
      <div className="space-y-1.5">
        <Label htmlFor="addr-street">Street Address *</Label>
        <Input
          id="addr-street"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="House #, Street, Area, Colony"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* City */}
        <div className="space-y-1.5">
          <Label htmlFor="addr-city">City *</Label>
          <Input
            id="addr-city"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="e.g., Lahore, Karachi"
          />
        </div>

        {/* State / Province */}
        <div className="space-y-1.5">
          <Label htmlFor="addr-state">State / Province</Label>
          {country === 'PK' ? (
            <Select value={state} onValueChange={setState}>
              <SelectTrigger id="addr-state">
                <SelectValue placeholder="Select province" />
              </SelectTrigger>
              <SelectContent>
                {PK_STATES.map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <Input
              id="addr-state"
              value={state}
              onChange={(e) => setState(e.target.value)}
              placeholder="State / Province"
            />
          )}
        </div>

        {/* Zip Code */}
        <div className="space-y-1.5">
          <Label htmlFor="addr-zip">Zip / Postal Code</Label>
          <Input
            id="addr-zip"
            value={zipCode}
            onChange={(e) => setZipCode(e.target.value)}
            placeholder="54000"
            inputMode="numeric"
          />
        </div>
      </div>

      {/* Country */}
      <div className="space-y-1.5">
        <Label htmlFor="addr-country">Country *</Label>
        <Select value={country} onValueChange={setCountry}>
          <SelectTrigger id="addr-country">
            <Globe className="h-4 w-4 mr-2 text-muted-foreground" />
            <SelectValue placeholder="Select country" />
          </SelectTrigger>
          <SelectContent>
            {COUNTRIES.map((c) => (
              <SelectItem key={c.code} value={c.code}>
                {c.name} ({c.code})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Separator />

      {/* Set as default */}
      <div className="flex items-center gap-2.5">
        <Checkbox
          id="addr-default"
          checked={isDefault}
          onCheckedChange={(checked) => setIsDefault(checked === true)}
          className="data-[state=checked]:bg-amber-600 data-[state=checked]:border-amber-600"
        />
        <Label htmlFor="addr-default" className="text-sm cursor-pointer">
          Set as default delivery address
        </Label>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <Button variant="outline" className="flex-1" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          className="flex-1 bg-amber-600 hover:bg-amber-700"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <CheckCircle2 className="h-4 w-4 mr-2" />
          )}
          {isEditing ? 'Update Address' : 'Save Address'}
        </Button>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Single Address Card
// ---------------------------------------------------------------------------

function AddressCard({
  addr,
  onSetDefault,
  onDelete,
  onEdit,
  onSelect,
  settingDefaultId,
  deletingId,
  showSelectButton,
}: {
  addr: DeliveryAddress
  onSetDefault: (id: string) => void
  onDelete: (id: string) => void
  onEdit: (addr: DeliveryAddress) => void
  onSelect?: (addr: DeliveryAddress) => void
  settingDefaultId: string | null
  deletingId: string | null
  showSelectButton: boolean
}) {
  const countryName = COUNTRIES.find((c) => c.code === addr.country)?.name || addr.country
  const labelLower = addr.label.toLowerCase()
  const labelIsOffice = labelLower.includes('office') || labelLower.includes('work')
  const labelIsWarehouse = labelLower.includes('warehouse') || labelLower.includes('godown')

  return (
    <motion.div variants={itemVariants} layout initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}>
      <Card className={`border-0 shadow-sm transition-shadow hover:shadow-md ${addr.isDefault ? 'ring-2 ring-amber-200' : ''}`}>
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            {/* Icon */}
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-50">
              {labelIsWarehouse ? (
                <Warehouse className="h-5 w-5 text-amber-600" />
              ) : labelIsOffice ? (
                <Building2 className="h-5 w-5 text-amber-600" />
              ) : (
                <Home className="h-5 w-5 text-amber-600" />
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-sm truncate">{addr.label}</span>
                <Badge variant="outline" className="text-[10px] px-1.5 py-0 shrink-0">
                  {countryName}
                </Badge>
                {addr.isDefault && (
                  <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100 text-[10px] px-1.5 py-0 shrink-0">
                    <Star className="h-2.5 w-2.5 mr-0.5 fill-amber-600 text-amber-600" />
                    Default
                  </Badge>
                )}
              </div>

              <div className="mt-1.5 space-y-0.5">
                <div className="flex items-center gap-1.5 text-sm">
                  <User className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  <span className="truncate">{addr.fullName}</span>
                </div>
                <div className="flex items-center gap-1.5 text-sm">
                  <Phone className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  <span className="truncate">{addr.phone}</span>
                </div>
                <div className="flex items-start gap-1.5 text-sm text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                  <span className="truncate">
                    {addr.address}, {addr.city}
                    {addr.state ? `, ${addr.state}` : ''}
                    {addr.zipCode ? ` — ${addr.zipCode}` : ''}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-0.5 shrink-0">
              {showSelectButton && onSelect && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2.5 text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                  onClick={() => onSelect(addr)}
                  title="Use this address"
                >
                  <ArrowRight className="h-4 w-4 mr-1" />
                  <span className="text-xs">Use</span>
                </Button>
              )}

              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-blue-600 hover:bg-blue-50"
                onClick={() => onEdit(addr)}
                title="Edit"
              >
                <Edit2 className="h-4 w-4" />
              </Button>

              {!addr.isDefault ? (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-amber-600 hover:bg-amber-50"
                  onClick={() => onSetDefault(addr.id)}
                  disabled={settingDefaultId === addr.id}
                  title="Set as default"
                >
                  {settingDefaultId === addr.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <StarOff className="h-4 w-4" />
                  )}
                </Button>
              ) : (
                <div className="h-8 w-8 flex items-center justify-center">
                  <CheckCircle2 className="h-4 w-4 text-amber-600" />
                </div>
              )}

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-red-600 hover:bg-red-50"
                    disabled={deletingId === addr.id}
                    title="Delete"
                  >
                    {deletingId === addr.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Address</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete &quot;{addr.label}&quot;? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={() => onDelete(addr.id)}>
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// ---------------------------------------------------------------------------
// Main AddressBook Component
// ---------------------------------------------------------------------------

export function AddressBook({ userId, onSelectAddress }: AddressBookProps) {
  const [addresses, setAddresses] = useState<DeliveryAddress[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showFormDialog, setShowFormDialog] = useState(false)
  const [editingItem, setEditingItem] = useState<DeliveryAddress | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [settingDefaultId, setSettingDefaultId] = useState<string | null>(null)

  const fetchAddresses = useCallback(async () => {
    if (!userId) {
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/shipping/addresses?userId=${userId}`)
      const json = await res.json()
      if (json.success) {
        setAddresses(json.data?.addresses ?? json.data ?? [])
      } else {
        setError(json.error || 'Failed to load addresses')
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    fetchAddresses()
  }, [fetchAddresses])

  const handleSetDefault = async (id: string) => {
    setSettingDefaultId(id)
    try {
      const res = await fetch(`/api/shipping/addresses/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, isDefault: true }),
      })
      const json = await res.json()
      if (json.success) {
        toast.success('Default address updated')
        fetchAddresses()
      } else {
        toast.error(json.error || 'Failed to update default')
      }
    } catch {
      toast.error('Network error. Please try again.')
    } finally {
      setSettingDefaultId(null)
    }
  }

  const handleDelete = async (id: string) => {
    setDeletingId(id)
    try {
      const res = await fetch(`/api/shipping/addresses/${id}?userId=${userId}`, { method: 'DELETE' })
      const json = await res.json()
      if (json.success) {
        toast.success('Address deleted')
        fetchAddresses()
      } else {
        toast.error(json.error || 'Failed to delete')
      }
    } catch {
      toast.error('Network error. Please try again.')
    } finally {
      setDeletingId(null)
    }
  }

  const handleEdit = (addr: DeliveryAddress) => {
    setEditingItem(addr)
    setShowFormDialog(true)
  }

  const handleFormSaved = () => {
    setShowFormDialog(false)
    setEditingItem(null)
    fetchAddresses()
  }

  // Loading skeletons
  if (loading && addresses.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-9 w-32" />
        </div>
        {[...Array(2)].map((_, i) => (
          <Card key={i} className="border-0 shadow-sm animate-pulse">
            <CardContent className="p-4">
              <Skeleton className="h-24 rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      {/* Header */}
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <MapPin className="h-5 w-5 text-amber-600" />
            Delivery Addresses
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your saved delivery addresses
          </p>
        </div>
        <Button
          size="sm"
          className="bg-amber-600 hover:bg-amber-700"
          onClick={() => {
            setEditingItem(null)
            setShowFormDialog(true)
          }}
        >
          <Plus className="h-4 w-4 mr-1.5" />
          Add Address
        </Button>
      </motion.div>

      {/* Error state */}
      {error && (
        <motion.div variants={itemVariants} className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
          <p className="text-sm text-red-700">{error}</p>
          <Button variant="outline" size="sm" className="mt-3" onClick={fetchAddresses}>
            Retry
          </Button>
        </motion.div>
      )}

      {/* Address List */}
      <AnimatePresence mode="popLayout">
        {addresses.length === 0 && !error ? (
          <motion.div variants={itemVariants} className="text-center py-12">
            <div className="flex justify-center mb-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-50">
                <MapPin className="h-8 w-8 text-amber-400" />
              </div>
            </div>
            <h3 className="text-lg font-semibold mb-1">No saved addresses</h3>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto mb-4">
              Add a delivery address to speed up checkout. We&apos;ll save it for your next order.
            </p>
            <Button
              size="sm"
              className="bg-amber-600 hover:bg-amber-700"
              onClick={() => {
                setEditingItem(null)
                setShowFormDialog(true)
              }}
            >
              <Plus className="h-4 w-4 mr-1.5" />
              Add Your First Address
            </Button>
          </motion.div>
        ) : (
          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1 scrollbar-thin">
            {addresses.map((addr) => (
              <AddressCard
                key={addr.id}
                addr={addr}
                onSetDefault={handleSetDefault}
                onDelete={handleDelete}
                onEdit={handleEdit}
                onSelect={onSelectAddress}
                settingDefaultId={settingDefaultId}
                deletingId={deletingId}
                showSelectButton={!!onSelectAddress}
              />
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* Add/Edit Dialog */}
      <Dialog open={showFormDialog} onOpenChange={(open) => {
        if (!open) {
          setShowFormDialog(false)
          setEditingItem(null)
        }
      }}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {editingItem ? <Edit2 className="h-5 w-5 text-amber-600" /> : <Plus className="h-5 w-5 text-amber-600" />}
              {editingItem ? 'Edit Address' : 'Add New Address'}
            </DialogTitle>
            <DialogDescription>
              {editingItem ? 'Update your delivery address details' : 'Enter the details for a new delivery address'}
            </DialogDescription>
          </DialogHeader>
          <AddressForm
            userId={userId}
            editItem={editingItem}
            onSaved={handleFormSaved}
            onCancel={() => {
              setShowFormDialog(false)
              setEditingItem(null)
            }}
          />
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}
