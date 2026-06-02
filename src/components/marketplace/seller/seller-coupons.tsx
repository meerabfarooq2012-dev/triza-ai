'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Ticket,
  Plus,
  Copy,
  Edit,
  Trash2,
  Power,
  PowerOff,
  RefreshCw,
  Percent,
  DollarSign,
  Truck,
  Calendar,
  Check,
  Loader2,
  Tag,
  Users,
  TrendingDown,
  Sparkles,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
} from '@/components/ui/alert-dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { useMarketplaceStore } from '@/store/use-marketplace-store'
import { toast } from 'sonner'
import type {
  Coupon,
  CouponType,
  CouponAppliesToType,
  CreateCouponInput,
} from '@/types'
import { COUPON_TYPE_LABELS, COUPON_APPLIES_TO_LABELS } from '@/types'

// ---- Types ----
interface CouponStats {
  total: number
  active: number
  totalRedemptions: number
  totalSavings: number
}

interface CouponFormData {
  code: string
  description: string
  type: CouponType
  value: string
  maxDiscount: string
  minOrderAmount: string
  usageLimit: string
  perUserLimit: string
  startDate: string
  endDate: string
  appliesToType: CouponAppliesToType
  isActive: boolean
}

const emptyForm: CouponFormData = {
  code: '',
  description: '',
  type: 'percentage',
  value: '',
  maxDiscount: '',
  minOrderAmount: '0',
  usageLimit: '',
  perUserLimit: '1',
  startDate: '',
  endDate: '',
  appliesToType: 'all',
  isActive: true,
}

// ---- Helpers ----
function generateRandomCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = ''
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

function getCouponStatusBadge(coupon: Coupon) {
  const now = new Date()
  const start = coupon.startDate ? new Date(coupon.startDate) : null
  const end = coupon.endDate ? new Date(coupon.endDate) : null

  if (!coupon.isActive) {
    return { label: 'Inactive', className: 'bg-gray-100 text-gray-600 border-gray-200' }
  }
  if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
    return { label: 'Used Up', className: 'bg-amber-50 text-amber-700 border-amber-200' }
  }
  if (end && end < now) {
    return { label: 'Expired', className: 'bg-red-50 text-red-700 border-red-200' }
  }
  if (start && start > now) {
    return { label: 'Scheduled', className: 'bg-sky-50 text-sky-700 border-sky-200' }
  }
  return { label: 'Active', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' }
}

function getTypeBadgeClass(type: CouponType) {
  switch (type) {
    case 'percentage':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200'
    case 'fixed':
      return 'bg-violet-50 text-violet-700 border-violet-200'
    case 'free_shipping':
      return 'bg-sky-50 text-sky-700 border-sky-200'
    default:
      return 'bg-gray-50 text-gray-700 border-gray-200'
  }
}

function getTypeIcon(type: CouponType) {
  switch (type) {
    case 'percentage':
      return Percent
    case 'fixed':
      return DollarSign
    case 'free_shipping':
      return Truck
    default:
      return Tag
  }
}

