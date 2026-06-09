'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Power,
  PowerOff,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  Star,
  Image as ImageIcon,
  X,
  HelpCircle,
  Package as PackageIcon,
  Minus,
  Crown,
  Check,
  ChevronsUpDown,
  Upload,
  Cloud,
  Loader2,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
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
import { useMarketplaceStore } from '@/store/use-marketplace-store'
import { GIG_CATEGORIES } from '@/lib/constants'
import type { Gig, GigPackage, GigFAQ, Category } from '@/types'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function safeJsonParse<T>(value: string | null | undefined, fallback: T): T {
  if (!value) return fallback
  try {
    return JSON.parse(value) as T
  } catch {
    return fallback
  }
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 9)
}

// ---------------------------------------------------------------------------
// Form types
// ---------------------------------------------------------------------------

interface GigFormData {
  title: string
  description: string
  categoryId: string
  subcategoryId: string
  requirements: string
  tags: string
  isFeatured: boolean
  packages: GigPackage[]
  faqs: GigFAQ[]
  images: string[] // base64 encoded gallery images
  portfolio: string[] // base64 encoded portfolio images
}

const defaultPackages: GigPackage[] = [
  {
    id: generateId(),
    name: 'Basic',
    description: '',
    price: 0,
    deliveryDays: 3,
    features: [''],
    isPopular: false,
  },
  {
    id: generateId(),
    name: 'Standard',
    description: '',
    price: 0,
    deliveryDays: 5,
    features: [''],
    isPopular: true,
  },
  {
    id: generateId(),
    name: 'Premium',
    description: '',
    price: 0,
    deliveryDays: 7,
    features: [''],
    isPopular: false,
  },
]

const emptyForm: GigFormData = {
  title: '',
  description: '',
  categoryId: '',
  subcategoryId: '',
  requirements: '',
  tags: '',
  isFeatured: false,
  packages: defaultPackages,
  faqs: [],
  images: [],
  portfolio: [],
}

// ---------------------------------------------------------------------------
// Image Uploader Component
// ---------------------------------------------------------------------------

