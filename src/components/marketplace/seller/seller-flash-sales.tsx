'use client'

import { useEffect, useState, useCallback } from 'react'
import {
  Zap,
  Plus,
  Trash2,
  Edit3,
  Loader2,
  AlertCircle,
  Flame,
  Clock,
  ToggleLeft,
  ToggleRight,
  Package,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
import { Progress } from '@/components/ui/progress'
import { useMarketplaceStore } from '@/store/use-marketplace-store'
import { toast } from 'sonner'
import type { FlashSale, FlashSaleType, Product } from '@/types'

function safeJsonParse<T>(value: string | null | undefined, fallback: T): T {
  if (!value) return fallback
  try {
    return JSON.parse(value) as T
  } catch {
    return fallback
  }
}

function getCountdown(endDate: string): string {
  const now = new Date().getTime()
  const end = new Date(endDate).getTime()
  const diff = end - now

  if (diff <= 0) return 'Ended'

  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((diff % (1000 * 60)) / 1000)

  if (days > 0) return `${days}d ${hours}h ${minutes}m`
  if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`
  return `${minutes}m ${seconds}s`
}

function getSaleStatus(sale: FlashSale): 'active' | 'upcoming' | 'expired' {
  const now = new Date()
  const start = new Date(sale.startDate)
  const end = new Date(sale.endDate)

  if (!sale.isActive) {
    // If inactive but within date range, still consider based on dates
    if (now >= start && now <= end) return 'expired' // manually deactivated
    if (now < start) return 'upcoming'
    return 'expired'
  }

  if (now >= start && now <= end) return 'active'
  if (now < start) return 'upcoming'
  return 'expired'
}

interface ProductOption {
  id: string
  name: string
  price: number
  images: string
}

export function SellerFlashSales() {
  const { currentUser } = useMarketplaceStore()
  const [flashSales, setFlashSales] = useState<FlashSale[]>([])
  const [loading, setLoading] = useState(true)
  const [products, setProducts] = useState<ProductOption[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingSale, setEditingSale] = useState<FlashSale | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [, setTick] = useState(0)

  // Form state
  const [formProductId, setFormProductId] = useState('')
  const [formTitle, setFormTitle] = useState('')
  const [formDescription, setFormDescription] = useState('')
  const [formSalePrice, setFormSalePrice] = useState('')
  const [formType, setFormType] = useState<FlashSaleType>('flash_sale')
  const [formStartDate, setFormStartDate] = useState('')
  const [formEndDate, setFormEndDate] = useState('')
  const [formMaxQuantity, setFormMaxQuantity] = useState('')
  const [formBanner, setFormBanner] = useState('')

  const shopId = currentUser?.shop?.id

  // Tick every second for countdown timers
  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 1000)
    return () => clearInterval(interval)
  }, [])

  const fetchFlashSales = useCallback(async () => {
    if (!shopId) return
    setLoading(true)
    try {
      const res = await fetch(`/api/flash-sales?shopId=${shopId}&includeExpired=true&limit=100`)
      const data = await res.json()
      if (data.success) {
        setFlashSales(data.data.items || [])
      }
    } catch {
      toast.error('Failed to load flash sales')
    } finally {
      setLoading(false)
    }
  }, [shopId])

  const fetchProducts = useCallback(async () => {
    if (!shopId) return
    try {
      const res = await fetch(`/api/products?shopId=${shopId}&limit=100`)
      const data = await res.json()
      if (data.success && data.data?.items) {
        setProducts(
          data.data.items.map((p: Product) => ({
            id: p.id,
            name: p.name,
            price: p.price,
            images: p.images,
          }))
        )
      }
    } catch {
      // silent fail
    }
  }, [shopId])

  useEffect(() => {
    fetchFlashSales()
    fetchProducts()
  }, [fetchFlashSales, fetchProducts])

  const resetForm = () => {
    setFormProductId('')
    setFormTitle('')
    setFormDescription('')
    setFormSalePrice('')
    setFormType('flash_sale')
    setFormStartDate('')
    setFormEndDate('')
    setFormMaxQuantity('')
    setFormBanner('')
    setEditingSale(null)
  }

  const openCreateDialog = () => {
    resetForm()
    setDialogOpen(true)
  }

  const openEditDialog = (sale: FlashSale) => {
    setEditingSale(sale)
    setFormProductId(sale.productId)
    setFormTitle(sale.title)
    setFormDescription(sale.description || '')
    setFormSalePrice(String(sale.salePrice))
    setFormType(sale.type as FlashSaleType)
    setFormStartDate(new Date(sale.startDate).toISOString().slice(0, 16))
    setFormEndDate(new Date(sale.endDate).toISOString().slice(0, 16))
    setFormMaxQuantity(sale.maxQuantity ? String(sale.maxQuantity) : '')
    setFormBanner(sale.banner || '')
    setDialogOpen(true)
  }

  const handleSave = async () => {
    if (!shopId || !formProductId || !formTitle || !formSalePrice || !formStartDate || !formEndDate) {
      toast.error('Please fill in all required fields')
      return
    }

    const salePriceNum = parseFloat(formSalePrice)
    if (isNaN(salePriceNum) || salePriceNum <= 0) {
      toast.error('Please enter a valid sale price')
      return
    }

    setSaving(true)
    try {
      if (editingSale) {
        // Update
        const res = await fetch(`/api/flash-sales/${editingSale.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: formTitle,
            description: formDescription || undefined,
            salePrice: salePriceNum,
            startDate: formStartDate,
            endDate: formEndDate,
            maxQuantity: formMaxQuantity ? parseInt(formMaxQuantity, 10) : undefined,
            banner: formBanner || undefined,
            userId: currentUser?.id,
          }),
        })
        const data = await res.json()
        if (data.success) {
          toast.success('Flash sale updated successfully')
          setDialogOpen(false)
          resetForm()
          fetchFlashSales()
        } else {
          toast.error(data.error || 'Failed to update flash sale')
        }
      } else {
        // Create
        const res = await fetch('/api/flash-sales', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            shopId,
            productId: formProductId,
            title: formTitle,
            description: formDescription || undefined,
            salePrice: salePriceNum,
            type: formType,
            startDate: formStartDate,
            endDate: formEndDate,
            maxQuantity: formMaxQuantity ? parseInt(formMaxQuantity, 10) : undefined,
            banner: formBanner || undefined,
          }),
        })
        const data = await res.json()
        if (data.success) {
          toast.success('Flash sale created successfully')
          setDialogOpen(false)
          resetForm()
          fetchFlashSales()
        } else {
          toast.error(data.error || 'Failed to create flash sale')
        }
      }
    } catch {
      toast.error('Something went wrong')
    } finally {
      setSaving(false)
    }
  }

  const handleToggleActive = async (sale: FlashSale) => {
    try {
      const res = await fetch(`/api/flash-sales/${sale.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isActive: !sale.isActive,
          userId: currentUser?.id,
        }),
      })
      const data = await res.json()
      if (data.success) {
        toast.success(sale.isActive ? 'Flash sale deactivated' : 'Flash sale activated')
        fetchFlashSales()
      } else {
        toast.error(data.error || 'Failed to toggle flash sale')
      }
    } catch {
      toast.error('Something went wrong')
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      const res = await fetch(`/api/flash-sales/${deleteId}?userId=${currentUser?.id}`, {
        method: 'DELETE',
      })
      const data = await res.json()
      if (data.success) {
        toast.success('Flash sale deleted')
        setDeleteId(null)
        fetchFlashSales()
      } else {
        toast.error(data.error || 'Failed to delete flash sale')
      }
    } catch {
      toast.error('Something went wrong')
    }
  }

  const selectedProduct = products.find((p) => p.id === formProductId)

  const statusCounts = {
    active: flashSales.filter((s) => getSaleStatus(s) === 'active').length,
    upcoming: flashSales.filter((s) => getSaleStatus(s) === 'upcoming').length,
    expired: flashSales.filter((s) => getSaleStatus(s) === 'expired').length,
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Zap className="text-orange-500" size={24} />
            Flash Sales & Deals
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Create time-limited deals to boost your sales
          </p>
        </div>
        <Button onClick={openCreateDialog} className="gap-2 bg-amber-600 hover:bg-amber-700">
          <Plus size={16} />
          Create Flash Sale
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-amber-600">{statusCounts.active}</p>
            <p className="text-xs text-muted-foreground">Active</p>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-amber-600">{statusCounts.upcoming}</p>
            <p className="text-xs text-muted-foreground">Upcoming</p>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-400">{statusCounts.expired}</p>
            <p className="text-xs text-muted-foreground">Expired</p>
          </div>
        </Card>
      </div>

      {/* Flash Sales List */}
      {flashSales.length === 0 ? (
        <Card className="p-8">
          <div className="text-center text-muted-foreground">
            <Flame size={48} className="mx-auto mb-4 opacity-30" />
            <h3 className="text-lg font-medium mb-1">No Flash Sales Yet</h3>
            <p className="text-sm mb-4">Create your first flash sale to attract more buyers</p>
            <Button onClick={openCreateDialog} variant="outline" className="gap-2">
              <Plus size={16} />
              Create Flash Sale
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {flashSales.map((sale) => {
            const status = getSaleStatus(sale)
            const images = safeJsonParse<string[]>(sale.product?.images, [])
            const progressPercent =
              sale.maxQuantity && sale.maxQuantity > 0
                ? Math.min(100, (sale.soldQuantity / sale.maxQuantity) * 100)
                : 0

            return (
              <Card key={sale.id} className="overflow-hidden">
                {/* Card Image */}
                <div className="relative aspect-video bg-muted">
                  {images[0] ? (
                    <img
                      src={images[0]}
                      alt={sale.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package size={32} className="text-muted-foreground" />
                    </div>
                  )}
                  {/* Status Badge */}
                  <Badge
                    className={`absolute top-2 left-2 ${
                      status === 'active'
                        ? 'bg-amber-500 text-gray-900'
                        : status === 'upcoming'
                          ? 'bg-amber-500 text-gray-900'
                          : 'bg-gray-500 text-white'
                    }`}
                  >
                    {status === 'active' ? '🟢 Active' : status === 'upcoming' ? '🟡 Upcoming' : '⏰ Expired'}
                  </Badge>
                  {/* Discount Badge */}
                  <Badge className="absolute top-2 right-2 bg-red-500 text-white">
                    -{sale.discountPercent}%
                  </Badge>
                  {/* Type Badge */}
                  <Badge
                    variant="outline"
                    className="absolute bottom-2 left-2 bg-black/60 text-white border-0"
                  >
                    {sale.type === 'flash_sale' ? (
                      <span className="flex items-center gap-1"><Zap size={10} /> Flash Sale</span>
                    ) : (
                      <span className="flex items-center gap-1"><Flame size={10} /> Deal of the Day</span>
                    )}
                  </Badge>
                </div>

                <CardContent className="p-4 space-y-3">
                  {/* Title */}
                  <h3 className="font-semibold text-sm line-clamp-1">{sale.title}</h3>

                  {/* Prices */}
                  <div className="flex items-baseline gap-2">
                    <span className="text-lg font-bold text-amber-600">
                      ${sale.salePrice.toFixed(2)}
                    </span>
                    <span className="text-sm text-muted-foreground line-through">
                      ${sale.originalPrice.toFixed(2)}
                    </span>
                  </div>

                  {/* Countdown / Date */}
                  {status === 'active' && (
                    <div className="flex items-center gap-1.5 text-xs text-orange-600 font-medium">
                      <Clock size={12} />
                      <span>Ends in: {getCountdown(sale.endDate)}</span>
                    </div>
                  )}
                  {status === 'upcoming' && (
                    <div className="flex items-center gap-1.5 text-xs text-amber-600 font-medium">
                      <Clock size={12} />
                      <span>Starts: {new Date(sale.startDate).toLocaleDateString()}</span>
                    </div>
                  )}
                  {status === 'expired' && (
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Clock size={12} />
                      <span>Ended: {new Date(sale.endDate).toLocaleDateString()}</span>
                    </div>
                  )}

                  {/* Progress bar */}
                  {sale.maxQuantity && sale.maxQuantity > 0 && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Sold {sale.soldQuantity}</span>
                        <span>of {sale.maxQuantity}</span>
                      </div>
                      <Progress value={progressPercent} className="h-2" />
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-1">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 gap-1"
                      onClick={() => openEditDialog(sale)}
                    >
                      <Edit3 size={14} />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1"
                      onClick={() => handleToggleActive(sale)}
                    >
                      {sale.isActive ? (
                        <ToggleRight size={14} className="text-amber-600" />
                      ) : (
                        <ToggleLeft size={14} className="text-muted-foreground" />
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => setDeleteId(sale.id)}
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={(open) => { if (!open) resetForm(); setDialogOpen(open) }}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Zap size={18} className="text-orange-500" />
              {editingSale ? 'Edit Flash Sale' : 'Create Flash Sale'}
            </DialogTitle>
            <DialogDescription>
              {editingSale
                ? 'Update your flash sale details below'
                : 'Set up a time-limited deal for your product'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Product Selector */}
            <div className="space-y-2">
              <Label>Product *</Label>
              {editingSale ? (
                <Input
                  value={editingSale.product?.name || editingSale.productId}
                  disabled
                />
              ) : (
                <Select value={formProductId} onValueChange={(val) => {
                  setFormProductId(val)
                  const prod = products.find((p) => p.id === val)
                  if (prod && !formTitle) {
                    setFormTitle(`${prod.name} - Flash Deal`)
                  }
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a product" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name} — ${p.price.toFixed(2)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              {selectedProduct && !editingSale && (
                <p className="text-xs text-muted-foreground">
                  Original price: ${selectedProduct.price.toFixed(2)}
                </p>
              )}
            </div>

            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="fs-title">Title *</Label>
              <Input
                id="fs-title"
                placeholder="e.g., Summer Flash Deal"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="fs-desc">Description</Label>
              <Textarea
                id="fs-desc"
                placeholder="Describe the deal..."
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                rows={2}
              />
            </div>

            {/* Sale Price + Type */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fs-price">Sale Price *</Label>
                <Input
                  id="fs-price"
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="9.99"
                  value={formSalePrice}
                  onChange={(e) => setFormSalePrice(e.target.value)}
                />
                {selectedProduct && formSalePrice && (
                  <p className="text-xs text-amber-600">
                    {Math.round(((selectedProduct.price - parseFloat(formSalePrice)) / selectedProduct.price) * 100)}% off
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Type</Label>
                <Select
                  value={formType}
                  onValueChange={(val) => setFormType(val as FlashSaleType)}
                  disabled={!!editingSale}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="flash_sale">
                      <span className="flex items-center gap-1.5">
                        <Zap size={12} className="text-orange-500" />
                        Flash Sale
                      </span>
                    </SelectItem>
                    <SelectItem value="deal_of_day">
                      <span className="flex items-center gap-1.5">
                        <Flame size={12} className="text-red-500" />
                        Deal of the Day
                      </span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Start/End Dates */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fs-start">Start Date *</Label>
                <Input
                  id="fs-start"
                  type="datetime-local"
                  value={formStartDate}
                  onChange={(e) => setFormStartDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fs-end">End Date *</Label>
                <Input
                  id="fs-end"
                  type="datetime-local"
                  value={formEndDate}
                  onChange={(e) => setFormEndDate(e.target.value)}
                />
              </div>
            </div>

            {/* Max Quantity */}
            <div className="space-y-2">
              <Label htmlFor="fs-maxqty">Max Quantity</Label>
              <Input
                id="fs-maxqty"
                type="number"
                min="1"
                placeholder="Leave empty for unlimited"
                value={formMaxQuantity}
                onChange={(e) => setFormMaxQuantity(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Limit the number of items that can be sold at this price
              </p>
            </div>

            {/* Banner URL */}
            <div className="space-y-2">
              <Label htmlFor="fs-banner">Banner Image URL</Label>
              <Input
                id="fs-banner"
                placeholder="https://example.com/banner.jpg"
                value={formBanner}
                onChange={(e) => setFormBanner(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => { resetForm(); setDialogOpen(false) }}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="gap-2 bg-amber-600 hover:bg-amber-700"
            >
              {saving && <Loader2 size={14} className="animate-spin" />}
              {editingSale ? 'Update' : 'Create'} Flash Sale
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Flash Sale?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The flash sale will be permanently removed.
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