function formatValue(coupon: Coupon) {
  switch (coupon.type) {
    case 'percentage':
      return `${coupon.value}% OFF`
    case 'fixed':
      return `$${coupon.value.toFixed(2)} OFF`
    case 'free_shipping':
      return 'FREE SHIPPING'
    default:
      return ''
  }
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

// ---- Component ----
export function SellerCoupons() {
  const { currentUser } = useMarketplaceStore()
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [stats, setStats] = useState<CouponStats>({ total: 0, active: 0, totalRedemptions: 0, totalSavings: 0 })
  const [loading, setLoading] = useState(true)

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null)
  const [formData, setFormData] = useState<CouponFormData>(emptyForm)
  const [submitting, setSubmitting] = useState(false)

  // Delete confirmation
  const [deleteTarget, setDeleteTarget] = useState<Coupon | null>(null)

  const fetchCoupons = useCallback(async () => {
    if (!currentUser?.shop) {
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const res = await fetch(`/api/coupons?shopId=${currentUser.shop.id}`)
      const data = await res.json()
      if (data.success) {
        setCoupons(data.data.coupons || [])
        setStats(data.data.stats || { total: 0, active: 0, totalRedemptions: 0, totalSavings: 0 })
      }
    } catch (error) {
      console.error('Failed to fetch coupons:', error)
    } finally {
      setLoading(false)
    }
  }, [currentUser])

  useEffect(() => {
    fetchCoupons()
  }, [fetchCoupons])

  // ---- Handlers ----
  const handleOpenCreate = () => {
    setEditingCoupon(null)
    setFormData(emptyForm)
    setDialogOpen(true)
  }

  const handleOpenEdit = (coupon: Coupon) => {
    setEditingCoupon(coupon)
    setFormData({
      code: coupon.code,
      description: coupon.description || '',
      type: coupon.type as CouponType,
      value: String(coupon.value),
      maxDiscount: coupon.maxDiscount ? String(coupon.maxDiscount) : '',
      minOrderAmount: String(coupon.minOrderAmount || 0),
      usageLimit: coupon.usageLimit ? String(coupon.usageLimit) : '',
      perUserLimit: String(coupon.perUserLimit || 1),
      startDate: coupon.startDate ? new Date(coupon.startDate).toISOString().split('T')[0] : '',
      endDate: coupon.endDate ? new Date(coupon.endDate).toISOString().split('T')[0] : '',
      appliesToType: coupon.appliesToType as CouponAppliesToType,
      isActive: coupon.isActive,
    })
    setDialogOpen(true)
  }

  const handleGenerateCode = () => {
    setFormData({ ...formData, code: generateRandomCode() })
  }

  const handleSubmit = async () => {
    if (!currentUser?.shop) return

    if (!formData.code.trim()) {
      toast.error('Coupon code is required')
      return
    }
    if (formData.type !== 'free_shipping' && (!formData.value || parseFloat(formData.value) <= 0)) {
      toast.error('Value must be greater than 0')
      return
    }
    if (formData.type === 'percentage' && parseFloat(formData.value) > 100) {
      toast.error('Percentage cannot exceed 100')
      return
    }

    setSubmitting(true)
    try {
      const payload: Record<string, unknown> = {
        shopId: currentUser.shop.id,
        code: formData.code.toUpperCase(),
        description: formData.description || undefined,
        type: formData.type,
        value: formData.type === 'free_shipping' ? 0 : parseFloat(formData.value),
        minOrderAmount: parseFloat(formData.minOrderAmount) || 0,
        maxDiscount: formData.type === 'percentage' && formData.maxDiscount ? parseFloat(formData.maxDiscount) : undefined,
        usageLimit: formData.usageLimit ? parseInt(formData.usageLimit, 10) : undefined,
        perUserLimit: parseInt(formData.perUserLimit, 10) || 1,
        startDate: formData.startDate || undefined,
        endDate: formData.endDate || undefined,
        appliesToType: formData.appliesToType,
        isActive: formData.isActive,
      }

      if (editingCoupon) {
        const res = await fetch(`/api/coupons/${editingCoupon.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        const data = await res.json()
        if (!data.success) {
          toast.error(data.error || 'Failed to update coupon')
        } else {
          toast.success('Coupon updated successfully!')
        }
      } else {
        const res = await fetch('/api/coupons', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        const data = await res.json()
        if (!data.success) {
          toast.error(data.error || 'Failed to create coupon')
        } else {
          toast.success('Coupon created successfully!')
        }
      }

      setDialogOpen(false)
      fetchCoupons()
    } catch (error) {
      console.error('Failed to save coupon:', error)
      toast.error('Failed to save coupon')
    } finally {
      setSubmitting(false)
    }
  }

  const handleToggleActive = async (coupon: Coupon) => {
    try {
      const res = await fetch(`/api/coupons/${coupon.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !coupon.isActive }),
      })
      const data = await res.json()
      if (data.success) {
        toast.success(coupon.isActive ? 'Coupon deactivated' : 'Coupon activated')
        fetchCoupons()
      } else {
        toast.error(data.error || 'Failed to update coupon')
      }
    } catch (error) {
      console.error('Failed to toggle coupon:', error)
      toast.error('Failed to update coupon')
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      const res = await fetch(`/api/coupons/${deleteTarget.id}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        toast.success('Coupon deleted')
        fetchCoupons()
      } else {
        toast.error(data.error || 'Failed to delete coupon')
      }
    } catch (error) {
      console.error('Failed to delete coupon:', error)
      toast.error('Failed to delete coupon')
    } finally {
      setDeleteTarget(null)
    }
  }

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    toast.success('Code copied to clipboard!')
  }

  // ---- Render ----
  const shopId = currentUser?.shop?.id

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100">
            <Ticket className="h-5 w-5 text-emerald-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Coupons & Promo Codes</h1>
            <p className="text-sm text-gray-500">Create and manage discount codes for your shop</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchCoupons} className="gap-1.5">
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh
          </Button>
          <Button
            className="gap-2 bg-emerald-600 hover:bg-emerald-700"
            onClick={handleOpenCreate}
            disabled={!shopId}
          >
            <Plus className="h-4 w-4" />
            Create Coupon
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }}>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50">
                  <Ticket className="h-4 w-4 text-emerald-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Total Coupons</p>
                  <p className="text-lg font-bold text-gray-900">{stats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-50">
                  <Power className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Active</p>
                  <p className="text-lg font-bold text-gray-900">{stats.active}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50">
                  <Users className="h-4 w-4 text-amber-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Redemptions</p>
                  <p className="text-lg font-bold text-gray-900">{stats.totalRedemptions}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-50">
                  <TrendingDown className="h-4 w-4 text-violet-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Total Savings</p>
                  <p className="text-lg font-bold text-gray-900">${stats.totalSavings.toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Coupon List */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="border-0 shadow-sm">
              <CardContent className="p-5">
                <div className="flex gap-4">
                  <Skeleton className="h-20 w-32 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-48" />
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-64" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : coupons.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 py-16"
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 mb-4">
            <Ticket className="h-8 w-8 text-emerald-300" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">No coupons yet</h3>
          <p className="mt-1 text-sm text-gray-500 max-w-sm text-center">
            Create your first coupon to attract more buyers and boost sales
          </p>
          <Button
            className="mt-4 gap-2 bg-emerald-600 hover:bg-emerald-700"
            onClick={handleOpenCreate}
          >
            <Plus className="h-4 w-4" />
            Create Coupon
          </Button>
        </motion.div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {coupons.map((coupon, index) => {
              const statusBadge = getCouponStatusBadge(coupon)
              const TypeIcon = getTypeIcon(coupon.type as CouponType)
              const usagePercent = coupon.usageLimit
                ? Math.min((coupon.usedCount / coupon.usageLimit) * 100, 100)
                : 0

              return (
                <motion.div
                  key={coupon.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ delay: index * 0.03 }}
                >
                  <Card className={`border-0 shadow-sm transition-all hover:shadow-md ${!coupon.isActive ? 'opacity-60' : ''}`}>
                    <CardContent className="p-4 sm:p-5">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        {/* Left side: Code + details */}
                        <div className="flex-1 space-y-3">
                          {/* Code row */}
                          <div className="flex flex-wrap items-center gap-2">
                            <div className="flex items-center gap-1.5 rounded-lg bg-gray-900 px-3 py-1.5">
                              <span className="font-mono text-sm font-bold tracking-wider text-white">
                                {coupon.code}
                              </span>
                              <button
                                onClick={() => handleCopyCode(coupon.code)}
                                className="ml-1 rounded p-0.5 text-gray-400 transition-colors hover:bg-gray-700 hover:text-white"
                                title="Copy code"
                              >
                                <Copy className="h-3.5 w-3.5" />
                              </button>
                            </div>
                            <Badge variant="outline" className={getTypeBadgeClass(coupon.type as CouponType)}>
                              <TypeIcon className="mr-1 h-3 w-3" />
                              {COUPON_TYPE_LABELS[coupon.type as CouponType]?.label || coupon.type}
                            </Badge>
                            <Badge variant="outline" className={statusBadge.className}>
                              {statusBadge.label}
                            </Badge>
                          </div>

                          {/* Value display */}
                          <p className="text-lg font-bold text-gray-900">
                            {formatValue(coupon)}
                          </p>

                          {/* Details grid */}
                          <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-gray-500">
                            {coupon.minOrderAmount > 0 && (
                              <span>Min. order: ${coupon.minOrderAmount.toFixed(2)}</span>
                            )}
                            {coupon.maxDiscount && coupon.type === 'percentage' && (
                              <span>Max discount: ${coupon.maxDiscount.toFixed(2)}</span>
                            )}
                            <span>
                              <Calendar className="mr-0.5 inline h-3 w-3" />
                              {formatDate(coupon.startDate)} — {formatDate(coupon.endDate)}
                            </span>
                            <span>
                              {COUPON_APPLIES_TO_LABELS[coupon.appliesToType as CouponAppliesToType] || coupon.appliesToType}
                            </span>
                          </div>

                          {/* Usage progress */}
                          <div className="max-w-xs space-y-1">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-gray-500">
                                {coupon.usedCount} / {coupon.usageLimit || '∞'} uses
                              </span>
                              <span className="text-gray-400">
                                {coupon.perUserLimit > 1 ? `${coupon.perUserLimit} per user` : '1 per user'}
                              </span>
                            </div>
                            {coupon.usageLimit && (
                              <Progress value={usagePercent} className="h-1.5" />
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1 sm:flex-col sm:items-end">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleOpenEdit(coupon)}
                            title="Edit coupon"
                          >
                            <Edit className="h-4 w-4 text-gray-500" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleToggleActive(coupon)}
                            title={coupon.isActive ? 'Deactivate' : 'Activate'}
                          >
                            {coupon.isActive ? (
                              <PowerOff className="h-4 w-4 text-amber-500" />
                            ) : (
                              <Power className="h-4 w-4 text-green-500" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => setDeleteTarget(coupon)}
                            title="Delete coupon"
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Create/Edit Coupon Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-emerald-500" />
              {editingCoupon ? 'Edit Coupon' : 'Create New Coupon'}
            </DialogTitle>
          </DialogHeader>

          <div className="grid gap-5 py-4">
            {/* Code */}
            <div className="grid gap-2">
              <Label htmlFor="coupon-code">Coupon Code *</Label>
              <div className="flex gap-2">
                <Input
                  id="coupon-code"
                  value={formData.code}
                  onChange={(e) =>
                    setFormData({ ...formData, code: e.target.value.toUpperCase() })
                  }
                  placeholder="e.g. SAVE20"
                  className="flex-1 font-mono tracking-wider uppercase"
                  maxLength={20}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleGenerateCode}
                  className="gap-1.5 shrink-0"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  Generate
                </Button>
              </div>
            </div>

            {/* Description */}
            <div className="grid gap-2">
              <Label htmlFor="coupon-desc">Description <span className="text-gray-400">(internal note)</span></Label>
              <Textarea
                id="coupon-desc"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="e.g. Summer sale promo"
                rows={2}
              />
            </div>

            <Separator />

            {/* Type Selector */}
            <div className="grid gap-2">
              <Label>Discount Type *</Label>
              <div className="grid grid-cols-3 gap-2">
                {(['percentage', 'fixed', 'free_shipping'] as CouponType[]).map((t) => {
                  const Icon = getTypeIcon(t)
                  const isSelected = formData.type === t
                  return (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setFormData({ ...formData, type: t })}
                      className={`flex flex-col items-center gap-1.5 rounded-lg border-2 p-3 transition-all ${
                        isSelected
                          ? t === 'percentage'
                            ? 'border-emerald-400 bg-emerald-50 text-emerald-700'
                            : t === 'fixed'
                              ? 'border-violet-400 bg-violet-50 text-violet-700'
                              : 'border-sky-400 bg-sky-50 text-sky-700'
                          : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      <span className="text-xs font-medium">
                        {COUPON_TYPE_LABELS[t]?.label || t}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Value */}
            {formData.type !== 'free_shipping' && (
              <div className="grid gap-2">
                <Label htmlFor="coupon-value">
                  Discount Value *{' '}
                  <span className="text-gray-400">
                    ({formData.type === 'percentage' ? '%' : '$'})
                  </span>
                </Label>
                <div className="relative">
                  {formData.type === 'fixed' && (
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                  )}
                  <Input
                    id="coupon-value"
                    type="number"
                    step={formData.type === 'percentage' ? '1' : '0.01'}
                    min="0"
                    max={formData.type === 'percentage' ? '100' : undefined}
                    value={formData.value}
                    onChange={(e) =>
                      setFormData({ ...formData, value: e.target.value })
                    }
                    placeholder={formData.type === 'percentage' ? '20' : '5.00'}
                    className={formData.type === 'fixed' ? 'pl-7' : ''}
                  />
                  {formData.type === 'percentage' && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">%</span>
                  )}
                </div>
              </div>
            )}

            {/* Max Discount (percentage only) */}
            {formData.type === 'percentage' && (
              <div className="grid gap-2">
                <Label htmlFor="coupon-max-discount">
                  Max Discount <span className="text-gray-400">($)</span>
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                  <Input
                    id="coupon-max-discount"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.maxDiscount}
                    onChange={(e) =>
                      setFormData({ ...formData, maxDiscount: e.target.value })
                    }
                    placeholder="e.g. 50.00"
                    className="pl-7"
                  />
                </div>
              </div>
            )}

            <Separator />

            {/* Minimum Order Amount */}
            <div className="grid gap-2">
              <Label htmlFor="coupon-min-order">
                Minimum Order Amount <span className="text-gray-400">($)</span>
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                <Input
                  id="coupon-min-order"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.minOrderAmount}
                  onChange={(e) =>
                    setFormData({ ...formData, minOrderAmount: e.target.value })
                  }
                  placeholder="0.00"
                  className="pl-7"
                />
              </div>
            </div>

            {/* Usage & Limits */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="coupon-usage-limit">Total Usage Limit</Label>
                <Input
                  id="coupon-usage-limit"
                  type="number"
                  min="1"
                  value={formData.usageLimit}
                  onChange={(e) =>
                    setFormData({ ...formData, usageLimit: e.target.value })
                  }
                  placeholder="∞ unlimited"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="coupon-per-user">Per User Limit</Label>
                <Input
                  id="coupon-per-user"
                  type="number"
                  min="1"
                  value={formData.perUserLimit}
                  onChange={(e) =>
                    setFormData({ ...formData, perUserLimit: e.target.value })
                  }
                  placeholder="1"
                />
              </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="coupon-start">Start Date</Label>
                <Input
                  id="coupon-start"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) =>
                    setFormData({ ...formData, startDate: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="coupon-end">End Date</Label>
                <Input
                  id="coupon-end"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) =>
                    setFormData({ ...formData, endDate: e.target.value })
                  }
                />
              </div>
            </div>

            <Separator />

            {/* Applies To */}
            <div className="grid gap-2">
              <Label>Applies To</Label>
              <Select
                value={formData.appliesToType}
                onValueChange={(v) =>
                  setFormData({ ...formData, appliesToType: v as CouponAppliesToType })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(COUPON_APPLIES_TO_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Active Toggle */}
            <div className="flex items-center justify-between rounded-lg border border-gray-200 p-3">
              <div>
                <Label htmlFor="coupon-active" className="cursor-pointer">Active</Label>
                <p className="text-xs text-gray-500">Enable this coupon for buyers to use</p>
              </div>
              <Switch
                id="coupon-active"
                checked={formData.isActive}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, isActive: checked })
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              className="gap-2 bg-emerald-600 hover:bg-emerald-700"
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Check className="h-4 w-4" />
              )}
              {editingCoupon ? 'Update Coupon' : 'Create Coupon'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Coupon</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the coupon <span className="font-mono font-bold">{deleteTarget?.code}</span>? This action cannot be undone. All usage data for this coupon will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