function ImageUploader({ images, onImagesChange, maxImages = 5, label = 'Images', folder = 'gigs' }: {
  images: string[]
  onImagesChange: (images: string[]) => void
  maxImages?: number
  label?: string
  folder?: string
}) {
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [uploading, setUploading] = useState(false)

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (event) => resolve(event.target?.result as string)
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  const processFiles = async (filesToProcess: File[]) => {
    const remaining = maxImages - images.length
    if (remaining <= 0) return
    const files = filesToProcess.slice(0, remaining)

    setUploading(true)
    const newImages: string[] = []

    for (const file of files) {
      if (file.size > 5 * 1024 * 1024) continue // Skip > 5MB

      try {
        // Try cloud upload first
        const formData = new FormData()
        formData.append('file', file)
        formData.append('folder', folder)

        const res = await fetch('/api/upload', { method: 'POST', body: formData })
        const data = await res.json()

        if (data.success && data.url) {
          // Cloud upload succeeded - use the cloud URL
          newImages.push(data.url)
        } else {
          // Cloud upload not available - fall back to base64
          const base64 = await fileToBase64(file)
          newImages.push(base64)
        }
      } catch {
        // Error - fall back to base64
        const base64 = await fileToBase64(file)
        newImages.push(base64)
      }
    }

    if (newImages.length > 0) {
      onImagesChange([...images, ...newImages])
    }
    setUploading(false)
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return
    await processFiles(Array.from(files))
    e.target.value = '' // Reset input
  }

  const removeImage = (index: number) => {
    onImagesChange(images.filter((_, i) => i !== index))
  }

  const isCloudImage = (img: string) => img.startsWith('http')

  return (
    <div className="space-y-2">
      <Label className="flex items-center gap-1.5">
        <ImageIcon className="h-4 w-4 text-gray-500" />
        {label}
        <span className="text-xs text-gray-400">
          ({images.length}/{maxImages})
        </span>
      </Label>

      {/* Drop zone */}
      <div
        className={`relative flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-200 bg-gray-50/50 px-4 py-6 transition-colors hover:border-amber-300 hover:bg-amber-50/30 ${uploading ? 'pointer-events-none' : ''}`}
        onClick={() => !uploading && fileInputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault()
          e.stopPropagation()
        }}
        onDrop={(e) => {
          e.preventDefault()
          e.stopPropagation()
          if (uploading) return
          const files = e.dataTransfer.files
          if (!files) return
          processFiles(Array.from(files))
        }}
      >
        {uploading ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
            <p className="text-sm font-medium text-amber-600">Uploading...</p>
          </div>
        ) : (
          <>
            <Upload className="mb-2 h-8 w-8 text-gray-300" />
            <p className="text-sm text-gray-500">
              Drag & drop or click to upload
            </p>
            <p className="mt-1 text-xs text-gray-400">
              Max {maxImages} images, 5MB each (jpg, png, gif, webp)
            </p>
          </>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp"
        multiple
        className="hidden"
        onChange={handleFileSelect}
        disabled={uploading}
      />

      {/* Preview thumbnails */}
      {images.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {images.map((img, index) => (
            <div key={index} className="group relative h-20 w-20 overflow-hidden rounded-lg border border-gray-200 bg-gray-100">
              <img
                src={img}
                alt={`${label} ${index + 1}`}
                className="h-full w-full object-cover"
              />
              {/* Cloud badge */}
              {isCloudImage(img) && (
                <span className="absolute bottom-0.5 left-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-gray-900">
                  <Cloud className="h-2.5 w-2.5" />
                </span>
              )}
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute right-0.5 top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-red-600"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function SellerGigs() {
  const { currentUser } = useMarketplaceStore()
  const [gigs, setGigs] = useState<Gig[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingGig, setEditingGig] = useState<Gig | null>(null)
  const [formData, setFormData] = useState<GigFormData>(emptyForm)
  const [submitting, setSubmitting] = useState(false)

  // Delete confirmation
  const [deleteTarget, setDeleteTarget] = useState<Gig | null>(null)

  // Subcategory popover
  const [subPopoverOpen, setSubPopoverOpen] = useState(false)

  // ----- Data fetching -----

  const fetchGigs = useCallback(async () => {
    if (!currentUser?.shop) {
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const params = new URLSearchParams({
        shopId: currentUser.shop.id,
        page: String(page),
        limit: '10',
      })
      if (searchQuery) params.set('search', searchQuery)

      const res = await fetch(`/api/gigs?${params}`)
      const data = await res.json()
      if (data.success) {
        const items = data.data?.gigs || []
        setGigs(items)
        setTotalPages(data.data?.pagination?.totalPages || 1)
      }
    } catch (error) {
      console.error('Failed to fetch gigs:', error)
    } finally {
      setLoading(false)
    }
  }, [currentUser, page, searchQuery])

  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch('/api/categories?type=gigs')
      const data = await res.json()
      if (data.success) {
        setCategories(data.data || [])
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error)
    }
  }, [])

  useEffect(() => {
    fetchGigs()
  }, [fetchGigs])

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  // ----- Client-side filtering (category, status) -----

  const filteredGigs = gigs.filter((gig) => {
    if (categoryFilter !== 'all' && gig.categoryId !== categoryFilter)
      return false
    if (statusFilter === 'active' && !gig.isActive) return false
    if (statusFilter === 'inactive' && gig.isActive) return false
    return true
  })

  // ----- Dialog helpers -----

  const handleOpenAdd = () => {
    setEditingGig(null)
    setFormData({
      ...emptyForm,
      packages: defaultPackages.map((p) => ({ ...p, id: generateId() })),
      faqs: [],
      subcategoryId: '',
      images: [],
      portfolio: [],
    })
    setDialogOpen(true)
  }

  const handleOpenEdit = (gig: Gig) => {
    setEditingGig(gig)
    const packages = safeJsonParse<GigPackage[]>(gig.packages, [])
    const faqs = safeJsonParse<GigFAQ[]>(gig.faqs, [])
    const tags = safeJsonParse<string[]>(gig.tags, [])

    // Find subcategory if category has a parent
    const gigCategory = gig.category
    const isSubcategory = !!(gigCategory?.parentId)
    const parentCategoryId = isSubcategory ? gigCategory!.parentId! : (gig.categoryId || '')
    const subcategoryId = isSubcategory ? (gig.categoryId || '') : ''

    const gigImages = safeJsonParse<string[]>(gig.images, [])
    const gigPortfolio = safeJsonParse<string[]>((gig as any).portfolio as string | null | undefined, [])

    setFormData({
      title: gig.title,
      description: gig.description,
      categoryId: parentCategoryId,
      subcategoryId: subcategoryId,
      requirements: gig.requirements || '',
      tags: tags.join(', '),
      isFeatured: gig.isFeatured,
      packages:
        packages.length > 0
          ? packages
          : defaultPackages.map((p) => ({ ...p, id: generateId() })),
      faqs,
      images: gigImages,
      portfolio: gigPortfolio,
    })
    setDialogOpen(true)
  }

  // ----- Package helpers -----

  const handlePackageChange = (
    index: number,
    field: keyof GigPackage,
    value: string | number | boolean,
  ) => {
    const updated = [...formData.packages]
    updated[index] = { ...updated[index], [field]: value }
    setFormData({ ...formData, packages: updated })
  }

  const handlePackageFeatureChange = (
    pkgIndex: number,
    featureIndex: number,
    value: string,
  ) => {
    const updated = [...formData.packages]
    const features = [...updated[pkgIndex].features]
    features[featureIndex] = value
    updated[pkgIndex] = { ...updated[pkgIndex], features }
    setFormData({ ...formData, packages: updated })
  }

  const addPackageFeature = (pkgIndex: number) => {
    const updated = [...formData.packages]
    updated[pkgIndex] = {
      ...updated[pkgIndex],
      features: [...updated[pkgIndex].features, ''],
    }
    setFormData({ ...formData, packages: updated })
  }

  const removePackageFeature = (pkgIndex: number, featureIndex: number) => {
    const updated = [...formData.packages]
    const features = updated[pkgIndex].features.filter(
      (_, i) => i !== featureIndex,
    )
    updated[pkgIndex] = { ...updated[pkgIndex], features }
    setFormData({ ...formData, packages: updated })
  }

  const addPackage = () => {
    const names: GigPackage['name'][] = ['Basic', 'Standard', 'Premium']
    const usedNames = formData.packages.map((p) => p.name)
    const available = names.find((n) => !usedNames.includes(n)) || 'Basic'
    setFormData({
      ...formData,
      packages: [
        ...formData.packages,
        {
          id: generateId(),
          name: available,
          description: '',
          price: 0,
          deliveryDays: 3,
          features: [''],
          isPopular: false,
        },
      ],
    })
  }

  const removePackage = (index: number) => {
    setFormData({
      ...formData,
      packages: formData.packages.filter((_, i) => i !== index),
    })
  }

  // ----- FAQ helpers -----

  const handleFaqChange = (
    index: number,
    field: keyof GigFAQ,
    value: string,
  ) => {
    const updated = [...formData.faqs]
    updated[index] = { ...updated[index], [field]: value }
    setFormData({ ...formData, faqs: updated })
  }

  const addFaq = () => {
    setFormData({
      ...formData,
      faqs: [
        ...formData.faqs,
        { id: generateId(), question: '', answer: '' },
      ],
    })
  }

  const removeFaq = (index: number) => {
    setFormData({
      ...formData,
      faqs: formData.faqs.filter((_, i) => i !== index),
    })
  }

  // ----- Submit -----

  const handleSubmit = async () => {
    if (!currentUser?.shop) return
    setSubmitting(true)
    try {
      const tags = formData.tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean)

      const cleanedPackages = formData.packages.map((p) => ({
        ...p,
        features: p.features.filter((f) => f.trim() !== ''),
        price: Number(p.price),
        deliveryDays: Number(p.deliveryDays),
      }))

      const cleanedFaqs = formData.faqs.filter(
        (f) => f.question.trim() !== '' && f.answer.trim() !== '',
      )

      const payload = {
        shopId: currentUser.shop.id,
        title: formData.title,
        description: formData.description,
        categoryId: formData.subcategoryId || formData.categoryId || undefined,
        packages: cleanedPackages,
        faqs: cleanedFaqs,
        tags,
        requirements: formData.requirements || undefined,
        isFeatured: formData.isFeatured,
        images: [...formData.images, ...formData.portfolio],
      }

      if (editingGig) {
        const res = await fetch(`/api/gigs/${editingGig.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        const data = await res.json()
        if (!data.success) {
          console.error('Update failed:', data.error)
        }
      } else {
        const res = await fetch('/api/gigs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        const data = await res.json()
        if (!data.success) {
          console.error('Create failed:', data.error)
        }
      }

      setDialogOpen(false)
      fetchGigs()
    } catch (error) {
      console.error('Failed to save gig:', error)
    } finally {
      setSubmitting(false)
    }
  }

  // ----- Actions -----

  const handleToggleActive = async (gig: Gig) => {
    try {
      const res = await fetch(`/api/gigs/${gig.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !gig.isActive }),
      })
      const data = await res.json()
      if (data.success) {
        fetchGigs()
      }
    } catch (error) {
      console.error('Failed to toggle gig:', error)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      const res = await fetch(`/api/gigs/${deleteTarget.id}`, {
        method: 'DELETE',
      })
      const data = await res.json()
      if (data.success) {
        fetchGigs()
      }
    } catch (error) {
      console.error('Failed to delete gig:', error)
    } finally {
      setDeleteTarget(null)
    }
  }

  // ----- Helpers for display -----

  const getStartingPrice = (gig: Gig): number => {
    const packages = safeJsonParse<GigPackage[]>(gig.packages, [])
    if (packages.length === 0) return 0
    return Math.min(...packages.map((p) => p.price))
  }

  const getCategoryName = (gig: Gig): string => {
    if (gig.category?.name) return gig.category.name
    const found = categories.find((c) => c.id === gig.categoryId)
    return found?.name || 'Uncategorized'
  }

  const allCategories = categories.length > 0
    ? categories
    : GIG_CATEGORIES.map((c) => ({
        id: c.slug,
        name: c.name,
        slug: c.slug,
        icon: c.icon,
        description: c.description || null,
        parentId: null,
        sortOrder: c.sortOrder,
        isActive: true,
        createdAt: new Date().toISOString(),
      }))

  // Get subcategories for selected category in form (from DB children)
  const selectedCategory = allCategories.find((c) => c.id === formData.categoryId)
  const availableSubcategories: Category[] = (selectedCategory as any)?.children || []

  // =====================================================================
  // Render
  // =====================================================================

  return (
    <div className="space-y-4">
      {/* Header & Actions */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-2">
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search gigs..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setPage(1)
              }}
              className="pl-9"
            />
          </div>
          <Select
            value={categoryFilter}
            onValueChange={(v) => {
              setCategoryFilter(v)
              setPage(1)
            }}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {allCategories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button
          className="gap-2 bg-amber-600 hover:bg-amber-700"
          onClick={handleOpenAdd}
        >
          <Plus className="h-4 w-4" />
          Add Gig
        </Button>
      </div>

      {/* Gigs Table / Cards */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <Card key={i} className="animate-pulse border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="h-12 rounded bg-gray-200" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredGigs.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 py-16"
        >
          <Briefcase className="mb-4 h-16 w-16 text-gray-300" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            No gigs yet
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Create your first gig to start offering services
          </p>
          <Button
            className="mt-4 gap-2 bg-amber-600 hover:bg-amber-700"
            onClick={handleOpenAdd}
          >
            <Plus className="h-4 w-4" />
            Create Your First Gig
          </Button>
        </motion.div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden overflow-hidden rounded-xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Gig</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Starting Price</TableHead>
                  <TableHead>Orders</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <AnimatePresence>
                  {filteredGigs.map((gig) => {
                    const images = safeJsonParse<string[]>(gig.images, [])
                    const startingPrice = getStartingPrice(gig)
                    return (
                      <motion.tr
                        key={gig.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="group border-b border-gray-50 dark:border-gray-800 transition-colors hover:bg-gray-50/50 dark:hover:bg-gray-800/50"
                      >
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                              {images[0] ? (
                                <img
                                  src={images[0]}
                                  alt={gig.title}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center">
                                  <ImageIcon className="h-4 w-4 text-gray-300" />
                                </div>
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="max-w-[200px] truncate text-sm font-medium text-gray-900 dark:text-gray-100">
                                {gig.title}
                              </p>
                              {gig.isFeatured && (
                                <Badge
                                  variant="outline"
                                  className="mt-0.5 border-amber-200 text-[10px] text-amber-600"
                                >
                                  Featured
                                </Badge>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            {getCategoryName(gig)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                            ${(startingPrice ?? 0).toFixed(2)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-gray-600">
                            {gig.totalOrders}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                            <span className="text-sm text-gray-600">
                              {(gig.averageRating ?? 0) > 0
                                ? (gig.averageRating ?? 0).toFixed(1)
                                : '-'}
                            </span>
                            {gig.totalReviews > 0 && (
                              <span className="text-xs text-gray-400">
                                ({gig.totalReviews})
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={
                              gig.isActive
                                ? 'border-amber-200 bg-amber-50 text-amber-700'
                                : 'border-gray-200 bg-gray-50 text-gray-500'
                            }
                          >
                            {gig.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleOpenEdit(gig)}
                            >
                              <Edit className="h-4 w-4 text-gray-500" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleToggleActive(gig)}
                            >
                              {gig.isActive ? (
                                <PowerOff className="h-4 w-4 text-amber-500" />
                              ) : (
                                <Power className="h-4 w-4 text-amber-500" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => setDeleteTarget(gig)}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </TableCell>
                      </motion.tr>
                    )
                  })}
                </AnimatePresence>
              </TableBody>
            </Table>
          </div>

          {/* Mobile Cards */}
          <div className="space-y-3 md:hidden">
            <AnimatePresence>
              {filteredGigs.map((gig) => {
                const images = safeJsonParse<string[]>(gig.images, [])
                const startingPrice = getStartingPrice(gig)
                return (
                  <motion.div
                    key={gig.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                  >
                    <Card className="border-0 shadow-sm">
                      <CardContent className="p-4">
                        <div className="flex gap-3">
                          <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                            {images[0] ? (
                              <img
                                src={images[0]}
                                alt={gig.title}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center">
                                <Briefcase className="h-6 w-6 text-gray-300" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold text-gray-900 dark:text-gray-100">
                              {gig.title}
                            </p>
                            <div className="mt-1 flex flex-wrap items-center gap-2">
                              <Badge
                                variant="outline"
                                className="text-[10px]"
                              >
                                {getCategoryName(gig)}
                              </Badge>
                              <Badge
                                variant="outline"
                                className={
                                  gig.isActive
                                    ? 'bg-amber-50 text-[10px] text-amber-700'
                                    : 'bg-gray-50 text-[10px] text-gray-500'
                                }
                              >
                                {gig.isActive ? 'Active' : 'Inactive'}
                              </Badge>
                            </div>
                            <div className="mt-2 flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-bold text-amber-600">
                                  ${(startingPrice ?? 0).toFixed(2)}
                                </span>
                                <div className="flex items-center gap-0.5">
                                  <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                                  <span className="text-xs text-gray-500">
                                    {(gig.averageRating ?? 0) > 0
                                      ? (gig.averageRating ?? 0).toFixed(1)
                                      : '-'}
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-center gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7"
                                  onClick={() => handleOpenEdit(gig)}
                                >
                                  <Edit className="h-3.5 w-3.5" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7"
                                  onClick={() => handleToggleActive(gig)}
                                >
                                  {gig.isActive ? (
                                    <PowerOff className="h-3.5 w-3.5 text-amber-500" />
                                  ) : (
                                    <Power className="h-3.5 w-3.5 text-amber-500" />
                                  )}
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7"
                                  onClick={() => setDeleteTarget(gig)}
                                >
                                  <Trash2 className="h-3.5 w-3.5 text-red-500" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm text-gray-600">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </>
      )}

      {/* ================================================================== */}
      {/* Add/Edit Gig Dialog                                                */}
      {/* ================================================================== */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingGig ? 'Edit Gig' : 'Add New Gig'}
            </DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* Title */}
            <div className="grid gap-2">
              <Label htmlFor="gig-title">Gig Title *</Label>
              <Input
                id="gig-title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="e.g., I will design a modern website for you"
              />
            </div>

            {/* Description */}
            <div className="grid gap-2">
              <Label htmlFor="gig-description">Description *</Label>
              <Textarea
                id="gig-description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Describe your gig in detail..."
                rows={4}
              />
            </div>

            {/* Category & Subcategory */}
            <div className="grid gap-2">
              <Label className="text-sm font-medium">Category & Subcategory *</Label>
              <p className="text-xs text-muted-foreground -mt-1">
                First select a category, then choose a subcategory to specify your niche
              </p>

              {/* Category selector */}
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <Select
                    value={formData.categoryId}
                    onValueChange={(v) =>
                      setFormData({ ...formData, categoryId: v, subcategoryId: '' })
                    }
                    onOpenChange={() => setSubPopoverOpen(false)}
                  >
                    <SelectTrigger className={!formData.categoryId ? 'text-muted-foreground' : ''}>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {allCategories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          <div className="flex items-center gap-2">
                            {cat.icon && <span className="text-base">{cat.icon}</span>}
                            <span>{cat.name}</span>
                            {cat.children && cat.children.length > 0 && (
                              <span className="text-[10px] text-muted-foreground">
                                ({cat.children.length})
                              </span>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Arrow indicator */}
                <div className={`flex-shrink-0 transition-colors duration-200 ${formData.categoryId ? 'text-amber-500' : 'text-gray-300'}`}>
                  <ChevronRight className="h-4 w-4" />
                </div>

                {/* Subcategory selector */}
                <div className="flex-1">
                  {formData.categoryId && availableSubcategories.length > 0 ? (
                    <Popover open={subPopoverOpen} onOpenChange={setSubPopoverOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={subPopoverOpen}
                          className={`w-full justify-between font-normal ${!formData.subcategoryId ? 'text-muted-foreground' : ''}`}
                        >
                          {formData.subcategoryId
                            ? availableSubcategories.find((s) => s.id === formData.subcategoryId)?.name || 'Select subcategory'
                            : 'Select subcategory'}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                        <Command>
                          <CommandInput placeholder="Search subcategory..." />
                          <CommandList className="max-h-[250px]">
                            <CommandEmpty>No subcategory found.</CommandEmpty>
                            <CommandGroup>
                              <CommandItem
                                value="none"
                                onSelect={() => {
                                  setFormData({ ...formData, subcategoryId: '' })
                                  setSubPopoverOpen(false)
                                }}
                              >
                                <Check className={`mr-2 h-4 w-4 ${!formData.subcategoryId ? 'opacity-100' : 'opacity-0'}`} />
                                <span className="text-muted-foreground italic">None (use parent category only)</span>
                              </CommandItem>
                              {availableSubcategories.map((sub) => (
                                <CommandItem
                                  key={sub.id}
                                  value={sub.name}
                                  onSelect={() => {
                                    setFormData({ ...formData, subcategoryId: sub.id })
                                    setSubPopoverOpen(false)
                                  }}
                                >
                                  <Check className={`mr-2 h-4 w-4 ${formData.subcategoryId === sub.id ? 'opacity-100' : 'opacity-0'}`} />
                                  {sub.name}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  ) : formData.categoryId && availableSubcategories.length === 0 ? (
                    <div className="flex h-9 items-center rounded-md border border-dashed border-gray-200 px-3 text-xs text-muted-foreground">
                      No subcategories for this category
                    </div>
                  ) : (
                    <div className="flex h-9 items-center rounded-md border border-dashed border-gray-200 px-3 text-xs text-muted-foreground">
                      Select a category first
                    </div>
                  )}
                </div>
              </div>

              {/* Selected category breadcrumb */}
              {formData.categoryId && (
                <div className="flex items-center gap-1.5 rounded-md bg-amber-50 px-3 py-1.5 text-xs">
                  <span className="font-medium text-amber-700">
                    {allCategories.find((c) => c.id === formData.categoryId)?.name}
                  </span>
                  {formData.subcategoryId && (
                    <>
                      <ChevronRight className="h-3 w-3 text-amber-400" />
                      <span className="font-medium text-amber-600">
                        {availableSubcategories.find((s) => s.id === formData.subcategoryId)?.name}
                      </span>
                    </>
                  )}
                  {!formData.subcategoryId && availableSubcategories.length > 0 && (
                    <span className="text-amber-500 italic">— pick a subcategory for better visibility</span>
                  )}
                </div>
              )}
            </div>

            {/* Requirements */}
            <div className="grid gap-2">
              <Label htmlFor="gig-requirements">
                Requirements{' '}
                <span className="text-xs text-gray-400">
                  (what you need from the buyer)
                </span>
              </Label>
              <Textarea
                id="gig-requirements"
                value={formData.requirements}
                onChange={(e) =>
                  setFormData({ ...formData, requirements: e.target.value })
                }
                placeholder="e.g., Brand guidelines, content, images..."
                rows={2}
              />
            </div>

            {/* Tags */}
            <div className="grid gap-2">
              <Label htmlFor="gig-tags">
                Tags{' '}
                <span className="text-xs text-gray-400">
                  (comma separated)
                </span>
              </Label>
              <Input
                id="gig-tags"
                value={formData.tags}
                onChange={(e) =>
                  setFormData({ ...formData, tags: e.target.value })
                }
                placeholder="web design, logo, branding"
              />
            </div>

            {/* Gallery Images */}
            <ImageUploader
              images={formData.images}
              onImagesChange={(images) => setFormData({ ...formData, images })}
              maxImages={5}
              label="Gallery Images"
              folder="gigs"
            />

            {/* Portfolio */}
            <ImageUploader
              images={formData.portfolio}
              onImagesChange={(portfolio) => setFormData({ ...formData, portfolio })}
              maxImages={5}
              label="Portfolio"
              folder="gigs/portfolio"
            />

            {/* ===================== Packages Section ===================== */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">
                  Packages *
                </Label>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 gap-1 text-xs"
                  onClick={addPackage}
                  disabled={formData.packages.length >= 3}
                >
                  <Plus className="h-3 w-3" />
                  Add Package
                </Button>
              </div>

              {formData.packages.map((pkg, pkgIndex) => (
                <Card key={pkg.id} className="border border-gray-100 shadow-sm">
                  <CardContent className="space-y-3 p-4">
                    {/* Package header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-100">
                          {pkg.isPopular ? (
                            <Crown className="h-3.5 w-3.5 text-amber-600" />
                          ) : (
                            <PackageIcon className="h-3.5 w-3.5 text-amber-600" />
                          )}
                        </div>
                        <Select
                          value={pkg.name}
                          onValueChange={(v) =>
                            handlePackageChange(
                              pkgIndex,
                              'name',
                              v as GigPackage['name'],
                            )
                          }
                        >
                          <SelectTrigger className="h-8 w-[130px] text-sm">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Basic">Basic</SelectItem>
                            <SelectItem value="Standard">
                              Standard
                            </SelectItem>
                            <SelectItem value="Premium">Premium</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-center gap-2">
                        <Label className="flex items-center gap-1.5 text-xs text-gray-500">
                          <Switch
                            checked={pkg.isPopular || false}
                            onCheckedChange={(checked) =>
                              handlePackageChange(
                                pkgIndex,
                                'isPopular',
                                checked,
                              )
                            }
                            className="scale-75"
                          />
                          Popular
                        </Label>
                        {formData.packages.length > 1 && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => removePackage(pkgIndex)}
                          >
                            <X className="h-3.5 w-3.5 text-red-400" />
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Package description */}
                    <Input
                      value={pkg.description}
                      onChange={(e) =>
                        handlePackageChange(
                          pkgIndex,
                          'description',
                          e.target.value,
                        )
                      }
                      placeholder="Package description"
                      className="text-sm"
                    />

                    {/* Price & Delivery */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="grid gap-1">
                        <Label className="text-xs text-gray-500">
                          Price ($)
                        </Label>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          value={pkg.price || ''}
                          onChange={(e) =>
                            handlePackageChange(
                              pkgIndex,
                              'price',
                              parseFloat(e.target.value) || 0,
                            )
                          }
                          placeholder="0.00"
                          className="text-sm"
                        />
                      </div>
                      <div className="grid gap-1">
                        <Label className="text-xs text-gray-500">
                          Delivery (days)
                        </Label>
                        <Input
                          type="number"
                          min="1"
                          value={pkg.deliveryDays || ''}
                          onChange={(e) =>
                            handlePackageChange(
                              pkgIndex,
                              'deliveryDays',
                              parseInt(e.target.value, 10) || 1,
                            )
                          }
                          placeholder="3"
                          className="text-sm"
                        />
                      </div>
                    </div>

                    {/* Features */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs text-gray-500">
                          Features
                        </Label>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 gap-1 text-xs text-amber-600 hover:text-amber-700"
                          onClick={() => addPackageFeature(pkgIndex)}
                        >
                          <Plus className="h-3 w-3" />
                          Add
                        </Button>
                      </div>
                      {pkg.features.map((feature, fIdx) => (
                        <div key={fIdx} className="flex items-center gap-1.5">
                          <Input
                            value={feature}
                            onChange={(e) =>
                              handlePackageFeatureChange(
                                pkgIndex,
                                fIdx,
                                e.target.value,
                              )
                            }
                            placeholder="Feature description"
                            className="text-sm"
                          />
                          {pkg.features.length > 1 && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 flex-shrink-0"
                              onClick={() =>
                                removePackageFeature(pkgIndex, fIdx)
                              }
                            >
                              <Minus className="h-3 w-3 text-gray-400" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* ===================== FAQs Section ========================= */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">FAQs</Label>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 gap-1 text-xs"
                  onClick={addFaq}
                >
                  <Plus className="h-3 w-3" />
                  Add FAQ
                </Button>
              </div>

              {formData.faqs.length === 0 && (
                <p className="text-xs text-gray-400">
                  No FAQs added. Click &quot;Add FAQ&quot; to add common
                  questions and answers.
                </p>
              )}

              {formData.faqs.map((faq, faqIndex) => (
                <Card key={faq.id} className="border border-gray-100 shadow-sm">
                  <CardContent className="space-y-2 p-3">
                    <div className="flex items-start gap-2">
                      <HelpCircle className="mt-2 h-4 w-4 flex-shrink-0 text-gray-400" />
                      <div className="flex-1 space-y-2">
                        <Input
                          value={faq.question}
                          onChange={(e) =>
                            handleFaqChange(
                              faqIndex,
                              'question',
                              e.target.value,
                            )
                          }
                          placeholder="Question"
                          className="text-sm"
                        />
                        <Textarea
                          value={faq.answer}
                          onChange={(e) =>
                            handleFaqChange(faqIndex, 'answer', e.target.value)
                          }
                          placeholder="Answer"
                          rows={2}
                          className="text-sm"
                        />
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="mt-1 h-7 w-7 flex-shrink-0"
                        onClick={() => removeFaq(faqIndex)}
                      >
                        <X className="h-3.5 w-3.5 text-red-400" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Featured toggle */}
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <Label className="text-sm font-medium">Featured Gig</Label>
                <p className="text-xs text-gray-500">
                  Featured gigs appear prominently in your shop
                </p>
              </div>
              <Switch
                checked={formData.isFeatured}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, isFeatured: checked })
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              className="bg-amber-600 hover:bg-amber-700"
              onClick={handleSubmit}
              disabled={
                submitting ||
                !formData.title ||
                !formData.description ||
                formData.packages.length === 0
              }
            >
              {submitting
                ? 'Saving...'
                : editingGig
                ? 'Update Gig'
                : 'Create Gig'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={() => setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Gig</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{deleteTarget?.title}
              &quot;? This will deactivate the gig.
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
